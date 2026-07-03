import { PredictionIntelligenceReport, RankedPrediction } from "../types";
import { intelligenceEventBus } from "../events/intelligenceEvents";

export class RankingIntelligenceEngine {
  public static rankPredictions(reports: PredictionIntelligenceReport[]): RankedPrediction[] {
    const scored = reports.map(report => {
      const confidence = report.confidence.compositeScore;
      const reliability = report.reliability.historicalAccuracy;
      const stability = report.stability.historicalConsistency;
      const agreement = report.agreement.agreementScore;
      const quality = report.quality.compositeQualityIndex;
      const historicalPerformance = report.reliability.historicalCalibration;
      
      // We want lower entropy to raise rank, so we map: (1 - normalized entropy)
      const maxEntropy = report.marketType === "match_outcome" ? Math.log2(3) : Math.log2(2);
      const predictionEntropy = report.uncertainty.predictionEntropy;
      const entropyTerm = maxEntropy > 0 ? 1.0 - (predictionEntropy / maxEntropy) : 1.0;
      
      const freshness = report.confidence.predictionFreshness;

      // Compute weighted composite intelligence rank score
      const compositeScore = (
        confidence * 0.20 +
        reliability * 0.15 +
        stability * 0.15 +
        agreement * 0.15 +
        quality * 0.15 +
        historicalPerformance * 0.10 +
        entropyTerm * 0.05 +
        freshness * 0.05
      );

      return {
        predictionId: report.predictionId,
        entityId: report.entityId,
        marketType: report.marketType,
        confidence,
        reliability,
        stability,
        agreement,
        quality,
        historicalPerformance,
        predictionEntropy,
        freshness,
        compositeScore: Math.min(1.0, Math.max(0, compositeScore)),
        rank: 0 // to be assigned below
      };
    });

    // Sort descending by composite score
    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    // Assign standard integer rank (1-based)
    const rankedPredictions: RankedPrediction[] = scored.map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));

    // Publish event for the top-ranked prediction if any exist
    if (rankedPredictions.length > 0) {
      intelligenceEventBus.publish("PredictionRanked", rankedPredictions[0].predictionId, {
        topRanked: rankedPredictions[0],
        totalRankedCount: rankedPredictions.length
      });
    }

    return rankedPredictions;
  }
}
