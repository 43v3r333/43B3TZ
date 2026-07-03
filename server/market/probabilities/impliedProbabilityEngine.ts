import { CanonicalMarketDTO } from "../markets/types";
import { resolveOdds } from "../odds";

export interface ImpliedProbabilityResult {
  rawProbabilities: Record<string, number>;        // outcomeId -> 1 / odds
  normalizedProbabilities: Record<string, number>; // outcomeId -> raw / sum
  probabilitySum: number;                          // sum of raw probabilities (1 + overround)
  margin: number;                                  // overround amount (sum - 1)
  marginRemovedProbabilities: Record<string, number>;
}

export class ImpliedProbabilityEngine {
  /**
   * Calculates raw, normalized, and margin-removed probabilities for a list of odds.
   */
  public static calculate(odds: { outcomeId: string; decimalOdds: number }[]): ImpliedProbabilityResult {
    const rawProbabilities: Record<string, number> = {};
    let sum = 0;

    for (const item of odds) {
      const prob = item.decimalOdds > 1 ? 1 / item.decimalOdds : 0;
      rawProbabilities[item.outcomeId] = prob;
      sum += prob;
    }

    const normalizedProbabilities: Record<string, number> = {};
    const marginRemovedProbabilities: Record<string, number> = {};

    for (const item of odds) {
      const raw = rawProbabilities[item.outcomeId];
      normalizedProbabilities[item.outcomeId] = sum > 0 ? raw / sum : 0;
      
      // Basic proportional margin removal
      marginRemovedProbabilities[item.outcomeId] = sum > 0 ? raw / sum : 0;
    }

    return {
      rawProbabilities,
      normalizedProbabilities,
      probabilitySum: sum,
      margin: Math.max(0, sum - 1),
      marginRemovedProbabilities
    };
  }

  /**
   * Compares a current market's implied probabilities against previous historical ones
   * to calculate probability deltas.
   */
  public static calculateDeltas(
    current: Record<string, number>,
    historical: Record<string, number>
  ): Record<string, number> {
    const deltas: Record<string, number> = {};
    for (const [outcomeId, currentProb] of Object.entries(current)) {
      const histProb = historical[outcomeId] ?? currentProb;
      deltas[outcomeId] = currentProb - histProb;
    }
    return deltas;
  }
}
