import crypto from "crypto";
import { createLogger, Logger } from "../core/logger";
import { config } from "../core/config";
import { db, DBUser } from "../core/db";

const logger = createLogger("AuthService");

export interface JWTSession {
  user_id: string;
  email: string;
  role: "admin" | "trader";
  exp: number;
}

export class AuthService {
  // Password hashing via PBKDF2
  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return `${salt}:${hash}`;
  }

  public verifyPassword(password: string, storedHash: string): boolean {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return testHash === hash;
  }

  // Base64Url Utilities for JWT
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf8");
  }

  // Symmetric HS256 JWT token signing
  public signToken(payload: Record<string, any>, lifespanMinutes: number = 60): string {
    const header = { alg: "HS256", typ: "JWT" };
    const exp = Math.floor(Date.now() / 1000) + lifespanMinutes * 60;
    
    const enrichedPayload = { ...payload, exp };
    
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(enrichedPayload));
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac("sha256", config.jwtSecret)
      .update(signatureInput)
      .digest("base64url");
      
    return `${signatureInput}.${signature}`;
  }

  public verifyToken(token: string): JWTSession | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      
      const [header, payload, signature] = parts;
      const signatureInput = `${header}.${payload}`;
      const expectedSignature = crypto
        .createHmac("sha256", config.jwtSecret)
        .update(signatureInput)
        .digest("base64url");
        
      if (signature !== expectedSignature) {
        logger.warn("JWT token signature validation failed");
        return null;
      }
      
      const decodedPayload = JSON.parse(this.base64UrlDecode(payload)) as JWTSession;
      
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        logger.warn("JWT session has expired", { expiredAt: new Date(decodedPayload.exp * 1000).toISOString() });
        return null;
      }
      
      return decodedPayload;
    } catch (err: any) {
      logger.error("Error during JWT token verification", { error: err.message });
      return null;
    }
  }

  // Core User registration transaction logic
  public registerUser(email: string, password: string, role: "admin" | "trader" = "trader"): DBUser {
    const emailLower = email.trim().toLowerCase();
    
    if (!emailLower || !password) {
      throw new Error("Validation failure: email and password are required");
    }
    
    if (password.length < 8) {
      throw new Error("Validation failure: password must be at least 8 characters long");
    }

    const password_hash = this.hashPassword(password);
    const user_id = `usr-${crypto.randomBytes(8).toString("hex")}`;
    
    const newUser: DBUser = {
      user_id,
      email: emailLower,
      password_hash,
      role,
      created_at: new Date().toISOString()
    };
    
    db.insert("users", newUser);
    
    // Seed initial bankroll for user
    db.insert("bankroll", {
      user_id,
      balance: 10000.00, // Preloaded with $10,000 for standard trading simulation
      currency: "USD",
      last_updated: new Date().toISOString()
    });

    logger.info("Successfully registered trader account", { user_id, email: emailLower, role });
    return newUser;
  }

  // Core User authentication logic
  public authenticateUser(email: string, password: string): { user: DBUser; token: string } {
    const emailLower = email.trim().toLowerCase();
    const user = db.selectOne("users", "email", emailLower) as DBUser | null;
    
    if (!user) {
      logger.warn("Login attempt failed: email not found", { email: emailLower });
      throw new Error("Invalid credentials");
    }
    
    const isValid = this.verifyPassword(password, user.password_hash);
    if (!isValid) {
      logger.warn("Login attempt failed: incorrect password", { email: emailLower });
      throw new Error("Invalid credentials");
    }
    
    const token = this.signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });
    
    logger.info("Trader authenticated successfully", { user_id: user.user_id, email: emailLower });
    return { user, token };
  }
}

export const authService = new AuthService();
