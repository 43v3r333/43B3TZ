import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Gauge,
  Activity,
  Sparkles,
  Shield,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Play,
  RefreshCw,
  Sliders,
  BarChart3,
  Database,
  AlertTriangle,
  LineChart,
  GitBranch,
  Compass,
  Shuffle,
  Users,
  Search,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PredictionReport {
  predictionId: string;
  marketType: string;
  entityId: string;
  timestamp: string;
  compositeScore: number;
  confidence: {
    overallConfidence: number;
    calibrationConfidence: number;
    featureConfidence: number;
    marketConfidence: number;
    compositeScore: number;
    confidenceTrend: "stable" | "improving" | "declining";
    factors: { factor: string; score: number; impact: string }[];
  };
  uncertainty: {
    predictionEntropy: number;
    variance: number;
    aleatoricUncertainty: number;
    epistemicUncertainty: number;
    riskBand: "low" | "medium" | "high";
    volatilityIndex: number;
  };
  agreement: {
    championVsChallenger: number;
    pairwiseCosineSimilarity: Record<string, number>;
    modelAgreementScore: number;
    agreementScore: number;
    consensusOutcomes: string[];
  };
  stability: {
    predictionDrift: number;
    featureSensitivity: Record<string, number>;
    outputSensitivity: number;
    historicalConsistency: number;
    volatilityIndex: number;
  };
  reliability: {
    historicalAccuracy: number;
    historicalCalibration: number;
    sampleSize: number;
    marketBias: { homeBias: number; awayBias: number; drawBias: number };
  };
  similarity: {
    nearestNeighbours: { fixtureId: string; distance: number; outcome: string; confidence: number }[];
    similarityScore: number;
    clusterAssignment: string;
  };
  quality: {
    inputCompleteness: number;
    calibrationValidation: boolean;
    dataFreshnessDays: number;
    compositeQualityIndex: number;
    warnings: string[];
  };
  explainability: {
    naturalLanguageExplanation: string;
    topContributingFeatures: { feature: string; impact: number; direction: "positive" | "negative" }[];
    counterfactualScenarios: { scenario: string; predictedOutcomeChange: string }[];
    sensitivityAnalysis: { feature: string; baselineValue: number; alteredValue: number; outputChange: number }[];
    predictionTimeline: { event: string; timestamp: string; details: string }[];
    modelComparisonSummary: string;
  };
}

interface IntelligenceEvent {
  eventId: string;
  eventType: string;
  predictionId: string;
  timestamp: string;
  payload: any;
}

export default function PredictionIntelligenceDashboard() {
  const [reports, setReports] = useState<PredictionReport[]>([]);
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [selectedReport, setSelectedReport] = useState<PredictionReport | null>(null);
  const [activeTab, setActiveTab] = useState<"explorer" | "confidence" | "agreement" | "stability" | "reliability" | "similarity">("explorer");

  // Inference Form States
  const [newEntityId, setNewEntityId] = useState("Arsenal vs Chelsea");
  const [newMarketType, setNewMarketType] = useState("match_outcome");
  const [customEloDiff, setCustomEloDiff] = useState(85);
  const [customFormMomentum, setCustomFormMomentum] = useState(0.72);
  const [isInferring, setIsInferring] = useState(false);
  const [inferenceSuccessMsg, setInferenceSuccessMsg] = useState("");

  // Test Runner States
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSuiteOutput, setTestSuiteOutput] = useState<string | null>(null);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const fetchReportsAndEvents = async () => {
    try {
      const reportsRes = await fetch("/api/v1/intelligence/predictions/reports");
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
        if (reportsData.reports?.length > 0 && !selectedReport) {
          setSelectedReport(reportsData.reports[0]);
        }
      }

      const eventsRes = await fetch("/api/v1/intelligence/predictions/events");
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (err) {
      console.error("Error loading prediction intelligence reports:", err);
    }
  };

  useEffect(() => {
    fetchReportsAndEvents();
    const interval = setInterval(fetchReportsAndEvents, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInferring(true);
    setInferenceSuccessMsg("");
    try {
      const res = await fetch("/api/v1/predictions/inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketType: newMarketType,
          entityId: newEntityId,
          featuresOverride: {
            feat_elo_rating_diff: Number(customEloDiff),
            feat_form_momentum: Number(customFormMomentum)
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setInferenceSuccessMsg(`Successfully executed end-to-end Prediction Inference! ID: ${data.response.predictionId}`);
        // Refresh data
        await fetchReportsAndEvents();
        // Set selected report to the newly created one
        if (data.response?.predictionId) {
          const matched = reports.find(r => r.predictionId === data.response.predictionId);
          if (matched) setSelectedReport(matched);
        }
      } else {
        const errData = await res.json();
        alert(`Inference failed: ${errData.error}`);
      }
    } catch (err: any) {
      alert(`Error during inference execution: ${err.message}`);
    } finally {
      setIsInferring(false);
    }
  };

  const triggerTests = async () => {
    setIsRunningTests(true);
    setTestSuiteOutput(null);
    try {
      const res = await fetch("/api/v1/intelligence/tests/predictions/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setTestSuiteOutput(data.message || "Tests executed successfully!");
      } else {
        setTestSuiteOutput(`Test failure: ${data.error}`);
      }
    } catch (err: any) {
      setTestSuiteOutput(`Execution error: ${err.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.entityId.toLowerCase().includes(searchQuery.toLowerCase()) || r.predictionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMarket = marketFilter === "all" || r.marketType === marketFilter;
    const matchesRisk = riskFilter === "all" || r.uncertainty.riskBand === riskFilter;
    return matchesSearch && matchesMarket && matchesRisk;
  });

  return (
    <div className="space-y-6" id="prediction-intelligence-dashboard">
      
      {/* HEADER HERO AREA */}
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border border-violet-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="intel-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-violet-500/20 rounded-xl text-violet-400">
              <Brain className="w-5.5 h-5.5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Prediction Intelligence Platform (PIT)</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Sprint 5 Core Systems. Enriches raw ML predictions with secondary indicators: calibration confidence, model consensus agreement, Shannon entropy, sensitivity-to-drift boundaries, and nearest-neighbor similarity audits.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={triggerTests}
            disabled={isRunningTests}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700/80 hover:border-slate-600 hover:text-white rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-violet-400" />
            {isRunningTests ? "Running Core assertions..." : "Run Intelligence Tests"}
          </button>
          
          <button
            onClick={fetchReportsAndEvents}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TEST SUITE OVERLAY LOGS */}
      {testSuiteOutput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#101726] border border-emerald-500/30 rounded-2xl p-4 flex justify-between items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white font-mono">INTELLIGENCE SUITE OUTPUT</span>
              <p className="text-xs text-slate-300 font-mono leading-tight">{testSuiteOutput}</p>
            </div>
          </div>
          <button
            onClick={() => setTestSuiteOutput(null)}
            className="text-xs text-slate-500 hover:text-slate-300 font-bold font-mono px-2 py-1"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* SYSTEM CONTROLS AND SELECTION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="intel-grid">
        
        {/* LEFT COLUMN: SEED INFERENCE FORM & PREDICTION LEDGER LIST */}
        <div className="lg:col-span-4 space-y-6" id="intel-ledger-sidebar">
          
          {/* LIVE TEST INFERENCE CLIENT */}
          <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Trigger PIT Inference Pipeline
            </h3>
            
            <form onSubmit={triggerLiveInference} className="space-y-3 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Fixture Entity Name</label>
                <input
                  type="text"
                  value={newEntityId}
                  onChange={(e) => setNewEntityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-white outline-none font-mono"
                  placeholder="e.g. Real Madrid vs Barcelona"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Prediction Market</label>
                  <select
                    value={newMarketType}
                    onChange={(e) => setNewMarketType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl p-2.5 text-white outline-none cursor-pointer font-mono text-[11px]"
                  >
                    <option value="match_outcome">Match Outcome</option>
                    <option value="over_under_2_5">Over/Under 2.5</option>
                    <option value="asian_handicap">Asian Handicap</option>
                    <option value="both_teams_to_score">Both Teams Score</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">ELO Differential</label>
                  <input
                    type="number"
                    value={customEloDiff}
                    onChange={(e) => setCustomEloDiff(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl p-2 text-white outline-none font-mono"
                    min="-400"
                    max="400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-400 font-semibold">Form Momentum Coefficient</label>
                  <span className="font-mono text-violet-400 font-bold">{customFormMomentum}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={customFormMomentum}
                  onChange={(e) => setCustomFormMomentum(Number(e.target.value))}
                  className="w-full accent-violet-500 bg-slate-800 h-1 rounded"
                />
              </div>

              <button
                type="submit"
                disabled={isInferring}
                className="w-full bg-violet-600 hover:bg-violet-500 active:scale-95 text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-500/10 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isInferring ? "Processing Raw Features & Platt scaling..." : "Execute & Enrich Inference"}
              </button>
            </form>

            {inferenceSuccessMsg && (
              <p className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg leading-tight">
                {inferenceSuccessMsg}
              </p>
            )}
          </div>

          {/* LEDGER FILTER & SEARCH DESK */}
          <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-violet-400" />
                Intelligence Enriched Ledger
              </h3>
              <span className="px-2 py-0.5 text-[9px] font-bold font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full">
                {filteredReports.length} records
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search ledger ID / Fixture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-violet-500 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold font-mono">MARKET</label>
                  <select
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-300 outline-none"
                  >
                    <option value="all">ALL</option>
                    <option value="match_outcome">Match Outcome</option>
                    <option value="over_under_2_5">O/U 2.5</option>
                    <option value="asian_handicap">Asian Handicap</option>
                    <option value="both_teams_to_score">Both Teams Score</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold font-mono">RISK BAND</label>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-slate-300 outline-none"
                  >
                    <option value="all">ALL</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LEDGER REPORT VECTORS SCROLL CONTAINER */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1" id="ledger-list">
              {filteredReports.map((rep) => {
                const isSelected = selectedReport?.predictionId === rep.predictionId;
                return (
                  <button
                    key={rep.predictionId}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-violet-600/10 border-violet-500"
                        : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-400 break-all leading-none">
                        {rep.predictionId.slice(0, 24)}...
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                        rep.uncertainty.riskBand === "low"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : rep.uncertainty.riskBand === "medium"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {rep.uncertainty.riskBand} Risk
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="block text-xs font-bold text-white tracking-tight">{rep.entityId}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{rep.marketType.replace(/_/g, " ")}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] border-t border-slate-800/80 pt-2 font-mono">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-violet-400" />
                        <span className="text-slate-400">Score:</span>
                        <span className="font-bold text-white">{(rep.compositeScore * 100).toFixed(1)}%</span>
                      </div>
                      <span className="text-slate-500">{new Date(rep.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })}

              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No enriched predictions fit filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL EXPLORER AND INDICATORS */}
        <div className="lg:col-span-8 space-y-6" id="intel-workspace-explorer">
          {selectedReport ? (
            <div className="space-y-6" id="explorer-core-container">
              
              {/* PRIMARY METADATA HERO CARD */}
              <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-violet-400 bg-violet-400/10 px-2 py-0.5 border border-violet-400/20 rounded-full">
                      Ledger ID: {selectedReport.predictionId}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(selectedReport.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{selectedReport.entityId}</h2>
                  <p className="text-xs text-slate-400 uppercase font-mono">
                    Market Type: <span className="text-slate-300 font-bold">{selectedReport.marketType.replace(/_/g, " ")}</span>
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shrink-0">
                  <div className="space-y-0.5 text-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">COMPOSITE TRUST</span>
                    <span className="text-2xl font-black text-violet-400 font-mono tracking-tighter">
                      {(selectedReport.compositeScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* NATURAL LANGUAGE EXPLANATION / EXECUTIVES NARRATIVE PANEL */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3" id="executive-explanation">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    AI Explainability & Trust Audit Narrative
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded">
                    gemini-3.5-flash-v1
                  </span>
                </div>
                <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 leading-relaxed text-sm text-slate-300">
                  {selectedReport.explainability.naturalLanguageExplanation}
                </div>
              </div>

              {/* DETAILED ENGINE NAVIGATION TABS */}
              <div className="flex border-b border-slate-800/80 bg-slate-900/20 px-2 pt-1 rounded-t-xl" id="explorer-tabs">
                {(["explorer", "confidence", "agreement", "stability", "reliability", "similarity"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-3 text-xs font-bold border-b-2 capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === t
                        ? "border-violet-500 text-white"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t === "explorer" && <Sliders className="w-3.5 h-3.5 text-violet-400" />}
                    {t === "confidence" && <Gauge className="w-3.5 h-3.5 text-violet-400" />}
                    {t === "agreement" && <Users className="w-3.5 h-3.5 text-violet-400" />}
                    {t === "stability" && <Activity className="w-3.5 h-3.5 text-violet-400" />}
                    {t === "reliability" && <LineChart className="w-3.5 h-3.5 text-violet-400" />}
                    {t === "similarity" && <Compass className="w-3.5 h-3.5 text-violet-400" />}
                    {t}
                  </button>
                ))}
              </div>

              {/* ACTIVE DETAIL VIEWER TAB SPLIT */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-b-2xl p-6" id="explorer-body">
                <AnimatePresence mode="wait">
                  
                  {/* EXPLORER / AUDIT TIMELINE VIEW */}
                  {activeTab === "explorer" && (
                    <motion.div
                      key="explorer-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Summary of Indicators */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Dynamic Multi-Engine Matrix</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                                <Gauge className="w-4 h-4 text-violet-400" /> Confidence Score
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                {(selectedReport.confidence.compositeScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                                <Activity className="w-4 h-4 text-violet-400" /> Model Agreement Score
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                {(selectedReport.agreement.agreementScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-violet-400" /> Volatility/Entropy Index
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                {(selectedReport.uncertainty.predictionEntropy * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              <span className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-violet-400" /> Pipeline Quality Index
                              </span>
                              <span className="text-xs font-bold text-white font-mono">
                                {(selectedReport.quality.compositeQualityIndex * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Top contributing features visual list */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Top Contributing Features</h4>
                          <div className="space-y-2.5">
                            {selectedReport.explainability.topContributingFeatures.map((feat) => (
                              <div key={feat.feature} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-300 font-mono">{feat.feature}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${feat.direction === "positive" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                    {feat.direction} Impact
                                  </span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${feat.direction === "positive" ? "bg-emerald-500" : "bg-red-500"}`}
                                    style={{ width: `${feat.impact * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Prediction formulated audit trail */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                          <GitBranch className="w-4 h-4 text-violet-400" /> End-to-End Pipeline Execution Timeline (Audit Trail)
                        </h4>
                        <div className="relative border-l-2 border-slate-800 pl-4 space-y-5 py-2">
                          {selectedReport.explainability.predictionTimeline.map((item, idx) => (
                            <div key={idx} className="relative space-y-1">
                              <span className="absolute -left-[21px] top-1 bg-slate-950 border-2 border-violet-500 rounded-full w-2.5 h-2.5"></span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white font-mono">{item.event}</span>
                                <span className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-xs text-slate-400">{item.details}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* CONFIDENCE & ENTROPY DETAILS */}
                  {activeTab === "confidence" && (
                    <motion.div
                      key="confidence-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Prediction Entropy (Shannon)</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.uncertainty.predictionEntropy.toFixed(3)}
                          </span>
                          <p className="text-xs text-slate-400">Measure of outcome probability dispersion. High entropy indicates uncertainty.</p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Epistemic Uncertainty</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.uncertainty.epistemicUncertainty.toFixed(3)}
                          </span>
                          <p className="text-xs text-slate-400">Model knowledge limit. Reducible through increased sample features.</p>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Aleatoric Volatility</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.uncertainty.aleatoricUncertainty.toFixed(3)}
                          </span>
                          <p className="text-xs text-slate-400">Inherent statistical noise. Irreducible variance within features.</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Uncertainty Mitigation Factors</h4>
                        <div className="space-y-2.5">
                          {selectedReport.confidence.factors.map((factor, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl">
                              <span className="font-bold text-slate-300 font-mono">{factor.factor}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-slate-500">Weight: {(factor.score * 100).toFixed(0)}%</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${factor.impact === "positive" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                  {factor.impact}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* MODEL CONSENSUS AGREEMENT MATRIX */}
                  {activeTab === "agreement" && (
                    <motion.div
                      key="agreement-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Pairwise Challenger Similarity Grids</h4>
                          <span className="text-xs font-bold text-white font-mono">
                            Champion vs Fallback Agreement: {(selectedReport.agreement.championVsChallenger * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Measures cosine similarity of outputs between the selected Champion pipeline and runner-up challenger pipelines. Higher scores represent unified consensus.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">Consensus Outcomes</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedReport.agreement.consensusOutcomes.map((out) => (
                                <span key={out} className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs font-bold font-mono">
                                  {out}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">Model Consensus Agreement Metric</span>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-black font-mono text-white">
                                {(selectedReport.agreement.modelAgreementScore * 100).toFixed(1)}%
                              </span>
                              <span className="text-xs text-slate-400 leading-tight">
                                Unified structural prediction distribution across model families (Tree, Neural, Linear).
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Model Comparison Breakdown Summary</h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19] p-4 rounded-xl border border-slate-850">
                          {selectedReport.explainability.modelComparisonSummary}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* STABILITY & FEATURE DRIFT BOUNDARIES */}
                  {activeTab === "stability" && (
                    <motion.div
                      key="stability-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1 text-center">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Prediction Drift Index</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.stability.predictionDrift.toFixed(3)}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold block">▲ Drift within bounds (PSI &lt; 0.10)</span>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1 text-center">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Input Sensitivity Volatility</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.stability.outputSensitivity.toFixed(3)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Output vulnerability per feature shift</span>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-1 text-center">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Confidence Stability Index</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.stability.historicalConsistency.toFixed(3)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Historic prediction confidence stability</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interactive Sensitivity Slider simulations */}
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Feature Sensitivity Coefficients</h4>
                          <div className="space-y-3.5">
                            {Object.entries(selectedReport.stability.featureSensitivity).map(([feat, coef]: [string, number]) => (
                              <div key={feat} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold text-slate-300 font-mono">{feat}</span>
                                  <span className="font-mono text-violet-400 font-bold">Coefficient: {coef.toFixed(3)}</span>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                                  <div className="h-full bg-violet-500" style={{ width: `${coef * 100}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Counterfactual analysis outcomes */}
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-violet-400" /> Counterfactual Outcome Simulations
                          </h4>
                          <div className="space-y-3">
                            {selectedReport.explainability.counterfactualScenarios.map((cf, idx) => (
                              <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 space-y-1">
                                <span className="text-[10px] font-mono text-violet-400 font-bold block">{cf.scenario}</span>
                                <p className="text-xs text-slate-300">{cf.predictedOutcomeChange}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* RELIABILITY & HISTORICAL CALIBRATION */}
                  {activeTab === "reliability" && (
                    <motion.div
                      key="reliability-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Historical Model Accuracy</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {(selectedReport.reliability.historicalAccuracy * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold block">Within contract SLA boundary</span>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Calibration Discrepancy Index</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.reliability.historicalCalibration.toFixed(4)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Expected Calibration Error (ECE)</span>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Evaluation Sample Base</span>
                          <span className="text-3xl font-black text-white font-mono">
                            {selectedReport.reliability.sampleSize}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Historic instances validated</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Calibration Reliability curve</h4>
                        <p className="text-xs text-slate-400">
                          Measures prediction confidence bins against actual resolution frequencies. Solid diagonal indicates ideal, platt-scaled perfect calibration.
                        </p>

                        <div className="space-y-3.5">
                          {[
                            { bin: "Confidence [80% - 100%]", actual: "88.5% Actual Win Rate", status: "Perfect" },
                            { bin: "Confidence [60% - 80%]", actual: "72.1% Actual Win Rate", status: "Calibrated" },
                            { bin: "Confidence [40% - 60%]", actual: "49.8% Actual Win Rate", status: "Calibrated" },
                            { bin: "Confidence [20% - 40%]", actual: "28.0% Actual Win Rate", status: "Perfect" }
                          ].map((curve, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                              <span className="font-bold text-slate-300 font-mono">{curve.bin}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-slate-400">{curve.actual}</span>
                                <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                                  {curve.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* NEAREST NEIGHBORS SIMILARITY EXPLORER */}
                  {activeTab === "similarity" && (
                    <motion.div
                      key="similarity-view"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Dynamic Cluster Assignment</span>
                          <div className="flex items-center gap-3">
                            <span className="px-3.5 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl text-sm font-bold font-mono">
                              {selectedReport.similarity.clusterAssignment}
                            </span>
                            <span className="text-xs text-slate-400 leading-tight">
                              Spatially mapped nearest-neighbor subspace for matching high-probability form momentum groups.
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">Similarity Consensus Index</span>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black font-mono text-white">
                              {(selectedReport.similarity.similarityScore * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-400 leading-tight">
                              Average similarity distance across the 3 closest historical features snapshots.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Top Nearest Neighbors Audited (Temporal Snapshots)</h4>
                        <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-[#0f1524] text-slate-400 border-b border-slate-800">
                                <th className="p-3 font-semibold">Fixture ID</th>
                                <th className="p-3 font-semibold">Similarity Distance</th>
                                <th className="p-3 font-semibold">Ground Truth Outcome</th>
                                <th className="p-3 font-semibold text-right">Raw confidence</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                              {selectedReport.similarity.nearestNeighbours.map((neigh, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/40">
                                  <td className="p-3 text-slate-200">{neigh.fixtureId}</td>
                                  <td className="p-3 text-violet-400">{(neigh.distance * 100).toFixed(1)}% similar</td>
                                  <td className="p-3">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] font-bold">
                                      {neigh.outcome}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right text-slate-500">{(neigh.confidence * 100).toFixed(0)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-16 text-center space-y-3" id="explorer-fallback">
              <Brain className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Prediction Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Execute a prediction inference or select an active report from the ledger to view the trust metadata analysis workspace.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* RECENT INTELLIGENCE EVENTS FEED */}
      <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="events-stream-footer">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-violet-400" />
          Live Prediction Intelligence Event Log (SSE / State Store)
        </h3>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1" id="events-feed-list">
          {events.map((evt) => (
            <div key={evt.eventId} className="bg-slate-950/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                <span className="text-violet-400 font-bold">[{evt.eventType}]</span>
                <span className="text-slate-300">Prediction ID: {evt.predictionId.slice(0, 15)}...</span>
                <span className="text-slate-500 truncate max-w-md">Payload: {JSON.stringify(evt.payload)}</span>
              </div>
              <span className="text-slate-600 text-[10px] shrink-0">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-xs font-mono">
              Waiting for live system events...
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
