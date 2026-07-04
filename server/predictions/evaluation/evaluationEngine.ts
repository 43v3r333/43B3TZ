/**
 * Core performance metrics for sports predictions.
 */
export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  logLoss: number;
  brierScore: number;
  rocAuc: number;
  expectedCalibrationError: number;
  expectedValue: number;
  roi: number;
  yieldRate: number;
  closingLineValue: number;
  predictionDrift: number;
}
