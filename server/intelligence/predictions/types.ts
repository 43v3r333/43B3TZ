import { PredictionMarketType, PredictionModelFamily, ModelMetadata, ModelProbabilityOutput, ModelConfidenceMetrics } from "../../predictions/types";

export interface ConfidenceIntelligence {
  overallConfidence: number; // [0, 1]
  calibrationConfidence: number; // [0, 1]
  featureConfidence: number; // [0, 1]
  modelConfidence: number; // [0, 1]
  historicalConfidence: number; // [0, 1]
  predictionFreshness: number; // [0, 1]
  dataFreshness: number; // [0, 1]
  pipelineHealth: number; // [0, 1]
  confidenceTrend: "improving" | "stable" | "declining";
  compositeScore: number; // [0, 1]
}

export interface UncertaintyIntelligence {
  predictionEntropy: number; // Shannons entropy
  variance: number;
  confidenceIntervals: Record<string, { lower: number; upper: number }>;
  expectedUncertainty: number; // [0, 1]
  aleatoricUncertainty: number; // data uncertainty [0, 1]
  epistemicUncertainty: number; // model uncertainty [0, 1]
  riskBand: "low" | "medium" | "high";
  outOfDistributionIndicator: boolean;
  oodScore: number; // [0, 1]
}

export interface AgreementIntelligence {
  championVsChallenger: number; // cosine similarity or absolute diff
  modelFamilyDiffs: Record<string, number>; // diff among families
  ensembleAgreement: number; // [0, 1]
  historicalAgreement: number; // [0, 1]
  leagueAgreement: number; // [0, 1]
  seasonAgreement: number; // [0, 1]
  competitionAgreement: number; // [0, 1]
  agreementScore: number; // [0, 1]
}

export interface StabilityIntelligence {
  predictionDrift: number; // drift from baseline
  featureSensitivity: Record<string, number>; // feature -> impact score
  outputSensitivity: number; // overall variance under noise
  confidenceStability: number; // [0, 1]
  modelStability: number; // [0, 1]
  historicalConsistency: number; // [0, 1]
  predictionVolatility: number; // volatility score [0, 1]
}

export interface ReliabilityIntelligence {
  historicalCalibration: number; // 1 - calibration error
  historicalAccuracy: number; // [0, 1]
  leagueSpecificReliability: number; // [0, 1]
  competitionSpecificReliability: number; // [0, 1]
  homeAwayReliability: number; // [0, 1]
  seasonReliability: number; // [0, 1]
  featureCompleteness: number; // [0, 1]
  replayConsistency: number; // [0, 1]
}

export interface NeighborMatch {
  entityId: string;
  similarityScore: number;
  features: Record<string, any>;
  outcomes: Record<string, number>;
  actualResult?: string;
  confidenceScore: number;
}

export interface SimilarityIntelligence {
  nearestNeighbors: NeighborMatch[];
  historicalOutcomes: Record<string, number>; // average outcome of neighbors
  confidenceComparison: number; // avg confidence of similar neighbors
  clusterAssignment: string; // cluster id
  similarityScore: number; // average similarity of top neighbors
}

export interface QualityIntelligence {
  inputCompleteness: number; // [0, 1]
  featureFreshness: number; // [0, 1]
  providerQuality: number; // [0, 1]
  modelHealth: number; // [0, 1]
  calibrationQuality: number; // [0, 1]
  predictionConsistency: number; // [0, 1]
  historicalPerformance: number; // [0, 1]
  compositeQualityIndex: number; // [0, 1]
}

export interface ExplainabilityDetails {
  naturalLanguageExplanation: string;
  topContributingFeatures: { feature: string; impact: number; direction: "positive" | "negative" }[];
  counterfactualScenarios: { scenario: string; predictedOutcomeChange: string }[];
  sensitivityAnalysis: { feature: string; baselineValue: number; alteredValue: number; outputChange: number }[];
  predictionTimeline: { event: string; timestamp: string; details: string }[];
  modelComparisonSummary: string;
}

export interface PredictionIntelligenceReport {
  predictionId: string;
  marketType: PredictionMarketType;
  entityId: string;
  timestamp: string;
  confidence: ConfidenceIntelligence;
  uncertainty: UncertaintyIntelligence;
  agreement: AgreementIntelligence;
  stability: StabilityIntelligence;
  reliability: ReliabilityIntelligence;
  similarity: SimilarityIntelligence;
  quality: QualityIntelligence;
  explainability: ExplainabilityDetails;
  compositeScore: number; // Overall weighted intelligence score
}

export interface RankedPrediction {
  predictionId: string;
  entityId: string;
  marketType: PredictionMarketType;
  confidence: number;
  reliability: number;
  stability: number;
  agreement: number;
  quality: number;
  historicalPerformance: number;
  predictionEntropy: number;
  freshness: number;
  compositeScore: number;
  rank: number;
}

export type IntelligenceEventType =
  | "PredictionCreated"
  | "PredictionUpdated"
  | "ConfidenceCalculated"
  | "AgreementCalculated"
  | "QualityCalculated"
  | "ReliabilityUpdated"
  | "PredictionRanked"
  | "HistoricalComparisonCompleted";

export interface IntelligenceEvent {
  eventId: string;
  eventType: IntelligenceEventType;
  predictionId: string;
  timestamp: string;
  payload: Record<string, any>;
}
