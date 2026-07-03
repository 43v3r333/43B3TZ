import express from "express";
import { featureStore } from "../ml/feature-store/featureStore";
import { datasetBuilder } from "../ml/dataset-builder/datasetBuilder";
import { modelRegistry } from "../ml/registry/modelRegistry";
import { experimentTracker } from "../ml/experiments/experimentTracker";
import { driftDetector } from "../ml/drift/driftDetector";
import { trainingPipeline, inferencePlatform } from "../ml/training/trainingPipeline";
import { explainabilityEngine } from "../ml/explainability/explainability";
import { createLogger } from "../core/logger";

const router = express.Router();
const logger = createLogger("MLRouter");

// --- FEATURES ---
router.get("/features", (req, res) => {
  try {
    res.json({ features: featureStore.getAllFeatureDefinitions() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/features", (req, res) => {
  try {
    const { featureId, name, description, dataType, owner, category, expression, documentation, validationRules } = req.body;
    if (!featureId || !name || !dataType || !category) {
      return res.status(400).json({ error: "Missing required feature definition parameters." });
    }

    const definition = {
      featureId,
      name,
      description: description || "",
      dataType,
      owner: owner || "user",
      version: 1,
      category,
      expression: expression || "",
      documentation: documentation || "",
      lineage: ["User-defined"],
      freshness: new Date().toISOString(),
      validationRules: validationRules || { allowNull: true },
      qualityScore: 90
    };

    featureStore.registerFeature(definition);
    res.status(201).json({ status: "success", feature: definition });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- DATASETS ---
router.get("/datasets", (req, res) => {
  try {
    res.json({ datasets: datasetBuilder.getAllDatasetDefinitions() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/datasets/build", (req, res) => {
  try {
    const { name, type, features, splitMethod, balanceClasses, sampleSize } = req.body;
    if (!name || !type || !features || !Array.isArray(features)) {
      return res.status(400).json({ error: "Missing name, type, or features array for dataset generation." });
    }

    const result = datasetBuilder.buildDataset(name, type, features, splitMethod || "chronological", {
      balanceClasses: !!balanceClasses,
      sampleSize: sampleSize ? Number(sampleSize) : undefined
    });

    res.status(201).json({
      status: "success",
      datasetId: result.datasetId,
      trainCount: result.train?.length || 0,
      valCount: result.val?.length || 0,
      testCount: result.test?.length || 0,
      totalCount: result.allRows.length
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- MODELS & REGISTRY ---
router.get("/models", (req, res) => {
  try {
    res.json({ models: modelRegistry.getAllModels() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/models/train", (req, res) => {
  try {
    const { name, family, features, learningRate, maxDepth } = req.body;
    if (!name || !family || !features || !Array.isArray(features)) {
      return res.status(400).json({ error: "Missing name, family, or features array for pipeline execution." });
    }

    const grid = {
      learningRate: learningRate ? [Number(learningRate)] : [0.05, 0.1],
      maxDepth: maxDepth ? [Number(maxDepth)] : [4, 6]
    };

    const model = trainingPipeline.runTraining(name, family, features, grid);
    res.status(201).json({ status: "success", model });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/models/approve", (req, res) => {
  try {
    const { modelId, status, notes } = req.body;
    if (!modelId || !status) {
      return res.status(400).json({ error: "modelId and approval status are required." });
    }

    const model = modelRegistry.updateApprovalStatus(modelId, status, notes);
    res.json({ status: "success", model });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/models/promote", (req, res) => {
  try {
    const { modelId, approvedBy } = req.body;
    if (!modelId) {
      return res.status(400).json({ error: "modelId is required for champion promotion." });
    }

    const model = modelRegistry.promoteToChampion(modelId, approvedBy || "ADMIN");
    res.json({ status: "success", model });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/models/rollback", (req, res) => {
  try {
    const { modelId, targetModelId, reason } = req.body;
    if (!modelId || !targetModelId) {
      return res.status(400).json({ error: "modelId and targetModelId are required for rollback." });
    }

    const result = modelRegistry.rollbackChampion(modelId, targetModelId, reason || "Manual rollback trigger.");
    res.json({ status: "success", ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- EXPERIMENTS ---
router.get("/experiments", (req, res) => {
  try {
    res.json({ experiments: experimentTracker.getAllExperiments() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- DRIFT DETECTION ---
router.get("/drift", (req, res) => {
  try {
    // Compile live simulated baseline/current drift analysis
    const baselineFeatures = {
      feat_elo_rating: [1500, 1510, 1490, 1550, 1530, 1480, 1520, 1505, 1495, 1515],
      feat_form_momentum: [55, 60, 48, 70, 65, 40, 58, 52, 45, 62]
    };
    
    // Simulate slight downward drift in live form scores (market conditions)
    const currentFeatures = {
      feat_elo_rating: [1490, 1505, 1480, 1540, 1520, 1470, 1510, 1490, 1485, 1500],
      feat_form_momentum: [45, 52, 38, 58, 50, 35, 48, 42, 36, 50] // Significant drift
    };

    const baselineTargets = [1, 0, 1, 1, 0, 0, 1, 0, 0, 1];
    const currentTargets = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0]; // slightly fewer wins

    const baselinePredictions = [0.62, 0.45, 0.58, 0.71, 0.49, 0.38, 0.65, 0.51, 0.42, 0.60];
    const currentPredictions = [0.51, 0.42, 0.50, 0.60, 0.45, 0.32, 0.55, 0.40, 0.35, 0.48];

    const report = driftDetector.detectDrift(
      baselineFeatures,
      currentFeatures,
      baselineTargets,
      currentTargets,
      baselinePredictions,
      currentPredictions
    );

    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- INFERENCE (EXPLAINABLE PLATFORM ONLY) ---
router.post("/inference", (req, res) => {
  try {
    const { modelId, entityId, version } = req.body;
    if (!modelId || !entityId) {
      return res.status(400).json({ error: "modelId and entityId are required for explainable predictions." });
    }

    const response = inferencePlatform.predictOnline({
      modelId,
      version: version || "1.0.0",
      entityId,
      features: {}, // features are pulled from online cache in real-time
      timestamp: new Date().toISOString()
    });

    res.json({ response });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- RESET REGISTRIES ---
router.post("/reset", (req, res) => {
  try {
    featureStore.clearAll();
    datasetBuilder.clearAll();
    modelRegistry.clearAll();
    experimentTracker.clearAll();
    
    // Repopulate baseline structures
    featureStore.populateFromIntelligence();
    logger.info("Reset completed. Repopulated feature store from baseline snapshots.");
    res.json({ status: "success", message: "All registries truncated and repopulated with intelligence seeds." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
