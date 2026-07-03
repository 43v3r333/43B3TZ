import { ModelConfidenceMetrics, ModelMetadata } from "../types";

export class ConfidenceEngine {
  /**
   * Calculates detailed confidence parameters for a prediction output.
   */
  public static calculateConfidence(
    calibratedProbs: Record<string, number>,
    model: ModelMetadata,
    features: Record<string, any>,
    agreementScore: number = 0.8,
    modelConsensus: number = 0.8
  ): ModelConfidenceMetrics {
    // 1. Prediction Confidence (determined by how distinct the highest probability is)
    const probVals = Object.values(calibratedProbs);
    const maxProb = Math.max(...probVals);
    const minProb = Math.min(...probVals);
    const predictionConfidence = Math.min(1, Math.max(0, (maxProb - minProb) / (maxProb || 1)));

    // 2. Calibration Confidence (derived from Expected Calibration Error: 1 - ECE)
    const calibrationConfidence = Math.max(0, 1 - model.expectedCalibrationError);

    // 3. Feature Confidence (based on nulls present in the features input)
    const featuresCount = Object.keys(features).length;
    let missingOrNullCount = 0;
    for (const val of Object.values(features)) {
      if (val === null || val === undefined || val === "") missingOrNullCount++;
    }
    const featureConfidence = featuresCount > 0 ? (featuresCount - missingOrNullCount) / featuresCount : 0.5;

    // 4. Data Freshness (decays exponentially based on days since training or feature computation)
    const dataFreshnessScore = Math.max(0, Math.exp(-model.dataFreshnessDays / 7)); // half-life ~5 days

    // 5. Market Confidence (represents relative baseline predictability of the market type)
    const marketWeights: Record<string, number> = {
      match_outcome: 0.85,
      over_under_2_5: 0.8,
      over_under_3_5: 0.75,
      over_under_4_5: 0.7,
      both_teams_to_score: 0.8,
      correct_score: 0.4, // notoriously hard to predict
      double_chance: 0.9,
      draw_no_bet: 0.82,
      asian_handicap: 0.85,
      corners: 0.65,
      cards: 0.6,
      team_goals: 0.75,
      player_markets: 0.55
    };
    const marketConfidence = marketWeights[model.marketType] ?? 0.7;

    // 6. Agreement Score & 7. Model Consensus (passed in from orchestrator/ensemble)
    const sanitizedAgreement = Math.max(0, Math.min(1, agreementScore));
    const sanitizedConsensus = Math.max(0, Math.min(1, modelConsensus));

    // 8. Historical Reliability (weighted combination of the champion's accuracy, F1, and brier score)
    // For Brier: perfect is 0, worst is 2. So reliability = 1 - (brierScore / 2)
    const brierFactor = Math.max(0, 1 - model.brierScore / 2);
    const historicalReliability = model.accuracy * 0.4 + model.f1Score * 0.4 + brierFactor * 0.2;

    // 9. Composite Confidence Score (weighted blend of all the above confidence metrics)
    const compositeScore =
      predictionConfidence * 0.2 +
      calibrationConfidence * 0.15 +
      featureConfidence * 0.15 +
      dataFreshnessScore * 0.1 +
      marketConfidence * 0.1 +
      sanitizedAgreement * 0.1 +
      sanitizedConsensus * 0.1 +
      historicalReliability * 0.1;

    return {
      predictionConfidence,
      calibrationConfidence,
      featureConfidence,
      dataFreshnessScore,
      marketConfidence,
      agreementScore: sanitizedAgreement,
      modelConsensus: sanitizedConsensus,
      historicalReliability,
      compositeScore: Math.max(0, Math.min(1, compositeScore))
    };
  }
}
