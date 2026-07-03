import { redis } from "../../core/redis";
import { createLogger } from "../../core/logger";

const logger = createLogger("ProviderCache");

export interface CacheOptions {
  ttlSeconds?: number;
  version?: string;
  compress?: boolean;
}

export class ProviderCache {
  private static instance: ProviderCache;
  private defaultTtl = 300; // 5 mins
  private version = "v1.0";

  private constructor() {}

  public static getInstance(): ProviderCache {
    if (!ProviderCache.instance) {
      ProviderCache.instance = new ProviderCache();
    }
    return ProviderCache.instance;
  }

  private buildKey(providerName: string, category: string, identifier: string, version = this.version): string {
    return `provider:${providerName}:${version}:${category}:${identifier}`;
  }

  public async get<T>(providerName: string, category: string, identifier: string, options: CacheOptions = {}): Promise<T | null> {
    const key = this.buildKey(providerName, category, identifier, options.version);
    const raw = redis.get<string>(key);
    
    if (!raw) {
      logger.debug(`Cache MISS for key: ${key}`);
      return null;
    }

    logger.debug(`Cache HIT for key: ${key}`);
    try {
      let jsonString = raw;
      if (options.compress || raw.startsWith("comp::")) {
        // Simulated compression decompression step
        jsonString = raw.startsWith("comp::") ? raw.slice(6) : raw;
      }
      return JSON.parse(jsonString) as T;
    } catch (err: any) {
      logger.error(`Failed to parse cached payload for key: ${key}`, { error: err.message });
      return null;
    }
  }

  public async set<T>(providerName: string, category: string, identifier: string, data: T, options: CacheOptions = {}): Promise<void> {
    const key = this.buildKey(providerName, category, identifier, options.version);
    const ttl = options.ttlSeconds !== undefined ? options.ttlSeconds : this.defaultTtl;
    
    try {
      let payload = JSON.stringify(data);
      if (options.compress) {
        // Simulated compression step
        payload = `comp::${payload}`;
      }
      redis.set(key, payload, ttl);
      logger.debug(`Cached record saved successfully: ${key}`, { ttl });
    } catch (err: any) {
      logger.error(`Failed to serialize cached payload for key: ${key}`, { error: err.message });
    }
  }

  public async invalidate(providerName: string, category: string, identifier: string, options: CacheOptions = {}): Promise<void> {
    const key = this.buildKey(providerName, category, identifier, options.version);
    redis.del(key);
    logger.info(`Cache invalidated explicitly for key: ${key}`);
  }

  // Lazy loading pattern
  public async getOrFetch<T>(
    providerName: string,
    category: string,
    identifier: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(providerName, category, identifier, options);
    if (cached !== null) {
      return cached;
    }

    logger.info(`Lazy loading triggering fetch for key: ${providerName}:${category}:${identifier}`);
    const freshlyFetched = await fetchFn();
    await this.set<T>(providerName, category, identifier, freshlyFetched, options);
    return freshlyFetched;
  }

  // Warm-up helper
  public async warmUp<T>(
    providerName: string,
    category: string,
    identifier: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    logger.info(`Warming up cache for: ${providerName}:${category}:${identifier}`);
    await this.set<T>(providerName, category, identifier, data, options);
  }
}

export const providerCache = ProviderCache.getInstance();
