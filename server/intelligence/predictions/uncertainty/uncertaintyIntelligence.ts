import { PredictionFactoryResponse } from "../../../predictions/types";
import { UncertaintyIntelligence } from "../types";

export class UncertaintyIntelligenceEngine {
  public static calculateUncertainty(prediction: PredictionFactoryResponse): UncertaintyIntelligence {
    const probs = prediction.finalOutput.calibratedProbabilities;
    const values = Object.values(probs);
    const N = values.length;

    // 1. Shannon Entropy
    let entropy = 0;
    values.forEach(p => {
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    });

    // 2. Variance across probability choices
    const meanProb = 1 / N;
    let variance = 0;
    values.forEach(p => {
      variance += Math.pow(p - meanProb, 2);
    });
    variance = variance / N;

    // 3. Expected Uncertainty (Normalized entropy to [0,1])
    const maxEntropy = Math.log2(N);
    const expectedUncertainty = maxEntropy > 0 ? entropy / maxEntropy : 0;

    // 4. Out-of-Distribution (OOD) Checks
    // We look at the features snapshot to see if values are in extreme ranges
    const features = prediction.featuresSnapshot ?? {};
    let oodScore = 0;
    let extremeFeaturesCount = 0;

    if (features.feat_elo_rating_diff !== undefined) {
      const elo = Math.abs(features.feat_elo_rating_diff);
      if (elo > 200) {
        extremeFeaturesCount++;
        oodScore += 0.35;
      }
    }
    if (features.feat_form_momentum !== undefined) {
      const mom = features.feat_form_momentum;
      if (mom < 0.2 || mom > 0.85) {
        extremeFeaturesCount++;
        oodScore += 0.25;
      }
    }
    if (features.feat_xg_differential !== undefined) {
      const xg = Math.abs(features.feat_xg_differential);
      if (xg > 1.5) {
        extremeFeaturesCount++;
        oodScore += 0.25;
      }
    }

    oodScore = Math.min(1.0, oodScore);
    const outOfDistributionIndicator = oodScore > 0.5;

    // 5. Epistemic (model) vs Aleatoric (data) uncertainty
    // Aleatoric is driven by pure statistical balance (entropy). If entropy is high, data-level uncertainty is high.
    const aleatoricUncertainty = expectedUncertainty;

    // Epistemic is model deficiency, higher if OOD score is high or if feature completeness is low.
    const rawCompleteness = prediction.finalConfidence?.featureConfidence ?? 1.0;
    const epistemicUncertainty = Math.min(1.0, (1 - rawCompleteness) * 0.6 + oodScore * 0.4);

    // 6. Confidence Intervals (for each outcome, estimated standard error)
    const confidenceIntervals: Record<string, { lower: number; upper: number }> = {};
    Object.entries(probs).forEach(([outcome, prob]) => {
      // Standard error of proportion: SE = sqrt( p * (1-p) / sample_size_estimated_to_100 )
      const se = Math.sqrt((prob * (1 - prob)) / 100);
      // 95% confidence interval (z = 1.96)
      confidenceIntervals[outcome] = {
        lower: Math.max(0, prob - 1.96 * se),
        upper: Math.min(1, prob + 1.96 * se)
      };
    });

    // 7. Risk Band Assessment
    let riskBand: "low" | "medium" | "high" = "medium";
    if (entropy < maxEntropy * 0.4 && !outOfDistributionIndicator) {
      riskBand = "low";
    } else if (entropy > maxEntropy * 0.8 || outOfDistributionIndicator || epistemicUncertainty > 0.5) {
      riskBand = "high";
    }

    return {
      predictionEntropy: entropy,
      variance,
      confidenceIntervals,
      expectedUncertainty,
      aleatoricUncertainty,
      epistemicUncertainty,
      riskBand,
      outOfDistributionIndicator,
      oodScore
    };
  }
}
