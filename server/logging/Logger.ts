import { systemConfig } from "../config/index";

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  message: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  environment: string;
  version: string;
  userId?: string;
  matchId?: string;
  predictionId?: string;
  experimentId?: string;
  provider?: string;
  model?: string;
  metadata?: Record<string, any>;
}

// In-memory buffer to stream logs to the UI for live inspection
const LOG_BUFFER_LIMIT = 500;
export const globalLogBuffer: LogEntry[] = [];

/**
 * High-performance, secure sanitization logic to strip out secrets.
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const result: Record<string, any> = {};
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "jwt",
    "apikey",
    "api_key",
    "credential",
    "private",
    "authorization"
  ];

  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      result[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }

  return result;
}

export class Logger {
  private service: string;
  private module: string;

  constructor(service: string, module: string) {
    this.service = service;
    this.module = module;
  }

  private format(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>
  ): LogEntry {
    const cleanMeta = sanitizeObject(metadata || {});
    
    // Support both camelCase and snake_case for standard fields
    const requestId = cleanMeta.requestId || cleanMeta.request_id;
    const operation = cleanMeta.operation;
    const duration = cleanMeta.duration;
    const userId = cleanMeta.userId || cleanMeta.user_id;
    const matchId = cleanMeta.matchId || cleanMeta.match_id;
    const predictionId = cleanMeta.predictionId || cleanMeta.prediction_id;
    const experimentId = cleanMeta.experimentId || cleanMeta.experiment_id;
    const provider = cleanMeta.provider;
    const model = cleanMeta.model;

    // Remove these keys from metadata
    const excludedKeys = [
      "requestId", "request_id",
      "operation",
      "duration",
      "userId", "user_id",
      "matchId", "match_id",
      "predictionId", "prediction_id",
      "experimentId", "experiment_id",
      "provider",
      "model"
    ];

    const extraMetadata: Record<string, any> = {};
    for (const [key, val] of Object.entries(cleanMeta)) {
      if (!excludedKeys.includes(key)) {
        extraMetadata[key] = val;
      }
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      module: this.module,
      message,
      requestId,
      operation,
      duration,
      environment: systemConfig.app.env,
      version: "1.3.1",
      userId,
      matchId,
      predictionId,
      experimentId,
      provider,
      model,
      metadata: Object.keys(extraMetadata).length > 0 ? extraMetadata : undefined,
    };
  }

  private print(entry: LogEntry): void {
    // Save to global log buffer for UI inspection
    globalLogBuffer.push(entry);
    if (globalLogBuffer.length > LOG_BUFFER_LIMIT) {
      globalLogBuffer.shift();
    }

    // Colors for local dev readability
    const colors = {
      TRACE: "\x1b[34m", // Blue
      DEBUG: "\x1b[36m", // Cyan
      INFO: "\x1b[32m",  // Green
      WARN: "\x1b[33m",  // Yellow
      ERROR: "\x1b[31m", // Red
      FATAL: "\x1b[41m\x1b[37m", // White text on Red bg
      RESET: "\x1b[0m",
    };

    if (systemConfig.logging.logToConsole) {
      if (systemConfig.app.env === "production") {
        // Output production-grade JSON
        console.log(JSON.stringify(entry));
      } else {
        // Beautiful human-readable development output
        const color = colors[entry.level] || colors.RESET;
        const reqStr = entry.requestId ? ` [Req: ${entry.requestId}]` : "";
        const durStr = entry.duration !== undefined ? ` (${entry.duration.toFixed(2)}ms)` : "";
        const opStr = entry.operation ? ` | Op: ${entry.operation}` : "";
        const metaStr = entry.metadata ? ` | Meta: ${JSON.stringify(entry.metadata)}` : "";
        
        console.log(
          `[${entry.timestamp}] ${color}${entry.level}${colors.RESET} [${entry.service}:${entry.module}]${reqStr}${opStr} ${entry.message}${durStr}${metaStr}`
        );
      }
    }
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("TRACE", message, metadata));
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("DEBUG", message, metadata));
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("INFO", message, metadata));
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("WARN", message, metadata));
  }

  public error(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("ERROR", message, metadata));
  }

  public fatal(message: string, metadata?: Record<string, any>): void {
    this.print(this.format("FATAL", message, metadata));
  }

  public static getLogs(): LogEntry[] {
    return globalLogBuffer;
  }

  public static clearLogs(): void {
    globalLogBuffer.length = 0;
  }
}

export function createLogger(service: string, module = "General"): Logger {
  return new Logger(service, module);
}
