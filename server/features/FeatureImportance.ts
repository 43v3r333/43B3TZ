import { createLogger } from "../core/logger";

const logger = createLogger("FeatureImportance");

export class FeatureImportanceEngine {
  private importanceScores: Map<string, number> = new Map();

  constructor() {
    this.seedImportance();
  }

  /**
   * Retrieves the current feature importance score.
   */
  public getScore(featureId: string): number {
    return this.importanceScores.get(featureId) ?? 0.5;
  }

  /**
   * Updates feature importance dynamically (e.g. based on prediction errors).
   */
  public adjustScore(featureId: string, correlationCoefficient: number): void {
    const current = this.getScore(featureId);
    // Exponential smoothing with alpha = 0.1 to stabilize adjustments
    const updated = Math.min(1.0, Math.max(0.0, current * 0.9 + correlationCoefficient * 0.1));
    this.importanceScores.set(featureId, updated);
    logger.info(`Adjusted feature ${featureId} importance score to ${updated.toFixed(4)}.`);
  }

  /**
   * Retrieves all feature importance rankings in descending order.
   */
  public getRankings(): { featureId: string; score: number }[] {
    return Array.from(this.importanceScores.entries())
      .map(([featureId, score]) => ({ featureId, score }))
      .sort((a, b) => b.score - a.score);
  }

  private seedImportance(): void {
    this.importanceScores.set("feat_elo_rating_diff", 0.95);
    this.importanceScores.set("feat_expected_goals_diff", 0.91);
    this.importanceScores.set("feat_player_availability_ratio", 0.88);
    this.importanceScores.set("feat_sharp_money_pct", 0.86);
    this.importanceScores.set("feat_team_form", 0.85);
    this.importanceScores.set("feat_big_chances", 0.84);
    this.importanceScores.set("feat_momentum_factor", 0.83);
    this.importanceScores.set("feat_rolling_form", 0.82);
    this.importanceScores.set("feat_injury_severity", 0.82);
    this.importanceScores.set("feat_shot_quality", 0.81);
    this.importanceScores.set("feat_market_movement", 0.79);
    this.importanceScores.set("feat_player_fatigue", 0.77);
    this.importanceScores.set("feat_home_advantage_index", 0.76);
  }
}

export const featureImportanceEngine = new FeatureImportanceEngine();
