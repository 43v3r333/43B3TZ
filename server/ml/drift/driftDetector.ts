import { DriftReport, DriftMetric } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("DriftDetector");

export class DriftDetector {
  /**
   * Computes the Population Stability Index (PSI) between a baseline array and target array.
   * PSI = Sum( (Actual% - Expected%) * ln(Actual% / Expected%) )
   */
  public calculatePSI(baseline: number[], current: number[]): { psi: number; status: 'stable' | 'warning' | 'critical' } {
    if (baseline.length === 0 || current.length === 0) {
      return { psi: 0.0, status: "stable" };
    }

    // Define 5 standard buckets based on quantiles/ranges
    const numBuckets = 5;
    const minVal = Math.min(...baseline, ...current);
    const maxVal = Math.max(...baseline, ...current);
    const range = maxVal - minVal;
    const bucketWidth = range === 0 ? 1 : range / numBuckets;

    const baselineCounts = new Array(numBuckets).fill(0);
    const currentCounts = new Array(numBuckets).fill(0);

    // Count baseline elements in each bucket
    for (const v of baseline) {
      let bIdx = Math.floor((v - minVal) / bucketWidth);
      if (bIdx >= numBuckets) bIdx = numBuckets - 1;
      baselineCounts[bIdx]++;
    }

    // Count current elements in each bucket
    for (const v of current) {
      let bIdx = Math.floor((v - minVal) / bucketWidth);
      if (bIdx >= numBuckets) bIdx = numBuckets - 1;
      currentCounts[bIdx]++;
    }

    // Calculate percentages with Laplace smoothing (adding small epsilon)
    const eps = 0.0001;
    let psi = 0.0;

    for (let b = 0; b < numBuckets; b++) {
      const actualPct = (currentCounts[b] + eps) / (current.length + numBuckets * eps);
      const expectedPct = (baselineCounts[b] + eps) / (baseline.length + numBuckets * eps);

      psi += (actualPct - expectedPct) * Math.log(actualPct / expectedPct);
    }

    let status: 'stable' | 'warning' | 'critical' = "stable";
    if (psi >= 0.25) {
      status = "critical";
    } else if (psi >= 0.1) {
      status = "warning";
    }

    return { psi, status };
  }

  /**
   * Compiles a comprehensive drift report comparing training/baseline data distributions to live inference distributions.
   */
  public detectDrift(
    baselineFeatures: Record<string, number[]>,
    currentFeatures: Record<string, number[]>,
    baselineTargets: number[],
    currentTargets: number[],
    baselinePredictions: number[],
    currentPredictions: number[]
  ): DriftReport {
    const featureDrift: Record<string, DriftMetric> = {};
    const alerts: string[] = [];

    // 1. Calculate Feature Drift
    for (const featId of Object.keys(baselineFeatures)) {
      const baseVals = baselineFeatures[featId] || [];
      const curVals = currentFeatures[featId] || [];

      const { psi, status } = this.calculatePSI(baseVals, curVals);
      const baseMean = baseVals.reduce((a, b) => a + b, 0) / (baseVals.length || 1);
      const curMean = curVals.reduce((a, b) => a + b, 0) / (curVals.length || 1);

      featureDrift[featId] = {
        metricName: `PSI_${featId}`,
        driftScore: psi,
        status,
        baselineMean: baseMean,
        currentMean: curMean,
        testUsed: "PSI"
      };

      if (status === "critical") {
        alerts.push(`Critical Feature Drift detected on feature "${featId}"! PSI Score: ${psi.toFixed(4)}`);
      } else if (status === "warning") {
        alerts.push(`Warning: Moderate Feature Drift on feature "${featId}". PSI Score: ${psi.toFixed(4)}`);
      }
    }

    // 2. Target Drift
    const targetPSI = this.calculatePSI(baselineTargets, currentTargets);
    const targetMeanBase = baselineTargets.reduce((a, b) => a + b, 0) / (baselineTargets.length || 1);
    const targetMeanCur = currentTargets.reduce((a, b) => a + b, 0) / (currentTargets.length || 1);
    const targetDrift: DriftMetric = {
      metricName: "Target_Drift_PSI",
      driftScore: targetPSI.psi,
      status: targetPSI.status,
      baselineMean: targetMeanBase,
      currentMean: targetMeanCur,
      testUsed: "PSI"
    };
    if (targetPSI.status === "critical") {
      alerts.push(`Critical Target Distribution Drift! PSI: ${targetPSI.psi.toFixed(4)}`);
    }

    // 3. Prediction Drift
    const predPSI = this.calculatePSI(baselinePredictions, currentPredictions);
    const predMeanBase = baselinePredictions.reduce((a, b) => a + b, 0) / (baselinePredictions.length || 1);
    const predMeanCur = currentPredictions.reduce((a, b) => a + b, 0) / (currentPredictions.length || 1);
    const predictionDrift: DriftMetric = {
      metricName: "Prediction_Drift_PSI",
      driftScore: predPSI.psi,
      status: predPSI.status,
      baselineMean: predMeanBase,
      currentMean: predMeanCur,
      testUsed: "PSI"
    };
    if (predPSI.status === "critical") {
      alerts.push(`Critical Model Prediction Drift! PSI: ${predPSI.psi.toFixed(4)}`);
    }

    // 4. Concept Drift (Simulated by correlation tracking divergence)
    const conceptDriftScore = Math.abs(predMeanCur - targetMeanCur) - Math.abs(predMeanBase - targetMeanBase);
    const conceptDrift: DriftMetric = {
      metricName: "Concept_Drift_MAE_Shift",
      driftScore: Math.abs(conceptDriftScore),
      status: Math.abs(conceptDriftScore) > 0.15 ? "critical" : Math.abs(conceptDriftScore) > 0.05 ? "warning" : "stable",
      baselineMean: Math.abs(predMeanBase - targetMeanBase),
      currentMean: Math.abs(predMeanCur - targetMeanCur),
      testUsed: "MAE_Shift"
    };
    if (conceptDrift.status === "critical") {
      alerts.push(`Critical Concept Drift! Prediction accuracy degradation indicated. MAE Shift: ${conceptDriftScore.toFixed(4)}`);
    }

    // 5. Calibration Drift (Simulated ECE error divergence check)
    const calDriftScore = Math.abs(targetMeanCur - predMeanCur);
    const calibrationDrift: DriftMetric = {
      metricName: "Calibration_Drift_ECE",
      driftScore: calDriftScore,
      status: calDriftScore > 0.12 ? "critical" : calDriftScore > 0.05 ? "warning" : "stable",
      baselineMean: 0.02,
      currentMean: calDriftScore,
      testUsed: "Mean_Probability_Error"
    };

    logger.info("Drift detection sweep finalized.", { totalAlerts: alerts.length });

    return {
      timestamp: new Date().toISOString(),
      featureDrift,
      targetDrift,
      conceptDrift,
      predictionDrift,
      calibrationDrift,
      alerts
    };
  }
}

export const driftDetector = new DriftDetector();
