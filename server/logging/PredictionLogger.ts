import { createLogger } from "./Logger";
import { metricsCollector } from "./Metrics";

const logger = createLogger("PredictionEngine", "PredictionLogger");

export type PredictionStage =
  | "DataCollection"
  | "Validation"
  | "Cleaning"
  | "FeatureEngineering"
  | "ModelSelection"
  | "Inference"
  | "ConfidenceCalibration"
  | "RiskAnalysis"
  | "KellyOptimization"
  | "Recommendation"
  | "Response";

export class PredictionLogger {
  /**
   * Logs the initiation of a prediction stage.
   */
  public static logStageStart(
    predictionId: string,
    stage: PredictionStage,
    metadata?: Record<string, any>
  ): void {
    logger.debug(`Prediction pipeline stage [${stage}] starting...`, {
      predictionId,
      operation: `PredictionStage_${stage}_Start`,
      ...metadata,
    });
  }

  /**
   * Logs completion of a prediction stage.
   */
  public static logStageEnd(
    predictionId: string,
    stage: PredictionStage,
    durationMs: number,
    success: boolean,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (success) {
      logger.info(`Prediction pipeline stage [${stage}] completed successfully.`, {
        predictionId,
        operation: `PredictionStage_${stage}_End`,
        duration: durationMs,
        ...metadata,
      });
    } else {
      logger.error(`Prediction pipeline stage [${stage}] failed!`, {
        predictionId,
        operation: `PredictionStage_${stage}_Failed`,
        duration: durationMs,
        errorMessage: error?.message,
        errorStack: error?.stack,
        ...metadata,
      });
    }

    // Trigger metrics collection on terminal stage
    if (stage === "Response") {
      metricsCollector.incrementPredictions(success);
    }
  }
}
