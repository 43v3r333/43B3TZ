import { ValidationResult, ValidationError } from "./base";

export interface RunDecisionPayload {
  entityId: string;
  predictionId: string;
  marketId: string;
}

export class BettingValidator {
  public static validateDecision(body: any): ValidationResult<RunDecisionPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.entityId || typeof body.entityId !== "string" || body.entityId.trim() === "") {
      errors.push({ field: "entityId", message: "entityId is required and must be a non-empty string" });
    }

    if (!body.predictionId || typeof body.predictionId !== "string" || body.predictionId.trim() === "") {
      errors.push({ field: "predictionId", message: "predictionId is required and must be a non-empty string" });
    }

    if (!body.marketId || typeof body.marketId !== "string" || body.marketId.trim() === "") {
      errors.push({ field: "marketId", message: "marketId is required and must be a non-empty string" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        entityId: body.entityId.trim(),
        predictionId: body.predictionId.trim(),
        marketId: body.marketId.trim()
      }
    };
  }
}
