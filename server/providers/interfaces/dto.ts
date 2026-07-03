export interface NormalizedCompetition {
  competitionId: string;
  name: string;
  country: string;
  type: "league" | "cup" | "tournament";
  active: boolean;
}

export interface NormalizedLeague {
  leagueId: string;
  name: string;
  country: string;
  season: string;
}

export interface NormalizedSeason {
  seasonId: string;
  year: number;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface NormalizedVenue {
  venueId: string;
  name: string;
  city: string;
  capacity: number;
  surface: "grass" | "artificial" | "hybrid" | "clay" | "hard" | "indoor";
}

export interface NormalizedTeam {
  teamId: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  founded?: number;
  venue?: NormalizedVenue;
}

export interface NormalizedPlayer {
  playerId: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  nationality: string;
  position: "G" | "D" | "M" | "A";
  injured: boolean;
  injuryDetails?: string;
}

export interface NormalizedFixture {
  fixtureId: string;
  competition: NormalizedCompetition;
  season: string;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
  kickoff: string;
  status: "scheduled" | "in_play" | "finished" | "postponed" | "cancelled";
  homeScore?: number;
  awayScore?: number;
  venue?: NormalizedVenue;
}

export interface NormalizedMarket {
  marketId: string;
  name: "1X2" | "OverUnder" | "BothTeamsToScore" | "DrawNoBet";
  outcomes: Array<{
    name: string;
    odds: number;
    probability?: number;
  }>;
}

export interface NormalizedOdds {
  oddsId: string;
  fixtureId: string;
  providerName: string;
  timestamp: string;
  markets: NormalizedMarket[];
}

export interface NormalizedStatistics {
  fixtureId: string;
  possessionHome: number;
  possessionAway: number;
  shotsOnGoalHome: number;
  shotsOnGoalAway: number;
  shotsOffGoalHome: number;
  shotsOffGoalAway: number;
  foulsHome: number;
  foulsAway: number;
  cornersHome: number;
  cornersAway: number;
}

export interface NormalizedWeather {
  fixtureId: string;
  temperatureCelcius: number;
  humidityPercent: number;
  windSpeedKph: number;
  condition: "sunny" | "cloudy" | "rainy" | "windy" | "snowy" | "unknown";
}

export interface NormalizedRanking {
  teamId: string;
  rank: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface NormalizedNews {
  newsId: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  publishedAt: string;
  relatedTeamIds: string[];
  sentimentScore: number; // -1 to +1
}
