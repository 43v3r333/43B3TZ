import { BaseProvider, ProviderHealthStatus } from "../interfaces/provider";
import { ProviderMetricsTracker } from "../core/metrics";
import { createLogger } from "../../core/logger";

const logger = createLogger("ProviderHealthMonitor");

export interface ProviderHealthRecord {
  providerName: string;
  status: ProviderHealthStatus;
  healthScore: number; // calculated 0 to 100
  lastChecked: string;
}

export class ProviderHealthMonitor {
  private static instance: ProviderHealthMonitor;
  private records: Map<string, ProviderHealthRecord> = new Map();

  private constructor() {}

  public static getInstance(): ProviderHealthMonitor {
    if (!ProviderHealthMonitor.instance) {
      ProviderHealthMonitor.instance = new ProviderHealthMonitor();
    }
    return ProviderHealthMonitor.instance;
  }

  // Calculate a weighted health score (0-100) based on multiple metrics
  public calculateHealthScore(status: ProviderHealthStatus): number {
    if (!status.available) return 0;

    let score = 100;

    // Penalty for failure rate (up to -40 points)
    score -= Math.floor(status.failureRate * 40);

    // Penalty for high latency (up to -20 points)
    if (status.latencyMs > 2000) score -= 20;
    else if (status.latencyMs > 1000) score -= 15;
    else if (status.latencyMs > 500) score -= 10;
    else if (status.latencyMs > 200) score -= 5;

    // Penalty for rate limits running thin (up to -20 points)
    const rlRemainingRatio = status.rateLimitStatus.limit > 0
      ? status.rateLimitStatus.remaining / status.rateLimitStatus.limit
      : 1.0;
    if (rlRemainingRatio < 0.1) score -= 20;
    else if (rlRemainingRatio < 0.25) score -= 15;
    else if (rlRemainingRatio < 0.5) score -= 8;

    // Penalty for auth failure (forces score to 0 or highly degraded)
    if (status.authStatus === "failed") {
      score = 0;
    } else if (status.authStatus === "unauthenticated") {
      score -= 30;
    }

    // Penalty for stale data (up to -20 points)
    if (status.dataFreshnessSeconds > 1800) { // stale > 30 mins
      score -= 20;
    } else if (status.dataFreshnessSeconds > 600) { // stale > 10 mins
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  public async evaluateProvider(provider: BaseProvider): Promise<ProviderHealthRecord> {
    const startTime = Date.now();
    let available = true;
    let authStatus: "authenticated" | "unauthenticated" | "failed" = "authenticated";
    
    try {
      // First, attempt standard authentication ping
      const authed = await provider.authenticate();
      authStatus = authed ? "authenticated" : "failed";
    } catch (err) {
      authStatus = "failed";
    }

    let providerStatus: ProviderHealthStatus;
    try {
      providerStatus = await provider.health();
    } catch (err: any) {
      logger.error(`Error running health probe for provider [${provider.name}]`, { error: err.message });
      available = false;
      providerStatus = {
        available: false,
        latencyMs: Date.now() - startTime,
        successRate: 0,
        failureRate: 1.0,
        rateLimitStatus: { limit: 0, remaining: 0, resetTime: new Date().toISOString() },
        authStatus: "failed",
        lastSuccessfulSync: null,
        cacheHitRatio: 0,
        dataFreshnessSeconds: -1
      };
    }

    // Inject live tracking metrics to back up the health check
    const tracker = ProviderMetricsTracker.getOrCreate(provider.name);
    const metrics = tracker.getMetrics();
    
    // Merge actual observed metrics with provider status
    const mergedStatus: ProviderHealthStatus = {
      available: available && providerStatus.available,
      latencyMs: providerStatus.latencyMs > 0 ? providerStatus.latencyMs : (Date.now() - startTime),
      successRate: metrics.availability,
      failureRate: 1.0 - metrics.availability,
      rateLimitStatus: providerStatus.rateLimitStatus,
      authStatus: authStatus,
      lastSuccessfulSync: metrics.lastSuccessfulSyncTime > 0 ? new Date(metrics.lastSuccessfulSyncTime).toISOString() : providerStatus.lastSuccessfulSync,
      cacheHitRatio: metrics.cacheHitRatio,
      dataFreshnessSeconds: metrics.freshnessSeconds
    };

    const healthScore = this.calculateHealthScore(mergedStatus);
    const record: ProviderHealthRecord = {
      providerName: provider.name,
      status: mergedStatus,
      healthScore,
      lastChecked: new Date().toISOString()
    };

    this.records.set(provider.name, record);
    logger.debug(`Evaluated provider [${provider.name}]. Health Score: ${healthScore}/100`);
    
    return record;
  }

  public getRecord(providerName: string): ProviderHealthRecord | null {
    return this.records.get(providerName) || null;
  }

  public getAllRecords(): ProviderHealthRecord[] {
    return Array.from(this.records.values());
  }
}

export const providerHealthMonitor = ProviderHealthMonitor.getInstance();
