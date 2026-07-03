import { FeatureMetadata } from "./FeatureMetadata";
import { FeatureValidator } from "./FeatureValidator";
import { createLogger } from "../core/logger";

const logger = createLogger("FeatureRegistry");

export class FeatureRegistry {
  private features: Map<string, FeatureMetadata> = new Map();

  constructor() {
    this.registerDefaultFeatures();
  }

  /**
   * Registers a new feature into the store.
   */
  public register(feature: FeatureMetadata): void {
    if (this.features.has(feature.id)) {
      logger.warn(`Overwriting feature ${feature.id} in registry.`);
    }
    this.features.set(feature.id, feature);
  }

  /**
   * Retrieves a feature by its ID.
   */
  public get(id: string): FeatureMetadata | undefined {
    return this.features.get(id);
  }

  /**
   * Returns all registered features.
   */
  public getAll(): FeatureMetadata[] {
    return Array.from(this.features.values());
  }

  /**
   * Populate with the advanced sports feature suite (Phase 2)
   */
  private registerDefaultFeatures(): void {
    // --- SPORTING FEATURES ---

    this.register({
      id: "feat_team_form",
      name: "Team Form Diff",
      category: "sporting",
      description: "Home Form minus Away Form based on past 5 results",
      version: "1.1.0",
      source: "MatchesHistoryService",
      dependencies: [],
      importance: 0.85,
      confidence: 0.90,
      quality: 0.95,
      freshness: 0.98,
      calculation: (raw) => {
        const homeResults = raw.homePastResults || ["W", "W", "D", "L", "W"];
        const awayResults = raw.awayPastResults || ["W", "D", "L", "W", "D"];
        const homeScore = calculateFormScore(homeResults);
        const awayScore = calculateFormScore(awayResults);
        return homeScore - awayScore;
      },
      validation: (val) => typeof val === "number" && val >= -1.0 && val <= 1.0,
    });

    this.register({
      id: "feat_rolling_form",
      name: "Rolling Form Exponential",
      category: "sporting",
      description: "Exponentially-weighted team form score over past 10 matches",
      version: "1.0.0",
      source: "TelemetrySystem",
      dependencies: ["feat_team_form"],
      importance: 0.82,
      confidence: 0.88,
      quality: 0.92,
      freshness: 0.95,
      calculation: (raw) => {
        const homeResults = raw.homePastResults || ["W", "W", "D", "L", "W"];
        const awayResults = raw.awayPastResults || ["W", "D", "L", "W", "D"];
        const hScore = homeResults.reduce((acc, r, idx) => acc + (r === "W" ? 1 : r === "D" ? 0.5 : 0) * Math.pow(0.8, idx), 0);
        const aScore = awayResults.reduce((acc, r, idx) => acc + (r === "W" ? 1 : r === "D" ? 0.5 : 0) * Math.pow(0.8, idx), 0);
        return hScore - aScore;
      },
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_elo_rating_diff",
      name: "ELO Differential",
      category: "sporting",
      description: "Raw rating differential between competing teams",
      version: "2.0.0",
      source: "EloService",
      dependencies: [],
      importance: 0.95,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => (raw.homeElo ?? 1550) - (raw.awayElo ?? 1500),
      validation: (val) => typeof val === "number" && Math.abs(val) < 1000,
    });

    this.register({
      id: "feat_expected_goals_diff",
      name: "Expected Goals Differential",
      category: "sporting",
      description: "Home Expected Goals minus Away Expected Goals Conceded average",
      version: "1.1.0",
      source: "OptaEtr",
      dependencies: [],
      importance: 0.91,
      confidence: 0.87,
      quality: 0.90,
      freshness: 0.95,
      calculation: (raw) => (raw.homeAvgXG ?? 1.8) - (raw.awayAvgXGConceded ?? 1.4),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_expected_assists",
      name: "Expected Assists Differential",
      category: "sporting",
      description: "Home Expected Assists minus Away Expected Assists conceded",
      version: "1.0.0",
      source: "OptaEtr",
      dependencies: [],
      importance: 0.78,
      confidence: 0.85,
      quality: 0.89,
      freshness: 0.92,
      calculation: (raw) => (raw.homeAvgXA ?? 1.3) - (raw.awayAvgXAConceded ?? 1.1),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_possession_quality",
      name: "Possession Quality",
      category: "sporting",
      description: "Integration of average possession ratio with passing accuracy index",
      version: "1.0.0",
      source: "PassingEngine",
      dependencies: [],
      importance: 0.74,
      confidence: 0.89,
      quality: 0.91,
      freshness: 0.94,
      calculation: (raw) => {
        const homePossession = raw.homeAvgPossession ?? 52;
        const awayPossession = raw.awayAvgPossession ?? 48;
        const homePassAccuracy = raw.homePassAccuracy ?? 0.81;
        const awayPassAccuracy = raw.awayPassAccuracy ?? 0.77;
        return (homePossession * homePassAccuracy) / (awayPossession * awayPassAccuracy || 1);
      },
      validation: (val) => typeof val === "number" && val > 0,
    });

    this.register({
      id: "feat_passing_networks",
      name: "Passing Networks Efficiency",
      category: "sporting",
      description: "Effectiveness score of ball circulation and passing networks under pressure",
      version: "1.0.0",
      source: "ChalkboardOpta",
      dependencies: [],
      importance: 0.69,
      confidence: 0.80,
      quality: 0.85,
      freshness: 0.90,
      calculation: (raw) => (raw.homePassingEfficiencyUnderPressure ?? 0.75) - (raw.awayPassingEfficiencyUnderPressure ?? 0.68),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_shot_quality",
      name: "Shot Quality Ratio",
      category: "sporting",
      description: "Proportion of total shots directed on target",
      version: "1.0.1",
      source: "MatchTracker",
      dependencies: [],
      importance: 0.81,
      confidence: 0.94,
      quality: 0.96,
      freshness: 0.97,
      calculation: (raw) => {
        const hSoT = raw.homeAvgShotsOnTarget ?? 5.4;
        const hShots = raw.homeAvgShots ?? 14.5;
        const aSoT = raw.awayAvgShotsOnTarget ?? 4.1;
        const aShots = raw.awayAvgShots ?? 11.2;
        return (hSoT / (hShots || 1)) - (aSoT / (aShots || 1));
      },
      validation: (val) => typeof val === "number" && val >= -1 && val <= 1,
    });

    this.register({
      id: "feat_big_chances",
      name: "Big Chances Differential",
      category: "sporting",
      description: "Created big chances minus conceded big chances",
      version: "1.0.0",
      source: "OptaEtr",
      dependencies: [],
      importance: 0.84,
      confidence: 0.91,
      quality: 0.93,
      freshness: 0.95,
      calculation: (raw) => (raw.homeBigChancesCreated ?? 2.4) - (raw.awayBigChancesConceded ?? 1.8),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_set_pieces",
      name: "Set Piece Performance",
      category: "sporting",
      description: "Team performance metrics from corners and set piece execution",
      version: "1.0.0",
      source: "TacticalDB",
      dependencies: [],
      importance: 0.62,
      confidence: 0.85,
      quality: 0.87,
      freshness: 0.90,
      calculation: (raw) => (raw.homeSetPieceXG ?? 0.45) - (raw.awaySetPieceXGConceded ?? 0.38),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_corners",
      name: "Corners Differential",
      category: "sporting",
      description: "Historical corners earned differential",
      version: "1.0.0",
      source: "StatsFeed",
      dependencies: [],
      importance: 0.58,
      confidence: 0.95,
      quality: 0.95,
      freshness: 0.98,
      calculation: (raw) => (raw.homeAvgCorners ?? 6.2) - (raw.awayAvgCorners ?? 4.8),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_pressing_intensity",
      name: "Pressing Intensity (PPDA)",
      category: "sporting",
      description: "Passes Allowed per Defensive Action (lower means higher intensity)",
      version: "1.0.0",
      source: "TacticalDB",
      dependencies: [],
      importance: 0.71,
      confidence: 0.86,
      quality: 0.88,
      freshness: 0.92,
      calculation: (raw) => {
        // Logically we invert PPDA to represent pressing strength
        const homePPDA = raw.homePPDA ?? 10.2;
        const awayPPDA = raw.awayPPDA ?? 12.8;
        return awayPPDA - homePPDA; // Positive values favor Home pressing better than Away
      },
      validation: (val) => typeof val === "number",
    });

    // --- CONTEXTUAL FEATURES ---

    this.register({
      id: "feat_travel_distance",
      name: "Away Travel Distance",
      category: "contextual",
      description: "Distance travelled by the away team in km",
      version: "1.0.0",
      source: "GeographicRegistry",
      dependencies: [],
      importance: 0.45,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => raw.awayTravelDistanceKm ?? 120.0,
      validation: (val) => typeof val === "number" && val >= 0,
    });

    this.register({
      id: "feat_altitude",
      name: "Stadium Altitude",
      category: "contextual",
      description: "Altitude of the stadium above sea level (in meters)",
      version: "1.0.0",
      source: "StadiumDirectory",
      dependencies: [],
      importance: 0.35,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => raw.stadiumAltitudeMeters ?? 50.0,
      validation: (val) => typeof val === "number" && val >= 0,
    });

    this.register({
      id: "feat_weather",
      name: "Weather Impact Index",
      category: "contextual",
      description: "Friction coeff on extreme atmospheric conditions",
      version: "1.0.0",
      source: "MeteoFeed",
      dependencies: [],
      importance: 0.38,
      confidence: 0.92,
      quality: 0.95,
      freshness: 0.99,
      calculation: (raw) => raw.weatherCondition === "Heavy Rain" || raw.weatherCondition === "Snow" ? 0.75 : 0.15,
      validation: (val) => typeof val === "number" && val >= 0 && val <= 1,
    });

    this.register({
      id: "feat_temperature",
      name: "Temperature Deviation",
      category: "contextual",
      description: "Absolute deviation from optimal sporting temperature of 15C",
      version: "1.0.0",
      source: "MeteoFeed",
      dependencies: [],
      importance: 0.32,
      confidence: 0.98,
      quality: 0.98,
      freshness: 0.99,
      calculation: (raw) => Math.abs((raw.matchTemperatureCelsius ?? 15.0) - 15.0),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_humidity",
      name: "Humidity Level",
      category: "contextual",
      description: "Atmospheric relative humidity percentage",
      version: "1.0.0",
      source: "MeteoFeed",
      dependencies: [],
      importance: 0.30,
      confidence: 0.98,
      quality: 0.98,
      freshness: 0.99,
      calculation: (raw) => raw.matchHumidityPercentage ?? 60.0,
      validation: (val) => typeof val === "number" && val >= 0 && val <= 100,
    });

    this.register({
      id: "feat_pitch_surface",
      name: "Pitch Surface Factor",
      category: "contextual",
      description: "Coefficient evaluating the surface speed/friction (natural grass vs artificial turf)",
      version: "1.0.0",
      source: "StadiumDirectory",
      dependencies: [],
      importance: 0.28,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => raw.pitchSurfaceType === "Artificial Turf" ? 0.8 : 1.0,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_referee_bias",
      name: "Referee Bias Index",
      category: "contextual",
      description: "Home-favorability frequency coefficient for designated match official",
      version: "1.2.0",
      source: "RefAnalytics",
      dependencies: [],
      importance: 0.48,
      confidence: 0.90,
      quality: 0.91,
      freshness: 0.95,
      calculation: (raw) => raw.refereeHomeWinRatio ?? 0.52,
      validation: (val) => typeof val === "number" && val >= 0 && val <= 1,
    });

    this.register({
      id: "feat_var_frequency",
      name: "VAR Intervention Rate",
      category: "contextual",
      description: "Statistical average of VAR interventions per game in current official context",
      version: "1.0.0",
      source: "RefAnalytics",
      dependencies: [],
      importance: 0.34,
      confidence: 0.88,
      quality: 0.90,
      freshness: 0.95,
      calculation: (raw) => raw.refereeVarInterventionsPerMatch ?? 0.38,
      validation: (val) => typeof val === "number" && val >= 0,
    });

    this.register({
      id: "feat_player_fatigue",
      name: "Player Fatigue Coefficient",
      category: "sporting",
      description: "Weighted fatigue index of the top squad members based on short-term schedule density",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.77,
      confidence: 0.84,
      quality: 0.86,
      freshness: 0.90,
      calculation: (raw) => (raw.awaySquadFatigueIndex ?? 0.25) - (raw.homeSquadFatigueIndex ?? 0.15),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_fixture_congestion",
      name: "Fixture Congestion Ratio",
      category: "sporting",
      description: "Ratio of rest days between opposing teams",
      version: "1.0.0",
      source: "LeagueSchedule",
      dependencies: [],
      importance: 0.72,
      confidence: 0.98,
      quality: 0.98,
      freshness: 1.00,
      calculation: (raw) => {
        const homeRest = raw.homeRestDays ?? 5;
        const awayRest = raw.awayRestDays ?? 4;
        return homeRest / (awayRest || 1);
      },
      validation: (val) => typeof val === "number" && val > 0,
    });

    this.register({
      id: "feat_rest_days_diff",
      name: "Rest Days Differential",
      category: "contextual",
      description: "Simple rest days difference between competing teams",
      version: "1.0.0",
      source: "LeagueSchedule",
      dependencies: [],
      importance: 0.55,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => (raw.homeRestDays ?? 5) - (raw.awayRestDays ?? 4),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_squad_rotation",
      name: "Squad Rotation Degree",
      category: "sporting",
      description: "Inbound roster adjustments since the previous official league encounter",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.65,
      confidence: 0.88,
      quality: 0.92,
      freshness: 0.95,
      calculation: (raw) => (raw.homeSquadRotationPercent ?? 0.18) - (raw.awaySquadRotationPercent ?? 0.12),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_injury_severity",
      name: "Injury Severity Weighted",
      category: "sporting",
      description: "Severe starting roster absence points weighted by squad tier status",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.82,
      confidence: 0.90,
      quality: 0.94,
      freshness: 0.98,
      calculation: (raw) => (raw.awayInjurySeverityScore ?? 1.2) - (raw.homeInjurySeverityScore ?? 0.8),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_injury_index",
      name: "Injury Index",
      category: "sporting",
      description: "Basic home injury coefficient multiplier",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.82,
      confidence: 0.95,
      quality: 0.95,
      freshness: 0.98,
      calculation: (raw) => raw.homeInjuryCount ? raw.homeInjuryCount * 0.15 : 0.05,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_player_availability_ratio",
      name: "Player Availability Ratio",
      category: "sporting",
      description: "Ration of healthy starters available (starting XI)",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.88,
      confidence: 0.96,
      quality: 0.96,
      freshness: 0.98,
      calculation: (raw) => (raw.homeHealthyStarters ?? 10) / 11,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_transfer_impact",
      name: "Transfer Impact Index",
      category: "sporting",
      description: "Quantified rating impact of major mid-season transfer windows integrations",
      version: "1.0.0",
      source: "RosterDB",
      dependencies: [],
      importance: 0.60,
      confidence: 0.85,
      quality: 0.87,
      freshness: 0.90,
      calculation: (raw) => (raw.homeTransferRatingGain ?? 15.0) - (raw.awayTransferRatingGain ?? 5.0),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_manager_change",
      name: "Manager Bounce Duration",
      category: "sporting",
      description: "Days since designated tactical replacement to score structural morale boosts",
      version: "1.0.0",
      source: "LeagueSchedule",
      dependencies: [],
      importance: 0.58,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => {
        const homeDays = raw.homeDaysSinceManagerChange ?? 365;
        const awayDays = raw.awayDaysSinceManagerChange ?? 365;
        // The bounce is highest immediately after change, decaying exponentially
        const hBounce = Math.exp(-homeDays / 45);
        const aBounce = Math.exp(-awayDays / 45);
        return hBounce - aBounce;
      },
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_home_advantage_index",
      name: "Home Advantage Index",
      category: "contextual",
      description: "Home-win ratio of home team over past 2 seasons",
      version: "1.0.0",
      source: "HistoricalAnalytics",
      dependencies: [],
      importance: 0.76,
      confidence: 0.95,
      quality: 0.95,
      freshness: 0.99,
      calculation: (raw) => raw.homeWinRatioHistorical ?? 0.58,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_away_difficulty",
      name: "Away Difficulty Metric",
      category: "sporting",
      description: "Resistance coefficient modeling viscosity of away fixtures in hostile venues",
      version: "1.0.0",
      source: "HistoricalAnalytics",
      dependencies: [],
      importance: 0.70,
      confidence: 0.92,
      quality: 0.94,
      freshness: 0.98,
      calculation: (raw) => raw.awayDifficultyRating ?? 0.65,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_historical_matchups_diff",
      name: "Historical Head-To-Head",
      category: "sporting",
      description: "Historical head-to-head match ratio favoring home team",
      version: "1.0.0",
      source: "HistoricalAnalytics",
      dependencies: [],
      importance: 0.68,
      confidence: 0.95,
      quality: 0.95,
      freshness: 0.99,
      calculation: (raw) => raw.historicalHeadToHeadHomeWinRatio ?? 0.60,
      validation: (val) => typeof val === "number",
    });

    // --- MARKET FEATURES ---

    this.register({
      id: "feat_bookmaker_drift",
      name: "Bookmaker Drift Velocity",
      category: "market",
      description: "Drift velocity index showing movement rate of opening prices on primary outcome",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.71,
      confidence: 0.98,
      quality: 0.98,
      freshness: 1.00,
      calculation: (raw) => raw.oddsDriftHomeSpeed ?? 0.05,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_market_movement",
      name: "Market Odds Direction",
      category: "market",
      description: "Primary opening home odds minus closing home odds",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.79,
      confidence: 0.98,
      quality: 0.98,
      freshness: 1.00,
      calculation: (raw) => (raw.closingOddsHome ?? 1.85) - (raw.openingOddsHome ?? 2.0),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_market_steam",
      name: "Market Steam Factor",
      category: "market",
      description: "Magnitude coefficient measuring abrupt sync shifts across global oddsmakers",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.75,
      confidence: 0.95,
      quality: 0.97,
      freshness: 1.00,
      calculation: (raw) => raw.marketSteamCoefficient ?? 0.12,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_line_movement",
      name: "Line Movement Absolute",
      category: "market",
      description: "Absolute distance traversed by opening-to-live handicap bounds",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.68,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => Math.abs((raw.liveHandicapValue ?? 1.5) - (raw.openingHandicapValue ?? 1.5)),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_odds_volatility",
      name: "Odds Volatility Index",
      category: "market",
      description: "Standard deviation of global composite prices during final pre-kickoff hour",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.66,
      confidence: 0.97,
      quality: 0.98,
      freshness: 1.00,
      calculation: (raw) => raw.oddsVolatilityHomeHour ?? 0.04,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_public_betting_pct",
      name: "Public Betting Percentage",
      category: "market",
      description: "Relative consumer ticket writing ratio tracking general public bias",
      version: "1.0.0",
      source: "PublicLedger",
      dependencies: [],
      importance: 0.50,
      confidence: 0.90,
      quality: 0.90,
      freshness: 0.95,
      calculation: (raw) => raw.publicTicketPctHome ?? 0.55,
      validation: (val) => typeof val === "number" && val >= 0 && val <= 1,
    });

    this.register({
      id: "feat_sharp_money_pct",
      name: "Sharp Money Percentage",
      category: "market",
      description: "Disproportionate financial backing index signifying highly technical wagering presence",
      version: "1.1.0",
      source: "PublicLedger",
      dependencies: [],
      importance: 0.86,
      confidence: 0.94,
      quality: 0.95,
      freshness: 0.99,
      calculation: (raw) => raw.sharpHandlePctHome ?? 0.72,
      validation: (val) => typeof val === "number" && val >= 0 && val <= 1,
    });

    this.register({
      id: "feat_closing_line_value",
      name: "Expected Closing Line Value",
      category: "market",
      description: "Calculated spread valuation yield indicating value efficiency over the bookmaker closing point",
      version: "1.0.0",
      source: "OddsFeed",
      dependencies: [],
      importance: 0.89,
      confidence: 0.99,
      quality: 0.99,
      freshness: 1.00,
      calculation: (raw) => (raw.openingOddsHome ?? 2.0) / (raw.closingOddsHome ?? 1.85) - 1.0,
      validation: (val) => typeof val === "number",
    });

    // --- STRATEGIC / ADVERSARIAL ---

    this.register({
      id: "feat_momentum_factor",
      name: "Form Momentum Factor",
      category: "sporting",
      description: "Exponentially-weighted moving average of points over past 3 games",
      version: "1.0.0",
      source: "StatsFeed",
      dependencies: ["feat_team_form"],
      importance: 0.83,
      confidence: 0.92,
      quality: 0.94,
      freshness: 0.98,
      calculation: (raw) => {
        const homeResults = raw.homePastResults || ["W", "W", "D", "L", "W"];
        const awayResults = raw.awayPastResults || ["W", "D", "L", "W", "D"];
        const hForm = calculateFormScore(homeResults);
        const aForm = calculateFormScore(awayResults);
        return (hForm * 1.2) - (aForm * 0.8);
      },
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_tournament_pressure_index",
      name: "Tournament Pressure Index",
      category: "contextual",
      description: "Quantified stake index (relegation fight, title race, knockout stage status)",
      version: "1.0.0",
      source: "LeagueSchedule",
      dependencies: [],
      importance: 0.62,
      confidence: 0.95,
      quality: 0.95,
      freshness: 1.00,
      calculation: (raw) => raw.matchImportanceScale ?? 0.7,
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_knockout_experience",
      name: "Knockout Stage Experience",
      category: "contextual",
      description: "Cumulative squad player games in international or cup knockout match definitions",
      version: "1.0.0",
      source: "HistoricalAnalytics",
      dependencies: [],
      importance: 0.64,
      confidence: 0.90,
      quality: 0.92,
      freshness: 0.95,
      calculation: (raw) => (raw.homeKnockoutCapsCount ?? 245) - (raw.awayKnockoutCapsCount ?? 110),
      validation: (val) => typeof val === "number",
    });

    this.register({
      id: "feat_intl_break_recovery",
      name: "International Break Recovery Decelerator",
      category: "contextual",
      description: "Penalty scale tracking fatigue of roster players returning from grueling continental transits",
      version: "1.0.0",
      source: "SquadTracker",
      dependencies: [],
      importance: 0.52,
      confidence: 0.85,
      quality: 0.89,
      freshness: 0.90,
      calculation: (raw) => (raw.awayIntlBreakTravelersCount ?? 14) - (raw.homeIntlBreakTravelersCount ?? 6),
      validation: (val) => typeof val === "number",
    });
  }
}

function calculateFormScore(results: string[]): number {
  if (results.length === 0) return 0.5;
  let score = 0;
  results.forEach((res) => {
    if (res === "W") score += 1.0;
    else if (res === "D") score += 0.5;
  });
  return score / results.length;
}

export const featureRegistry = new FeatureRegistry();
