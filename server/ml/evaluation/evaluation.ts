import { EvaluationMetrics } from "../types";
import { calibrationEngine } from "../calibration/calibration";

export class EvaluationEngine {
  /**
   * Evaluates predictions against ground truth targets, outputting a complete EvaluationMetrics profile.
   */
  public evaluate(
    predictions: number[], // probability scores in [0, 1]
    actuals: number[],     // binary labels 1 or 0
    featureImportance: Record<string, number>,
    trainingDurationMs: number,
    inferenceLatencyMs = 1.2
  ): EvaluationMetrics {
    const n = predictions.length;
    if (n === 0) {
      return this.getEmptyMetrics(featureImportance, trainingDurationMs);
    }

    // Apply probability threshold of 0.5 to get binary predictions
    let tp = 0, fp = 0, fn = 0, tn = 0;
    let logLossSum = 0;
    let brierSum = 0;

    for (let i = 0; i < n; i++) {
      const pred = calibrationEngine.clipProbability(predictions[i]);
      const act = actuals[i];

      const predClass = pred >= 0.5 ? 1 : 0;

      if (predClass === 1 && act === 1) tp++;
      else if (predClass === 1 && act === 0) fp++;
      else if (predClass === 0 && act === 1) fn++;
      else tn++;

      logLossSum += act * Math.log(pred) + (1 - act) * Math.log(1 - pred);
      brierSum += Math.pow(pred - act, 2);
    }

    const accuracy = (tp + tn) / n;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const logLoss = -logLossSum / n;
    const brierScore = brierSum / n;

    // Calibration Error (ECE)
    const calResult = calibrationEngine.evaluateCalibration(predictions, actuals);
    const calibrationError = calResult.expectedCalibrationError;

    // ROC AUC calculation
    const rocAuc = this.calculateRocAuc(predictions, actuals);

    // PR AUC calculation
    const prAuc = this.calculatePrAuc(predictions, actuals);

    // --- FINANCIAL BACKTEST & PROFIT SIMULATION ---
    // Simulate betting 1 unit on every prediction where model confidence p >= 0.65.
    // Odds are assumed to be 1 / (true_probability - small_margin) ~ average of 1.95 odds.
    const standardOdds = 1.95;
    let totalProfit = 0;
    let maxDrawdown = 0;
    let peakBalance = 0;
    let currentBalance = 0;
    const balanceTimeline: number[] = [0];
    const confidenceReliabilityList: number[] = [];

    let activeBetsCount = 0;

    for (let i = 0; i < n; i++) {
      const p = predictions[i];
      const y = actuals[i];

      // Measure prediction stability / confidence reliability
      // Distance between prediction and outcome
      confidenceReliabilityList.push(1.0 - Math.abs(p - y));

      if (p >= 0.65) {
        activeBetsCount++;
        if (y === 1) {
          // Win bet
          const winAmount = standardOdds - 1;
          currentBalance += winAmount;
          totalProfit += winAmount;
        } else {
          // Lose bet
          currentBalance -= 1.0;
          totalProfit -= 1.0;
        }
        balanceTimeline.push(currentBalance);

        if (currentBalance > peakBalance) {
          peakBalance = currentBalance;
        }
        const drawdown = peakBalance - currentBalance;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    // Expected Value: average of p * odds - (1 - p)
    let expectedValueSum = 0;
    for (const p of predictions) {
      expectedValueSum += p * standardOdds - (1 - p);
    }
    const expectedValue = n > 0 ? expectedValueSum / n : 0.0;

    // Sharpe Ratio calculation over cumulative returns timeline
    const sharpeRatio = this.calculateSharpeRatio(balanceTimeline);

    // Confidence Reliability index
    const confidenceReliability = n > 0 
      ? confidenceReliabilityList.reduce((a, b) => a + b, 0) / n 
      : 1.0;

    // Prediction stability metrics (simple variance check)
    const meanPred = predictions.reduce((a, b) => a + b, 0) / n;
    const variancePred = predictions.reduce((a, b) => a + Math.pow(b - meanPred, 2), 0) / n;
    const predictionStability = 1.0 - Math.sqrt(variancePred); // Lower variance = higher stability

    return {
      accuracy,
      precision,
      recall,
      f1,
      rocAuc,
      prAuc,
      logLoss,
      brierScore,
      calibrationError,
      expectedValue,
      profitSimulation: totalProfit,
      sharpeRatio,
      maxDrawdown,
      predictionStability,
      confidenceReliability,
      featureImportance,
      inferenceLatencyMs,
      trainingDurationMs
    };
  }

  private calculateRocAuc(predictions: number[], actuals: number[]): number {
    const zipped = predictions.map((p, i) => ({ p, y: actuals[i] }));
    // Sort ascending
    zipped.sort((a, b) => a.p - b.p);

    const posCount = zipped.filter(item => item.y === 1).length;
    const negCount = zipped.length - posCount;

    if (posCount === 0 || negCount === 0) return 0.5;

    let rankSum = 0;
    for (let i = 0; i < zipped.length; i++) {
      if (zipped[i].y === 1) {
        rankSum += (i + 1); // ranks are 1-based
      }
    }

    const auc = (rankSum - (posCount * (posCount + 1)) / 2) / (posCount * negCount);
    return isNaN(auc) ? 0.5 : auc;
  }

  private calculatePrAuc(predictions: number[], actuals: number[]): number {
    const zipped = predictions.map((p, i) => ({ p, y: actuals[i] }));
    // Sort descending
    zipped.sort((a, b) => b.p - a.p);

    let tp = 0;
    let fp = 0;
    let ap = 0;
    const posCount = zipped.filter(item => item.y === 1).length;

    if (posCount === 0) return 0.0;

    for (let i = 0; i < zipped.length; i++) {
      if (zipped[i].y === 1) {
        tp++;
        const precisionAtI = tp / (tp + fp);
        ap += precisionAtI;
      } else {
        fp++;
      }
    }

    return ap / posCount;
  }

  private calculateSharpeRatio(timeline: number[]): number {
    if (timeline.length < 3) return 0.0;
    
    // Calculate rolling step returns
    const returns: number[] = [];
    for (let i = 1; i < timeline.length; i++) {
      returns.push(timeline[i] - timeline[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0.0;
    
    // Return simple scaled Sharpe index
    return (mean / stdDev) * Math.sqrt(252);
  }

  private getEmptyMetrics(featureImportance: Record<string, number>, duration: number): EvaluationMetrics {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      rocAuc: 0.5,
      prAuc: 0.0,
      logLoss: 0.693,
      brierScore: 0.25,
      calibrationError: 0.0,
      expectedValue: 0.0,
      profitSimulation: 0.0,
      sharpeRatio: 0.0,
      maxDrawdown: 0.0,
      predictionStability: 1.0,
      confidenceReliability: 1.0,
      featureImportance,
      inferenceLatencyMs: 0.0,
      trainingDurationMs: duration
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
