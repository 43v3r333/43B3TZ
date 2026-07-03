import { FatigueMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("FatigueEngine");

export class FatigueEngine {
  /**
   * Calculates fatigue metrics for a team or player based on fixture timeline, travel, and congestion.
   */
  public calculateFatigue(
    entityId: string,
    history: Array<{ kickoff: string; isAway: boolean; distanceKm?: number; timeZoneDiff?: number }>
  ): FatigueMetrics {
    logger.info(`Calculating fatigue index for Entity: ${entityId}`);

    if (history.length === 0) {
      return {
        entityId,
        daysRest: 7,
        travelDistance: 0,
        fixtureCongestion: 1,
        backToBackMatches: false,
        timeZoneChanges: 0,
        recoveryScore: 100
      };
    }

    // Sort by kickoff date descending (most recent first)
    const sorted = [...history].sort(
      (a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()
    );

    const now = Date.now();
    const lastMatchDate = new Date(sorted[0].kickoff).getTime();
    
    // Days rest
    const daysRest = Math.max(0, parseFloat(((now - lastMatchDate) / (1000 * 60 * 60 * 24)).toFixed(1)));

    // Fixture congestion: count matches in the last 21 days
    const twentyOneDaysAgo = now - 21 * 24 * 60 * 60 * 1000;
    const fixtureCongestion = sorted.filter(
      h => new Date(h.kickoff).getTime() >= twentyOneDaysAgo
    ).length;

    // Back-to-back matches: if the previous gap was < 4 days
    let backToBackMatches = false;
    if (sorted.length >= 2) {
      const match1 = new Date(sorted[0].kickoff).getTime();
      const match2 = new Date(sorted[1].kickoff).getTime();
      const gapDays = (match1 - match2) / (1000 * 60 * 60 * 24);
      if (gapDays < 4) {
        backToBackMatches = true;
      }
    }

    // Travel distance and time zone changes of the most recent match
    const travelDistance = sorted[0].distanceKm || 0;
    const timeZoneChanges = sorted[0].timeZoneDiff || 0;

    // Calculate Recovery Score (0 - 100). Baseline 100.
    // Rest days boosts recovery (+15 per day up to 5 days, max 100)
    // Travel penalizes recovery (-5 per 500km)
    // Congestion penalizes recovery (-12 per match in last 21 days beyond 1 match)
    // Back-to-back penalizes recovery (-15)
    // Time zones penalize recovery (-8 per timezone change)
    let recoveryScore = 50 + (daysRest * 10);
    
    // Deduct penalties
    const travelPenalty = (travelDistance / 100) * 1.5; // -1.5 per 100km
    const congestionPenalty = Math.max(0, fixtureCongestion - 1) * 12;
    const b2bPenalty = backToBackMatches ? 18 : 0;
    const tzPenalty = Math.abs(timeZoneChanges) * 7;

    recoveryScore = recoveryScore - travelPenalty - congestionPenalty - b2bPenalty - tzPenalty;
    
    // bound between 5 and 100
    const finalRecoveryScore = Math.max(5, Math.min(100, Math.round(recoveryScore)));

    const metrics: FatigueMetrics = {
      entityId,
      daysRest,
      travelDistance,
      fixtureCongestion,
      backToBackMatches,
      timeZoneChanges,
      recoveryScore: finalRecoveryScore
    };

    intelligenceStorage.setFatigue(entityId, metrics);
    logger.debug(`Fatigue updated for ${entityId}: Recovery score is ${finalRecoveryScore}/100, Days Rest: ${daysRest}`);

    return metrics;
  }
}

export const fatigueEngine = new FatigueEngine();
