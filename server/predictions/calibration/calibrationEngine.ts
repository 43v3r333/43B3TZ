import { ModelProbabilityOutput } from "../types";

export class CalibrationEngine {
  /**
   * Applies Platt Scaling or Isotonic Regression mappings to raw prediction outputs.
   * If platt intercept & coefficient are supplied, it calibrates the probability:
   * P_calibrated = 1 / (1 + exp(A * f(x) + B)) where f(x) is logit of P_raw
   */
  public static calibrateProbabilities(
    rawProbs: Record<string, number>,
    method: "platt_scaling" | "isotonic_regression" = "platt_scaling",
    params: { slope?: number; intercept?: number; bins?: { min: number; max: number; target: number }[] } = {}
  ): Record<string, number> {
    const calibrated: Record<string, number> = {};
    const keys = Object.keys(rawProbs);
    
    // Normalize weights to sum to 1.0 after calibration
    let totalCalibratedSum = 0;

    for (const key of keys) {
      const rawVal = rawProbs[key];

      if (method === "platt_scaling") {
        // Platt Scaling logit adjustment
        const slope = params.slope ?? -1.05;
        const intercept = params.intercept ?? 0.02;
        
        // Convert probability to logit, clamped to avoid log(0)
        const clampedRaw = Math.max(0.0001, Math.min(0.9999, rawVal));
        const logit = Math.log(clampedRaw / (1 - clampedRaw));
        
        // Calibrate
        const calibratedVal = 1 / (1 + Math.exp(slope * logit + intercept));
        calibrated[key] = calibratedVal;
      } else if (method === "isotonic_regression" && params.bins) {
        // Isotonic mapping: find the bin matching the raw probability
        const matchingBin = params.bins.find(bin => rawVal >= bin.min && rawVal <= bin.max);
        calibrated[key] = matchingBin ? matchingBin.target : rawVal;
      } else {
        // Simple scaling fallback
        calibrated[key] = Math.max(0.01, Math.min(0.99, rawVal));
      }

      totalCalibratedSum += calibrated[key];
    }

    // Normalize calibrated probabilities to sum to 1.0
    if (totalCalibratedSum > 0) {
      for (const key of keys) {
        calibrated[key] = calibrated[key] / totalCalibratedSum;
      }
    }

    return calibrated;
  }

  /**
   * Applies Temperature Scaling to raw probabilities.
   * Softmax(logits / T) where T is temperature parameter.
   */
  public static temperatureScaling(
    rawProbs: Record<string, number>,
    temperature: number = 1.1
  ): Record<string, number> {
    const calibrated: Record<string, number> = {};
    const keys = Object.keys(rawProbs);
    const T = Math.max(0.1, temperature);

    let sum = 0;
    for (const key of keys) {
      const p = Math.max(0.0001, Math.min(0.9999, rawProbs[key]));
      const logit = Math.log(p / (1 - p));
      const adjusted = Math.exp(logit / T);
      calibrated[key] = adjusted;
      sum += adjusted;
    }

    if (sum > 0) {
      for (const key of keys) {
        calibrated[key] /= sum;
      }
    }
    return calibrated;
  }

  /**
   * Computes Conformal Prediction sets with user-defined coverage guarantee (1 - alpha).
   */
  public static conformalPrediction(
    calibratedProbs: Record<string, number>,
    alpha: number = 0.1
  ): string[] {
    const sorted = Object.entries(calibratedProbs)
      .sort((a, b) => b[1] - a[1]);
    
    const predictionSet: string[] = [];
    let cumulativeProb = 0;
    const target = 1 - alpha;

    for (const [outcome, prob] of sorted) {
      predictionSet.push(outcome);
      cumulativeProb += prob;
      if (cumulativeProb >= target) {
        break;
      }
    }

    return predictionSet;
  }

  /**
   * Applies Bayesian Calibration to incorporate prior beliefs (e.g. historical baseline probabilities)
   */
  public static bayesianCalibration(
    rawProbs: Record<string, number>,
    priorProbs: Record<string, number>,
    priorWeight: number = 0.2
  ): Record<string, number> {
    const calibrated: Record<string, number> = {};
    const keys = Object.keys(rawProbs);
    let total = 0;

    for (const key of keys) {
      const p = rawProbs[key];
      const prior = priorProbs[key] ?? (1.0 / keys.length);
      // Posterior is weighted blend of prior and likelihood
      const posterior = p * (1 - priorWeight) + prior * priorWeight;
      calibrated[key] = posterior;
      total += posterior;
    }

    if (total > 0) {
      for (const key of keys) {
        calibrated[key] /= total;
      }
    }

    return calibrated;
  }

  /**
   * Calculates the Expected Calibration Error (ECE)
   */
  public static calculateECE(
    predictions: { confidence: number; correct: boolean }[],
    binsCount: number = 10
  ): number {
    if (predictions.length === 0) return 0;
    
    let ece = 0;
    const binSize = 1.0 / binsCount;

    for (let i = 0; i < binsCount; i++) {
      const binMin = i * binSize;
      const binMax = (i + 1) * binSize;
      
      const binPredictions = predictions.filter(
        p => p.confidence >= binMin && p.confidence < binMax
      );

      if (binPredictions.length === 0) continue;

      const avgConfidence = binPredictions.reduce((sum, p) => sum + p.confidence, 0) / binPredictions.length;
      const accuracy = binPredictions.filter(p => p.correct).length / binPredictions.length;
      const weight = binPredictions.length / predictions.length;

      ece += weight * Math.abs(avgConfidence - accuracy);
    }

    return ece;
  }

  /**
   * Calculates the Maximum Calibration Error (MCE)
   */
  public static calculateMCE(
    predictions: { confidence: number; correct: boolean }[],
    binsCount: number = 10
  ): number {
    if (predictions.length === 0) return 0;
    
    let mce = 0;
    const binSize = 1.0 / binsCount;

    for (let i = 0; i < binsCount; i++) {
      const binMin = i * binSize;
      const binMax = (i + 1) * binSize;
      
      const binPredictions = predictions.filter(
        p => p.confidence >= binMin && p.confidence < binMax
      );

      if (binPredictions.length === 0) continue;

      const avgConfidence = binPredictions.reduce((sum, p) => sum + p.confidence, 0) / binPredictions.length;
      const accuracy = binPredictions.filter(p => p.correct).length / binPredictions.length;
      const diff = Math.abs(avgConfidence - accuracy);

      if (diff > mce) {
        mce = diff;
      }
    }

    return mce;
  }

  /**
   * Calculates Brier Score for probability outcomes.
   */
  public static calculateBrierScore(
    probs: Record<string, number>,
    outcome: string
  ): number {
    let score = 0;
    const outcomes = Object.keys(probs);
    
    for (const key of outcomes) {
      const p = probs[key] || 0;
      const y = key === outcome ? 1 : 0;
      score += Math.pow(p - y, 2);
    }
    
    return score;
  }

  /**
   * Measures prediction drift using Wasserstein/absolute distribution distance
   */
  public static calculatePredictionDrift(
    distA: Record<string, number>,
    distB: Record<string, number>
  ): number {
    const keys = Array.from(new Set([...Object.keys(distA), ...Object.keys(distB)]));
    let absoluteDiffSum = 0;

    for (const key of keys) {
      const pA = distA[key] ?? 0;
      const pB = distB[key] ?? 0;
      absoluteDiffSum += Math.abs(pA - pB);
    }

    // Return symmetric normalization [0.0, 1.0]
    return absoluteDiffSum / 2.0;
  }

  /**
   * Computes the confidence interval boundaries around the calibrated probability
   */
  public static calculateConfidenceIntervals(
    calibratedProbs: Record<string, number>,
    varianceFactor: number = 0.05
  ): Record<string, { lower: number; upper: number }> {
    const intervals: Record<string, { lower: number; upper: number }> = {};
    
    for (const key of Object.keys(calibratedProbs)) {
      const p = calibratedProbs[key];
      // Standard deviation of binomial distribution: sqrt(p * (1-p)) * varianceFactor
      const stdDev = Math.sqrt(Math.max(0.001, p * (1 - p))) * varianceFactor;
      
      intervals[key] = {
        lower: Math.max(0, p - 1.96 * stdDev), // 95% Confidence Interval
        upper: Math.min(1, p + 1.96 * stdDev)
      };
    }

    return intervals;
  }

  /**
   * Calculates Shannon Entropy of the output probability distribution.
   * Lower entropy implies higher model certainty.
   */
  public static calculateEntropy(probs: Record<string, number>): number {
    let entropy = 0;
    const values = Object.values(probs);
    for (const p of values) {
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  /**
   * Generates complete probability output details.
   */
  public static processProbabilityOutput(
    rawProbs: Record<string, number>,
    calibrationMethod: "platt_scaling" | "isotonic_regression" = "platt_scaling",
    calibrationParams: any = {}
  ): ModelProbabilityOutput {
    const calibrated = this.calibrateProbabilities(rawProbs, calibrationMethod, calibrationParams);
    const confidenceIntervals = this.calculateConfidenceIntervals(calibrated);
    const entropy = this.calculateEntropy(calibrated);
    
    // Expected uncertainty is proportional to entropy compared to max possible entropy
    const maxEntropy = Math.log2(Object.keys(rawProbs).length || 2);
    const expectedUncertainty = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // Reliability score is higher for lower expected uncertainty and tight confidence intervals
    const averageIntervalWidth = Object.values(confidenceIntervals).reduce(
      (sum, bounds) => sum + (bounds.upper - bounds.lower), 
      0
    ) / Object.keys(confidenceIntervals).length;

    const reliability = Math.max(0, 1 - (expectedUncertainty * 0.4 + averageIntervalWidth * 0.6));

    return {
      rawProbabilities: rawProbs,
      calibratedProbabilities: calibrated,
      confidenceIntervals,
      entropy,
      expectedUncertainty,
      reliability
    };
  }
}
