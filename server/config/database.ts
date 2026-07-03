import { ConfigurationError } from "../core/errors";

export interface DatabaseConfig {
  databasePath: string;
  redisUrl: string;
}

const databasePath = process.env.DATABASE_PATH || "./data/db.json";
if (!databasePath) {
  throw new ConfigurationError("DATABASE_PATH environment variable must be a valid file path string");
}

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
if (!redisUrl.startsWith("redis://") && !redisUrl.startsWith("rediss://")) {
  throw new ConfigurationError(`Invalid REDIS_URL specified: ${redisUrl}. Must start with redis:// or rediss://`);
}

export const databaseConfig: DatabaseConfig = {
  databasePath,
  redisUrl,
};
