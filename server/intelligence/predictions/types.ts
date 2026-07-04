export type PredictionMarketType = "1X2" | "Over/Under" | "BTTS" | "AsianHandicap";

export interface PredictionFactoryResponse {
  predictionId: string;
  modelId: string;
  probabilities: Record<string, number>;
  confidenceScore: number;
  explanation: string;
  inferenceDurationMs: number;
  timestamp: string;
}

export interface SimilarityIntelligence {
  similarFixtures: string[];
  historicalAccuracy: number;
  clusterAssignment: string;
}

export interface QualityIntelligence {
  dataFreshness: number;
  featureCompleteness: number;
  anomalyDetected: boolean;
}

export interface ExplainabilityDetails {
  naturalLanguageExplanation: string;
  topContributingFeatures: { feature: string; impact: number; direction: "positive" | "negative" }[];
  supportingEvidence: string[];
  contradictingEvidence: string[];
  riskFactors: string[];
}

export interface ModelGovernanceMetadata {
  modelId: string;
  modelVersion: string;
  lastRetrainingDate: string;
  knownLimitations: string[];
}

export interface PredictionIntelligenceReport {
  predictionId: string;
  marketType: string;
  probabilities: Record<string, number>;
  confidence: number;
  similarity: SimilarityIntelligence;
  quality: QualityIntelligence;
  explainability: ExplainabilityDetails;
  governance: ModelGovernanceMetadata;
  compositeScore: number;
}
