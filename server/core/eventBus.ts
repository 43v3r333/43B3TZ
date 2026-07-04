import { createLogger } from "./logger";

const logger = createLogger("EventBus");

export type EventType =
  | "PredictionCreated"
  | "PredictionUpdated"
  | "ExperimentCompleted"
  | "ModelEvaluated"
  | "OddsUpdated"
  | "UserAuthenticated"
  | "ResearchStarted"
  | "ResearchFinished"
  | "DataAcquired"
  | "QualityCheckCompleted"
  | "ModelTrainingTriggered"
  | "ModelDeploymentRequested"
  | "SystemOptimized"
  | "AnomalousDriftDetected"
  | "TaskDelegated"
  | "WorkflowCompleted";

export interface AppEvent<T = any> {
  type: EventType;
  timestamp: string;
  payload: T;
}

export type EventCallback<T = any> = (event: AppEvent<T>) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(type: EventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  public publish<T = any>(type: EventType, payload: T): void {
    const event: AppEvent<T> = {
      type,
      timestamp: new Date().toISOString(),
      payload
    };

    const callbacks = this.listeners.get(type);
    if (!callbacks || callbacks.size === 0) {
      return;
    }

    // Execute asynchronously to support the non-blocking execution requirement
    setImmediate(() => {
      callbacks.forEach(async (cb) => {
        try {
          await cb(event);
        } catch (err: any) {
          logger.error(`Error handling event "${type}" in callback`, { error: err.message });
        }
      });
    });
  }
}

export const eventBus = EventBus.getInstance();
