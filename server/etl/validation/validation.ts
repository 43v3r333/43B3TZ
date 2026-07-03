import { EntityType, ValidationResult } from "../types";
import { etlStorage } from "../storage/storage"; // We will create this storage layer next
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLValidationEngine");

export class ValidationEngine {
  /**
   * Checks if a raw payload checksum is already logged in persistent raw storage
   */
  public detectDuplicate(checksum: string): boolean {
    const rawLogs = etlStorage.getRawRecords();
    return rawLogs.some(rec => rec.checksum === checksum);
  }

  /**
   * Performs schema structure, required fields, type, range, and enum validations on normalized records.
   */
  public validateSchema(entityType: EntityType, data: any): ValidationResult {
    const errors: string[] = [];

    if (!data) {
      return { passed: false, errors: ["Data payload is null or undefined"] };
    }

    // Standard structural schema validations
    switch (entityType) {
      case "fixture": {
        const required = ["fixtureId", "competition", "season", "homeTeam", "awayTeam", "kickoff", "status"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing or empty.`);
        });

        if (data.status) {
          const validStatuses = ["scheduled", "in_play", "finished", "postponed", "cancelled"];
          if (!validStatuses.includes(data.status)) {
            errors.push(`Invalid fixture status: '${data.status}'. Expected: ${validStatuses.join(", ")}`);
          }
        }

        if (data.homeScore !== undefined && (typeof data.homeScore !== "number" || isNaN(data.homeScore))) {
          errors.push("Fixture homeScore must be a valid number.");
        }
        if (data.awayScore !== undefined && (typeof data.awayScore !== "number" || isNaN(data.awayScore))) {
          errors.push("Fixture awayScore must be a valid number.");
        }
        break;
      }

      case "odds": {
        const required = ["oddsId", "fixtureId", "providerName", "timestamp", "markets"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing or empty.`);
        });

        if (Array.isArray(data.markets)) {
          data.markets.forEach((m: any, mIdx: number) => {
            if (!m.marketId || !m.name) {
              errors.push(`Market at index ${mIdx} is missing 'marketId' or 'name'.`);
            }
            if (!Array.isArray(m.outcomes) || m.outcomes.length === 0) {
              errors.push(`Market '${m.name}' must have at least one outcome.`);
            } else {
              m.outcomes.forEach((o: any, oIdx: number) => {
                if (!o.name || typeof o.odds !== "number") {
                  errors.push(`Outcome at index ${oIdx} of market '${m.name}' is invalid.`);
                }
              });
            }
          });
        } else {
          errors.push("Odds markets must be an array.");
        }
        break;
      }

      case "statistics": {
        const required = ["fixtureId", "possessionHome", "possessionAway"];
        required.forEach(field => {
          if (data[field] === undefined) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      case "player": {
        const required = ["playerId", "name", "position", "age"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing.`);
        });
        if (data.position) {
          const validPos = ["G", "D", "M", "A"];
          if (!validPos.includes(data.position)) {
            errors.push(`Invalid position: '${data.position}'. Allowed: G, D, M, A`);
          }
        }
        break;
      }

      case "team": {
        const required = ["teamId", "name", "code", "country"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      case "weather": {
        const required = ["fixtureId", "temperatureCelcius", "humidityPercent", "windSpeedKph", "condition"];
        required.forEach(field => {
          if (data[field] === undefined) errors.push(`Required field '${field}' is missing.`);
        });
        if (data.condition) {
          const conditions = ["sunny", "cloudy", "rainy", "windy", "snowy", "unknown"];
          if (!conditions.includes(data.condition)) {
            errors.push(`Invalid condition: '${data.condition}'.`);
          }
        }
        break;
      }

      case "ranking": {
        const required = ["teamId", "rank", "points", "played"];
        required.forEach(field => {
          if (data[field] === undefined) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      case "news": {
        const required = ["newsId", "title", "publishedAt"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      case "competition": {
        const required = ["competitionId", "name", "country", "type"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      case "venue": {
        const required = ["venueId", "name", "city", "capacity", "surface"];
        required.forEach(field => {
          if (!data[field]) errors.push(`Required field '${field}' is missing.`);
        });
        break;
      }

      default:
        errors.push(`Unknown entity type: ${entityType}`);
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }

  /**
   * Applies granular relational, logic, range, and mathematical business rule validation.
   */
  public validateBusinessRules(entityType: EntityType, data: any): ValidationResult {
    const errors: string[] = [];

    switch (entityType) {
      case "fixture": {
        // Range validation
        if (data.homeScore !== undefined && data.homeScore < 0) {
          errors.push(`Business violation: Home score cannot be negative (${data.homeScore}).`);
        }
        if (data.awayScore !== undefined && data.awayScore < 0) {
          errors.push(`Business violation: Away score cannot be negative (${data.awayScore}).`);
        }

        // Kickoff date validity
        const kickoffTime = new Date(data.kickoff).getTime();
        if (isNaN(kickoffTime)) {
          errors.push(`Business violation: Kickoff date '${data.kickoff}' is an invalid format.`);
        }
        break;
      }

      case "odds": {
        // Pricing constraint
        if (Array.isArray(data.markets)) {
          data.markets.forEach((m: any) => {
            m.outcomes.forEach((o: any) => {
              if (o.odds <= 1.0) {
                errors.push(`Business violation: Odds line must be strictly greater than 1.0 (found ${o.odds} on outcome '${o.name}').`);
              }
              if (o.probability !== undefined && (o.probability < 0 || o.probability > 1.0)) {
                errors.push(`Business violation: Probability of outcome '${o.name}' must be in range [0, 1].`);
              }
            });
          });
        }
        break;
      }

      case "statistics": {
        // Mathematical consistency constraint
        const hPoss = data.possessionHome || 0;
        const aPoss = data.possessionAway || 0;
        if (hPoss + aPoss !== 100) {
          errors.push(`Business violation: Home & Away possession must equal exactly 100% (found ${hPoss}% + ${aPoss}% = ${hPoss + aPoss}%).`);
        }

        // Logical ranges
        ["shotsOnGoalHome", "shotsOnGoalAway", "shotsOffGoalHome", "shotsOffGoalAway", "foulsHome", "foulsAway", "cornersHome", "cornersAway"].forEach(f => {
          if (data[f] !== undefined && data[f] < 0) {
            errors.push(`Business violation: Metric '${f}' cannot be negative.`);
          }
        });
        break;
      }

      case "weather": {
        // Reasonable range values
        if (data.temperatureCelcius !== undefined && (data.temperatureCelcius < -50 || data.temperatureCelcius > 60)) {
          errors.push(`Business violation: Weather temperature is outside human-logical boundaries [ -50, 60 ] °C.`);
        }
        if (data.humidityPercent !== undefined && (data.humidityPercent < 0 || data.humidityPercent > 100)) {
          errors.push(`Business violation: Humidity must fall inside [0, 100] percentage bounds.`);
        }
        if (data.windSpeedKph !== undefined && data.windSpeedKph < 0) {
          errors.push("Business violation: Wind speed cannot be negative.");
        }
        break;
      }

      case "ranking": {
        // League standings mathematical constraints
        const played = data.played || 0;
        const w = data.won || 0;
        const d = data.drawn || 0;
        const l = data.lost || 0;
        if (w + d + l !== played) {
          errors.push(`Business violation: Played matches (${played}) must equal Won(${w}) + Drawn(${d}) + Lost(${l}).`);
        }
        if (data.rank <= 0) {
          errors.push("Business violation: Standing rank must be positive.");
        }
        break;
      }

      case "player": {
        if (data.age <= 0 || data.age > 100) {
          errors.push("Business violation: Player age must be a logical value in range [1, 100].");
        }
        break;
      }

      case "venue": {
        if (data.capacity < 0) {
          errors.push("Business violation: Venue capacity cannot be negative.");
        }
        break;
      }

      default:
        // No extra business constraints needed
        break;
    }

    // Referential Validation: check references to existing fixtures if applicable
    const referentialEntities = ["odds", "statistics", "weather"];
    if (referentialEntities.includes(entityType) && data.fixtureId) {
      const parentFixture = etlStorage.getCuratedEntity("fixture", data.fixtureId);
      if (!parentFixture) {
        logger.warn(`Referential Check Warn: Entity refers to fixtureId '${data.fixtureId}', which is not currently present in curated storage.`);
        // Note: For full real integrations we might fail referential checks,
        // but to ensure flexibility for asynchronous ingestion streams we can record it as an audit note or keep it lenient.
        // We will add it as an error to satisfy strict "Referential validation" requirements.
        errors.push(`Referential violation: Target fixtureId '${data.fixtureId}' does not exist in curated storage.`);
      }
    }

    return {
      passed: errors.length === 0,
      errors
    };
  }
}

export const etlValidationEngine = new ValidationEngine();
