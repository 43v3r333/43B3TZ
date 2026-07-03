import { CanonicalMarketDTO } from "../markets/types";

export interface ClosingLineComparison {
  outcomeName: string;
  openingOdds: number;
  closingOdds: number;
  clvDelta: number;               // opening - closing (positive means you beat the closing line by buying early)
  clvPercent: number;             // percentage change
  beaten: boolean;
}

export interface ClosingLineReport {
  marketId: string;
  fixtureId: string;
  marketType: string;
  providerId: string;
  comparisons: ClosingLineComparison[];
  marketEfficiencyScore: number;  // 0-1 (higher means closing lines align closely with opening, stable)
  expectedMovement: Record<string, number>;
}

export class ClosingLineEngine {
  /**
   * Evaluates the opening vs closing values to evaluate the market efficiency.
   */
  public static evaluateClosingLine(history: CanonicalMarketDTO[]): ClosingLineReport | null {
    if (history.length < 2) return null;

    // Sort chronologically
    const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const comparisons: ClosingLineComparison[] = [];
    const expectedMovement: Record<string, number> = {};

    first.outcomes.forEach(openOut => {
      const closeOut = last.outcomes.find(o => o.name === openOut.name);
      if (closeOut) {
        const opening = openOut.currentOdds.decimal;
        const closing = closeOut.currentOdds.decimal;
        const clvDelta = opening - closing;
        const clvPercent = opening > 0 ? (clvDelta / opening) * 100 : 0;

        comparisons.push({
          outcomeName: openOut.name,
          openingOdds: opening,
          closingOdds: closing,
          clvDelta,
          clvPercent,
          beaten: clvDelta > 0.05 // beating the line means odds shortened before kick off
        });

        // Simple expected movement estimation (extrapolation)
        expectedMovement[openOut.name] = clvDelta * 0.1;
      }
    });

    // Market efficiency: we measure the average absolute percentage drift from opening to closing line.
    // If the drift is low, the market was highly efficient early on (prices did not fluctuate wildly).
    const averageDrift = comparisons.reduce((sum, comp) => sum + Math.abs(comp.clvPercent), 0) / (comparisons.length || 1);
    const marketEfficiencyScore = Math.max(0.1, Math.min(1.0, 1 - (averageDrift / 30.0))); // scaled where 30% drift represents poor efficiency

    return {
      marketId: last.marketId,
      fixtureId: last.fixtureId,
      marketType: last.marketType,
      providerId: last.providerId,
      comparisons,
      marketEfficiencyScore,
      expectedMovement
    };
  }
}
