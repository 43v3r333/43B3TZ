import { CanonicalMarketDTO } from "../markets/types";
import { marketHistoryStore } from "../history";
import { marketEventBus } from "../events";

export interface MarketSnapshot {
  snapshotId: string;
  timestamp: string;
  marketsCount: number;
  markets: CanonicalMarketDTO[];
}

export class MarketSnapshotEngine {
  /**
   * Captures the state of the entire market platform at this precise millisecond.
   */
  public static captureSnapshot(): MarketSnapshot {
    const allRecords = marketHistoryStore.getAllRecords();
    
    // Group by marketId (fixtureId + marketType + providerId) and get the absolute newest state for each
    const latestMarketsMap: Record<string, CanonicalMarketDTO> = {};
    for (const rec of allRecords) {
      const existing = latestMarketsMap[rec.marketId];
      if (!existing || new Date(rec.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        latestMarketsMap[rec.marketId] = rec;
      }
    }

    const snapshotMarkets = Object.values(latestMarketsMap);

    const snapshot: MarketSnapshot = {
      snapshotId: `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      marketsCount: snapshotMarkets.length,
      markets: snapshotMarkets
    };

    marketEventBus.publish("SnapshotCreated", "all", "all", {
      snapshotId: snapshot.snapshotId,
      marketsCount: snapshot.marketsCount
    });

    return snapshot;
  }

  /**
   * Performs a historical query to reconstruct the market state as of a specific point in time.
   */
  public static reconstructStateAt(timestamp: string): CanonicalMarketDTO[] {
    const targetMs = new Date(timestamp).getTime();
    const allRecords = marketHistoryStore.getAllRecords();

    // Filter out records newer than the target timestamp
    const historicalBefore = allRecords.filter(r => new Date(r.timestamp).getTime() <= targetMs);

    // Group by marketId and keep only the latest version before the target time
    const reconstructedMap: Record<string, CanonicalMarketDTO> = {};
    for (const rec of historicalBefore) {
      const existing = reconstructedMap[rec.marketId];
      if (!existing || new Date(rec.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        reconstructedMap[rec.marketId] = rec;
      }
    }

    return Object.values(reconstructedMap);
  }

  /**
   * Replays historical records between two points in time sequentially to audit changes or test engines.
   */
  public static replayMarketSequence(
    startTime: string,
    endTime: string,
    onStep: (market: CanonicalMarketDTO) => void
  ): number {
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    
    const sortedRecords = marketHistoryStore.getAllRecords()
      .filter(r => {
        const t = new Date(r.timestamp).getTime();
        return t >= startMs && t <= endMs;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const rec of sortedRecords) {
      onStep(rec);
    }

    return sortedRecords.length;
  }
}
