import { 
  NormalizedFixture, 
  NormalizedOdds, 
  NormalizedStatistics, 
  NormalizedPlayer, 
  NormalizedTeam, 
  NormalizedWeather, 
  NormalizedRanking, 
  NormalizedNews, 
  NormalizedCompetition, 
  NormalizedVenue 
} from "../providers/interfaces/dto";

export type EntityType = 
  | "fixture" 
  | "odds" 
  | "statistics" 
  | "player" 
  | "team" 
  | "weather" 
  | "ranking" 
  | "news" 
  | "competition" 
  | "venue";

export interface LandingRecord {
  landingId: string;
  providerName: string;
  entityType: EntityType;
  rawPayload: any;
  checksum: string;
  timestamp: string;
  version: string;
  compressed: boolean;
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
}

export interface QualityResult {
  score: number; // 0-100
  completeness: number; // 0-100
  consistency: number; // 0-100
  freshness: number; // 0-100
  accuracy: number; // 0-100
  providerConfidence: number; // 0-100
  duplicateProbability: number; // 0-100
  normalizationQuality: number; // 0-100
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matchedId: string | null;
  confidence: number; // 0 to 1
  resolution: "ignore" | "update" | "merge" | "insert";
}

export interface EnrichmentMetadata {
  timezone?: string;
  country?: string;
  weatherTemperature?: number;
  weatherCondition?: string;
  venueCapacity?: number;
  venueSurface?: string;
  competitionType?: string;
  derivedStats?: Record<string, any>;
  lastIngested?: string;
  historicalAverageScore?: number;
}

export interface CuratedEntity<T = any> {
  curatedId: string;
  entityType: EntityType;
  data: T;
  enrichment: EnrichmentMetadata;
  qualityScore: number;
  version: number;
  updatedAt: string;
  ingestionChain: string[]; // List of providers that contributed
}

export interface AuditRecord {
  auditId: string;
  landingId: string;
  providerName: string;
  entityType: EntityType;
  checksum: string;
  transformationChain: string[];
  qualityScore: number;
  storageDestination: string;
  durationMs: number;
  operator: string;
  pipelineVersion: string;
  timestamp: string;
  stagesStatus: Record<string, { durationMs: number; success: boolean; error?: string }>;
}

export enum PipelineEventType {
  RawDataReceived = "RawDataReceived",
  ValidationPassed = "ValidationPassed",
  ValidationFailed = "ValidationFailed",
  QualityCalculated = "QualityCalculated",
  DeduplicationCompleted = "DeduplicationCompleted",
  EntityUpdated = "EntityUpdated",
  StorageCompleted = "StorageCompleted",
  PipelineFailed = "PipelineFailed",
  ReplayStarted = "ReplayStarted",
  ReplayCompleted = "ReplayCompleted"
}

export interface PipelineEvent {
  eventId: string;
  eventType: PipelineEventType;
  timestamp: string;
  providerName: string;
  entityType: EntityType;
  landingId?: string;
  payload: any;
  checksum?: string;
}

export interface PipelineConfig {
  pipelineVersion: string;
  enabledStages: {
    landing: boolean;
    validation: boolean;
    normalization: boolean;
    schemaValidation: boolean;
    businessValidation: boolean;
    qualityScoring: boolean;
    deduplication: boolean;
    enrichment: boolean;
    transformation: boolean;
    storage: boolean;
    eventPublication: boolean;
    auditLogging: boolean;
  };
  retries: number;
  parallelExecution: boolean;
  rollbackOnFailure: boolean;
}

export interface ETLStorageSchema {
  raw: Record<string, LandingRecord>; // keyed by landingId
  normalized: Record<string, {
    landingId: string;
    entityType: EntityType;
    data: any;
    timestamp: string;
  }>; // keyed by landingId/entityId
  curated: Record<string, Record<string, CuratedEntity>>; // keyed by [entityType][curatedId]
}
