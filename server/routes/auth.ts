import express, { Request, Response, NextFunction } from "express";
import { authService, JWTSession } from "../services/auth";
import { container } from "../core/di";
import { IAuditRepository } from "../repositories/types";
import { AuthValidator } from "../validators/auth";
import { bruteForceProtector, normalizeRole } from "../middleware/security";

const router = express.Router();

export interface AuthenticatedRequest extends Request {
  user?: JWTSession;
}

// Helper to get audit logger
const getAuditRepo = () => container.resolve<IAuditRepository>("AuditRepository");

// Authentication Guard Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.headers["authorization"] as string;
  
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  } else {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/session_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
  }

  const session = authService.verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized: Session token is invalid or expired" });
  }

  req.user = session;
  next();
}

// Authorization guard for specific RBAC roles (legacy support)
export function authorizeRoles(...allowedRoles: Array<"admin" | "trader" | "Admin" | "User" | "Analyst" | "Researcher">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Session not active" });
    }
    
    const userRoleNormalized = normalizeRole(req.user.role);
    const allowedNormalized = allowedRoles.map(r => normalizeRole(r));
    
    if (!allowedNormalized.includes(userRoleNormalized)) {
      return res.status(403).json({ error: "Forbidden: Access level insufficient" });
    }
    
    next();
  };
}

// POST /api/v1/auth/register
router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = AuthValidator.validateRegister(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { email, password, role } = validation.data!;
    
    // Default to User or lower legacy roles safely
    const requestedRole = role || "trader";
    const user = authService.registerUser(email, password, requestedRole as any);
    
    // Auto login
    const { token } = authService.authenticateUser(email, password);
    
    // Secure cookie configuration
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
    });

    const normalized = normalizeRole(user.role);

    // Audit Log success
    getAuditRepo().log({
      action: "USER_REGISTER",
      actorId: user.user_id,
      actorEmail: user.email,
      actorRole: normalized,
      resource: "/api/v1/auth/register",
      status: "success"
    });
    
    res.status(201).json({
      message: "Account created successfully",
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (err: any) {
    getAuditRepo().log({
      action: "USER_REGISTER",
      actorId: "anonymous",
      actorEmail: req.body?.email || "unknown",
      actorRole: "Guest",
      resource: "/api/v1/auth/register",
      status: "failure",
      metadata: { error: err.message }
    });
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/login
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : "";
  
  try {
    // Brute-force check
    const lockout = bruteForceProtector.checkLockout(email);
    if (lockout.locked) {
      return res.status(423).json({
        error: `Account is temporarily locked due to consecutive login failures. Try again in ${Math.ceil(lockout.remainingMs / 1000)}s`
      });
    }

    const validation = AuthValidator.validateLogin(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { email: validatedEmail, password } = validation.data!;
    const { user, token } = authService.authenticateUser(validatedEmail, password);
    
    // Clear failed attempts on success
    bruteForceProtector.recordSuccess(validatedEmail);

    // Secure cookie configuration
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
    });

    const normalized = normalizeRole(user.role);

    getAuditRepo().log({
      action: "USER_LOGIN",
      actorId: user.user_id,
      actorEmail: user.email,
      actorRole: normalized,
      resource: "/api/v1/auth/login",
      status: "success"
    });
    
    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (err: any) {
    if (email) {
      bruteForceProtector.recordFailure(email);
    }

    getAuditRepo().log({
      action: "USER_LOGIN",
      actorId: "anonymous",
      actorEmail: email,
      actorRole: "Guest",
      resource: "/api/v1/auth/login",
      status: "failure",
      metadata: { error: err.message }
    });
    res.status(401).json({ error: err.message });
  }
});

// GET /api/v1/auth/session
router.get("/session", authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    authenticated: true,
    user: req.user
  });
});

// POST /api/v1/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("session_token");
  res.status(200).json({ message: "Logout successful" });
});

// RBAC Guarded Route Demo
router.get("/admin/dashboard", authenticateToken, authorizeRoles("admin", "Admin"), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    message: "Welcome to the high-security operational terminal",
    grantedAt: new Date().toISOString(),
    adminUser: req.user
  });
});

export default router;
