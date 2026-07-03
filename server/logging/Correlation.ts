import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { systemConfig } from "../config/index";

/**
 * Express Middleware for managing Request Correlation IDs.
 * Reuses incoming x-correlation-id headers or generates a unique UUID.
 * Populates req.context and ensures the correlation ID is returned in the response headers.
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 1. Resolve or generate correlation ID
  const rawId = req.headers["x-correlation-id"] || req.headers["X-Correlation-Id"];
  const correlationId = Array.isArray(rawId)
    ? rawId[0]
    : typeof rawId === "string"
    ? rawId
    : crypto.randomUUID();

  // 2. Initialize request context
  req.context = {
    requestId: correlationId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    requestStart: Date.now(),
    environment: systemConfig.app.env,
    featureFlags: {}
  };

  // 3. Return correlation ID in response header
  res.setHeader("x-correlation-id", correlationId);

  next();
}
