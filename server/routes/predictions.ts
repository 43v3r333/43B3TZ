import { Router } from "express";
import { container } from "../core/di";
import { IPredictionRepository, IModelRepository } from "../repositories/types";
import { PredictionValidator } from "../validators/prediction";
import { PredictionMarketType, ModelDeploymentRole } from "../predictions/types";
import { requirePermission } from "../middleware/security";
import { modelPipelines } from "../predictions/models/predictionModels";
import { PredictionService } from "../services/prediction";

const router = Router();

// Retrieve from container (DI)
const getModelRepo = () => container.resolve<IModelRepository>("ModelRepository");
const getPredictionRepo = () => container.resolve<IPredictionRepository>("PredictionRepository");
const getPredictionService = () => container.resolve<PredictionService>("PredictionService");

// 1. Fetch all models in the prediction registry
router.get("/models", requirePermission("Prediction.Read"), (req, res, next) => {
  try {
    const models = getModelRepo().getAllModels();
    res.status(200).json({ success: true, models });
  } catch (err: any) {
    next(err);
  }
});

// 2. Fetch historical logged predictions
router.get("/history", requirePermission("Prediction.Read"), (req, res, next) => {
  try {
    const history = getPredictionRepo().getAllRecords();
    res.status(200).json({ success: true, history });
  } catch (err: any) {
    next(err);
  }
});

// 3. Fetch summary metrics & performance aggregates
router.get("/metrics", requirePermission("Prediction.Read"), (req, res, next) => {
  try {
    const marketType = req.query.marketType as PredictionMarketType | undefined;
    const historyStore = (getPredictionRepo() as any).predictionHistoryStore || require("../predictions/history/predictionHistory").predictionHistoryStore;
    const metrics = historyStore.calculatePerformanceMetrics({ marketType });
    res.status(200).json({ success: true, metrics });
  } catch (err: any) {
    next(err);
  }
});

// 4. Trigger Prediction Inference
router.post("/inference", requirePermission("Prediction.Write"), async (req, res, next) => {
  try {
    const validation = PredictionValidator.validateInference(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { marketType, entityId, featuresOverride, leagueId, competitionId } = validation.data!;
    
    // Choose async vs sync processing based on query flag
    if (req.query.async === "true") {
      const response = await getPredictionService().executeInferenceAsync(
        marketType,
        entityId,
        featuresOverride,
        leagueId,
        competitionId
      );
      res.status(202).json({ success: true, ...response });
    } else {
      const response = getPredictionService().executeInferenceSync(
        marketType,
        entityId,
        featuresOverride,
        leagueId,
        competitionId
      );
      res.status(200).json({ success: true, response });
    }
  } catch (err: any) {
    next(err);
  }
});

// 5. Trigger training pipeline of a prediction model
router.post("/train", requirePermission("Admin.Configure"), (req, res, next) => {
  try {
    const validation = PredictionValidator.validateTrain(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { marketType, datasetId, features } = validation.data!;
    const pipeline = modelPipelines[marketType];
    if (!pipeline) {
      return res.status(400).json({ success: false, error: `Invalid or unsupported market: ${marketType}` });
    }

    const feats = features || pipeline.defaultFeatures;
    const trainResult = pipeline.train(datasetId || "ds_default_temporal_v1", feats);

    // Register newly trained challenger model
    const newModelId = `mod_chal_${marketType}_${Date.now().toString().slice(-4)}`;
    const newModel = {
      modelId: newModelId,
      name: `Challenger ${marketType.replace(/_/g, " ").toUpperCase()} (${trainResult.newVersion})`,
      marketType: marketType,
      family: "lightgbm" as any,
      version: trainResult.newVersion,
      datasetId: datasetId || "ds_default_temporal_v1",
      featuresUsed: feats,
      hyperparameters: { learningRate: 0.05, maxDepth: 6 },
      role: "challenger" as ModelDeploymentRole,
      isActive: true,
      brierScore: trainResult.brierScore,
      logLoss: trainResult.logLoss,
      accuracy: trainResult.accuracy,
      f1Score: trainResult.f1Score,
      expectedCalibrationError: 0.02 + Math.random() * 0.01,
      driftScore: 0.0,
      dataFreshnessDays: 0.0,
      healthStatus: "healthy" as const,
      createdAt: new Date().toISOString()
    };

    getModelRepo().registerModel(newModel);

    res.status(200).json({ success: true, model: newModel });
  } catch (err: any) {
    next(err);
  }
});

// 6. Promote challenger model to Champion, or update deployment roles
router.post("/promote", requirePermission("Admin.Configure"), (req, res, next) => {
  try {
    const validation = PredictionValidator.validatePromote(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { modelId, role } = validation.data!;
    const updated = getModelRepo().updateModelRole(modelId, role);
    res.status(200).json({ success: true, model: updated });
  } catch (err: any) {
    next(err);
  }
});

// 7. Rollback active role to target fallback
router.post("/rollback", requirePermission("Admin.Configure"), (req, res, next) => {
  try {
    const validation = PredictionValidator.validateRollback(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { marketType, role, fallbackModelId } = validation.data!;
    getModelRepo().rollbackModel(marketType, role, fallbackModelId);
    res.status(200).json({ success: true, message: `Successfully rolled back ${marketType} ${role} role to ${fallbackModelId}` });
  } catch (err: any) {
    next(err);
  }
});

// 8. Resolve prediction with real outcome
router.post("/resolve", requirePermission("Prediction.Write"), (req, res, next) => {
  try {
    const validation = PredictionValidator.validateResolve(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { predictionId, actualOutcome } = validation.data!;
    const resolved = getPredictionService().resolvePrediction(predictionId, actualOutcome);
    res.status(200).json({ success: true, record: resolved });
  } catch (err: any) {
    next(err);
  }
});

export default router;
