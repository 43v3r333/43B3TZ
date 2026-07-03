import { IntelligenceEvent, IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("IntelligenceEvents");

type IntelligenceEventCallback = (event: IntelligenceEvent) => void;

export class IntelligenceEventBus {
  private subscribers: Map<IntelligenceEventType, IntelligenceEventCallback[]> = new Map();
  private eventHistory: IntelligenceEvent[] = [];
  private maxHistory = 1000;

  constructor() {
    // Register all types of events
    Object.values(IntelligenceEventType).forEach(type => {
      this.subscribers.set(type, []);
    });
  }

  public subscribe(eventType: IntelligenceEventType, callback: IntelligenceEventCallback) {
    const list = this.subscribers.get(eventType) || [];
    list.push(callback);
    this.subscribers.set(eventType, list);
  }

  public publish(eventType: IntelligenceEventType, entityId: string, payload: any) {
    const eventId = `intel-evt-${eventType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const event: IntelligenceEvent = {
      eventId,
      eventType,
      timestamp: new Date().toISOString(),
      entityId,
      payload
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    logger.debug(`Broadcasting intelligence event [${eventType}] for entity ID: ${entityId}`);

    // Notify callbacks
    const list = this.subscribers.get(eventType) || [];
    list.forEach(cb => {
      try {
        cb(event);
      } catch (err: any) {
        logger.error(`Error in event callback for type [${eventType}]`, { error: err.message });
      }
    });
  }

  public getHistory(): IntelligenceEvent[] {
    return [...this.eventHistory];
  }

  public clearHistory() {
    this.eventHistory = [];
    logger.info("Intelligence event history cleared.");
  }
}

export const intelligenceEventBus = new IntelligenceEventBus();
