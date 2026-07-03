import { FeatureValueSnapshot } from "./FeatureMetadata";

export class FeatureCache {
  private cache: Map<string, Map<string, FeatureValueSnapshot>> = new Map();

  /**
   * Generates a unique cache key based on match ID or custom identifiers.
   */
  public getCacheKey(matchId: string, version: string = "1.0"): string {
    return `${matchId}_v${version}`;
  }

  /**
   * Retrieves a cached feature value for a specific match.
   */
  public getFeature(matchId: string, featureId: string): FeatureValueSnapshot | null {
    const matchCache = this.cache.get(matchId);
    if (!matchCache) return null;
    return matchCache.get(featureId) || null;
  }

  /**
   * Stores a feature value snapshot in the cache.
   */
  public setFeature(matchId: string, featureId: string, snapshot: FeatureValueSnapshot): void {
    if (!this.cache.has(matchId)) {
      this.cache.set(matchId, new Map());
    }
    this.cache.get(matchId)!.set(featureId, snapshot);
  }

  /**
   * Evicts cache for a specific match or clears the entire cache.
   */
  public evict(matchId?: string): void {
    if (matchId) {
      this.cache.delete(matchId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Gets stats on the cache size and entries.
   */
  public getStats(): { totalMatches: number; totalFeatures: number } {
    let totalFeatures = 0;
    for (const matchCache of this.cache.values()) {
      totalFeatures += matchCache.size;
    }
    return {
      totalMatches: this.cache.size,
      totalFeatures,
    };
  }
}

export const featureCache = new FeatureCache();
