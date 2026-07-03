import { IntelligenceEvent, IntelligenceEventType } from "../types";
import { createLogger } from "../../../core/logger";

const logger = createLogger("PredictionIntelligenceEvents");

class IntelligenceEventStore {
  private events: IntelligenceEvent[] = [];
  private listeners: ((event: IntelligenceEvent) => void)[] = [];

  public publish(eventType: IntelligenceEventType, predictionId: string, payload: Record<string, any>): IntelligenceEvent {
    const event: IntelligenceEvent = {
      eventId: `evt_${eventType.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType,
      predictionId,
      timestamp: new Date().toISOString(),
      payload
    };

    this.events.push(event);
    logger.info(`[EVENT] [${eventType}] PredictionId: ${predictionId} - EventId: ${event.eventId}`);

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        logger.error(`Error in listener for event ${eventType}:`, err);
      }
    });

    // Keep events array bounded to last 2000 events
    if (this.events.length > 2000) {
      this.events.shift();
    }

    return event;
  }

  public subscribe(listener: (event: IntelligenceEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getAllEvents(): IntelligenceEvent[] {
    return [...this.events];
  }

  public getEventsByPredictionId(predictionId: string): IntelligenceEvent[] {
    return this.events.filter(e => e.predictionId === predictionId);
  }

  public clear(): void {
    this.events = [];
  }
}

export const intelligenceEventBus = new IntelligenceEventStore();
