import { createLogger } from "../../core/logger";

const logger = createLogger("ProviderManager");

export interface ProviderScores {
  reliability: number;
  latency: number;
  freshness: number;
  completeness: number;
  trust: number;
}

export interface ProviderMetadata {
  id: string;
  name: string;
  type: "Official" | "Odds" | "Exchange" | "Weather" | "News";
  scores: ProviderScores;
  status: "Active" | "Degraded" | "Offline";
  lastCheck: string;
}

/**
 * Program 1: GLOBAL DATA PLATFORM
 * Monitors and ranks external data providers.
 */
export class ProviderManager {
  private providers: Map<string, ProviderMetadata> = new Map();

  constructor() {
    this.seedInitialProviders();
  }

  private seedInitialProviders() {
    const initial: ProviderMetadata[] = [
      {
        id: "sportradar_v4",
        name: "SportRadar Enterprise",
        type: "Official",
        status: "Active",
        lastCheck: new Date().toISOString(),
        scores: { reliability: 0.99, latency: 45, freshness: 0.98, completeness: 1.0, trust: 0.99 }
      },
      {
        id: "betfair_exchange",
        name: "Betfair API-NG",
        type: "Exchange",
        status: "Active",
        lastCheck: new Date().toISOString(),
        scores: { reliability: 0.96, latency: 120, freshness: 0.95, completeness: 0.92, trust: 0.94 }
      },
      {
        id: "openweathermap_pro",
        name: "OpenWeather Pro",
        type: "Weather",
        status: "Active",
        lastCheck: new Date().toISOString(),
        scores: { reliability: 0.98, latency: 300, freshness: 0.90, completeness: 0.85, trust: 0.92 }
      }
    ];
    initial.forEach(p => this.providers.set(p.id, p));
  }

  public getProviders(): ProviderMetadata[] {
    return Array.from(this.providers.values()).sort((a, b) => b.scores.trust - a.scores.trust);
  }

  public async checkHealth(): Promise<void> {
    logger.info("Performing provider health check...");
    // Logic to switch providers if status is 'Degraded'
  }
}

export const providerManager = new ProviderManager();
