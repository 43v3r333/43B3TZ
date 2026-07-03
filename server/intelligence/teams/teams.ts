import { TeamIntelligence } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { formEngine } from "../form/form";
import { createLogger } from "../../core/logger";

const logger = createLogger("TeamIntelligenceEngine");

export class TeamIntelligenceEngine {
  /**
   * Performs continuous, comprehensive team statistical calculations and metrics tracking.
   */
  public updateTeamIntelligence(
    teamId: string,
    name: string,
    matchHistory: Array<{
      fixtureId: string;
      isHome: boolean;
      opponentId: string;
      opponentName: string;
      competitionId: string;
      goalsScored: number;
      goalsConceded: number;
      shotsOnGoal: number;
      shotsOffGoal: number;
      possession: number;
      fouls: number;
      opponentFouls: number;
      outcome: "W" | "D" | "L";
    }>
  ): TeamIntelligence {
    logger.info(`Updating Team Intelligence for team ${teamId} (${name}) with ${matchHistory.length} matches.`);

    const count = matchHistory.length;
    if (count === 0) {
      // Return placeholder/baseline
      const teamIntel: TeamIntelligence = {
        teamId,
        name,
        currentForm: 50,
        rollingForm: [1, 1, 1],
        homeForm: 50,
        awayForm: 50,
        goalsScored: 0,
        goalsConceded: 0,
        expectedGoals: 0,
        expectedGoalsAgainst: 0,
        cleanSheets: 0,
        possessionTrends: [50],
        shotQuality: 0.1,
        conversionRate: 0.1,
        pressingIntensity: 10,
        defensiveEfficiency: 50,
        attackEfficiency: 50,
        recentMomentum: 50,
        strengthOfSchedule: 1500,
        leagueRelativeStrength: 1.0,
        homeAdvantageFactor: 1.1,
        rollingRatings: [1500],
        updatedAt: new Date().toISOString()
      };
      intelligenceStorage.setTeam(teamId, teamIntel);
      return teamIntel;
    }

    // Sort matches chronologically
    const sortedMatches = [...matchHistory];

    // Form Processing using formEngine
    let latestForm = { weightedForm: 50, opponentStrengthAdjusted: 50, momentum: 50 };
    sortedMatches.forEach(m => {
      latestForm = formEngine.processNewMatch(teamId, m.outcome, m.isHome, m.opponentId, m.competitionId);
    });

    const rollingForm = sortedMatches.slice(-5).map(m => (m.outcome === "W" ? 3 : m.outcome === "D" ? 1 : 0));

    // Simple aggregations
    let totalScored = 0;
    let totalConceded = 0;
    let cleanSheets = 0;
    let totalPossession = 0;
    let totalShots = 0;
    let totalOpponentElo = 0;

    const possessionTrends: number[] = [];

    sortedMatches.forEach(m => {
      totalScored += m.goalsScored;
      totalConceded += m.goalsConceded;
      if (m.goalsConceded === 0) {
        cleanSheets++;
      }
      totalPossession += m.possession;
      possessionTrends.push(m.possession);
      totalShots += m.shotsOnGoal + m.shotsOffGoal;

      // Strength of schedule (average ELO of opponents)
      const oppElo = intelligenceStorage.getElo(m.opponentId)?.rating || 1500;
      totalOpponentElo += oppElo;
    });

    // expected goals aggregation (fetch from our xG storage if computed, else estimate)
    let totalXG = 0;
    let totalXGA = 0;
    sortedMatches.forEach(m => {
      const matchXg = intelligenceStorage.getXg(m.fixtureId);
      if (matchXg) {
        totalXG += m.isHome ? matchXg.xGHome : matchXg.xGAway;
        totalXGA += m.isHome ? matchXg.xGAway : matchXg.xGHome;
      } else {
        // Fallback estimate
        const SOT_WEIGHT = 0.31;
        const SOFF_WEIGHT = 0.09;
        const shotsOn = m.shotsOnGoal;
        const shotsOff = m.shotsOffGoal;
        totalXG += (shotsOn * SOT_WEIGHT) + (shotsOff * SOFF_WEIGHT);
        totalXGA += (shotsOn * SOT_WEIGHT * 0.9) + (shotsOff * SOFF_WEIGHT * 0.9); // estimate opponent
      }
    });

    const shotQuality = totalShots > 0 ? parseFloat((totalXG / totalShots).toFixed(3)) : 0.1;
    const conversionRate = totalShots > 0 ? parseFloat((totalScored / totalShots).toFixed(3)) : 0.1;

    // Pressing Intensity: opponent fouls over fouls called (proxy PPDA)
    let totalFoulsMade = 0;
    let totalFoulsSuffered = 0;
    sortedMatches.forEach(m => {
      totalFoulsMade += m.fouls;
      totalFoulsSuffered += m.opponentFouls;
    });
    const pressingIntensity = totalFoulsMade > 0 ? parseFloat((totalFoulsSuffered / totalFoulsMade).toFixed(2)) : 1.0;

    // Efficiency Calculations
    // Attack Efficiency: Goals Scored / expectedGoals
    const attackEfficiency = totalXG > 0 ? parseFloat(((totalScored / totalXG) * 100).toFixed(1)) : 100;
    // Defensive Efficiency: Expected Goals Against / Goals Conceded
    const defensiveEfficiency = totalConceded > 0 ? parseFloat(((totalXGA / totalConceded) * 100).toFixed(1)) : 100;

    // Strengths
    const myElo = intelligenceStorage.getElo(teamId)?.rating || 1500;
    const leagueEloList = intelligenceStorage.getAllElos().map(e => e.rating);
    const avgLeagueElo = leagueEloList.length > 0 ? leagueEloList.reduce((a, b) => a + b, 0) / leagueEloList.length : 1500;
    const leagueRelativeStrength = parseFloat((myElo / avgLeagueElo).toFixed(3));

    // Home advantage calculation: average goals scored at home minus goals conceded at home vs overall
    const homeMatches = sortedMatches.filter(m => m.isHome);
    const awayMatches = sortedMatches.filter(m => !m.isHome);
    
    let homeAdvantageFactor = 1.1; // baseline
    if (homeMatches.length > 0 && awayMatches.length > 0) {
      const homeScoredAvg = homeMatches.reduce((sum, m) => sum + m.goalsScored, 0) / homeMatches.length;
      const awayScoredAvg = awayMatches.reduce((sum, m) => sum + m.goalsScored, 0) / awayMatches.length;
      homeAdvantageFactor = parseFloat(Math.max(0.5, Math.min(2.5, 1.0 + (homeScoredAvg - awayScoredAvg))).toFixed(2));
    }

    const rollingRatings = intelligenceStorage.getElo(teamId)?.history.slice(-10).map(h => h.rating) || [myElo];

    const teamIntel: TeamIntelligence = {
      teamId,
      name,
      currentForm: latestForm.weightedForm,
      rollingForm,
      homeForm: homeMatches.length > 0 ? formEngine.processNewMatch(teamId, homeMatches[homeMatches.length - 1].outcome, true, homeMatches[homeMatches.length - 1].opponentId, homeMatches[homeMatches.length - 1].competitionId).weightedForm : 50,
      awayForm: awayMatches.length > 0 ? formEngine.processNewMatch(teamId, awayMatches[awayMatches.length - 1].outcome, false, awayMatches[awayMatches.length - 1].opponentId, awayMatches[awayMatches.length - 1].competitionId).weightedForm : 50,
      goalsScored: totalScored,
      goalsConceded: totalConceded,
      expectedGoals: parseFloat(totalXG.toFixed(2)),
      expectedGoalsAgainst: parseFloat(totalXGA.toFixed(2)),
      cleanSheets,
      possessionTrends: possessionTrends.slice(-5),
      shotQuality,
      conversionRate,
      pressingIntensity,
      defensiveEfficiency,
      attackEfficiency,
      recentMomentum: latestForm.momentum,
      strengthOfSchedule: parseFloat((totalOpponentElo / count).toFixed(1)),
      leagueRelativeStrength,
      homeAdvantageFactor,
      rollingRatings,
      updatedAt: new Date().toISOString()
    };

    intelligenceStorage.setTeam(teamId, teamIntel);
    
    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.TeamUpdated, teamId, teamIntel);

    return teamIntel;
  }
}

export const teamIntelligenceEngine = new TeamIntelligenceEngine();
