import { createLogger, Logger } from "./logger";

const logger = createLogger("RedisBroker");

type PubSubCallback = (message: any) => void;

interface RedisStreamEntry {
  id: string;
  fields: Record<string, any>;
  timestamp: number;
}

export class RedisBroker {
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map();
  private subscribers: Map<string, PubSubCallback[]> = new Map();
  private streams: Map<string, RedisStreamEntry[]> = new Map();

  constructor() {
    logger.info("Connecting to simulated Redis cluster (localhost:6379)...");
    
    // Periodically prune expired cache entries
    setInterval(() => this.pruneExpired(), 10000);
  }

  // Key-Value Cache Store
  public set(key: string, value: any, ttlSeconds?: number) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
    logger.debug(`REDIS: SET "${key}" successfully`, { ttlSeconds });
  }

  public get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      logger.debug(`REDIS: GET "${key}" detected expired key; pruned.`);
      return null;
    }

    return entry.value as T;
  }

  public del(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) logger.debug(`REDIS: DEL "${key}"`);
    return deleted;
  }

  // Pub/Sub Messaging Channel System
  public subscribe(channel: string, callback: PubSubCallback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }
    this.subscribers.get(channel)!.push(callback);
    logger.debug(`REDIS: SUBSCRIBED to channel "${channel}"`);
  }

  public unsubscribe(channel: string, callback: PubSubCallback) {
    const list = this.subscribers.get(channel);
    if (!list) return;
    const idx = list.indexOf(callback);
    if (idx !== -1) {
      list.splice(idx, 1);
      logger.debug(`REDIS: UNSUBSCRIBED from channel "${channel}"`);
    }
  }

  public publish(channel: string, message: any) {
    const list = this.subscribers.get(channel) || [];
    logger.info(`REDIS: PUBLISH to channel "${channel}" with ${list.length} active listener(s)`);
    
    list.forEach(cb => {
      try {
        cb(message);
      } catch (err: any) {
        logger.error(`REDIS: Error invoking subscriber callback on channel "${channel}"`, { error: err.message });
      }
    });
  }

  // Redis Streams Support (XADD, XREAD)
  public xadd(streamKey: string, fields: Record<string, any>): string {
    if (!this.streams.has(streamKey)) {
      this.streams.set(streamKey, []);
    }

    const stream = this.streams.get(streamKey)!;
    const timestamp = Date.now();
    const id = `${timestamp}-${stream.length}`;
    
    const entry: RedisStreamEntry = { id, fields, timestamp };
    stream.push(entry);
    
    logger.debug(`REDIS: XADD to stream "${streamKey}"`, { id, entry });
    this.publish(`__keyspace@0__:${streamKey}`, { event: "xadd", id });

    return id;
  }

  public xread(streamKey: string, lastId: string = "0-0"): RedisStreamEntry[] {
    const stream = this.streams.get(streamKey) || [];
    if (lastId === "0-0") return stream;

    const [lastTimeStr, lastIndexStr] = lastId.split("-");
    const lastTime = parseInt(lastTimeStr, 10);
    const lastIndex = parseInt(lastIndexStr, 10);

    return stream.filter(entry => {
      const [currTimeStr, currIndexStr] = entry.id.split("-");
      const currTime = parseInt(currTimeStr, 10);
      const currIndex = parseInt(currIndexStr, 10);

      return currTime > lastTime || (currTime === lastTime && currIndex > lastIndex);
    });
  }

  private pruneExpired() {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        logger.debug(`REDIS: Background sweep pruned expired key: "${key}"`);
      }
    });
  }

  public getStats() {
    return {
      cacheKeys: this.cache.size,
      subscribers: Array.from(this.subscribers.keys()).map(k => ({ channel: k, listeners: this.subscribers.get(k)!.length })),
      streams: Array.from(this.streams.keys()).map(k => ({ stream: k, size: this.streams.get(k)!.length }))
    };
  }
}

export const redis = new RedisBroker();
