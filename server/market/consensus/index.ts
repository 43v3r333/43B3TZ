import { CanonicalMarketDTO } from "../markets/types";
import { ImpliedProbabilityEngine } from "../probabilities/impliedProbabilityEngine";
import { resolveOdds, OddsValue } from "../odds";

export interface ConsensusOutcome {
  name: string;
  averageOdds: OddsValue;
  medianOdds: OddsValue;
  weightedOdds: OddsValue;
  consensusProbability: number; // margin removed consensus probability
}

export interface MarketConsensusReport {
  fixtureId: string;
  marketType: "match_outcome" | "over_under_2_5" | "both_teams_to_score" | "asian_handicap";
  timestamp: string;
  activeProvidersCount: number;
  outcomes: ConsensusOutcome[];
  marketConfidence: number;      // 0.0 - 1.0 (higher means less provider divergence)
  agreementScore: number;        // 0.0 - 1.0
  providerConfidence: Record<string, number>;
}

export class ConsensusEngine {
  /**
   * Computes market consensus across multiple provider feeds for a given fixture & market.
   */
  public static computeConsensus(
    fixtureId: string,
    marketType: CanonicalMarketDTO["marketType"],
    markets: CanonicalMarketDTO[],
    providerWeights: Record<string, number> = {}
  ): MarketConsensusReport | null {
    // Filter matching markets
    const relevant = markets.filter(m => m.fixtureId === fixtureId && m.marketType === marketType && m.status === "open");
    if (relevant.length === 0) return null;

    // Get outcomes names (e.g., ["Home", "Draw", "Away"])
    const outcomeNames = Array.from(new Set(relevant.flatMap(m => m.outcomes.map(o => o.name))));
    
    const outcomes: ConsensusOutcome[] = [];
    const providerConfidence: Record<string, number> = {};

    // Build lists of odds per outcome
    const oddsByOutcome: Record<string, number[]> = {};
    outcomeNames.forEach(name => { oddsByOutcome[name] = []; });

    relevant.forEach(market => {
      const pId = market.providerId;
      providerConfidence[pId] = providerWeights[pId] ?? 0.8; // default
      market.outcomes.forEach(out => {
        if (oddsByOutcome[out.name]) {
          oddsByOutcome[out.name].push(out.currentOdds.decimal);
        }
      });
    });

    const totalWeight = relevant.reduce((sum, m) => sum + (providerWeights[m.providerId] ?? 0.8), 0);

    outcomeNames.forEach(name => {
      const oddsList = oddsByOutcome[name];
      if (oddsList.length === 0) return;

      // 1. Average Odds
      const avgOdds = oddsList.reduce((a, b) => a + b, 0) / oddsList.length;

      // 2. Median Odds
      const sorted = [...oddsList].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const medianOdds = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

      // 3. Weighted Odds
      let weightedSum = 0;
      let usedWeight = 0;
      relevant.forEach(m => {
        const outObj = m.outcomes.find(o => o.name === name);
        if (outObj) {
          const w = providerWeights[m.providerId] ?? 0.8;
          weightedSum += outObj.currentOdds.decimal * w;
          usedWeight += w;
        }
      });
      const weightedOdds = usedWeight > 0 ? weightedSum / usedWeight : avgOdds;

      outcomes.push({
        name,
        averageOdds: resolveOdds(avgOdds),
        medianOdds: resolveOdds(medianOdds),
        weightedOdds: resolveOdds(weightedOdds),
        consensusProbability: 0 // Will compute below with margin removal
      });
    });

    // Compute consensus probabilities by running implied probability engine with margin removal on weighted consensus odds
    const consensusOddsInput = outcomes.map(o => ({
      outcomeId: o.name,
      decimalOdds: o.weightedOdds.decimal
    }));
    const probRes = ImpliedProbabilityEngine.calculate(consensusOddsInput);

    outcomes.forEach(o => {
      o.consensusProbability = probRes.marginRemovedProbabilities[o.name] ?? 0;
    });

    // Compute Agreement Score & Market Confidence based on variance/deviation of odds
    // Higher variance -> lower confidence/agreement
    let totalVar = 0;
    let counts = 0;
    outcomeNames.forEach(name => {
      const list = oddsByOutcome[name];
      if (list.length > 1) {
        const avg = list.reduce((a, b) => a + b, 0) / list.length;
        const v = list.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / list.length;
        totalVar += v;
        counts++;
      }
    });

    const averageVariance = counts > 0 ? totalVar / counts : 0;
    // Normalize agreement score: standard deviation scale
    const agreementScore = Math.max(0.1, Math.min(1.0, 1 - Math.sqrt(averageVariance) / 2.0));
    const marketConfidence = agreementScore * Math.min(1.0, relevant.length / 3.0); // confidence scales with number of providers up to 3

    return {
      fixtureId,
      marketType,
      timestamp: new Date().toISOString(),
      activeProvidersCount: relevant.length,
      outcomes,
      marketConfidence,
      agreementScore,
      providerConfidence
    };
  }
}
