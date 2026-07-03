import fs from "fs";
import path from "path";
import { Experiment } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ExperimentTracker");

export class ExperimentTracker {
  private filePath: string;
  private experiments: Map<string, Experiment> = new Map();

  constructor() {
    this.filePath = path.resolve("./data/ml_experiments.json");
    this.initialize();
  }

  public clearAll() {
    this.experiments.clear();
    this.save();
    logger.info("Experiment Tracker storage cleared successfully.");
  }

  private initialize() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const list: Experiment[] = JSON.parse(raw);
        for (const exp of list) {
          this.experiments.set(exp.experimentId, exp);
        }
        logger.info(`Loaded ${this.experiments.size} ML Experiments from registry database`);
      } else {
        this.save();
      }
    } catch (err: any) {
      logger.error("Failed to initialize Experiment Tracker database. Using in-memory store.", { error: err.message });
    }
  }

  private save() {
    try {
      const list = Array.from(this.experiments.values());
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err: any) {
      logger.error("Failed to write ML Experiments database to disk", { error: err.message });
    }
  }

  public createExperiment(
    name: string,
    datasetVersion: string,
    featureVersion: string,
    modelVersion: string,
    hyperparameters: Record<string, any>,
    metrics: Record<string, number>,
    durationMs: number,
    notes: string,
    randomSeed = 42
  ): Experiment {
    const experimentId = `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const newExperiment: Experiment = {
      experimentId,
      name,
      datasetVersion,
      featureVersion,
      modelVersion,
      hyperparameters,
      metrics,
      durationMs,
      hardwareMetadata: "CPU x64, Node.js Sandbox V8",
      randomSeed,
      repositoryBaseline: "git_rev_v1.2.0_release",
      notes,
      approvalStatus: "draft",
      createdAt: new Date().toISOString()
    };

    this.experiments.set(experimentId, newExperiment);
    this.save();
    logger.info(`Recorded new machine learning experiment: ${name} (${experimentId})`);
    return newExperiment;
  }

  public getExperiment(experimentId: string): Experiment | undefined {
    return this.experiments.get(experimentId);
  }

  public getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateApprovalStatus(experimentId: string, status: Experiment["approvalStatus"]): Experiment {
    const exp = this.experiments.get(experimentId);
    if (!exp) {
      throw new Error(`Experiment ${experimentId} not found.`);
    }

    exp.approvalStatus = status;
    this.experiments.set(experimentId, exp);
    this.save();
    logger.info(`Experiment ${experimentId} approval status modified to ${status}`);
    return exp;
  }
}

export const experimentTracker = new ExperimentTracker();
