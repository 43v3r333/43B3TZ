import { FixtureProvider, OddsProvider, ProviderHealthStatus } from "../interfaces/provider";
import { NormalizedFixture, NormalizedOdds } from "../interfaces/dto";
import { createLogger } from "../../core/logger";

const logger = createLogger("MockProviders");

export class SportradarProvider implements FixtureProvider, OddsProvider {
  public name = "Sportradar";
  public version = "v4.0";
  public priority = 1; // High priority
  public capabilities = ["fixtures", "odds"];
  
  public async initialize(): Promise<void> {
    logger.info("Initializing Sportradar provider mock...");
  }

  public async authenticate(): Promise<boolean> {
    return true;
  }

  public async health(): Promise<ProviderHealthStatus> {
    return {
      available: true,
      latencyMs: 140,
      successRate: 0.99,
      failureRate: 0.01,
      rateLimitStatus: { limit: 120, remaining: 110, resetTime: new Date().toISOString() },
      authStatus: "authenticated",
      lastSuccessfulSync: new Date().toISOString(),
      cacheHitRatio: 0.85,
      dataFreshnessSeconds: 15
    };
  }

  public async shutdown(): Promise<void> {
    logger.info("Sportradar provider mock shutdown.");
  }

  // Fixture capabilities
  public async fetchFixtures(competitionId: string): Promise<any> {
    return [{ id: "sr-1", comp: competitionId, title: "Sportradar Match" }];
  }

  public normalizeFixtures(raw: any): NormalizedFixture[] {
    return [{
      fixtureId: raw[0].id,
      competition: { competitionId: raw[0].comp, name: "Sportradar Competition", country: "Global", type: "league", active: true },
      season: "2026",
      homeTeam: { teamId: "t-1", name: "Sportradar Home", shortName: "SR Home", code: "SRH", country: "Global" },
      awayTeam: { teamId: "t-2", name: "Sportradar Away", shortName: "SR Away", code: "SRA", country: "Global" },
      kickoff: new Date().toISOString(),
      status: "scheduled"
    }];
  }

  public validateFixtures(normalized: NormalizedFixture[]): boolean {
    return true;
  }

  public async cacheFixtures(normalized: NormalizedFixture[]): Promise<void> {
    logger.info("Sportradar cached fixtures.");
  }

  // Odds capabilities
  public async fetchOdds(fixtureId: string): Promise<any> {
    return { fix: fixtureId };
  }

  public normalizeOdds(raw: any): NormalizedOdds {
    return {
      oddsId: `sr-odds-${raw.fix}`,
      fixtureId: raw.fix,
      providerName: this.name,
      timestamp: new Date().toISOString(),
      markets: []
    };
  }

  public validateOdds(normalized: NormalizedOdds): boolean {
    return true;
  }

  public async cacheOdds(normalized: NormalizedOdds): Promise<void> {
    logger.info("Sportradar cached odds.");
  }
}

export class ApiFootballProvider implements FixtureProvider, OddsProvider {
  public name = "API-Football";
  public version = "v3.1";
  public priority = 2; // Medium priority
  public capabilities = ["fixtures", "odds"];

  // Simulate periodic failures for failover testing
  public forceFail = false;

  public async initialize(): Promise<void> {
    logger.info("Initializing API-Football provider mock...");
  }

  public async authenticate(): Promise<boolean> {
    return true;
  }

  public async health(): Promise<ProviderHealthStatus> {
    return {
      available: !this.forceFail,
      latencyMs: 250,
      successRate: this.forceFail ? 0.4 : 0.96,
      failureRate: this.forceFail ? 0.6 : 0.04,
      rateLimitStatus: { limit: 300, remaining: 280, resetTime: new Date().toISOString() },
      authStatus: "authenticated",
      lastSuccessfulSync: new Date().toISOString(),
      cacheHitRatio: 0.78,
      dataFreshnessSeconds: 45
    };
  }

  public async shutdown(): Promise<void> {
    logger.info("API-Football provider mock shutdown.");
  }

  public async fetchFixtures(competitionId: string): Promise<any> {
    if (this.forceFail) {
      throw new Error("API-Football is experiencing severe outages (Simulated Failover Test).");
    }
    return [{ id: "apif-1", comp: competitionId }];
  }

  public normalizeFixtures(raw: any): NormalizedFixture[] {
    return [{
      fixtureId: raw[0].id,
      competition: { competitionId: raw[0].comp, name: "API-Football League", country: "Europe", type: "league", active: true },
      season: "2026",
      homeTeam: { teamId: "t-3", name: "APIF Home", shortName: "APIF Home", code: "AFH", country: "Europe" },
      awayTeam: { teamId: "t-4", name: "APIF Away", shortName: "APIF Away", code: "AFA", country: "Europe" },
      kickoff: new Date().toISOString(),
      status: "scheduled"
    }];
  }

  public validateFixtures(normalized: NormalizedFixture[]): boolean {
    return true;
  }

  public async cacheFixtures(normalized: NormalizedFixture[]): Promise<void> {
    logger.info("API-Football cached fixtures.");
  }

  public async fetchOdds(fixtureId: string): Promise<any> {
    if (this.forceFail) {
      throw new Error("API-Football is experiencing severe outages (Simulated Failover Test).");
    }
    return { fix: fixtureId };
  }

  public normalizeOdds(raw: any): NormalizedOdds {
    return {
      oddsId: `apif-odds-${raw.fix}`,
      fixtureId: raw.fix,
      providerName: this.name,
      timestamp: new Date().toISOString(),
      markets: []
    };
  }

  public validateOdds(normalized: NormalizedOdds): boolean {
    return true;
  }

  public async cacheOdds(normalized: NormalizedOdds): Promise<void> {
    logger.info("API-Football cached odds.");
  }
}
