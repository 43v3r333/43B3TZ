import { ValidationResult, ValidationError } from "./base";

export interface RunExperimentPayload {
  name: string;
  description: string;
}

export class ResearchValidator {
  public static validateRunExperiment(body: any): ValidationResult<RunExperimentPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      errors.push({ field: "name", message: "Experiment name is required and must be a non-empty string" });
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim() === "") {
      errors.push({ field: "description", message: "Experiment description is required and must be a non-empty string" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        name: body.name.trim(),
        description: body.description.trim()
      }
    };
  }
}
