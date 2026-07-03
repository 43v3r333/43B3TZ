import { createLogger } from "../core/logger";

const logger = createLogger("FeatureVersion");

export interface VersionHistoryRecord {
  featureId: string;
  version: string;
  releasedAt: Date;
  description: string;
}

export class FeatureVersionTracker {
  private history: Map<string, VersionHistoryRecord[]> = new Map();

  constructor() {
    this.seedHistory();
  }

  /**
   * Registers a version record for a feature.
   */
  public logVersion(featureId: string, version: string, description: string): void {
    if (!this.history.has(featureId)) {
      this.history.set(featureId, []);
    }
    this.history.get(featureId)!.push({
      featureId,
      version,
      releasedAt: new Date(),
      description,
    });
    logger.info(`Logged version v${version} for feature ${featureId}.`);
  }

  /**
   * Retrieves full version history for a feature.
   */
  public getHistory(featureId: string): VersionHistoryRecord[] {
    return this.history.get(featureId) || [];
  }

  /**
   * Seeds historical version logs.
   */
  private seedHistory(): void {
    this.logVersion("feat_elo_rating_diff", "1.0.0", "Baseline ELO rating difference calculations.");
    this.logVersion("feat_elo_rating_diff", "2.0.0", "Introduced league-strength adjustments on base Elo coefficients.");
    this.logVersion("feat_team_form", "1.0.0", "Simple 5-game rolling results factor.");
    this.logVersion("feat_team_form", "1.1.0", "Added weighted attenuation for home vs away outcomes in form logs.");
  }
}

export const featureVersionTracker = new FeatureVersionTracker();
