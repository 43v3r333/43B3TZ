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

const port = 3000;
const host = "0.0.0.0";
const appName = process.env.APP_NAME || "43B3TZ AI Sports Analytics Platform";

export const appConfig: AppConfig = {
  env,
  port,
  host,
  appName,
};
