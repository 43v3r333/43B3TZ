import { CanonicalMarketDTO } from "../markets/types";
import { marketEventBus } from "../events";

export interface MarketAnomaly {
  anomalyId: string;
  marketId: string;
  type: "provider_divergence" | "unexpected_movement" | "probability_spike" | "stale_price" | "feed_interruption" | "market_gap";
  severity: "low" | "medium" | "high";
  description: string;
  timestamp: string;
  metricValue: number;
}

export class AnomalyEngine {
  /**
   * Evaluates a batch of current markets to find provider divergence and outlying prices.
   */
  public static detectCrossProviderAnomalies(
    fixtureId: string,
    marketType: string,
    allMarkets: CanonicalMarketDTO[]
  ): MarketAnomaly[] {
    const relevant = allMarkets.filter(m => m.fixtureId === fixtureId && m.marketType === marketType && m.status === "open");
    if (relevant.length < 2) return [];

    const anomalies: MarketAnomaly[] = [];
    const outcomeNames = Array.from(new Set(relevant.flatMap(m => m.outcomes.map(o => o.name))));

    outcomeNames.forEach(name => {
      // Collect prices across providers
      const prices = relevant.map(m => ({
        providerId: m.providerId,
        marketId: m.marketId,
        odds: m.outcomes.find(o => o.name === name)?.currentOdds.decimal ?? 0
      })).filter(p => p.odds > 0);

      if (prices.length < 3) {
        // If 2 providers, just check absolute distance
        if (prices.length === 2) {
          const diff = Math.abs(prices[0].odds - prices[1].odds);
          if (diff > 0.4) {
            const desc = `Major divergence between provider ${prices[0].providerId} (${prices[0].odds}) and ${prices[1].providerId} (${prices[1].odds}) on outcome ${name}`;
            anomalies.push(this.triggerAnomaly(prices[0].marketId, "provider_divergence", "medium", desc, diff));
          }
        }
        return;
      }

      // Calculate mean and std dev
      const mean = prices.reduce((sum, p) => sum + p.odds, 0) / prices.length;
      const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + Math.pow(p.odds - mean, 2), 0) / prices.length);

      prices.forEach(p => {
        // Z-score outlier detection (Z > 1.5 for small sample)
        const z = stdDev > 0 ? Math.abs(p.odds - mean) / stdDev : 0;
        if (z > 1.8 && Math.abs(p.odds - mean) > 0.25) {
          const desc = `Outlier odds detected at provider [${p.providerId}] for ${name}. Price of ${p.odds} is ${z.toFixed(2)} std-deviations from consensus mean of ${mean.toFixed(2)}.`;
          anomalies.push(this.triggerAnomaly(p.marketId, "provider_divergence", "high", desc, z));
        }
      });
    });

    return anomalies;
  }

  /**
   * Evaluates sequential updates of a single market to flag unexpected movements, gaps, and stale prices.
   */
  public static detectSequentialAnomalies(history: CanonicalMarketDTO[]): MarketAnomaly[] {
    if (history.length === 0) return [];

    const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const anomalies: MarketAnomaly[] = [];

    // 1. Check for stale prices (feed interruption)
    const newest = sorted[sorted.length - 1];
    const newestTime = new Date(newest.timestamp).getTime();
    const staleDurationMs = Date.now() - newestTime;

    if (staleDurationMs > 30 * 60 * 1000) { // 30 mins quiet is considered stale/interrupted
      const desc = `Stale prices flag. Provider feed [${newest.providerId}] has not transmitted market updates for ${(staleDurationMs / 60000).toFixed(0)} minutes.`;
      anomalies.push(this.triggerAnomaly(newest.marketId, "feed_interruption", "medium", desc, staleDurationMs));
    }

    // 2. Sequential changes
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      curr.outcomes.forEach(currOut => {
        const prevOut = prev.outcomes.find(o => o.name === currOut.name);
        if (prevOut) {
          const delta = Math.abs(currOut.currentOdds.decimal - prevOut.currentOdds.decimal);
          
          // Gap/Spike checks
          if (delta > 0.5) { // sharp jump of >0.5 odds
            const desc = `Probability spike / Market Gap on outcome [${currOut.name}]. Odds shifted violently from ${prevOut.currentOdds.decimal} to ${currOut.currentOdds.decimal} instantly.`;
            anomalies.push(this.triggerAnomaly(curr.marketId, "unexpected_movement", "high", desc, delta));
          } else if (delta > 0.25) {
            const desc = `Unexpected movement on outcome [${currOut.name}]. Odds changed by ${delta.toFixed(2)} from ${prevOut.currentOdds.decimal} to ${currOut.currentOdds.decimal}.`;
            anomalies.push(this.triggerAnomaly(curr.marketId, "unexpected_movement", "low", desc, delta));
          }
        }
      });
    }

    return anomalies;
  }

  private static triggerAnomaly(
    marketId: string,
    type: MarketAnomaly["type"],
    severity: MarketAnomaly["severity"],
    description: string,
    metricValue: number
  ): MarketAnomaly {
    const anomaly: MarketAnomaly = {
      anomalyId: `anom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      marketId,
      type,
      severity,
      description,
      timestamp: new Date().toISOString(),
      metricValue
    };

    marketEventBus.publish("AnomalyDetected", marketId, "all", {
      type,
      severity,
      description,
      metricValue
    });

    return anomaly;
  }
}
