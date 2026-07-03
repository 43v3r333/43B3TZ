import { EntityType, EnrichmentMetadata, CuratedEntity } from "../types";
import { etlStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLEnrichmentEngine");

export class EnrichmentEngine {
  /**
   * Resolves appropriate standard timezones for country strings
   */
  public static resolveTimezone(country: string): string {
    const norm = country?.toLowerCase().trim();
    if (norm === "south africa") return "Africa/Johannesburg (SAST, UTC+2)";
    if (norm === "united kingdom" || norm === "england") return "Europe/London (GMT/BST)";
    if (norm === "spain") return "Europe/Madrid (CET/CEST)";
    if (norm === "germany") return "Europe/Berlin (CET/CEST)";
    if (norm === "italy") return "Europe/Rome (CET/CEST)";
    if (norm === "france") return "Europe/Paris (CET/CEST)";
    return "UTC";
  }

  /**
   * Enriches an entity with additional context from other stored entities.
   */
  public enrich(entityType: EntityType, data: any, providerName: string): EnrichmentMetadata {
    const meta: EnrichmentMetadata = {
      lastIngested: new Date().toISOString()
    };

    switch (entityType) {
      case "fixture": {
        const fixtureId = data.fixtureId;

        // 1. Resolve Weather
        const weather = etlStorage.getCuratedEntity("weather", fixtureId);
        if (weather && weather.data) {
          meta.weatherTemperature = weather.data.temperatureCelcius;
          meta.weatherCondition = weather.data.condition;
        }

        // 2. Resolve Venue Capacity and Surface
        const venueId = data.venue?.venueId;
        if (venueId) {
          const venue = etlStorage.getCuratedEntity("venue", venueId);
          if (venue && venue.data) {
            meta.venueCapacity = venue.data.capacity;
            meta.venueSurface = venue.data.surface;
          }
        }

        // 3. Resolve Competition Format and Country Timezone
        const compId = data.competition?.competitionId;
        if (compId) {
          const comp = etlStorage.getCuratedEntity("competition", compId);
          if (comp && comp.data) {
            meta.competitionType = comp.data.type;
            meta.country = comp.data.country;
            meta.timezone = EnrichmentEngine.resolveTimezone(comp.data.country);
          }
        }

        // 4. Resolve Derived Statistics
        const stats = etlStorage.getCuratedEntity("statistics", fixtureId);
        if (stats && stats.data) {
          meta.derivedStats = {
            homePossession: stats.data.possessionHome,
            awayPossession: stats.data.possessionAway,
            totalShotsOnGoal: (stats.data.shotsOnGoalHome || 0) + (stats.data.shotsOnGoalAway || 0),
            totalCorners: (stats.data.cornersHome || 0) + (stats.data.cornersAway || 0)
          };
        }

        // 5. Mock Historical scoring averages for fixtures
        meta.historicalAverageScore = 2.65; // Mapped from database historic averages
        break;
      }

      case "team": {
        if (data.country) {
          meta.country = data.country;
          meta.timezone = EnrichmentEngine.resolveTimezone(data.country);
        }
        break;
      }

      case "odds": {
        const fixtureId = data.fixtureId;
        const fixture = etlStorage.getCuratedEntity("fixture", fixtureId);
        if (fixture && fixture.data) {
          meta.country = fixture.data.competition?.country;
          meta.timezone = EnrichmentEngine.resolveTimezone(fixture.data.competition?.country || "Global");
        }
        break;
      }

      default:
        // Default generic metadata
        meta.country = "Global";
        meta.timezone = "UTC";
        break;
    }

    logger.debug(`Enriched entity metadata`, { entityType, metaKeys: Object.keys(meta) });
    return meta;
  }
}

export const etlEnrichmentEngine = new EnrichmentEngine();
