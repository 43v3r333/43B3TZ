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
  version: string;
  commit: string;
  build: string;
  environment: string;
  bootTime: string;
}

// Startup Validation checks
if (!systemConfig.app.env) {
  throw new Error("Startup Configuration Error: Environment is not defined");
}
if (!systemConfig.security.jwtSecret || systemConfig.security.jwtSecret === "CHANGE_ME") {
  throw new Error("Startup Configuration Error: Insecure or missing JWT Secret");
}
if (!systemConfig.app.port || systemConfig.app.port <= 0) {
  throw new Error("Startup Configuration Error: Invalid port configured");
}

function deepFreeze(obj: any) {
  Object.keys(obj).forEach(name => {
    const prop = obj[name];
    if (typeof prop === "object" && prop !== null) {
      deepFreeze(prop);
    }
  });
  return Object.freeze(obj);
}

const rawConfig: ServerConfig = {
  env: systemConfig.app.env,
  port: systemConfig.app.port,
  host: systemConfig.app.host,
  jwtSecret: systemConfig.security.jwtSecret,
  appName: systemConfig.app.appName,
  databasePath: systemConfig.database.databasePath,
  redisUrl: systemConfig.database.redisUrl,
  brierTargetLimit: systemConfig.prediction.brierTargetLimit,
  maxKellyStakePercent: systemConfig.betting.maxKellyStakePercent,
  version: "1.0.0",
  commit: "43b3tz-prod-sha",
  build: "build-release-enterprise",
  environment: systemConfig.app.env,
  bootTime: new Date().toISOString()
};

export const config = deepFreeze(rawConfig) as ServerConfig;
deepFreeze(systemConfig);

