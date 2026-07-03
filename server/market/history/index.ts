import { CanonicalMarketDTO } from "../markets/types";
import { createLogger } from "../../core/logger";

const logger = createLogger("MarketHistoryStore");

class MarketHistoryStore {
  private records: CanonicalMarketDTO[] = [];

  public logMarket(market: CanonicalMarketDTO): void {
    this.records.push(JSON.parse(JSON.stringify(market))); // clone deep
    
    // Cap in-memory history to avoid overflow (e.g. 5000 records)
    if (this.records.length > 5000) {
      this.records.shift();
    }
  }

  public getMarketHistory(marketId: string): CanonicalMarketDTO[] {
    return this.records.filter(r => r.marketId === marketId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  public getFixtureHistory(fixtureId: string): CanonicalMarketDTO[] {
    return this.records.filter(r => r.fixtureId === fixtureId).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  public getAllRecords(): CanonicalMarketDTO[] {
    return [...this.records];
  }

  public clear(): void {
    this.records = [];
  }
}

export const marketHistoryStore = new MarketHistoryStore();
export { MarketHistoryStore };
