import { ModelMetadata, PredictionMarketType, PredictionModelFamily, ModelDeploymentRole } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("PredictionModelRegistry");

class PredictionModelRegistry {
  private models: Map<string, ModelMetadata> = new Map();

  constructor() {
    this.bootstrapBaselineModels();
  }

  public getAllModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public getModelById(modelId: string): ModelMetadata | undefined {
    return this.models.get(modelId);
  }

  public getModelsByMarket(marketType: PredictionMarketType): ModelMetadata[] {
    return this.getAllModels().filter(m => m.marketType === marketType);
  }

  public getModelByRole(marketType: PredictionMarketType, role: ModelDeploymentRole): ModelMetadata | undefined {
    return this.getAllModels().find(m => m.marketType === marketType && m.role === role && m.isActive);
  }

  public registerModel(model: ModelMetadata): void {
    this.models.set(model.modelId, model);
    logger.info(`Registered model ${model.modelId} (${model.name}) for market ${model.marketType} in role ${model.role}`);
  }

  public updateModelRole(modelId: string, role: ModelDeploymentRole): ModelMetadata {
    const model = this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found in prediction registry.`);
    }

    // If setting to active role, deactivate any existing model in that role for the same market
    if (role !== "experimental" && role !== "shadow" && role !== "canary") {
      this.getAllModels()
        .filter(m => m.marketType === model.marketType && m.role === role && m.modelId !== modelId)
        .forEach(m => {
          m.isActive = false;
          logger.info(`Deactivated model ${m.modelId} as champion/fallback for market ${m.marketType}`);
        });
    }

    model.role = role;
    model.isActive = true;
    logger.info(`Updated model ${modelId} role to ${role}`);
    return model;
  }

  public updateModelHealth(modelId: string, health: "healthy" | "degraded" | "unhealthy"): ModelMetadata {
    const model = this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found.`);
    }
    model.healthStatus = health;
    logger.info(`Updated health of model ${modelId} to ${health}`);
    return model;
  }

  public rollbackModel(marketType: PredictionMarketType, role: ModelDeploymentRole, fallbackModelId: string): void {
    const currentActive = this.getModelByRole(marketType, role);
    if (currentActive) {
      currentActive.isActive = false;
      logger.warn(`Deactivated current ${role} model ${currentActive.modelId} for rollback.`);
    }

    const backup = this.getModelById(fallbackModelId);
    if (!backup) {
      throw new Error(`Fallback model ${fallbackModelId} not found.`);
    }

    backup.role = role;
    backup.isActive = true;
    logger.info(`Successfully rolled back to model ${fallbackModelId} as active ${role} for ${marketType}.`);
  }

  public clearAll(): void {
    this.models.clear();
    this.bootstrapBaselineModels();
  }

  private bootstrapBaselineModels(): void {
    const markets: PredictionMarketType[] = [
      "match_outcome",
      "over_under_2_5",
      "over_under_3_5",
      "over_under_4_5",
      "both_teams_to_score",
      "correct_score",
      "double_chance",
      "draw_no_bet",
      "asian_handicap",
      "corners",
      "cards",
      "team_goals",
      "player_markets"
    ];

    const families: Record<PredictionMarketType, PredictionModelFamily> = {
      match_outcome: "lightgbm",
      over_under_2_5: "xgboost",
      over_under_3_5: "random_forest",
      over_under_4_5: "catboost",
      both_teams_to_score: "logistic_regression",
      correct_score: "neural_network",
      double_chance: "lightgbm",
      draw_no_bet: "xgboost",
      asian_handicap: "logistic_regression",
      corners: "random_forest",
      cards: "catboost",
      team_goals: "lightgbm",
      player_markets: "neural_network"
    };

    markets.forEach((market, idx) => {
      const family = families[market];
      
      // Seed Champion Model
      const champId = `mod_champ_${market}_${family}_v1`;
      this.registerModel({
        modelId: champId,
        name: `Champion ${market.replace(/_/g, " ").toUpperCase()}`,
        marketType: market,
        family: family,
        version: "1.0.0",
        datasetId: "ds_default_temporal_v1",
        featuresUsed: ["feat_elo_rating", "feat_form_momentum", "feat_xg_differential", "feat_clv_movement"],
        hyperparameters: { learningRate: 0.05, maxDepth: 6, nEstimators: 150 },
        role: "champion",
        isActive: true,
        brierScore: 0.12 - (idx * 0.005),
        logLoss: 0.42 - (idx * 0.01),
        accuracy: 0.68 + (idx * 0.01),
        f1Score: 0.66 + (idx * 0.01),
        expectedCalibrationError: 0.02 + (idx * 0.002),
        driftScore: 0.01,
        dataFreshnessDays: 0.2,
        healthStatus: "healthy",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Seed Fallback Model
      const fallbackId = `mod_fallback_${market}_logistic_v1`;
      this.registerModel({
        modelId: fallbackId,
        name: `Fallback Baseline ${market.replace(/_/g, " ").toUpperCase()}`,
        marketType: market,
        family: "logistic_regression",
        version: "1.0.0",
        datasetId: "ds_default_temporal_v1",
        featuresUsed: ["feat_elo_rating", "feat_form_momentum"],
        hyperparameters: { C: 1.0, maxIter: 100 },
        role: "fallback",
        isActive: true,
        brierScore: 0.16,
        logLoss: 0.52,
        accuracy: 0.62,
        f1Score: 0.59,
        expectedCalibrationError: 0.04,
        driftScore: 0.005,
        dataFreshnessDays: 0.2,
        healthStatus: "healthy",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Seed Challenger/Shadow Model for experimental testing
      const shadowId = `mod_shadow_${market}_catboost_v1`;
      this.registerModel({
        modelId: shadowId,
        name: `Shadow Candidate ${market.replace(/_/g, " ").toUpperCase()}`,
        marketType: market,
        family: "catboost",
        version: "1.0.1",
        datasetId: "ds_default_temporal_v1",
        featuresUsed: ["feat_elo_rating", "feat_form_momentum", "feat_xg_differential", "feat_clv_movement", "feat_bench_strength"],
        hyperparameters: { iterations: 200, depth: 5 },
        role: "shadow",
        isActive: true,
        brierScore: 0.11 - (idx * 0.004),
        logLoss: 0.40 - (idx * 0.009),
        accuracy: 0.69 + (idx * 0.008),
        f1Score: 0.68 + (idx * 0.008),
        expectedCalibrationError: 0.015,
        driftScore: 0.02,
        dataFreshnessDays: 0.2,
        healthStatus: "healthy",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      });
    });
  }
}

export const predictionModelRegistry = new PredictionModelRegistry();
