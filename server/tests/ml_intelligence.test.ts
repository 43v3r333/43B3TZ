import { predictionModelRegistry } from "../predictions/registry/modelRegistry";
import { featureEngine } from "../predictions/features/featureEngine";
import { promptRegistry } from "../ai/registry";
import { modelEvaluationEngine } from "../predictions/evaluation/evaluationEngine";
import { CalibrationEngine } from "../predictions/calibration/calibrationEngine";
import { backtestingPlatform } from "../predictions/backtesting/backtestPlatform";
import { predictionPipeline } from "../predictions/pipeline";
import { createLogger } from "../core/logger";

const logger = createLogger("MLIntelligenceTests");

let testCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string) {
  testCount++;
  if (condition) {
    logger.info(`   [PASSED] ${name}`);
  } else {
    failCount++;
    logger.error(`   [FAILED ASSERTION] ${name} (Value was false)`);
  }
}

export async function runMlIntelligenceTestSuite() {
  logger.info("Executing Enterprise AI & ML Intelligence High-Assurance Test Suite...");

  // --- 1. MODEL TESTS ---
  logger.info("1. Running Model Tests...");
  const allModels = predictionModelRegistry.getAllModels();
  assert(allModels.length > 0, "Model registry successfully loaded baseline models.");
  const championModel = predictionModelRegistry.getModelByRole("match_outcome", "champion");
  assert(championModel !== undefined, "Champion model is active and queryable for match outcomes.");
  assert(championModel?.healthStatus === "healthy", "Active champion model status is graded healthy.");

  // --- 2. FEATURE TESTS ---
  logger.info("2. Running Feature Tests...");
  const rawTelemetry = {
    matchId: "test-fixture-1",
    homePastResults: ["W", "W", "D", "L", "W"],
    awayPastResults: ["L", "D", "L", "W", "D"],
    homeElo: 1600,
    awayElo: 1450,
    homeAvgXG: 1.9,
    awayAvgXGConceded: 1.1,
    weatherCondition: "Heavy Rain",
    homeHealthyStarters: 10,
    homeInjuryCount: 2,
    openingOddsHome: 2.0,
    closingOddsHome: 1.85,
    oddsDriftHomeSpeed: 0.03,
  };

  const engineered = featureEngine.generateFeatures(rawTelemetry);
  assert(engineered.features["feat_elo_rating_diff"] === 150, "ELO rating differential is calculated correctly (+150).");
  assert(engineered.features["feat_team_form"] > 0, "Team form differential correctly favors the home team.");
  assert(engineered.metadata["feat_elo_rating_diff"].importanceScore === 0.95, "ELO Differential feature has a high importance score metadata of 0.95.");

  // --- 3. PROMPT TESTS ---
  logger.info("3. Running Prompt Tests...");
  const explainPrompt = promptRegistry.getPrompt("explainable_prediction");
  assert(explainPrompt !== undefined, "Explainable prediction prompt is registered and fetchable.");
  
  // Verify Immutability
  let promptOverwriteThrew = false;
  try {
    promptRegistry.registerPrompt({
      id: "explainable_prediction",
      version: "1.0.0", // Duplicate version
      author: "hacker",
      purpose: "illegal overwrite",
      template: "hacked template",
      evaluationScore: 0,
      lastModified: new Date().toISOString(),
      isActive: true,
    });
  } catch (err) {
    promptOverwriteThrew = true;
  }
  assert(promptOverwriteThrew, "Prompt Registry blocks overwrite attempts on registered prompt versions.");

  // Verify A/B Testing Routing
  const promptA = promptRegistry.getABPrompt("explainable_prediction", "user_session_id_102");
  const promptB = promptRegistry.getABPrompt("explainable_prediction", "user_session_id_103");
  assert(promptA !== undefined && promptB !== undefined, "A/B Testing routing serves valid prompts for different seeds.");

  // --- 4. EVALUATION TESTS ---
  logger.info("4. Running Evaluation Tests...");
  const simulatedPredictions = [
    { probabilities: { Home: 0.6, Draw: 0.2, Away: 0.2 }, predictedOutcome: "Home", actualOutcome: "Home" },
    { probabilities: { Home: 0.7, Draw: 0.15, Away: 0.15 }, predictedOutcome: "Home", actualOutcome: "Away" },
    { probabilities: { Home: 0.3, Draw: 0.3, Away: 0.4 }, predictedOutcome: "Away", actualOutcome: "Away" },
  ];
  const simulatedBets = [
    { stakeUsd: 100, profitUsd: 95, odds: 1.95, closingOdds: 1.85, won: true },
    { stakeUsd: 100, profitUsd: -100, odds: 2.1, closingOdds: 2.2, won: false },
    { stakeUsd: 100, profitUsd: 120, odds: 2.2, closingOdds: 2.15, won: true },
  ];

  const evalMetrics = modelEvaluationEngine.evaluateModel(simulatedPredictions, simulatedBets);
  assert(evalMetrics.accuracy > 0.6, "Evaluation engine correctly calculates prediction accuracy.");
  assert(evalMetrics.brierScore > 0, "Evaluation engine calculates non-zero Brier Score.");
  assert(evalMetrics.roi > 0, "Evaluation engine calculates correct betting return ROI.");
  assert(evalMetrics.expectedCalibrationError < 0.65, "Evaluation engine computes Expected Calibration Error (ECE) within bound limits.");

  // --- 5. CALIBRATION TESTS ---
  logger.info("5. Running Calibration Tests...");
  const rawProbs = { Home: 0.7, Draw: 0.15, Away: 0.15 };
  const calibrated = CalibrationEngine.processProbabilityOutput(rawProbs, "platt_scaling", { slope: -1.0, intercept: 0.0 });
  assert(calibrated.calibratedProbabilities.Home > 0, "Calibration engine maps probabilities cleanly.");
  assert(calibrated.reliability > 0.6, "Calibration reliability metric computed successfully.");

  // --- 6. BACKTESTING TESTS ---
  logger.info("6. Running Backtesting Tests...");
  const backtestReport = await backtestingPlatform.runBacktest({
    league: "Premier League",
    season: "2025/2026",
    initialBankroll: 10000,
    fractionalKelly: 0.25,
    minExpectedValue: 0.02,
  });

  assert(backtestReport.totalBetsPlaced > 0, "Backtesting platform replays season and places simulated bets successfully.");
  assert(backtestReport.timeline.length === 15, "Backtesting replayed the correct number of matches (15).");
  assert(backtestReport.finalBankroll > 0, "Backtesting generates non-negative final bankroll balance.");

  // --- 7. SIMULATION & KELLY SIZING TESTS ---
  logger.info("7. Running Simulation & Kelly Sizing Tests...");
  const pipeRes = await predictionPipeline.executePipeline("fixture-sim-1", "match_outcome", rawTelemetry, 10000);
  assert(pipeRes.kellyStakePercentage >= 0 && pipeRes.kellyStakePercentage <= 0.05, "Fractional Kelly size limits individual allocations safely within conservative bounds (<=5%).");

  // --- 8. STRESS TESTS ---
  logger.info("8. Running Stress Tests under Empty/Heavy Data...");
  let emptyStatsThrew = false;
  try {
    const emptyEngineResult = await predictionPipeline.executePipeline("fixture-stress-1", "match_outcome", {});
    assert(emptyEngineResult.finalProbabilities.Home > 0, "Pipeline gracefully handles empty or partially missing telemetry with robust default imputations.");
  } catch (err) {
    emptyStatsThrew = true;
  }
  assert(!emptyStatsThrew, "Pipeline is resilient and does not crash when telemetry is completely omitted.");

  logger.info(`ML Intelligence Test Suite finished. Failures: ${failCount}/${testCount}`);
  if (failCount > 0) {
    throw new Error(`AI & ML Intelligence tests encountered ${failCount} failing assertions.`);
  }
}
