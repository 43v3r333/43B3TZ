import { createLogger } from "../../core/logger";

const logger = createLogger("ProviderMetrics");

export interface RawMetrics {
  requestCount: number;
  successCount: number;
  failureCount: number;
  totalLatencyMs: number;
  cacheHits: number;
  cacheMisses: number;
  retriesCount: number;
  rateLimitsTriggered: number;
  lastSuccessfulSyncTime: number; // timestamp
}

export class ProviderMetricsTracker {
  private static registries: Map<string, ProviderMetricsTracker> = new Map();
  private providerName: string;
  private metrics: RawMetrics;

  private constructor(providerName: string) {
    this.providerName = providerName;
    this.metrics = {
      requestCount: 0,
      successCount: 0,
      failureCount: 0,
      totalLatencyMs: 0,
      cacheHits: 0,
      cacheMisses: 0,
      retriesCount: 0,
      rateLimitsTriggered: 0,
      lastSuccessfulSyncTime: 0,
    };
  }

  public static getOrCreate(providerName: string): ProviderMetricsTracker {
    if (!ProviderMetricsTracker.registries.has(providerName)) {
      ProviderMetricsTracker.registries.set(providerName, new ProviderMetricsTracker(providerName));
    }
    return ProviderMetricsTracker.registries.get(providerName)!;
  }

  public recordRequest(latencyMs: number, success: boolean) {
    this.metrics.requestCount++;
    this.metrics.totalLatencyMs += latencyMs;
    if (success) {
      this.metrics.successCount++;
      this.metrics.lastSuccessfulSyncTime = Date.now();
    } else {
      this.metrics.failureCount++;
    }
  }

  public recordCache(hit: boolean) {
    if (hit) this.metrics.cacheHits++;
    else this.metrics.cacheMisses++;
  }

  public recordRetry() {
    this.metrics.retriesCount++;
  }

  public recordRateLimit() {
    this.metrics.rateLimitsTriggered++;
  }

  public getMetrics() {
    const avgLatency = this.metrics.successCount > 0 
      ? parseFloat((this.metrics.totalLatencyMs / this.metrics.requestCount).toFixed(2)) 
      : 0;

    const cacheHitRatio = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? parseFloat((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)).toFixed(3))
      : 0;

    const freshnessSeconds = this.metrics.lastSuccessfulSyncTime > 0
      ? Math.floor((Date.now() - this.metrics.lastSuccessfulSyncTime) / 1000)
      : -1;

    const availability = this.metrics.requestCount > 0
      ? parseFloat((this.metrics.successCount / this.metrics.requestCount).toFixed(3))
      : 1.0;

    return {
      ...this.metrics,
      averageLatencyMs: avgLatency,
      cacheHitRatio,
      freshnessSeconds,
      availability,
    };
  }

  public static getAllMetrics(): Record<string, any> {
    const all: Record<string, any> = {};
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      all[name] = tracker.getMetrics();
    });
    return all;
  }

  // Generates official Prometheus-compliant text payload
  public static generatePrometheusText(): string {
    let output = "";
    
    output += "# HELP sports_provider_requests_total Total number of requests triggered to external providers\n";
    output += "# TYPE sports_provider_requests_total counter\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      output += `sports_provider_requests_total{provider="${name}"} ${tracker.metrics.requestCount}\n`;
    });

    output += "\n# HELP sports_provider_success_total Total successful request count\n";
    output += "# TYPE sports_provider_success_total counter\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      output += `sports_provider_success_total{provider="${name}"} ${tracker.metrics.successCount}\n`;
    });

    output += "\n# HELP sports_provider_failure_total Total failed request count\n";
    output += "# TYPE sports_provider_failure_total counter\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      output += `sports_provider_failure_total{provider="${name}"} ${tracker.metrics.failureCount}\n`;
    });

    output += "\n# HELP sports_provider_latency_average_ms Average API latency in milliseconds\n";
    output += "# TYPE sports_provider_latency_average_ms gauge\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      const stats = tracker.getMetrics();
      output += `sports_provider_latency_average_ms{provider="${name}"} ${stats.averageLatencyMs}\n`;
    });

    output += "\n# HELP sports_provider_cache_hit_ratio The ratio of cache hits to overall requests\n";
    output += "# TYPE sports_provider_cache_hit_ratio gauge\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      const stats = tracker.getMetrics();
      output += `sports_provider_cache_hit_ratio{provider="${name}"} ${stats.cacheHitRatio}\n`;
    });

    output += "\n# HELP sports_provider_availability Percentage of successful inquiries against total\n";
    output += "# TYPE sports_provider_availability gauge\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      const stats = tracker.getMetrics();
      output += `sports_provider_availability{provider="${name}"} ${stats.availability}\n`;
    });

    output += "\n# HELP sports_provider_data_freshness_seconds Seconds elapsed since last successful sync\n";
    output += "# TYPE sports_provider_data_freshness_seconds gauge\n";
    ProviderMetricsTracker.registries.forEach((tracker, name) => {
      const stats = tracker.getMetrics();
      output += `sports_provider_data_freshness_seconds{provider="${name}"} ${stats.freshnessSeconds}\n`;
    });

    return output;
  }
}
