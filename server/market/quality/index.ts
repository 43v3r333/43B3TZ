import { CanonicalMarketDTO } from "../markets/types";
import { marketEventBus } from "../events";

export interface ProviderQualityMetrics {
  providerId: string;
  reliability: number;          // 0 - 1
  freshness: number;            // 0 - 1 (decay over age of update)
  completeness: number;         // 0 - 1 (outcomes present)
  coverage: number;             // 0 - 1 (active markets count)
  latencyMs: number;            // simulated ms
  historicalConsistency: number; // 0 - 1
  compositeScore: number;       // 0 - 100
}

export class QualityEngine {
  /**
   * Dissects a provider's output to assign quality, performance, and SLA compliance scores.
   */
  public static calculateQuality(
    providerId: string,
    allMarkets: CanonicalMarketDTO[],
    anomaliesCount: number = 0
  ): ProviderQualityMetrics {
    const providerMarkets = allMarkets.filter(m => m.providerId === providerId);
    
    // 1. Freshness
    let freshness = 0.5;
    if (providerMarkets.length > 0) {
      const sorted = [...providerMarkets].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const ageMs = Date.now() - new Date(sorted[0].timestamp).getTime();
      freshness = Math.max(0.1, Math.min(1.0, 1 - (ageMs / (60 * 60 * 1000)))); // decay over 1 hour
    }

    // 2. Completeness
    // Check if each market has at least 2 outcomes
    let completeCount = 0;
    providerMarkets.forEach(m => {
      if (m.outcomes.length >= 2) completeCount++;
    });
    const completeness = providerMarkets.length > 0 ? completeCount / providerMarkets.length : 1.0;

    // 3. Coverage
    // Count distinct market types (e.g. match_outcome, over_under_2_5 etc)
    const distinctTypes = new Set(providerMarkets.map(m => m.marketType));
    const coverage = Math.min(1.0, distinctTypes.size / 4.0); // normalize against 4 canonical types

    // 4. Reliability
    // Penalty based on anomalies flagged
    const reliability = Math.max(0.2, 1.0 - (anomaliesCount * 0.15));

    // 5. Latency (simulated based on providerId profiles)
    let latencyMs = 120;
    if (providerId === "Sportradar") latencyMs = 80;
    if (providerId === "ApiFootball") latencyMs = 210;
    if (providerId === "fake_sports_data") latencyMs = 50;

    // 6. Historical Consistency
    const historicalConsistency = Math.max(0.5, 1.0 - (anomaliesCount * 0.08));

    // 7. Composite score (0 - 100)
    const compositeScore = Math.round(
      (reliability * 0.35 +
      freshness * 0.20 +
      completeness * 0.15 +
      coverage * 0.15 +
      historicalConsistency * 0.15) * 100
    );

    const metrics: ProviderQualityMetrics = {
      providerId,
      reliability,
      freshness,
      completeness,
      coverage,
      latencyMs,
      historicalConsistency,
      compositeScore
    };

    marketEventBus.publish("QualityUpdated", "all", "all", {
      providerId,
      compositeScore
    });

    return metrics;
  }
}
