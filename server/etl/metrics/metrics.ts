import { EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLMetricsTracker");

export class MetricsTracker {
  private recordsProcessed = 0;
  private processedByEntity: Record<string, number> = {};
  
  private failures = 0;
  private failuresByEntity: Record<string, number> = {};

  private retries = 0;
  private duplicates = 0;

  // Quality distribution buckets
  private qualityDistribution = {
    poor: 0,      // [0, 50]
    fair: 0,      // [51, 75]
    good: 0,      // [76, 90]
    excellent: 0  // [91, 100]
  };

  // Latency tracking (in ms)
  private latencies: number[] = [];
  private storageLatencies: number[] = [];
  
  private validationFailuresCount = 0;
  private lastReplayDurationMs = 0;

  public incrementProcessed(entityType: EntityType) {
    this.recordsProcessed++;
    this.processedByEntity[entityType] = (this.processedByEntity[entityType] || 0) + 1;
  }

  public incrementFailures(entityType: EntityType) {
    this.failures++;
    this.failuresByEntity[entityType] = (this.failuresByEntity[entityType] || 0) + 1;
  }

  public incrementRetries() {
    this.retries++;
  }

  public incrementDuplicates() {
    this.duplicates++;
  }

  public incrementValidationFailures() {
    this.validationFailuresCount++;
  }

  public recordQualityScore(score: number) {
    if (score <= 50) this.qualityDistribution.poor++;
    else if (score <= 75) this.qualityDistribution.fair++;
    else if (score <= 90) this.qualityDistribution.good++;
    else this.qualityDistribution.excellent++;
  }

  public recordLatency(durationMs: number) {
    this.latencies.push(durationMs);
    if (this.latencies.length > 500) {
      this.latencies.shift();
    }
  }

  public recordStorageLatency(durationMs: number) {
    this.storageLatencies.push(durationMs);
    if (this.storageLatencies.length > 500) {
      this.storageLatencies.shift();
    }
  }

  public recordReplayDuration(durationMs: number) {
    this.lastReplayDurationMs = durationMs;
  }

  public getAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return parseFloat((sum / this.latencies.length).toFixed(2));
  }

  public getAverageStorageLatency(): number {
    if (this.storageLatencies.length === 0) return 0;
    const sum = this.storageLatencies.reduce((a, b) => a + b, 0);
    return parseFloat((sum / this.storageLatencies.length).toFixed(2));
  }

  /**
   * Generates a fully compliant Prometheus raw scrape string
   */
  public generatePrometheusScrape(): string {
    const lines: string[] = [];

    lines.push("# HELP etl_records_processed_total Total processed records by the ETL platform.");
    lines.push("# TYPE etl_records_processed_total counter");
    lines.push(`etl_records_processed_total_all ${this.recordsProcessed}`);
    Object.keys(this.processedByEntity).forEach(type => {
      lines.push(`etl_records_processed_total{entity_type="${type}"} ${this.processedByEntity[type]}`);
    });

    lines.push("# HELP etl_failures_total Total processing failures by the ETL platform.");
    lines.push("# TYPE etl_failures_total counter");
    lines.push(`etl_failures_total_all ${this.failures}`);
    Object.keys(this.failuresByEntity).forEach(type => {
      lines.push(`etl_failures_total{entity_type="${type}"} ${this.failuresByEntity[type]}`);
    });

    lines.push("# HELP etl_retries_total Total retry attempts in the pipeline.");
    lines.push("# TYPE etl_retries_total counter");
    lines.push(`etl_retries_total ${this.retries}`);

    lines.push("# HELP etl_duplicates_total Total identical duplicates detected and merged/ignored.");
    lines.push("# TYPE etl_duplicates_total counter");
    lines.push(`etl_duplicates_total ${this.duplicates}`);

    lines.push("# HELP etl_validation_failures_total Total schema or business rule validation failures.");
    lines.push("# TYPE etl_validation_failures_total counter");
    lines.push(`etl_validation_failures_total ${this.validationFailuresCount}`);

    lines.push("# HELP etl_pipeline_latency_ms_average Average pipeline execution latency in milliseconds.");
    lines.push("# TYPE etl_pipeline_latency_ms_average gauge");
    lines.push(`etl_pipeline_latency_ms_average ${this.getAverageLatency()}`);

    lines.push("# HELP etl_storage_latency_ms_average Average persistent storage transaction latency in milliseconds.");
    lines.push("# TYPE etl_storage_latency_ms_average gauge");
    lines.push(`etl_storage_latency_ms_average ${this.getAverageStorageLatency()}`);

    lines.push("# HELP etl_last_replay_duration_ms Processing duration of the last executed historic replay session.");
    lines.push("# TYPE etl_last_replay_duration_ms gauge");
    lines.push(`etl_last_replay_duration_ms ${this.lastReplayDurationMs}`);

    // Quality distribution buckets
    lines.push("# HELP etl_quality_distribution Quality scores partitioned by tier.");
    lines.push("# TYPE etl_quality_distribution gauge");
    lines.push(`etl_quality_distribution{tier="poor"} ${this.qualityDistribution.poor}`);
    lines.push(`etl_quality_distribution{tier="fair"} ${this.qualityDistribution.fair}`);
    lines.push(`etl_quality_distribution{tier="good"} ${this.qualityDistribution.good}`);
    lines.push(`etl_quality_distribution{tier="excellent"} ${this.qualityDistribution.excellent}`);

    return lines.join("\n");
  }

  /**
   * Returns a standard JSON representation of the statistics
   */
  public getStatsSummary() {
    return {
      recordsProcessed: this.recordsProcessed,
      processedByEntity: this.processedByEntity,
      failures: this.failures,
      failuresByEntity: this.failuresByEntity,
      retries: this.retries,
      duplicates: this.duplicates,
      qualityDistribution: this.qualityDistribution,
      averageLatencyMs: this.getAverageLatency(),
      averageStorageLatencyMs: this.getAverageStorageLatency(),
      validationFailuresCount: this.validationFailuresCount,
      lastReplayDurationMs: this.lastReplayDurationMs
    };
  }

  public clear() {
    this.recordsProcessed = 0;
    this.processedByEntity = {};
    this.failures = 0;
    this.failuresByEntity = {};
    this.retries = 0;
    this.duplicates = 0;
    this.qualityDistribution = { poor: 0, fair: 0, good: 0, excellent: 0 };
    this.latencies = [];
    this.storageLatencies = [];
    this.validationFailuresCount = 0;
    this.lastReplayDurationMs = 0;
    logger.info("ETL metrics reset");
  }
}

export const etlMetricsTracker = new MetricsTracker();
