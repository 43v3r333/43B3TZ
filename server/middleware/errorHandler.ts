import { Request, Response, NextFunction } from "express";
import { PlatformBaseError } from "../core/errors";
import { createLogger } from "../core/logger";
import { systemConfig } from "../config/index";

const logger = createLogger("ErrorHandlerMiddleware");

/**
 * Enterprise Centralized Error Handling Middleware.
 * Catches all thrown/passed errors, formats them cleanly, logs contextually, and prevents sensitive leakage.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const isProd = systemConfig.app.env === "production";
  
  // 1. Log the error internally with context
  if (err instanceof PlatformBaseError) {
    logger.error(`Domain Exception caught: ${err.message}`, {
      name: err.name,
      statusCode: err.statusCode,
      context: err.context,
      stack: isProd ? undefined : err.stack
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.name,
        message: err.message,
        context: err.context,
      }
    });
  }

  // 2. Handle generic system/runtime exceptions
  logger.error(`Generic Exception caught: ${err.message || err}`, {
    stack: isProd ? undefined : err.stack
  });

  return res.status(500).json({
    error: {
      code: "InternalServerError",
      message: isProd ? "An unexpected system error occurred" : err.message || "Unknown error",
    }
  });
}
