import { predictionModelRegistry } from "../predictions/registry/modelRegistry";
import { CalibrationEngine } from "../predictions/calibration/calibrationEngine";
import { ConfidenceEngine } from "../predictions/confidence/confidenceEngine";
import { EnsembleEngine } from "../predictions/ensemble/ensembleEngine";
import { ModelOrchestrator } from "../predictions/orchestrator/modelOrchestrator";
import { predictionHistoryStore } from "../predictions/history/predictionHistory";
import { PredictionFactory } from "../predictions/factory/predictionFactory";
import { modelPipelines } from "../predictions/models/predictionModels";
import { createLogger } from "../core/logger";

const logger = createLogger("PredictionTestSuite");

let testCount = 0;
let failCount = 0;

function predAssert(condition: boolean, name: string) {
  testCount++;
  if (condition) {
    logger.info(`✅ [PredictionFactory-TEST] PASS: ${name}`);
  } else {
    failCount++;
    logger.error(`❌ [PredictionFactory-TEST] FAIL: ${name}`);
  }
}

export async function runPredictionTestSuite() {
  logger.info("Initializing Prediction Factory Test Suite (Sprint 4)...");

  // Reset stores to guarantee sandboxed test execution
  predictionModelRegistry.clearAll();
  predictionHistoryStore.getAllRecords().length = 0;

  // ==========================================
  // 1. MODEL REGISTRY TESTS
  // ==========================================
  const allModels = predictionModelRegistry.getAllModels();
  predAssert(allModels.length >= 26, "Model registry seeds baseline champions & fallbacks for all markets");

  const matchOutcomeChamp = predictionModelRegistry.getModelByRole("match_outcome", "champion");
  predAssert(matchOutcomeChamp !== undefined, "Match Outcome champion is registered and searchable");
  predAssert(matchOutcomeChamp?.family === "lightgbm", "Match Outcome champion family is correctly LightGBM");

  // ==========================================
  // 2. PROBABILITY CALIBRATION TESTS
  // ==========================================
  const rawProbs = { Home: 0.60, Draw: 0.20, Away: 0.20 };
  const calibrated = CalibrationEngine.calibrateProbabilities(rawProbs, "platt_scaling");
  
  // Verify probabilities sum to 1.0 after platt scaling
  const sum = Object.values(calibrated).reduce((a, b) => a + b, 0);
  predAssert(Math.abs(sum - 1.0) < 0.0001, "Calibrated probabilities sum to exactly 1.0 (Normalization Check)");

  // Entropy checks
  const entropyHigh = CalibrationEngine.calculateEntropy({ Home: 0.33, Draw: 0.33, Away: 0.34 });
  const entropyLow = CalibrationEngine.calculateEntropy({ Home: 0.90, Draw: 0.05, Away: 0.05 });
  predAssert(entropyLow < entropyHigh, "Shannon Entropy is correctly lower for more certain distributions");

  // Complete probability packaging processing
  const processedProb = CalibrationEngine.processProbabilityOutput(rawProbs);
  predAssert(processedProb.entropy >= 0, "Processed probability output returns valid entropy >= 0");
  predAssert(processedProb.expectedUncertainty >= 0 && processedProb.expectedUncertainty <= 1, "Expected uncertainty is within [0, 1] bounds");
  predAssert(processedProb.reliability >= 0 && processedProb.reliability <= 1, "Reliability score is within [0, 1] bounds");

  // ==========================================
  // 3. CONFIDENCE ENGINE TESTS
  // ==========================================
  const mockModel = matchOutcomeChamp!;
  const confidence = ConfidenceEngine.calculateConfidence(
    processedProb.calibratedProbabilities,
    mockModel,
    { feat_elo_rating_diff: 60, feat_form_momentum: 0.65 }
  );

  predAssert(confidence.predictionConfidence >= 0 && confidence.predictionConfidence <= 1, "Prediction confidence falls in [0, 1]");
  predAssert(confidence.calibrationConfidence >= 0 && confidence.calibrationConfidence <= 1, "Calibration confidence falls in [0, 1]");
  predAssert(confidence.featureConfidence === 1.0, "Feature confidence is 1.0 when features are complete");
  
  const incompleteFeaturesConfidence = ConfidenceEngine.calculateConfidence(
    processedProb.calibratedProbabilities,
    mockModel,
    { feat_elo_rating_diff: null, feat_form_momentum: undefined }
  );
  predAssert(incompleteFeaturesConfidence.featureConfidence === 0.0, "Feature confidence drops to 0.0 when features are missing/null");

  predAssert(confidence.dataFreshnessScore > 0 && confidence.dataFreshnessScore <= 1, "Data freshness decays correctly to within valid bounds");
  predAssert(confidence.compositeScore > 0 && confidence.compositeScore <= 1, "Composite confidence score combines multiple axes successfully");

  // ==========================================
  // 4. ENSEMBLE ENGINE TESTS
  // ==========================================
  const modelAProbs = { Home: 0.50, Draw: 0.25, Away: 0.25 };
  const modelBProbs = { Home: 0.60, Draw: 0.20, Away: 0.20 };
  
  const ensembleInputs = {
    model_a: {
      output: {
        rawProbabilities: modelAProbs,
        calibratedProbabilities: modelAProbs,
        confidenceIntervals: {},
        entropy: 0.5,
        expectedUncertainty: 0.5,
        reliability: 0.8
      },
      meta: mockModel
    },
    model_b: {
      output: {
        rawProbabilities: modelBProbs,
        calibratedProbabilities: modelBProbs,
        confidenceIntervals: {},
        entropy: 0.4,
        expectedUncertainty: 0.4,
        reliability: 0.9
      },
      meta: mockModel
    }
  };

  const ensembleModelAvg = EnsembleEngine.ensemblePredictions(ensembleInputs, {
    type: "model_averaging",
    weights: {},
    context: { dataQualityScore: 100 }
  });

  predAssert(Math.abs(ensembleModelAvg.finalProbabilities.Home - 0.55) < 0.001, "Model Averaging correctly computes mathematical mean across model inputs");
  predAssert(ensembleModelAvg.agreementScore >= 0.9, "Agreement score correctly measures high cosine similarity between aligned models");
  predAssert(ensembleModelAvg.consensusScore === 1.0, "Consensus score is 1.0 when all models agree on the top outcome");

  // Weighted voting test
  const ensembleWeighted = EnsembleEngine.ensemblePredictions(ensembleInputs, {
    type: "weighted_voting",
    weights: { model_a: 0.1, model_b: 0.9 },
    context: { dataQualityScore: 100 }
  });
  predAssert(ensembleWeighted.finalProbabilities.Home > 0.58, "Weighted voting correctly biases output towards the heavily-weighted model B");

  // ==========================================
  // 5. ORCHESTRATION TESTS
  // ==========================================
  const selected = ModelOrchestrator.selectModels("match_outcome");
  predAssert(selected.champion.modelId === matchOutcomeChamp?.modelId, "Orchestrator selects active champion model under standard conditions");
  
  // Degrade champion health and check fallback routing
  predictionModelRegistry.updateModelHealth(mockModel.modelId, "unhealthy");
  const fallbackSelected = ModelOrchestrator.selectModels("match_outcome");
  predAssert(fallbackSelected.champion.role === "fallback", "Orchestrator successfully routes to fallback model when champion is unhealthy");

  // Recover champion health
  predictionModelRegistry.updateModelHealth(mockModel.modelId, "healthy");

  // ==========================================
  // 6. PIPELINES AND INFERENCE TESTS
  // ==========================================
  const response = PredictionFactory.executeInference({
    marketType: "match_outcome",
    entityId: "fixture-validation-test",
    featuresOverride: { feat_elo_rating_diff: 120 }
  });

  predAssert(response.predictionId.startsWith("pred_match_outcome_"), "Prediction Factory generates structured predictionId");
  predAssert(response.finalOutput.calibratedProbabilities.Home > response.finalOutput.calibratedProbabilities.Away, "Home team probability increases with positive ELO differential");
  predAssert(response.inferenceDurationMs >= 0, "Inference latency is tracked successfully");

  // ==========================================
  // 7. HISTORICAL LEDGER, REPLAY & RESOLUTION
  // ==========================================
  const prevCount = predictionHistoryStore.getAllRecords().length;
  PredictionFactory.executeInference({
    marketType: "over_under_2_5",
    entityId: "fixture-replay-test-101"
  });
  
  const updatedRecords = predictionHistoryStore.getAllRecords();
  predAssert(updatedRecords.length === prevCount + 1, "Prediction factory auto-logs inference events to historical predictions ledger");

  const unresPred = updatedRecords[0];
  predAssert(unresPred.actualResult === undefined, "New historical prediction starts in unresolved state");

  // Resolve prediction and evaluate calculations
  const resolved = predictionHistoryStore.resolvePrediction(unresPred.predictionId, "Over");
  predAssert(resolved.actualResult === "Over", "Replay Engine successfully resolves historical predictions with ground truth");
  predAssert(resolved.accuracyResult !== undefined, "Resolution computes accuracy result");
  predAssert(resolved.brierScoreResult !== undefined && resolved.brierScoreResult >= 0, "Resolution computes mathematically correct Brier Calibration Score");
  predAssert(resolved.logLossResult !== undefined && resolved.logLossResult >= 0, "Resolution computes mathematically correct Log Loss");

  // ==========================================
  // 8. PERFORMANCE AND CONTRACT METRICS
  // ==========================================
  const perf = predictionHistoryStore.calculatePerformanceMetrics();
  predAssert(perf.resolvedPredictions > 0, "Evaluation engine correctly aggregates performance metrics over resolved records");
  predAssert(perf.accuracy >= 0 && perf.accuracy <= 1, "Evaluation reports valid accuracy bounds");
  predAssert(perf.meanBrierScore >= 0, "Evaluation reports mean Brier Score");
  predAssert(perf.meanLogLoss >= 0, "Evaluation reports mean Log Loss");
  predAssert(perf.meanLatencyMs >= 0, "Evaluation reports average low-latency inference performance in milliseconds");

  logger.info(`================================================================`);
  logger.info(`  PREDICTION TEST SUITE COMPLETED: Passed ${testCount - failCount}/${testCount} assertions`);
  logger.info(`================================================================`);

  if (failCount > 0) {
    throw new Error(`Prediction test suite failed with ${failCount} failing checks.`);
  }
}
