import express from "express";
import { db } from "../core/db";
import { redis } from "../core/redis";
import { container } from "../core/di";

const router = express.Router();

router.get("/health", (req, res) => {
  const dbStats = db.getStats();
  const redisStats = redis.getStats();
  
  const payload = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    subsystems: {
      database: {
        status: "connected",
        stats: dbStats
      },
      redis: {
        status: "online",
        stats: redisStats
      },
      di_container: {
        registeredServices: container.getKeys()
      }
    }
  };
  
  res.status(200).json(payload);
});

export default router;
