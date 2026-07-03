import { createLogger } from "./Logger";
import { metricsCollector } from "./Metrics";

const logger = createLogger("Database", "DatabaseLogger");

// Configure a threshold for highlighting sluggish queries (default 100ms)
const SLOW_QUERY_THRESHOLD_MS = 100;

export interface QueryDetails {
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "TRANSACTION" | "CACHE_LOOKUP";
  collectionOrTable: string;
  querySummary?: string;
  durationMs: number;
  success: boolean;
  requestId?: string;
  error?: string;
}

export class DatabaseLogger {
  /**
   * Timed logging for all structured relational or document database actions.
   */
  public static logQuery(details: QueryDetails): void {
    // Increment specific counters based on action type
    if (details.operation === "SELECT" || details.operation === "CACHE_LOOKUP") {
      metricsCollector.incrementDatabaseReads();
    } else {
      metricsCollector.incrementDatabaseWrites();
    }

    if (details.operation === "CACHE_LOOKUP") {
      metricsCollector.incrementCache(details.success);
    }

    const isSlow = details.durationMs >= SLOW_QUERY_THRESHOLD_MS;
    const level = !details.success ? "error" : isSlow ? "warn" : "debug";

    const msg = `${details.operation} on [${details.collectionOrTable}] - ${
      details.success ? "SUCCESS" : "FAILED"
    }${isSlow ? " [SLOW QUERY DETECTED]" : ""}`;

    logger[level](msg, {
      requestId: details.requestId,
      operation: `DB_${details.operation}`,
      duration: details.durationMs,
      metadata: {
        collectionOrTable: details.collectionOrTable,
        querySummary: details.querySummary,
        isSlowQuery: isSlow,
        error: details.error,
      },
    });
  }
}
