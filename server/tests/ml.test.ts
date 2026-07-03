import { featureStore } from "../ml/feature-store/featureStore";
import { datasetBuilder } from "../ml/dataset-builder/datasetBuilder";
import { calibrationEngine } from "../ml/calibration/calibration";
import { evaluationEngine } from "../ml/evaluation/evaluation";
import { modelRegistry } from "../ml/registry/modelRegistry";
import { experimentTracker } from "../ml/experiments/experimentTracker";
import { driftDetector } from "../ml/drift/driftDetector";
import { explainabilityEngine } from "../ml/explainability/explainability";
import { trainingPipeline, inferencePlatform } from "../ml/training/trainingPipeline";
import { etlStorage } from "../etl/storage/storage";
import { createLogger } from "../core/logger";

const logger = createLogger("MLTestSuite");

let mlTestCount = 0;
let mlFailCount = 0;

function mlAssert(condition: boolean, name: string) {
  mlTestCount++;
  if (condition) {
    logger.info(`✅ [MLOps-TEST] PASS: ${name}`);
  } else {
    mlFailCount++;
    logger.error(`❌ [MLOps-TEST] FAIL: ${name}`);
  }
}

export async function runMLTestSuite() {
  logger.info("Initializing Enterprise MLOps Platform Test Suite...");

  // Reset stores to guarantee sandboxed test execution
  featureStore.clearAll();
  datasetBuilder.clearAll();
  modelRegistry.clearAll();
  experimentTracker.clearAll();

  // ==========================================
  // 1. FEATURE REGISTRY & FEATURE STORE TESTS
  // ==========================================
  const rawFeatures = featureStore.getAllFeatureDefinitions();
  mlAssert(rawFeatures.length >= 5, "Feature Store boots with core baseline feature definitions");

  // Ingest a feature value and verify temporal point-in-time lookup
  const t0 = "2026-07-01T08:00:00.000Z";
  const t1 = "2026-07-01T08:15:00.000Z";
  const t2 = "2026-07-01T08:30:00.000Z";

  featureStore.ingestFeatureValue("team-test-1", "feat_elo_rating", 1500, t0);
  featureStore.ingestFeatureValue("team-test-1", "feat_elo_rating", 1525, t2);

  // PIT Query tests
  const valAtT0 = featureStore.getFeatureValueAtTime("team-test-1", "feat_elo_rating", t0);
  mlAssert(valAtT0 === 1500, "Point-in-Time retrieval resolves correct value at precise timestamp");

  const valAtT1 = featureStore.getFeatureValueAtTime("team-test-1", "feat_elo_rating", t1);
  mlAssert(valAtT1 === 1500, "Point-in-Time retrieval resolves latest historical value (no future leak)");

  const valAtT2 = featureStore.getFeatureValueAtTime("team-test-1", "feat_elo_rating", t2);
  mlAssert(valAtT2 === 1525, "Point-in-Time retrieval resolves updated value at later timestamp");

  // Online low-latency lookup
  const onlineVal = featureStore.getFeatureValueOnline("team-test-1", "feat_elo_rating");
  mlAssert(onlineVal === 1525, "Online low-latency cache resolves the absolute latest feature value");


  // ==========================================
  // 2. DATASET BUILDER & SPLITS TESTS
  // ==========================================
  // Pre-seed some fixtures
  etlStorage.clearAll();
  for (let i = 1; i <= 10; i++) {
    const time = new Date(Date.now() - (11 - i) * 60 * 60 * 1000).toISOString();
    etlStorage.saveCurated("fixture", `fix-val-${i}`, {
      curatedId: `fix-val-${i}`,
      entityType: "fixture",
      data: {
        fixtureId: `fix-val-${i}`,
        kickoff: time,
        homeTeam: { teamId: "team-test-1" },
        awayTeam: { teamId: "team-test-2" },
        homeScore: i % 2 === 0 ? 2 : 1,
        awayScore: 1
      },
      enrichment: {},
      qualityScore: 95,
      version: 1,
      updatedAt: new Date().toISOString(),
      ingestionChain: ["UnitTesting"]
    });
    // Ingest ELO at each kickoff to ensure dataset builder can pull it
    featureStore.ingestFeatureValue("team-test-1", "feat_elo_rating", 1500 + i * 5, time);
  }

  const ds = datasetBuilder.buildDataset("Test_Train_Split", "train", ["feat_elo_rating"], "chronological", {
    chronologicalSplitRatio: { train: 0.6, val: 0.2, test: 0.2 }
  });

  mlAssert(ds.datasetId.startsWith("ds_"), "Dataset builder generates structured dataset ID");
  mlAssert(ds.allRows.length === 10, "Dataset rows compile correctly from curated ETL fixtures");
  mlAssert(ds.train?.length === 6, "Chronological train subset resolves exact percentage length");
  mlAssert(ds.val?.length === 2, "Chronological validation subset resolves exact percentage length");
  mlAssert(ds.test?.length === 2, "Chronological test subset resolves exact percentage length");


  // ==========================================
  // 3. CALIBRATION METRICS ENGINE TESTS
  // ==========================================
  const rawPredictions = [0.12, 0.28, 0.61, 0.82, 0.95];
  const testActuals = [0, 0, 1, 1, 1];

  const calResult = calibrationEngine.evaluateCalibration(rawPredictions, testActuals, 5);
  mlAssert(calResult.expectedCalibrationError < 0.25, "Expected Calibration Error (ECE) is correctly calculated");
  mlAssert(calResult.maximumCalibrationError >= 0, "Maximum Calibration Error (MCE) is populated");
  mlAssert(calResult.brierScore < 0.15, "Brier score computes correctly over test probabilities");

  // Platt Scaling verification
  const plattP = calibrationEngine.plattScale(0.5, -1.2, 0.1);
  mlAssert(plattP > 0 && plattP < 1, "Platt Scaling correctly translates logit space back to [0,1]");

  // Isotonic Scaling verification
  const thresholds = [
    { x: 0.0, y: 0.05 },
    { x: 0.5, y: 0.45 },
    { x: 1.0, y: 0.95 }
  ];
  const isotonicP = calibrationEngine.isotonicScale(0.5, thresholds);
  mlAssert(isotonicP === 0.45, "Isotonic Regression applies piecewise threshold mapping correctly");

  // Threshold optimizer
  const opt = calibrationEngine.optimizeThreshold(rawPredictions, testActuals);
  mlAssert(opt.optimalThreshold >= 0.1 && opt.optimalThreshold <= 0.9, "Threshold optimizer completes and yields valid threshold bounds");


  // ==========================================
  // 4. PERFORMANCE EVALUATION ENGINE TESTS
  // ==========================================
  const featureImportance = { feat_elo_rating: 0.6, feat_form_momentum: 0.4 };
  const evaluation = evaluationEngine.evaluate(
    rawPredictions,
    testActuals,
    featureImportance,
    45 // duration in ms
  );

  mlAssert(evaluation.accuracy === 1.0, "Evaluation Engine computes perfect accuracy when predictions match actual targets");
  mlAssert(evaluation.f1 === 1.0, "F1 score computes perfectly for perfect classification");
  mlAssert(evaluation.rocAuc === 1.0, "ROC AUC correctly identifies perfect ordering of prediction scores");
  mlAssert(evaluation.prAuc === 1.0, "Precision-Recall AUC computes correctly");
  mlAssert(evaluation.sharpeRatio >= 0.0, "Sharpe ratio is successfully computed over cumulative balance timeline");
  mlAssert(evaluation.maxDrawdown === 0.0, "Max drawdown is zero for non-losing betting simulations");


  // ==========================================
  // 5. EXPERIMENT TRACKER TESTS
  // ==========================================
  const exp = experimentTracker.createExperiment(
    "Unit_Testing_Experiment",
    ds.datasetId,
    "feat_v1",
    "model_v1_lgbm",
    { max_depth: 6, lr: 0.05 },
    { accuracy: 0.85, logLoss: 0.35 },
    120, // duration
    "Fitted using default tree counts"
  );

  mlAssert(exp.experimentId.startsWith("exp_"), "Experiment tracker registers structured experiment record");
  mlAssert(experimentTracker.getAllExperiments().length === 1, "Experiment tracker correctly lists registered experiments");


  // ==========================================
  // 6. DRIFT MONITORING TESTS
  // ==========================================
  const baselineDistribution = [0.1, 0.2, 0.1, 0.3, 0.2, 0.1];
  const shiftedDistribution = [0.8, 0.9, 0.75, 0.85, 0.9, 0.85]; // Heavy drift
  
  const driftCheckStable = driftDetector.calculatePSI(baselineDistribution, baselineDistribution);
  mlAssert(driftCheckStable.psi < 0.1, "Drift Detector correctly marks identical distributions as stable (PSI < 0.1)");

  const driftCheckShifted = driftDetector.calculatePSI(baselineDistribution, shiftedDistribution);
  mlAssert(driftCheckShifted.psi >= 0.25, "Drift Detector flags heavily shifted distributions as critical (PSI >= 0.25)");


  // ==========================================
  // 7. MODEL EXPLAINABILITY TESTS
  // ==========================================
  const features = { feat_elo_rating: 1550, feat_form_momentum: 75 };
  const baseline = { feat_elo_rating: 1500, feat_form_momentum: 50 };

  const localExplanation = explainabilityEngine.generateLocalExplanation(
    "team-test-1",
    "pred-unit-1",
    features,
    baseline,
    0.78
  );

  mlAssert(Object.keys(localExplanation.shapValues).includes("feat_elo_rating"), "SHAP local explainability generates attributions for all active features");
  mlAssert(localExplanation.predictionExplanation.includes("feat_elo"), "Textual explanation mentions the primary driver feature");


  // ==========================================
  // 8. TRAINING PIPELINE & INFERENCE TESTS
  // ==========================================
  const trainedModel = trainingPipeline.runTraining(
    "Test_Model_Run",
    "lightgbm",
    ["feat_elo_rating"]
  );

  mlAssert(trainedModel.modelId.startsWith("model_"), "Pipeline execution compiles and outputs registered model version");
  
  // Register and approve model for champion/challenger checks
  modelRegistry.updateApprovalStatus(trainedModel.modelId, "approved", "Fitted model passed integration parameters.");
  modelRegistry.promoteToChampion(trainedModel.modelId, "ADMIN_UNIT_TEST");

  const champ = modelRegistry.getChampion("lightgbm");
  mlAssert(champ?.modelId === trainedModel.modelId, "Model Registry correctly stores and resolves Champion model versions");

  // Perform Online Inference
  // Pre-seed low-latency online cache
  featureStore.ingestFeatureValue("team-test-1", "feat_elo_rating", 1580, new Date().toISOString());
  
  const inferenceRes = inferencePlatform.predictOnline({
    modelId: trainedModel.modelId,
    version: "1.0.0",
    entityId: "team-test-1",
    features: {},
    timestamp: new Date().toISOString()
  });

  mlAssert(inferenceRes.predictionId.startsWith("pred_"), "Inference platform processes explainable online request");
  mlAssert(inferenceRes.probability! >= 0 && inferenceRes.probability! <= 1, "Inference returns valid probability bounds");
  mlAssert(inferenceRes.explanation !== undefined, "Inference response embeds rich local explanation metadata");

  logger.info(`================================================================`);
  logger.info(`  MLOPS TEST SUITE COMPLETED: Passed ${mlTestCount - mlFailCount}/${mlTestCount} assertions`);
  logger.info(`================================================================`);

  if (mlFailCount > 0) {
    throw new Error(`MLOps test suite failed with ${mlFailCount} failing checks.`);
  }
}
