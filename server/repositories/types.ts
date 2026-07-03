import { ModelMetadata, HistoricalPredictionRecord, PredictionMarketType, ModelDeploymentRole } from "../predictions/types";
import { DBFixture, DBOdds } from "../core/db";

export interface IPredictionRepository {
  getAllRecords(): HistoricalPredictionRecord[];
  getRecordById(predictionId: string): HistoricalPredictionRecord | undefined;
  logPrediction(record: HistoricalPredictionRecord): void;
  resolvePrediction(predictionId: string, actualResult: string): HistoricalPredictionRecord;
}

export interface IResearchExperiment {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  results?: {
    accuracy: number;
    f1Score: number;
    calibrationError: number;
    timestamp: string;
  };
  createdAt: string;
}

export interface IResearchRepository {
  listExperiments(): IResearchExperiment[];
  createExperiment(name: string, description: string): IResearchExperiment;
  getExperimentById(id: string): IResearchExperiment | undefined;
  updateExperiment(id: string, updates: Partial<IResearchExperiment>): IResearchExperiment;
}

export interface IMatchRepository {
  getAllFixtures(): DBFixture[];
  getFixtureById(id: string): DBFixture | null;
  insertFixture(fixture: DBFixture): DBFixture;
  updateFixture(id: string, updates: Partial<DBFixture>): DBFixture;
  deleteFixture(id: string): boolean;
  queryFixturesWithLatestOdds(): any[];
}

export interface IOddsRepository {
  getAllOdds(): DBOdds[];
  insertOdds(odds: DBOdds): DBOdds;
  getOddsForFixture(fixtureId: string): DBOdds[];
}

export interface IModelRepository {
  getAllModels(): ModelMetadata[];
  getModelById(modelId: string): ModelMetadata | undefined;
  getModelsByMarket(marketType: PredictionMarketType): ModelMetadata[];
  getModelByRole(marketType: PredictionMarketType, role: ModelDeploymentRole): ModelMetadata | undefined;
  registerModel(model: ModelMetadata): void;
  updateModelRole(modelId: string, role: ModelDeploymentRole): ModelMetadata;
  updateModelHealth(modelId: string, health: "healthy" | "degraded" | "unhealthy"): ModelMetadata;
  rollbackModel(marketType: PredictionMarketType, role: ModelDeploymentRole, fallbackModelId: string): void;
}

export interface IAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  resource: string;
  status: "success" | "failure";
  metadata?: any;
}

export interface IAuditRepository {
  log(record: Omit<IAuditRecord, "id" | "timestamp">): IAuditRecord;
  getLogs(filters?: { actorId?: string; action?: string }): IAuditRecord[];
}
