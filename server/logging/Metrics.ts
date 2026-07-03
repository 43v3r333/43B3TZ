/**
 * Lightweight, in-memory Metrics Collector for the 43B3TZ Platform.
 * Supports thread-safe, high-performance increments, timing distributions, and percentile calculations.
 * Prepares the platform for future Prometheus/OpenTelemetry exporter hookups.
 */
export interface SystemMetrics {
  totalRequests: number;
  averageResponseTimeMs: number;
  p95ResponseTimeMs: number;
  predictionCount: number;
  predictionSuccess: number;
  predictionFailure: number;
  databaseReads: number;
  databaseWrites: number;
  aiCalls: number;
  averageAiLatencyMs: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  validationErrors: number;
  authenticationFailures: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;

  // Primary counters
  private totalRequests = 0;
  private predictionCount = 0;
  private predictionSuccess = 0;
  private predictionFailure = 0;
  private databaseReads = 0;
  private databaseWrites = 0;
  private aiCalls = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private errorCount = 0;
  private validationErrors = 0;
  private authenticationFailures = 0;

  // Timing lists for moving average & percentile calculations
  private requestTimes: number[] = [];
  private aiLatencies: number[] = [];
  
  private readonly maxSamples = 10000; // Cap memory footprint of timing arrays

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // Increment utilities
  public incrementRequests(): void { this.totalRequests++; }
  public incrementPredictions(success = true): void {
    this.predictionCount++;
    if (success) this.predictionSuccess++; else this.predictionFailure++;
  }
  public incrementDatabaseReads(): void { this.databaseReads++; }
  public incrementDatabaseWrites(): void { this.databaseWrites++; }
  public incrementAiCalls(): void { this.aiCalls++; }
  public incrementCache(hit: boolean): void { if (hit) this.cacheHits++; else this.cacheMisses++; }
  public incrementErrors(type?: "validation" | "auth" | "generic"): void {
    this.errorCount++;
    if (type === "validation") this.validationErrors++;
    else if (type === "auth") this.authenticationFailures++;
  }

  // Latency recording
  public recordResponseTime(ms: number): void {
    this.requestTimes.push(ms);
    if (this.requestTimes.length > this.maxSamples) {
      this.requestTimes.shift();
    }
  }

  public recordAiLatency(ms: number): void {
    this.aiLatencies.push(ms);
    if (this.aiLatencies.length > this.maxSamples) {
      this.aiLatencies.shift();
    }
  }

  /**
   * Calculates specific metrics and returns full snapshot.
   */
  public getSnapshot(): SystemMetrics {
    const avgResponse = this.requestTimes.length > 0
      ? this.requestTimes.reduce((sum, val) => sum + val, 0) / this.requestTimes.length
      : 0;

    const p95Response = this.calculatePercentile(this.requestTimes, 95);

    const avgAiLatency = this.aiLatencies.length > 0
      ? this.aiLatencies.reduce((sum, val) => sum + val, 0) / this.aiLatencies.length
      : 0;

    return {
      totalRequests: this.totalRequests,
      averageResponseTimeMs: parseFloat(avgResponse.toFixed(2)),
      p95ResponseTimeMs: parseFloat(p95Response.toFixed(2)),
      predictionCount: this.predictionCount,
      predictionSuccess: this.predictionSuccess,
      predictionFailure: this.predictionFailure,
      databaseReads: this.databaseReads,
      databaseWrites: this.databaseWrites,
      aiCalls: this.aiCalls,
      averageAiLatencyMs: parseFloat(avgAiLatency.toFixed(2)),
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      errorCount: this.errorCount,
      validationErrors: this.validationErrors,
      authenticationFailures: this.authenticationFailures,
    };
  }

  /**
   * Resets all internal statistics.
   */
  public reset(): void {
    this.totalRequests = 0;
    this.predictionCount = 0;
    this.predictionSuccess = 0;
    this.predictionFailure = 0;
    this.databaseReads = 0;
    this.databaseWrites = 0;
    this.aiCalls = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.errorCount = 0;
    this.validationErrors = 0;
    this.authenticationFailures = 0;
    this.requestTimes = [];
    this.aiLatencies = [];
  }

  private calculatePercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] ?? 0;
  }
}

export const metricsCollector = MetricsCollector.getInstance();
