import {
  PredictionFactoryRequest,
  PredictionFactoryResponse,
  SingleModelInferenceResponse,
  EnsembleMethodology,
  HistoricalPredictionRecord,
  PredictionMarketType
} from "../types";
import { modelPipelines } from "../models/predictionModels";
import { ModelOrchestrator } from "../orchestrator/modelOrchestrator";
import { EnsembleEngine } from "../ensemble/ensembleEngine";
import { predictionHistoryStore } from "../history/predictionHistory";
import { createLogger } from "../../core/logger";
import { PredictionIntelligenceOrchestrator } from "../../intelligence/predictions/intelligenceOrchestrator";

const logger = createLogger("PredictionFactory");

export class PredictionFactory {
  /**
   * Main entry point for the end-to-end Prediction Inference Pipeline.
   */
  public static executeInference(request: PredictionFactoryRequest): PredictionFactoryResponse {
    const startTime = Date.now();
    const predictionId = `pred_${request.marketType}_${request.entityId}_${Date.now()}`;
    logger.info(`Starting Prediction Factory inference for ${request.marketType} on entity ${request.entityId}`);

    // 1. Fetch Pipeline Engine matching the request's market type
    const pipeline = modelPipelines[request.marketType];
    if (!pipeline) {
      throw new Error(`Unsupported prediction market type: ${request.marketType}`);
    }

    // 2. Feature Lookup & Dataset Validation
    // Fetch features, merge with any overrides provided in the prediction request
    const compiledFeatures = {
      feat_elo_rating_diff: 60, // base default features
      feat_form_momentum: 0.62,
      feat_xg_differential: 0.35,
      feat_avg_team_goals_conceded: 2.4,
      feat_team_clean_sheets_ratio: 0.28,
      leagueId: request.leagueId || "Default League",
      competitionId: request.competitionId || "Default Competition",
      season: "2026",
      ...request.featuresOverride
    };

    // 3. Model Orchestrator Selection
    const orchestration = ModelOrchestrator.selectModels(request.marketType, {
      leagueId: request.leagueId,
      competitionId: request.competitionId,
      dataQualityScore: 98 // base assumption
    });

    const breakdown: Record<string, SingleModelInferenceResponse> = {};
    const ensembleInputs: Record<string, { output: any; meta: any }> = {};

    // 4. Multi-Model Inference Execution (Inference -> Calibration -> Confidence)
    orchestration.allSelected.forEach(model => {
      const modelStartTime = Date.now();
      
      // Execute the model's prediction pipeline
      const modelResult = pipeline.predict(compiledFeatures, model);

      const latency = Date.now() - modelStartTime;

      const singleInference: SingleModelInferenceResponse = {
        modelId: model.modelId,
        version: model.version,
        role: model.role,
        probabilityOutput: modelResult.probabilities,
        confidence: modelResult.confidence,
        featuresSnapshot: compiledFeatures,
        inferenceLatencyMs: latency
      };

      breakdown[model.modelId] = singleInference;

      // Only add to active ensemble input if it is the champion, experimental, or canary model (e.g. active decision paths)
      if (model.role === "champion" || model.role === "experimental" || model.role === "canary") {
        ensembleInputs[model.modelId] = {
          output: modelResult.probabilities,
          meta: model
        };
      }
    });

    // 5. Ensemble Aggregation
    // Select ensemble strategy
    const activeModelsCount = Object.keys(ensembleInputs).length;
    const ensembleMethod: EnsembleMethodology = {
      type: activeModelsCount > 1 ? "weighted_voting" : "model_averaging",
      weights: {},
      context: {
        leagueId: request.leagueId,
        competitionId: request.competitionId,
        dataQualityScore: 95
      }
    };

    // Assign some weights for weighted voting if multiple models are present
    if (activeModelsCount > 1) {
      let weightShare = 1.0 / activeModelsCount;
      Object.keys(ensembleInputs).forEach(mId => {
        const meta = ensembleInputs[mId].meta;
        ensembleMethod.weights[mId] = meta.role === "champion" ? 0.7 : 0.3; // favor champion
      });
    }

    const ensembleResult = EnsembleEngine.ensemblePredictions(ensembleInputs, ensembleMethod);

    // 6. Final Probability and Confidence Structuring
    // Use champion's probability metadata, but update final calibrated weights from ensemble outcome
    const championId = orchestration.champion.modelId;
    const championResult = breakdown[championId];

    const finalOutput = {
      ...championResult.probabilityOutput,
      calibratedProbabilities: ensembleResult.finalProbabilities
    };

    // Re-calculate composite confidence using calculated agreement and consensus
    const finalConfidence = {
      ...championResult.confidence,
      agreementScore: ensembleResult.agreementScore,
      modelConsensus: ensembleResult.consensusScore,
      compositeScore: (championResult.confidence.compositeScore * 0.8) + (ensembleResult.agreementScore * 0.1) + (ensembleResult.consensusScore * 0.1)
    };

    const latencyTotal = Date.now() - startTime;

    const response: PredictionFactoryResponse = {
      predictionId,
      marketType: request.marketType,
      entityId: request.entityId,
      orchestrationSummary: {
        selectedChampionId: championId,
        activeEnsembleType: ensembleMethod.type,
        activeModelsCount
      },
      finalOutput,
      finalConfidence,
      modelInferenceBreakdown: breakdown,
      featuresSnapshot: compiledFeatures,
      datasetVersion: orchestration.champion.datasetId,
      experimentId: `exp_inf_${request.marketType}_v1`,
      calibrationVersion: "cal_platt_v1",
      inferenceDurationMs: latencyTotal,
      timestamp: new Date().toISOString()
    };

    // 7. Store prediction record inside Historical Prediction ledger automatically
    const historyRecord: HistoricalPredictionRecord = {
      predictionId: response.predictionId,
      marketType: response.marketType,
      entityId: response.entityId,
      finalOutput: response.finalOutput,
      finalConfidence: response.finalConfidence,
      featuresSnapshot: response.featuresSnapshot,
      selectedChampionId: response.orchestrationSummary.selectedChampionId,
      modelInferenceBreakdown: response.modelInferenceBreakdown,
      datasetVersion: response.datasetVersion,
      experimentId: response.experimentId,
      calibrationVersion: response.calibrationVersion,
      inferenceDurationMs: response.inferenceDurationMs,
      timestamp: response.timestamp
    };

    predictionHistoryStore.logPrediction(historyRecord);

    // Auto-generate deep intelligence report for the new prediction
    try {
      PredictionIntelligenceOrchestrator.generateReport(response);
    } catch (intelErr) {
      logger.error("Failed to generate prediction intelligence report:", intelErr);
    }

    return response;
  }
}
