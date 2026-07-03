import { ConfigurationError } from "../core/errors";

export interface LoggingConfig {
  logLevel: "debug" | "info" | "warn" | "error";
  logToConsole: boolean;
}

const logLevel = (process.env.LOG_LEVEL || "debug") as "debug" | "info" | "warn" | "error";
if (!["debug", "info", "warn", "error"].includes(logLevel)) {
  throw new ConfigurationError(`Invalid LOG_LEVEL specified: ${process.env.LOG_LEVEL}. Must be one of: debug, info, warn, error`);
}

const logToConsole = process.env.LOG_TO_CONSOLE !== "false";

export const loggingConfig: LoggingConfig = {
  logLevel,
  logToConsole,
};
