export interface TeamIntelligence {
  teamId: string;
  name: string;
  currentForm: number; // 0-100 or weighted score
  rollingForm: number[]; // e.g. last 5 results mapped to points [3, 1, 0, 3, 3]
  homeForm: number;
  awayForm: number;
  goalsScored: number;
  goalsConceded: number;
  expectedGoals: number;
  expectedGoalsAgainst: number;
  cleanSheets: number;
  possessionTrends: number[]; // rolling possession values
  shotQuality: number; // average shot quality
  conversionRate: number; // goals / shots
  pressingIntensity: number; // PPDA or similar
  defensiveEfficiency: number;
  attackEfficiency: number;
  recentMomentum: number;
  strengthOfSchedule: number;
  leagueRelativeStrength: number;
  homeAdvantageFactor: number;
  rollingRatings: number[];
  updatedAt: string;
}

export interface PlayerIntelligence {
  playerId: string;
  name: string;
  fitness: number; // 0-100
  minutesPlayed: number;
  goals: number;
  assists: number;
  expectedGoals: number;
  expectedAssists: number;
  cards: { yellow: number; red: number };
  availability: "available" | "injured" | "suspended" | "rested" | "unknown";
  fatigue: number; // 0-100
  travelDistanceKm: number;
  formScore: number; // 0-100
  position: "G" | "D" | "M" | "A";
  impactScore: number; // 0-100
  contributionScore: number; // 0-100
  replacementImpact: number; // impact drop if replaced (-10 to 10)
  updatedAt: string;
}

export interface EloRating {
  teamId: string;
  rating: number;
  homeAdvantage: number;
  goalDifferenceAdjustment: number;
  leagueStrengthAdjustment: number;
  relegationRisk: number;
  history: Array<{ timestamp: string; rating: number; change: number; fixtureId?: string }>;
}

export interface ExpectedGoalsMetrics {
  fixtureId: string;
  xGHome: number;
  xGAway: number;
  shotQualityHome: number;
  shotQualityAway: number;
  finishingEfficiencyHome: number; // goals / xG
  finishingEfficiencyAway: number;
  chanceCreationHome: number;
  chanceCreationAway: number;
  expectedAssistsHome: number;
  expectedAssistsAway: number;
  expectedPointsHome: number;
  expectedPointsAway: number;
  rollingAverageHome: number;
  rollingAverageAway: number;
}

export interface FormMetrics {
  entityId: string; // teamId
  last5: string[]; // e.g. ["W", "D", "L", "W", "W"]
  last10: string[];
  home: string[];
  away: string[];
  competitionSpecific: Record<string, string[]>;
  opponentStrengthAdjusted: number; // form score adjusted by opponents' ELO
  weightedForm: number; // more recent matches weighted higher
  momentum: number; // short-term momentum factor
  trendDirection: "rising" | "stable" | "falling";
}

export interface FatigueMetrics {
  entityId: string; // teamId or playerId
  daysRest: number;
  travelDistance: number; // km
  fixtureCongestion: number; // matches in last 21 days
  backToBackMatches: boolean;
  timeZoneChanges: number;
  recoveryScore: number; // 0-100
}

export interface WeatherNormalized {
  fixtureId: string;
  temperature: number;
  rain: boolean;
  windSpeed: number;
  humidity: number;
  pitchCondition: "excellent" | "good" | "poor" | "waterlogged";
  forecastConfidence: number; // 0-100
  historicalWeatherImpact: number; // factor
}

export interface RefereeMetrics {
  refereeId: string;
  name: string;
  cardsYellow: number;
  cardsRed: number;
  penalties: number;
  fouls: number;
  homeBias: number; // home fouls/cards ratio
  awayBias: number;
  averageStoppageTime: number; // minutes
  historicalTendencies: Record<string, number>;
}

export interface MarketIntelligenceMetrics {
  fixtureId: string;
  openingOdds: { home: number; draw: number; away: number };
  closingOdds: { home: number; draw: number; away: number };
  oddsMovement: { home: "up" | "down" | "stable"; away: "up" | "down" | "stable" };
  marketConsensus: "home" | "draw" | "away" | "unclear";
  impliedProbability: { home: number; draw: number; away: number };
  overround: number;
  closingLineValue: number; // relative value vs opening
  sharpMovement: boolean;
  steamMoves: boolean;
}

export interface IntelligenceQualityMetrics {
  entityId: string; // e.g. fixtureId, teamId, playerId
  freshness: number; // 0-100 (time since last update)
  coverage: number; // 0-100 (percentage of fields filled)
  reliability: number; // 0-100 (reliability of sources)
  variance: number; // 0-100 (volatility of metric)
  confidence: number; // 0-100 (weighted aggregate)
}

export enum IntelligenceEventType {
  TeamUpdated = "TeamUpdated",
  PlayerUpdated = "PlayerUpdated",
  FixtureUpdated = "FixtureUpdated",
  RatingUpdated = "RatingUpdated",
  FormUpdated = "FormUpdated",
  WeatherUpdated = "WeatherUpdated",
  MarketUpdated = "MarketUpdated",
  IntelligenceGenerated = "IntelligenceGenerated",
  QualityCalculated = "QualityCalculated"
}

export interface IntelligenceEvent {
  eventId: string;
  eventType: IntelligenceEventType;
  timestamp: string;
  entityId: string;
  payload: any;
}

export interface HistoricalSnapshot<T = any> {
  snapshotId: string;
  entityId: string;
  entityType: "team" | "player" | "fixture" | "weather" | "referee" | "market" | "elo" | "form" | "fatigue" | "xg" | "quality";
  timestamp: string;
  version: number;
  data: T;
}
