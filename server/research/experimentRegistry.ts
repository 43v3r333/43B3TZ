import { createLogger } from "../core/logger";

const logger = createLogger("ExperimentRegistry");

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  dataset: string;
  features: string[];
  modelVersion: string;
  status: "Draft" | "Running" | "Completed" | "Promoted" | "Archived";
  results?: {
    accuracyDelta: number;
    roiDelta: number;
    statisticalSignificance: number; // p-value
    businessImpact: "High" | "Medium" | "Low";
  };
  researcher: string;
  timestamp: string;
}

/**
 * Program 3 & 11: SCIENTIFIC GOVERNANCE
 * Tracks every AI experiment to ensure reproducibility and evidence-based promotion.
 */
export class ExperimentRegistry {
  private experiments: Experiment[] = [
    {
      id: "EXP-2026-001",
      title: "LSTM Fatigue Integration",
      hypothesis: "Integrating real-time travel and sleep patterns will improve late-game variance accuracy by 4%.",
      dataset: "fixtures_2024_2026_enriched",
      features: ["travel_distance_km", "rest_days", "timezone_delta"],
      modelVersion: "v1.5.0-alpha",
      status: "Promoted",
      results: {
        accuracyDelta: 0.042,
        roiDelta: 0.015,
        statisticalSignificance: 0.003,
        businessImpact: "High"
      },
      researcher: "Dr. Aris Thorne",
      timestamp: "2026-06-15T09:00:00Z"
    },
    {
      id: "EXP-2026-002",
      title: "Sentiment Analysis on Referee Bias",
      hypothesis: "Social sentiment regarding referee decisions correlates with cards issued in high-stakes matches.",
      dataset: "referee_social_v2",
      features: ["twitter_sentiment_ref", "past_card_distribution"],
      modelVersion: "v1.4.3-beta",
      status: "Archived",
      results: {
        accuracyDelta: -0.005,
        roiDelta: -0.002,
        statisticalSignificance: 0.45,
        businessImpact: "Low"
      },
      researcher: "Sarah Chen",
      timestamp: "2026-06-20T14:30:00Z"
    }
  ];

  public getExperiments(): Experiment[] {
    return this.experiments;
  }

  public registerExperiment(experiment: Omit<Experiment, "id" | "timestamp">): Experiment {
    const newExp: Experiment = {
      ...experiment,
      id: `EXP-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.experiments.push(newExp);
    logger.info(`Registered new experiment: ${newExp.title}`);
    return newExp;
  }
}

export const experimentRegistry = new ExperimentRegistry();
