import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { config } from "./core/config";
import { createLogger, Logger } from "./core/logger";
import { container } from "./core/di";
import { db } from "./core/db";
import { redis } from "./core/redis";
import { authService } from "./services/auth";

// Import Repositories and Services for DI Registration
import { predictionRepository } from "./repositories/prediction";
import { researchRepository } from "./repositories/research";
import { matchRepository } from "./repositories/match";
import { oddsRepository } from "./repositories/odds";
import { modelRepository } from "./repositories/model";
import { auditRepository } from "./repositories/audit";
import { PredictionService } from "./services/prediction";
import { ResearchService } from "./services/research";
import { OddsService } from "./services/odds";
import { securityHeaders, corsPolicy, rateLimiter } from "./middleware/security";

import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import providerRouter from "./routes/providers";
import etlRouter from "./routes/etl";
import intelligenceRouter from "./routes/intelligence";
import { initializeProviderPlatform } from "./providers/index";
import { bootstrapSportsIntelligence } from "./intelligence/index";
import { bootstrapMLPlatform } from "./ml/index";
import mlRouter from "./routes/ml";
import predictionsRouter from "./routes/predictions";
import marketRouter from "./routes/market";
import decisionRouter from "./routes/decision";
import researchRouter from "./routes/research";
import selfImprovingRouter from "./routes/selfImproving";
import { MarketScheduler } from "./market/scheduler";
import { bootstrapAutonomousOS } from "./autonomous/index";

import { errorHandler } from "./middleware/errorHandler";
import { correlationMiddleware } from "./logging/Correlation";
import { requestLoggerMiddleware } from "./logging/RequestLogger";
import { responseFormatterMiddleware } from "./middleware/responseFormatter";

const logger = createLogger("ServerBootstrap");

async function startServer() {
  // 1. Dependency Injection Registration
  container.register("config", config);
  container.register("db", db);
  container.register("redis", redis);
  container.register("authService", authService);

  // Register enterprise repositories
  container.register("PredictionRepository", predictionRepository);
  container.register("ResearchRepository", researchRepository);
  container.register("MatchRepository", matchRepository);
  container.register("OddsRepository", oddsRepository);
  container.register("ModelRepository", modelRepository);
  container.register("AuditRepository", auditRepository);

  // Register enterprise services
  container.register("PredictionService", new PredictionService(predictionRepository, modelRepository));
  container.register("ResearchService", new ResearchService(researchRepository));
  container.register("OddsService", new OddsService(matchRepository, oddsRepository));

  logger.info("Successfully registered core services and repositories in dependency container");

  // 2. Pre-seed default Admin Account if not existing
  try {
    const existingAdmin = db.selectOne("users", "email", "admin@platform.internal");
    if (!existingAdmin) {
      authService.registerUser("admin@platform.internal", "AdminPassword123!", "admin");
      logger.info("Default Admin Account seeded successfully", { email: "admin@platform.internal" });
    }
  } catch (err: any) {
    logger.warn("Admin pre-seeding bypassed or already present");
  }

  // Initialize Provider Platform
  await initializeProviderPlatform();

  // Initialize Sports Intelligence Platform
  await bootstrapSportsIntelligence();

  // Initialize Enterprise MLOps Platform
  await bootstrapMLPlatform();

  // Initialize Enterprise Market Intelligence Platform
  MarketScheduler.bootstrap();

  // Initialize Autonomous AI Sports Operating System
  await bootstrapAutonomousOS();

  const app = express();
  app.use(express.json());

  // Global Enterprise Security Middlewares
  app.use(securityHeaders);
  app.use(corsPolicy);
  app.use(rateLimiter);

  // Set up API request correlation, logging, and response formatting middleware
  app.use(correlationMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(responseFormatterMiddleware);

  // 3. Register REST routers
  app.use("/api", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/providers", providerRouter);
  app.use("/api/v1/etl", etlRouter);
  app.use("/api/v1/intelligence", intelligenceRouter);
  app.use("/api/v1/ml", mlRouter);
  app.use("/api/v1/predictions", predictionsRouter);
  app.use("/api/v1/market", marketRouter);
  app.use("/api/v1/decision", decisionRouter);
  app.use("/api/v1/research", researchRouter);
  app.use("/api/v1/self-improving", selfImprovingRouter);

  // Expose system logs for live inspection in React terminal UI
  app.get("/api/v1/admin/logs", (req, res) => {
    res.status(200).json({ logs: Logger.getLogs() });
  });

  // Expose database snapshot to UI
  app.get("/api/v1/admin/db-snapshot", (req, res) => {
    res.status(200).json({
      stats: db.getStats(),
      fixtures: db.selectAll("fixtures"),
      users: db.selectAll("users").map(u => ({ user_id: u.user_id, email: u.email, role: u.role, created_at: u.created_at })),
      bankrolls: db.selectAll("bankroll")
    });
  });

  // Expose redis streams and channels
  app.get("/api/v1/admin/redis-snapshot", (req, res) => {
    res.status(200).json(redis.getStats());
  });

  // Expose active fixtures & odds (mapped dynamically from the database)
  app.get("/api/v1/fixtures-with-odds", (req, res) => {
    res.status(200).json({ fixtures: db.queryFixturesWithLatestOdds() });
  });

  // REST endpoint for UI to publish message to Redis Pub/Sub
  app.post("/api/v1/redis/publish", (req, res) => {
    try {
      const { channel, message } = req.body;
      if (!channel || !message) {
        return res.status(400).json({ error: "channel and message payload are required" });
      }
      redis.publish(channel, message);
      res.status(200).json({ status: "success", channel });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Centralized Domain & Exception Error Handling Middleware
  app.use(errorHandler);

  // 4. Vite middleware for development vs static asset serve for production
  if (process.env.NODE_ENV !== "production") {
    logger.info("Configuring Vite middleware in Hot Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Configuring Express static serving in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 5. Port and Ingress binding
  app.listen(config.port, "0.0.0.0", () => {
    logger.info(`================================================================`);
    logger.info(`  ${config.appName} RUNNING SUCCESSFULLY`);
    logger.info(`  Address: http://0.0.0.0:${config.port}`);
    logger.info(`  Environment: ${config.env.toUpperCase()}`);
    logger.info(`================================================================`);
  });
}

startServer().catch(err => {
  logger.error("Platform initialization encountered fatal crash during startup", { error: err.message });
  process.exit(1);
});
