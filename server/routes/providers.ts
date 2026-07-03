import { Router } from "express";
import { providerRegistry } from "../providers/registry/registry";
import { providerHealthMonitor } from "../providers/health/monitor";
import { ProviderMetricsTracker } from "../providers/core/metrics";
import { fakeSportsDataProvider } from "../providers/shared/fakeProvider";
import { DeadLetterQueue } from "../providers/core/retry";
import { createLogger } from "../core/logger";

const logger = createLogger("ProviderRoutes");
const router = Router();

// 1. Get registry status
router.get("/registry", (req, res) => {
  try {
    const status = providerRegistry.getRegistryStatus();
    res.json({ success: true, registry: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get health monitor statuses
router.get("/health", async (req, res) => {
  try {
    const providers = providerRegistry.getAllProviders();
    const records = [];
    for (const p of providers) {
      const rec = await providerHealthMonitor.evaluateProvider(p);
      records.push(rec);
    }
    res.json({ success: true, healthRecords: records });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get metrics
router.get("/metrics", (req, res) => {
  try {
    const metrics = ProviderMetricsTracker.getAllMetrics();
    res.json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Prometheus raw metrics format for scraping
router.get("/metrics/prometheus", (req, res) => {
  try {
    const text = ProviderMetricsTracker.generatePrometheusText();
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(text);
  } catch (err: any) {
    res.status(500).send(`# ERROR: ${err.message}`);
  }
});

// 5. Get Dead-Letter Queue
router.get("/dlq", (req, res) => {
  try {
    const entries = DeadLetterQueue.getEntries();
    res.json({ success: true, dlq: entries });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Clear Dead-Letter Queue
router.post("/dlq/clear", (req, res) => {
  try {
    DeadLetterQueue.clear();
    res.json({ success: true, message: "Dead-Letter Queue cleared successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Configure Fake Provider (Deliberate Failures, Slowdowns)
router.post("/configure-fake", (req, res) => {
  try {
    const { forceFailure, authFails, slowResponse, simRateLimit } = req.body;
    
    if (forceFailure !== undefined) fakeSportsDataProvider.forceFailure = forceFailure;
    if (authFails !== undefined) fakeSportsDataProvider.authFails = authFails;
    if (slowResponse !== undefined) fakeSportsDataProvider.slowResponse = slowResponse;
    if (simRateLimit !== undefined) fakeSportsDataProvider.simRateLimit = simRateLimit;

    logger.info("Fake provider simulated settings re-configured:", req.body);
    res.json({
      success: true,
      settings: {
        forceFailure: fakeSportsDataProvider.forceFailure,
        authFails: fakeSportsDataProvider.authFails,
        slowResponse: fakeSportsDataProvider.slowResponse,
        simRateLimit: fakeSportsDataProvider.simRateLimit
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Probe operation (Fetches and normalizes live data with full logging!)
router.post("/probe", async (req, res) => {
  const { providerName, capability, args } = req.body;
  if (!providerName || !capability) {
    return res.status(400).json({ success: false, error: "providerName and capability are required parameters." });
  }

  const provider = providerRegistry.getProvider(providerName);
  if (!provider) {
    return res.status(404).json({ success: false, error: `Provider ${providerName} not found in registry.` });
  }

  const startTime = Date.now();
  const tracker = ProviderMetricsTracker.getOrCreate(providerName);

  try {
    let rawData: any = null;
    let normalizedData: any = null;
    let isValid = false;

    // Direct dynamic execution
    if (capability === "venues") {
      const p = provider as any;
      rawData = await p.fetchVenues();
      normalizedData = p.normalizeVenues(rawData);
      isValid = p.validateVenues(normalizedData);
      await p.cacheVenues(normalizedData);
    } else if (capability === "competitions") {
      const p = provider as any;
      rawData = await p.fetchCompetitions();
      normalizedData = p.normalizeCompetitions(rawData);
      isValid = p.validateCompetitions(normalizedData);
      await p.cacheCompetitions(normalizedData);
    } else if (capability === "teams") {
      const p = provider as any;
      rawData = await p.fetchTeams(args?.competitionId || "comp-saf-psl");
      normalizedData = p.normalizeTeams(rawData);
      isValid = p.validateTeams(normalizedData);
      await p.cacheTeams(normalizedData);
    } else if (capability === "players") {
      const p = provider as any;
      rawData = await p.fetchPlayers(args?.teamId || "t-pirates");
      normalizedData = p.normalizePlayers(rawData);
      isValid = p.validatePlayers(normalizedData);
      await p.cachePlayers(normalizedData);
    } else if (capability === "fixtures") {
      const p = provider as any;
      rawData = await p.fetchFixtures(args?.competitionId || "comp-saf-psl");
      normalizedData = p.normalizeFixtures(rawData);
      isValid = p.validateFixtures(normalizedData);
      await p.cacheFixtures(normalizedData);
    } else if (capability === "odds") {
      const p = provider as any;
      rawData = await p.fetchOdds(args?.fixtureId || "f-1");
      normalizedData = p.normalizeOdds(rawData);
      isValid = p.validateOdds(normalizedData);
      await p.cacheOdds(normalizedData);
    } else if (capability === "statistics") {
      const p = provider as any;
      rawData = await p.fetchStatistics(args?.fixtureId || "f-1");
      normalizedData = p.normalizeStatistics(rawData);
      isValid = p.validateStatistics(normalizedData);
      await p.cacheStatistics(normalizedData);
    } else if (capability === "weather") {
      const p = provider as any;
      rawData = await p.fetchWeather(args?.fixtureId || "f-1");
      normalizedData = p.normalizeWeather(rawData);
      isValid = p.validateWeather(normalizedData);
      await p.cacheWeather(normalizedData);
    } else if (capability === "rankings") {
      const p = provider as any;
      rawData = await p.fetchRankings(args?.competitionId || "comp-saf-psl");
      normalizedData = p.normalizeRankings(rawData);
      isValid = p.validateRankings(normalizedData);
      await p.cacheRankings(normalizedData);
    } else if (capability === "news") {
      const p = provider as any;
      rawData = await p.fetchNews(args?.teamIds || ["t-pirates"]);
      normalizedData = p.normalizeNews(rawData);
      isValid = p.validateNews(normalizedData);
      await p.cacheNews(normalizedData);
    } else {
      return res.status(400).json({ success: false, error: `Capability ${capability} is not supported or recognized.` });
    }

    const latency = Date.now() - startTime;
    tracker.recordRequest(latency, true);

    res.json({
      success: true,
      latencyMs: latency,
      isValid,
      rawData,
      normalizedData
    });

  } catch (err: any) {
    const latency = Date.now() - startTime;
    tracker.recordRequest(latency, false);
    
    logger.error(`Failed to execute probe for provider [${providerName}] capability [${capability}]`, { error: err.message });
    res.status(500).json({ 
      success: false, 
      latencyMs: latency,
      error: err.message 
    });
  }
});

export default router;
