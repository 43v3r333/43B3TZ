import { predictionModelRegistry } from "../registry/modelRegistry";
import { promptRegistry } from "../../ai/registry";
import { createLogger } from "../../core/logger";

const logger = createLogger("ResearchLab");

export interface ResearchExperiment {
  experimentId: string;
  name: string;
  dataset: string;
  features: string[];
  modelId: string;
  promptId: string;
  provider: string;
  metrics: {
    accuracy: number;
    logLoss: number;
    brierScore: number;
    expectedCalibrationError: number;
    roi: number;
  };
  durationMs: number;
  costUsd: number;
  resultSummary: string;
  winnerDeclared: boolean;
  isRolledBack: boolean;
  createdAt: string;
}

export class ResearchLab {
  private experiments: Map<string, ResearchExperiment> = new Map();

  constructor() {
    this.bootstrapExperiments();
  }

  public registerExperiment(exp: ResearchExperiment): void {
    this.experiments.set(exp.experimentId, exp);
    logger.info(`Research Lab logged new experiment: "${exp.name}" | ID: ${exp.experimentId}`);
  }

  public getExperiment(id: string): ResearchExperiment | undefined {
    return this.experiments.get(id);
  }

  public getAllExperiments(): ResearchExperiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Promotes the experiment's model to a specific active deployment role (e.g., champion).
   */
  public promoteModel(experimentId: string, targetRole: "champion" | "fallback"): void {
    const exp = this.experiments.get(experimentId);
    if (!exp) {
      throw new Error(`ResearchLab Error: Experiment ${experimentId} not found.`);
    }

    // Set model in the registry to the target role
    predictionModelRegistry.updateModelRole(exp.modelId, targetRole as any);
    exp.winnerDeclared = true;
    logger.info(`Successfully promoted model ${exp.modelId} to active ${targetRole} path following experiment ${experimentId}`);
  }

  /**
   * Rolls back the model associated with this experiment, promoting a known fallback.
   */
  public rollbackModel(experimentId: string, fallbackModelId: string): void {
    const exp = this.experiments.get(experimentId);
    if (!exp) {
      throw new Error(`ResearchLab Error: Experiment ${experimentId} not found.`);
    }

    const model = predictionModelRegistry.getModelById(exp.modelId);
    if (!model) {
      throw new Error(`Model ${exp.modelId} not found in prediction registry.`);
    }

    predictionModelRegistry.rollbackModel(model.marketType, model.role, fallbackModelId);
    exp.isRolledBack = true;
    logger.warn(`Successfully rolled back model ${exp.modelId} to fallback ${fallbackModelId} for experiment ${experimentId}`);
  }

  private bootstrapExperiments(): void {
    const baselineExp: ResearchExperiment = {
      experimentId: "exp_research_01",
      name: "LightGBM ELO Optimization",
      dataset: "ds_premier_league_2024_2025",
      features: ["feat_team_form", "feat_elo_rating_diff", "feat_expected_goals_diff"],
      modelId: "match_outcome_lightgbm_v2.1",
      promptId: "explainable_prediction",
      provider: "google",
      metrics: {
        accuracy: 0.74,
        logLoss: 0.39,
        brierScore: 0.09,
        expectedCalibrationError: 0.038,
        roi: 0.095,
      },
      durationMs: 450,
      costUsd: 0.0035,
      resultSummary: "LightGBM using ELO differences out-performed previous baseline models on accuracy and log loss calibration.",
      winnerDeclared: true,
      isRolledBack: false,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    };

    this.registerExperiment(baselineExp);
  }
}

export const researchLab = new ResearchLab();
