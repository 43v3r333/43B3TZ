import express from "express";
import os from "os";
import { db } from "../core/db";
import { redis } from "../core/redis";
import { container } from "../core/di";
import { systemConfig } from "../config/index";
import { metricsCollector } from "../logging/Metrics";

const router = express.Router();

/**
 * GET /health
 * Returns complete system health status, CPU/Memory resource metrics, 
 * and lightweight in-memory traffic & performance metrics.
 */
router.get("/health", (req, res) => {
  const dbStats = db.getStats();
  const redisStats = redis.getStats();
  const metricsSnapshot = metricsCollector.getSnapshot();

  const totalCpuMs = process.cpuUsage();
  
  const payload = {
    application: systemConfig.app.appName,
    version: "1.3.1",
    environment: systemConfig.app.env,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    resources: {
      memory: process.memoryUsage(),
      cpu: {
        usage: totalCpuMs,
        loadavg: os.loadavg(),
        cores: os.cpus().length,
      }
    },
    subsystems: {
      database: {
        status: "connected",
        stats: dbStats,
      },
      cache: {
        status: redis.getStats().cacheKeys !== undefined ? "online" : "degraded",
        stats: redisStats,
      },
      aiProvider: {
        status: systemConfig.ai.geminiApiKey ? "configured" : "missing_key",
        defaultModel: systemConfig.ai.defaultModel,
      },
      predictionEngine: {
        status: container.getKeys().length > 0 ? "active" : "uninitialized",
        registeredPipelines: container.getKeys().filter(k => k.includes("Model") || k.includes("Engine")),
      },
      researchLab: {
        status: "isolated",
        totalExperimentsRecorded: metricsSnapshot.predictionCount, // Proxy for pipeline evaluations
      }
    },
    metrics: metricsSnapshot,
  };

  res.status(200).json(payload);
});

/**
 * GET /ready
 * Read-readiness probe for orchestrators (e.g. Kubernetes, Cloud Run).
 * Only returns 200 OK when all critical subsystems have initialized.
 */
router.get("/ready", (req, res) => {
  const isDbHealthy = db.getStats() !== null;
  const isConfigHealthy = !!systemConfig.app.appName;
  const isAiReady = !!systemConfig.ai.defaultModel;
  const isPredictionReady = container.getKeys().length > 0;
  
  const dependenciesReady = isDbHealthy && isConfigHealthy && isAiReady && isPredictionReady;

  if (dependenciesReady) {
    res.status(200).send("READY");
  } else {
    res.status(503).json({
      status: "unready",
      unreadyServices: {
        database: isDbHealthy ? "ready" : "failed",
        configuration: isConfigHealthy ? "ready" : "failed",
        aiProviders: isAiReady ? "ready" : "failed",
        predictionEngine: isPredictionReady ? "ready" : "failed",
      }
    });
  }
});

export default router;
