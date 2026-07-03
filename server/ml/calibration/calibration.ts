import { CalibrationResult, ReliabilityPoint } from "../types";

export class CalibrationEngine {
  /**
   * Clips probabilities to stay strictly within [1e-15, 1 - 1e-15] to avoid log loss infinities.
   */
  public clipProbability(p: number): number {
    return Math.max(1e-15, Math.min(1 - 1e-15, p));
  }

  /**
   * Platt Scaling mapping: Sigmoid correction using Platt parameters (alpha, beta).
   * P(y=1 | x) = 1 / (1 + exp(alpha * logit(p) + beta))
   */
  public plattScale(p: number, alpha: number, beta: number): number {
    const rawP = Math.max(1e-15, Math.min(1 - 1e-15, p));
    const logit = Math.log(rawP / (1 - rawP));
    const PlattVal = 1 / (1 + Math.exp(alpha * logit + beta));
    return this.clipProbability(PlattVal);
  }

  /**
   * Isotonic Regression mapping: Uses a series of monotonically increasing step thresholds
   * to align predicted scores with empirical frequencies.
   */
  public isotonicScale(p: number, thresholds: { x: number; y: number }[]): number {
    if (thresholds.length === 0) return p;
    
    // Sort thresholds just in case
    const sorted = [...thresholds].sort((a, b) => a.x - b.x);

    // If out of bounds
    if (p <= sorted[0].x) return sorted[0].y;
    if (p >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;

    // Linear interpolation between closest thresholds
    for (let i = 0; i < sorted.length - 1; i++) {
      if (p >= sorted[i].x && p <= sorted[i + 1].x) {
        const x1 = sorted[i].x;
        const y1 = sorted[i].y;
        const x2 = sorted[i + 1].x;
        const y2 = sorted[i + 1].y;
        if (x2 === x1) return y1;
        return y1 + ((p - x1) / (x2 - x1)) * (y2 - y1);
      }
    }
    return p;
  }

  /**
   * Computes expected calibration error (ECE), maximum calibration error (MCE),
   * Brier score, and compiles a reliability diagram.
   */
  public evaluateCalibration(
    predictions: number[],
    actuals: number[], // 1 or 0
    numBins = 5
  ): CalibrationResult {
    const bins: { predictedSum: number; actualSum: number; count: number }[] = Array.from(
      { length: numBins },
      () => ({ predictedSum: 0, actualSum: 0, count: 0 })
    );

    let totalBrier = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = this.clipProbability(predictions[i]);
      const act = actuals[i];

      // Calculate Brier Score term
      totalBrier += Math.pow(pred - act, 2);

      // Determine bin index
      let binIdx = Math.floor(pred * numBins);
      if (binIdx >= numBins) binIdx = numBins - 1;

      bins[binIdx].predictedSum += pred;
      bins[binIdx].actualSum += act;
      bins[binIdx].count++;
    }

    const brierScore = predictions.length > 0 ? totalBrier / predictions.length : 0.0;

    const reliabilityDiagram: ReliabilityPoint[] = [];
    let ece = 0;
    let mce = 0;
    const totalCount = predictions.length;

    for (let b = 0; b < numBins; b++) {
      const bin = bins[b];
      const binMidpoint = (b + 0.5) / numBins;

      if (bin.count > 0) {
        const predictedProb = bin.predictedSum / bin.count;
        const empiricalProb = bin.actualSum / bin.count;
        const absDiff = Math.abs(predictedProb - empiricalProb);

        reliabilityDiagram.push({
          binMidpoint,
          empiricalProb,
          predictedProb,
          count: bin.count
        });

        ece += (bin.count / totalCount) * absDiff;
        if (absDiff > mce) mce = absDiff;
      } else {
        reliabilityDiagram.push({
          binMidpoint,
          empiricalProb: 0.0,
          predictedProb: binMidpoint,
          count: 0
        });
      }
    }

    return {
      method: "platt_scaling",
      expectedCalibrationError: ece,
      maximumCalibrationError: mce,
      brierScore,
      reliabilityDiagram,
      parameters: { alpha: -1.0, beta: 0.0 } // Platt Scaling defaults
    };
  }

  /**
   * Optimizes probability thresholds to find the cutoff value maximizing F1 score.
   */
  public optimizeThreshold(predictions: number[], actuals: number[]): { optimalThreshold: number; bestF1: number } {
    let bestF1 = 0;
    let optimalThreshold = 0.5;

    // Grid search over potential thresholds [0.1, 0.9]
    for (let t = 0.1; t <= 0.9; t += 0.05) {
      let tp = 0, fp = 0, fn = 0;

      for (let i = 0; i < predictions.length; i++) {
        const predClass = predictions[i] >= t ? 1 : 0;
        const actClass = actuals[i];

        if (predClass === 1 && actClass === 1) tp++;
        else if (predClass === 1 && actClass === 0) fp++;
        else if (predClass === 0 && actClass === 1) fn++;
      }

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      if (f1 > bestF1) {
        bestF1 = f1;
        optimalThreshold = t;
      }
    }

    return { optimalThreshold, bestF1 };
  }
}

export const calibrationEngine = new CalibrationEngine();
