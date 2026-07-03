import { predictionModelRegistry } from "../registry/modelRegistry";
import { ModelMetadata, PredictionMarketType, ModelDeploymentRole } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ModelOrchestrator");

export interface OrchestratedSelection {
  champion: ModelMetadata;
  fallback: ModelMetadata | null;
  experimental: ModelMetadata | null;
  shadow: ModelMetadata | null;
  canary: ModelMetadata | null;
  allSelected: ModelMetadata[];
  reason: string;
}

export class ModelOrchestrator {
  /**
   * Orchestrates the active model selection for a given prediction request context.
   */
  public static selectModels(
    marketType: PredictionMarketType,
    context: { leagueId?: string; competitionId?: string; dataQualityScore?: number } = {}
  ): OrchestratedSelection {
    const models = predictionModelRegistry.getModelsByMarket(marketType);
    
    if (models.length === 0) {
      throw new Error(`No models registered for market ${marketType}.`);
    }

    let champion = models.find(m => m.role === "champion" && m.isActive);
    let fallback = models.find(m => m.role === "fallback" && m.isActive) || null;
    let experimental = models.find(m => m.role === "experimental" && m.isActive) || null;
    let shadow = models.find(m => m.role === "shadow" && m.isActive) || null;
    let canary = models.find(m => m.role === "canary" && m.isActive) || null;

    let reason = "Standard champion model selected.";

    // Guard 1: Verify Champion existence & health
    if (!champion || champion.healthStatus === "unhealthy") {
      if (fallback && fallback.healthStatus === "healthy") {
        champion = fallback;
        reason = "Primary Champion model is unhealthy or unregistered; automatically routed to healthy Fallback model.";
        logger.warn(`Routed to fallback model for ${marketType} because champion is degraded/missing.`);
      } else {
        // Fallback to any healthy model of this market, otherwise the degraded champion
        const alternate = models.find(m => m.healthStatus === "healthy");
        if (alternate) {
          champion = alternate;
          reason = "Champion unhealthy and fallback missing; routed to healthy alternate model.";
        } else if (champion) {
          reason = "Champion model is unhealthy, but no healthy alternative or fallback exists. Using unhealthy champion as emergency measure.";
        } else {
          // Absolute fallback: use the first model found
          champion = models[0];
          reason = "No champion or alternative model available; fell back to raw registration baseline.";
        }
      }
    }

    // Guard 2: League or Competition Specific Rules
    // Let's pretend some models perform better or worse depending on specific high-scoring leagues (e.g. Bundesliga vs Serie A)
    if (context.leagueId) {
      // If data quality is low, fallback to simpler models (e.g. logistic regression) to avoid high-dimensional noise
      const dataQuality = context.dataQualityScore ?? 100;
      if (dataQuality < 50 && fallback && champion.family !== "logistic_regression") {
        champion = fallback;
        reason = `Data quality score is critical (${dataQuality}); fell back to simpler Logistic Regression model to prevent model overfitting.`;
      }
    }

    const allSelected: ModelMetadata[] = [champion];
    if (fallback && fallback.modelId !== champion.modelId) allSelected.push(fallback);
    if (experimental) allSelected.push(experimental);
    if (shadow) allSelected.push(shadow);
    if (canary) allSelected.push(canary);

    return {
      champion,
      fallback,
      experimental,
      shadow,
      canary,
      allSelected,
      reason
    };
  }
}
