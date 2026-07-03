import { CanonicalMarketDTO } from "../markets/types";

export interface VolatilityMetrics {
  outcomeName: string;
  variance: number;
  standardDeviation: number;
  intradayMovement: number;       // peak-to-trough odds spread
  movementFrequency: number;      // count of updates
  marketStability: number;        // 0-1 score (higher is more stable)
  confidenceInterval: { low: number; high: number };
}

export interface ProviderStabilityReport {
  providerId: string;
  updateCount: number;
  averageDelta: number;
  stabilityIndex: number; // 0-1
}

export class VolatilityEngine {
  /**
   * Evaluates historical odds changes to compute volatility metrics per outcome.
   */
  public static calculateVolatility(history: CanonicalMarketDTO[]): VolatilityMetrics[] {
    if (history.length === 0) return [];

    // Group odds by outcome
    const oddsByOutcome: Record<string, number[]> = {};
    history.forEach(state => {
      state.outcomes.forEach(out => {
        if (!oddsByOutcome[out.name]) oddsByOutcome[out.name] = [];
        oddsByOutcome[out.name].push(out.currentOdds.decimal);
      });
    });

    const metrics: VolatilityMetrics[] = [];

    for (const [name, oddsList] of Object.entries(oddsByOutcome)) {
      if (oddsList.length === 0) continue;

      const count = oddsList.length;
      const average = oddsList.reduce((a, b) => a + b, 0) / count;

      // 1. Variance & Std Dev
      const variance = count > 1 
        ? oddsList.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count 
        : 0;
      const standardDeviation = Math.sqrt(variance);

      // 2. Intraday peak-to-trough
      const maxOdds = Math.max(...oddsList);
      const minOdds = Math.min(...oddsList);
      const intradayMovement = maxOdds - minOdds;

      // 3. Stability Index (exponential decay of standard deviation)
      const marketStability = Math.max(0, Math.min(1.0, Math.exp(-standardDeviation * 1.5)));

      // 4. Confidence Interval (95% - approx 1.96 * standardDeviation)
      const lowCI = Math.max(1.01, average - 1.96 * standardDeviation);
      const highCI = average + 1.96 * standardDeviation;

      metrics.push({
        outcomeName: name,
        variance,
        standardDeviation,
        intradayMovement,
        movementFrequency: count,
        marketStability,
        confidenceInterval: {
          low: Number(lowCI.toFixed(3)),
          high: Number(highCI.toFixed(3))
        }
      });
    }

    return metrics;
  }

  /**
   * Assesses stability metrics for each provider.
   */
  public static assessProviderStability(history: CanonicalMarketDTO[]): ProviderStabilityReport[] {
    const providersHistory: Record<string, CanonicalMarketDTO[]> = {};
    history.forEach(state => {
      if (!providersHistory[state.providerId]) providersHistory[state.providerId] = [];
      providersHistory[state.providerId].push(state);
    });

    const reports: ProviderStabilityReport[] = [];

    for (const [pId, states] of Object.entries(providersHistory)) {
      // Sort states chronologically
      const sorted = [...states].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      let totalDelta = 0;
      let stepCount = 0;

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        // Average of absolute currentOdds deltas across all matching outcome nodes
        let deltaSum = 0;
        let matchedOutcomesCount = 0;

        curr.outcomes.forEach(outCurr => {
          const outPrev = prev.outcomes.find(o => o.name === outCurr.name);
          if (outPrev) {
            deltaSum += Math.abs(outCurr.currentOdds.decimal - outPrev.currentOdds.decimal);
            matchedOutcomesCount++;
          }
        });

        if (matchedOutcomesCount > 0) {
          totalDelta += deltaSum / matchedOutcomesCount;
          stepCount++;
        }
      }

      const avgDelta = stepCount > 0 ? totalDelta / stepCount : 0;
      // High frequency and high amplitude changes decrease stability
      const stabilityIndex = Math.max(0.1, Math.min(1.0, Math.exp(-avgDelta * 2.0)));

      reports.push({
        providerId: pId,
        updateCount: sorted.length,
        averageDelta: avgDelta,
        stabilityIndex
      });
    }

    return reports;
  }
}
