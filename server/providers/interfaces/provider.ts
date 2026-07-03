import { 
  NormalizedFixture,
  NormalizedOdds,
  NormalizedStatistics,
  NormalizedPlayer,
  NormalizedTeam,
  NormalizedWeather,
  NormalizedRanking,
  NormalizedNews,
  NormalizedCompetition,
  NormalizedVenue
} from "./dto";

export interface ProviderHealthStatus {
  available: boolean;
  latencyMs: number;
  successRate: number;
  failureRate: number;
  rateLimitStatus: {
    limit: number;
    remaining: number;
    resetTime: string;
  };
  authStatus: "authenticated" | "unauthenticated" | "failed";
  lastSuccessfulSync: string | null;
  cacheHitRatio: number;
  dataFreshnessSeconds: number;
}

export interface BaseProvider {
  name: string;
  version: string;
  priority: number; // For priority ordering
  capabilities: string[]; // List of capabilities/interfaces supported (e.g. ["fixtures", "odds"])
  
  initialize(): Promise<void>;
  authenticate(): Promise<boolean>;
  health(): Promise<ProviderHealthStatus>;
  shutdown(): Promise<void>;
}

export interface FixtureProvider extends BaseProvider {
  fetchFixtures(competitionId: string): Promise<any>;
  normalizeFixtures(raw: any): NormalizedFixture[];
  validateFixtures(normalized: NormalizedFixture[]): boolean;
  cacheFixtures(normalized: NormalizedFixture[]): Promise<void>;
}

export interface OddsProvider extends BaseProvider {
  fetchOdds(fixtureId: string): Promise<any>;
  normalizeOdds(raw: any): NormalizedOdds;
  validateOdds(normalized: NormalizedOdds): boolean;
  cacheOdds(normalized: NormalizedOdds): Promise<void>;
}

export interface StatisticsProvider extends BaseProvider {
  fetchStatistics(fixtureId: string): Promise<any>;
  normalizeStatistics(raw: any): NormalizedStatistics;
  validateStatistics(normalized: NormalizedStatistics): boolean;
  cacheStatistics(normalized: NormalizedStatistics): Promise<void>;
}

export interface PlayerProvider extends BaseProvider {
  fetchPlayers(teamId: string): Promise<any>;
  normalizePlayers(raw: any): NormalizedPlayer[];
  validatePlayers(normalized: NormalizedPlayer[]): boolean;
  cachePlayers(normalized: NormalizedPlayer[]): Promise<void>;
}

export interface TeamProvider extends BaseProvider {
  fetchTeams(competitionId: string): Promise<any>;
  normalizeTeams(raw: any): NormalizedTeam[];
  validateTeams(normalized: NormalizedTeam[]): boolean;
  cacheTeams(normalized: NormalizedTeam[]): Promise<void>;
}

export interface WeatherProvider extends BaseProvider {
  fetchWeather(fixtureId: string): Promise<any>;
  normalizeWeather(raw: any): NormalizedWeather;
  validateWeather(normalized: NormalizedWeather): boolean;
  cacheWeather(normalized: NormalizedWeather): Promise<void>;
}

export interface RankingProvider extends BaseProvider {
  fetchRankings(competitionId: string): Promise<any>;
  normalizeRankings(raw: any): NormalizedRanking[];
  validateRankings(normalized: NormalizedRanking[]): boolean;
  cacheRankings(normalized: NormalizedRanking[]): Promise<void>;
}

export interface NewsProvider extends BaseProvider {
  fetchNews(teamIds: string[]): Promise<any>;
  normalizeNews(raw: any): NormalizedNews[];
  validateNews(normalized: NormalizedNews[]): boolean;
  cacheNews(normalized: NormalizedNews[]): Promise<void>;
}

export interface CompetitionProvider extends BaseProvider {
  fetchCompetitions(): Promise<any>;
  normalizeCompetitions(raw: any): NormalizedCompetition[];
  validateCompetitions(normalized: NormalizedCompetition[]): boolean;
  cacheCompetitions(normalized: NormalizedCompetition[]): Promise<void>;
}

export interface VenueProvider extends BaseProvider {
  fetchVenues(): Promise<any>;
  normalizeVenues(raw: any): NormalizedVenue[];
  validateVenues(normalized: NormalizedVenue[]): boolean;
  cacheVenues(normalized: NormalizedVenue[]): Promise<void>;
}
