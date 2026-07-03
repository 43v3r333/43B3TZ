import { AIMemoryRecord, AIMemoryType } from "./types";
import { embeddingService } from "./embedding";
import { createLogger } from "../core/logger";

const logger = createLogger("AIMemoryService");

export class MemoryService {
  private memories: AIMemoryRecord[] = [];

  constructor() {
    this.bootstrapMemories();
  }

  /**
   * Adds a memory record, automatically computing its semantic vector snapshot
   */
  public async addMemory(
    type: AIMemoryType,
    content: string,
    tags: string[] = [],
    metadata: Record<string, any> = {},
    ttlSeconds?: number
  ): Promise<AIMemoryRecord> {
    const now = new Date();
    let expiresAt: string | undefined;

    if (ttlSeconds) {
      expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
    }

    // Compute semantic embedding snapshot
    const vectorSnapshot = await embeddingService.embed(content);

    const record: AIMemoryRecord = {
      id: `mem_${type}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      tags,
      metadata,
      createdAt: now.toISOString(),
      expiresAt,
      vectorSnapshot,
    };

    this.memories.push(record);
    logger.info(`Stored semantic memory (${type}): ID ${record.id} with tag count ${tags.length}`);
    return record;
  }

  /**
   * Search and rank memories semantically using cosine similarity over embedding vectors
   */
  public async searchSemantically(
    query: string,
    type?: AIMemoryType,
    limit: number = 5
  ): Promise<{ memory: AIMemoryRecord; similarity: number }[]> {
    const activeRecords = this.getUnexpiredMemories().filter(
      m => !type || m.type === type
    );

    if (activeRecords.length === 0) return [];

    try {
      // Embed query
      const queryVec = await embeddingService.embed(query);

      // Score and rank
      const scored = activeRecords.map(m => {
        let similarity = 0;
        if (m.vectorSnapshot && queryVec) {
          similarity = embeddingService.calculateCosineSimilarity(m.vectorSnapshot, queryVec);
        }
        return { memory: m, similarity };
      });

      // Sort by similarity descending
      scored.sort((a, b) => b.similarity - a.similarity);

      logger.info(`Semantic memory search completed for query "${query}". Best match score: ${scored[0]?.similarity.toFixed(4) || 0}`);
      return scored.slice(0, limit);
    } catch (err) {
      logger.error("Semantic memory search failed, falling back to simple text match.", err);
      return this.searchTextFallback(query, type, limit);
    }
  }

  /**
   * Retrieve active (non-expired) memories
   */
  public getUnexpiredMemories(): AIMemoryRecord[] {
    const now = Date.now();
    return this.memories.filter(m => {
      if (!m.expiresAt) return true;
      return new Date(m.expiresAt).getTime() > now;
    });
  }

  /**
   * Expire or prune memories
   */
  public pruneExpiredMemories(): number {
    const initialCount = this.memories.length;
    const now = Date.now();
    this.memories = this.memories.filter(m => {
      if (!m.expiresAt) return true;
      return new Date(m.expiresAt).getTime() > now;
    });
    return initialCount - this.memories.length;
  }

  /**
   * Simple text search fallback if embeddings are unavailable
   */
  private searchTextFallback(
    query: string,
    type?: AIMemoryType,
    limit: number = 5
  ): { memory: AIMemoryRecord; similarity: number }[] {
    const active = this.getUnexpiredMemories().filter(m => !type || m.type === type);
    const lowercaseQuery = query.toLowerCase();

    const scored = active.map(m => {
      let score = 0;
      const contentLower = m.content.toLowerCase();
      if (contentLower.includes(lowercaseQuery)) {
        score = 0.8;
      } else {
        // Tag Jaccard similarity or tag search
        const matchedTags = m.tags.filter(t => lowercaseQuery.includes(t.toLowerCase())).length;
        score = matchedTags > 0 ? 0.4 : 0.0;
      }
      return { memory: m, similarity: score };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit);
  }

  private async bootstrapMemories(): Promise<void> {
    // Prediction Memory Example
    await this.addMemory(
      "prediction",
      "Chelsea vs Arsenal ended 2-1. Pre-match models predicted a 55% Chelsea win with a confidence composite score of 0.78. Platt scaling calibrated raw ELO difference diff 110 into high-probability Home outcome.",
      ["chelsea", "arsenal", "premier_league", "calibration"],
      { matchId: "fixture-101", season: "2025/2026", result: "2-1" }
    );

    // Research Memory Example
    await this.addMemory(
      "research",
      "Backtesting experiment exp_backtest_la_liga_2025 resulted in a 14.2% yield with maximum drawdown of 6.2% using fractional Kelly criterion optimization set to 0.25 scaling.",
      ["backtest", "la_liga", "kelly_criterion", "optimization"],
      { yield: 0.142, maxDrawdown: 0.062 }
    );

    // Model Memory Example
    await this.addMemory(
      "model",
      "Champion model match_outcome_lightgbm_v2.1 calibrated on Platt scaling has outperformed challenger model match_outcome_xgboost_v1.0 on calibration error and expected log loss across 120 shadow trials.",
      ["champion", "challenger", "shadow_testing", "lightgbm"],
      { championId: "match_outcome_lightgbm_v2.1", challengerId: "match_outcome_xgboost_v1.0" }
    );
  }
}

export const memoryService = new MemoryService();
