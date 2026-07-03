import { EloRating } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("EloEngine");

export class EloEngine {
  private defaultRating = 1500;
  private KFactor = 32;
  private homeAdvantageMultiplier = 50; // default home advantage rating boost

  /**
   * Fetches or initializes an Elo Rating for a team
   */
  public getOrInitRating(teamId: string): EloRating {
    let elo = intelligenceStorage.getElo(teamId);
    if (!elo) {
      elo = {
        teamId,
        rating: this.defaultRating,
        homeAdvantage: this.homeAdvantageMultiplier,
        goalDifferenceAdjustment: 1.0,
        leagueStrengthAdjustment: 1.0,
        relegationRisk: 0.1,
        history: [{ timestamp: new Date().toISOString(), rating: this.defaultRating, change: 0 }]
      };
      intelligenceStorage.setElo(teamId, elo);
    }
    return elo;
  }

  /**
   * Calculates new Elo ratings for two teams based on a match result.
   */
  public updateRatings(
    fixtureId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeScore: number,
    awayScore: number,
    leagueStrength = 1.0
  ): { homeNewRating: number; awayNewRating: number; ratingChange: number } {
    const homeElo = this.getOrInitRating(homeTeamId);
    const awayElo = this.getOrInitRating(awayTeamId);

    // Dynamic adjustment factors
    const homeRatingWithAdvantage = homeElo.rating + homeElo.homeAdvantage;
    const awayRating = awayElo.rating;

    // Expected scores
    const homeExpected = 1 / (1 + Math.pow(10, (awayRating - homeRatingWithAdvantage) / 400));
    const awayExpected = 1 / (1 + Math.pow(10, (homeRatingWithAdvantage - awayRating) / 400));

    // Actual outcomes
    let homeActual = 0.5;
    let awayActual = 0.5;

    if (homeScore > awayScore) {
      homeActual = 1.0;
      awayActual = 0.0;
    } else if (awayScore > homeScore) {
      homeActual = 0.0;
      awayActual = 1.0;
    }

    // Goal difference multiplier
    const gd = Math.abs(homeScore - awayScore);
    let gdMultiplier = 1.0;
    if (gd === 2) gdMultiplier = 1.5;
    else if (gd === 3) gdMultiplier = 1.75;
    else if (gd >= 4) gdMultiplier = 1.75 + (gd - 3) / 8;

    // K-factor scale with league strength
    const finalK = this.KFactor * leagueStrength;

    // Rating changes
    const homeChange = Math.round(finalK * gdMultiplier * (homeActual - homeExpected));
    const awayChange = Math.round(finalK * gdMultiplier * (awayActual - awayExpected));

    // Perform updates
    homeElo.rating += homeChange;
    awayElo.rating += awayChange;

    const timestamp = new Date().toISOString();
    homeElo.history.push({ timestamp, rating: homeElo.rating, change: homeChange, fixtureId });
    awayElo.history.push({ timestamp, rating: awayElo.rating, change: awayChange, fixtureId });

    // Relegation/promotion risk adjustments (just dynamic calculations)
    homeElo.relegationRisk = homeElo.rating < 1350 ? 0.75 : homeElo.rating < 1450 ? 0.35 : 0.05;
    awayElo.relegationRisk = awayElo.rating < 1350 ? 0.75 : awayElo.rating < 1450 ? 0.35 : 0.05;

    // Set updated values back
    intelligenceStorage.setElo(homeTeamId, homeElo);
    intelligenceStorage.setElo(awayTeamId, awayElo);

    logger.info(`Elo ratings updated for fixture '${fixtureId}': Home ${homeTeamId} (${homeElo.rating - homeChange} -> ${homeElo.rating}), Away ${awayTeamId} (${awayElo.rating - awayChange} -> ${awayElo.rating})`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.RatingUpdated, homeTeamId, { rating: homeElo.rating, change: homeChange, fixtureId });
    intelligenceEventBus.publish(IntelligenceEventType.RatingUpdated, awayTeamId, { rating: awayElo.rating, change: awayChange, fixtureId });

    return {
      homeNewRating: homeElo.rating,
      awayNewRating: awayElo.rating,
      ratingChange: homeChange
    };
  }

  /**
   * Perform seasonal Elo resets (reversion to mean)
   */
  public performSeasonReset(teamIds: string[], reversionFactor = 0.33) {
    logger.info(`Initiating Seasonal Mean Reversion for ${teamIds.length} teams...`);
    for (const teamId of teamIds) {
      const elo = this.getOrInitRating(teamId);
      const oldRating = elo.rating;
      // Revert 1/3 of the way back to the mean of 1500
      elo.rating = Math.round(elo.rating * (1 - reversionFactor) + this.defaultRating * reversionFactor);
      elo.history.push({
        timestamp: new Date().toISOString(),
        rating: elo.rating,
        change: elo.rating - oldRating
      });
      intelligenceStorage.setElo(teamId, elo);
    }
  }

  /**
   * Promotional handling boost / Relegation adjustment
   */
  public handlePromotionRelegation(promotedIds: string[], relegatedIds: string[]) {
    logger.info(`Handling Elo alignments for Promoted (${promotedIds.length}) and Relegated (${relegatedIds.length}) teams.`);
    
    // Promoted teams get aligned slightly below average (e.g. 1420)
    for (const id of promotedIds) {
      const elo = this.getOrInitRating(id);
      elo.rating = 1420;
      elo.history.push({ timestamp: new Date().toISOString(), rating: 1420, change: 1420 - 1500 });
      intelligenceStorage.setElo(id, elo);
    }

    // Relegated teams align slightly above league mean (e.g. 1380)
    for (const id of relegatedIds) {
      const elo = this.getOrInitRating(id);
      elo.rating = 1380;
      elo.history.push({ timestamp: new Date().toISOString(), rating: 1380, change: 1380 - 1500 });
      intelligenceStorage.setElo(id, elo);
    }
  }
}

export const eloEngine = new EloEngine();
