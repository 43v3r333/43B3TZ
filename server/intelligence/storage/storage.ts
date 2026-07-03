import { 
  TeamIntelligence, 
  PlayerIntelligence, 
  EloRating, 
  ExpectedGoalsMetrics, 
  FormMetrics, 
  FatigueMetrics, 
  WeatherNormalized, 
  RefereeMetrics, 
  MarketIntelligenceMetrics, 
  IntelligenceQualityMetrics, 
  HistoricalSnapshot 
} from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("IntelligenceStorage");

export class IntelligenceStorage {
  private teams: Map<string, TeamIntelligence> = new Map();
  private players: Map<string, PlayerIntelligence> = new Map();
  private eloRatings: Map<string, EloRating> = new Map();
  private xgMetrics: Map<string, ExpectedGoalsMetrics> = new Map();
  private formMetrics: Map<string, FormMetrics> = new Map();
  private fatigueMetrics: Map<string, FatigueMetrics> = new Map();
  private weatherMetrics: Map<string, WeatherNormalized> = new Map();
  private refereeMetrics: Map<string, RefereeMetrics> = new Map();
  private marketMetrics: Map<string, MarketIntelligenceMetrics> = new Map();
  private qualityMetrics: Map<string, IntelligenceQualityMetrics> = new Map();

  // Snaps
  private snapshots: HistoricalSnapshot[] = [];

  public clearAll() {
    this.teams.clear();
    this.players.clear();
    this.eloRatings.clear();
    this.xgMetrics.clear();
    this.formMetrics.clear();
    this.fatigueMetrics.clear();
    this.weatherMetrics.clear();
    this.refereeMetrics.clear();
    this.marketMetrics.clear();
    this.qualityMetrics.clear();
    this.snapshots = [];
    logger.info("Sports Intelligence Storage truncated successfully.");
  }

  // TEAM STORAGE
  public getTeam(teamId: string): TeamIntelligence | undefined {
    return this.teams.get(teamId);
  }
  public setTeam(teamId: string, team: TeamIntelligence) {
    this.teams.set(teamId, team);
    this.saveSnapshot(teamId, "team", team);
  }
  public getAllTeams(): TeamIntelligence[] {
    return Array.from(this.teams.values());
  }

  // PLAYER STORAGE
  public getPlayer(playerId: string): PlayerIntelligence | undefined {
    return this.players.get(playerId);
  }
  public setPlayer(playerId: string, player: PlayerIntelligence) {
    this.players.set(playerId, player);
    this.saveSnapshot(playerId, "player", player);
  }
  public getAllPlayers(): PlayerIntelligence[] {
    return Array.from(this.players.values());
  }

  // ELO STORAGE
  public getElo(teamId: string): EloRating | undefined {
    return this.eloRatings.get(teamId);
  }
  public setElo(teamId: string, elo: EloRating) {
    this.eloRatings.set(teamId, elo);
    this.saveSnapshot(teamId, "elo", elo);
  }
  public getAllElos(): EloRating[] {
    return Array.from(this.eloRatings.values());
  }

  // xG STORAGE
  public getXg(fixtureId: string): ExpectedGoalsMetrics | undefined {
    return this.xgMetrics.get(fixtureId);
  }
  public setXg(fixtureId: string, xg: ExpectedGoalsMetrics) {
    this.xgMetrics.set(fixtureId, xg);
    this.saveSnapshot(fixtureId, "xg", xg);
  }
  public getAllXg(): ExpectedGoalsMetrics[] {
    return Array.from(this.xgMetrics.values());
  }

  // FORM STORAGE
  public getForm(teamId: string): FormMetrics | undefined {
    return this.formMetrics.get(teamId);
  }
  public setForm(teamId: string, form: FormMetrics) {
    this.formMetrics.set(teamId, form);
    this.saveSnapshot(teamId, "form", form);
  }
  public getAllForms(): FormMetrics[] {
    return Array.from(this.formMetrics.values());
  }

  // FATIGUE STORAGE
  public getFatigue(entityId: string): FatigueMetrics | undefined {
    return this.fatigueMetrics.get(entityId);
  }
  public setFatigue(entityId: string, fatigue: FatigueMetrics) {
    this.fatigueMetrics.set(entityId, fatigue);
    this.saveSnapshot(entityId, "fatigue", fatigue);
  }
  public getAllFatigues(): FatigueMetrics[] {
    return Array.from(this.fatigueMetrics.values());
  }

  // WEATHER STORAGE
  public getWeather(fixtureId: string): WeatherNormalized | undefined {
    return this.weatherMetrics.get(fixtureId);
  }
  public setWeather(fixtureId: string, weather: WeatherNormalized) {
    this.weatherMetrics.set(fixtureId, weather);
    this.saveSnapshot(fixtureId, "weather", weather);
  }
  public getAllWeather(): WeatherNormalized[] {
    return Array.from(this.weatherMetrics.values());
  }

  // REFEREE STORAGE
  public getReferee(refereeId: string): RefereeMetrics | undefined {
    return this.refereeMetrics.get(refereeId);
  }
  public setReferee(refereeId: string, referee: RefereeMetrics) {
    this.refereeMetrics.set(refereeId, referee);
    this.saveSnapshot(refereeId, "referee", referee);
  }
  public getAllReferees(): RefereeMetrics[] {
    return Array.from(this.refereeMetrics.values());
  }

  // MARKET STORAGE
  public getMarket(fixtureId: string): MarketIntelligenceMetrics | undefined {
    return this.marketMetrics.get(fixtureId);
  }
  public setMarket(fixtureId: string, market: MarketIntelligenceMetrics) {
    this.marketMetrics.set(fixtureId, market);
    this.saveSnapshot(fixtureId, "market", market);
  }
  public getAllMarkets(): MarketIntelligenceMetrics[] {
    return Array.from(this.marketMetrics.values());
  }

  // QUALITY STORAGE
  public getQuality(entityId: string): IntelligenceQualityMetrics | undefined {
    return this.qualityMetrics.get(entityId);
  }
  public setQuality(entityId: string, quality: IntelligenceQualityMetrics) {
    this.qualityMetrics.set(entityId, quality);
    this.saveSnapshot(entityId, "quality", quality);
  }
  public getAllQualities(): IntelligenceQualityMetrics[] {
    return Array.from(this.qualityMetrics.values());
  }

  // SNAPSHOT ENGINE (POINT-IN-TIME PERSISTENCE)
  private saveSnapshot(entityId: string, entityType: HistoricalSnapshot["entityType"], data: any) {
    const previousSnaps = this.snapshots.filter(s => s.entityId === entityId && s.entityType === entityType);
    const nextVersion = previousSnaps.length + 1;
    const snapshotId = `${entityType}-snap-${entityId}-${nextVersion}-${Date.now()}`;

    const snapshot: HistoricalSnapshot = {
      snapshotId,
      entityId,
      entityType,
      timestamp: new Date().toISOString(),
      version: nextVersion,
      data: JSON.parse(JSON.stringify(data)) // deep copy
    };

    this.snapshots.push(snapshot);
    logger.debug(`Saved PIT Snapshot [${entityType}] for ID: ${entityId} (v${nextVersion})`);
  }

  /**
   * Performs point-in-time recovery querying.
   * Finds the latest snapshot of an entity at or before the given timestamp.
   */
  public getSnapshotAtTime(entityId: string, entityType: HistoricalSnapshot["entityType"], atOrBefore: string): HistoricalSnapshot | undefined {
    const targetMs = new Date(atOrBefore).getTime();
    const sortedSnaps = this.snapshots
      .filter(s => s.entityId === entityId && s.entityType === entityType)
      .sort((a, b) => b.version - a.version); // newest first

    return sortedSnaps.find(s => new Date(s.timestamp).getTime() <= targetMs);
  }

  public getSnapshotsHistory(entityId: string, entityType: HistoricalSnapshot["entityType"]): HistoricalSnapshot[] {
    return this.snapshots
      .filter(s => s.entityId === entityId && s.entityType === entityType)
      .sort((a, b) => a.version - b.version);
  }

  public getStats() {
    return {
      teams: this.teams.size,
      players: this.players.size,
      eloRatings: this.eloRatings.size,
      xgMetrics: this.xgMetrics.size,
      formMetrics: this.formMetrics.size,
      fatigueMetrics: this.fatigueMetrics.size,
      weatherMetrics: this.weatherMetrics.size,
      refereeMetrics: this.refereeMetrics.size,
      marketMetrics: this.marketMetrics.size,
      qualityMetrics: this.qualityMetrics.size,
      totalSnapshots: this.snapshots.length
    };
  }
}

export const intelligenceStorage = new IntelligenceStorage();
