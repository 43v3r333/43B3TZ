import { Logger as NewLogger, LogEntry as NewLogEntry, LogLevel as NewLogLevel } from "../logging/Logger";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private innerLogger: NewLogger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    this.innerLogger = new NewLogger(context, "LegacyShim");
  }

  public debug(message: string, metadata?: Record<string, any>) {
    this.innerLogger.debug(message, metadata);
  }

  public info(message: string, metadata?: Record<string, any>) {
    this.innerLogger.info(message, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>) {
    this.innerLogger.warn(message, metadata);
  }

  public error(message: string, metadata?: Record<string, any>) {
    this.innerLogger.error(message, metadata);
  }

  public static getLogs(): LogEntry[] {
    return NewLogger.getLogs().map(entry => ({
      timestamp: entry.timestamp,
      level: (entry.level === "TRACE" || entry.level === "FATAL" ? "DEBUG" : entry.level) as LogLevel,
      context: entry.service,
      message: entry.message,
      metadata: entry.metadata
    }));
  }

  public static clearLogs() {
    NewLogger.clearLogs();
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
