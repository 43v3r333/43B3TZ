import { ExpectedGoalsMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("ExpectedGoalsEngine");

export class ExpectedGoalsEngine {
  /**
   * Evaluates and updates xG metrics for a completed fixture based on normalized statistics.
   */
  public calculateMatchXg(
    fixtureId: string,
    stats: {
      shotsOnGoalHome: number;
      shotsOnGoalAway: number;
      shotsOffGoalHome: number;
      shotsOffGoalAway: number;
      homeScore?: number;
      awayScore?: number;
    }
  ): ExpectedGoalsMetrics {
    logger.info(`Calculating xG matrices for fixture '${fixtureId}'`);

    // Standard baseline weights for shots
    const SOT_WEIGHT = 0.31; // Shots on target
    const SOFF_WEIGHT = 0.09; // Shots off target

    const xGHome = parseFloat(
      ((stats.shotsOnGoalHome * SOT_WEIGHT) + (stats.shotsOffGoalHome * SOFF_WEIGHT)).toFixed(2)
    );
    const xGAway = parseFloat(
      ((stats.shotsOnGoalAway * SOT_WEIGHT) + (stats.shotsOffGoalAway * SOFF_WEIGHT)).toFixed(2)
    );

    // Shot quality (average xG per shot)
    const totalHomeShots = stats.shotsOnGoalHome + stats.shotsOffGoalHome;
    const shotQualityHome = totalHomeShots > 0 ? parseFloat((xGHome / totalHomeShots).toFixed(3)) : 0;

    const totalAwayShots = stats.shotsOnGoalAway + stats.shotsOffGoalAway;
    const shotQualityAway = totalAwayShots > 0 ? parseFloat((xGAway / totalAwayShots).toFixed(3)) : 0;

    // Finishing efficiency (Goals Scored / xG)
    const homeScore = stats.homeScore ?? 0;
    const awayScore = stats.awayScore ?? 0;

    const finishingEfficiencyHome = xGHome > 0 ? parseFloat((homeScore / xGHome).toFixed(2)) : 0;
    const finishingEfficiencyAway = xGAway > 0 ? parseFloat((awayScore / xGAway).toFixed(2)) : 0;

    // Chance creation score
    const chanceCreationHome = Math.round(totalHomeShots * 1.2);
    const chanceCreationAway = Math.round(totalAwayShots * 1.2);

    // Expected Assists (xA)
    const expectedAssistsHome = parseFloat((xGHome * 0.72).toFixed(2));
    const expectedAssistsAway = parseFloat((xGAway * 0.72).toFixed(2));

    // Expected Points (xPTS) using simplified probability distribution
    // Standard deviation estimated as 1.25
    const diff = xGHome - xGAway;
    let probHomeWin = 0.33;
    let probAwayWin = 0.33;
    let probDraw = 0.34;

    if (diff > 0.1) {
      const z = diff / 1.35;
      probHomeWin = Math.min(0.85, 0.33 + z * 0.5);
      probAwayWin = Math.max(0.05, 0.33 - z * 0.3);
      probDraw = 1.0 - probHomeWin - probAwayWin;
    } else if (diff < -0.1) {
      const z = Math.abs(diff) / 1.35;
      probAwayWin = Math.min(0.85, 0.33 + z * 0.5);
      probHomeWin = Math.max(0.05, 0.33 - z * 0.3);
      probDraw = 1.0 - probHomeWin - probAwayWin;
    }

    const expectedPointsHome = parseFloat((probHomeWin * 3 + probDraw * 1).toFixed(2));
    const expectedPointsAway = parseFloat((probAwayWin * 3 + probDraw * 1).toFixed(2));

    // Rolling summaries calculations (fetch historicals if available)
    const previousXgList = intelligenceStorage.getAllXg();
    const rollingSumHome = previousXgList.reduce((sum, item) => sum + item.xGHome, xGHome);
    const rollingSumAway = previousXgList.reduce((sum, item) => sum + item.xGAway, xGAway);
    
    const count = previousXgList.length + 1;
    const rollingAverageHome = parseFloat((rollingSumHome / count).toFixed(2));
    const rollingAverageAway = parseFloat((rollingSumAway / count).toFixed(2));

    const metrics: ExpectedGoalsMetrics = {
      fixtureId,
      xGHome,
      xGAway: xGAway,
      shotQualityHome,
      shotQualityAway,
      finishingEfficiencyHome,
      finishingEfficiencyAway,
      chanceCreationHome,
      chanceCreationAway,
      expectedAssistsHome,
      expectedAssistsAway,
      expectedPointsHome,
      expectedPointsAway,
      rollingAverageHome,
      rollingAverageAway
    };

    intelligenceStorage.setXg(fixtureId, metrics);
    return metrics;
  }
}

export const expectedGoalsEngine = new ExpectedGoalsEngine();
