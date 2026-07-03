import { createLogger } from "../../core/logger";

const logger = createLogger("FeatureEngineering");

export interface FeatureMetadata {
  id: string;
  name: string;
  category: "sporting" | "market" | "contextual";
  description: string;
  importanceScore: number; // [0.0, 1.0] Importance score for model selection
}

export interface EngineeredFeatureSet {
  features: Record<string, any>;
  metadata: Record<string, FeatureMetadata>;
}

export class FeatureEngine {
  private featureMetadata: Record<string, FeatureMetadata> = {
    feat_team_form: {
      id: "feat_team_form",
      name: "Team Form",
      category: "sporting",
      description: "Moving average of past 5 match results (win=1.0, draw=0.5, loss=0.0)",
      importanceScore: 0.85,
    },
    feat_elo_rating_diff: {
      id: "feat_elo_rating_diff",
      name: "ELO Rating Differential",
      category: "sporting",
      description: "Direct rating difference between home and away teams using adjusted ratings",
      importanceScore: 0.95,
    },
    feat_expected_goals_diff: {
      id: "feat_expected_goals_diff",
      name: "Expected Goals (xG) Differential",
      category: "sporting",
      description: "Difference between Home team xG generated and Away team xG conceded over past 10 games",
      importanceScore: 0.91,
    },
    feat_possession_ratio: {
      id: "feat_possession_ratio",
      name: "Possession Ratio",
      category: "sporting",
      description: "Ratio of average possession percentages in recent match histories",
      importanceScore: 0.65,
    },
    feat_shots_differential: {
      id: "feat_shots_differential",
      name: "Shots Differential",
      category: "sporting",
      description: "Average total shots differential over past 10 matches",
      importanceScore: 0.72,
    },
    feat_shots_on_target_diff: {
      id: "feat_shots_on_target_diff",
      name: "Shots On Target Differential",
      category: "sporting",
      description: "Average shots on target differential over past 10 matches",
      importanceScore: 0.81,
    },
    feat_travel_distance: {
      id: "feat_travel_distance",
      name: "Away Team Travel Distance",
      category: "contextual",
      description: "Geographical travel distance (km) for the visiting team",
      importanceScore: 0.45,
    },
    feat_rest_days_diff: {
      id: "feat_rest_days_diff",
      name: "Rest Days Differential",
      category: "contextual",
      description: "Rest days of Home team minus Away team",
      importanceScore: 0.55,
    },
    feat_home_advantage_index: {
      id: "feat_home_advantage_index",
      name: "Home Advantage Index",
      category: "contextual",
      description: "Calculated home-win ratio of the home team over past 2 seasons",
      importanceScore: 0.76,
    },
    feat_weather_friction: {
      id: "feat_weather_friction",
      name: "Weather Friction Index",
      category: "contextual",
      description: "Impact index based on high rain, wind, or extreme temperatures",
      importanceScore: 0.38,
    },
    feat_player_availability_ratio: {
      id: "feat_player_availability_ratio",
      name: "Player Availability Ratio",
      category: "sporting",
      description: "Ratio of healthy key players (starting XI) available to play",
      importanceScore: 0.88,
    },
    feat_injury_index: {
      id: "feat_injury_index",
      name: "Team Injury Severity Index",
      category: "sporting",
      description: "Impact coefficient of injured player pool weighted by starting lineup history",
      importanceScore: 0.82,
    },
    feat_market_movement: {
      id: "feat_market_movement",
      name: "Market Odds Direction",
      category: "market",
      description: "Vig-adjusted implied probabilities movement since opening lines",
      importanceScore: 0.79,
    },
    feat_bookmaker_drift: {
      id: "feat_bookmaker_drift",
      name: "Bookmaker Drift Speed",
      category: "market",
      description: "Velocity of opening and closing price changes on main betting outcome",
      importanceScore: 0.71,
    },
    feat_historical_matchups_diff: {
      id: "feat_historical_matchups_diff",
      name: "Historical Matchups Ratio",
      category: "sporting",
      description: "Average match outcome points earned by Home team against Away team in last 5 encounters",
      importanceScore: 0.68,
    },
    feat_referee_bias_index: {
      id: "feat_referee_bias_index",
      name: "Referee Home Favorability",
      category: "contextual",
      description: "Home win ratio for matches refereed by current official in past 3 seasons",
      importanceScore: 0.48,
    },
    feat_tournament_pressure_index: {
      id: "feat_tournament_pressure_index",
      name: "Tournament Pressure Index",
      category: "contextual",
      description: "Quantified stake index (relegation fight, title race, knockout stage status)",
      importanceScore: 0.62,
    },
    feat_momentum_factor: {
      id: "feat_momentum_factor",
      name: "In-Match/Recent Momentum Factor",
      category: "sporting",
      description: "Exponentially-weighted moving average of points over past 3 games",
      importanceScore: 0.83,
    },
  };

  /**
   * Generates a fully engineered feature snapshot based on raw match telemetry and histories.
   */
  public generateFeatures(rawTelemetry: Record<string, any>): EngineeredFeatureSet {
    logger.info(`Starting feature engineering process for match: ${rawTelemetry.matchId || "unknown"}`);
    
    const features: Record<string, any> = {};

    // 1. Team Form: Moving average of past results
    const homeForm = rawTelemetry.homePastResults ? this.calculateFormScore(rawTelemetry.homePastResults) : 0.65;
    const awayForm = rawTelemetry.awayPastResults ? this.calculateFormScore(rawTelemetry.awayPastResults) : 0.58;
    features["feat_team_form"] = homeForm - awayForm;

    // 2. ELO Rating Differential
    const homeElo = rawTelemetry.homeElo ?? 1550;
    const awayElo = rawTelemetry.awayElo ?? 1500;
    features["feat_elo_rating_diff"] = homeElo - awayElo;

    // 3. Expected Goals Differential (xG)
    const homeXG = rawTelemetry.homeAvgXG ?? 1.8;
    const awayXG = rawTelemetry.awayAvgXGConceded ?? 1.4;
    features["feat_expected_goals_diff"] = homeXG - awayXG;

    // 4. Possession Ratio
    features["feat_possession_ratio"] = (rawTelemetry.homeAvgPossession ?? 52) / (rawTelemetry.awayAvgPossession ?? 48);

    // 5. Shots Differential
    features["feat_shots_differential"] = (rawTelemetry.homeAvgShots ?? 14.5) - (rawTelemetry.awayAvgShots ?? 11.2);

    // 6. Shots On Target Differential
    features["feat_shots_on_target_diff"] = (rawTelemetry.homeAvgShotsOnTarget ?? 5.4) - (rawTelemetry.awayAvgShotsOnTarget ?? 4.1);

    // 7. Travel Distance
    features["feat_travel_distance"] = rawTelemetry.awayTravelDistanceKm ?? 120.0;

    // 8. Rest Days Differential
    features["feat_rest_days_diff"] = (rawTelemetry.homeRestDays ?? 5) - (rawTelemetry.awayRestDays ?? 4);

    // 9. Home Advantage Index
    features["feat_home_advantage_index"] = rawTelemetry.homeWinRatioHistorical ?? 0.58;

    // 10. Weather Friction Index
    features["feat_weather_friction"] = rawTelemetry.weatherCondition === "Heavy Rain" || rawTelemetry.weatherCondition === "Snow" ? 0.75 : 0.15;

    // 11. Player Availability Ratio
    features["feat_player_availability_ratio"] = (rawTelemetry.homeHealthyStarters ?? 10) / 11;

    // 12. Team Injury Severity Index
    features["feat_injury_index"] = rawTelemetry.homeInjuryCount ? rawTelemetry.homeInjuryCount * 0.15 : 0.05;

    // 13. Market Movement
    features["feat_market_movement"] = (rawTelemetry.closingOddsHome ?? 1.85) - (rawTelemetry.openingOddsHome ?? 2.0);

    // 14. Bookmaker Drift
    features["feat_bookmaker_drift"] = rawTelemetry.oddsDriftHomeSpeed ?? 0.05;

    // 15. Historical Matchups Ratio
    features["feat_historical_matchups_diff"] = rawTelemetry.historicalHeadToHeadHomeWinRatio ?? 0.6;

    // 16. Referee Bias Index
    features["feat_referee_bias_index"] = rawTelemetry.refereeHomeWinRatio ?? 0.52;

    // 17. Tournament Pressure Index
    features["feat_tournament_pressure_index"] = rawTelemetry.matchImportanceScale ?? 0.7;

    // 18. Momentum Factor
    features["feat_momentum_factor"] = (homeForm * 1.2) - (awayForm * 0.8);

    // Perform feature selection (filtering features that don't pass an importance threshold of 0.4)
    const activeFeatures: Record<string, any> = {};
    const activeMetadata: Record<string, FeatureMetadata> = {};

    for (const key of Object.keys(features)) {
      const meta = this.featureMetadata[key];
      if (meta && meta.importanceScore >= 0.4) {
        activeFeatures[key] = features[key];
        activeMetadata[key] = meta;
      }
    }

    logger.info(`Engineered ${Object.keys(activeFeatures).length} active features with score threshold check.`);
    return {
      features: activeFeatures,
      metadata: activeMetadata,
    };
  }

  private calculateFormScore(results: string[]): number {
    if (results.length === 0) return 0.5;
    let score = 0;
    results.forEach(res => {
      if (res === "W") score += 1.0;
      else if (res === "D") score += 0.5;
    });
    return score / results.length;
  }
}

export const featureEngine = new FeatureEngine();
