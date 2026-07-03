
import { DecisionIntelligenceOutput } from "../types";

export class EdgeAnalysisEngine {
  calculateEdge(
    predictionProbs: Record<string, number>,
    marketOdds: Record<string, number> // Decimal odds
  ) {
    const expectedValue: Record<string, number> = {};
    const edgePercentage: Record<string, number> = {};
    
    Object.keys(predictionProbs).forEach(key => {
      const prob = predictionProbs[key] || 0;
      const odds = marketOdds[key] || 1;
      
      expectedValue[key] = prob * odds;
      edgePercentage[key] = (prob * odds) - 1;
    });

    return {
      expectedValue,
      edgePercentage,
      confidenceAdjustedEdge: edgePercentage // Simplified for now
    };
  }
}
