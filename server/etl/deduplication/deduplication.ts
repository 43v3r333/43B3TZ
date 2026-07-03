import { EntityType, DeduplicationResult, CuratedEntity } from "../types";
import { etlStorage } from "../storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLDeduplicationEngine");

export class DeduplicationEngine {
  /**
   * Calculates Levenshtein edit distance between two strings
   */
  public static levenshtein(s1: string, s2: string): number {
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    return track[s2.length][s1.length];
  }

  /**
   * Calculates string similarity index from 0 to 1
   */
  public static calculateFuzzySimilarity(a: string, b: string): number {
    const cleanA = a.toLowerCase().trim();
    const cleanB = b.toLowerCase().trim();
    if (cleanA === cleanB) return 1.0;

    const maxLen = Math.max(cleanA.length, cleanB.length);
    if (maxLen === 0) return 1.0;

    const distance = DeduplicationEngine.levenshtein(cleanA, cleanB);
    return 1 - distance / maxLen;
  }

  /**
   * Scans existing curated storage to match incoming normalized payloads 
   * via natural keys, strict checksums, or fuzzy indicators.
   */
  public evaluate(entityType: EntityType, data: any): DeduplicationResult {
    let matchedId: string | null = null;
    let confidence = 0.0;
    let resolution: "ignore" | "update" | "merge" | "insert" = "insert";

    // Obtain primary unique identifier for natural key matching
    let naturalId = "";
    if (entityType === "fixture") naturalId = data.fixtureId;
    else if (entityType === "odds") naturalId = data.oddsId;
    else if (entityType === "statistics" || entityType === "weather") naturalId = data.fixtureId;
    else if (entityType === "player") naturalId = data.playerId;
    else if (entityType === "team") naturalId = data.teamId;
    else if (entityType === "ranking") naturalId = data.teamId;
    else if (entityType === "news") naturalId = data.newsId;
    else if (entityType === "competition") naturalId = data.competitionId;
    else if (entityType === "venue") naturalId = data.venueId;

    if (!naturalId) {
      return { isDuplicate: false, matchedId: null, confidence: 0, resolution: "insert" };
    }

    // 1. Check strict natural key match first
    const existing = etlStorage.getCuratedEntity(entityType, naturalId);
    if (existing) {
      // Natural key matched
      matchedId = naturalId;
      confidence = 1.0;
      
      // Check if data is completely identical to bypass storage writes
      const dataStringIncoming = JSON.stringify(data);
      const dataStringExisting = JSON.stringify(existing.data);
      if (dataStringIncoming === dataStringExisting) {
        resolution = "ignore"; // Strictly identical. Ignore duplicate payload.
      } else {
        resolution = "merge"; // Exists but has updates or additions. Merge records.
      }

      logger.debug(`Deduplication duplicate hit (Natural Key match)`, {
        entityType,
        naturalId,
        resolution
      });

      return {
        isDuplicate: true,
        matchedId,
        confidence,
        resolution
      };
    }

    // 2. Fuzzy Matching fallback for Teams / Players names
    if (entityType === "team") {
      const candidates = etlStorage.getCuratedEntities("team");
      for (const cand of candidates) {
        const sim = DeduplicationEngine.calculateFuzzySimilarity(data.name, cand.data.name);
        // If similarity > 85%, treat as potential duplicate match representing same entity
        if (sim >= 0.85) {
          logger.info(`Fuzzy matching deduplication triggered for team name`, {
            incomingName: data.name,
            matchedName: cand.data.name,
            similarity: sim.toFixed(2)
          });
          return {
            isDuplicate: true,
            matchedId: cand.curatedId,
            confidence: sim,
            resolution: "merge"
          };
        }
      }
    }

    if (entityType === "player") {
      const candidates = etlStorage.getCuratedEntities("player");
      for (const cand of candidates) {
        const sim = DeduplicationEngine.calculateFuzzySimilarity(data.name, cand.data.name);
        if (sim >= 0.90) { // Higher threshold for players to reduce surname overlaps
          logger.info(`Fuzzy matching deduplication triggered for player name`, {
            incomingName: data.name,
            matchedName: cand.data.name,
            similarity: sim.toFixed(2)
          });
          return {
            isDuplicate: true,
            matchedId: cand.curatedId,
            confidence: sim,
            resolution: "merge"
          };
        }
      }
    }

    return {
      isDuplicate: false,
      matchedId: null,
      confidence: 0,
      resolution: "insert"
    };
  }

  /**
   * Merges an incoming entity into an existing curated record.
   * Resolves conflicts by comparing field values, taking updates, 
   * tracking ingestion chain provenance, and incrementing version.
   */
  public merge(
    existing: CuratedEntity,
    incomingData: any,
    incomingQualityScore: number,
    providerName: string
  ): CuratedEntity {
    const updatedData = { ...existing.data };
    const conflicts: string[] = [];

    // Compare and merge keys dynamically
    Object.keys(incomingData).forEach(key => {
      const incomingVal = incomingData[key];
      const existingVal = existing.data[key];

      if (existingVal === undefined || existingVal === null || existingVal === "") {
        // Safe fill missing fields
        updatedData[key] = incomingVal;
      } else if (JSON.stringify(incomingVal) !== JSON.stringify(existingVal)) {
        // Conflict detected!
        conflicts.push(key);
        
        // Conflict Resolution Strategy: Take value from record with higher quality score!
        if (incomingQualityScore > existing.qualityScore) {
          updatedData[key] = incomingVal;
          logger.debug(`Conflict resolved in favor of incoming record due to higher quality score`, {
            key,
            incomingVal,
            existingVal,
            incomingQS: incomingQualityScore,
            existingQS: existing.qualityScore
          });
        }
      }
    });

    // Provenance Tracking: Add provider to ingestion chain list if not already present
    const updatedIngestionChain = [...existing.ingestionChain];
    if (!updatedIngestionChain.includes(providerName)) {
      updatedIngestionChain.push(providerName);
    }

    return {
      curatedId: existing.curatedId,
      entityType: existing.entityType,
      data: updatedData,
      enrichment: { ...existing.enrichment, lastIngested: new Date().toISOString() },
      qualityScore: Math.round((existing.qualityScore + incomingQualityScore) / 2), // Average out quality over contributing feeds
      version: existing.version + 1, // Safe increments
      updatedAt: new Date().toISOString(),
      ingestionChain: updatedIngestionChain
    };
  }
}

export const etlDeduplicationEngine = new DeduplicationEngine();
