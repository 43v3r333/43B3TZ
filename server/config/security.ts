import { ConfigurationError } from "../core/errors";

export interface SecurityConfig {
  jwtSecret: string;
  saltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const jwtSecret = process.env.JWT_SECRET || "platform-enterprise-secret-token-key-256";
if (!jwtSecret || jwtSecret.length < 16) {
  throw new ConfigurationError("JWT_SECRET must be configured and be at least 16 characters long for enterprise security");
}

const saltRoundsStr = process.env.BCRYPT_SALT_ROUNDS || "10";
const saltRounds = parseInt(saltRoundsStr, 10);
if (isNaN(saltRounds) || saltRounds < 4 || saltRounds > 31) {
  throw new ConfigurationError(`Invalid BCRYPT_SALT_ROUNDS: ${saltRoundsStr}. Must be between 4 and 31`);
}

const rateLimitWindowMsStr = process.env.RATE_LIMIT_WINDOW_MS || "900000"; // 15 minutes
const rateLimitWindowMs = parseInt(rateLimitWindowMsStr, 10);
if (isNaN(rateLimitWindowMs) || rateLimitWindowMs <= 0) {
  throw new ConfigurationError(`Invalid RATE_LIMIT_WINDOW_MS: ${rateLimitWindowMsStr}`);
}

const rateLimitMaxRequestsStr = process.env.RATE_LIMIT_MAX_REQUESTS || "100";
const rateLimitMaxRequests = parseInt(rateLimitMaxRequestsStr, 10);
if (isNaN(rateLimitMaxRequests) || rateLimitMaxRequests <= 0) {
  throw new ConfigurationError(`Invalid RATE_LIMIT_MAX_REQUESTS: ${rateLimitMaxRequestsStr}`);
}

export const securityConfig: SecurityConfig = {
  jwtSecret,
  saltRounds,
  rateLimitWindowMs,
  rateLimitMaxRequests,
};
