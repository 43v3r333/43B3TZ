import { IntelligenceQualityMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("IntelligenceQuality");

export class QualityEngine {
  /**
   * Assesses the qualitative strength of a computed intelligence dataset.
   */
  public calculateQuality(
    entityId: string,
    rawRecordsUsed: number,
    fieldPopulatedCount: number,
    totalFieldsExpected: number,
    lastUpdateTimestamp: string,
    stdevOfInputs = 0.0
  ): IntelligenceQualityMetrics {
    logger.info(`Running Quality Score estimation for ID ${entityId}`);

    // 1. Freshness Score
    // Half-life of 24 hours. If updated just now, 100%. After 24 hrs, decays.
    const elapsedMs = Date.now() - new Date(lastUpdateTimestamp).getTime();
    const elapsedHours = Math.max(0, elapsedMs / (1000 * 60 * 60));
    // Decay formula: 100 * (0.5 ^ (hours / 24))
    const freshness = parseFloat((100 * Math.pow(0.5, elapsedHours / 24)).toFixed(1));

    // 2. Coverage Score
    const coverage = totalFieldsExpected > 0 
      ? parseFloat(((fieldPopulatedCount / totalFieldsExpected) * 100).toFixed(1)) 
      : 100.0;

    // 3. Reliability Score
    // Reliability goes up with more data points (rawRecordsUsed)
    // Baseline is 70, increases to 95 with 5+ data contributions
    const reliability = parseFloat(
      Math.min(98, 70 + Math.min(6, rawRecordsUsed) * 4).toFixed(1)
    );

    // 4. Variance Score (Volatility)
    // High standard deviation of inputs means lower quality / high variance.
    // Normalized to 0-100 where higher is LESS volatile / safer.
    const variance = parseFloat(
      Math.max(10, Math.min(100, 100 - (stdevOfInputs * 15))).toFixed(1)
    );

    // 5. Aggregate Confidence Score
    // Weighted aggregate of all quality parameters
    const confidence = parseFloat(
      (freshness * 0.25 + coverage * 0.3 + reliability * 0.3 + variance * 0.15).toFixed(1)
    );

    const metrics: IntelligenceQualityMetrics = {
      entityId,
      freshness,
      coverage,
      reliability,
      variance,
      confidence
    };

    intelligenceStorage.setQuality(entityId, metrics);
    logger.debug(`Confidence level calculated for ${entityId}: ${confidence}/100. (Freshness: ${freshness}, Coverage: ${coverage})`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.QualityCalculated, entityId, metrics);

    return metrics;
  }
}

export const qualityEngine = new QualityEngine();
