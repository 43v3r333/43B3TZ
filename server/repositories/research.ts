import { IResearchRepository, IResearchExperiment } from "./types";

export class ResearchRepository implements IResearchRepository {
  private experiments: IResearchExperiment[] = [];

  constructor() {
    // Seed some initial baseline research experiments
    this.createExperiment(
      "Baseline Platt Scaling",
      "Standard logistic calibration on raw prediction engine outputs."
    );
    const first = this.experiments[0];
    if (first) {
      first.status = "completed";
      first.results = {
        accuracy: 0.78,
        f1Score: 0.76,
        calibrationError: 0.045,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      };
    }
  }

  public listExperiments(): IResearchExperiment[] {
    return this.experiments;
  }

  public createExperiment(name: string, description: string): IResearchExperiment {
    const experiment: IResearchExperiment = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    this.experiments.push(experiment);
    return experiment;
  }

  public getExperimentById(id: string): IResearchExperiment | undefined {
    return this.experiments.find(e => e.id === id);
  }

  public updateExperiment(id: string, updates: Partial<IResearchExperiment>): IResearchExperiment {
    const experiment = this.getExperimentById(id);
    if (!experiment) {
      throw new Error(`Experiment ${id} not found.`);
    }
    Object.assign(experiment, updates);
    return experiment;
  }
}

export const researchRepository = new ResearchRepository();
