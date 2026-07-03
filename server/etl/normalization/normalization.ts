import { EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLNormalizationEngine");

export class NormalizationEngine {
  /**
   * Translates highly heterogeneous vendor-specific raw payloads into standardized canonical DTOs.
   * Maps alternative spelling fields, nested indices, and formats automatically.
   */
  public normalize(entityType: EntityType, rawPayload: any, providerName: string): any {
    if (!rawPayload) return null;

    logger.debug(`Normalizing raw payload from provider '${providerName}'`, { entityType });

    // Handle standard/already normalized payloads safely
    const isAlreadyNormalized = 
      rawPayload.fixtureId || 
      rawPayload.oddsId || 
      rawPayload.playerId || 
      rawPayload.teamId || 
      rawPayload.newsId || 
      rawPayload.competitionId || 
      rawPayload.venueId;

    if (isAlreadyNormalized) {
      return { ...rawPayload };
    }

    // Provider-specific mapping rules (e.g. Sportradar or API-Football formats)
    const providerLower = providerName.toLowerCase();

    // 1. FIXTURE MAPPER
    if (entityType === "fixture") {
      if (providerLower.includes("sportradar")) {
        // Mock Sportradar: { sr_fixture_id, sr_league_name, sr_home, sr_away, kickoff_timestamp, status_code, score_home, score_away }
        return {
          fixtureId: rawPayload.sr_fixture_id || `sr-fix-${Date.now()}`,
          competition: {
            competitionId: `comp-sr-${rawPayload.sr_league_name?.substring(0, 3).toLowerCase() || "gen"}`,
            name: rawPayload.sr_league_name || "Unknown League",
            country: rawPayload.sr_country || "Unknown Country",
            type: "league",
            active: true
          },
          season: rawPayload.sr_season || "2026",
          homeTeam: {
            teamId: `team-sr-${rawPayload.sr_home?.substring(0, 3).toLowerCase() || "hom"}`,
            name: rawPayload.sr_home || "Home Team",
            shortName: rawPayload.sr_home?.substring(0, 3).toUpperCase() || "HOM",
            code: rawPayload.sr_home?.substring(0, 3).toUpperCase() || "HOM",
            country: rawPayload.sr_country || "Unknown Country"
          },
          awayTeam: {
            teamId: `team-sr-${rawPayload.sr_away?.substring(0, 3).toLowerCase() || "awy"}`,
            name: rawPayload.sr_away || "Away Team",
            shortName: rawPayload.sr_away?.substring(0, 3).toUpperCase() || "AWY",
            code: rawPayload.sr_away?.substring(0, 3).toUpperCase() || "AWY",
            country: rawPayload.sr_country || "Unknown Country"
          },
          kickoff: rawPayload.kickoff_timestamp || new Date().toISOString(),
          status: this.mapStatus(rawPayload.status_code || "scheduled"),
          homeScore: rawPayload.score_home,
          awayScore: rawPayload.score_away
        };
      }

      if (providerLower.includes("api-football") || providerLower.includes("apifootball")) {
        // Mock API-Football nested format: { fixture: { id, date, status: { short } }, teams: { home: { name, id }, away: { name, id } }, goals: { home, away } }
        const f = rawPayload.fixture || {};
        const t = rawPayload.teams || {};
        const g = rawPayload.goals || {};
        const c = rawPayload.league || {};

        return {
          fixtureId: f.id ? `api-fix-${f.id}` : `api-fix-${Date.now()}`,
          competition: {
            competitionId: c.id ? `comp-api-${c.id}` : "comp-api-gen",
            name: c.name || "Unknown Competition",
            country: c.country || "Global",
            type: "league",
            active: true
          },
          season: c.season || "2026",
          homeTeam: {
            teamId: t.home?.id ? `team-api-${t.home.id}` : "team-api-home",
            name: t.home?.name || "Home Team",
            shortName: t.home?.name?.substring(0, 3).toUpperCase() || "HOM",
            code: t.home?.name?.substring(0, 3).toUpperCase() || "HOM",
            country: c.country || "Global"
          },
          awayTeam: {
            teamId: t.away?.id ? `team-api-${t.away.id}` : "team-api-away",
            name: t.away?.name || "Away Team",
            shortName: t.away?.name?.substring(0, 3).toUpperCase() || "AWY",
            code: t.away?.name?.substring(0, 3).toUpperCase() || "AWY",
            country: c.country || "Global"
          },
          kickoff: f.date || new Date().toISOString(),
          status: this.mapStatus(f.status?.short || "scheduled"),
          homeScore: g.home,
          awayScore: g.away
        };
      }
    }

    // 2. ODDS MAPPER
    if (entityType === "odds") {
      if (providerLower.includes("sportradar")) {
        // { sr_fixture_id, match_odds: { home, draw, away }, source_name }
        return {
          oddsId: `odds-sr-${rawPayload.sr_fixture_id}-${Date.now()}`,
          fixtureId: rawPayload.sr_fixture_id || "fixture-unknown",
          providerName: providerName,
          timestamp: new Date().toISOString(),
          markets: [
            {
              marketId: `mkt-1x2-${rawPayload.sr_fixture_id}`,
              name: "1X2",
              outcomes: [
                { name: "home", odds: rawPayload.match_odds?.home || 1.80 },
                { name: "draw", odds: rawPayload.match_odds?.draw || 3.40 },
                { name: "away", odds: rawPayload.match_odds?.away || 4.20 }
              ]
            }
          ]
        };
      }
    }

    // 3. WEATHER MAPPER
    if (entityType === "weather") {
      // Maps weather raw data from sports payloads
      return {
        fixtureId: rawPayload.fixtureId || rawPayload.match_id || "fixture-unknown",
        temperatureCelcius: rawPayload.temp_c !== undefined ? rawPayload.temp_c : (rawPayload.temperature || 18),
        humidityPercent: rawPayload.humidity !== undefined ? rawPayload.humidity : (rawPayload.humidity_pct || 60),
        windSpeedKph: rawPayload.wind_kph !== undefined ? rawPayload.wind_kph : (rawPayload.wind_speed || 12),
        condition: (rawPayload.cond || rawPayload.weather_condition || "sunny").toLowerCase()
      };
    }

    // Dynamic Generic Normalizer - fallback to standard keys or identity mapping
    const fallbackObj: any = { ...rawPayload };
    
    // Auto map id aliases to standardized formats
    if (rawPayload.id && !rawPayload[`${entityType}Id`]) {
      fallbackObj[`${entityType}Id`] = rawPayload.id;
    }
    
    return fallbackObj;
  }

  private mapStatus(status: string): string {
    const s = status.toLowerCase();
    if (s.includes("sched") || s === "ns" || s === "scheduled") return "scheduled";
    if (s.includes("play") || s === "live" || s === "1h" || s === "2h" || s === "in_play") return "in_play";
    if (s.includes("fin") || s === "ft" || s === "finished") return "finished";
    if (s.includes("post") || s === "postponed") return "postponed";
    if (s.includes("canc") || s === "cancelled") return "cancelled";
    return "scheduled";
  }
}

export const etlNormalizationEngine = new NormalizationEngine();
