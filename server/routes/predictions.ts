import { Router } from "express";
import { predictionModelRegistry } from "../predictions/registry/modelRegistry";
import { predictionHistoryStore } from "../predictions/history/predictionHistory";
import { PredictionFactory } from "../predictions/factory/predictionFactory";
import { modelPipelines } from "../predictions/models/predictionModels";
import { PredictionMarketType, ModelDeploymentRole } from "../predictions/types";

const router = Router();

// 1. Fetch all models in the prediction registry
router.get("/models", (req, res) => {
  try {
    const models = predictionModelRegistry.getAllModels();
    res.status(200).json({ success: true, models });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Fetch historical logged predictions
router.get("/history", (req, res) => {
  try {
    const history = predictionHistoryStore.getAllRecords();
    res.status(200).json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Fetch summary metrics & performance aggregates
router.get("/metrics", (req, res) => {
  try {
    const marketType = req.query.marketType as PredictionMarketType | undefined;
    const metrics = predictionHistoryStore.calculatePerformanceMetrics({ marketType });
    res.status(200).json({ success: true, metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Trigger Prediction Inference
router.post("/inference", (req, res) => {
  try {
    const { marketType, entityId, featuresOverride, leagueId, competitionId } = req.body;
    if (!marketType || !entityId) {
      return res.status(400).json({ success: false, error: "marketType and entityId are required" });
    }

    const response = PredictionFactory.executeInference({
      marketType,
      entityId,
      featuresOverride,
      leagueId,
      competitionId
    });

    res.status(200).json({ success: true, response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Trigger training pipeline of a prediction model
router.post("/train", (req, res) => {
  try {
    const { marketType, datasetId, features } = req.body;
    if (!marketType) {
      return res.status(400).json({ success: false, error: "marketType is required" });
    }

    const pipeline = modelPipelines[marketType as PredictionMarketType];
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
      marketType: marketType as PredictionMarketType,
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

    predictionModelRegistry.registerModel(newModel);

    res.status(200).json({ success: true, model: newModel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Promote challenger model to Champion, or update deployment roles
router.post("/promote", (req, res) => {
  try {
    const { modelId, role } = req.body;
    if (!modelId || !role) {
      return res.status(400).json({ success: false, error: "modelId and role are required" });
    }

    const updated = predictionModelRegistry.updateModelRole(modelId, role as ModelDeploymentRole);
    res.status(200).json({ success: true, model: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Rollback active role to target fallback
router.post("/rollback", (req, res) => {
  try {
    const { marketType, role, fallbackModelId } = req.body;
    if (!marketType || !role || !fallbackModelId) {
      return res.status(400).json({ success: false, error: "marketType, role, and fallbackModelId are required" });
    }

    predictionModelRegistry.rollbackModel(marketType as PredictionMarketType, role as ModelDeploymentRole, fallbackModelId);
    res.status(200).json({ success: true, message: `Successfully rolled back ${marketType} ${role} role to ${fallbackModelId}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Resolve prediction with real outcome
router.post("/resolve", (req, res) => {
  try {
    const { predictionId, actualOutcome } = req.body;
    if (!predictionId || !actualOutcome) {
      return res.status(400).json({ success: false, error: "predictionId and actualOutcome are required" });
    }

    const resolved = predictionHistoryStore.resolvePrediction(predictionId, actualOutcome);
    res.status(200).json({ success: true, record: resolved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
