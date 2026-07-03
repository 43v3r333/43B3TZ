import { Router } from "express";
import { 
  MOCK_FIXTURES, 
  MARKET_PROVIDERS, 
  MarketSimulationWorker 
} from "../market/workers";
import { marketHistoryStore } from "../market/history";
import { ConsensusEngine } from "../market/consensus";
import { VolatilityEngine } from "../market/volatility";
import { MarketMovementEngine } from "../market/movements";
import { ClosingLineEngine } from "../market/closing-line";
import { LiquidityEngine } from "../market/liquidity";
import { ArbitrageMonitor } from "../market/arbitrage-monitor";
import { AnomalyEngine } from "../market/anomalies";
import { SharpMoneyEngine } from "../market/sharp-money";
import { QualityEngine } from "../market/quality";
import { marketEventBus } from "../market/events";
import { MarketSnapshotEngine } from "../market/snapshots";
import { MarketMathematicalValidationSuite } from "../market/tests";

const router = Router();

// 1. Get mock fixtures
router.get("/fixtures", (req, res) => {
  res.json(MOCK_FIXTURES);
});

// 2. Get market providers & quality
router.get("/providers", (req, res) => {
  const providersWithMetrics = MARKET_PROVIDERS.map(p => {
    const q = MarketSimulationWorker.activeQuality[p.providerId];
    return {
      ...p,
      metrics: q || null
    };
  });
  res.json(providersWithMetrics);
});

// 3. Get history for a specific fixture or market
router.get("/history", (req, res) => {
  const { fixtureId, marketId } = req.query;
  if (marketId) {
    res.json(marketHistoryStore.getMarketHistory(marketId as string));
  } else if (fixtureId) {
    res.json(marketHistoryStore.getFixtureHistory(fixtureId as string));
  } else {
    res.json(marketHistoryStore.getAllRecords());
  }
});

// 4. Get consensus for fixture
router.get("/consensus", (req, res) => {
  const { fixtureId } = req.query;
  if (!fixtureId) {
    return res.status(400).json({ error: "Missing fixtureId" });
  }

  const allLatest = marketHistoryStore.getAllRecords();
  // Filter for this fixture's match_outcome
  const markets = allLatest.filter(m => m.fixtureId === fixtureId && m.marketType === "match_outcome");
  
  const weights: Record<string, number> = {};
  MARKET_PROVIDERS.forEach(p => { weights[p.providerId] = p.weight; });

  const report = ConsensusEngine.computeConsensus(fixtureId as string, "match_outcome", markets, weights);
  res.json(report || { error: "No active open markets found" });
});

// 5. Get volatility for fixture
router.get("/volatility", (req, res) => {
  const { fixtureId } = req.query;
  if (!fixtureId) {
    return res.status(400).json({ error: "Missing fixtureId" });
  }

  const history = marketHistoryStore.getFixtureHistory(fixtureId as string);
  const metrics = VolatilityEngine.calculateVolatility(history);
  const pStability = VolatilityEngine.assessProviderStability(history);

  res.json({
    metrics,
    providerStability: pStability
  });
});

// 6. Get movement for a market
router.get("/movement", (req, res) => {
  const { marketId } = req.query;
  if (!marketId) {
    return res.status(400).json({ error: "Missing marketId" });
  }

  const history = marketHistoryStore.getMarketHistory(marketId as string);
  const report = MarketMovementEngine.calculateMovement(history);
  res.json(report || { error: "Insufficient history to trace movement (needs >= 2 version state snapshots)" });
});

// 7. Get closing line report
router.get("/closing-line", (req, res) => {
  const { marketId } = req.query;
  if (!marketId) {
    return res.status(400).json({ error: "Missing marketId" });
  }

  const history = marketHistoryStore.getMarketHistory(marketId as string);
  const report = ClosingLineEngine.evaluateClosingLine(history);
  res.json(report || { error: "Insufficient history" });
});

// 8. Get liquidity profile
router.get("/liquidity", (req, res) => {
  const { marketId } = req.query;
  if (!marketId) {
    return res.status(400).json({ error: "Missing marketId" });
  }

  const history = marketHistoryStore.getMarketHistory(marketId as string);
  const profile = LiquidityEngine.estimateLiquidity(history);
  res.json(profile || { error: "Insufficient data" });
});

// 9. Get active arbitrage opportunities
router.get("/arbitrage", (req, res) => {
  res.json(MarketSimulationWorker.activeArbitrage);
});

// 10. Get active anomalies
router.get("/anomalies", (req, res) => {
  res.json(MarketSimulationWorker.activeAnomalies);
});

// 11. Get sharp money analytics
router.get("/sharp-money", (req, res) => {
  const { fixtureId } = req.query;
  if (!fixtureId) {
    return res.status(400).json({ error: "Missing fixtureId" });
  }

  // Get Pinnacle (sharp baseline) vs others
  const pinnId = `${fixtureId}_match_outcome_Pinnacle_Mock`;
  const pinHistory = marketHistoryStore.getMarketHistory(pinnId);
  const allLatest = marketHistoryStore.getAllRecords();

  const report = SharpMoneyEngine.analyseSharpFlow(pinHistory, allLatest);
  res.json(report || { error: "Sharp feed history not ready yet" });
});

// 12. Get quality rankings
router.get("/quality", (req, res) => {
  res.json(MarketSimulationWorker.activeQuality);
});

// 13. Get latest event logs
router.get("/events", (req, res) => {
  res.json(marketEventBus.getAllEvents());
});

// 14. Capture Snapshot
router.post("/snapshots/capture", (req, res) => {
  const snap = MarketSnapshotEngine.captureSnapshot();
  res.json(snap);
});

// 15. Reconstruct Snapshot
router.get("/snapshots/reconstruct", (req, res) => {
  const { timestamp } = req.query;
  if (!timestamp) {
    return res.status(400).json({ error: "Missing timestamp" });
  }
  const markets = MarketSnapshotEngine.reconstructStateAt(timestamp as string);
  res.json(markets);
});

// 16. Run mathematical validation tests
router.post("/tests/run", (req, res) => {
  const results = MarketMathematicalValidationSuite.execute();
  res.json(results);
});

// 17. Force manual tick for simulation
router.post("/simulation/tick", (req, res) => {
  // We trigger the private method by starting/stopping, or let's invoke standard tick manually
  // Let's call runPlatformPipeline as a mock fallback or invoke on worker
  try {
    // We can do a manual update by dispatching tick via simulation worker
    // Since tick is private, let's trigger runPlatformPipeline to refresh metrics immediately
    MarketSimulationWorker.runPlatformPipeline();
    res.json({ success: true, message: "Manual simulation pipeline refreshed successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
