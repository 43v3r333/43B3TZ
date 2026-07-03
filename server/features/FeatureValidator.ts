import { createLogger } from "../core/logger";

const logger = createLogger("FeatureValidator");

export class FeatureValidator {
  /**
   * Validates calculated feature values against robust limits.
   */
  public static validate(featureId: string, value: any, rules?: { min?: number; max?: number; isRequired?: boolean }): boolean {
    if (value === undefined || value === null) {
      if (rules?.isRequired) {
        logger.warn(`Feature ${featureId} is null or undefined but is marked as required.`);
        return false;
      }
      return true;
    }

    if (typeof value === "number") {
      if (isNaN(value)) {
        logger.error(`Feature ${featureId} calculated as NaN.`);
        return false;
      }
      if (!isFinite(value)) {
        logger.error(`Feature ${featureId} calculated as Infinite.`);
        return false;
      }
      if (rules?.min !== undefined && value < rules.min) {
        logger.warn(`Feature ${featureId} value (${value}) falls below the minimum limit (${rules.min}).`);
        return false;
      }
      if (rules?.max !== undefined && value > rules.max) {
        logger.warn(`Feature ${featureId} value (${value}) exceeds the maximum limit (${rules.max}).`);
        return false;
      }
    }

    return true;
  }
}
