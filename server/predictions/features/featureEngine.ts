import { createLogger } from "../../core/logger";
import { featurePipeline } from "../../features/FeaturePipeline";

const logger = createLogger("FeatureEngineering:LegacyShim");

export interface FeatureMetadata {
  id: string;
  name: string;
  category: "sporting" | "market" | "contextual";
  description: string;
  importanceScore: number;
}

export interface EngineeredFeatureSet {
  features: Record<string, any>;
  metadata: Record<string, FeatureMetadata>;
}

export class FeatureEngine {
  /**
   * Generates a fully engineered feature snapshot by delegating to the new Feature Store Pipeline.
   */
  public generateFeatures(rawTelemetry: Record<string, any>): EngineeredFeatureSet {
    logger.info(`Starting feature engineering process for match: ${rawTelemetry.matchId || "unknown"}`);
    
    // Delegate to the new high-assurance Enterprise Feature Pipeline!
    const result = featurePipeline.extractFeatures(rawTelemetry);

    // Filter features based on importance threshold >= 0.4 to keep backwards compatibility
    const activeFeatures: Record<string, any> = {};
    const activeMetadata: Record<string, FeatureMetadata> = {};

    for (const key of Object.keys(result.features)) {
      const meta = result.metadata[key];
      if (meta && meta.importanceScore >= 0.4) {
        activeFeatures[key] = result.features[key];
        activeMetadata[key] = {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          description: meta.description,
          importanceScore: meta.importanceScore,
        };
      }
    }

    logger.info(`Engineered ${Object.keys(activeFeatures).length} active features with score threshold check.`);
    return {
      features: activeFeatures,
      metadata: activeMetadata,
    };
  }
}

export const featureEngine = new FeatureEngine();
