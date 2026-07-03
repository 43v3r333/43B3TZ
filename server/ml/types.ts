export type ModelFamily = 'logistic_regression' | 'lightgbm' | 'xgboost' | 'catboost' | 'random_forest' | 'neural_network';

export type PredictionType = 'classification' | 'regression' | 'probability';

export type FeatureDataType = 'numerical' | 'categorical' | 'boolean';

// FEATURE STORE & REGISTRY
export interface FeatureDefinition {
  featureId: string;
  name: string;
  description: string;
  dataType: FeatureDataType;
  owner: string;
  version: number;
  category: string;
  expression: string;
  documentation: string;
  lineage: string[];
  freshness: string; // Timestamp of last computation
  validationRules: {
    min?: number;
    max?: number;
    allowedCategories?: string[];
    allowNull: boolean;
  };
  qualityScore: number; // 0 to 100
}

export interface FeatureValue {
  entityId: string;
  featureId: string;
  timestamp: string;
  value: any;
}

// DATASET BUILDER
export interface DatasetDefinition {
  datasetId: string;
  name: string;
  type: 'train' | 'validation' | 'test' | 'backtest' | 'offline_inference' | 'online_inference' | 'experiment';
  features: string[];
  splitMethod: 'chronological' | 'random' | 'walk_forward';
  hash: string;
  lineage: string[];
  rowCount: number;
  createdAt: string;
  timeRange: { start: string; end: string };
}

export interface DatasetRow {
  entityId: string;
  timestamp: string;
  features: Record<string, any>;
  target?: any;
}

// CALIBRATION
export interface ReliabilityPoint {
  binMidpoint: number;
  empiricalProb: number;
  predictedProb: number;
  count: number;
}

export interface CalibrationResult {
  method: 'platt_scaling' | 'isotonic_regression';
  expectedCalibrationError: number; // ECE
  maximumCalibrationError: number; // MCE
  brierScore: number;
  reliabilityDiagram: ReliabilityPoint[];
  parameters: Record<string, number>; // Weights / Platt intercepts, or Isotonic thresholds
}

// EVALUATION
export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocAuc: number;
  prAuc: number;
  logLoss: number;
  brierScore: number;
  calibrationError: number;
  expectedValue: number;
  profitSimulation: number;
  sharpeRatio: number;
  maxDrawdown: number;
  predictionStability: number;
  confidenceReliability: number;
  featureImportance: Record<string, number>;
  inferenceLatencyMs: number;
  trainingDurationMs: number;
}

// MODEL REGISTRY & METADATA
export interface ModelVersion {
  modelId: string;
  version: string; // e.g. "v1.0.0"
  family: ModelFamily;
  trainingDatasetId: string;
  featuresUsed: string[];
  hyperparameters: Record<string, any>;
  metrics: EvaluationMetrics;
  calibration: CalibrationResult;
  artifactPath: string;
  gitRevision: string;
  experimentId: string;
  championStatus: 'champion' | 'challenger' | 'retired';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  deploymentStatus: 'offline' | 'canary' | 'production';
  rollbackMetadata?: {
    previousModelId?: string;
    previousVersion?: string;
    rollbackReason?: string;
    rolledBackAt?: string;
  };
  createdAt: string;
  approvedBy?: string;
  notes?: string;
}

// EXPERIMENT TRACKING
export interface Experiment {
  experimentId: string;
  name: string;
  datasetVersion: string;
  featureVersion: string;
  modelVersion: string;
  hyperparameters: Record<string, any>;
  metrics: Record<string, number>;
  durationMs: number;
  hardwareMetadata: string;
  randomSeed: number;
  repositoryBaseline: string;
  notes: string;
  approvalStatus: 'draft' | 'approved' | 'rejected';
  createdAt: string;
}

// DRIFT MONITORING
export interface DriftMetric {
  metricName: string;
  driftScore: number; // e.g. PSI or KS-statistic
  status: 'stable' | 'warning' | 'critical';
  baselineMean: number;
  currentMean: number;
  testUsed: string; // e.g. "PSI" (Population Stability Index) or "KS" (Kolmogorov-Smirnov)
}

export interface DriftReport {
  timestamp: string;
  featureDrift: Record<string, DriftMetric>;
  targetDrift: DriftMetric;
  conceptDrift: DriftMetric;
  predictionDrift: DriftMetric;
  calibrationDrift: DriftMetric;
  alerts: string[];
}

// EXPLAINABILITY
export interface LocalExplanation {
  entityId: string;
  predictionId: string;
  shapValues: Record<string, number>;
  confidenceExplanation: string;
  predictionExplanation: string;
}

export interface GlobalExplanation {
  featureImportance: Record<string, number>;
  permutationImportance: Record<string, number>;
  partialDependence: Record<string, { value: any; response: number }[]>;
}

// INFERENCE PLATFORM
export interface InferenceRequest {
  modelId: string;
  version: string;
  entityId: string;
  features: Record<string, any>;
  timestamp: string;
}

export interface InferenceResponse {
  predictionId: string;
  modelId: string;
  version: string;
  entityId: string;
  probability?: number;
  prediction: any;
  explanation?: LocalExplanation;
  timestamp: string;
}
