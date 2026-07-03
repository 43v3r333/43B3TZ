
import { PredictionMarketType, ModelProbabilityOutput, ModelConfidenceMetrics } from "../predictions/types";

export interface DecisionIntelligenceRequest {
  marketType: PredictionMarketType;
  entityId: string;
  predictionId: string; // From Prediction Intelligence
  marketId: string; // From Market Intelligence
}

export interface DecisionIntelligenceOutput {
  decisionId: string;
  entityId: string;
  predictionId: string;
  marketId: string;
  
  // Probability Comparison
  comparison: {
    predictionProbabilities: Record<string, number>;
    marketProbabilities: Record<string, number>;
    probabilityDifference: Record<string, number>; // Prediction - Market
    relativeDifference: Record<string, number>; // (Prediction - Market) / Market
    agreementScore: number;
    distributionOverlap: number;
  };

  // Edge Analysis
  edge: {
    expectedValue: Record<string, number>;
    edgePercentage: Record<string, number>;
    confidenceAdjustedEdge: Record<string, number>;
  };

  // Decision Scoring
  scoring: {
    compositeScore: number; // 0-100
    riskScore: number; // 0-100
  };
  
  timestamp: string;
}

export interface DecisionRecord {
  decisionId: string;
  timestamp: string;
  data: DecisionIntelligenceOutput;
}
