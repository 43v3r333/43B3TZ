import { appConfig, AppConfig } from "./app";
import { databaseConfig, DatabaseConfig } from "./database";
import { aiConfig, AIConfig } from "./ai";
import { predictionConfig, PredictionConfig } from "./prediction";
import { securityConfig, SecurityConfig } from "./security";
import { bettingConfig, BettingConfig } from "./betting";
import { loggingConfig, LoggingConfig } from "./logging";

export interface SystemConfig {
  app: AppConfig;
  database: DatabaseConfig;
  ai: AIConfig;
  prediction: PredictionConfig;
  security: SecurityConfig;
  betting: BettingConfig;
  logging: LoggingConfig;
}

export const systemConfig: SystemConfig = {
  app: appConfig,
  database: databaseConfig,
  ai: aiConfig,
  prediction: predictionConfig,
  security: securityConfig,
  betting: bettingConfig,
  logging: loggingConfig,
};

// Re-export individual configs for convenience
export * from "./app";
export * from "./database";
export * from "./ai";
export * from "./prediction";
export * from "./security";
export * from "./betting";
export * from "./logging";
