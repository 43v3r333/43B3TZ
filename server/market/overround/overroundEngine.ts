/**
 * Overround Engine
 * Implements multiple methods of margin calculation and margin removal:
 * - Multiplicative (Proportional)
 * - Additive (Equal Distribution)
 * - Shin's Model (Insider Trading Information Asymmetry)
 * - Power Model (Exponential)
 * - Logarithmic (Entropy-weighted)
 */

export interface OverroundMethodResult {
  methodName: string;
  probabilities: Record<string, number>;
  confidence: number;
  mathematicalAssumptions: string[];
}

export interface OverroundCalculationResponse {
  rawSum: number;
  overround: number;
  methods: Record<string, OverroundMethodResult>;
}

export class OverroundEngine {
  /**
   * Run all overround estimation & margin removal methods.
   */
  public static calculate(outcomes: { id: string; odds: number }[]): OverroundCalculationResponse {
    const rawSum = outcomes.reduce((acc, o) => acc + (o.odds > 0 ? 1 / o.odds : 0), 0);
    const overround = Math.max(0, rawSum - 1);

    const methods: Record<string, OverroundMethodResult> = {
      multiplicative: this.calculateMultiplicative(outcomes, rawSum),
      additive: this.calculateAdditive(outcomes, rawSum),
      shin: this.calculateShin(outcomes, rawSum),
      power: this.calculatePower(outcomes, rawSum),
      logarithmic: this.calculateLogarithmic(outcomes, rawSum),
    };

    return {
      rawSum,
      overround,
      methods,
    };
  }

  /**
   * 1. Multiplicative (Proportional) Method
   * Assumption: Overround is loaded proportionally across all options based on their implied probability.
   */
  private static calculateMultiplicative(
    outcomes: { id: string; odds: number }[],
    rawSum: number
  ): OverroundMethodResult {
    const probabilities: Record<string, number> = {};
    for (const o of outcomes) {
      const raw = o.odds > 0 ? 1 / o.odds : 0;
      probabilities[o.id] = rawSum > 0 ? raw / rawSum : 0;
    }

    return {
      methodName: "Multiplicative (Proportional)",
      probabilities,
      confidence: 0.90,
      mathematicalAssumptions: [
        "Margin is proportional to the implied probability of each outcome.",
        "Simple, robust, highly accurate for low-to-mid overround markets.",
        "Does not adjust for favorite-longshot bias."
      ]
    };
  }

  /**
   * 2. Additive (Equal Distribution) Method
   * Assumption: Overround is added equally to each outcome.
   */
  private static calculateAdditive(
    outcomes: { id: string; odds: number }[],
    rawSum: number
  ): OverroundMethodResult {
    const probabilities: Record<string, number> = {};
    const n = outcomes.length;
    const excess = rawSum - 1;

    for (const o of outcomes) {
      const raw = o.odds > 0 ? 1 / o.odds : 0;
      probabilities[o.id] = Math.max(0.001, raw - (excess / n));
    }

    // Re-normalize to ensure sum is exactly 1
    const finalSum = Object.values(probabilities).reduce((a, b) => a + b, 0);
    for (const id of Object.keys(probabilities)) {
      probabilities[id] = finalSum > 0 ? probabilities[id] / finalSum : 1 / n;
    }

    return {
      methodName: "Additive (Equal Distribution)",
      probabilities,
      confidence: 0.65,
      mathematicalAssumptions: [
        "Margin is distributed uniformly as an absolute constant added to each outcome probability.",
        "Often over-adjusts low probability outcomes (longshots), leading to negative values.",
        "Works decently in high-symmetry markets."
      ]
    };
  }

  /**
   * 3. Shin's Information Asymmetry Method
   * Assumption: A fraction 'z' of money is wagered by informed traders (insiders).
   * Shin solves for z and estimates the true underlying probabilities.
   */
  private static calculateShin(
    outcomes: { id: string; odds: number }[],
    rawSum: number
  ): OverroundMethodResult {
    const probabilities: Record<string, number> = {};
    const n = outcomes.length;
    
    if (rawSum <= 1.0) {
      // No margin, fall back to multiplicative
      return this.calculateMultiplicative(outcomes, rawSum);
    }

    // Solve for informational asymmetry coefficient 'z' using an iterative bisection solver
    let z = 0;
    let low = 0;
    let high = 1;
    const tolerance = 1e-6;

    const calcSumProbForZ = (valZ: number) => {
      let sum = 0;
      for (const o of outcomes) {
        const r = o.odds > 0 ? 1 / o.odds : 0;
        // Shin's formulation for outcome prob given raw probability r and insider ratio valZ
        const term1 = Math.sqrt(valZ * valZ + 4 * (1 - valZ) * (r * r / rawSum));
        const p = (term1 - valZ) / (2 * (1 - valZ));
        sum += p;
      }
      return sum;
    };

    // Iterate
    for (let iter = 0; iter < 100; iter++) {
      z = (low + high) / 2;
      const sum = calcSumProbForZ(z);
      if (Math.abs(sum - 1) < tolerance) {
        break;
      }
      if (sum > 1) {
        low = z;
      } else {
        high = z;
      }
    }

    // Solve probabilities using resolved z
    let totalComputedProb = 0;
    for (const o of outcomes) {
      const r = o.odds > 0 ? 1 / o.odds : 0;
      const term1 = Math.sqrt(z * z + 4 * (1 - z) * (r * r / rawSum));
      const p = Math.max(0.001, (term1 - z) / (2 * (1 - z)));
      probabilities[o.id] = p;
      totalComputedProb += p;
    }

    // Re-normalize to avoid rounding discrepancies
    for (const id of Object.keys(probabilities)) {
      probabilities[id] = totalComputedProb > 0 ? probabilities[id] / totalComputedProb : 1 / n;
    }

    return {
      methodName: "Shin's Information Asymmetry",
      probabilities,
      confidence: 0.95,
      mathematicalAssumptions: [
        "A constant ratio 'z' of betting volume is driven by informed 'insiders'.",
        "Implicitly addresses Favorite-Longshot bias by trimming more heavily on longshots.",
        "Highly regarded as the most mathematically elegant and accurate betting model."
      ]
    };
  }

  /**
   * 4. Power Method
   * Assumption: pi = p_i ^ k. Solve for exponent k.
   */
  private static calculatePower(
    outcomes: { id: string; odds: number }[],
    rawSum: number
  ): OverroundMethodResult {
    const probabilities: Record<string, number> = {};
    const n = outcomes.length;

    if (rawSum <= 1.0) {
      return this.calculateMultiplicative(outcomes, rawSum);
    }

    // We search for k such that sum of (1 / odds) ^ k = 1
    let k = 1.0;
    let low = 0.5;
    let high = 5.0;
    const tolerance = 1e-6;

    for (let iter = 0; iter < 100; iter++) {
      k = (low + high) / 2;
      const sum = outcomes.reduce((acc, o) => {
        const raw = o.odds > 0 ? 1 / o.odds : 0;
        return acc + Math.pow(raw, k);
      }, 0);

      if (Math.abs(sum - 1) < tolerance) {
        break;
      }
      if (sum < 1) {
        high = k; // increase sum by decreasing k (since raw probs are <= 1)
      } else {
        low = k;
      }
    }

    let finalSum = 0;
    for (const o of outcomes) {
      const raw = o.odds > 0 ? 1 / o.odds : 0;
      probabilities[o.id] = Math.pow(raw, k);
      finalSum += probabilities[o.id];
    }

    // Ensure strict sum to 1
    for (const id of Object.keys(probabilities)) {
      probabilities[id] = finalSum > 0 ? probabilities[id] / finalSum : 1 / n;
    }

    return {
      methodName: "Power Model (Exponential)",
      probabilities,
      confidence: 0.85,
      mathematicalAssumptions: [
        "Assumes bookmakers apply margin exponentially, raising true probabilities to a power 'k'.",
        "Helps compensate for favorite-longshot bias dynamically.",
        "Solver convergence is highly reliable across all scales."
      ]
    };
  }

  /**
   * 5. Logarithmic Method
   * Assumption: Adjusted in log-odds.
   */
  private static calculateLogarithmic(
    outcomes: { id: string; odds: number }[],
    rawSum: number
  ): OverroundMethodResult {
    const probabilities: Record<string, number> = {};
    const n = outcomes.length;

    // Use exponential odds ratio adjustor (analogous to logistic odds models)
    let sum = 0;
    const logOdds: Record<string, number> = {};
    for (const o of outcomes) {
      const raw = o.odds > 0 ? 1 / o.odds : 0;
      const p = Math.max(0.001, raw);
      logOdds[o.id] = Math.log(p / (1 - p));
    }

    // Trim log odds slightly by a dynamic offset
    const excess = rawSum - 1;
    const offset = excess / n;

    let computedSum = 0;
    for (const o of outcomes) {
      const adjustedLog = logOdds[o.id] - offset;
      const trueProb = 1 / (1 + Math.exp(-adjustedLog));
      probabilities[o.id] = trueProb;
      computedSum += trueProb;
    }

    // Final normalization
    for (const id of Object.keys(probabilities)) {
      probabilities[id] = computedSum > 0 ? probabilities[id] / computedSum : 1 / n;
    }

    return {
      methodName: "Logarithmic (Entropy-weighted)",
      probabilities,
      confidence: 0.80,
      mathematicalAssumptions: [
        "Probability values undergo shifts within log-odds space.",
        "Acts similar to information-entropy equalization systems.",
        "Excellent at retaining ordinal stability of choices."
      ]
    };
  }
}
