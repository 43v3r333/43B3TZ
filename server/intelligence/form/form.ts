import { FormMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("FormEngine");

export class FormEngine {
  /**
   * Recalculates form metrics for a team after a new result.
   */
  public processNewMatch(
    teamId: string,
    outcome: "W" | "D" | "L",
    isHome: boolean,
    opponentId: string,
    competitionId: string
  ): FormMetrics {
    logger.info(`Recalculating Form Metrics for team '${teamId}' after match outcome '${outcome}'`);

    const currentForm = intelligenceStorage.getForm(teamId) || {
      entityId: teamId,
      last5: [],
      last10: [],
      home: [],
      away: [],
      competitionSpecific: {},
      opponentStrengthAdjusted: 50,
      weightedForm: 50,
      momentum: 50,
      trendDirection: "stable" as const
    };

    // Update historical runs
    currentForm.last5 = [outcome, ...currentForm.last5].slice(0, 5);
    currentForm.last10 = [outcome, ...currentForm.last10].slice(0, 10);

    if (isHome) {
      currentForm.home = [outcome, ...currentForm.home].slice(0, 5);
    } else {
      currentForm.away = [outcome, ...currentForm.away].slice(0, 5);
    }

    if (!currentForm.competitionSpecific[competitionId]) {
      currentForm.competitionSpecific[competitionId] = [];
    }
    currentForm.competitionSpecific[competitionId] = [outcome, ...currentForm.competitionSpecific[competitionId]].slice(0, 5);

    // Calculate weighted form (higher weights for most recent games)
    // Weight schema: Game 1 (newest): 1.0, Game 2: 0.8, Game 3: 0.6, Game 4: 0.4, Game 5: 0.2
    const outcomeToPoints = (o: string) => (o === "W" ? 3 : o === "D" ? 1 : 0);
    const weights = [1.0, 0.8, 0.6, 0.4, 0.2];
    let totalScore = 0;
    let totalWeight = 0;

    currentForm.last5.forEach((out, index) => {
      const weight = weights[index] || 0.1;
      totalScore += outcomeToPoints(out) * weight;
      totalWeight += weight;
    });

    const rawFormScore = totalWeight > 0 ? (totalScore / (totalWeight * 3)) * 100 : 50;
    currentForm.weightedForm = parseFloat(rawFormScore.toFixed(1));

    // Calculate Opponent Strength Adjusted score
    // E.g. we compare ELOs. If we beat a 1700 ELO team, we get a huge boost. If we lose to 1300, we drop more.
    const teamElo = intelligenceStorage.getElo(teamId)?.rating || 1500;
    const oppElo = intelligenceStorage.getElo(opponentId)?.rating || 1500;
    const eloDifference = oppElo - teamElo; // positive means opponent was stronger

    let adjustedPoints = outcomeToPoints(outcome);
    if (outcome === "W") {
      // win against stronger opponent yields bonus points
      adjustedPoints += Math.max(0, eloDifference / 200);
    } else if (outcome === "L") {
      // loss against weaker opponent decreases starting base of 0 to negative adjustment
      adjustedPoints += Math.min(0, eloDifference / 200);
    } else {
      // draw against stronger opponent yields bonus, against weaker is a small penalty
      adjustedPoints += eloDifference / 400;
    }

    // Sigmoid scaling to 0-100 index
    const baseAdjusted = 50 + (adjustedPoints * 12);
    currentForm.opponentStrengthAdjusted = parseFloat(
      Math.max(0, Math.min(100, (currentForm.opponentStrengthAdjusted * 0.7) + (baseAdjusted * 0.3))).toFixed(1)
    );

    // Calculate Momentum (difference between last 3 games vs last 10 games)
    const last3Points = currentForm.last5.slice(0, 3).reduce((acc, o) => acc + outcomeToPoints(o), 0);
    const last3Avg = last3Points / 9; // 0 to 1
    const last10Points = currentForm.last10.reduce((acc, o) => acc + outcomeToPoints(o), 0);
    const last10Avg = last10Points / (currentForm.last10.length * 3 || 1); // 0 to 1

    const rawMomentum = 50 + (last3Avg - last10Avg) * 50;
    currentForm.momentum = parseFloat(Math.max(0, Math.min(100, rawMomentum)).toFixed(1));

    // Trend Direction
    if (last3Avg > last10Avg + 0.1) {
      currentForm.trendDirection = "rising";
    } else if (last3Avg < last10Avg - 0.1) {
      currentForm.trendDirection = "falling";
    } else {
      currentForm.trendDirection = "stable";
    }

    intelligenceStorage.setForm(teamId, currentForm);
    logger.info(`Form updated for team ${teamId}: Weighted Form Score is ${currentForm.weightedForm}, Trend: ${currentForm.trendDirection}`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.FormUpdated, teamId, currentForm);

    return currentForm;
  }
}

export const formEngine = new FormEngine();
