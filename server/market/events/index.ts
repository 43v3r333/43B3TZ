import { createLogger } from "../../core/logger";

const logger = createLogger("MarketEventBus");

export interface MarketEvent {
  eventId: string;
  eventType: 
    | "MarketOpened"
    | "MarketUpdated"
    | "MarketClosed"
    | "ConsensusUpdated"
    | "MovementDetected"
    | "OverroundCalculated"
    | "ClosingLineRecorded"
    | "AnomalyDetected"
    | "QualityUpdated"
    | "SnapshotCreated";
  timestamp: string;
  marketId: string;
  fixtureId: string;
  payload: any;
}

type MarketEventListener = (event: MarketEvent) => void;

class MarketEventBus {
  private listeners: Map<string, MarketEventListener[]> = new Map();
  private eventHistory: MarketEvent[] = [];

  public subscribe(eventType: string, listener: MarketEventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
    return () => {
      const list = this.listeners.get(eventType);
      if (list) {
        this.listeners.set(eventType, list.filter(l => l !== listener));
      }
    };
  }

  public publish(
    eventType: MarketEvent["eventType"],
    marketId: string,
    fixtureId: string,
    payload: any
  ): MarketEvent {
    const event: MarketEvent = {
      eventId: `mev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      eventType,
      timestamp: new Date().toISOString(),
      marketId,
      fixtureId,
      payload
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    logger.info(`Market Event Published [${eventType}] for marketId: ${marketId}`);

    const subs = this.listeners.get(eventType) || [];
    const wildcardSubs = this.listeners.get("*") || [];
    
    [...subs, ...wildcardSubs].forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        logger.error(`Error in MarketEvent listener:`, err);
      }
    });

    return event;
  }

  public getAllEvents(): MarketEvent[] {
    return [...this.eventHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const marketEventBus = new MarketEventBus();
export { MarketEventBus };
