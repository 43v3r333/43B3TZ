import { ConfigurationError } from "../core/errors";

export interface AppConfig {
  env: "development" | "production" | "test";
  port: number;
  host: string;
  appName: string;
}

const env = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
if (!["development", "production", "test"].includes(env)) {
  throw new ConfigurationError(`Invalid NODE_ENV specified: ${process.env.NODE_ENV}. Must be one of: development, production, test`);
}

const portStr = process.env.PORT || "3000";
const port = parseInt(portStr, 10);
if (isNaN(port) || port <= 0 || port > 65535) {
  throw new ConfigurationError(`Invalid PORT specified: ${portStr}. Must be a valid port number (1-65535)`);
}

const host = process.env.HOST || "0.0.0.0";
const appName = process.env.APP_NAME || "43B3TZ AI Sports Analytics Platform";

export const appConfig: AppConfig = {
  env,
  port,
  host,
  appName,
};
