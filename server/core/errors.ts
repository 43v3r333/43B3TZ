/**
 * Centralized Domain Error Classes for the 43B3TZ Platform.
 * Supports consistent error structures, typed fields, and automatic HTTP status mapping.
 */

export abstract class PlatformBaseError extends Error {
  public abstract readonly statusCode: number;
  public readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when user input validation fails.
 * HTTP 400 Bad Request
 */
export class ValidationError extends PlatformBaseError {
  public readonly statusCode = 400;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Thrown when database operations, transactions, or queries fail.
 * HTTP 500 Internal Server Error
 */
export class DatabaseError extends PlatformBaseError {
  public readonly statusCode = 500;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Thrown when ML/Prediction inference or confidence pipelines fail.
 * HTTP 422 Unprocessable Entity
 */
export class PredictionError extends PlatformBaseError {
  public readonly statusCode = 422;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Thrown when external AI API providers (Gemini, OpenAI, Anthropic, etc.) fail or return errors.
 * HTTP 502 Bad Gateway
 */
export class AIProviderError extends PlatformBaseError {
  public readonly statusCode = 502;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Thrown when authentication or authorization checks fail.
 * HTTP 401 Unauthorized
 */
export class AuthenticationError extends PlatformBaseError {
  public readonly statusCode = 401;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Thrown during bootstrap or runtime when environment configurations are missing or invalid.
 * HTTP 500 Internal Server Error
 */
export class ConfigurationError extends PlatformBaseError {
  public readonly statusCode = 500;
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}
