import { ValidationResult, ValidationError } from "./base";

export interface UpdateConfigPayload {
  brierTargetLimit?: number;
  maxKellyStakePercent?: number;
}

export class AdminValidator {
  public static validateUpdateConfig(body: any): ValidationResult<UpdateConfigPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (body.brierTargetLimit !== undefined) {
      if (typeof body.brierTargetLimit !== "number" || body.brierTargetLimit <= 0) {
        errors.push({ field: "brierTargetLimit", message: "brierTargetLimit must be a positive number" });
      }
    }

    if (body.maxKellyStakePercent !== undefined) {
      if (typeof body.maxKellyStakePercent !== "number" || body.maxKellyStakePercent < 0 || body.maxKellyStakePercent > 1) {
        errors.push({ field: "maxKellyStakePercent", message: "maxKellyStakePercent must be a number between 0 and 1" });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        brierTargetLimit: body.brierTargetLimit,
        maxKellyStakePercent: body.maxKellyStakePercent
      }
    };
  }
}
