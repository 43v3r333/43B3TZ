import { intelligenceStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("SpiEngine");

export interface TeamSpi {
  teamId: string;
  offenseRating: number; // expected goals scored against average team
  defenseRating: number; // expected goals conceded against average team
  spiScore: number; // overall percentage rating (0-100)
}

export class SpiEngine {
  private spiMap: Map<string, TeamSpi> = new Map();

  /**
   * Calculates Soccer Power Index (SPI) for a team.
   * Based on offensive strength (goals scored & xG) and defensive strength (goals conceded & xGA).
   */
  public calculateSpi(teamId: string): TeamSpi {
    logger.info(`Computing Soccer Power Index (SPI) for team '${teamId}'`);

    const teamIntel = intelligenceStorage.getTeam(teamId);
    const elo = intelligenceStorage.getElo(teamId)?.rating || 1500;

    if (!teamIntel) {
      // Default baseline SPI (average team)
      const defaultSpi = {
        teamId,
        offenseRating: 1.5,
        defenseRating: 1.5,
        spiScore: 50.0
      };
      this.spiMap.set(teamId, defaultSpi);
      return defaultSpi;
    }

    // Baseline goal scoring rates
    // Average team scores ~1.4 goals per match
    const avgGoalsScored = teamIntel.goalsScored / (teamIntel.rollingForm.length || 1);
    const avgXG = teamIntel.expectedGoals / (teamIntel.rollingForm.length || 1);

    const avgGoalsConceded = teamIntel.goalsConceded / (teamIntel.rollingForm.length || 1);
    const avgXGA = teamIntel.expectedGoalsAgainst / (teamIntel.rollingForm.length || 1);

    // Calculate Offensive rating (expected goals on neutral pitch against avg team)
    // We blend actual goals, xG, and Elo rating
    const eloMultiplier = Math.pow(10, (elo - 1500) / 600);
    const rawOffense = ((avgGoalsScored * 0.4) + (avgXG * 0.6)) * eloMultiplier;
    const offenseRating = parseFloat(Math.max(0.2, Math.min(6.0, rawOffense)).toFixed(2));

    // Calculate Defensive rating (expected goals conceded on neutral pitch against avg team)
    // Lower is better!
    const inverseEloMultiplier = Math.pow(10, (1500 - elo) / 600);
    const rawDefense = ((avgGoalsConceded * 0.4) + (avgXGA * 0.6)) * inverseEloMultiplier;
    const defenseRating = parseFloat(Math.max(0.2, Math.min(6.0, rawDefense)).toFixed(2));

    // Calculate overall SPI score (0 to 100)
    // Standard translation formula: SPI = 100 * (Offense / (Offense + Defense))
    // We adjust it based on Elo scaling for absolute league rankings
    const ratio = offenseRating / (offenseRating + defenseRating);
    const eloWeight = (elo - 1000) / 1000; // e.g. 1500 Elo = 0.5, 1800 Elo = 0.8
    const rawSpiScore = (ratio * 60) + (eloWeight * 40);
    const spiScore = parseFloat(Math.max(1.0, Math.min(99.9, rawSpiScore)).toFixed(1));

    const spi: TeamSpi = {
      teamId,
      offenseRating,
      defenseRating,
      spiScore
    };

    this.spiMap.set(teamId, spi);
    logger.debug(`SPI calculated for ${teamId}: SPI ${spiScore} [Off: ${offenseRating}, Def: ${defenseRating}]`);

    return spi;
  }

  public getSpi(teamId: string): TeamSpi | undefined {
    return this.spiMap.get(teamId) || this.calculateSpi(teamId);
  }

  public getAllSpis(): TeamSpi[] {
    return Array.from(this.spiMap.values());
  }

  public clearAll() {
    this.spiMap.clear();
  }
}

export const spiEngine = new SpiEngine();
