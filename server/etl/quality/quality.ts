import { EntityType, QualityResult } from "../types";
import { providerRegistry } from "../../providers/registry/registry";
import { etlStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLQualityEngine");

export class QualityEngine {
  /**
   * Evaluates and scores an incoming record according to dimensions:
   * Completeness, Consistency, Freshness, Accuracy, Provider Confidence, Duplicate Prob, Normalization Quality
   */
  public calculateQualityScore(
    entityType: EntityType,
    data: any,
    providerName: string
  ): QualityResult {
    // 1. Completeness: Measure non-empty keys
    const completeness = this.evaluateCompleteness(entityType, data);

    // 2. Consistency: Logical/mathematical consistency
    const consistency = this.evaluateConsistency(entityType, data);

    // 3. Freshness: Chronological age check
    const freshness = this.evaluateFreshness(entityType, data);

    // 4. Accuracy: Based on error count / business rules
    const accuracy = this.evaluateAccuracy(entityType, data);

    // 5. Provider Confidence: Priority-mapped confidence
    const providerConfidence = this.evaluateProviderConfidence(providerName);

    // 6. Duplicate Probability
    const duplicateProbability = this.evaluateDuplicateProbability(entityType, data);

    // 7. Normalization Quality
    const normalizationQuality = 100; // Mapped cleanly via providers in the ecosystem

    // Calculate aggregated overall score using safe weighted averages
    // High duplicate probability decreases the quality score
    const weightedSum = 
      (completeness * 0.20) + 
      (consistency * 0.20) + 
      (freshness * 0.15) + 
      (accuracy * 0.20) + 
      (providerConfidence * 0.15) + 
      (normalizationQuality * 0.10);

    const scoreModifier = Math.max(0, 100 - duplicateProbability);
    const finalScore = Math.round((weightedSum * 0.8) + (scoreModifier * 0.2));

    logger.debug(`Calculated quality metrics for entity`, {
      entityType,
      providerName,
      finalScore,
      completeness,
      consistency,
      freshness,
      accuracy
    });

    return {
      score: Math.min(100, Math.max(0, finalScore)),
      completeness,
      consistency,
      freshness,
      accuracy,
      providerConfidence,
      duplicateProbability,
      normalizationQuality
    };
  }

  private evaluateCompleteness(entityType: EntityType, data: any): number {
    if (!data) return 0;

    let filledKeys = 0;
    let totalKeys = 1;

    switch (entityType) {
      case "fixture":
        totalKeys = 9;
        const fKeys = ["fixtureId", "competition", "season", "homeTeam", "awayTeam", "kickoff", "status", "homeScore", "awayScore"];
        fKeys.forEach(k => { if (data[k] !== undefined && data[k] !== null) filledKeys++; });
        break;
      case "odds":
        totalKeys = 5;
        const oKeys = ["oddsId", "fixtureId", "providerName", "timestamp", "markets"];
        oKeys.forEach(k => { if (data[k] !== undefined && data[k] !== null) filledKeys++; });
        break;
      case "statistics":
        totalKeys = 10;
        const sKeys = ["fixtureId", "possessionHome", "possessionAway", "shotsOnGoalHome", "shotsOnGoalAway", "shotsOffGoalHome", "shotsOffGoalAway", "foulsHome", "foulsAway", "cornersHome"];
        sKeys.forEach(k => { if (data[k] !== undefined && data[k] !== null) filledKeys++; });
        break;
      case "weather":
        totalKeys = 5;
        const wKeys = ["fixtureId", "temperatureCelcius", "humidityPercent", "windSpeedKph", "condition"];
        wKeys.forEach(k => { if (data[k] !== undefined && data[k] !== null) filledKeys++; });
        break;
      default:
        // Generic fall-through key counting
        const keys = Object.keys(data);
        totalKeys = Math.max(1, keys.length);
        keys.forEach(k => { if (data[k] !== undefined && data[k] !== null && data[k] !== "") filledKeys++; });
        break;
    }

    return Math.round((filledKeys / totalKeys) * 100);
  }

  private evaluateConsistency(entityType: EntityType, data: any): number {
    if (!data) return 0;

    switch (entityType) {
      case "statistics":
        const sum = (data.possessionHome || 0) + (data.possessionAway || 0);
        return sum === 100 ? 100 : 20;

      case "ranking":
        const played = data.played || 0;
        const matches = (data.won || 0) + (data.drawn || 0) + (data.lost || 0);
        return played === matches ? 100 : 30;

      case "fixture":
        // Kickoff should be a valid parsable timestamp
        const time = new Date(data.kickoff).getTime();
        return isNaN(time) ? 0 : 100;

      default:
        return 100;
    }
  }

  private evaluateFreshness(entityType: EntityType, data: any): number {
    let timestamp = Date.now();

    if (data && data.timestamp) {
      timestamp = new Date(data.timestamp).getTime();
    } else if (data && data.publishedAt) {
      timestamp = new Date(data.publishedAt).getTime();
    } else if (data && data.kickoff) {
      timestamp = new Date(data.kickoff).getTime();
    } else {
      return 90; // Default freshness if no date is attached
    }

    if (isNaN(timestamp)) return 50;

    const ageMinutes = Math.max(0, (Date.now() - timestamp) / 60000);
    if (ageMinutes <= 2) return 100;
    if (ageMinutes <= 15) return 90;
    if (ageMinutes <= 60) return 80;
    if (ageMinutes <= 1440) return 60; // Up to 1 day old

    return 20; // Stale data
  }

  private evaluateAccuracy(entityType: EntityType, data: any): number {
    if (!data) return 0;
    
    // Check for logical inconsistencies that degrade accuracy
    let violations = 0;

    if (entityType === "odds") {
      if (Array.isArray(data.markets)) {
        data.markets.forEach((m: any) => {
          m.outcomes.forEach((o: any) => {
            if (o.odds <= 1.0) violations++;
          });
        });
      }
    }

    if (entityType === "fixture") {
      if (data.homeScore < 0 || data.awayScore < 0) violations++;
    }

    return Math.max(10, 100 - (violations * 25));
  }

  private evaluateProviderConfidence(providerName: string): number {
    try {
      const provider = providerRegistry.getProvider(providerName);
      if (!provider) return 70; // Middling default for untracked sources

      const priority = provider.priority || 3;
      if (priority === 1) return 98; // Sportradar premium
      if (priority === 2) return 88; // API-Football
      return 78; // General simulated fake drivers
    } catch {
      return 70;
    }
  }

  private evaluateDuplicateProbability(entityType: EntityType, data: any): number {
    if (!data) return 0;

    // Fast check matching curated natural keys
    let entityId = "";
    if (entityType === "fixture") entityId = data.fixtureId;
    if (entityType === "odds") entityId = data.oddsId;
    if (entityType === "statistics" || entityType === "weather") entityId = data.fixtureId;
    if (entityType === "player") entityId = data.playerId;
    if (entityType === "team") entityId = data.teamId;
    if (entityType === "ranking") entityId = data.teamId;
    if (entityType === "news") entityId = data.newsId;

    if (!entityId) return 0;

    const existing = etlStorage.getCuratedEntity(entityType, entityId);
    if (existing) {
      // Natural key exists, meaning there's a highly likely conflict/duplicate update
      return 100;
    }

    return 0;
  }
}

export const etlQualityEngine = new QualityEngine();
