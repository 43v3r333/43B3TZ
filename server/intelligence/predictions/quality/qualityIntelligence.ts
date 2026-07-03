import { PredictionFactoryResponse } from "../../../predictions/types";
import { QualityIntelligence } from "../types";
import { predictionModelRegistry } from "../../../predictions/registry/modelRegistry";
import { intelligenceEventBus } from "../events/intelligenceEvents";

export class QualityIntelligenceEngine {
  public static calculateQuality(
    prediction: PredictionFactoryResponse,
    agreementScore: number,
    reliabilityScore: number
  ): QualityIntelligence {
    const selectedChampionId = prediction.orchestrationSummary.selectedChampionId;
    const model = predictionModelRegistry.getAllModels().find(m => m.modelId === selectedChampionId);

    // 1. Input Completeness
    const totalFeats = model?.featuresUsed?.length ?? 5;
    const suppliedFeats = Object.keys(prediction.featuresSnapshot ?? {}).length;
    const inputCompleteness = totalFeats > 0 ? Math.min(1.0, suppliedFeats / totalFeats) : 1.0;

    // 2. Feature Freshness
    const freshnessDays = model?.dataFreshnessDays ?? 1;
    const featureFreshness = Math.max(0, 1.0 - freshnessDays / 15);

    // 3. Provider Quality (average quality of historical ETL feeds)
    const providerQuality = 0.94; // high SLA baseline

    // 4. Model Health
    let modelHealth = 1.0;
    if (model?.healthStatus === "degraded") {
      modelHealth = 0.6;
    } else if (model?.healthStatus === "unhealthy") {
      modelHealth = 0.2;
    }

    // 5. Calibration Quality
    const ece = model?.expectedCalibrationError ?? 0.04;
    const calibrationQuality = Math.max(0, 1.0 - ece * 5);

    // 6. Prediction Consistency (mapped to model agreement)
    const predictionConsistency = agreementScore;

    // 7. Historical Performance (mapped to model reliability)
    const historicalPerformance = reliabilityScore;

    // 8. Composite Quality Index
    const compositeQualityIndex = (
      inputCompleteness * 0.15 +
      featureFreshness * 0.15 +
      providerQuality * 0.10 +
      modelHealth * 0.15 +
      calibrationQuality * 0.15 +
      predictionConsistency * 0.15 +
      historicalPerformance * 0.15
    );

    const qualityReport: QualityIntelligence = {
      inputCompleteness,
      featureFreshness,
      providerQuality,
      modelHealth,
      calibrationQuality,
      predictionConsistency,
      historicalPerformance,
      compositeQualityIndex: Math.min(1.0, Math.max(0, compositeQualityIndex))
    };

    // Publish event
    intelligenceEventBus.publish("QualityCalculated", prediction.predictionId, {
      qualityReport
    });

    return qualityReport;
  }
}
