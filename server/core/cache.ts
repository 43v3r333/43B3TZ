import { createLogger } from "./logger";

const logger = createLogger("MemoryCache");

export interface CacheMetrics {
  hits: number;
  misses: number;
  writes: number;
  keys: number;
  hitRatio: number;
}

export class MemoryCache {
  private store: Map<string, { value: any; expiry: number }> = new Map();
  private metrics = {
    hits: 0,
    misses: 0,
    writes: 0
  };

  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (entry.expiry > 0 && Date.now() > entry.expiry) {
      this.store.delete(key);
      this.metrics.misses++;
      logger.debug(`Cache key expired: "${key}"`);
      return null;
    }

    this.metrics.hits++;
    return entry.value as T;
  }

  public set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.store.set(key, { value, expiry });
    this.metrics.writes++;
    logger.debug(`Cache key set: "${key}" (TTL: ${ttlSeconds}s)`);
  }

  public invalidate(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      logger.debug(`Cache key invalidated: "${key}"`);
    }
    return deleted;
  }

  public invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      logger.debug(`Invalidated ${count} keys matching pattern: "${pattern}"`);
    }
  }

  public clear(): void {
    this.store.clear();
    logger.info("Cache cleared");
  }

  public getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      writes: this.metrics.writes,
      keys: this.store.size,
      hitRatio: total > 0 ? this.metrics.hits / total : 0
    };
  }
}

// Sub-domain caches as requested
export const predictionCache = new MemoryCache();
export const oddsCache = new MemoryCache();
export const researchCache = new MemoryCache();
export const modelCache = new MemoryCache();
export const configurationCache = new MemoryCache();
