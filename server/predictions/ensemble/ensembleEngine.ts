import { ModelProbabilityOutput, EnsembleMethodology, ModelMetadata } from "../types";

export class EnsembleEngine {
  /**
   * Combines prediction probability maps from multiple models using a specific methodology.
   */
  public static ensemblePredictions(
    modelsOutputs: Record<string, { output: ModelProbabilityOutput; meta: ModelMetadata }>,
    methodology: EnsembleMethodology
  ): { finalProbabilities: Record<string, number>; agreementScore: number; consensusScore: number } {
    const activeModels = Object.keys(modelsOutputs);
    if (activeModels.length === 0) {
      return { finalProbabilities: {}, agreementScore: 1.0, consensusScore: 1.0 };
    }

    if (activeModels.length === 1) {
      const singleId = activeModels[0];
      return {
        finalProbabilities: modelsOutputs[singleId].output.calibratedProbabilities,
        agreementScore: 1.0,
        consensusScore: 1.0
      };
    }

    let combinedProbs: Record<string, number> = {};
    const firstModelProbs = modelsOutputs[activeModels[0]].output.calibratedProbabilities;
    const outcomeKeys = Object.keys(firstModelProbs);

    // Initialize combined probability map
    for (const key of outcomeKeys) {
      combinedProbs[key] = 0;
    }

    let finalWeights: Record<string, number> = {};

    switch (methodology.type) {
      case "model_averaging": {
        // Equal weighting for all active models
        const equalWeight = 1.0 / activeModels.length;
        for (const mId of activeModels) {
          finalWeights[mId] = equalWeight;
        }
        break;
      }

      case "weighted_voting":
      case "blending":
      case "stacking":
      case "meta_models": {
        // Use predefined weights or adjust dynamically based on health/reliability/context
        let weightSum = 0;
        for (const mId of activeModels) {
          const modelMeta = modelsOutputs[mId].meta;
          
          // Start with specified weight, or fallback to model accuracy
          let baseWeight = methodology.weights[mId] ?? modelMeta.accuracy;
          
          // Context-aware adjustments
          if (methodology.context.leagueId) {
            // Boost models with higher accuracy for this league
            baseWeight *= 1.1; 
          }
          if (modelMeta.healthStatus === "degraded") {
            baseWeight *= 0.5; // Penalyze degraded models
          } else if (modelMeta.healthStatus === "unhealthy") {
            baseWeight *= 0.1; // Safely ignore unhealthy models
          }

          finalWeights[mId] = baseWeight;
          weightSum += baseWeight;
        }

        // Normalize weights
        if (weightSum > 0) {
          for (const mId of activeModels) {
            finalWeights[mId] /= weightSum;
          }
        } else {
          // Fallback to equal weighting if all weights are zero
          const equalWeight = 1.0 / activeModels.length;
          for (const mId of activeModels) {
            finalWeights[mId] = equalWeight;
          }
        }
        break;
      }
    }

    // Aggregate calibrated probabilities using normalized weights
    for (const mId of activeModels) {
      const weight = finalWeights[mId];
      const calibratedProbs = modelsOutputs[mId].output.calibratedProbabilities;
      
      for (const key of outcomeKeys) {
        combinedProbs[key] = (combinedProbs[key] || 0) + (calibratedProbs[key] || 0) * weight;
      }
    }

    // Normalize final probabilities to sum to 1.0
    let finalSum = Object.values(combinedProbs).reduce((a, b) => a + b, 0);
    if (finalSum > 0) {
      for (const key of outcomeKeys) {
        combinedProbs[key] /= finalSum;
      }
    }

    // Calculate Consensus & Agreement Scores
    // Agreement Score: cosine similarity or average distance between individual models and combined output
    let totalCosineSimilarity = 0;
    let comparisons = 0;

    for (const mId of activeModels) {
      const calibrated = modelsOutputs[mId].output.calibratedProbabilities;
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (const key of outcomeKeys) {
        const valA = calibrated[key] || 0;
        const valB = combinedProbs[key] || 0;
        dotProduct += valA * valB;
        normA += valA * valA;
        normB += valB * valB;
      }

      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
      totalCosineSimilarity += similarity;
      comparisons++;
    }

    const agreementScore = comparisons > 0 ? totalCosineSimilarity / comparisons : 1.0;

    // Consensus Score: degree of overlap on the top-voted outcome
    let topOutcomeMatches = 0;
    const finalTopOutcome = Object.entries(combinedProbs).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    for (const mId of activeModels) {
      const calibrated = modelsOutputs[mId].output.calibratedProbabilities;
      const modelTopOutcome = Object.entries(calibrated).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      if (modelTopOutcome === finalTopOutcome) {
        topOutcomeMatches++;
      }
    }

    const consensusScore = activeModels.length > 0 ? topOutcomeMatches / activeModels.length : 1.0;

    return {
      finalProbabilities: combinedProbs,
      agreementScore,
      consensusScore
    };
  }
}
