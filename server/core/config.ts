import dotenv from "dotenv";
dotenv.config();

import { systemConfig } from "../config/index";

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
  env: systemConfig.app.env,
  port: systemConfig.app.port,
  host: systemConfig.app.host,
  jwtSecret: systemConfig.security.jwtSecret,
  appName: systemConfig.app.appName,
  databasePath: systemConfig.database.databasePath,
  redisUrl: systemConfig.database.redisUrl,
  brierTargetLimit: systemConfig.prediction.brierTargetLimit,
  maxKellyStakePercent: systemConfig.betting.maxKellyStakePercent,
};
