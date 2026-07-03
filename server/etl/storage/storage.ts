import fs from "fs";
import path from "path";
import { LandingRecord, EntityType, CuratedEntity } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLStorage");

interface StorageData {
  raw: Record<string, LandingRecord>;
  normalized: Record<string, {
    landingId: string;
    entityType: EntityType;
    data: any;
    timestamp: string;
  }>;
  curated: Record<string, Record<string, CuratedEntity>>;
}

const defaultStorage: StorageData = {
  raw: {},
  normalized: {},
  curated: {
    competition: {},
    league: {},
    season: {},
    venue: {},
    team: {},
    player: {},
    fixture: {},
    odds: {},
    statistics: {},
    weather: {},
    ranking: {},
    news: {}
  }
};

export class ETLStorage {
  private filePath: string;
  private memoryStore: StorageData;

  constructor() {
    this.filePath = path.resolve("./data/etl_storage.json");
    this.memoryStore = JSON.parse(JSON.stringify(defaultStorage));
    this.initialize();
  }

  private initialize() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.memoryStore = JSON.parse(raw);
        // Ensure all curate collections exist
        if (!this.memoryStore.curated) {
          this.memoryStore.curated = JSON.parse(JSON.stringify(defaultStorage.curated));
        }
        logger.info(`ETL Platform storage loaded successfully from ${this.filePath}`);
      } else {
        this.save();
        logger.info("ETL Platform storage file initialized with defaults");
      }
    } catch (err: any) {
      logger.error("Failed to initialize ETL Storage. Falling back to memory-only.", { error: err.message });
    }
  }

  private save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryStore, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err: any) {
      logger.error("Failed to persist ETL Storage write", { error: err.message });
    }
  }

  // --- RAW LAYER ---
  public saveRaw(record: LandingRecord) {
    this.memoryStore.raw[record.landingId] = record;
    this.save();
    logger.debug(`Saved RAW layer landing record`, { landingId: record.landingId });
  }

  public getRawRecords(): LandingRecord[] {
    return Object.values(this.memoryStore.raw);
  }

  public getRawRecord(landingId: string): LandingRecord | null {
    return this.memoryStore.raw[landingId] || null;
  }

  // --- NORMALIZED LAYER ---
  public saveNormalized(landingId: string, entityType: EntityType, data: any) {
    const key = `${landingId}-${entityType}`;
    this.memoryStore.normalized[key] = {
      landingId,
      entityType,
      data,
      timestamp: new Date().toISOString()
    };
    this.save();
    logger.debug(`Saved NORMALIZED layer landing record`, { key });
  }

  public getNormalizedRecords() {
    return Object.values(this.memoryStore.normalized);
  }

  public getNormalizedRecord(landingId: string, entityType: EntityType) {
    const key = `${landingId}-${entityType}`;
    return this.memoryStore.normalized[key] || null;
  }

  // --- CURATED LAYER ---
  public saveCurated(entityType: EntityType, curatedId: string, entity: CuratedEntity) {
    if (!this.memoryStore.curated[entityType]) {
      this.memoryStore.curated[entityType] = {};
    }
    this.memoryStore.curated[entityType][curatedId] = entity;
    this.save();
    logger.debug(`Saved CURATED layer entity`, { entityType, curatedId, version: entity.version });
  }

  public getCuratedEntities(entityType: EntityType): CuratedEntity[] {
    const dict = this.memoryStore.curated[entityType];
    return dict ? Object.values(dict) : [];
  }

  public getCuratedEntity(entityType: EntityType, curatedId: string): CuratedEntity | null {
    const dict = this.memoryStore.curated[entityType];
    return dict ? dict[curatedId] || null : null;
  }

  // --- REPLAY/UTILITY ENGINES ---
  public clearAll() {
    this.memoryStore = JSON.parse(JSON.stringify(defaultStorage));
    this.save();
    logger.info("ETL Storage completely cleared (truncated).");
  }

  public getStats() {
    const curatedCounts: Record<string, number> = {};
    Object.keys(this.memoryStore.curated).forEach(type => {
      curatedCounts[type] = Object.keys(this.memoryStore.curated[type] || {}).length;
    });

    return {
      rawRecords: Object.keys(this.memoryStore.raw).length,
      normalizedRecords: Object.keys(this.memoryStore.normalized).length,
      curatedRecords: curatedCounts
    };
  }
}

export const etlStorage = new ETLStorage();
