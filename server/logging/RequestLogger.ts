import { Request, Response, NextFunction } from "express";
import { createLogger } from "./Logger";
import { PerformanceTimer } from "./PerformanceTimer";
import { metricsCollector } from "./Metrics";

const logger = createLogger("HTTPServer", "RequestLogger");

/**
 * Express middleware to capture HTTP request metadata, execution duration,
 * and dispatch metrics updates.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const timer = new PerformanceTimer();
  metricsCollector.incrementRequests();

  // Attach request details to logging context
  const requestId = req.context?.requestId;
  
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    requestId,
    operation: "HTTPRequestStart",
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Intercept response finish
  res.on("finish", () => {
    const elapsedMs = timer.getElapsedMs();
    metricsCollector.recordResponseTime(elapsedMs);

    // Track validation/auth errors via response status code
    if (res.statusCode === 400) {
      metricsCollector.incrementErrors("validation");
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      metricsCollector.incrementErrors("auth");
    } else if (res.statusCode >= 500) {
      metricsCollector.incrementErrors("generic");
    }

    logger.info(`Request Completed: ${req.method} ${req.originalUrl} - Status ${res.statusCode}`, {
      requestId,
      operation: "HTTPRequestEnd",
      duration: elapsedMs,
      statusCode: res.statusCode,
    });
  });

  next();
}
