import { PipelineEvent, PipelineEventType, EntityType } from "../types";
import { redis } from "../../core/redis";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLEventBus");

export class EventBus {
  private eventHistory: PipelineEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Publishes an event to the Redis messaging network and logs it locally
   */
  public publish(
    eventType: PipelineEventType,
    providerName: string,
    entityType: EntityType,
    payload: any,
    landingId?: string,
    checksum?: string
  ): PipelineEvent {
    const event: PipelineEvent = {
      eventId: `evt-${eventType.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      eventType,
      timestamp: new Date().toISOString(),
      providerName,
      entityType,
      payload,
      landingId,
      checksum
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Publish to simulated Redis pub-sub network
    const redisChannel = `etl:events:${eventType}`;
    try {
      redis.publish(redisChannel, event);
    } catch (err: any) {
      logger.error(`Failed to publish event to Redis pub-sub channel '${redisChannel}'`, { error: err.message });
    }

    logger.info(`ETL Event Published: ${eventType}`, {
      eventId: event.eventId,
      entityType,
      providerName,
      landingId
    });

    return event;
  }

  /**
   * Returns a list of all historical published pipeline events
   */
  public getHistory(): PipelineEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Registers a callback listener for a specific channel type
   */
  public subscribe(eventType: PipelineEventType, callback: (event: PipelineEvent) => void) {
    const redisChannel = `etl:events:${eventType}`;
    redis.subscribe(redisChannel, (msg) => {
      try {
        callback(msg as PipelineEvent);
      } catch (err: any) {
        logger.error(`Callback error in subscription for channel '${redisChannel}'`, { error: err.message });
      }
    });
    logger.debug(`Subscribed callback listener to ${eventType}`);
  }

  /**
   * Truncates historical events list
   */
  public clearHistory() {
    this.eventHistory = [];
    logger.info("ETL Event history cleared");
  }
}

export const etlEventBus = new EventBus();
