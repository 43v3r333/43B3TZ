import { CanonicalMarketDTO } from "../markets/types";
import { resolveOdds, OddsValue } from "../odds";

export interface OutcomeMovement {
  name: string;
  openingOdds: OddsValue;
  currentOdds: OddsValue;
  closingOdds?: OddsValue;
  direction: "up" | "down" | "flat";
  totalDelta: number;
  velocity: number;      // delta per minute
  acceleration: number;  // change in velocity per minute
  earlyMovementPercent: number; // percentage of total movement in the first 30% of timeline
  lateMovementPercent: number;  // percentage of total movement in the last 15% of timeline
  trend: "steaming" | "drifting" | "stable" | "reversing";
}

export interface MarketMovementReport {
  marketId: string;
  fixtureId: string;
  marketType: string;
  providerId: string;
  outcomes: OutcomeMovement[];
  movementVolatility: number;
}

export class MarketMovementEngine {
  /**
   * Evaluates historical timeline sequences to dissect and calculate market movement metrics.
   */
  public static calculateMovement(history: CanonicalMarketDTO[]): MarketMovementReport | null {
    if (history.length < 2) return null;

    // Sort chronologically
    const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const outcomes: OutcomeMovement[] = [];
    const outcomeNames = first.outcomes.map(o => o.name);

    // Calculate total timeline duration in minutes
    const startMs = new Date(first.timestamp).getTime();
    const endMs = new Date(last.timestamp).getTime();
    const totalMinutes = Math.max(1, (endMs - startMs) / 60000);

    outcomeNames.forEach(name => {
      // Collect sequential decimal odds for this outcome
      const oddsTimeline: { value: number; ms: number }[] = [];
      sorted.forEach(state => {
        const out = state.outcomes.find(o => o.name === name);
        if (out) {
          oddsTimeline.push({
            value: out.currentOdds.decimal,
            ms: new Date(state.timestamp).getTime()
          });
        }
      });

      if (oddsTimeline.length < 2) return;

      const opening = oddsTimeline[0].value;
      const current = oddsTimeline[oddsTimeline.length - 1].value;
      const totalDelta = current - opening;

      // 1. Direction
      const direction = Math.abs(totalDelta) < 0.02 ? "flat" : totalDelta > 0 ? "up" : "down";

      // 2. Velocity (delta per minute)
      const velocity = totalDelta / totalMinutes;

      // 3. Acceleration (change of velocity across two half splits of timeline)
      const midPointIdx = Math.floor(oddsTimeline.length / 2);
      const firstHalfDelta = oddsTimeline[midPointIdx].value - opening;
      const firstHalfMins = Math.max(1, (oddsTimeline[midPointIdx].ms - startMs) / 60000);
      const velocity1 = firstHalfDelta / firstHalfMins;

      const secondHalfDelta = current - oddsTimeline[midPointIdx].value;
      const secondHalfMins = Math.max(1, (endMs - oddsTimeline[midPointIdx].ms) / 60000);
      const velocity2 = secondHalfDelta / secondHalfMins;

      const acceleration = (velocity2 - velocity1) / (totalMinutes / 2);

      // 4. Early vs Late Movement percentage
      let earlyMovementPercent = 0;
      let lateMovementPercent = 0;

      if (Math.abs(totalDelta) > 0.001) {
        // Find index representing 30% of duration
        const earlyBoundaryMs = startMs + (endMs - startMs) * 0.3;
        const earlyOddsObj = oddsTimeline.find(t => t.ms >= earlyBoundaryMs) || oddsTimeline[midPointIdx];
        const earlyDelta = earlyOddsObj.value - opening;
        earlyMovementPercent = Math.min(100, Math.max(0, (earlyDelta / totalDelta) * 100));

        // Find index representing 85% of duration (last 15%)
        const lateBoundaryMs = startMs + (endMs - startMs) * 0.85;
        const lateOddsObj = oddsTimeline.find(t => t.ms >= lateBoundaryMs) || last.outcomes.find(o => o.name === name)?.currentOdds.decimal || current;
        // Cast to number
        const lateVal = typeof lateOddsObj === "object" ? lateOddsObj.value : current;
        const lateDelta = current - lateVal;
        lateMovementPercent = Math.min(100, Math.max(0, (lateDelta / totalDelta) * 100));
      }

      // 5. Trend Analysis classification
      let trend: OutcomeMovement["trend"] = "stable";
      if (Math.abs(totalDelta) < 0.05) {
        trend = "stable";
      } else if (totalDelta < 0) {
        trend = "steaming"; // Odds shortening significantly (heavy public/sharp backing)
      } else if (totalDelta > 0) {
        trend = "drifting"; // Odds expanding (under-backed)
      }

      // If it flipped direction in the second half
      if (Math.sign(velocity1) !== Math.sign(velocity2) && Math.abs(velocity1) > 0.01 && Math.abs(velocity2) > 0.01) {
        trend = "reversing";
      }

      outcomes.push({
        name,
        openingOdds: resolveOdds(opening),
        currentOdds: resolveOdds(current),
        closingOdds: (last as any).closingOdds || resolveOdds(current),
        direction,
        totalDelta,
        velocity,
        acceleration,
        earlyMovementPercent,
        lateMovementPercent,
        trend
      });
    });

    // Compute standard deviation of all deltas to get overall movement volatility
    const allDeltas: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      curr.outcomes.forEach(outCurr => {
        const outPrev = prev.outcomes.find(o => o.name === outCurr.name);
        if (outPrev) {
          allDeltas.push(outCurr.currentOdds.decimal - outPrev.currentOdds.decimal);
        }
      });
    }

    const avgDelta = allDeltas.reduce((a, b) => a + b, 0) / (allDeltas.length || 1);
    const varDelta = allDeltas.reduce((acc, val) => acc + Math.pow(val - avgDelta, 2), 0) / (allDeltas.length || 1);
    const movementVolatility = Math.sqrt(varDelta);

    return {
      marketId: last.marketId,
      fixtureId: last.fixtureId,
      marketType: last.marketType,
      providerId: last.providerId,
      outcomes,
      movementVolatility
    };
  }
}
