import express from "express";
import {
  sportKnowledgeGraph,
  TacticalAnalysisEngine,
  PlayerImpactEngine,
  MarketIntelligenceEngine,
  LiveMatchIntelligence,
  MultiModelDecisionEngine,
  AutonomousResearchAgent,
  BettingPortfolioEngine,
  SelfLearningEngine
} from "../predictions/selfImprovingSystem";
import { db } from "../core/db";

const router = express.Router();

// 1. Sport Knowledge Graph Endpoint
router.get("/knowledge-graph", (req, res) => {
  try {
    const entities = sportKnowledgeGraph.getAllEntities();
    res.json({ success: true, entities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Tactical Analysis Fingerprint Endpoint
router.get("/tactical-fingerprint/:teamId", (req, res) => {
  try {
    const { teamId } = req.params;
    const { seed } = req.query;
    const fingerprint = TacticalAnalysisEngine.generateFingerprint(teamId, seed as string);
    res.json({ success: true, teamId, fingerprint });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Player Impact Metrics Endpoint
router.get("/player-impact/:playerId", (req, res) => {
  try {
    const { playerId } = req.params;
    const { restDays, yellowCards } = req.query;
    
    const overrides: any = {};
    if (restDays) {
      const days = parseInt(restDays as string, 10);
      overrides.fatigue = Math.max(0, 100 - (days * 18));
      overrides.expectedAvailability = days < 2 ? "Doubtful (25%)" : "Available";
    }
    if (yellowCards) {
      overrides.suspensionRisk = parseInt(yellowCards as string, 10);
      if (overrides.suspensionRisk >= 5) overrides.expectedAvailability = "Suspended";
    }

    const metrics = PlayerImpactEngine.calculateInfluence(playerId, overrides);
    res.json({ success: true, playerId, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Market Intelligence Report Endpoint
router.get("/market-intel/:fixtureId", (req, res) => {
  try {
    const { fixtureId } = req.params;
    // Get live odds overrides if supplied
    const { homeOdds, drawOdds, awayOdds } = req.query;
    const oddsOverride = homeOdds && drawOdds && awayOdds ? {
      Home: parseFloat(homeOdds as string),
      Draw: parseFloat(drawOdds as string),
      Away: parseFloat(awayOdds as string)
    } : undefined;

    const report = MarketIntelligenceEngine.analyzeMarket(fixtureId, oddsOverride);
    res.json({ success: true, fixtureId, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Live Match Intelligence Simulation State
router.post("/live-intel", (req, res) => {
  try {
    const { telemetryState, liveOdds } = req.body;
    
    // Default telemetry state if empty
    const defaultTelemetry = {
      minute: 68,
      homeScore: 1,
      awayScore: 0,
      possessionHome: 54,
      possessionAway: 46,
      shotsHome: 11,
      shotsAway: 5,
      shotsOnTargetHome: 5,
      shotsOnTargetAway: 1,
      cornersHome: 4,
      cornersAway: 2,
      cardsYellowHome: 1,
      cardsYellowAway: 2,
      cardsRedHome: 0,
      cardsRedAway: 0,
      xGHome: 1.48,
      xGAway: 0.62,
      momentumScore: 25,
      dangerousAttacksHome: 38,
      dangerousAttacksAway: 18,
      substitutions: []
    };

    const state = { ...defaultTelemetry, ...telemetryState };
    const odds = liveOdds || { Home: 1.62, Draw: 3.80, Away: 6.50 };

    const probabilities = LiveMatchIntelligence.evaluateLiveMatch(state, odds);
    res.json({ success: true, telemetryState: state, liveOdds: odds, probabilities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Multi-Model Consensus Decision Endpoint
router.get("/decision-consensus", (req, res) => {
  try {
    const models = MultiModelDecisionEngine.bootstrapDefaultModels();
    const consensus = MultiModelDecisionEngine.generateConsensus(models);
    res.json({ success: true, models, consensus });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Autonomous Research Agent Endpoint
router.get("/daily-research", async (req, res) => {
  try {
    const { category, fixtureId } = req.query;
    const summary = await AutonomousResearchAgent.performDailyResearch(
      (category as any) || "all",
      fixtureId as string
    );
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Portfolio Optimization Endpoint
router.post("/portfolio-optimize", (req, res) => {
  try {
    const { bankroll, candidates } = req.body;
    const defaultCandidates = [
      { id: "bet_01", fixtureId: "fix_01", selection: "Home Win (Arsenal)", odds: 1.95, prob: 0.58, type: "Value Bet" as const, expectedValue: 0.13 },
      { id: "bet_02", fixtureId: "fix_02", selection: "Away Win (Real Madrid)", odds: 2.10, prob: 0.52, type: "Value Bet" as const, expectedValue: 0.09 },
      { id: "bet_03", fixtureId: "fix_03", selection: "Over 2.5 Goals (Bayern)", odds: 1.80, prob: 0.60, type: "Single" as const, expectedValue: 0.08 }
    ];

    const activeBankroll = bankroll || 10000;
    const allocs = BettingPortfolioEngine.optimizePortfolio(
      activeBankroll,
      candidates || defaultCandidates
    );

    res.json({ success: true, bankroll: activeBankroll, allocations: allocs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Self-Learning Engine Evaluation Endpoint
router.post("/self-learning-eval", async (req, res) => {
  try {
    const mockPredictions = [
      { id: "pred_101", finalOutput: { calibratedProbabilities: { Home: 0.62, Draw: 0.23, Away: 0.15 } } },
      { id: "pred_102", finalOutput: { calibratedProbabilities: { Home: 0.40, Draw: 0.30, Away: 0.30 } } },
      { id: "pred_103", finalOutput: { calibratedProbabilities: { Home: 0.20, Draw: 0.25, Away: 0.55 } } },
      { id: "pred_104", finalOutput: { calibratedProbabilities: { Home: 0.50, Draw: 0.30, Away: 0.20 } } },
      { id: "pred_105", finalOutput: { calibratedProbabilities: { Home: 0.58, Draw: 0.24, Away: 0.18 } } }
    ];

    const mockOutcomes = {
      "pred_101": "Home",
      "pred_102": "Home",
      "pred_103": "Away",
      "pred_104": "Draw",
      "pred_105": "Home"
    };

    const driftReport = await SelfLearningEngine.evaluateHistoricalOutcomes(
      mockPredictions,
      mockOutcomes
    );

    res.json({ success: true, predictionsCount: mockPredictions.length, driftReport });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
