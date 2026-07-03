import dotenv from "dotenv";
dotenv.config();

export interface ServerConfig {
  env: "development" | "production" | "test";
  port: number;
  host: string;
  jwtSecret: string;
  appName: string;
  databasePath: string;
  redisUrl: string;
  brierTargetLimit: number;
  maxKellyStakePercent: number;
}

export const config: ServerConfig = {
  env: (process.env.NODE_ENV as any) || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  jwtSecret: process.env.JWT_SECRET || "platform-enterprise-secret-token-key-256",
  appName: process.env.APP_NAME || "AI Betting Intelligence Platform",
  databasePath: process.env.DATABASE_PATH || "./data/db.json",
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  brierTargetLimit: 0.22,
  maxKellyStakePercent: 0.05, // 5% single stake maximum
};
