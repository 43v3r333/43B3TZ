import { createLogger } from "../../core/logger";

const logger = createLogger("RateLimiter");

export interface RateLimitConfig {
  maxRequestsPerSecond: number;
  maxRequestsPerMinute: number;
  burstLimit: number;
}

interface QueuedRequest {
  resolve: () => void;
  reject: (err: Error) => void;
  priority: number;
  timestamp: number;
}

export class ProviderRateLimiter {
  private providerName: string;
  private config: RateLimitConfig;
  
  // Tracking timestamps
  private secRequests: number[] = [];
  private minRequests: number[] = [];
  
  // Queue & Backpressure
  private queue: QueuedRequest[] = [];
  private maxQueueSize = 50;
  
  // Adaptive throttling parameters
  private currentMultiplier = 1.0; // Dynamic scale down on 429 triggers
  private lastThrottleTime = 0;

  constructor(providerName: string, config: RateLimitConfig) {
    this.providerName = providerName;
    this.config = config;
  }

  // Adaptive feedback loop: dynamically throttles limits when receiving backpressure signals
  public recordBackpressure() {
    this.currentMultiplier = Math.max(0.2, this.currentMultiplier - 0.2);
    this.lastThrottleTime = Date.now();
    logger.warn(`Adaptive throttling active for [${this.providerName}]. Multiplier lowered to: ${this.currentMultiplier.toFixed(2)}`);
  }

  private recoverThrottle() {
    // Gradual recovery over time if no backpressure for 15 seconds
    if (this.currentMultiplier < 1.0 && Date.now() - this.lastThrottleTime > 15000) {
      this.currentMultiplier = Math.min(1.0, this.currentMultiplier + 0.1);
      this.lastThrottleTime = Date.now();
      logger.info(`Adaptive throttling recovering for [${this.providerName}]. Multiplier raised to: ${this.currentMultiplier.toFixed(2)}`);
    }
  }

  private cleanRequests(now: number) {
    this.secRequests = this.secRequests.filter(t => now - t < 1000);
    this.minRequests = this.minRequests.filter(t => now - t < 60000);
  }

  private isBelowLimit(now: number): boolean {
    this.cleanRequests(now);
    
    const adjustedMaxSec = Math.max(1, Math.floor(this.config.maxRequestsPerSecond * this.currentMultiplier));
    const adjustedMaxMin = Math.max(5, Math.floor(this.config.maxRequestsPerMinute * this.currentMultiplier));

    if (this.secRequests.length >= adjustedMaxSec) return false;
    if (this.minRequests.length >= adjustedMaxMin) return false;
    
    return true;
  }

  // Core entry point to acquire execution slot
  public async acquire(priority = 0): Promise<void> {
    this.recoverThrottle();
    const now = Date.now();

    if (this.isBelowLimit(now) && this.queue.length === 0) {
      // Record and proceed
      this.secRequests.push(now);
      this.minRequests.push(now);
      return;
    }

    // Queue request if rate limited
    if (this.queue.length >= this.maxQueueSize) {
      logger.error(`Rate limiting queue overflow for [${this.providerName}]. Backpressure triggered.`);
      throw new Error(`Rate limit queue overflow for provider: ${this.providerName}. Backpressure limit hit.`);
    }

    logger.info(`Rate limit hit for [${this.providerName}]. Queueing request. Priority: ${priority}. Current Queue: ${this.queue.length}`);
    
    return new Promise<void>((resolve, reject) => {
      const queued: QueuedRequest = {
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };
      
      this.queue.push(queued);
      // Sort queue by priority descending (highest first), then FIFO timestamp
      this.queue.sort((a, b) => b.priority - a.priority || a.timestamp - b.timestamp);
      
      this.scheduleQueueProcessor();
    });
  }

  private queueProcessorActive = false;

  private scheduleQueueProcessor() {
    if (this.queueProcessorActive) return;
    this.queueProcessorActive = true;
    
    const process = () => {
      if (this.queue.length === 0) {
        this.queueProcessorActive = false;
        return;
      }

      const now = Date.now();
      if (this.isBelowLimit(now)) {
        const next = this.queue.shift();
        if (next) {
          logger.debug(`Releasing queued request for [${this.providerName}]. Remaining in queue: ${this.queue.length}`);
          this.secRequests.push(now);
          this.minRequests.push(now);
          next.resolve();
        }
      }

      // Re-evaluate in 100ms
      setTimeout(process, 100);
    };

    setTimeout(process, 50);
  }

  public getStatus() {
    this.cleanRequests(Date.now());
    return {
      secCount: this.secRequests.length,
      minCount: this.minRequests.length,
      queueSize: this.queue.length,
      adaptiveMultiplier: this.currentMultiplier,
    };
  }
}
