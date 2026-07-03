import { IPredictionRepository, IModelRepository } from "../repositories/types";
import { PredictionMarketType } from "../predictions/types";
import { PredictionFactory } from "../predictions/factory/predictionFactory";
import { createLogger } from "../core/logger";
import { predictionCache } from "../core/cache";
import { eventBus } from "../core/eventBus";
import { jobQueue } from "../core/queue";

const logger = createLogger("PredictionService");

export class PredictionService {
  constructor(
    private predictionRepo: IPredictionRepository,
    private modelRepo: IModelRepository
  ) {
    // Register background job handler for async prediction generation & AI inference
    jobQueue.registerHandler("prediction_generation", async (job) => {
      const { marketType, entityId, featuresOverride, leagueId, competitionId } = job.payload;
      return this.executeInferenceSync(marketType, entityId, featuresOverride, leagueId, competitionId);
    });
  }

  public getAllRecords() {
    return this.predictionRepo.getAllRecords();
  }

  public getRecordById(id: string) {
    return this.predictionRepo.getRecordById(id);
  }

  public async executeInferenceAsync(
    marketType: PredictionMarketType,
    entityId: string,
    featuresOverride?: any,
    leagueId?: string,
    competitionId?: string
  ) {
    const job = await jobQueue.enqueue("prediction_generation", {
      marketType,
      entityId,
      featuresOverride,
      leagueId,
      competitionId
    });
    return { jobId: job.id, status: job.status };
  }

  public executeInferenceSync(
    marketType: PredictionMarketType,
    entityId: string,
    featuresOverride?: any,
    leagueId?: string,
    competitionId?: string
  ) {
    const cacheKey = `pred_${marketType}_${entityId}_${JSON.stringify(featuresOverride || {})}`;
    const cached = predictionCache.get<any>(cacheKey);
    if (cached) {
      logger.info(`Prediction Cache hit for key: ${cacheKey}`);
      return cached;
    }

    const response = PredictionFactory.executeInference({
      marketType,
      entityId,
      featuresOverride,
      leagueId,
      competitionId
    });

    // Write to cache (TTL: 5 minutes)
    predictionCache.set(cacheKey, response, 300);

    // Persist via repository
    this.predictionRepo.logPrediction({
      predictionId: `pred-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      marketType,
      entityId,
      finalOutput: response.finalOutput,
      finalConfidence: response.finalConfidence,
      featuresSnapshot: response.featuresSnapshot,
      selectedChampionId: response.orchestrationSummary.selectedChampionId,
      modelInferenceBreakdown: response.modelInferenceBreakdown,
      datasetVersion: response.datasetVersion,
      experimentId: response.experimentId,
      calibrationVersion: response.calibrationVersion,
      inferenceDurationMs: response.inferenceDurationMs,
      timestamp: new Date().toISOString()
    });

    // Publish event
    eventBus.publish("PredictionCreated", response);

    return response;
  }

  public resolvePrediction(predictionId: string, actualOutcome: string) {
    const record = this.predictionRepo.resolvePrediction(predictionId, actualOutcome);
    eventBus.publish("PredictionUpdated", record);
    predictionCache.invalidatePattern("pred_*");
    return record;
  }
}
