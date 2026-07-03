import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Database, 
  Cpu, 
  GitCompare, 
  Activity, 
  Clock, 
  Sliders, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  History, 
  Eye, 
  FileText,
  Trash2,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FeatureDefinition {
  featureId: string;
  name: string;
  description: string;
  dataType: string;
  owner: string;
  version: number;
  category: string;
  expression: string;
  documentation: string;
  lineage: string[];
  freshness: string;
  qualityScore: number;
}

interface DatasetDefinition {
  datasetId: string;
  name: string;
  type: string;
  features: string[];
  splitMethod: string;
  hash: string;
  rowCount: number;
  createdAt: string;
}

interface ModelVersion {
  modelId: string;
  version: string;
  family: string;
  trainingDatasetId: string;
  featuresUsed: string[];
  hyperparameters: Record<string, any>;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    rocAuc: number;
    prAuc: number;
    logLoss: number;
    brierScore: number;
    calibrationError: number;
    expectedValue: number;
    profitSimulation: number;
    sharpeRatio: number;
    maxDrawdown: number;
    predictionStability: number;
    confidenceReliability: number;
    featureImportance: Record<string, number>;
  };
  calibration: {
    method: string;
    expectedCalibrationError: number;
    maximumCalibrationError: number;
    brierScore: number;
    reliabilityDiagram: Array<{
      binMidpoint: number;
      empiricalProb: number;
      predictedProb: number;
      count: number;
    }>;
  };
  artifactPath: string;
  gitRevision: string;
  experimentId: string;
  championStatus: "champion" | "challenger" | "retired";
  approvalStatus: "pending" | "approved" | "rejected";
  deploymentStatus: "offline" | "canary" | "production";
  notes?: string;
  createdAt: string;
}

interface Experiment {
  experimentId: string;
  name: string;
  datasetVersion: string;
  featureVersion: string;
  modelVersion: string;
  hyperparameters: Record<string, any>;
  metrics: Record<string, number>;
  durationMs: number;
  randomSeed: number;
  approvalStatus: string;
  notes: string;
  createdAt: string;
}

interface DriftMetric {
  metricName: string;
  driftScore: number;
  status: "stable" | "warning" | "critical";
  baselineMean: number;
  currentMean: number;
  testUsed: string;
}

interface DriftReport {
  timestamp: string;
  featureDrift: Record<string, DriftMetric>;
  targetDrift: DriftMetric;
  conceptDrift: DriftMetric;
  predictionDrift: DriftMetric;
  calibrationDrift: DriftMetric;
  alerts: string[];
}

export default function MlopsDashboard() {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [datasets, setDatasets] = useState<DatasetDefinition[]>([]);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [driftReport, setDriftReport] = useState<DriftReport | null>(null);
  
  const [activePanel, setActivePanel] = useState<"features" | "datasets" | "training" | "registry" | "experiments" | "drift" | "inference">("registry");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Form states - Custom Feature
  const [newFeatId, setNewFeatId] = useState("");
  const [newFeatName, setNewFeatName] = useState("");
  const [newFeatCat, setNewFeatCat] = useState("Team Performance");
  const [newFeatType, setNewFeatType] = useState("numerical");
  const [newFeatDesc, setNewFeatDesc] = useState("");
  const [newFeatExpr, setNewFeatExpr] = useState("");

  // Form states - Dataset Builder
  const [dsName, setDsName] = useState("Chronological_Training_Pool");
  const [dsType, setDsType] = useState<any>("train");
  const [dsSplit, setDsSplit] = useState("chronological");
  const [dsFeatures, setDsFeatures] = useState<string[]>([]);
  const [balanceClasses, setBalanceClasses] = useState(false);

  // Form states - Model Training
  const [trainModelName, setTrainModelName] = useState("Challenger_Boosted_Ensemble");
  const [trainFamily, setTrainFamily] = useState("lightgbm");
  const [trainFeatures, setTrainFeatures] = useState<string[]>([]);
  const [trainLr, setTrainLr] = useState("0.05");
  const [trainDepth, setTrainDepth] = useState("6");

  // Form states - Online Inference Playground
  const [infModelId, setInfModelId] = useState("");
  const [infEntityId, setInfEntityId] = useState("team-dummy-1");
  const [infResponse, setInfResponse] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [featRes, dsRes, modelRes, expRes, driftRes] = await Promise.all([
        fetch("/api/v1/ml/features"),
        fetch("/api/v1/ml/datasets"),
        fetch("/api/v1/ml/models"),
        fetch("/api/v1/ml/experiments"),
        fetch("/api/v1/ml/drift")
      ]);

      if (featRes.ok) {
        const d = await featRes.json();
        setFeatures(d.features || []);
        // Set default features in checkboxes if empty
        if (d.features?.length > 0) {
          const ids = d.features.map((f: any) => f.featureId);
          setDsFeatures(ids.slice(0, 4));
          setTrainFeatures(ids.slice(0, 4));
        }
      }
      if (dsRes.ok) {
        const d = await dsRes.json();
        setDatasets(d.datasets || []);
      }
      if (modelRes.ok) {
        const d = await modelRes.json();
        setModels(d.models || []);
        if (d.models?.length > 0 && !infModelId) {
          setInfModelId(d.models[0].modelId);
        }
      }
      if (expRes.ok) {
        const d = await expRes.json();
        setExperiments(d.experiments || []);
      }
      if (driftRes.ok) {
        const d = await driftRes.json();
        setDriftReport(d.report || null);
      }
    } catch (err: any) {
      addLog(`Failed to sync data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatId || !newFeatName) return;
    try {
      const res = await fetch("/api/v1/ml/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId: newFeatId,
          name: newFeatName,
          category: newFeatCat,
          dataType: newFeatType,
          description: newFeatDesc,
          expression: newFeatExpr
        })
      });
      if (res.ok) {
        addLog(`Registered feature: ${newFeatName}`);
        setNewFeatId("");
        setNewFeatName("");
        setNewFeatDesc("");
        setNewFeatExpr("");
        fetchData();
      } else {
        const err = await res.json();
        addLog(`Feature registration error: ${err.error}`);
      }
    } catch (err: any) {
      addLog(`Feature error: ${err.message}`);
    }
  };

  const handleBuildDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dsFeatures.length === 0) {
      addLog("Cannot build dataset: select at least one feature.");
      return;
    }
    try {
      addLog("Submitting Point-in-Time chronological dataset build...");
      const res = await fetch("/api/v1/ml/datasets/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dsName,
          type: dsType,
          features: dsFeatures,
          splitMethod: dsSplit,
          balanceClasses
        })
      });
      if (res.ok) {
        const result = await res.json();
        addLog(`Dataset compiled. Split ratio details: Train=${result.trainCount}, Val=${result.valCount}, Test=${result.testCount}`);
        fetchData();
      } else {
        const err = await res.json();
        addLog(`Dataset compile failed: ${err.error}`);
      }
    } catch (err: any) {
      addLog(`Dataset error: ${err.message}`);
    }
  };

  const handleTrainModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trainFeatures.length === 0) {
      addLog("Model training aborted: select features first.");
      return;
    }
    try {
      addLog(`Queueing ${trainFamily.toUpperCase()} training orchestration run...`);
      const res = await fetch("/api/v1/ml/models/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trainModelName,
          family: trainFamily,
          features: trainFeatures,
          learningRate: trainLr,
          maxDepth: trainDepth
        })
      });
      if (res.ok) {
        const result = await res.json();
        addLog(`Successfully trained model. ID: ${result.model.modelId}. Validation Accuracy: ${(result.model.metrics.accuracy * 100).toFixed(1)}%`);
        fetchData();
      } else {
        const err = await res.json();
        addLog(`Training failed: ${err.error}`);
      }
    } catch (err: any) {
      addLog(`Training error: ${err.message}`);
    }
  };

  const handleApproveModel = async (modelId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/v1/ml/models/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, status, notes: "Approved after validating holdout F1 and Brier calibration." })
      });
      if (res.ok) {
        addLog(`Model ${modelId} status updated to: ${status.toUpperCase()}`);
        fetchData();
      }
    } catch (err: any) {
      addLog(`Error approving model: ${err.message}`);
    }
  };

  const handlePromoteToChampion = async (modelId: string) => {
    try {
      const res = await fetch("/api/v1/ml/models/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, approvedBy: "ML_PLATFORM_OPERATOR" })
      });
      if (res.ok) {
        addLog(`Promoted challenger ${modelId} to active Champion status.`);
        fetchData();
      } else {
        const err = await res.json();
        addLog(`Promotion blocked: ${err.error}`);
      }
    } catch (err: any) {
      addLog(`Error promoting model: ${err.message}`);
    }
  };

  const handleRollback = async (modelId: string, targetModelId: string) => {
    const reason = prompt("Enter reasons/reversion logging for this model rollback:");
    if (!reason) return;
    try {
      const res = await fetch("/api/v1/ml/models/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, targetModelId, reason })
      });
      if (res.ok) {
        addLog(`Rollback completed successfully. Reverted current champion ${modelId}.`);
        fetchData();
      }
    } catch (err: any) {
      addLog(`Rollback failed: ${err.message}`);
    }
  };

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infModelId) return;
    try {
      const res = await fetch("/api/v1/ml/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: infModelId, entityId: infEntityId })
      });
      if (res.ok) {
        const d = await res.json();
        setInfResponse(d.response);
        addLog(`Inference complete for entity ${infEntityId}. Probability: ${(d.response.probability * 100).toFixed(2)}%`);
      } else {
        const err = await res.json();
        addLog(`Inference blocked: ${err.error}`);
      }
    } catch (err: any) {
      addLog(`Inference error: ${err.message}`);
    }
  };

  const handleResetSystem = async () => {
    if (!confirm("Are you sure you want to truncate and re-bootstrap the entire MLOps Platform state? This will recreate baseline champion configurations.")) return;
    try {
      const res = await fetch("/api/v1/ml/reset", { method: "POST" });
      if (res.ok) {
        addLog("MLOps system state truncated. Initial baseline champions re-seeded.");
        fetchData();
      }
    } catch (err: any) {
      addLog(`Reset failed: ${err.message}`);
    }
  };

  return (
    <div id="mlops-console-root" className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-gray-100">
      {/* SIDEBAR NAVIGATION & CONTROLS */}
      <div id="mlops-sidebar" className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-900/40 border border-blue-500/30 rounded-lg text-blue-400">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-semibold text-lg tracking-tight">Enterprise MLOps</h2>
              <p className="font-mono text-[10px] text-gray-500">v1.2.0 • CONTROL PLANE</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: "registry", label: "Model Registry", icon: Cpu, count: models.length },
              { id: "features", label: "Feature Store", icon: Database, count: features.length },
              { id: "datasets", label: "Dataset Builder", icon: SlidersHorizontal, count: datasets.length },
              { id: "training", label: "Training Queue", icon: Play, count: 0 },
              { id: "experiments", label: "Experiment Tracker", icon: History, count: experiments.length },
              { id: "drift", label: "Drift Monitoring", icon: ShieldAlert, count: driftReport?.alerts.length || 0 },
              { id: "inference", label: "Explainable Inference", icon: Eye, count: 0 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activePanel === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`mlops-tab-btn-${tab.id}`}
                  onClick={() => setActivePanel(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    isActive 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-semibold" 
                      : "border-transparent text-gray-400 hover:bg-slate-800/40 hover:text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-gray-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <button
            id="mlops-re-sync-btn"
            onClick={fetchData}
            disabled={isLoading}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-[11px] font-mono rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            REFRESH CONTROL REGISTRY
          </button>
          
          <button
            id="mlops-reset-btn"
            onClick={handleResetSystem}
            className="w-full py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 text-red-400 text-[10px] font-mono rounded-lg transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            TRUNCATE ALL REGISTRIES
          </button>
        </div>
      </div>

      {/* MAIN DISPLAY AREA */}
      <div id="mlops-main-content" className="xl:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          {/* 1. MODEL REGISTRY */}
          {activePanel === "registry" && (
            <motion.div
              key="panel-registry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-sans font-semibold text-base text-gray-200">Model Registry & Governance</h3>
                    <p className="text-xs text-gray-500 mt-1">Multi-family model lifecycle management and safe production promotion gates.</p>
                  </div>
                  <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-[10px]">
                    AUDITED PIPELINES
                  </span>
                </div>

                <div className="space-y-4">
                  {models.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                      <Cpu className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No models registered yet. Go to Training Queue to fit a model.</p>
                    </div>
                  ) : (
                    models.map(model => {
                      const isChamp = model.championStatus === "champion";
                      return (
                        <div key={model.modelId} className="border border-slate-800 bg-slate-950/50 rounded-xl p-5 space-y-4 transition hover:border-slate-700">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                isChamp ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30" : "bg-slate-900 text-gray-400"
                              }`}>
                                <Cpu className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-mono text-xs font-bold text-gray-200">{model.modelId}</h4>
                                  <span className="bg-slate-800 text-slate-300 font-mono text-[9px] px-1.5 py-0.2 rounded">
                                    v{model.version}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 font-mono">
                                  <span>Family: {model.family.toUpperCase()}</span>
                                  <span>•</span>
                                  <span>Dataset: {model.trainingDatasetId}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* STATUS TAGS */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                isChamp 
                                  ? "bg-emerald-900/10 border-emerald-500/30 text-emerald-400" 
                                  : model.championStatus === "challenger"
                                  ? "bg-amber-900/10 border-amber-500/30 text-amber-400"
                                  : "bg-slate-900 border-slate-800 text-gray-500"
                              }`}>
                                {model.championStatus.toUpperCase()}
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                model.approvalStatus === "approved"
                                  ? "bg-blue-900/10 border-blue-500/30 text-blue-400"
                                  : model.approvalStatus === "rejected"
                                  ? "bg-red-900/10 border-red-500/30 text-red-400"
                                  : "bg-gray-900 border-gray-800 text-gray-400"
                              }`}>
                                {model.approvalStatus.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* METRICS ROW */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/30 border border-slate-900 rounded-lg p-3 text-center">
                            <div>
                              <p className="text-[10px] text-gray-500 font-mono">ACCURACY</p>
                              <p className="text-sm font-semibold text-gray-200 mt-1 font-mono">{(model.metrics.accuracy * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-mono">F1 SCORE</p>
                              <p className="text-sm font-semibold text-gray-200 mt-1 font-mono">{model.metrics.f1.toFixed(3)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-mono">LOG LOSS</p>
                              <p className="text-sm font-semibold text-gray-200 mt-1 font-mono">{model.metrics.logLoss.toFixed(3)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-mono">CALIBRATION (ECE)</p>
                              <p className="text-sm font-semibold text-gray-200 mt-1 font-mono">{(model.calibration.expectedCalibrationError * 100).toFixed(2)}%</p>
                            </div>
                          </div>

                          {/* SYSTEM / ROLLBACK ACTIONS */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-900 text-xs">
                            <span className="text-[10px] text-gray-500 font-mono">Created: {new Date(model.createdAt).toLocaleString()}</span>
                            
                            <div className="flex gap-2">
                              {model.approvalStatus === "pending" && (
                                <>
                                  <button
                                    id={`approve-${model.modelId}`}
                                    onClick={() => handleApproveModel(model.modelId, "approved")}
                                    className="px-2.5 py-1 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/40 rounded font-mono text-[10px]"
                                  >
                                    APPROVE MODEL
                                  </button>
                                  <button
                                    id={`reject-${model.modelId}`}
                                    onClick={() => handleApproveModel(model.modelId, "rejected")}
                                    className="px-2.5 py-1 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded font-mono text-[10px]"
                                  >
                                    REJECT
                                  </button>
                                </>
                              )}

                              {model.approvalStatus === "approved" && model.championStatus === "challenger" && (
                                <button
                                  id={`promote-${model.modelId}`}
                                  onClick={() => handlePromoteToChampion(model.modelId)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-bold rounded text-[10px] transition"
                                >
                                  PROMOTE TO CHAMPION
                                </button>
                              )}

                              {isChamp && models.some(m => m.family === model.family && m.modelId !== model.modelId) && (
                                <button
                                  id={`rollback-${model.modelId}`}
                                  onClick={() => {
                                    const older = models.find(m => m.family === model.family && m.modelId !== model.modelId);
                                    if (older) handleRollback(model.modelId, older.modelId);
                                  }}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-gray-400 rounded font-mono text-[10px]"
                                >
                                  ROLLBACK TO CHALLENGER
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. FEATURE STORE */}
          {activePanel === "features" && (
            <motion.div
              key="panel-features"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* REGISTER NEW FEATURE */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-4">Register Feature Definition</h3>
                <form onSubmit={handleCreateFeature} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">FEATURE ID</label>
                    <input
                      id="feat-form-id"
                      type="text"
                      placeholder="feat_squad_experience"
                      value={newFeatId}
                      onChange={e => setNewFeatId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">DISPLAY NAME</label>
                    <input
                      id="feat-form-name"
                      type="text"
                      placeholder="Squad Experience Score"
                      value={newFeatName}
                      onChange={e => setNewFeatName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">CATEGORY</label>
                    <select
                      id="feat-form-cat"
                      value={newFeatCat}
                      onChange={e => setNewFeatCat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                    >
                      <option>Team Performance</option>
                      <option>Team Form</option>
                      <option>Expected Goals</option>
                      <option>Squad Fitness</option>
                      <option>Market Signals</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">CALCULATION EXPRESSION (PSEUDOCODE)</label>
                    <input
                      id="feat-form-expr"
                      type="text"
                      placeholder="total_career_minutes / squad_count"
                      value={newFeatExpr}
                      onChange={e => setNewFeatExpr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">DATA TYPE</label>
                    <select
                      id="feat-form-type"
                      value={newFeatType}
                      onChange={e => setNewFeatType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                    >
                      <option value="numerical">numerical</option>
                      <option value="categorical">categorical</option>
                      <option value="boolean">boolean</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">DESCRIPTION</label>
                    <input
                      id="feat-form-desc"
                      type="text"
                      placeholder="Lineage metrics for historical team player rosters."
                      value={newFeatDesc}
                      onChange={e => setNewFeatDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      id="feat-form-submit"
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded text-white transition flex items-center gap-1.5"
                    >
                      <Database className="w-3.5 h-3.5" />
                      REGISTER TO FEATURE CATALOG
                    </button>
                  </div>
                </form>
              </div>

              {/* FEATURES CATALOG TABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-4">Feature Registry Catalog</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-gray-500 font-mono">
                        <th className="py-2.5">FEATURE ID</th>
                        <th className="py-2.5">NAME</th>
                        <th className="py-2.5">CATEGORY</th>
                        <th className="py-2.5">DATA TYPE</th>
                        <th className="py-2.5">LINEAGE</th>
                        <th className="py-2.5 text-right">QUALITY SCORE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(f => (
                        <tr key={f.featureId} className="border-b border-slate-800/50 hover:bg-slate-950/20">
                          <td className="py-3 font-mono text-blue-400 font-bold">{f.featureId}</td>
                          <td className="py-3 font-sans text-gray-300">{f.name}</td>
                          <td className="py-3 font-sans text-gray-400">{f.category}</td>
                          <td className="py-3 font-mono text-gray-500">{f.dataType}</td>
                          <td className="py-3 text-[11px] text-gray-500 font-sans max-w-[150px] truncate" title={f.lineage.join(" -> ")}>
                            {f.lineage.join(" ➔ ")}
                          </td>
                          <td className="py-3 text-right font-mono text-emerald-400 font-bold">{f.qualityScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. DATASET BUILDER */}
          {activePanel === "datasets" && (
            <motion.div
              key="panel-datasets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-2">Dataset Builder Engine</h3>
                <p className="text-xs text-gray-500 mb-5">Compile chronological data pools with strict walk-forward, leak-prevention controls.</p>

                <form onSubmit={handleBuildDataset} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">DATASET NAME</label>
                      <input
                        id="ds-form-name"
                        type="text"
                        value={dsName}
                        onChange={e => setDsName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">SPLIT METHODOLOGY</label>
                      <select
                        id="ds-form-split"
                        value={dsSplit}
                        onChange={e => setDsSplit(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                      >
                        <option value="chronological">Chronological Split (70 Train / 15 Val / 15 Test)</option>
                        <option value="walk_forward">Walk-Forward Validation (Rolling window blocks)</option>
                      </select>
                    </div>
                  </div>

                  {/* SELECT FEATURES FOR DATASET */}
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-2">SELECT FEATURES TO ATTRIBUTE POINT-IN-TIME</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 border border-slate-850 p-4 rounded-lg">
                      {features.map(f => {
                        const checked = dsFeatures.includes(f.featureId);
                        return (
                          <label key={f.featureId} className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setDsFeatures(prev => 
                                  checked ? prev.filter(id => id !== f.featureId) : [...prev, f.featureId]
                                );
                              }}
                              className="mt-0.5 rounded border-slate-800 text-blue-600 focus:ring-blue-500/40 bg-slate-950"
                            />
                            <div>
                              <span className="font-mono text-gray-200 text-[11px] font-bold block">{f.featureId}</span>
                              <span className="text-[10px] text-gray-500 block">{f.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/30 p-3 rounded-lg border border-slate-900">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-400">
                      <input
                        type="checkbox"
                        checked={balanceClasses}
                        onChange={e => setBalanceClasses(e.target.checked)}
                        className="rounded border-slate-800 text-blue-600 focus:ring-blue-500/40 bg-slate-950"
                      />
                      APPLY BALANCED TARGET CLASS SAMPLING (Home win ratio down-sampling)
                    </label>

                    <button
                      id="ds-form-submit"
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 font-sans font-bold text-xs rounded text-white transition flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      COMPILE DATASET ROW MATRIX
                    </button>
                  </div>
                </form>
              </div>

              {/* GENERATED DATASETS LIST */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-4">Dataset Lineage Registry</h3>
                <div className="space-y-3">
                  {datasets.length === 0 ? (
                    <div className="text-center py-8">
                      <Database className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No datasets compiled yet.</p>
                    </div>
                  ) : (
                    datasets.map(ds => (
                      <div key={ds.datasetId} className="border border-slate-800/80 bg-slate-950/40 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gray-200">{ds.name}</span>
                            <span className="bg-blue-900/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] px-1.5 py-0.2 rounded">
                              {ds.datasetId}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-gray-500">Hash Checksum: {ds.hash}</p>
                          <div className="text-[10px] text-gray-400 flex flex-wrap gap-2 pt-1">
                            <span>Features: {ds.features.length}</span>
                            <span>•</span>
                            <span>Method: {ds.splitMethod.toUpperCase()}</span>
                            <span>•</span>
                            <span>Rows: {ds.rowCount}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Compiled: {new Date(ds.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. TRAINING QUEUE */}
          {activePanel === "training" && (
            <motion.div
              key="panel-training"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-2">Automated Training Pipeline Queue</h3>
                <p className="text-xs text-gray-500 mb-5">Configure and launch parallel model orchestrations over split matrices.</p>

                <form onSubmit={handleTrainModel} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">MODEL INSTANCE LABEL</label>
                      <input
                        id="train-form-name"
                        type="text"
                        value={trainModelName}
                        onChange={e => setTrainModelName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">MODEL ALGORITHM FAMILY</label>
                      <select
                        id="train-form-family"
                        value={trainFamily}
                        onChange={e => setTrainFamily(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                      >
                        <option value="logistic_regression">Logistic Regression (L1/L2 Regularized)</option>
                        <option value="lightgbm">LightGBM (Gradient Boosted Hist Trees)</option>
                        <option value="xgboost">XGBoost (Extreme Gradient Boosting)</option>
                        <option value="catboost">CatBoost (Symmetric Trees Categorical)</option>
                        <option value="random_forest">Random Forest (Bagged Dec Trees)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">LEARNING RATE HYPERPARAMETER</label>
                      <input
                        id="train-form-lr"
                        type="number"
                        step="0.01"
                        value={trainLr}
                        onChange={e => setTrainLr(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">MAX TREE DEPTH LIMIT</label>
                      <input
                        id="train-form-depth"
                        type="number"
                        value={trainDepth}
                        onChange={e => setTrainDepth(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 font-mono focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* SELECT FEATURES */}
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-2">SELECT MODEL FEATURE MATRIX ATTRIBUTIONS</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/40 border border-slate-850 p-4 rounded-lg">
                      {features.map(f => {
                        const checked = trainFeatures.includes(f.featureId);
                        return (
                          <label key={f.featureId} className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setTrainFeatures(prev => 
                                  checked ? prev.filter(id => id !== f.featureId) : [...prev, f.featureId]
                                );
                              }}
                              className="mt-0.5 rounded border-slate-800 text-blue-600 focus:ring-blue-500/40 bg-slate-950"
                            />
                            <div>
                              <span className="font-mono text-gray-200 text-[11px] font-bold block">{f.featureId}</span>
                              <span className="text-[10px] text-gray-500 block">{f.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-900">
                    <button
                      id="train-form-submit"
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-sans font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                      EXECUTE PIPELINE ORCHESTRATION
                    </button>
                  </div>
                </form>
              </div>

              {/* TERMINAL OUTPUTS */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-sans font-semibold text-xs text-gray-400">MLOPS CONTROL LOGS</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-[11px] text-blue-400 space-y-1.5 max-h-[180px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <span className="text-gray-600">[idle] Awaiting pipeline signals...</span>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className="leading-relaxed border-l border-blue-500/20 pl-2">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. EXPERIMENTS TRACKER */}
          {activePanel === "experiments" && (
            <motion.div
              key="panel-experiments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4"
            >
              <div>
                <h3 className="font-sans font-semibold text-base text-gray-200">Experiment Tracker</h3>
                <p className="text-xs text-gray-500 mt-1">Audit reproducible training trails, parameter sweeps, and scores.</p>
              </div>

              <div className="space-y-3">
                {experiments.length === 0 ? (
                  <div className="text-center py-10">
                    <History className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-sans">No recorded runs in ML tracking registry.</p>
                  </div>
                ) : (
                  experiments.map(exp => (
                    <div key={exp.experimentId} className="border border-slate-800/80 bg-slate-950/30 rounded-xl p-4 text-xs space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-gray-200 text-sm">{exp.name}</span>
                          <span className="bg-slate-800 border border-slate-700 text-gray-400 font-mono text-[9px] px-1.5 py-0.2 rounded">
                            {exp.experimentId}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-500">{new Date(exp.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-3 rounded-lg border border-slate-900">
                        <div>
                          <h5 className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Hyperparameters</h5>
                          <div className="space-y-1 font-mono text-[11px] text-blue-400">
                            <div>learningRate: {exp.hyperparameters.learningRate || "N/A"}</div>
                            <div>maxDepth: {exp.hyperparameters.maxDepth || "N/A"}</div>
                            <div>randomSeed: {exp.randomSeed}</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Holdout Metrics</h5>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                            <div>Accuracy: <span className="text-gray-300 font-bold">{((exp.metrics.accuracy || 0) * 100).toFixed(1)}%</span></div>
                            <div>Log Loss: <span className="text-gray-300 font-bold">{(exp.metrics.logLoss || 0.69).toFixed(3)}</span></div>
                            <div>Brier: <span className="text-gray-300 font-bold">{(exp.metrics.brierScore || 0.25).toFixed(3)}</span></div>
                            <div>ECE: <span className="text-gray-300 font-bold">{(exp.metrics.ece || 0.05).toFixed(4)}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400 flex items-center justify-between font-sans">
                        <span>Notes: "{exp.notes}"</span>
                        <span className="text-gray-500 font-mono">Duration: {exp.durationMs}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* 6. DRIFT MONITORING */}
          {activePanel === "drift" && (
            <motion.div
              key="panel-drift"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-sans font-semibold text-base text-gray-200">Data & Model Drift Dashboard</h3>
                    <p className="text-xs text-gray-500 mt-1">Real-time alerts tracking feature, target, concept, and market shifts.</p>
                  </div>
                  <span className="bg-blue-900/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] px-2 py-0.5 rounded">
                    PSI ANALYSIS
                  </span>
                </div>

                {driftReport && (
                  <div className="space-y-5">
                    {/* ALERT BOXES */}
                    <div className="space-y-2">
                      {driftReport.alerts.map((alert, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 p-3 rounded bg-amber-950/20 border border-amber-900/40 text-amber-400 text-xs">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="font-mono leading-relaxed">{alert}</span>
                        </div>
                      ))}
                    </div>

                    {/* DETAILED TABLES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* FEATURE DRIFT TABLE */}
                      <div className="border border-slate-800 rounded-lg p-4 space-y-3 bg-slate-950/40">
                        <h4 className="font-sans font-semibold text-xs text-gray-400">FEATURE DISTRIBUTION DRIFT (PSI)</h4>
                        <div className="space-y-2 text-xs font-mono">
                          {Object.keys(driftReport.featureDrift).map(featId => {
                            const info = driftReport.featureDrift[featId];
                            const isCritical = info.status === "critical";
                            return (
                              <div key={featId} className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-slate-900">
                                <div>
                                  <div className="font-bold text-gray-300">{featId}</div>
                                  <div className="text-[10px] text-gray-500">Baseline mean: {info.baselineMean.toFixed(1)} | Current: {info.currentMean.toFixed(1)}</div>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isCritical ? "bg-red-950/50 text-red-400 border border-red-900/30" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30"
                                }`}>
                                  {info.status.toUpperCase()} ({info.driftScore.toFixed(3)})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* OTHER DRIFTS (TARGET, CONCEPT, PREDICTION) */}
                      <div className="border border-slate-800 rounded-lg p-4 space-y-3 bg-slate-950/40">
                        <h4 className="font-sans font-semibold text-xs text-gray-400">DOWNSTREAM PERFORMANCE DRIFTS</h4>
                        <div className="space-y-3 text-xs font-mono">
                          {[
                            { label: "Target Label Drift", m: driftReport.targetDrift },
                            { label: "Prediction Score Drift", m: driftReport.predictionDrift },
                            { label: "Concept Accuracy Drift", m: driftReport.conceptDrift },
                            { label: "Calibration ECE Drift", m: driftReport.calibrationDrift }
                          ].map((item, idx) => {
                            const isCritical = item.m.status === "critical";
                            return (
                              <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/40 border border-slate-900">
                                <div>
                                  <div className="font-bold text-gray-300">{item.label}</div>
                                  <div className="text-[10px] text-gray-500">Method: {item.m.testUsed} | Shift: {item.m.driftScore.toFixed(4)}</div>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  isCritical ? "bg-red-950/50 text-red-400 border border-red-900/30" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30"
                                }`}>
                                  {item.m.status.toUpperCase()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 7. EXPLAINABLE INFERENCE */}
          {activePanel === "inference" && (
            <motion.div
              key="panel-inference"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="font-sans font-semibold text-base text-gray-200 mb-2">Explainable Inference Sandbox</h3>
                <p className="text-xs text-gray-500 mb-5">Select a model family and input an entity ID to view prediction confidence, local SHAP attributions, and structural documentation.</p>

                <form onSubmit={handleRunInference} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">SELECT REGISTERED MODEL</label>
                    <select
                      id="inf-form-model"
                      value={infModelId}
                      onChange={e => setInfModelId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 focus:border-blue-500 outline-none"
                    >
                      {models.map(m => (
                        <option key={m.modelId} value={m.modelId}>
                          {m.modelId} (v{m.version}) [{m.championStatus.toUpperCase()}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-mono mb-1">ENTITY ID (FIXTURE OR TEAM)</label>
                    <input
                      id="inf-form-entity"
                      type="text"
                      value={infEntityId}
                      onChange={e => setInfEntityId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-gray-200 font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      id="inf-form-submit"
                      type="submit"
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 font-sans font-bold text-xs rounded text-white transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      GENERATE EXPLAINED PREDICTION
                    </button>
                  </div>
                </form>

                {/* INFERENCE OUTPUT PANEL */}
                {infResponse && (
                  <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-4">
                      <div>
                        <h4 className="font-mono text-xs text-gray-400">PREDICTION ID: {infResponse.predictionId}</h4>
                        <p className="font-mono text-[10px] text-gray-500">Model: {infResponse.modelId} • Timestamp: {new Date(infResponse.timestamp).toLocaleString()}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block font-mono">CALIBRATED PROBABILITY</span>
                        <span className="text-xl font-bold font-mono text-blue-400">{(infResponse.probability * 100).toFixed(2)}%</span>
                      </div>
                    </div>

                    {/* TEXT EXPLANATIONS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded bg-slate-900/60 border border-slate-900 space-y-1.5">
                        <div className="font-semibold text-gray-300 uppercase tracking-wider text-[9px] font-mono text-gray-500">Prediction Rationale</div>
                        <p className="text-gray-300 leading-relaxed font-sans">{infResponse.explanation.predictionExplanation}</p>
                      </div>

                      <div className="p-3 rounded bg-slate-900/60 border border-slate-900 space-y-1.5">
                        <div className="font-semibold text-gray-300 uppercase tracking-wider text-[9px] font-mono text-gray-500">Confidence Audit</div>
                        <p className="text-gray-300 leading-relaxed font-sans">{infResponse.explanation.confidenceExplanation}</p>
                      </div>
                    </div>

                    {/* SHAP ATTRIBUTION CHART */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Local SHAP Feature Attributions</h5>
                      <div className="space-y-2 text-xs font-mono">
                        {Object.keys(infResponse.explanation.shapValues).map(featId => {
                          const val = infResponse.explanation.shapValues[featId];
                          const isPositive = val >= 0;
                          const pctWidth = Math.min(100, Math.abs(val) * 300); // Scale for visual representation
                          return (
                            <div key={featId} className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 p-2 rounded bg-slate-900/30 border border-slate-900/50">
                              <span className="font-bold text-gray-300 text-[11px] truncate md:col-span-1">{featId}</span>
                              <div className="md:col-span-2 flex items-center">
                                {/* NEGATIVE BAR */}
                                <div className="w-1/2 flex justify-end pr-1">
                                  {!isPositive && (
                                    <div 
                                      className="h-2 bg-red-500 rounded-l" 
                                      style={{ width: `${pctWidth}%` }}
                                    ></div>
                                  )}
                                </div>
                                <div className="w-1 h-3 bg-slate-700"></div>
                                {/* POSITIVE BAR */}
                                <div className="w-1/2 flex justify-start pl-1">
                                  {isPositive && (
                                    <div 
                                      className="h-2 bg-emerald-500 rounded-r" 
                                      style={{ width: `${pctWidth}%` }}
                                    ></div>
                                  )}
                                </div>
                              </div>
                              <span className={`text-right font-bold md:col-span-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                {isPositive ? "+" : ""}{val.toFixed(4)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
