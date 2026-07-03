import fs from "fs";
import path from "path";
import { ModelVersion, ModelFamily } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ModelRegistry");

export class ModelRegistry {
  private filePath: string;
  private registry: Map<string, ModelVersion> = new Map();

  constructor() {
    this.filePath = path.resolve("./data/ml_model_registry.json");
    this.initialize();
  }

  public clearAll() {
    this.registry.clear();
    this.save();
    logger.info("Model Registry storage cleared successfully.");
  }

  private initialize() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const list: ModelVersion[] = JSON.parse(raw);
        for (const model of list) {
          this.registry.set(model.modelId, model);
        }
        logger.info(`Loaded ${this.registry.size} model registry records from disk`);
      } else {
        this.save();
      }
    } catch (err: any) {
      logger.error("Failed to initialize Model Registry. Using in-memory fallback.", { error: err.message });
    }
  }

  private save() {
    try {
      const list = Array.from(this.registry.values());
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err: any) {
      logger.error("Failed to persist Model Registry states to disk", { error: err.message });
    }
  }

  /**
   * Registers a newly trained model artifact in the registry.
   */
  public registerModel(model: Omit<ModelVersion, "approvedBy" | "rollbackMetadata">): ModelVersion {
    if (this.registry.has(model.modelId)) {
      throw new Error(`Model with ID ${model.modelId} is already registered.`);
    }

    const fullModel: ModelVersion = {
      ...model,
      approvedBy: undefined,
      rollbackMetadata: undefined
    };

    this.registry.set(model.modelId, fullModel);
    this.save();
    logger.info(`Registered model: ${model.modelId} (${model.family}, version ${model.version})`);
    return fullModel;
  }

  public getModel(modelId: string): ModelVersion | undefined {
    return this.registry.get(modelId);
  }

  public getAllModels(): ModelVersion[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Safe promotion of a Challenger model to Champion.
   * If a Champion already exists for this ModelFamily, it gets demoted to retired.
   */
  public promoteToChampion(modelId: string, approvedBy: string): ModelVersion {
    const model = this.registry.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} does not exist in registry.`);
    }

    if (model.approvalStatus !== "approved") {
      throw new Error(`Model ${modelId} cannot be promoted because it lacks Admin approval (currently: ${model.approvalStatus})`);
    }

    // Demote existing champion of the same family
    for (const [id, m] of this.registry.entries()) {
      if (m.family === model.family && m.championStatus === "champion" && id !== modelId) {
        m.championStatus = "retired";
        m.deploymentStatus = "offline";
        this.registry.set(id, m);
        logger.info(`Demoted existing champion model ${id} (${model.family}) to retired`);
      }
    }

    model.championStatus = "champion";
    model.deploymentStatus = "production";
    model.approvedBy = approvedBy;
    this.registry.set(modelId, model);
    this.save();

    logger.info(`Successfully promoted challenger model ${modelId} to Champion!`);
    return model;
  }

  /**
   * Reverts a champion model back to a previous model, performing safe rollback.
   */
  public rollbackChampion(modelId: string, targetModelId: string, reason: string): { rolledBack: ModelVersion; restored: ModelVersion } {
    const currentChampion = this.registry.get(modelId);
    const targetModel = this.registry.get(targetModelId);

    if (!currentChampion || !targetModel) {
      throw new Error("Invalid model IDs provided for rollback operation.");
    }

    if (targetModel.family !== currentChampion.family) {
      throw new Error("Cannot rollback: Model families do not match.");
    }

    // Adjust current champion status
    currentChampion.championStatus = "challenger";
    currentChampion.deploymentStatus = "offline";
    currentChampion.rollbackMetadata = {
      previousModelId: targetModelId,
      previousVersion: targetModel.version,
      rollbackReason: reason,
      rolledBackAt: new Date().toISOString()
    };

    // Restore target model to champion
    targetModel.championStatus = "champion";
    targetModel.deploymentStatus = "production";

    this.registry.set(modelId, currentChampion);
    this.registry.set(targetModelId, targetModel);
    this.save();

    logger.warn(`Rollback executed: Reverted champion from ${modelId} back to ${targetModelId}. Reason: ${reason}`);
    return { rolledBack: currentChampion, restored: targetModel };
  }

  /**
   * Approves or rejects a model pending review.
   */
  public updateApprovalStatus(modelId: string, status: ModelVersion["approvalStatus"], notes?: string): ModelVersion {
    const model = this.registry.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found.`);
    }

    model.approvalStatus = status;
    if (notes) model.notes = notes;
    this.registry.set(modelId, model);
    this.save();

    logger.info(`Model ${modelId} approval status updated to ${status}`);
    return model;
  }

  /**
   * Gets the active champion model for a specific model family.
   */
  public getChampion(family: ModelFamily): ModelVersion | undefined {
    for (const model of this.registry.values()) {
      if (model.family === family && model.championStatus === "champion" && model.deploymentStatus === "production") {
        return model;
      }
    }
    return undefined;
  }
}

export const modelRegistry = new ModelRegistry();
