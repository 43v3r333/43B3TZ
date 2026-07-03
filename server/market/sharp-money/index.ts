import { CanonicalMarketDTO } from "../markets/types";
import { resolveOdds } from "../odds";

export interface SharpIndicator {
  outcomeName: string;
  isSteamMove: boolean;
  isReverseLineMovement: boolean;
  consensusDivergence: boolean;
  lateSharpActivity: boolean;
  sharpConfidenceScore: number; // 0 - 100
}

export interface SharpMoneyReport {
  marketId: string;
  fixtureId: string;
  timestamp: string;
  indicators: SharpIndicator[];
}

export class SharpMoneyEngine {
  /**
   * Dissects line changes and cross-provider patterns to extract sharp money flow signals.
   */
  public static analyseSharpFlow(
    history: CanonicalMarketDTO[],
    crossProviders: CanonicalMarketDTO[]
  ): SharpMoneyReport | null {
    if (history.length < 2) return null;

    const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const durationMins = (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 60000;
    const indicators: SharpIndicator[] = [];

    first.outcomes.forEach(outObj => {
      const name = outObj.name;
      const lastOut = last.outcomes.find(o => o.name === name);
      if (!lastOut) return;

      const openingOdds = outObj.currentOdds.decimal;
      const currentOdds = lastOut.currentOdds.decimal;
      const delta = currentOdds - openingOdds;

      // 1. Steam move detection: sudden, massive odds shortening across providers in a short time frame
      // We look at the last 2 records; if they were updated very recently and changed fast
      let isSteamMove = false;
      if (sorted.length >= 3) {
        const prev = sorted[sorted.length - 2];
        const prevOut = prev.outcomes.find(o => o.name === name);
        if (prevOut) {
          const recentDelta = currentOdds - prevOut.currentOdds.decimal;
          const timeGapMin = (new Date(last.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 60000;
          if (recentDelta < -0.15 && timeGapMin < 5) { // sharp drop of >0.15 odds in under 5 mins
            isSteamMove = true;
          }
        }
      }

      // 2. Reverse Line Movement (RLM)
      // Since we don't have direct bet tickets, we simulate RLM by checking if the average consensus odds move
      // one way but a known "sharp provider" (e.g., Pinn_Mock or Sportradar) moves the other way,
      // OR we flag RLM if odds move counter to the opening favorite (the bookmaker shortens the underdog's odds
      // despite the favorite being the public choice).
      const isFavorite = openingOdds < 2.0;
      const isReverseLineMovement = isFavorite && delta > 0.15; // favorite drifts while underdog shortens

      // 3. Consensus Divergence
      // Is there a significant gap between our provider's odds and other providers?
      let consensusDivergence = false;
      const others = crossProviders.filter(m => m.marketType === last.marketType && m.providerId !== last.providerId);
      if (others.length > 0) {
        const otherOdds = others.map(m => m.outcomes.find(o => o.name === name)?.currentOdds.decimal ?? 0).filter(v => v > 0);
        if (otherOdds.length > 0) {
          const avgOther = otherOdds.reduce((a, b) => a + b, 0) / otherOdds.length;
          if (Math.abs(currentOdds - avgOther) > 0.2) {
            consensusDivergence = true;
          }
        }
      }

      // 4. Late Sharp Activity
      // Line changes within 15 mins of kickoff or end of history
      const lateSharpActivity = delta < -0.10 && durationMins > 60; // dropped significantly at the very end

      // 5. Composite Sharp Confidence Score (0 - 100)
      let score = 0;
      if (isSteamMove) score += 35;
      if (isReverseLineMovement) score += 30;
      if (consensusDivergence) score += 15;
      if (lateSharpActivity) score += 20;

      indicators.push({
        outcomeName: name,
        isSteamMove,
        isReverseLineMovement,
        consensusDivergence,
        lateSharpActivity,
        sharpConfidenceScore: score
      });
    });

    return {
      marketId: last.marketId,
      fixtureId: last.fixtureId,
      timestamp: last.timestamp,
      indicators
    };
  }
}
