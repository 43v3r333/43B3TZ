import { featureRegistry } from "./FeatureRegistry";
import { featureCache } from "./FeatureCache";
import { FeatureValidator } from "./FeatureValidator";
import { FeatureMetadata, FeatureValueSnapshot } from "./FeatureMetadata";
import { createLogger } from "../core/logger";

const logger = createLogger("FeaturePipeline");

export interface FeaturePipelineResult {
  features: Record<string, any>;
  metadata: Record<string, any>;
  pipelineDurationMs: number;
  invalidFeaturesCount: number;
}

export class FeaturePipeline {
  /**
   * Runs end-to-end feature extraction, validation, and caching for a match.
   */
  public extractFeatures(rawTelemetry: Record<string, any>, options?: { bypassCache?: boolean; matchId?: string }): FeaturePipelineResult {
    const startTime = Date.now();
    const matchId = options?.matchId || rawTelemetry.matchId || `match_${Date.now()}`;
    const activeFeatures: Record<string, any> = {};
    const metadataMap: Record<string, any> = {};
    let invalidCount = 0;

    logger.info(`Initiating Enterprise Feature Pipeline for match ${matchId}`);

    const registeredFeatures = featureRegistry.getAll();

    for (const feature of registeredFeatures) {
      const fId = feature.id;

      // 1. Cache Check
      if (!options?.bypassCache) {
        const cached = featureCache.getFeature(matchId, fId);
        if (cached) {
          activeFeatures[fId] = cached.value;
          metadataMap[fId] = {
            id: feature.id,
            name: feature.name,
            category: feature.category,
            description: feature.description,
            importanceScore: feature.importance,
            confidence: cached.confidence,
            quality: cached.quality,
            freshness: cached.freshness,
          };
          continue;
        }
      }

      // 2. Feature Calculation
      try {
        const value = feature.calculation(rawTelemetry);

        // 3. Output Validation
        const isValid = feature.validation(value) && FeatureValidator.validate(fId, value);
        if (!isValid) {
          invalidCount++;
          logger.warn(`Feature ${fId} failed validation checks. Skipping from active set.`);
          continue;
        }

        // 4. Update Cache
        const snapshot: FeatureValueSnapshot = {
          value,
          confidence: feature.confidence,
          quality: feature.quality,
          freshness: feature.freshness,
          calculatedAt: new Date(),
        };
        featureCache.setFeature(matchId, fId, snapshot);

        // 5. Populate Result Maps
        activeFeatures[fId] = value;
        metadataMap[fId] = {
          id: feature.id,
          name: feature.name,
          category: feature.category,
          description: feature.description,
          importanceScore: feature.importance,
          confidence: feature.confidence,
          quality: feature.quality,
          freshness: feature.freshness,
        };
      } catch (err: any) {
        logger.error(`Error calculating feature ${fId}: ${err.message}`);
        invalidCount++;
      }
    }

    const duration = Date.now() - startTime;
    logger.info(`Completed Feature Pipeline in ${duration}ms. Active: ${Object.keys(activeFeatures).length}, Invalidated: ${invalidCount}`);

    return {
      features: activeFeatures,
      metadata: metadataMap,
      pipelineDurationMs: duration,
      invalidFeaturesCount: invalidCount,
    };
  }
}

export const featurePipeline = new FeaturePipeline();
