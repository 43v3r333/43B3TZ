import express, { Request, Response, NextFunction } from "express";
import { authService, JWTSession } from "../services/auth";
import { db } from "../core/db";

const router = express.Router();

// Extends Express Request type locally
export interface AuthenticatedRequest extends Request {
  user?: JWTSession;
}

// Authentication Guard Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.headers["authorization"] as string;
  
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  } else {
    // Check if cookie is set (fallback)
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

// Authorization guard for specific RBAC roles
export function authorizeRoles(...allowedRoles: Array<"admin" | "trader">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Session not active" });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Access level insufficient" });
    }
    
    next();
  };
}

// POST /api/v1/auth/register
router.post("/register", (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const user = authService.registerUser(email, password, role || "trader");
    
    // Auto login upon registration
    const { token } = authService.authenticateUser(email, password);
    
    // Set cookie
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
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
    res.status(400).json({ error: err.message });
  }
});

// POST /api/v1/auth/login
router.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = authService.authenticateUser(email, password);
    
    res.cookie("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
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
router.get("/admin/dashboard", authenticateToken, authorizeRoles("admin"), (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    message: "Welcome to the high-security operational terminal",
    grantedAt: new Date().toISOString(),
    adminUser: req.user
  });
});

export default router;
