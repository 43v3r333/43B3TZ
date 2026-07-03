import { Request, Response, NextFunction } from "express";
import { createLogger } from "../core/logger";
import { config } from "../core/config";
import { authService, JWTSession } from "../services/auth";
import { auditRepository } from "../repositories/audit";

const logger = createLogger("Security");

// Role/Permission matrix
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [
    "Prediction.Read", "Prediction.Write", "Prediction.Delete",
    "Research.Execute", "Research.Read",
    "Admin.Configure", "Admin.Users", "Admin.System"
  ],
  Analyst: [
    "Prediction.Read", "Prediction.Write", "Research.Read"
  ],
  Researcher: [
    "Prediction.Read", "Research.Read", "Research.Execute"
  ],
  User: [
    "Prediction.Read"
  ],
  Guest: []
};

export function normalizeRole(role: string): string {
  if (!role) return "Guest";
  const r = role.toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "analyst") return "Analyst";
  if (r === "researcher") return "Researcher";
  if (r === "trader" || r === "user") return "User";
  if (r === "guest") return "Guest";
  return "Guest";
}

// Security Headers Middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  
  // Custom CSP allowing fonts, styles and script execution for Vite, and allowing framing
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' *; style-src 'self' 'unsafe-inline' *; script-src 'self' 'unsafe-inline' 'unsafe-eval' *; frame-ancestors *;"
  );
  next();
}

// CORS Policies Middleware
export function corsPolicy(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
}

// In-Memory Rate Limiter
const ipRequestCounts: Map<string, { count: number; resetAt: number }> = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300;

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  
  let record = ipRequestCounts.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    ipRequestCounts.set(ip, record);
  }

  record.count++;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    logger.warn(`Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later."
    });
  }

  next();
}

// Brute-force Login Protector
const failedLogins: Map<string, { count: number; lockUntil: number }> = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const bruteForceProtector = {
  checkLockout(email: string): { locked: boolean; remainingMs: number } {
    const record = failedLogins.get(email);
    if (record && Date.now() < record.lockUntil) {
      return { locked: true, remainingMs: record.lockUntil - Date.now() };
    }
    return { locked: false, remainingMs: 0 };
  },

  recordFailure(email: string) {
    let record = failedLogins.get(email);
    if (!record) {
      record = { count: 0, lockUntil: 0 };
      failedLogins.set(email, record);
    }
    record.count++;
    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      logger.warn(`Account locked out due to brute force protection: "${email}"`);
    }
  },

  recordSuccess(email: string) {
    failedLogins.delete(email);
  }
};

export interface SecureRequest extends Request {
  user?: JWTSession;
}

// Permission & Auth middleware
export function requirePermission(permission: string) {
  return (req: SecureRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      // Fallback to cookie
      const cookieHeader = req.headers.cookie || "";
      const match = cookieHeader.match(/session_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      auditRepository.log({
        action: "ACCESS_DENIED",
        actorId: "anonymous",
        actorEmail: "anonymous",
        actorRole: "Guest",
        resource: req.originalUrl,
        status: "failure",
        metadata: { reason: "Missing token", permission }
      });
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const session = authService.verifyToken(token);
    if (!session) {
      auditRepository.log({
        action: "ACCESS_DENIED",
        actorId: "anonymous",
        actorEmail: "anonymous",
        actorRole: "Guest",
        resource: req.originalUrl,
        status: "failure",
        metadata: { reason: "Invalid token", permission }
      });
      return res.status(401).json({ error: "Unauthorized: Token invalid or expired" });
    }

    req.user = session;

    const normalizedRole = normalizeRole(session.role);
    const userPermissions = ROLE_PERMISSIONS[normalizedRole] || [];

    if (!userPermissions.includes(permission)) {
      logger.warn(`Unauthorized access attempt: User ${session.email} attempted to perform action requiring "${permission}"`);
      auditRepository.log({
        action: "ACCESS_DENIED",
        actorId: session.user_id,
        actorEmail: session.email,
        actorRole: normalizedRole,
        resource: req.originalUrl,
        status: "failure",
        metadata: { reason: "Insufficient permissions", required: permission, userPermissions }
      });
      return res.status(403).json({ error: `Forbidden: Missing required permission "${permission}"` });
    }

    auditRepository.log({
      action: "ACCESS_GRANTED",
      actorId: session.user_id,
      actorEmail: session.email,
      actorRole: normalizedRole,
      resource: req.originalUrl,
      status: "success",
      metadata: { permission }
    });

    next();
  };
}
