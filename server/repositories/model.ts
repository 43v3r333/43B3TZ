import { IModelRepository } from "./types";
import { ModelMetadata, PredictionMarketType, ModelDeploymentRole } from "../predictions/types";
import { predictionModelRegistry } from "../predictions/registry/modelRegistry";

export class ModelRepository implements IModelRepository {
  public getAllModels(): ModelMetadata[] {
    return predictionModelRegistry.getAllModels();
  }

  public getModelById(modelId: string): ModelMetadata | undefined {
    return predictionModelRegistry.getModelById(modelId);
  }

  public getModelsByMarket(marketType: PredictionMarketType): ModelMetadata[] {
    return predictionModelRegistry.getModelsByMarket(marketType);
  }

  public getModelByRole(marketType: PredictionMarketType, role: ModelDeploymentRole): ModelMetadata | undefined {
    return predictionModelRegistry.getModelByRole(marketType, role);
  }

  public registerModel(model: ModelMetadata): void {
    predictionModelRegistry.registerModel(model);
  }

  public updateModelRole(modelId: string, role: ModelDeploymentRole): ModelMetadata {
    return predictionModelRegistry.updateModelRole(modelId, role);
  }

  public updateModelHealth(modelId: string, health: "healthy" | "degraded" | "unhealthy"): ModelMetadata {
    return predictionModelRegistry.updateModelHealth(modelId, health);
  }

  public rollbackModel(marketType: PredictionMarketType, role: ModelDeploymentRole, fallbackModelId: string): void {
    predictionModelRegistry.rollbackModel(marketType, role, fallbackModelId);
  }
}

export const modelRepository = new ModelRepository();
