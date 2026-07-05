import { Router } from "express";
import { executiveIntelligence } from "../business/executiveIntelligence";
import { aiGovernanceEngine } from "../operations/governanceEngine";
import { providerManager } from "../intelligence/data/providerManager";
import { experimentRegistry } from "../research/experimentRegistry";
import { portfolioOptimizer } from "../decision/portfolioOptimizer";
import { reasoningService } from "../business/reasoningService";

const router = Router();

router.get("/kpis", async (req, res, next) => {
  try {
    const kpis = await executiveIntelligence.getExecutiveKPIs();
    res.json(kpis);
  } catch (err) {
    next(err);
  }
});

router.get("/leaderboards", async (req, res, next) => {
  try {
    const data = await executiveIntelligence.getPerformanceLeaderboards();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/providers", (req, res) => {
  res.json(providerManager.getProviders());
});

router.get("/experiments", (req, res) => {
  res.json(experimentRegistry.getExperiments());
});

router.get("/portfolio", (req, res) => {
  res.json({
    exposures: portfolioOptimizer.getMarketExposures(),
    // Sample sizing calculation
    sampleSizing: portfolioOptimizer.calculateSizing(0.045, 2.10)
  });
});

router.get("/reports/weekly", async (req, res, next) => {
  try {
    const report = await executiveIntelligence.generateWeeklyExecutiveReport();
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

router.get("/governance/compliance", async (req, res, next) => {
  try {
    const report = await aiGovernanceEngine.generateComplianceReport();
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

router.post("/reasoning", async (req, res, next) => {
  try {
    const { fixture, sport } = req.body;
    if (!fixture || !sport) {
      res.status(400).json({ error: "fixture and sport parameters are required" });
      return;
    }
    const data = await reasoningService.generateSportsReasoning(fixture, sport);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/briefing", async (req, res, next) => {
  try {
    const department = req.query.department as string;
    if (!department) {
      res.status(400).json({ error: "department parameter is required" });
      return;
    }
    const data = await reasoningService.generateDepartmentBriefing(department);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
