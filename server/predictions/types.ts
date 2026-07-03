export type PredictionMarketType =
  | "match_outcome"
  | "over_under_2_5"
  | "over_under_3_5"
  | "over_under_4_5"
  | "both_teams_to_score"
  | "correct_score"
  | "double_chance"
  | "draw_no_bet"
  | "asian_handicap"
  | "corners"
  | "cards"
  | "team_goals"
  | "player_markets";

export type PredictionModelFamily =
  | "logistic_regression"
  | "lightgbm"
  | "xgboost"
  | "catboost"
  | "random_forest"
  | "neural_network";

export type ModelDeploymentRole =
  | "champion"
  | "fallback"
  | "experimental"
  | "shadow"
  | "canary"
  | "challenger";

export interface ModelMetadata {
  modelId: string;
  name: string;
  marketType: PredictionMarketType;
  family: PredictionModelFamily;
  version: string;
  datasetId: string;
  featuresUsed: string[];
  hyperparameters: Record<string, any>;
  role: ModelDeploymentRole;
  isActive: boolean;
  brierScore: number;
  logLoss: number;
  accuracy: number;
  f1Score: number;
  expectedCalibrationError: number;
  driftScore: number;
  dataFreshnessDays: number;
  healthStatus: "healthy" | "degraded" | "unhealthy";
  createdAt: string;
}

export interface PredictionFeaturesSnapshot {
  entityId: string;
  timestamp: string;
  features: Record<string, any>;
}

export interface ModelProbabilityOutput {
  rawProbabilities: Record<string, number>; // e.g. { "Home": 0.52, "Draw": 0.24, "Away": 0.24 }
  calibratedProbabilities: Record<string, number>;
  confidenceIntervals: Record<string, { lower: number; upper: number }>;
  entropy: number;
  expectedUncertainty: number;
  reliability: number;
}

export interface ModelConfidenceMetrics {
  predictionConfidence: number; // [0, 1]
  calibrationConfidence: number; // [0, 1]
  featureConfidence: number; // [0, 1]
  dataFreshnessScore: number; // [0, 1]
  marketConfidence: number; // [0, 1]
  agreementScore: number; // [0, 1]
  modelConsensus: number; // [0, 1]
  historicalReliability: number; // [0, 1]
  compositeScore: number; // [0, 1]
}

export interface SingleModelInferenceResponse {
  modelId: string;
  version: string;
  role: ModelDeploymentRole;
  probabilityOutput: ModelProbabilityOutput;
  confidence: ModelConfidenceMetrics;
  featuresSnapshot: Record<string, any>;
  inferenceLatencyMs: number;
}

export interface EnsembleMethodology {
  type: "weighted_voting" | "stacking" | "blending" | "model_averaging" | "meta_models";
  weights: Record<string, number>; // modelId -> weight
  context: {
    leagueId?: string;
    competitionId?: string;
    dataQualityScore: number;
  };
}

export interface PredictionFactoryRequest {
  marketType: PredictionMarketType;
  entityId: string; // e.g. "fixture-102"
  leagueId?: string;
  competitionId?: string;
  featuresOverride?: Record<string, any>;
}

export interface PredictionFactoryResponse {
  predictionId: string;
  marketType: PredictionMarketType;
  entityId: string;
  orchestrationSummary: {
    selectedChampionId: string;
    activeEnsembleType: string;
    activeModelsCount: number;
  };
  finalOutput: ModelProbabilityOutput;
  finalConfidence: ModelConfidenceMetrics;
  modelInferenceBreakdown: Record<string, SingleModelInferenceResponse>;
  featuresSnapshot: Record<string, any>;
  datasetVersion: string;
  experimentId: string;
  calibrationVersion: string;
  inferenceDurationMs: number;
  timestamp: string;
}

export interface HistoricalPredictionRecord {
  predictionId: string;
  marketType: PredictionMarketType;
  entityId: string;
  finalOutput: ModelProbabilityOutput;
  finalConfidence: ModelConfidenceMetrics;
  featuresSnapshot: Record<string, any>;
  selectedChampionId: string;
  modelInferenceBreakdown: Record<string, SingleModelInferenceResponse>;
  datasetVersion: string;
  experimentId: string;
  calibrationVersion: string;
  inferenceDurationMs: number;
  timestamp: string;
  // Feedback results (when resolved)
  actualResult?: string; // e.g., "Home", "Away", "Under", "Over"
  accuracyResult?: number; // 1 = correct, 0 = incorrect
  brierScoreResult?: number;
  logLossResult?: number;
}

export interface MarketModelPipeline {
  marketType: PredictionMarketType;
  champion: ModelMetadata | null;
  challenger: ModelMetadata | null;
  fallback: ModelMetadata | null;
  experimental: ModelMetadata | null;
  shadow: ModelMetadata | null;
  canary: ModelMetadata | null;
  datasetId: string;
  features: string[];
}

export interface ModelTrainingConfig {
  marketType: PredictionMarketType;
  family: PredictionModelFamily;
  hyperparameters?: Record<string, any>;
  features: string[];
}
