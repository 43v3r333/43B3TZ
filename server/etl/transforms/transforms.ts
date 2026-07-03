import { EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLTransformationEngine");

export class TransformationEngine {
  /**
   * Orchestrates specific transformation pipelines based on entity type.
   */
  public transform(entityType: EntityType, normalizedData: any): any {
    logger.debug(`Running transformation pipeline for entity`, { entityType });

    if (!normalizedData) return null;

    switch (entityType) {
      case "fixture":
        return this.transformFixture(normalizedData);
      case "odds":
        return this.transformOdds(normalizedData);
      case "player":
        return this.transformPlayer(normalizedData);
      case "team":
        return this.transformTeam(normalizedData);
      case "venue":
        return this.transformVenue(normalizedData);
      case "statistics":
        return this.transformStatistics(normalizedData);
      default:
        // Generic fallback transforms - capitalize strings, trim whitespace
        return this.genericTransform(normalizedData);
    }
  }

  private transformFixture(data: any): any {
    const transformed = { ...data };

    // Standardize kickoff date to absolute UTC ISO
    if (data.kickoff) {
      transformed.kickoff = new Date(data.kickoff).toISOString();
    }

    // Capitalize team and competition names
    if (transformed.homeTeam) {
      transformed.homeTeam.name = this.capitalizeString(transformed.homeTeam.name);
    }
    if (transformed.awayTeam) {
      transformed.awayTeam.name = this.capitalizeString(transformed.awayTeam.name);
    }
    if (transformed.competition) {
      transformed.competition.name = this.capitalizeString(transformed.competition.name);
    }

    // Ensure score defaults are properly structured integers or undefined
    if (transformed.homeScore !== undefined && transformed.homeScore !== null) {
      transformed.homeScore = Math.floor(transformed.homeScore);
    }
    if (transformed.awayScore !== undefined && transformed.awayScore !== null) {
      transformed.awayScore = Math.floor(transformed.awayScore);
    }

    return transformed;
  }

  private transformOdds(data: any): any {
    const transformed = { ...data };

    if (Array.isArray(transformed.markets)) {
      transformed.markets = transformed.markets.map((m: any) => {
        const outMarket = { ...m };

        // 1. Calculate outcome probabilities and sum overrounds
        let marginSum = 0;
        if (Array.isArray(outMarket.outcomes)) {
          outMarket.outcomes = outMarket.outcomes.map((o: any) => {
            const outOdds = { ...o };
            if (outOdds.odds > 0) {
              const probability = 1 / outOdds.odds;
              outOdds.probability = parseFloat(probability.toFixed(4));
              marginSum += probability;
            }
            // Standardize outcome names (e.g. "home" -> "Home", "draw" -> "Draw")
            outOdds.name = this.capitalizeString(outOdds.name);
            return outOdds;
          });
        }

        // Add overround margin as a metadata attribute on transformed market
        outMarket.overround = parseFloat((marginSum - 1.0).toFixed(4));
        return outMarket;
      });
    }

    return transformed;
  }

  private transformPlayer(data: any): any {
    const transformed = { ...data };
    transformed.name = this.capitalizeString(data.name);
    transformed.firstName = this.capitalizeString(data.firstName || "");
    transformed.lastName = this.capitalizeString(data.lastName || "");
    transformed.nationality = this.capitalizeString(data.nationality || "Unknown");
    transformed.position = (data.position || "M").toUpperCase();
    return transformed;
  }

  private transformTeam(data: any): any {
    const transformed = { ...data };
    transformed.name = this.capitalizeString(data.name);
    transformed.shortName = (data.shortName || data.name.substring(0, 3)).toUpperCase();
    transformed.code = (data.code || data.name.substring(0, 3)).toUpperCase();
    transformed.country = this.capitalizeString(data.country || "Global");
    return transformed;
  }

  private transformVenue(data: any): any {
    const transformed = { ...data };
    transformed.name = this.capitalizeString(data.name);
    transformed.city = this.capitalizeString(data.city);
    transformed.surface = (data.surface || "grass").toLowerCase();
    transformed.capacity = data.capacity ? Math.floor(data.capacity) : 0;
    return transformed;
  }

  private transformStatistics(data: any): any {
    const transformed = { ...data };
    
    // Derived metric calculations
    const shotsHome = (data.shotsOnGoalHome || 0) + (data.shotsOffGoalHome || 0);
    const shotsAway = (data.shotsOnGoalAway || 0) + (data.shotsOffGoalAway || 0);

    transformed.derived = {
      shotsTotalHome: shotsHome,
      shotsTotalAway: shotsAway,
      accuracyRatioHome: shotsHome > 0 ? parseFloat(((data.shotsOnGoalHome || 0) / shotsHome).toFixed(2)) : 0.0,
      accuracyRatioAway: shotsAway > 0 ? parseFloat(((data.shotsOnGoalAway || 0) / shotsAway).toFixed(2)) : 0.0,
      foulIntensityHome: data.foulsHome !== undefined ? Math.round(data.foulsHome) : 0,
      foulIntensityAway: data.foulsAway !== undefined ? Math.round(data.foulsAway) : 0
    };

    return transformed;
  }

  private genericTransform(data: any): any {
    const transformed = { ...data };
    Object.keys(transformed).forEach(key => {
      if (typeof transformed[key] === "string") {
        transformed[key] = transformed[key].trim();
      }
    });
    return transformed;
  }

  private capitalizeString(val: string): string {
    if (!val) return "";
    return val
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
}

export const etlTransformationEngine = new TransformationEngine();
