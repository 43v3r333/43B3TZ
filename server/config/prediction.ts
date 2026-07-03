import { ConfigurationError } from "../core/errors";

export interface PredictionConfig {
  brierTargetLimit: number;
  confidenceThreshold: number;
}

const brierTargetLimitStr = process.env.BRIER_TARGET_LIMIT || "0.22";
const brierTargetLimit = parseFloat(brierTargetLimitStr);
if (isNaN(brierTargetLimit) || brierTargetLimit < 0 || brierTargetLimit > 1) {
  throw new ConfigurationError(`Invalid BRIER_TARGET_LIMIT specified: ${brierTargetLimitStr}. Must be between 0.0 and 1.0`);
}

const confidenceThresholdStr = process.env.CONFIDENCE_THRESHOLD || "0.65";
const confidenceThreshold = parseFloat(confidenceThresholdStr);
if (isNaN(confidenceThreshold) || confidenceThreshold < 0 || confidenceThreshold > 1) {
  throw new ConfigurationError(`Invalid CONFIDENCE_THRESHOLD specified: ${confidenceThresholdStr}. Must be between 0.0 and 1.0`);
}

export const predictionConfig: PredictionConfig = {
  brierTargetLimit,
  confidenceThreshold,
};
