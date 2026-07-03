import { AICacheRecord } from "./types";

export class ResponseCache {
  private cache: Map<string, AICacheRecord> = new Map();

  public get(key: string): any | null {
    const record = this.cache.get(key);
    if (!record) return null;

    // Check expiration
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return JSON.parse(record.value);
  }

  public set(key: string, value: any, ttlSeconds: number = 3600): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const record: AICacheRecord = {
      key,
      value: JSON.stringify(value),
      provider: value.provider || "google",
      model: value.model || "gemini-3.5-flash",
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.cache.set(key, record);
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache();
