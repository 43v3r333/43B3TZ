export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  results?: ExperimentResults;
}

export interface ExperimentResults {
  accuracy: number;
  f1Score: number;
  calibrationError: number;
  timestamp: string;
}
