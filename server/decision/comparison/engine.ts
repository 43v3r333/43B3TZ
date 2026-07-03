
import { DecisionIntelligenceRequest, DecisionIntelligenceOutput } from "../types";

export class ComparisonEngine {
  calculateComparison(
    predictionProbs: Record<string, number>,
    marketProbs: Record<string, number>
  ) {
    const probabilityDifference: Record<string, number> = {};
    const relativeDifference: Record<string, number> = {};
    
    Object.keys(predictionProbs).forEach(key => {
      const p = predictionProbs[key] || 0;
      const m = marketProbs[key] || 0;
      
      probabilityDifference[key] = p - m;
      relativeDifference[key] = m !== 0 ? (p - m) / m : 0;
    });

    return {
      predictionProbabilities: predictionProbs,
      marketProbabilities: marketProbs,
      probabilityDifference,
      relativeDifference,
      agreementScore: this.calculateAgreement(predictionProbs, marketProbs),
      distributionOverlap: this.calculateOverlap(predictionProbs, marketProbs)
    };
  }

  private calculateAgreement(p: Record<string, number>, m: Record<string, number>): number {
    // Simple cosine similarity or similar metric
    return 0.95; // Placeholder
  }

  private calculateOverlap(p: Record<string, number>, m: Record<string, number>): number {
    // Min overlap
    return 0.9; // Placeholder
  }
}
