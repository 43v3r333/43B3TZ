import { Request, Response, NextFunction } from "express";

/**
 * Enterprise Structured Response Wrapper.
 * Intercepts all Express json responses and standardizes the output payload.
 * Formats data and wraps exceptions inside a consistent enterprise schema.
 */
export function responseFormatterMiddleware(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json;

  res.json = function (body: any): Response {
    const requestStart = req.context?.requestStart || Date.now();
    const duration = Date.now() - requestStart;
    const requestId = req.context?.requestId || "";

    // Bypass wrapping if the body already conforms to the enterprise schema
    if (body && typeof body === "object" && "success" in body && "requestId" in body) {
      return originalJson.call(this, body);
    }

    // Determine status
    const success = res.statusCode >= 200 && res.statusCode < 300;

    let error = null;
    let data = body;

    if (!success) {
      // Extract error payload
      error = body?.error || body || { message: "An unexpected error occurred" };
      data = null;
    }

    const wrappedPayload = {
      success,
      requestId,
      timestamp: new Date().toISOString(),
      duration,
      data,
      error,
    };

    return originalJson.call(this, wrappedPayload);
  };

  next();
}
