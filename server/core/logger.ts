export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

// In-memory buffer to stream logs to the UI for live inspection
const LOG_BUFFER_LIMIT = 500;
const logBuffer: LogEntry[] = [];

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private format(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      metadata,
    };
  }

  private print(entry: LogEntry) {
    // Write to in-memory audit buffer
    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_LIMIT) {
      logBuffer.shift();
    }

    const colors = {
      DEBUG: "\x1b[36m", // Cyan
      INFO: "\x1b[32m",  // Green
      WARN: "\x1b[33m",  // Yellow
      ERROR: "\x1b[31m", // Red
      RESET: "\x1b[0m",
    };

    const color = colors[entry.level] || colors.RESET;
    const metaStr = entry.metadata ? ` | metadata: ${JSON.stringify(entry.metadata)}` : "";
    
    console.log(
      `[${entry.timestamp}] ${color}${entry.level}${colors.RESET} [\x1b[35m${entry.context}\x1b[0m] ${entry.message}${metaStr}`
    );
  }

  public debug(message: string, metadata?: Record<string, any>) {
    this.print(this.format("DEBUG", message, metadata));
  }

  public info(message: string, metadata?: Record<string, any>) {
    this.print(this.format("INFO", message, metadata));
  }

  public warn(message: string, metadata?: Record<string, any>) {
    this.print(this.format("WARN", message, metadata));
  }

  public error(message: string, metadata?: Record<string, any>) {
    this.print(this.format("ERROR", message, metadata));
  }

  public static getLogs(): LogEntry[] {
    return logBuffer;
  }

  public static clearLogs() {
    logBuffer.length = 0;
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
