import { createLogger } from "../../core/logger";

const logger = createLogger("RetryEngine");

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number; // Max consecutive failures before opening
  recoveryTimeoutMs: number; // Time in OPEN state before transitioning to HALF_OPEN
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitter: boolean;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private consecutiveFailures = 0;
  private lastStateChange: number = Date.now();
  private name: string;
  private config: CircuitBreakerConfig;

  constructor(name: string, config: CircuitBreakerConfig) {
    this.name = name;
    this.config = config;
  }

  public getState(): CircuitState {
    this.checkRecovery();
    return this.state;
  }

  private checkRecovery() {
    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.lastStateChange;
      if (elapsed >= this.config.recoveryTimeoutMs) {
        this.transitionTo("HALF_OPEN");
      }
    }
  }

  private transitionTo(newState: CircuitState) {
    logger.warn(`Circuit [${this.name}] transitioning from ${this.state} -> ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();
  }

  public recordSuccess() {
    this.consecutiveFailures = 0;
    if (this.state === "HALF_OPEN") {
      this.transitionTo("CLOSED");
    }
  }

  public recordFailure() {
    this.consecutiveFailures++;
    logger.warn(`Circuit [${this.name}] recorded failure #${this.consecutiveFailures}`);
    if (this.state === "CLOSED" && this.consecutiveFailures >= this.config.failureThreshold) {
      this.transitionTo("OPEN");
    } else if (this.state === "HALF_OPEN") {
      // Any failure in HALF_OPEN trips it right back to OPEN
      this.transitionTo("OPEN");
    }
  }

  public canExecute(): boolean {
    this.checkRecovery();
    return this.state !== "OPEN";
  }
}

export class DeadLetterQueue {
  private static dlq: Array<{
    timestamp: string;
    providerName: string;
    action: string;
    error: string;
    payload: any;
  }> = [];

  public static push(providerName: string, action: string, error: Error, payload: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      providerName,
      action,
      error: error.message,
      payload
    };
    this.dlq.push(entry);
    logger.error(`Dead Letter Queue (DLQ) received entry from provider [${providerName}] action [${action}]`, entry);
  }

  public static getEntries() {
    return this.dlq;
  }

  public static clear() {
    this.dlq.length = 0;
  }
}

export enum ErrorCategory {
  RETRYABLE_TRANSIENT,
  RETRYABLE_RATE_LIMIT,
  NON_RETRYABLE_AUTH,
  NON_RETRYABLE_CLIENT,
  UNKNOWN
}

export class FailureClassifier {
  public static classify(error: Error | any): ErrorCategory {
    const msg = (error?.message || "").toLowerCase();
    
    if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")) {
      return ErrorCategory.RETRYABLE_RATE_LIMIT;
    }
    
    if (msg.includes("timeout") || msg.includes("network") || msg.includes("503") || msg.includes("504") || msg.includes("502")) {
      return ErrorCategory.RETRYABLE_TRANSIENT;
    }

    if (msg.includes("auth") || msg.includes("unauthorized") || msg.includes("401") || msg.includes("403") || msg.includes("api key")) {
      return ErrorCategory.NON_RETRYABLE_AUTH;
    }

    if (msg.includes("bad request") || msg.includes("400") || msg.includes("404")) {
      return ErrorCategory.NON_RETRYABLE_CLIENT;
    }

    return ErrorCategory.UNKNOWN;
  }
}

export class RetryEngine {
  public static async execute<T>(
    providerName: string,
    actionName: string,
    operation: () => Promise<T>,
    retryConfig: RetryConfig,
    circuitBreaker?: CircuitBreaker,
    inputPayload?: any
  ): Promise<T> {
    if (circuitBreaker && !circuitBreaker.canExecute()) {
      throw new Error(`Circuit breaker is OPEN for provider: ${providerName}. Short-circuiting execution.`);
    }

    let attempt = 0;
    while (true) {
      attempt++;
      try {
        const result = await operation();
        if (circuitBreaker) {
          circuitBreaker.recordSuccess();
        }
        return result;
      } catch (err: any) {
        const category = FailureClassifier.classify(err);
        const isRetryable = category === ErrorCategory.RETRYABLE_TRANSIENT || 
                            category === ErrorCategory.RETRYABLE_RATE_LIMIT || 
                            category === ErrorCategory.UNKNOWN;

        logger.warn(`Execution failed for provider [${providerName}] action [${actionName}] (Attempt ${attempt}/${retryConfig.maxAttempts}). Category: ${ErrorCategory[category]}`, {
          error: err.message
        });

        if (circuitBreaker) {
          circuitBreaker.recordFailure();
        }

        if (attempt >= retryConfig.maxAttempts || !isRetryable) {
          // Send to DLQ
          DeadLetterQueue.push(providerName, actionName, err, inputPayload);
          throw err;
        }

        // Calculate backoff delay
        let delay = retryConfig.initialDelayMs * Math.pow(retryConfig.factor, attempt - 1);
        if (retryConfig.jitter) {
          // Traditional full jitter formula
          delay = Math.floor(Math.random() * delay);
        }
        delay = Math.min(delay, retryConfig.maxDelayMs);

        logger.info(`Backing off for ${delay}ms before next retry attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
