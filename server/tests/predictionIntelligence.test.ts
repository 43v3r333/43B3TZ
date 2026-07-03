import { PredictionIntelligenceOrchestrator, intelligenceReportStore } from "../intelligence/predictions/intelligenceOrchestrator";
import { ConfidenceIntelligenceEngine } from "../intelligence/predictions/confidence/confidenceIntelligence";
import { UncertaintyIntelligenceEngine } from "../intelligence/predictions/uncertainty/uncertaintyIntelligence";
import { AgreementIntelligenceEngine } from "../intelligence/predictions/agreement/agreementIntelligence";
import { StabilityIntelligenceEngine } from "../intelligence/predictions/stability/stabilityIntelligence";
import { ReliabilityIntelligenceEngine } from "../intelligence/predictions/reliability/reliabilityIntelligence";
import { SimilarityIntelligenceEngine } from "../intelligence/predictions/similarity/similarityIntelligence";
import { QualityIntelligenceEngine } from "../intelligence/predictions/quality/qualityIntelligence";
import { RankingIntelligenceEngine } from "../intelligence/predictions/ranking/rankingIntelligence";
import { intelligenceEventBus } from "../intelligence/predictions/events/intelligenceEvents";
import { PredictionFactoryResponse } from "../predictions/types";
import { createLogger } from "../core/logger";

const logger = createLogger("PredictionIntelligenceTestSuite");

let testCount = 0;
let failCount = 0;

function assertCheck(condition: boolean, name: string) {
  testCount++;
  if (condition) {
    logger.info(`✅ [PredictionIntelligence-TEST] PASS: ${name}`);
  } else {
    failCount++;
    logger.error(`❌ [PredictionIntelligence-TEST] FAIL: ${name}`);
  }
}

export async function runPredictionIntelligenceTestSuite() {
  logger.info("Initializing Prediction Intelligence Test Suite (Sprint 5)...");

  // ==========================================
  // 1. SETUP MOCK DATA
  // ==========================================
  const mockPrediction: PredictionFactoryResponse = {
    predictionId: "pred_match_outcome_fixture-test-555_12345",
    marketType: "match_outcome",
    entityId: "fixture-test-555",
    orchestrationSummary: {
      selectedChampionId: "mod_champ_match_outcome_v1",
      activeEnsembleType: "weighted_voting",
      activeModelsCount: 2
    },
    finalOutput: {
      rawProbabilities: { Home: 0.55, Draw: 0.25, Away: 0.20 },
      calibratedProbabilities: { Home: 0.58, Draw: 0.24, Away: 0.18 },
      confidenceIntervals: {},
      entropy: 0.85,
      expectedUncertainty: 0.40,
      reliability: 0.82
    },
    finalConfidence: {
      predictionConfidence: 0.80,
      calibrationConfidence: 0.88,
      featureConfidence: 1.0,
      dataFreshnessScore: 0.95,
      marketConfidence: 0.85,
      agreementScore: 0.90,
      modelConsensus: 0.88,
      historicalReliability: 0.80,
      compositeScore: 0.84
    },
    modelInferenceBreakdown: {
      "mod_champ_match_outcome_v1": {
        modelId: "mod_champ_match_outcome_v1",
        version: "v1.0",
        role: "champion",
        probabilityOutput: {
          rawProbabilities: { Home: 0.55, Draw: 0.25, Away: 0.20 },
          calibratedProbabilities: { Home: 0.58, Draw: 0.24, Away: 0.18 },
          confidenceIntervals: {},
          entropy: 0.85,
          expectedUncertainty: 0.40,
          reliability: 0.82
        },
        confidence: {
          predictionConfidence: 0.80,
          calibrationConfidence: 0.88,
          featureConfidence: 1.0,
          dataFreshnessScore: 0.95,
          marketConfidence: 0.85,
          agreementScore: 0.90,
          modelConsensus: 0.88,
          historicalReliability: 0.80,
          compositeScore: 0.84
        },
        featuresSnapshot: {
          feat_elo_rating_diff: 120,
          feat_form_momentum: 0.75,
          feat_xg_differential: 0.8
        },
        inferenceLatencyMs: 12
      },
      "mod_fallback_match_outcome_v1": {
        modelId: "mod_fallback_match_outcome_v1",
        version: "v1.0",
        role: "fallback",
        probabilityOutput: {
          rawProbabilities: { Home: 0.50, Draw: 0.30, Away: 0.20 },
          calibratedProbabilities: { Home: 0.52, Draw: 0.28, Away: 0.20 },
          confidenceIntervals: {},
          entropy: 0.90,
          expectedUncertainty: 0.45,
          reliability: 0.80
        },
        confidence: {
          predictionConfidence: 0.75,
          calibrationConfidence: 0.85,
          featureConfidence: 1.0,
          dataFreshnessScore: 0.90,
          marketConfidence: 0.80,
          agreementScore: 0.85,
          modelConsensus: 0.82,
          historicalReliability: 0.78,
          compositeScore: 0.79
        },
        featuresSnapshot: {
          feat_elo_rating_diff: 120,
          feat_form_momentum: 0.75,
          feat_xg_differential: 0.8
        },
        inferenceLatencyMs: 10
      }
    },
    featuresSnapshot: {
      feat_elo_rating_diff: 120,
      feat_form_momentum: 0.75,
      feat_xg_differential: 0.8
    },
    datasetVersion: "ds_temporal_v1",
    experimentId: "exp_sprint5",
    calibrationVersion: "cal_platt",
    inferenceDurationMs: 25,
    timestamp: new Date().toISOString()
  };

  // ==========================================
  // 2. CONFIDENCE ENGINE TESTS
  // ==========================================
  const confResult = ConfidenceIntelligenceEngine.calculateConfidence(mockPrediction);
  assertCheck(confResult.overallConfidence === 0.80, "Confidence Engine correctly extracts predictionConfidence");
  assertCheck(confResult.compositeScore > 0.5 && confResult.compositeScore <= 1.0, "Confidence composite score is mathematically normalized and computed");
  assertCheck(confResult.confidenceTrend === "stable" || confResult.confidenceTrend === "improving" || confResult.confidenceTrend === "declining", "Confidence Trend is resolved as enum value");

  // ==========================================
  // 3. UNCERTAINTY ENGINE TESTS
  // ==========================================
  const uncResult = UncertaintyIntelligenceEngine.calculateUncertainty(mockPrediction);
  assertCheck(uncResult.predictionEntropy > 0, "Uncertainty Engine calculates non-zero Shannon Entropy");
  assertCheck(uncResult.variance > 0, "Uncertainty Engine calculates probability variance");
  assertCheck(uncResult.aleatoricUncertainty >= 0 && uncResult.aleatoricUncertainty <= 1.0, "Aleatoric uncertainty computed within [0,1]");
  assertCheck(uncResult.epistemicUncertainty >= 0 && uncResult.epistemicUncertainty <= 1.0, "Epistemic uncertainty computed within [0,1]");
  assertCheck(uncResult.riskBand === "low" || uncResult.riskBand === "medium" || uncResult.riskBand === "high", "Risk band correctly resolved");

  // ==========================================
  // 4. AGREEMENT ENGINE TESTS
  // ==========================================
  const agrResult = AgreementIntelligenceEngine.calculateAgreement(mockPrediction);
  assertCheck(agrResult.championVsChallenger > 0.90, "Agreement Engine computes champion vs challenger cosine similarity correctly");
  assertCheck(agrResult.agreementScore > 0.5 && agrResult.agreementScore <= 1.0, "Agreement aggregate score computed");

  // ==========================================
  // 5. STABILITY ENGINE TESTS
  // ==========================================
  const stabResult = StabilityIntelligenceEngine.calculateStability(mockPrediction);
  assertCheck(stabResult.predictionDrift >= 0, "Stability Engine calculates absolute prediction drift");
  assertCheck(stabResult.featureSensitivity["feat_elo_rating_diff"] > 0, "Feature sensitivity for Elo rating calculated correctly");
  assertCheck(stabResult.outputSensitivity > 0, "Output sensitivity index calculated correctly");

  // ==========================================
  // 6. RELIABILITY ENGINE TESTS
  // ==========================================
  const relResult = ReliabilityIntelligenceEngine.calculateReliability(mockPrediction);
  assertCheck(relResult.historicalAccuracy >= 0.5, "Reliability Engine resolves historical accuracy parameter");
  assertCheck(relResult.historicalCalibration > 0.5, "Reliability Engine resolves calibration error index");

  // ==========================================
  // 7. SIMILARITY ENGINE TESTS
  // ==========================================
  const simResult = SimilarityIntelligenceEngine.calculateSimilarity(mockPrediction);
  assertCheck(simResult.nearestNeighbors.length > 0, "Similarity Engine locates nearest-neighbors in dataset");
  assertCheck(simResult.similarityScore >= 0.5 && simResult.similarityScore <= 1.0, "Similarity average index is resolved");
  assertCheck(simResult.clusterAssignment.includes("Cluster"), "Cluster assignment successfully matched");

  // ==========================================
  // 8. QUALITY ENGINE TESTS
  // ==========================================
  const qualResult = QualityIntelligenceEngine.calculateQuality(mockPrediction, agrResult.agreementScore, relResult.historicalAccuracy);
  assertCheck(qualResult.inputCompleteness === 1.0, "Quality Engine resolves perfect input feature completeness");
  assertCheck(qualResult.compositeQualityIndex > 0.5 && qualResult.compositeQualityIndex <= 1.0, "Quality composite index successfully fused");

  // ==========================================
  // 9. RANKING ENGINE TESTS
  // ==========================================
  const mockReport1 = PredictionIntelligenceOrchestrator.generateReport(mockPrediction);
  const mockPrediction2 = {
    ...mockPrediction,
    predictionId: "pred_match_outcome_fixture-test-666_12345",
    entityId: "fixture-test-666",
    finalOutput: {
      ...mockPrediction.finalOutput,
      calibratedProbabilities: { Home: 0.90, Draw: 0.05, Away: 0.05 } // very high certainty
    }
  };
  const mockReport2 = PredictionIntelligenceOrchestrator.generateReport(mockPrediction2);

  const ranked = RankingIntelligenceEngine.rankPredictions([mockReport1, mockReport2]);
  assertCheck(ranked.length === 2, "Ranking Engine processes batch of reports correctly");
  assertCheck(ranked[0].rank === 1 && ranked[1].rank === 2, "Ranks are strictly ordered sequentially starting at 1");
  assertCheck(ranked[0].compositeScore >= ranked[1].compositeScore, "Rank 1 prediction features a higher or equal composite intelligence score");

  // ==========================================
  // 10. EVENT BUS & STORE TESTS
  // ==========================================
  const allEvents = intelligenceEventBus.getAllEvents();
  assertCheck(allEvents.length > 0, "Event Bus publishes events for created intelligence reports");
  
  const createdEvents = allEvents.filter(e => e.eventType === "PredictionCreated");
  assertCheck(createdEvents.length > 0, "PredictionCreated events reside in the event stream");

  const queryReports = intelligenceReportStore.getAllReports();
  assertCheck(queryReports.length >= 2, "Intelligence Report Store tracks and lists created reports");

  logger.info(`================================================================`);
  logger.info(`  PREDICTION INTELLIGENCE TEST SUITE COMPLETED: Passed ${testCount - failCount}/${testCount} assertions`);
  logger.info(`================================================================`);

  if (failCount > 0) {
    throw new Error(`Prediction Intelligence test suite failed with ${failCount} failing checks.`);
  }
}
