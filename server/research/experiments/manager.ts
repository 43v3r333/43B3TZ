import { Experiment } from "../types";

export class ExperimentManager {
  private experiments: Experiment[] = [];

  createExperiment(name: string, description: string): Experiment {
    const experiment: Experiment = {
      id: `exp-${Date.now()}`,
      name,
      description,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    this.experiments.push(experiment);
    return experiment;
  }

  listExperiments(): Experiment[] {
    return this.experiments;
  }
}
