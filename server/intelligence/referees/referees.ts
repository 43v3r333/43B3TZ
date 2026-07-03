import { RefereeMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("RefereeEngine");

export class RefereeEngine {
  /**
   * Calculates or updates referee metrics based on historical match stats overseen by the referee.
   */
  public processMatchStats(
    refereeId: string,
    name: string,
    matchHistory: Array<{
      cardsYellowHome: number;
      cardsYellowAway: number;
      cardsRedHome: number;
      cardsRedAway: number;
      penaltiesHome: number;
      penaltiesAway: number;
      foulsHome: number;
      foulsAway: number;
      stoppageTime: number;
    }>
  ): RefereeMetrics {
    logger.info(`Analyzing performance metrics for Referee ID ${refereeId} (${name})`);

    const count = matchHistory.length;
    if (count === 0) {
      return {
        refereeId,
        name,
        cardsYellow: 3.5,
        cardsRed: 0.15,
        penalties: 0.22,
        fouls: 22.5,
        homeBias: 1.0,
        awayBias: 1.0,
        averageStoppageTime: 5.0,
        historicalTendencies: { strictnessScore: 50 }
      };
    }

    let totalYellow = 0;
    let totalRed = 0;
    let totalPenalties = 0;
    let totalFouls = 0;
    let totalStoppage = 0;

    let foulsHomeTotal = 0;
    let foulsAwayTotal = 0;
    let cardsHomeTotal = 0;
    let cardsAwayTotal = 0;

    matchHistory.forEach(match => {
      totalYellow += match.cardsYellowHome + match.cardsYellowAway;
      totalRed += match.cardsRedHome + match.cardsRedAway;
      totalPenalties += match.penaltiesHome + match.penaltiesAway;
      totalFouls += match.foulsHome + match.foulsAway;
      totalStoppage += match.stoppageTime;

      foulsHomeTotal += match.foulsHome;
      foulsAwayTotal += match.foulsAway;
      cardsHomeTotal += match.cardsYellowHome + match.cardsRedHome * 2;
      cardsAwayTotal += match.cardsYellowAway + match.cardsRedAway * 2;
    });

    const avgYellow = parseFloat((totalYellow / count).toFixed(2));
    const avgRed = parseFloat((totalRed / count).toFixed(2));
    const avgPenalties = parseFloat((totalPenalties / count).toFixed(2));
    const avgFouls = parseFloat((totalFouls / count).toFixed(2));
    const avgStoppageTime = parseFloat((totalStoppage / count).toFixed(1));

    // Bias calculation: ratio of fouls/cards given to home team vs away team
    // If < 1.0, means more fouls/cards are given to away team than home team (home bias)
    const foulsRatio = foulsAwayTotal > 0 ? foulsHomeTotal / foulsAwayTotal : 1.0;
    const cardsRatio = cardsAwayTotal > 0 ? cardsHomeTotal / cardsAwayTotal : 1.0;

    const homeBias = parseFloat(((foulsRatio + cardsRatio) / 2).toFixed(2));
    const awayBias = parseFloat((1 / homeBias).toFixed(2));

    // Strictness Score (0 to 100) based on average fouls and cards
    // 22 fouls & 3.5 yellow is average (50 strictness)
    const foulsFactor = (avgFouls / 22.5) * 50;
    const cardsFactor = (avgYellow / 3.5) * 50;
    const strictnessScore = Math.max(5, Math.min(100, Math.round((foulsFactor + cardsFactor) / 2)));

    const refereeMetrics: RefereeMetrics = {
      refereeId,
      name,
      cardsYellow: avgYellow,
      cardsRed: avgRed,
      penalties: avgPenalties,
      fouls: avgFouls,
      homeBias,
      awayBias,
      averageStoppageTime: avgStoppageTime,
      historicalTendencies: {
        strictnessScore,
        cardVolatility: parseFloat((avgYellow * 0.15).toFixed(2)),
        penaltyRatio: avgPenalties
      }
    };

    intelligenceStorage.setReferee(refereeId, refereeMetrics);
    logger.debug(`Referee metrics saved. Strictly scored at ${strictnessScore}/100, Home Bias: ${homeBias}`);

    return refereeMetrics;
  }
}

export const refereeEngine = new RefereeEngine();
