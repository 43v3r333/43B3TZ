import { ModelPerformanceMetrics } from "../evaluation/evaluationEngine";

export interface ModelCard {
  modelId: string;
  version: string;
  architecture: string;
  trainingDataset: {
    name: string;
    fixtureCount: number;
    startDate: string;
    endDate: string;
    features: string[];
  };
  validationResults: ModelPerformanceMetrics;
  calibrationReport: {
    ece: number;
    reliabilityDiagramUrl?: string;
  };
  knownLimitations: string[];
  failureCases: string[];
  rollbackPlan: string;
  approvalHistory: {
    reviewer: string;
    timestamp: string;
    decision: "Approved" | "Rejected";
    comments: string;
  }[];
  deploymentHistory: {
    environment: "shadow" | "champion" | "production";
    timestamp: string;
    durationDays?: number;
  }[];
}

export interface ExecutiveKPIs {
  dailyROI: number;
  monthlyROI: number;
  predictionVolume: number;
  winRate: number;
  expectedValue: number;
  yield: number;
  customerRetention: number;
  conversionRate: number;
  accuracyByLeague: Record<string, number>;
  accuracyByMarket: Record<string, number>;
  providerCostUsd: number;
  infrastructureCostUsd: number;
  grossMargin: number;
  netMargin: number;
}
