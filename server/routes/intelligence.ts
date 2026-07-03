import { Router } from "express";
import { intelligenceStorage } from "../intelligence/storage/storage";
import { intelligenceWorker } from "../intelligence/workers/workers";
import { sportsIntelligenceScheduler } from "../intelligence/scheduler/scheduler";
import { runIntelligenceTestSuite } from "../tests/intelligence.test";
import { spiEngine } from "../intelligence/spi/spi";
import { createLogger } from "../core/logger";
import { intelligenceReportStore } from "../intelligence/predictions/intelligenceOrchestrator";
import { intelligenceEventBus } from "../intelligence/predictions/events/intelligenceEvents";
import { RankingIntelligenceEngine } from "../intelligence/predictions/ranking/rankingIntelligence";
import { runPredictionIntelligenceTestSuite } from "../tests/predictionIntelligence.test";

const logger = createLogger("IntelligenceRoutes");
const router = Router();

// 1. Get stats
router.get("/storage/stats", (req, res) => {
  try {
    const stats = intelligenceStorage.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Clear all
router.post("/storage/clear", (req, res) => {
  try {
    intelligenceStorage.clearAll();
    spiEngine.clearAll();
    res.json({ success: true, message: "Sports Intelligence databases truncated successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Teams
router.get("/teams", (req, res) => {
  try {
    const records = intelligenceStorage.getAllTeams();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Players
router.get("/players", (req, res) => {
  try {
    const records = intelligenceStorage.getAllPlayers();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Elo
router.get("/elo", (req, res) => {
  try {
    const records = intelligenceStorage.getAllElos();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. xG
router.get("/xg", (req, res) => {
  try {
    const records = intelligenceStorage.getAllXg();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Form
router.get("/form", (req, res) => {
  try {
    const records = intelligenceStorage.getAllForms();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Fatigue
router.get("/fatigue", (req, res) => {
  try {
    const records = intelligenceStorage.getAllFatigues();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Weather
router.get("/weather", (req, res) => {
  try {
    const records = intelligenceStorage.getAllWeather();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Referee
router.get("/referee", (req, res) => {
  try {
    const records = intelligenceStorage.getAllReferees();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Market
router.get("/market", (req, res) => {
  try {
    const records = intelligenceStorage.getAllMarkets();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. SPI (Soccer Power Index)
router.get("/spi", (req, res) => {
  try {
    const records = spiEngine.getAllSpis();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Quality
router.get("/quality", (req, res) => {
  try {
    const records = intelligenceStorage.getAllQualities();
    res.json({ success: true, records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Snapshots History & PIT queries
router.get("/snapshots/history", (req, res) => {
  try {
    const { entityId, entityType } = req.query;
    if (!entityId || !entityType) {
      return res.status(400).json({ success: false, error: "entityId and entityType are required parameters" });
    }
    const history = intelligenceStorage.getSnapshotsHistory(entityId as string, entityType as any);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Point-in-time snapshot recovery query
router.get("/snapshots/pit", (req, res) => {
  try {
    const { entityId, entityType, timestamp } = req.query;
    if (!entityId || !entityType || !timestamp) {
      return res.status(400).json({ success: false, error: "entityId, entityType, and timestamp are required parameters" });
    }
    const snapshot = intelligenceStorage.getSnapshotAtTime(entityId as string, entityType as any, timestamp as string);
    res.json({ success: true, snapshot });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Trigger Replay
router.post("/replay", async (req, res) => {
  try {
    const result = await intelligenceWorker.performHistoricalReplay();
    res.json({ success: true, stats: result.stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Scheduler Status
router.get("/scheduler", (req, res) => {
  try {
    res.json({
      success: true,
      jobs: sportsIntelligenceScheduler.getJobs()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. Run Tests
router.post("/tests/run", async (req, res) => {
  try {
    await runIntelligenceTestSuite();
    res.json({ success: true, message: "Sports Intelligence Platform test suite completed successfully! 100% assertions green." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17b. Run Prediction Intelligence Tests
router.post("/tests/predictions/run", async (req, res) => {
  try {
    await runPredictionIntelligenceTestSuite();
    res.json({ success: true, message: "Prediction Intelligence Platform test suite completed successfully! 100% assertions green." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. Prediction Intelligence Reports
router.get("/predictions/reports", (req, res) => {
  try {
    const reports = intelligenceReportStore.getAllReports();
    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. Prediction Intelligence Events
router.get("/predictions/events", (req, res) => {
  try {
    const events = intelligenceEventBus.getAllEvents();
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. Prediction Intelligence Rankings
router.get("/predictions/ranked", (req, res) => {
  try {
    const reports = intelligenceReportStore.getAllReports();
    const ranked = RankingIntelligenceEngine.rankPredictions(reports);
    res.json({ success: true, ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
