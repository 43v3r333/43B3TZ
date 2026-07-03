import { featureStore } from "./feature-store/featureStore";
import { trainingPipeline } from "./training/trainingPipeline";
import { modelRegistry } from "./registry/modelRegistry";
import { createLogger } from "../core/logger";

const logger = createLogger("MLPlatformBootstrap");

export async function bootstrapMLPlatform() {
  logger.info("Initializing Enterprise MLOps Platform...");

  try {
    // 1. Clear state on bootstrap to ensure clean point-in-time state
    featureStore.clearAll();

    // 2. Load and parse Sports Intelligence snapshots into the feature store
    featureStore.populateFromIntelligence();

    // 3. Pre-train baseline models if registry is empty
    const existingModels = modelRegistry.getAllModels();
    if (existingModels.length === 0) {
      logger.info("Model Registry is empty. Training default baseline candidate models for each family...");

      const coreFeatures = ["feat_elo_rating", "feat_form_momentum", "feat_xg_differential", "feat_clv_movement"];

      // Train Logistic Regression
      const lr = trainingPipeline.runTraining("Baseline_Logistic_Regression", "logistic_regression", coreFeatures);
      modelRegistry.updateApprovalStatus(lr.modelId, "approved", "Fitted successfully. Baseline coefficients acceptable.");
      modelRegistry.promoteToChampion(lr.modelId, "SYSTEM_AUTO_BOOTSTRAP");

      // Train LightGBM
      const lgbm = trainingPipeline.runTraining("Baseline_LightGBM", "lightgbm", coreFeatures);
      modelRegistry.updateApprovalStatus(lgbm.modelId, "approved", "Ensemble boosted tree model compiled.");

      // Train XGBoost
      trainingPipeline.runTraining("Baseline_XGBoost", "xgboost", coreFeatures);

      // Train CatBoost
      trainingPipeline.runTraining("Baseline_CatBoost", "catboost", coreFeatures);

      // Train Random Forest
      trainingPipeline.runTraining("Baseline_Random_Forest", "random_forest", coreFeatures);

      logger.info(`Bootstrap baseline models trained. Active models in registry: ${modelRegistry.getAllModels().length}`);
    } else {
      logger.info(`ML Registry online with ${existingModels.length} pre-registered models.`);
    }

    logger.info("Enterprise MLOps Platform successfully synchronized and online.");
  } catch (err: any) {
    logger.error("Failed to bootstrap Enterprise MLOps Platform", { error: err.message });
  }
}

export * from "./types";
export * from "./feature-store/featureStore";
export * from "./dataset-builder/datasetBuilder";
export * from "./calibration/calibration";
export * from "./evaluation/evaluation";
export * from "./registry/modelRegistry";
export * from "./experiments/experimentTracker";
export * from "./drift/driftDetector";
export * from "./explainability/explainability";
export * from "./training/trainingPipeline";
