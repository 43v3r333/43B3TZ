import { FeatureDefinition, FeatureValue, FeatureDataType } from "../types";
import { intelligenceStorage } from "../../intelligence/storage/storage";
import { createLogger } from "../../core/logger";

const logger = createLogger("FeatureStore");

export class FeatureStore {
  private registry: Map<string, FeatureDefinition> = new Map();
  // Store offline feature history: FeatureId -> EntityId -> Array of historical values
  private offlineStore: Map<string, Map<string, FeatureValue[]>> = new Map();
  // Fast online key-value cache: FeatureId -> EntityId -> latest value
  private onlineCache: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.registerDefaultFeatures();
  }

  public clearAll() {
    this.offlineStore.clear();
    this.onlineCache.clear();
    logger.info("Feature Store caches and history truncated successfully.");
  }

  private registerDefaultFeatures() {
    const defaultFeatures: FeatureDefinition[] = [
      {
        featureId: "feat_elo_rating",
        name: "Elo Rating",
        description: "The core team strength indicator derived from historical performance.",
        dataType: "numerical",
        owner: "sports-intel-team",
        version: 1,
        category: "Team Performance",
        expression: "intelligenceStorage.getElo(teamId).rating",
        documentation: "Scaled rating indicating performance level. Mean of 1500.",
        lineage: ["Curated Fixtures", "Elo Rating Engine"],
        freshness: new Date().toISOString(),
        validationRules: { min: 800, max: 2500, allowNull: false },
        qualityScore: 98
      },
      {
        featureId: "feat_form_momentum",
        name: "Weighted Form Momentum",
        description: "Rolling form factor over the last 5 fixtures, weighted chronologically.",
        dataType: "numerical",
        owner: "analytics-team",
        version: 1,
        category: "Team Form",
        expression: "intelligenceStorage.getForm(teamId).momentum",
        documentation: "Value ranges from 0 (all losses) to 100 (all wins).",
        lineage: ["Curated Fixtures", "Form Engine"],
        freshness: new Date().toISOString(),
        validationRules: { min: 0, max: 100, allowNull: false },
        qualityScore: 95
      },
      {
        featureId: "feat_xg_differential",
        name: "Rolling xG Differential",
        description: "Average expected goals scored minus expected goals conceded.",
        dataType: "numerical",
        owner: "data-science-team",
        version: 1,
        category: "Expected Goals",
        expression: "intelligenceStorage.getXg(fixtureId)",
        documentation: "Measures quality of chances created versus conceded.",
        lineage: ["Curated Statistics", "xG Engine"],
        freshness: new Date().toISOString(),
        validationRules: { min: -10, max: 10, allowNull: false },
        qualityScore: 92
      },
      {
        featureId: "feat_player_fatigue",
        name: "Average Player Fatigue Index",
        description: "Aggregated squad fatigue metrics modeling match congestion & travel.",
        dataType: "numerical",
        owner: "sports-medicine",
        version: 1,
        category: "Squad Fitness",
        expression: "intelligenceStorage.getFatigue(playerId).recoveryScore",
        documentation: "Score out of 100 representing squad readiness.",
        lineage: ["Curated Squad List", "Fatigue Engine"],
        freshness: new Date().toISOString(),
        validationRules: { min: 0, max: 100, allowNull: false },
        qualityScore: 90
      },
      {
        featureId: "feat_clv_movement",
        name: "Closing Line Value Movement",
        description: "Movement trend comparing opening market prices to closing bookmaker lines.",
        dataType: "numerical",
        owner: "market-analysts",
        version: 1,
        category: "Market Signals",
        expression: "intelligenceStorage.getMarket(fixtureId).closingLineValue",
        documentation: "Identifies whether odds moved down (positive value) or up.",
        lineage: ["Curated Odds Feed", "Market Intelligence Engine"],
        freshness: new Date().toISOString(),
        validationRules: { min: -1.0, max: 1.0, allowNull: true },
        qualityScore: 94
      }
    ];

    for (const feat of defaultFeatures) {
      this.registry.set(feat.featureId, feat);
    }
    logger.info(`Initialized Feature Registry with ${this.registry.size} core features.`);
  }

  // REGISTRY MANAGEMENT
  public registerFeature(definition: FeatureDefinition) {
    if (this.registry.has(definition.featureId)) {
      throw new Error(`Feature with ID ${definition.featureId} already registered.`);
    }
    this.registry.set(definition.featureId, definition);
    logger.info(`Successfully registered new feature: ${definition.name} (${definition.featureId})`);
  }

  public getFeatureDefinition(featureId: string): FeatureDefinition | undefined {
    return this.registry.get(featureId);
  }

  public getAllFeatureDefinitions(): FeatureDefinition[] {
    return Array.from(this.registry.values());
  }

  // FEATURE STORAGE: WRITE (INGESTION)
  public ingestFeatureValue(entityId: string, featureId: string, value: any, timestamp: string) {
    const definition = this.registry.get(featureId);
    if (!definition) {
      throw new Error(`Cannot ingest feature: ${featureId} is not a registered feature ID.`);
    }

    // Validate feature value
    this.validateFeatureValue(definition, value);

    // 1. Update online cache
    if (!this.onlineCache.has(featureId)) {
      this.onlineCache.set(featureId, new Map());
    }
    this.onlineCache.get(featureId)!.set(entityId, value);

    // 2. Append to offline temporal store
    if (!this.offlineStore.has(featureId)) {
      this.offlineStore.set(featureId, new Map());
    }
    const entityMap = this.offlineStore.get(featureId)!;
    if (!entityMap.has(entityId)) {
      entityMap.set(entityId, []);
    }

    const valueRecord: FeatureValue = { entityId, featureId, timestamp, value };
    entityMap.get(entityId)!.push(valueRecord);

    // Keep entries chronologically sorted
    entityMap.get(entityId)!.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Update freshness
    definition.freshness = timestamp;
  }

  // TEMPORAL POINT-IN-TIME (PIT) QUERY
  // Retrieves the exact value of a feature for an entity as it stood at a specific historical point in time.
  // This is CRITICAL for leak-free ML dataset building.
  public getFeatureValueAtTime(entityId: string, featureId: string, timestamp: string): any {
    const definition = this.registry.get(featureId);
    if (!definition) {
      throw new Error(`Feature ${featureId} is not registered.`);
    }

    const entityMap = this.offlineStore.get(featureId);
    if (!entityMap) return this.getDefaultValue(definition);

    const history = entityMap.get(entityId);
    if (!history || history.length === 0) return this.getDefaultValue(definition);

    const queryTime = new Date(timestamp).getTime();

    // Binary search or linear scan for the latest record <= queryTime
    let resolvedValue: any = null;
    for (let i = history.length - 1; i >= 0; i--) {
      const recordTime = new Date(history[i].timestamp).getTime();
      if (recordTime <= queryTime) {
        resolvedValue = history[i].value;
        break;
      }
    }

    if (resolvedValue === null) {
      return this.getDefaultValue(definition);
    }

    return resolvedValue;
  }

  // ONLINE LOW-LATENCY CACHE QUERY
  public getFeatureValueOnline(entityId: string, featureId: string): any {
    const definition = this.registry.get(featureId);
    if (!definition) throw new Error(`Feature ${featureId} is not registered.`);

    const cacheMap = this.onlineCache.get(featureId);
    if (!cacheMap || !cacheMap.has(entityId)) {
      return this.getDefaultValue(definition);
    }
    return cacheMap.get(entityId);
  }

  private getDefaultValue(definition: FeatureDefinition): any {
    if (definition.validationRules.allowNull) return null;
    if (definition.dataType === "numerical") return 0.0;
    if (definition.dataType === "boolean") return false;
    return "";
  }

  private validateFeatureValue(definition: FeatureDefinition, value: any) {
    if (value === null || value === undefined) {
      if (!definition.validationRules.allowNull) {
        throw new Error(`Validation Error: Feature ${definition.featureId} does not allow null/undefined values.`);
      }
      return;
    }

    if (definition.dataType === "numerical") {
      if (typeof value !== "number" || isNaN(value)) {
        throw new Error(`Validation Error: Feature ${definition.featureId} expects a number, got ${typeof value}.`);
      }
      const { min, max } = definition.validationRules;
      if (min !== undefined && value < min) {
        throw new Error(`Validation Error: Feature ${definition.featureId} value ${value} is below minimum allowed ${min}.`);
      }
      if (max !== undefined && value > max) {
        throw new Error(`Validation Error: Feature ${definition.featureId} value ${value} exceeds maximum allowed ${max}.`);
      }
    } else if (definition.dataType === "boolean") {
      if (typeof value !== "boolean") {
        throw new Error(`Validation Error: Feature ${definition.featureId} expects a boolean, got ${typeof value}.`);
      }
    } else if (definition.dataType === "categorical") {
      if (typeof value !== "string") {
        throw new Error(`Validation Error: Feature ${definition.featureId} expects a string, got ${typeof value}.`);
      }
      const allowed = definition.validationRules.allowedCategories;
      if (allowed && !allowed.includes(value)) {
        throw new Error(`Validation Error: Feature ${definition.featureId} category '${value}' is not within permitted subset [${allowed.join(", ")}].`);
      }
    }
  }

  // Populate feature store from raw intelligence records
  public populateFromIntelligence() {
    logger.info("Synchronizing Feature Store offline/online ledgers with Sports Intelligence Platform records...");

    const allElos = intelligenceStorage.getAllElos();
    for (const elo of allElos) {
      const snapHistory = intelligenceStorage.getSnapshotsHistory(elo.teamId, "elo");
      for (const snap of snapHistory) {
        this.ingestFeatureValue(elo.teamId, "feat_elo_rating", snap.data.rating, snap.timestamp);
      }
    }

    const allForms = intelligenceStorage.getAllForms();
    for (const form of allForms) {
      const snapHistory = intelligenceStorage.getSnapshotsHistory(form.entityId, "form");
      for (const snap of snapHistory) {
        this.ingestFeatureValue(form.entityId, "feat_form_momentum", snap.data.momentum, snap.timestamp);
      }
    }

    const allFatigues = intelligenceStorage.getAllFatigues();
    for (const fat of allFatigues) {
      const snapHistory = intelligenceStorage.getSnapshotsHistory(fat.entityId, "fatigue");
      for (const snap of snapHistory) {
        this.ingestFeatureValue(fat.entityId, "feat_player_fatigue", snap.data.recoveryScore, snap.timestamp);
      }
    }

    const allMarkets = intelligenceStorage.getAllMarkets();
    for (const m of allMarkets) {
      const snapHistory = intelligenceStorage.getSnapshotsHistory(m.fixtureId, "market");
      for (const snap of snapHistory) {
        this.ingestFeatureValue(m.fixtureId, "feat_clv_movement", snap.data.closingLineValue, snap.timestamp);
      }
    }

    const allXgs = intelligenceStorage.getAllXg();
    for (const xg of allXgs) {
      const snapHistory = intelligenceStorage.getSnapshotsHistory(xg.fixtureId, "xg");
      for (const snap of snapHistory) {
        // xG differential = xGHome - xGAway
        const diff = snap.data.xGHome - snap.data.xGAway;
        this.ingestFeatureValue(xg.fixtureId, "feat_xg_differential", diff, snap.timestamp);
      }
    }

    logger.info("Feature Store synchronization sweep completed successfully.");
  }
}

export const featureStore = new FeatureStore();
