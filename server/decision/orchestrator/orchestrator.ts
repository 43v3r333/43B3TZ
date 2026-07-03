
import { DecisionIntelligenceRequest, DecisionIntelligenceOutput } from "../types";
import { ComparisonEngine } from "../comparison/engine";
import { EdgeAnalysisEngine } from "../edge/engine";

export class DecisionOrchestrator {
  private comparisonEngine: ComparisonEngine;
  private edgeEngine: EdgeAnalysisEngine;

  constructor() {
    this.comparisonEngine = new ComparisonEngine();
    this.edgeEngine = new EdgeAnalysisEngine();
  }

  async runDecision(req: DecisionIntelligenceRequest): Promise<DecisionIntelligenceOutput> {
    // 1. Fetch prediction data and market data (mocked for now)
    const predictionProbs = { "Home": 0.5, "Draw": 0.25, "Away": 0.25 };
    const marketProbs = { "Home": 0.45, "Draw": 0.28, "Away": 0.27 };
    const marketOdds = { "Home": 2.1, "Draw": 3.5, "Away": 3.8 };

    // 2. Compare
    const comparison = this.comparisonEngine.calculateComparison(predictionProbs, marketProbs);

    // 3. Edge
    const edge = this.edgeEngine.calculateEdge(predictionProbs, marketOdds);

    // 4. Construct Output
    return {
      decisionId: `dec-${Date.now()}`,
      entityId: req.entityId,
      predictionId: req.predictionId,
      marketId: req.marketId,
      comparison,
      edge,
      scoring: {
        compositeScore: 85,
        riskScore: 15
      },
      timestamp: new Date().toISOString()
    };
  }
}
