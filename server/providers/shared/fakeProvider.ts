import { 
  FixtureProvider,
  OddsProvider,
  StatisticsProvider,
  PlayerProvider,
  TeamProvider,
  WeatherProvider,
  RankingProvider,
  NewsProvider,
  CompetitionProvider,
  VenueProvider,
  ProviderHealthStatus
} from "../interfaces/provider";
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
} from "../interfaces/dto";
import { providerCache } from "../cache/cache";
import { createLogger } from "../../core/logger";

const logger = createLogger("FakeSportsDataProvider");

export class FakeSportsDataProvider implements 
  FixtureProvider,
  OddsProvider,
  StatisticsProvider,
  PlayerProvider,
  TeamProvider,
  WeatherProvider,
  RankingProvider,
  NewsProvider,
  CompetitionProvider,
  VenueProvider
{
  public name = "FakeSportsData";
  public version = "v1.2";
  public priority = 3;
  public capabilities = [
    "fixtures", "odds", "statistics", "players", "teams", 
    "weather", "rankings", "news", "competitions", "venues"
  ];

  // Configurable failure modes for testing
  public forceFailure = false;
  public authFails = false;
  public slowResponse = false;
  public simRateLimit = false;

  public async initialize(): Promise<void> {
    logger.info("Initializing FakeSportsDataProvider...");
  }

  public async authenticate(): Promise<boolean> {
    if (this.authFails) {
      logger.warn("FakeSportsDataProvider authentication failed deliberately.");
      return false;
    }
    return true;
  }

  public async health(): Promise<ProviderHealthStatus> {
    if (this.forceFailure) {
      return {
        available: false,
        latencyMs: 500,
        successRate: 0.2,
        failureRate: 0.8,
        rateLimitStatus: { limit: 100, remaining: 0, resetTime: new Date().toISOString() },
        authStatus: "failed",
        lastSuccessfulSync: null,
        cacheHitRatio: 0.4,
        dataFreshnessSeconds: 1200
      };
    }
    return {
      available: true,
      latencyMs: this.slowResponse ? 1500 : 25,
      successRate: 1.0,
      failureRate: 0.0,
      rateLimitStatus: { 
        limit: 100, 
        remaining: this.simRateLimit ? 1 : 98, 
        resetTime: new Date(Date.now() + 30000).toISOString() 
      },
      authStatus: "authenticated",
      lastSuccessfulSync: new Date().toISOString(),
      cacheHitRatio: 0.92,
      dataFreshnessSeconds: 10
    };
  }

  public async shutdown(): Promise<void> {
    logger.info("FakeSportsDataProvider shutdown executed.");
  }

  private async simulateLatency() {
    if (this.slowResponse) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
    }
    if (this.forceFailure) {
      throw new Error("Deliberate simulation error occurred inside FakeSportsDataProvider.");
    }
    if (this.simRateLimit) {
      throw new Error("HTTP 429 Too Many Requests - Provider rate limit reached.");
    }
  }

  // --- VENUE PROVIDER ---
  public async fetchVenues(): Promise<any> {
    await this.simulateLatency();
    return [
      { id: "v-1", name: "Soccer City", city: "Johannesburg", cap: 94736, pitch: "grass" },
      { id: "v-2", name: "Green Point Arena", city: "Cape Town", cap: 55000, pitch: "hybrid" }
    ];
  }

  public normalizeVenues(raw: any): NormalizedVenue[] {
    return (raw as any[]).map(item => ({
      venueId: item.id,
      name: item.name,
      city: item.city,
      capacity: item.cap,
      surface: item.pitch
    }));
  }

  public validateVenues(normalized: NormalizedVenue[]): boolean {
    return normalized.every(v => v.venueId && v.name && v.capacity > 0);
  }

  public async cacheVenues(normalized: NormalizedVenue[]): Promise<void> {
    await providerCache.set(this.name, "venues", "all", normalized, { ttlSeconds: 300 });
  }

  // --- COMPETITION PROVIDER ---
  public async fetchCompetitions(): Promise<any> {
    await this.simulateLatency();
    return [
      { id: "comp-saf-psl", title: "South African PSL", region: "South Africa", format: "league", live: true },
      { id: "comp-caf-cl", title: "CAF Champions League", region: "Africa", format: "cup", live: true }
    ];
  }

  public normalizeCompetitions(raw: any): NormalizedCompetition[] {
    return (raw as any[]).map(item => ({
      competitionId: item.id,
      name: item.title,
      country: item.region,
      type: item.format,
      active: item.live
    }));
  }

  public validateCompetitions(normalized: NormalizedCompetition[]): boolean {
    return normalized.every(c => !!c.competitionId && !!c.name);
  }

  public async cacheCompetitions(normalized: NormalizedCompetition[]): Promise<void> {
    await providerCache.set(this.name, "competitions", "all", normalized, { ttlSeconds: 600 });
  }

  // --- TEAM PROVIDER ---
  public async fetchTeams(competitionId: string): Promise<any> {
    await this.simulateLatency();
    return [
      { id: "t-pirates", title: "Orlando Pirates", short: "Pirates", initial: "OP", location: "South Africa" },
      { id: "t-sundowns", title: "Mamelodi Sundowns", short: "Sundowns", initial: "MS", location: "South Africa" },
      { id: "t-chiefs", title: "Kaizer Chiefs", short: "Chiefs", initial: "KC", location: "South Africa" }
    ];
  }

  public normalizeTeams(raw: any): NormalizedTeam[] {
    return (raw as any[]).map(item => ({
      teamId: item.id,
      name: item.title,
      shortName: item.short,
      code: item.initial,
      country: item.location
    }));
  }

  public validateTeams(normalized: NormalizedTeam[]): boolean {
    return normalized.every(t => t.teamId && t.name && t.code);
  }

  public async cacheTeams(normalized: NormalizedTeam[]): Promise<void> {
    await providerCache.set(this.name, "teams", "list", normalized, { ttlSeconds: 300 });
  }

  // --- PLAYER PROVIDER ---
  public async fetchPlayers(teamId: string): Promise<any> {
    await this.simulateLatency();
    return [
      { id: "p-101", name: "Relebohile Mofokeng", age: 21, nation: "South Africa", pos: "A", out: false },
      { id: "p-102", name: "Ronwen Williams", age: 34, nation: "South Africa", pos: "G", out: false },
      { id: "p-103", name: "Themba Zwane", age: 36, nation: "South Africa", pos: "M", out: true, comment: "Hamstring strain" }
    ];
  }

  public normalizePlayers(raw: any): NormalizedPlayer[] {
    return (raw as any[]).map(item => ({
      playerId: item.id,
      name: item.name,
      firstName: item.name.split(" ")[0],
      lastName: item.name.split(" ")[1] || "",
      age: item.age,
      nationality: item.nation,
      position: item.pos,
      injured: item.out,
      injuryDetails: item.comment
    }));
  }

  public validatePlayers(normalized: NormalizedPlayer[]): boolean {
    return normalized.every(p => p.playerId && p.name && p.position);
  }

  public async cachePlayers(normalized: NormalizedPlayer[]): Promise<void> {
    await providerCache.set(this.name, "players", "list", normalized, { ttlSeconds: 120 });
  }

  // --- FIXTURE PROVIDER ---
  public async fetchFixtures(competitionId: string): Promise<any> {
    await this.simulateLatency();
    return [
      {
        id: "f-1",
        comp: "comp-saf-psl",
        season_yr: "2026",
        home: { id: "t-pirates", name: "Orlando Pirates", code: "OP" },
        away: { id: "t-chiefs", name: "Kaizer Chiefs", code: "KC" },
        date: "2026-07-02T15:00:00Z",
        status: "scheduled",
        home_g: 0,
        away_g: 0,
        pitch_id: "v-1",
        pitch_name: "Soccer City"
      }
    ];
  }

  public normalizeFixtures(raw: any): NormalizedFixture[] {
    return (raw as any[]).map(item => ({
      fixtureId: item.id,
      competition: { competitionId: item.comp, name: "South African PSL", country: "South Africa", type: "league", active: true },
      season: item.season_yr,
      homeTeam: { teamId: item.home.id, name: item.home.name, shortName: item.home.name, code: item.home.code, country: "South Africa" },
      awayTeam: { teamId: item.away.id, name: item.away.name, shortName: item.away.name, code: item.away.code, country: "South Africa" },
      kickoff: item.date,
      status: item.status,
      homeScore: item.home_g,
      awayScore: item.away_g,
      venue: { venueId: item.pitch_id, name: item.pitch_name, city: "Johannesburg", capacity: 94736, surface: "grass" }
    }));
  }

  public validateFixtures(normalized: NormalizedFixture[]): boolean {
    return normalized.every(f => f.fixtureId && f.homeTeam && f.awayTeam && f.kickoff);
  }

  public async cacheFixtures(normalized: NormalizedFixture[]): Promise<void> {
    await providerCache.set(this.name, "fixtures", "list", normalized, { ttlSeconds: 120 });
  }

  // --- ODDS PROVIDER ---
  public async fetchOdds(fixtureId: string): Promise<any> {
    await this.simulateLatency();
    return {
      fix_id: fixtureId,
      time: new Date().toISOString(),
      provider: this.name,
      book: [
        {
          market: "1X2",
          lines: [
            { outcome: "Home", val: 1.85, prob: 0.52 },
            { outcome: "Draw", val: 3.25, prob: 0.28 },
            { outcome: "Away", val: 4.10, prob: 0.20 }
          ]
        },
        {
          market: "BothTeamsToScore",
          lines: [
            { outcome: "Yes", val: 1.95, prob: 0.49 },
            { outcome: "No", val: 1.80, prob: 0.51 }
          ]
        }
      ]
    };
  }

  public normalizeOdds(raw: any): NormalizedOdds {
    return {
      oddsId: `odds-${raw.fix_id}`,
      fixtureId: raw.fix_id,
      providerName: raw.provider,
      timestamp: raw.time,
      markets: (raw.book as any[]).map(m => ({
        marketId: `m-${m.market}`,
        name: m.market as any,
        outcomes: (m.lines as any[]).map(l => ({
          name: l.outcome,
          odds: l.val,
          probability: l.prob
        }))
      }))
    };
  }

  public validateOdds(normalized: NormalizedOdds): boolean {
    return normalized.fixtureId && normalized.markets.length > 0;
  }

  public async cacheOdds(normalized: NormalizedOdds): Promise<void> {
    await providerCache.set(this.name, "odds", normalized.fixtureId, normalized, { ttlSeconds: 60 });
  }

  // --- STATISTICS PROVIDER ---
  public async fetchStatistics(fixtureId: string): Promise<any> {
    await this.simulateLatency();
    return {
      fix: fixtureId,
      poss_h: 58,
      poss_a: 42,
      s_on_h: 6,
      s_on_a: 3,
      s_off_h: 8,
      s_off_a: 5,
      f_h: 12,
      f_a: 14,
      c_h: 5,
      c_a: 2
    };
  }

  public normalizeStatistics(raw: any): NormalizedStatistics {
    return {
      fixtureId: raw.fix,
      possessionHome: raw.poss_h,
      possessionAway: raw.poss_a,
      shotsOnGoalHome: raw.s_on_h,
      shotsOnGoalAway: raw.s_on_a,
      shotsOffGoalHome: raw.s_off_h,
      shotsOffGoalAway: raw.s_off_a,
      foulsHome: raw.f_h,
      foulsAway: raw.f_a,
      cornersHome: raw.c_h,
      cornersAway: raw.c_a
    };
  }

  public validateStatistics(normalized: NormalizedStatistics): boolean {
    return !!normalized.fixtureId && normalized.possessionHome + normalized.possessionAway === 100;
  }

  public async cacheStatistics(normalized: NormalizedStatistics): Promise<void> {
    await providerCache.set(this.name, "statistics", normalized.fixtureId, normalized, { ttlSeconds: 120 });
  }

  // --- WEATHER PROVIDER ---
  public async fetchWeather(fixtureId: string): Promise<any> {
    await this.simulateLatency();
    return {
      fix: fixtureId,
      temp: 18.5,
      humid: 62,
      wind: 12.4,
      sky: "sunny"
    };
  }

  public normalizeWeather(raw: any): NormalizedWeather {
    return {
      fixtureId: raw.fix,
      temperatureCelcius: raw.temp,
      humidityPercent: raw.humid,
      windSpeedKph: raw.wind,
      condition: raw.sky as any
    };
  }

  public validateWeather(normalized: NormalizedWeather): boolean {
    return !!normalized.fixtureId && normalized.temperatureCelcius > -50 && normalized.temperatureCelcius < 60;
  }

  public async cacheWeather(normalized: NormalizedWeather): Promise<void> {
    await providerCache.set(this.name, "weather", normalized.fixtureId, normalized, { ttlSeconds: 1800 });
  }

  // --- RANKING PROVIDER ---
  public async fetchRankings(competitionId: string): Promise<any> {
    await this.simulateLatency();
    return [
      { t_id: "t-sundowns", r: 1, p: 68, pl: 30, w: 20, d: 8, l: 2, gf: 52, ga: 14 },
      { t_id: "t-pirates", r: 2, p: 56, pl: 30, w: 16, d: 8, l: 6, gf: 44, ga: 24 }
    ];
  }

  public normalizeRankings(raw: any): NormalizedRanking[] {
    return (raw as any[]).map(item => ({
      teamId: item.t_id,
      rank: item.r,
      points: item.p,
      played: item.pl,
      won: item.w,
      drawn: item.d,
      lost: item.l,
      goalsFor: item.gf,
      goalsAgainst: item.ga
    }));
  }

  public validateRankings(normalized: NormalizedRanking[]): boolean {
    return normalized.every(r => r.teamId && r.rank > 0);
  }

  public async cacheRankings(normalized: NormalizedRanking[]): Promise<void> {
    await providerCache.set(this.name, "rankings", "all", normalized, { ttlSeconds: 1800 });
  }

  // --- NEWS PROVIDER ---
  public async fetchNews(teamIds: string[]): Promise<any> {
    await this.simulateLatency();
    return [
      {
        id: "news-404",
        head: "Orlando Pirates Sign Rising Star Forward in Record Transfer",
        sum: "Soweto Giants bolster their attacking lines.",
        body: "Orlando Pirates have successfully completed the high-profile transfer of a rising star winger...",
        link: "https://soccer-update.internal/news/pirates-sign-star",
        date: new Date().toISOString(),
        teams: teamIds,
        sentiment: 0.85
      }
    ];
  }

  public normalizeNews(raw: any): NormalizedNews[] {
    return (raw as any[]).map(item => ({
      newsId: item.id,
      title: item.head,
      summary: item.sum,
      content: item.body,
      url: item.link,
      publishedAt: item.date,
      relatedTeamIds: item.teams,
      sentimentScore: item.sentiment
    }));
  }

  public validateNews(normalized: NormalizedNews[]): boolean {
    return normalized.every(n => n.newsId && n.title && n.publishedAt);
  }

  public async cacheNews(normalized: NormalizedNews[]): Promise<void> {
    await providerCache.set(this.name, "news", "list", normalized, { ttlSeconds: 120 });
  }
}

export const fakeSportsDataProvider = new FakeSportsDataProvider();
