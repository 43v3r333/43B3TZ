import { createLogger } from "../../core/logger";

const logger = createLogger("CalibrationLab");

export interface CalibrationMetrics {
  brierScore: number;
  ece: number; // Expected Calibration Error
  maxCalibrationError: number;
}

export interface CalibrationResult {
  algorithm: string;
  calibratedProbabilities: number[];
  metrics: CalibrationMetrics;
}

/**
 * Calibration Lab containing Platt Scaling and Isotonic Regression (PAVA) algorithms.
 */
export class CalibrationLab {
  
  /**
   * Platt Scaling (Logistic Calibration):
   * Fits a logistic function: P(y=1|f) = 1 / (1 + exp(A * f + B))
   * Solved iteratively via maximum likelihood estimation using gradient descent.
   */
  public static plattScaling(
    uncalibratedProbs: number[],
    actuals: number[] // 0 or 1
  ): CalibrationResult {
    let A = -2.5; 
    let B = 0.8;
    
    // Batch gradient descent to fit parameters A and B
    const epochs = 100;
    const lr = 0.1;
    for (let e = 0; e < epochs; e++) {
      let gradA = 0;
      let gradB = 0;
      for (let i = 0; i < uncalibratedProbs.length; i++) {
        const x = uncalibratedProbs[i];
        const y = actuals[i];
        const logit = A * x + B;
        const p = 1.0 / (1.0 + Math.exp(logit));
        const diff = p - y;
        gradA += diff * x;
        gradB += diff;
      }
      A -= lr * (gradA / uncalibratedProbs.length);
      B -= lr * (gradB / uncalibratedProbs.length);
    }

    const calibrated = uncalibratedProbs.map(x => {
      const logit = A * x + B;
      return 1.0 / (1.0 + Math.exp(logit));
    });

    const metrics = this.calculateMetrics(calibrated, actuals);

    logger.info("Successfully fitted Platt Scaling calibration", {
      originalBrier: this.calculateMetrics(uncalibratedProbs, actuals).brierScore,
      calibratedBrier: metrics.brierScore,
      calibratedEce: metrics.ece
    });

    return {
      algorithm: "Platt Scaling",
      calibratedProbabilities: calibrated,
      metrics
    };
  }

  /**
   * Isotonic Regression (Pool Adjacent Violators Algorithm - PAVA):
   * Fits a non-decreasing, step-wise isotonic function.
   */
  public static isotonicRegression(
    uncalibratedProbs: number[],
    actuals: number[] // 0 or 1
  ): CalibrationResult {
    const n = uncalibratedProbs.length;
    if (n === 0) {
      return {
        algorithm: "Isotonic Regression",
        calibratedProbabilities: [],
        metrics: { brierScore: 0, ece: 0, maxCalibrationError: 0 }
      };
    }

    // Sort indices by prediction value descending
    const indices = Array.from({ length: n }, (_, i) => i);
    indices.sort((a, b) => uncalibratedProbs[a] - uncalibratedProbs[b]);

    // Setup blocks/pools for PAVA
    interface Block {
      startIdx: number;
      endIdx: number;
      sumY: number;
      count: number;
    }

    const blocks: Block[] = [];
    for (let i = 0; i < n; i++) {
      const originalIdx = indices[i];
      blocks.push({
        startIdx: i,
        endIdx: i,
        sumY: actuals[originalIdx],
        count: 1
      });
    }

    // PAVA algorithm step: merge adjacent violators (where block[i].mean > block[i+1].mean)
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < blocks.length - 1; i++) {
        const meanCurrent = blocks[i].sumY / blocks[i].count;
        const meanNext = blocks[i + 1].sumY / blocks[i + 1].count;

        if (meanCurrent > meanNext) {
          // Merge blocks[i] and blocks[i+1]
          blocks[i].endIdx = blocks[i + 1].endIdx;
          blocks[i].sumY += blocks[i + 1].sumY;
          blocks[i].count += blocks[i + 1].count;
          blocks.splice(i + 1, 1);
          merged = true;
          break; // restart validation sweep
        }
      }
    }

    // Map calibrated values back to original uncalibrated indices
    const calibrated = new Array(n).fill(0);
    for (const b of blocks) {
      const value = b.sumY / b.count;
      for (let i = b.startIdx; i <= b.endIdx; i++) {
        const originalIdx = indices[i];
        calibrated[originalIdx] = value;
      }
    }

    const metrics = this.calculateMetrics(calibrated, actuals);

    logger.info("Successfully fitted Isotonic Regression (PAVA) calibration", {
      originalBrier: this.calculateMetrics(uncalibratedProbs, actuals).brierScore,
      calibratedBrier: metrics.brierScore,
      calibratedEce: metrics.ece
    });

    return {
      algorithm: "Isotonic Regression",
      calibratedProbabilities: calibrated,
      metrics
    };
  }

  /**
   * Helper to calculate Expected Calibration Error (ECE) and Brier Score
   */
  public static calculateMetrics(probs: number[], actuals: number[]): CalibrationMetrics {
    const n = probs.length;
    let brierSum = 0;
    
    // ECE Calculation using 10 bins
    const binCount = 10;
    const bins: Array<{ count: number; probSum: number; actualSum: number }> = Array.from(
      { length: binCount },
      () => ({ count: 0, probSum: 0, actualSum: 0 })
    );

    for (let i = 0; i < n; i++) {
      const p = probs[i];
      const y = actuals[i];
      
      // Brier Score component
      brierSum += Math.pow(p - y, 2);

      // ECE component
      let binIdx = Math.floor(p * binCount);
      if (binIdx >= binCount) binIdx = binCount - 1;
      if (binIdx < 0) binIdx = 0;

      bins[binIdx].count++;
      bins[binIdx].probSum += p;
      bins[binIdx].actualSum += y;
    }

    const brierScore = brierSum / n;

    let ece = 0;
    let maxCalibrationError = 0;

    for (const bin of bins) {
      if (bin.count > 0) {
        const avgProb = bin.probSum / bin.count;
        const avgActual = bin.actualSum / bin.count;
        const diff = Math.abs(avgProb - avgActual);
        ece += (bin.count / n) * diff;
        if (diff > maxCalibrationError) {
          maxCalibrationError = diff;
        }
      }
    }

    return {
      brierScore,
      ece,
      maxCalibrationError
    };
  }
}
