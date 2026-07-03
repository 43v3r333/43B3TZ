import { featureEngine, EngineeredFeatureSet } from "./features/featureEngine";
import { predictionModelRegistry } from "./registry/modelRegistry";
import { CalibrationEngine } from "../predictions/calibration/calibrationEngine";
import { ConfidenceEngine } from "../predictions/confidence/confidenceEngine";
import { createLogger } from "../core/logger";

const logger = createLogger("PredictionPipeline");

export interface PipelineStageMetric {
  stageName: string;
  durationMs: number;
  status: "success" | "skipped" | "failed";
  outputKeysCount: number;
  message?: string;
}

export interface PipelineExecutionResult {
  predictionId: string;
  marketType: string;
  entityId: string;
  finalProbabilities: Record<string, number>;
  finalConfidence: any;
  kellyStakePercentage: number;
  featuresSnapshot: Record<string, any>;
  riskMetrics: {
    volatility: number;
    drawdownRisk: number;
    kellyMultiplier: number;
    suggestedMaxStakeUsd: number;
  };
  recommendation: {
    recommendedOutcome: string;
    triggerOddsThreshold: number;
    expectedValue: number;
    actionableBetSignal: "STRONG_BUY" | "BUY" | "HOLD" | "AVOID";
  };
  stagesHistory: Record<string, PipelineStageMetric>;
  totalPipelineDurationMs: number;
}

export class PredictionPipeline {
  /**
   * Main entry point to run the entire 13-stage AI sports prediction pipeline
   */
  public async executePipeline(
    entityId: string,
    marketType: string,
    rawTelemetry: Record<string, any>,
    bankrollUsd: number = 10000,
    bookmakerOdds: Record<string, number> = { Home: 1.95, Draw: 3.4, Away: 3.8 }
  ): Promise<PipelineExecutionResult> {
    const pipelineStartTime = Date.now();
    const predictionId = `pred_pipe_${marketType}_${entityId}_${Date.now()}`;
    logger.info(`Initiating end-to-end Prediction Pipeline: Prediction ID: ${predictionId}`);

    const stages: Record<string, PipelineStageMetric> = {};

    // STAGE 1: DATA COLLECTION
    const s1Start = Date.now();
    const collectionData: any = { ...rawTelemetry, matchId: entityId };
    stages["Data Collection"] = {
      stageName: "Data Collection",
      durationMs: Date.now() - s1Start,
      status: "success",
      outputKeysCount: Object.keys(collectionData).length,
    };

    // STAGE 2: VALIDATION
    const s2Start = Date.now();
    const hasRequired = collectionData.homePastResults && collectionData.awayPastResults;
    stages["Validation"] = {
      stageName: "Validation",
      durationMs: Date.now() - s2Start,
      status: hasRequired ? "success" : "failed",
      outputKeysCount: 1,
      message: hasRequired ? "Telemetry validation passed" : "Using fallback baseline profiles",
    };

    // STAGE 3: CLEANING
    const s3Start = Date.now();
    const cleanedData = this.cleanTelemetry(collectionData);
    stages["Cleaning"] = {
      stageName: "Cleaning",
      durationMs: Date.now() - s3Start,
      status: "success",
      outputKeysCount: Object.keys(cleanedData).length,
    };

    // STAGE 4: FEATURE ENGINEERING
    const s4Start = Date.now();
    const featureSet: EngineeredFeatureSet = featureEngine.generateFeatures(cleanedData);
    stages["Feature Engineering"] = {
      stageName: "Feature Engineering",
      durationMs: Date.now() - s4Start,
      status: "success",
      outputKeysCount: Object.keys(featureSet.features).length,
    };

    // STAGE 5: FEATURE SELECTION
    const s5Start = Date.now();
    // In our FeatureEngine we already filtered based on importanceScore >= 0.4. Let's record this count
    stages["Feature Selection"] = {
      stageName: "Feature Selection",
      durationMs: Date.now() - s5Start,
      status: "success",
      outputKeysCount: Object.keys(featureSet.features).length,
      message: `Selected features based on importance threshold. Active features: ${Object.keys(featureSet.features).join(", ")}`,
    };

    // STAGE 6: MODEL SELECTION
    const s6Start = Date.now();
    // Select the best champion model from registry for the market
    const modelMeta = predictionModelRegistry.getModelByRole(marketType as any, "champion") || 
                      predictionModelRegistry.getAllModels().find(m => m.marketType === marketType) ||
                      predictionModelRegistry.getAllModels()[0];
    stages["Model Selection"] = {
      stageName: "Model Selection",
      durationMs: Date.now() - s6Start,
      status: modelMeta ? "success" : "failed",
      outputKeysCount: modelMeta ? 1 : 0,
      message: `Selected model ID: ${modelMeta?.modelId || "none"}`,
    };

    // STAGE 7: INFERENCE
    const s7Start = Date.now();
    // Simulate inference output using selected model's default features or custom logits
    const rawProbs = this.runModelInference(featureSet.features, marketType);
    stages["Inference"] = {
      stageName: "Inference",
      durationMs: Date.now() - s7Start,
      status: "success",
      outputKeysCount: Object.keys(rawProbs).length,
    };

    // STAGE 8: CONFIDENCE CALIBRATION
    const s8Start = Date.now();
    // Platt scaling
    const calibratedProbs = CalibrationEngine.processProbabilityOutput(
      rawProbs,
      "platt_scaling",
      { slope: -1.05, intercept: 0.02 }
    );
    stages["Confidence Calibration"] = {
      stageName: "Confidence Calibration",
      durationMs: Date.now() - s8Start,
      status: "success",
      outputKeysCount: Object.keys(calibratedProbs.calibratedProbabilities).length,
    };

    // STAGE 9: RISK ANALYSIS
    const s9Start = Date.now();
    const entropy = calibratedProbs.entropy;
    const volatility = Math.max(0.05, 1 - calibratedProbs.reliability);
    const drawdownRisk = entropy * 0.45;
    stages["Risk Analysis"] = {
      stageName: "Risk Analysis",
      durationMs: Date.now() - s9Start,
      status: "success",
      outputKeysCount: 3,
    };

    // STAGE 10: KELLY OPTIMIZATION
    const s10Start = Date.now();
    const kellyMultiplier = 0.25; // fractional Kelly of 1/4 to minimize risk
    const recommendedOutcome = this.selectRecommendedOutcome(calibratedProbs.calibratedProbabilities);
    const impliedProb = calibratedProbs.calibratedProbabilities[recommendedOutcome] || 0.4;
    const decimalOdds = bookmakerOdds[recommendedOutcome] || 2.0;

    // Standard Kelly: f* = (bp - q) / b = (odds * prob - 1) / (odds - 1)
    const b = decimalOdds - 1;
    const p = impliedProb;
    const q = 1 - p;
    const rawKelly = b > 0 ? (b * p - q) / b : 0;
    const kellyStakePercentage = Math.min(0.05, Math.max(0, rawKelly * kellyMultiplier));

    stages["Kelly Optimization"] = {
      stageName: "Kelly Optimization",
      durationMs: Date.now() - s10Start,
      status: "success",
      outputKeysCount: 1,
      message: `Raw Kelly: ${(rawKelly * 100).toFixed(2)}% | Scaled Stake: ${(kellyStakePercentage * 100).toFixed(2)}%`,
    };

    // STAGE 11: RECOMMENDATION
    const s11Start = Date.now();
    const expectedValue = impliedProb * decimalOdds - 1;
    let betSignal: "STRONG_BUY" | "BUY" | "HOLD" | "AVOID" = "AVOID";
    if (expectedValue > 0.1 && kellyStakePercentage > 0.04) betSignal = "STRONG_BUY";
    else if (expectedValue > 0.02 && kellyStakePercentage > 0.01) betSignal = "BUY";
    else if (expectedValue > -0.05) betSignal = "HOLD";

    stages["Recommendation"] = {
      stageName: "Recommendation",
      durationMs: Date.now() - s11Start,
      status: "success",
      outputKeysCount: 4,
    };

    // Note: STAGE 12: POST-MATCH EVALUATION and STAGE 13: CONTINUOUS LEARNING are asynchronous, triggered after the match completes. Let's record them as "skipped" for initial inference, and implement them in Phase 11.
    stages["Post-Match Evaluation"] = {
      stageName: "Post-Match Evaluation",
      durationMs: 0,
      status: "skipped",
      outputKeysCount: 0,
      message: "Pending fixture completion and result ingestion",
    };

    stages["Continuous Learning"] = {
      stageName: "Continuous Learning",
      durationMs: 0,
      status: "skipped",
      outputKeysCount: 0,
    };

    const finalConfidence = ConfidenceEngine.calculateConfidence(
      calibratedProbs.calibratedProbabilities,
      modelMeta || ({} as any),
      featureSet.features
    );

    const totalPipelineDurationMs = Date.now() - pipelineStartTime;

    return {
      predictionId,
      marketType,
      entityId,
      finalProbabilities: calibratedProbs.calibratedProbabilities,
      finalConfidence,
      kellyStakePercentage,
      featuresSnapshot: featureSet.features,
      riskMetrics: {
        volatility,
        drawdownRisk,
        kellyMultiplier,
        suggestedMaxStakeUsd: bankrollUsd * kellyStakePercentage,
      },
      recommendation: {
        recommendedOutcome,
        triggerOddsThreshold: 1 / impliedProb,
        expectedValue,
        actionableBetSignal: betSignal,
      },
      stagesHistory: stages,
      totalPipelineDurationMs,
    };
  }

  private cleanTelemetry(raw: Record<string, any>): Record<string, any> {
    const cleaned = { ...raw };
    // Impute missing values
    if (cleaned.homeElo === undefined) cleaned.homeElo = 1500;
    if (cleaned.awayElo === undefined) cleaned.awayElo = 1500;
    if (cleaned.homeRestDays === undefined) cleaned.homeRestDays = 5;
    if (cleaned.awayRestDays === undefined) cleaned.awayRestDays = 5;
    return cleaned;
  }

  private runModelInference(features: Record<string, any>, marketType: string): Record<string, number> {
    const eloDiff = features["feat_elo_rating_diff"] || 0;
    const formDiff = features["feat_team_form"] || 0;
    const xgDiff = features["feat_expected_goals_diff"] || 0;

    if (marketType === "match_outcome") {
      const homeLogit = 0.3 + (eloDiff / 350) + (formDiff * 0.4) + (xgDiff * 0.5);
      const drawLogit = -0.35 - Math.abs(eloDiff / 750);
      const awayLogit = -(eloDiff / 350) - (formDiff * 0.4) - (xgDiff * 0.5);

      const sum = Math.exp(homeLogit) + Math.exp(drawLogit) + Math.exp(awayLogit);
      return {
        Home: Math.exp(homeLogit) / sum,
        Draw: Math.exp(drawLogit) / sum,
        Away: Math.exp(awayLogit) / sum,
      };
    } else if (marketType === "both_teams_to_score") {
      const yesLogit = 0.25 + xgDiff * 0.4 + (features["feat_shots_on_target_diff"] || 0) * 0.1;
      const noLogit = -yesLogit;
      const sum = Math.exp(yesLogit) + Math.exp(noLogit);
      return {
        Yes: Math.exp(yesLogit) / sum,
        No: Math.exp(noLogit) / sum,
      };
    } else {
      // General binary outcomes (e.g. Over 2.5 / Under 2.5)
      const overLogit = 0.1 + (features["feat_shots_differential"] || 0) * 0.05 + xgDiff * 0.3;
      const underLogit = -overLogit;
      const sum = Math.exp(overLogit) + Math.exp(underLogit);
      return {
        Over: Math.exp(overLogit) / sum,
        Under: Math.exp(underLogit) / sum,
      };
    }
  }

  private selectRecommendedOutcome(probs: Record<string, number>): string {
    let bestOutcome = "";
    let bestProb = -1;
    for (const out of Object.keys(probs)) {
      if (probs[out] > bestProb) {
        bestProb = probs[out];
        bestOutcome = out;
      }
    }
    return bestOutcome;
  }
}

export const predictionPipeline = new PredictionPipeline();
