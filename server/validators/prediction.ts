import { ValidationResult, ValidationError } from "./base";
import { PredictionMarketType, ModelDeploymentRole } from "../predictions/types";

export interface InferencePayload {
  marketType: PredictionMarketType;
  entityId: string;
  featuresOverride?: Record<string, any>;
  leagueId?: string;
  competitionId?: string;
}

export interface TrainModelPayload {
  marketType: PredictionMarketType;
  datasetId?: string;
  features?: string[];
}

export interface PromoteModelPayload {
  modelId: string;
  role: ModelDeploymentRole;
}

export interface RollbackModelPayload {
  marketType: PredictionMarketType;
  role: ModelDeploymentRole;
  fallbackModelId: string;
}

export interface ResolvePredictionPayload {
  predictionId: string;
  actualOutcome: string;
}

const SUPPORTED_MARKETS: PredictionMarketType[] = [
  "match_outcome",
  "over_under_2_5",
  "over_under_3_5",
  "over_under_4_5",
  "both_teams_to_score",
  "correct_score",
  "double_chance",
  "draw_no_bet",
  "asian_handicap",
  "corners",
  "cards",
  "team_goals",
  "player_markets"
];

const SUPPORTED_ROLES: ModelDeploymentRole[] = [
  "champion",
  "challenger",
  "fallback",
  "shadow",
  "canary",
  "experimental"
];

export class PredictionValidator {
  public static validateInference(body: any): ValidationResult<InferencePayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.marketType) {
      errors.push({ field: "marketType", message: "marketType is required" });
    } else if (!SUPPORTED_MARKETS.includes(body.marketType)) {
      errors.push({ field: "marketType", message: `Unsupported market type: "${body.marketType}"` });
    }

    if (!body.entityId || typeof body.entityId !== "string") {
      errors.push({ field: "entityId", message: "entityId is required and must be a string" });
    }

    if (body.featuresOverride && typeof body.featuresOverride !== "object") {
      errors.push({ field: "featuresOverride", message: "featuresOverride must be an object if provided" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        marketType: body.marketType,
        entityId: body.entityId,
        featuresOverride: body.featuresOverride,
        leagueId: body.leagueId,
        competitionId: body.competitionId
      }
    };
  }

  public static validateTrain(body: any): ValidationResult<TrainModelPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.marketType) {
      errors.push({ field: "marketType", message: "marketType is required" });
    } else if (!SUPPORTED_MARKETS.includes(body.marketType)) {
      errors.push({ field: "marketType", message: `Unsupported market type: "${body.marketType}"` });
    }

    if (body.features && !Array.isArray(body.features)) {
      errors.push({ field: "features", message: "features must be an array of strings if provided" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        marketType: body.marketType,
        datasetId: body.datasetId,
        features: body.features
      }
    };
  }

  public static validatePromote(body: any): ValidationResult<PromoteModelPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.modelId || typeof body.modelId !== "string") {
      errors.push({ field: "modelId", message: "modelId is required and must be a string" });
    }

    if (!body.role) {
      errors.push({ field: "role", message: "role is required" });
    } else if (!SUPPORTED_ROLES.includes(body.role)) {
      errors.push({ field: "role", message: `Unsupported model role: "${body.role}"` });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        modelId: body.modelId,
        role: body.role
      }
    };
  }

  public static validateRollback(body: any): ValidationResult<RollbackModelPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.marketType) {
      errors.push({ field: "marketType", message: "marketType is required" });
    } else if (!SUPPORTED_MARKETS.includes(body.marketType)) {
      errors.push({ field: "marketType", message: `Unsupported market type: "${body.marketType}"` });
    }

    if (!body.role) {
      errors.push({ field: "role", message: "role is required" });
    } else if (!SUPPORTED_ROLES.includes(body.role)) {
      errors.push({ field: "role", message: `Unsupported model role: "${body.role}"` });
    }

    if (!body.fallbackModelId || typeof body.fallbackModelId !== "string") {
      errors.push({ field: "fallbackModelId", message: "fallbackModelId is required and must be a string" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        marketType: body.marketType,
        role: body.role,
        fallbackModelId: body.fallbackModelId
      }
    };
  }

  public static validateResolve(body: any): ValidationResult<ResolvePredictionPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.predictionId || typeof body.predictionId !== "string") {
      errors.push({ field: "predictionId", message: "predictionId is required and must be a string" });
    }

    if (!body.actualOutcome || typeof body.actualOutcome !== "string") {
      errors.push({ field: "actualOutcome", message: "actualOutcome is required and must be a string" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        predictionId: body.predictionId,
        actualOutcome: body.actualOutcome
      }
    };
  }
}
