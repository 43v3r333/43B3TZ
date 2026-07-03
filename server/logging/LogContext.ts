import { Request } from "express";

export interface RequestContext {
  requestId: string;
  userId?: string;
  role?: string;
  ip?: string;
  userAgent?: string;
  requestStart: number;
  requestDuration?: number;
  featureFlags?: Record<string, boolean>;
  environment: string;
}

// Global declaration to add context directly to the Express Request
declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
