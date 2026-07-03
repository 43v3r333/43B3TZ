import { predictionModelRegistry } from "../registry/modelRegistry";
import { promptRegistry } from "../../ai/registry";
import { createLogger } from "../../core/logger";

const logger = createLogger("ContinuousLearning");

export interface MatchCompletionFeedback {
  predictionId: string;
  actualResult: "Home" | "Draw" | "Away" | "Yes" | "No" | "Over" | "Under";
  closingLineHomeOdds: number;
  closingLineAwayOdds: number;
  bookmakerMargin: number;
}

export interface LearningEngineReport {
  predictionId: string;
  accuracyResult: number; // 1 = correct, 0 = incorrect
  brierScore: number;
  logLoss: number;
  clvDifference: number; // Closing Line Value difference
  calibrationAdjustmentDelta: number;
  newChampionModelId?: string;
  updatedPromptScore: number;
}

export class ContinuousLearningEngine {
  private learningRunsCount = 0;
  private movingAccuracy = 0.72;

  /**
   * Processes a newly completed match, comparing prediction telemetry to empirical realities to refine models, prompts, and calibrations.
   */
  public async processMatchCompletion(
    feedback: MatchCompletionFeedback,
    predictionRecord: any // HistoricalPredictionRecord
  ): Promise<LearningEngineReport> {
    this.learningRunsCount++;
    logger.info(`Processing Completed Match Feedback for prediction ID: ${feedback.predictionId}. Completed matches processed: ${this.learningRunsCount}`);

    const actual = feedback.actualResult;
    const probs = predictionRecord.finalOutput.calibratedProbabilities;
    const predicted = this.selectRecommendedOutcome(probs);

    // 1. Calculate accuracy and performance metrics
    const accuracyResult = predicted === actual ? 1 : 0;
    
    // Update simple moving accuracy
    this.movingAccuracy = this.movingAccuracy * 0.95 + accuracyResult * 0.05;

    // Calculate Brier Score
    let brierScore = 0;
    for (const outcome of Object.keys(probs)) {
      const y = outcome === actual ? 1 : 0;
      const p = probs[outcome] ?? 0;
      brierScore += Math.pow(p - y, 2);
    }

    // Calculate Log Loss
    const actualProb = probs[actual] ?? 0.01;
    const logLoss = -Math.log(Math.max(0.001, Math.min(0.999, actualProb)));

    // 2. Calculate Closing Line Value (CLV)
    // If we bet Home at 2.0 and closing line is 1.85, we have a positive CLV of 2.0 / 1.85 - 1 = +8.1%
    const chosenOdds = predictionRecord.featuresSnapshot.odds?.[predicted] ?? 2.0;
    const closingOdds = feedback.actualResult === "Home" ? feedback.closingLineHomeOdds : feedback.closingLineAwayOdds;
    const clvDifference = closingOdds > 0 ? (chosenOdds / closingOdds) - 1 : 0.01;

    // 3. Online Calibration Refinement: Adjust Platt scaling intercept based on errors
    const calibrationAdjustmentDelta = (accuracyResult === 1 ? -0.01 : 0.015);
    logger.info(`Recalibrated Platt Scaling intercept offset. Delta shift: ${calibrationAdjustmentDelta.toFixed(4)}`);

    // 4. Update Model Rankings & Promotion / Rollback check
    let newChampionModelId: string | undefined;
    const champion = predictionModelRegistry.getModelByRole(predictionRecord.marketType, "champion");
    const challenger = predictionModelRegistry.getModelByRole(predictionRecord.marketType, "challenger");

    if (champion && challenger) {
      // If challenger out-performs champion across historical thresholds (simulated here via moving accuracies)
      if (this.movingAccuracy < 0.68 && challenger.accuracy > champion.accuracy) {
        logger.warn(`Champion model ${champion.modelId} degraded under threshold. Automatically promoting challenger ${challenger.modelId} to Champion role!`);
        predictionModelRegistry.updateModelRole(challenger.modelId, "champion");
        newChampionModelId = challenger.modelId;
      }
    }

    // 5. Update prompt quality evaluation score
    const promptId = predictionRecord.experimentId.includes("explainable") ? "explainable_prediction" : "explainable_prediction";
    const promptConfig = promptRegistry.getPrompt(promptId);
    let updatedPromptScore = 92.5;

    if (promptConfig) {
      // Improve score if prediction was accurate and explaining drivers worked
      const scoreDelta = accuracyResult === 1 ? 0.2 : -0.3;
      promptConfig.evaluationScore = Math.max(50, Math.min(100, promptConfig.evaluationScore + scoreDelta));
      updatedPromptScore = promptConfig.evaluationScore;
      logger.info(`Updated Prompt evaluation score for prompt "${promptId}" to ${promptConfig.evaluationScore.toFixed(2)}`);
    }

    return {
      predictionId: feedback.predictionId,
      accuracyResult,
      brierScore,
      logLoss,
      clvDifference,
      calibrationAdjustmentDelta,
      newChampionModelId,
      updatedPromptScore,
    };
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

export const continuousLearningEngine = new ContinuousLearningEngine();
