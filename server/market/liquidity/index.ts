import { CanonicalMarketDTO } from "../markets/types";

export interface LiquidityProfile {
  marketId: string;
  updateFrequencyPerMin: number;
  averageQuotePersistenceMin: number; // average time a line remains static
  estimatedDepthScore: number;         // 1 - 100
  marketAvailability: number;          // 0 - 1 score of open status duration
  liquidityConfidence: number;         // 0 - 1
}

export class LiquidityEngine {
  /**
   * Generates a liquidity profile from a market's chronological updates.
   */
  public static estimateLiquidity(history: CanonicalMarketDTO[]): LiquidityProfile | null {
    if (history.length === 0) return null;

    const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const durationMins = Math.max(1, (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 60000);
    const updateFrequencyPerMin = sorted.length / durationMins;

    // Calculate quote persistence (average duration between changes in decimal odds)
    let stateChanges = 0;
    let totalPersistenceMs = 0;
    let lastChangeTime = new Date(first.timestamp).getTime();
    let currentLineHash = JSON.stringify(first.outcomes.map(o => o.currentOdds.decimal));

    for (let i = 1; i < sorted.length; i++) {
      const state = sorted[i];
      const lineHash = JSON.stringify(state.outcomes.map(o => o.currentOdds.decimal));
      if (lineHash !== currentLineHash) {
        const now = new Date(state.timestamp).getTime();
        totalPersistenceMs += (now - lastChangeTime);
        lastChangeTime = now;
        currentLineHash = lineHash;
        stateChanges++;
      }
    }

    const averageQuotePersistenceMin = stateChanges > 0 
      ? (totalPersistenceMs / stateChanges) / 60000 
      : durationMins;

    // Estimated depth score (1-100)
    // Higher update frequency and medium-to-low persistence suggests a deeper pool of active, liquid trades
    const normalizedFreq = Math.min(1.0, updateFrequencyPerMin * 2.0); // capped at 0.5 updates per minute
    const normalizedPersist = Math.min(1.0, 5 / Math.max(0.1, averageQuotePersistenceMin)); // favor persistence less than 5 mins
    const estimatedDepthScore = Math.round((normalizedFreq * 60 + normalizedPersist * 40));

    // Availability score
    const openStatesCount = sorted.filter(s => s.status === "open").length;
    const marketAvailability = openStatesCount / sorted.length;

    // Liquidity confidence index
    const liquidityConfidence = (
      (estimatedDepthScore / 100) * 0.4 +
      marketAvailability * 0.4 +
      Math.min(1.0, sorted.length / 10) * 0.2
    );

    return {
      marketId: last.marketId,
      updateFrequencyPerMin,
      averageQuotePersistenceMin,
      estimatedDepthScore,
      marketAvailability,
      liquidityConfidence: Number(liquidityConfidence.toFixed(3))
    };
  }
}
