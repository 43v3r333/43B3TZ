import { PlayerIntelligence } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { fatigueEngine } from "../fatigue/fatigue";
import { createLogger } from "../../core/logger";

const logger = createLogger("PlayerIntelligenceEngine");

export class PlayerIntelligenceEngine {
  /**
   * Tracks and computes deep player performance, availability, and tactical indices.
   */
  public updatePlayerIntelligence(
    playerId: string,
    name: string,
    position: PlayerIntelligence["position"],
    matchHistory: Array<{
      fixtureId: string;
      kickoff: string;
      minutesPlayed: number;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      injured: boolean;
      injuryDetails?: string;
      isAway: boolean;
      travelDistanceKm?: number;
    }>
  ): PlayerIntelligence {
    logger.info(`Updating Player Intelligence for player ${playerId} (${name})`);

    const count = matchHistory.length;
    if (count === 0) {
      const emptyPlayer: PlayerIntelligence = {
        playerId,
        name,
        fitness: 100,
        minutesPlayed: 0,
        goals: 0,
        assists: 0,
        expectedGoals: 0,
        expectedAssists: 0,
        cards: { yellow: 0, red: 0 },
        availability: "available",
        fatigue: 0,
        travelDistanceKm: 0,
        formScore: 50,
        position,
        impactScore: 50,
        contributionScore: 50,
        replacementImpact: 0,
        updatedAt: new Date().toISOString()
      };
      intelligenceStorage.setPlayer(playerId, emptyPlayer);
      return emptyPlayer;
    }

    // Sort chronologically (oldest first) to compute rolling stats
    const chronMatches = [...matchHistory].sort(
      (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
    );

    // Sum basic metrics
    let minutesPlayed = 0;
    let goals = 0;
    let assists = 0;
    let yellow = 0;
    let red = 0;
    let travelDistanceKm = 0;

    chronMatches.forEach(m => {
      minutesPlayed += m.minutesPlayed;
      goals += m.goals;
      assists += m.assists;
      yellow += m.yellowCards;
      red += m.redCards;
      travelDistanceKm += m.travelDistanceKm || 0;
    });

    // Estimate Expected Goals (xG) and Expected Assists (xA) for the player
    // A player's typical shot quality is assumed
    const expectedGoals = parseFloat(((goals * 0.85) + (minutesPlayed * 0.001)).toFixed(2));
    const expectedAssists = parseFloat(((assists * 0.8) + (minutesPlayed * 0.0008)).toFixed(2));

    // Calculate Availability
    const lastMatch = chronMatches[chronMatches.length - 1];
    let availability: PlayerIntelligence["availability"] = "available";
    if (lastMatch.injured) {
      availability = "injured";
    } else if (red > 0 || yellow >= 5) {
      availability = "suspended";
    } else if (lastMatch.minutesPlayed === 0 && count > 3) {
      availability = "rested";
    }

    // Fatigue analysis using fatigueEngine
    const fatigueHistory = chronMatches.map(m => ({
      kickoff: m.kickoff,
      isAway: m.isAway,
      distanceKm: m.travelDistanceKm || 0
    }));
    const fatigueMetrics = fatigueEngine.calculateFatigue(playerId, fatigueHistory);
    const fatigue = fatigueMetrics.recoveryScore; // maps directly to recovery status

    // Fitness Score: 0 to 100. Lower fatigue (higher recovery score) = higher fitness
    const fitness = availability === "injured" ? 20 : fatigue;

    // Form Score (0 - 100) based on contribution in the last 5 matches
    const last5 = chronMatches.slice(-5);
    let formPoints = 0;
    last5.forEach(m => {
      formPoints += (m.goals * 25) + (m.assists * 15) + (m.minutesPlayed * 0.1);
      if (m.redCards > 0) formPoints -= 30;
    });
    const formScore = Math.max(10, Math.min(100, Math.round(40 + (formPoints / (last5.length || 1)))));

    // Impact Score & Contribution Score (0 - 100)
    // Defensive positions contribute on clean sheets / matches, attacking on goals & assists
    let impactMultiplier = 1.0;
    if (position === "A") impactMultiplier = 1.6;
    else if (position === "M") impactMultiplier = 1.2;
    else if (position === "D") impactMultiplier = 0.8;
    else impactMultiplier = 0.5;

    const goalsAssistsSum = goals + assists;
    const baseImpact = (goalsAssistsSum * 15 * impactMultiplier) + (minutesPlayed * 0.02);
    const impactScore = Math.max(20, Math.min(100, Math.round(30 + baseImpact / (count || 1))));

    // Contribution Score focuses on tactical value (availability, minutes ratio)
    const minutesRatio = minutesPlayed / (count * 90 || 1);
    const contributionScore = Math.round(30 + (minutesRatio * 50) + (expectedAssists * 4));

    // Replacement Impact (0 to 10) representing drop in ELO/Performance if this key player is missing
    const replacementImpact = parseFloat(
      Math.min(10, (impactScore * 0.08) + (goalsAssistsSum * 0.15)).toFixed(1)
    );

    const playerIntel: PlayerIntelligence = {
      playerId,
      name,
      fitness,
      minutesPlayed,
      goals,
      assists,
      expectedGoals,
      expectedAssists,
      cards: { yellow, red },
      availability,
      fatigue: 100 - fatigue, // fatigue = 100 - recovery score
      travelDistanceKm,
      formScore,
      position,
      impactScore,
      contributionScore,
      replacementImpact: availability === "available" ? 0 : replacementImpact, // only penalized if unavailable
      updatedAt: new Date().toISOString()
    };

    intelligenceStorage.setPlayer(playerId, playerIntel);
    logger.debug(`Player ${name} updated. Form index: ${formScore}, Impact Score: ${impactScore}`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.PlayerUpdated, playerId, playerIntel);

    return playerIntel;
  }
}

export const playerIntelligenceEngine = new PlayerIntelligenceEngine();
