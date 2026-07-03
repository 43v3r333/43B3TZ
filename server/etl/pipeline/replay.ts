import { etlStorage } from "../storage/storage";
import { etlLandingLayer } from "../landing/landing";
import { etlPipelineOrchestrator } from "./pipeline";
import { etlEventBus } from "../events/events";
import { etlMetricsTracker } from "../metrics/metrics";
import { PipelineEventType, EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLReplayEngine");

export interface ReplayFilters {
  providerName?: string;
  entityType?: EntityType;
  checksum?: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
}

export class ReplayEngine {
  /**
   * Executes a historic replay session of raw landing payloads according to filter criteria.
   */
  public async executeReplay(filters: ReplayFilters = {}): Promise<{
    processed: number;
    successes: number;
    failures: number;
    durationMs: number;
  }> {
    const startTime = Date.now();
    logger.info("Initiating historical payload replay session...", { filters });

    // Publish ReplayStarted event
    etlEventBus.publish(
      PipelineEventType.ReplayStarted,
      filters.providerName || "ALL",
      filters.entityType || "fixture",
      { filters },
      undefined,
      undefined
    );

    // Retrieve raw landing records
    let records = etlStorage.getRawRecords();

    // 1. Filter by precise Checksum
    if (filters.checksum) {
      records = records.filter(r => r.checksum === filters.checksum);
    }

    // 2. Filter by Provider Name
    if (filters.providerName) {
      records = records.filter(r => r.providerName.toLowerCase() === filters.providerName!.toLowerCase());
    }

    // 3. Filter by Entity Type
    if (filters.entityType) {
      records = records.filter(r => r.entityType === filters.entityType);
    }

    // 4. Filter by Date Range
    if (filters.startDate) {
      const startMs = new Date(filters.startDate).getTime();
      records = records.filter(r => new Date(r.timestamp).getTime() >= startMs);
    }
    if (filters.endDate) {
      const endMs = new Date(filters.endDate).getTime();
      records = records.filter(r => new Date(r.timestamp).getTime() <= endMs);
    }

    // 5. Filter by Event association
    if (filters.eventId) {
      const matchedEvent = etlEventBus.getHistory().find(e => e.eventId === filters.eventId);
      if (matchedEvent && matchedEvent.landingId) {
        records = records.filter(r => r.landingId === matchedEvent.landingId);
      } else {
        // Event not found, filter to empty
        records = [];
      }
    }

    logger.info(`Found ${records.length} raw landing record(s) matching replay filters.`);

    let successes = 0;
    let failures = 0;

    // Process each matched raw payload through the pipeline sequentially
    for (const record of records) {
      try {
        const rawPayload = etlLandingLayer.extractRaw(record);
        
        // Disable Landing and Event Publication during replays if we want to avoid double-logging raw events,
        // but here we run it with a distinct operator tag "replay_operator"
        const result = await etlPipelineOrchestrator.process(
          record.providerName,
          record.entityType,
          rawPayload,
          "replay_operator"
        );

        if (result.success) {
          successes++;
        } else {
          failures++;
        }
      } catch (err: any) {
        logger.error(`Replay failed on landing record '${record.landingId}'`, { error: err.message });
        failures++;
      }
    }

    const durationMs = Date.now() - startTime;
    etlMetricsTracker.recordReplayDuration(durationMs);

    logger.info("Historic replay session finished.", {
      processed: records.length,
      successes,
      failures,
      durationMs
    });

    // Publish ReplayCompleted event
    etlEventBus.publish(
      PipelineEventType.ReplayCompleted,
      filters.providerName || "ALL",
      filters.entityType || "fixture",
      { processed: records.length, successes, failures, durationMs },
      undefined,
      undefined
    );

    return {
      processed: records.length,
      successes,
      failures,
      durationMs
    };
  }
}

export const etlReplayEngine = new ReplayEngine();
