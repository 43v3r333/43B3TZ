import { PredictionFactoryResponse } from "../../../predictions/types";
import { ConfidenceIntelligence } from "../types";
import { predictionHistoryStore } from "../../../predictions/history/predictionHistory";
import { predictionModelRegistry } from "../../../predictions/registry/modelRegistry";
import { intelligenceEventBus } from "../events/intelligenceEvents";

export class ConfidenceIntelligenceEngine {
  public static calculateConfidence(prediction: PredictionFactoryResponse): ConfidenceIntelligence {
    const marketType = prediction.marketType;
    const selectedChampionId = prediction.orchestrationSummary.selectedChampionId;
    const model = predictionModelRegistry.getAllModels().find(m => m.modelId === selectedChampionId);

    // 1. Overall raw prediction confidence
    const overallConfidence = prediction.finalConfidence?.predictionConfidence ?? 0.75;

    // 2. Calibration confidence (derived from model's Expected Calibration Error)
    const ece = model?.expectedCalibrationError ?? 0.05;
    const calibrationConfidence = Math.max(0, 1 - ece * 5); // scales ECE to [0, 1]

    // 3. Feature completeness confidence
    const totalFeats = model?.featuresUsed?.length ?? 5;
    const suppliedFeats = Object.keys(prediction.featuresSnapshot ?? {}).length;
    const featureConfidence = totalFeats > 0 ? Math.min(1.0, suppliedFeats / totalFeats) : 1.0;

    // 4. Model quality confidence
    const accuracy = model?.accuracy ?? 0.68;
    const f1Score = model?.f1Score ?? 0.65;
    const modelConfidence = (accuracy + f1Score) / 2;

    // 5. Historical confidence
    const records = predictionHistoryStore.getAllRecords().filter(r => r.marketType === marketType && r.actualResult !== undefined);
    let historicalConfidence = 0.70;
    if (records.length > 0) {
      const correctCount = records.filter(r => r.accuracyResult === 1).length;
      historicalConfidence = correctCount / records.length;
    }

    // 6. Prediction freshness
    const predictionFreshness = 1.0; // brand new at generation

    // 7. Data freshness
    const freshnessDays = model?.dataFreshnessDays ?? 0;
    const dataFreshness = Math.max(0, 1 - (freshnessDays / 30));

    // 8. Pipeline health
    let pipelineHealth = 1.0;
    if (model?.healthStatus === "degraded") {
      pipelineHealth = 0.6;
    } else if (model?.healthStatus === "unhealthy") {
      pipelineHealth = 0.25;
    }

    // 9. Confidence trend (comparing with previous predictions of same market)
    const recentRecords = predictionHistoryStore.getAllRecords()
      .filter(r => r.marketType === marketType)
      .slice(-5);
    let confidenceTrend: "improving" | "stable" | "declining" = "stable";
    if (recentRecords.length >= 3) {
      const firstScore = recentRecords[0].finalConfidence?.compositeScore ?? 0.75;
      const lastScore = recentRecords[recentRecords.length - 1].finalConfidence?.compositeScore ?? 0.75;
      if (lastScore - firstScore > 0.03) {
        confidenceTrend = "improving";
      } else if (firstScore - lastScore > 0.03) {
        confidenceTrend = "declining";
      }
    }

    // 10. Composite Score
    const compositeScore = (
      overallConfidence * 0.20 +
      calibrationConfidence * 0.15 +
      featureConfidence * 0.15 +
      modelConfidence * 0.15 +
      historicalConfidence * 0.15 +
      dataFreshness * 0.10 +
      pipelineHealth * 0.10
    );

    const confidenceReport: ConfidenceIntelligence = {
      overallConfidence,
      calibrationConfidence,
      featureConfidence,
      modelConfidence,
      historicalConfidence,
      predictionFreshness,
      dataFreshness,
      pipelineHealth,
      confidenceTrend,
      compositeScore: Math.min(1.0, Math.max(0, compositeScore))
    };

    // Publish event
    intelligenceEventBus.publish("ConfidenceCalculated", prediction.predictionId, {
      confidenceReport
    });

    return confidenceReport;
  }
}
