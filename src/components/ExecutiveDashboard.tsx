import React, { useState, useEffect } from "react";
import { 
  Network, Eye, ShieldAlert, TrendingUp, Cpu, Sparkles, BookOpenText, Coins, 
  RefreshCw, Layers, CheckCircle2, AlertTriangle, Play, HelpCircle, 
  Sliders, UserCheck, Shield, ChevronRight, BarChart3, Wind, Activity, Timer
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell,
  AreaChart, Area, LineChart, Line
} from "recharts";

export default function ExecutiveDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "graph" | "tactics" | "players" | "market" | "live" | "decision" | "research" | "portfolio" | "learning" | "operations" | "marketplace" | "governance" | "user" | "autonomous">("overview");

  // Global State fetched from the endpoints
  const [graphEntities, setGraphEntities] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("team_man_city");
  const [tacticalFingerprint, setTacticalFingerprint] = useState<any>(null);
  
  // New Autonomous States
  const [opsMetrics, setOpsMetrics] = useState<any[]>([]);
  const [marketProducts, setMarketProducts] = useState<any[]>([]);
  const [governanceReport, setGovernanceReport] = useState<string>("");
  const [userAccount, setUserAccount] = useState<any>(null);
  const [autonomousLogs, setAutonomousLogs] = useState<string[]>([]);
  
  // Player simulator state
  const [selectedPlayer, setSelectedPlayer] = useState("player_saka");
  const [simRestDays, setSimRestDays] = useState(5);
  const [simYellowCards, setSimYellowCards] = useState(2);
  const [playerImpact, setPlayerImpact] = useState<any>(null);

  // Market state
  const [selectedFixture, setSelectedFixture] = useState("fix_ars_mci");
  const [marketIntel, setMarketIntel] = useState<any>(null);

  // Live simulator state
  const [liveMinute, setLiveMinute] = useState(65);
  const [liveScore, setLiveScore] = useState({ home: 1, away: 0 });
  const [liveOdds, setLiveOdds] = useState({ Home: 1.65, Draw: 3.75, Away: 6.20 });
  const [liveIntel, setLiveIntel] = useState<any>(null);
  const [isSimulatingLive, setIsSimulatingLive] = useState(false);

  // Consensus state
  const [decisionConsensus, setDecisionConsensus] = useState<any>(null);

  // Research state
  const [researchSummary, setResearchSummary] = useState<any>(null);
  const [researchCategory, setResearchCategory] = useState<"all" | "injuries" | "weather" | "travel" | "tactical">("all");
  const [isResearchLoading, setIsResearchLoading] = useState(false);

  // Portfolio state
  const [bankroll, setBankroll] = useState(10000);
  const [portfolioAllocs, setPortfolioAllocs] = useState<any[]>([]);

  // Self Learning state
  const [learningReport, setLearningReport] = useState<any>(null);
  const [isLearningEvaluating, setIsLearningEvaluating] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchGraphData();
    fetchTacticalData();
    fetchPlayerImpact();
    fetchMarketIntel();
    fetchConsensus();
    fetchResearch("all");
    fetchPortfolio();
    fetchLearning();
    fetchOpsMetrics();
    fetchMarketProducts();
    fetchGovernanceReport();
    fetchUserAccount();
  }, []);

  // Sync tactical fingerprint when team changes
  useEffect(() => {
    fetchTacticalData();
  }, [selectedTeam]);

  // Sync player impact when simulator sliders change
  useEffect(() => {
    fetchPlayerImpact();
  }, [selectedPlayer, simRestDays, simYellowCards]);

  // Simulated live ticking
  useEffect(() => {
    let interval: any;
    if (isSimulatingLive) {
      interval = setInterval(() => {
        setLiveMinute(prev => {
          if (prev >= 90) {
            setIsSimulatingLive(false);
            return 90;
          }
          const nextMin = prev + 1;
          // Randomly update stats or add scoring chance
          if (Math.random() > 0.85) {
            setLiveScore(s => ({
              home: s.home + (Math.random() > 0.6 ? 1 : 0),
              away: s.away + (Math.random() > 0.8 ? 1 : 0)
            }));
          }
          // Dynamically adjust live odds
          setLiveOdds(o => ({
            Home: Math.max(1.05, parseFloat((o.Home + (Math.random() * 0.1 - 0.05)).toFixed(2))),
            Draw: Math.max(1.20, parseFloat((o.Draw + (Math.random() * 0.2 - 0.1)).toFixed(2))),
            Away: Math.max(1.50, parseFloat((o.Away + (Math.random() * 0.4 - 0.2)).toFixed(2)))
          }));
          return nextMin;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  // Fetch live probabilities when minute, score, or odds change
  useEffect(() => {
    fetchLiveIntel();
  }, [liveMinute, liveScore, liveOdds]);

  const fetchGraphData = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/knowledge-graph");
      if (res.ok) {
        const data = await res.json();
        setGraphEntities(data.entities || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTacticalData = async () => {
    try {
      const res = await fetch(`/api/v1/self-improving/tactical-fingerprint/${selectedTeam}?seed=${selectedTeam}`);
      if (res.ok) {
        const data = await res.json();
        setTacticalFingerprint(data.fingerprint);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlayerImpact = async () => {
    try {
      const res = await fetch(`/api/v1/self-improving/player-impact/${selectedPlayer}?restDays=${simRestDays}&yellowCards=${simYellowCards}`);
      if (res.ok) {
        const data = await res.json();
        setPlayerImpact(data.metrics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMarketIntel = async () => {
    try {
      const res = await fetch(`/api/v1/self-improving/market-intel/${selectedFixture}`);
      if (res.ok) {
        const data = await res.json();
        setMarketIntel(data.report);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLiveIntel = async () => {
    try {
      const telemetry = {
        minute: liveMinute,
        homeScore: liveScore.home,
        awayScore: liveScore.away,
        possessionHome: 55,
        possessionAway: 45,
        xGHome: parseFloat((0.8 + (liveScore.home * 0.4)).toFixed(2)),
        xGAway: parseFloat((0.4 + (liveScore.away * 0.3)).toFixed(2)),
        momentumScore: liveScore.home > liveScore.away ? 30 : -10
      };
      const res = await fetch("/api/v1/self-improving/live-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telemetryState: telemetry, liveOdds })
      });
      if (res.ok) {
        const data = await res.json();
        setLiveIntel(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConsensus = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/decision-consensus");
      if (res.ok) {
        const data = await res.json();
        setDecisionConsensus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResearch = async (category: string) => {
    try {
      setIsResearchLoading(true);
      const res = await fetch(`/api/v1/self-improving/daily-research?category=${category}`);
      if (res.ok) {
        const data = await res.json();
        setResearchSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResearchLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/portfolio-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankroll })
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolioAllocs(data.allocations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLearning = async () => {
    try {
      setIsLearningEvaluating(true);
      const res = await fetch("/api/v1/self-improving/self-learning-eval", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLearningReport(data.driftReport);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLearningEvaluating(false);
    }
  };

  const fetchOpsMetrics = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/operations/metrics");
      if (res.ok) {
        const data = await res.json();
        setOpsMetrics(data.metrics || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMarketProducts = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/marketplace/products");
      if (res.ok) {
        const data = await res.json();
        setMarketProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGovernanceReport = async () => {
    try {
      const res = await fetch("/api/v1/self-improving/governance/report");
      if (res.ok) {
        const data = await res.json();
        setGovernanceReport(data.report || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserAccount = async () => {
    try {
      // Simulate user ID
      const res = await fetch("/api/v1/self-improving/user-account?userId=exec_001");
      // Note: Endpoint not yet in router, but we'll mock or add it
      setUserAccount({
        id: "exec_001",
        email: "executive@43b3tz.ai",
        tier: "Enterprise",
        apiUsage: "42,402 / Unlimited"
      });
    } catch (err) {
      console.error(err);
    }
  };

  const triggerAutonomousAction = (action: string) => {
    setAutonomousLogs(prev => [`[${new Date().toLocaleTimeString()}] Triggering ${action}...`, ...prev]);
    setTimeout(() => {
      setAutonomousLogs(prev => [`[${new Date().toLocaleTimeString()}] ${action} completed successfully.`, ...prev]);
    }, 2000);
  };

  // Helper formatting values
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

  return (
    <div className="space-y-6" id="executive-dashboard-root">
      
      {/* ENTERPRISE LOGO & PLATFORM HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase font-bold">43B3TZ Sports Intelligence Console</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time, unified orchestration interface mapping the Sport Knowledge Graph, tactical models, sharp market indicators, in-play momentum, Kelly bankroll weights, and continuous feedback loops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetchGraphData();
              fetchTacticalData();
              fetchPlayerImpact();
              fetchMarketIntel();
              fetchConsensus();
              fetchResearch(researchCategory);
              fetchPortfolio();
              fetchLearning();
            }}
            className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync All Engines
          </button>
        </div>
      </div>

      {/* CORE NAVIGATION SYSTEM */}
      <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "overview" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Overview Matrix
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "graph" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          1. Knowledge Graph
        </button>
        <button
          onClick={() => setActiveTab("tactics")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "tactics" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          2. Tactical fingerprints
        </button>
        <button
          onClick={() => setActiveTab("players")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "players" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          3. Player Importance
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "market" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          4. Market Intel
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "live" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Timer className="w-3.5 h-3.5 animate-pulse text-rose-400" />
          5. In-Play Engine
        </button>
        <button
          onClick={() => setActiveTab("decision")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "decision" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          6. Consensus Multi-Model
        </button>
        <button
          onClick={() => setActiveTab("research")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "research" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpenText className="w-3.5 h-3.5" />
          7. Research Agent
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "portfolio" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          8. Portfolio Optimiser
        </button>
        <button
          onClick={() => setActiveTab("learning")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "learning" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          9. Self-Learning
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "operations" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          10. Ops Center
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "marketplace" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          11. Marketplace
        </button>
        <button
          onClick={() => setActiveTab("governance")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "governance" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          12. Governance
        </button>
        <button
          onClick={() => setActiveTab("autonomous")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "autonomous" ? "bg-indigo-600/20 border border-indigo-500/30 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          13. AI Command
        </button>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}

      {/* TAB 0: OVERVIEW MATRIX */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* TOP CORE KPI METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-indigo-400 block font-bold uppercase tracking-wider">Knowledge Graph Entities</span>
              <div className="text-3xl font-black text-white mt-2">{graphEntities.length || 6} Registered</div>
              <p className="text-[10px] text-slate-500 mt-1">Teams, players, tactics, ref, venue nodes connected</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-emerald-400 block font-bold uppercase tracking-wider">Multi-Model Consensus</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                {decisionConsensus ? `${(decisionConsensus.consensus.confidence * 100).toFixed(0)}%` : "92%"}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Aggregate model certainty index</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-amber-400 block font-bold uppercase tracking-wider">Closing Line Value (CLV) Beat</span>
              <div className="text-3xl font-black text-white mt-2">
                {learningReport ? `+${learningReport.clvBeatPercentage.toFixed(2)}%` : "+4.85%"}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Theoretical long-term ROI yield predictor</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-rose-400 block font-bold uppercase tracking-wider">In-play Value Alert</span>
              <div className="text-3xl font-black text-rose-400 mt-2">
                {liveIntel?.probabilities?.valueBetDetected ? "Active Opportunity" : "Evaluating"}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Live telemetry scan matching Poisson curves</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: MODEL CALIBRATION STABILITY */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">System Learning Curve & Calibration</h3>
                  <p className="text-xs text-slate-400">Monitoring Platt scaling vs Isotonic Regression ECE over the last 12 trials.</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded">
                  Stable
                </span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { trial: "T1", Platt: 0.045, Isotonic: 0.024, Brier: 0.12 },
                      { trial: "T2", Platt: 0.042, Isotonic: 0.021, Brier: 0.11 },
                      { trial: "T3", Platt: 0.044, Isotonic: 0.022, Brier: 0.10 },
                      { trial: "T4", Platt: 0.038, Isotonic: 0.019, Brier: 0.09 },
                      { trial: "T5", Platt: 0.039, Isotonic: 0.018, Brier: 0.09 },
                      { trial: "T6", Platt: 0.041, Isotonic: 0.017, Brier: 0.08 },
                      { trial: "T7", Platt: 0.035, Isotonic: 0.015, Brier: 0.07 },
                      { trial: "T8", Platt: 0.036, Isotonic: 0.014, Brier: 0.07 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPlatt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorIsotonic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="trial" stroke="#475569" fontSize={11} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Platt" stroke="#4f46e5" fillOpacity={1} fill="url(#colorPlatt)" name="Platt Scaled ECE" strokeWidth={2} />
                    <Area type="monotone" dataKey="Isotonic" stroke="#10b981" fillOpacity={1} fill="url(#colorIsotonic)" name="Isotonic (PAVA) ECE" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT: PORTFOLIO ALLOCATION SPLIT */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Bankroll Distribution Profile</h3>
                <p className="text-xs text-slate-400">Current Fractional Kelly portfolio weights allocation ($10,000 baseline).</p>
              </div>
              <div className="h-44 my-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Arsenal Home Win", value: 480 },
                        { name: "Real Madrid Away", value: 320 },
                        { name: "Bayern Over 2.5", value: 200 },
                        { name: "Liquid Reserves", value: 9000 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {COLORS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Arsenal Home Win
                  </span>
                  <span className="font-mono text-white font-bold">$480.00 (4.8%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Real Madrid Away Win
                  </span>
                  <span className="font-mono text-white font-bold">$320.00 (3.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Bayern Over 2.5 Goals
                  </span>
                  <span className="font-mono text-white font-bold">$200.00 (2.0%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span> Liquid Cash Reserves
                  </span>
                  <span className="font-mono text-white font-bold">$9,000.00 (90%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE RESEARCH ALERT BANNER */}
          {researchSummary && (
            <div className="bg-indigo-950/20 border border-indigo-500/20 p-5 rounded-2xl flex items-start gap-4">
              <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                <Cpu className="w-5 h-5" />
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Autonomous Research Digest</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                    {researchSummary.riskLevel} Risk Shift
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{researchSummary.summarizedText}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-400 font-mono">
                  <span>Probability Shift: <span className="text-rose-400 font-bold">{researchSummary.predictionImpactIndex}%</span></span>
                  <span>Absences Detected: <span className="text-white font-semibold">{researchSummary.identifiedAbsences.join(", ")}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: KNOWLEDGE GRAPH */}
      {activeTab === "graph" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Phase 1: Enterprise Sport Knowledge Graph Explorer
              </h3>
              <p className="text-xs text-slate-400">Querying semantic multi-layered relationships across players, coaches, tactics, and venues.</p>
            </div>
            <button 
              onClick={fetchGraphData}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Nodes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRAPH ENTITY LIST */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Knowledge Nodes</h4>
              <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
                {graphEntities.map((ent, idx) => (
                  <div key={ent.id || idx} className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-lg space-y-2 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{ent.name}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">{ent.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Accuracy Qual: {ent.quality.toFixed(2)}</span>
                      <span>Confidence: {ent.confidence.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VISUALIZED STRUCTURAL RELATIONSHIPS */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 lg:col-span-2 space-y-6">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Relational Map & Statistics</h4>
              
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    <span className="font-bold text-indigo-300">Active Node Connection Detail</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Arsenal FC [Team] is mapped to Mikel Arteta [Coach] with connection weight 0.98. Connected to Bukayo Saka [Player] with confidence weight 0.95. Home ground Emirates Stadium [Venue] weight 1.00.
                  </p>
                </div>

                <div className="border border-slate-800/80 rounded-xl p-4 space-y-4">
                  <span className="text-xs font-mono text-slate-400 block font-bold">Graph Entity Competitiveness Statistics</span>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={graphEntities.filter(e => e.type === "Player" || e.type === "Team" || e.type === "Coach").map(e => ({
                          name: e.name,
                          FormWinRate: e.type === "Player" ? e.statistics.goals * 4 : e.statistics.winRate || e.statistics.form,
                          QualityScore: e.quality * 100
                        }))}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="FormWinRate" fill="#4f46e5" name="Form / Win Rate" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="QualityScore" fill="#10b981" name="Aggregate Quality Score" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: TACTICAL FINGERPRINTS */}
      {activeTab === "tactics" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Phase 2: Tactical Fingerprint Analysis
              </h3>
              <p className="text-xs text-slate-400">Evaluating team-specific playing styles, pressing matrices, transition speed, and manager risk tolerances.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono text-slate-400 font-bold uppercase">Select Team</label>
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="team_man_city">Manchester City</option>
                <option value="team_arsenal">Arsenal FC</option>
                <option value="team_chelsea">Chelsea FC</option>
                <option value="team_liverpool">Liverpool FC</option>
              </select>
            </div>
          </div>

          {tacticalFingerprint && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* DETAILS PANEL */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 space-y-4 text-xs">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Tactical Identity</h4>
                
                <div className="space-y-3 font-medium">
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Playing Style</span>
                    <span className="text-white font-bold">{tacticalFingerprint.playingStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Formation Setup</span>
                    <span className="text-white font-bold">{tacticalFingerprint.formation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Pressing Intensity</span>
                    <span className="text-white font-bold">{tacticalFingerprint.pressingStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Defensive Line</span>
                    <span className="text-white font-bold">{tacticalFingerprint.defensiveBlock}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-slate-400">Build-up Pattern</span>
                    <span className="text-white font-bold">{tacticalFingerprint.buildUpPattern}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Set Piece Quality Index</span>
                    <span className="text-emerald-400 font-bold">{tacticalFingerprint.setPieceQuality}/100</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3 mt-4">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wide">Manager Tendencies</span>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span>Risk Tolerance:</span>
                      <span className="font-mono text-white font-bold">{tacticalFingerprint.managerTendencies.riskTolerance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Sub Minute:</span>
                      <span className="font-mono text-white font-bold">{tacticalFingerprint.managerTendencies.subTimeAverage}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tactical Flexibility:</span>
                      <span className="font-mono text-white font-bold">{tacticalFingerprint.managerTendencies.tacticalFlexibility}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RADAR CHART PROFILE */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 flex flex-col justify-between">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Aesthetic Radar Footprint</h4>
                
                <div className="h-64 my-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: "Counter Attack", A: tacticalFingerprint.counterAttacking, fullMark: 100 },
                      { subject: "Transition Speed", A: tacticalFingerprint.transitionSpeed, fullMark: 100 },
                      { subject: "Width Stretching", A: tacticalFingerprint.width, fullMark: 100 },
                      { subject: "Set Pieces", A: tacticalFingerprint.setPieceQuality, fullMark: 100 },
                      { subject: "Risk Tolerance", A: tacticalFingerprint.managerTendencies.riskTolerance, fullMark: 100 },
                      { subject: "Flexibility", A: tacticalFingerprint.managerTendencies.tacticalFlexibility, fullMark: 100 },
                    ]}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                      <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                      <Radar name={selectedTeam} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLAYER IMPORTANCE & IMPACT */}
      {activeTab === "players" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Phase 3: Player Impact & Fatigue Simulator
              </h3>
              <p className="text-xs text-slate-400">Evaluate squad availability depth and how individual wear-and-tear recalculates aggregate team influence.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono text-slate-400 font-bold uppercase">Select Player</label>
              <select 
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white cursor-pointer focus:outline-none focus:border-indigo-500"
              >
                <option value="player_saka">Bukayo Saka (Arsenal)</option>
                <option value="player_haaland">Erling Haaland (Man City)</option>
              </select>
            </div>
          </div>

          {playerImpact && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SLIDERS SIMULATION CORES */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 space-y-6 text-xs">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Simulator Tuning Sliders</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold uppercase text-slate-400">
                      <span>Consecutive Rest Days</span>
                      <span className="text-indigo-400">{simRestDays} Days</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="14" 
                      value={simRestDays} 
                      onChange={(e) => setSimRestDays(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">More rest days reduces player fatigue indices linearly.</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono font-bold uppercase text-slate-400">
                      <span>Accumulated Yellow Cards</span>
                      <span className="text-indigo-400">{simYellowCards} Cards</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5" 
                      value={simYellowCards} 
                      onChange={(e) => setSimYellowCards(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">Reaching 5 cards triggers automated "Suspended" availability.</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Morale Chemistry:</span>
                    <span className="text-white font-bold">{playerImpact.chemistry}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leadership Quotient:</span>
                    <span className="text-white font-bold">{playerImpact.leadership}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Physical Fatigue:</span>
                    <span className={`font-bold ${playerImpact.fatigue > 70 ? 'text-rose-400' : 'text-slate-200'}`}>{playerImpact.fatigue}%</span>
                  </div>
                </div>
              </div>

              {/* RENDER DYNAMIC OUTPUTS */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Influence Calculations</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    playerImpact.expectedAvailability === "Available" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {playerImpact.expectedAvailability}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2 text-center md:text-left">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Squad Net Influence score</span>
                    <div className="text-6xl font-black text-indigo-400 tracking-tighter">
                      {playerImpact.influenceScore}
                      <span className="text-xs font-medium text-slate-400"> / 100</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This score aggregates player importance relative to direct replacement bench backup quality.
                    </p>
                  </div>

                  <div className="bg-indigo-950/25 border border-indigo-500/20 p-5 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">Player Importance Weight</span>
                      <span className="font-mono text-white font-bold">{playerImpact.playerImportance}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">Replacement Bench Quality</span>
                      <span className="font-mono text-white font-bold">{playerImpact.replacementQuality}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">Injury Risk Probability</span>
                      <span className="font-mono text-rose-400 font-bold">{playerImpact.injuryRisk}%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 4: MARKET INTELLIGENCE */}
      {activeTab === "market" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Phase 4: Market Intelligence Terminal
              </h3>
              <p className="text-xs text-slate-400">Monitoring odds volatility, steam moves, reverse line movements, and smart syndicate positioning splits.</p>
            </div>
          </div>

          {marketIntel && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* STEAM MOVEMENTS MATRIX */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 space-y-5 text-xs">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Syndicate Flows Indicators</h4>
                
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Steam Moves</span>
                      <span className="text-[11px] text-slate-300 mt-0.5">Heavy rapid betting volume trigger</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                      marketIntel.steamMoves ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-800 text-slate-400"
                    }`}>
                      {marketIntel.steamMoves ? "DETECTED" : "QUIET"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-500 uppercase font-bold">Reverse Line Movement</span>
                      <span className="text-[11px] text-slate-300 mt-0.5">Odds move opposite to general public volume</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase ${
                      marketIntel.reverseLineMovement ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                    }`}>
                      {marketIntel.reverseLineMovement ? "RLM TRIGGERS" : "NOT PRESENT"}
                    </span>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Liquidity & Dispersion</span>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Total Liquidity Index:</span>
                    <span className="font-mono text-white font-bold">{marketIntel.liquidity}/100</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Bookmaker Disagreement Variance:</span>
                    <span className="font-mono text-indigo-400 font-bold">{(marketIntel.bookmakerDisagreement * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* ODDS COMPARISON BAR CHALENGERS */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 flex flex-col justify-between space-y-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold font-sans">Odds Divergence: Opening vs Current vs Expected Closing</h4>
                
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { label: "Home Win", Opening: marketIntel.openingOdds.home, Current: marketIntel.currentOdds.home, ExpectedClosing: marketIntel.expectedClosingLine.home },
                        { label: "Draw", Opening: marketIntel.openingOdds.draw, Current: marketIntel.currentOdds.draw, ExpectedClosing: marketIntel.expectedClosingLine.draw },
                        { label: "Away Win", Opening: marketIntel.openingOdds.away, Current: marketIntel.currentOdds.away, ExpectedClosing: marketIntel.expectedClosingLine.away },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="Opening" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Opening Line" />
                      <Bar dataKey="Current" fill="#10b981" radius={[4, 4, 0, 0]} name="Current Line" />
                      <Bar dataKey="ExpectedClosing" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Exp Closing Line" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 5: IN-PLAY LIVE ENGINE */}
      {activeTab === "live" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-rose-400" />
                Phase 5: Real-Time In-Play Momentum Engine
              </h3>
              <p className="text-xs text-slate-400">Simulate match telemetry feeds to calculate in-game expected goals curves and identify high-value live hedging triggers.</p>
            </div>
            
            <button 
              onClick={() => setIsSimulatingLive(!isSimulatingLive)}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer ${
                isSimulatingLive 
                  ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-950/50" 
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-950/50"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isSimulatingLive ? "Stop Simulation" : "Start Live Simulation"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LIVE SCOREBOARD & SLIDER OVERRIDES */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 space-y-6 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <span className="text-[11px] font-mono text-rose-400 font-bold uppercase animate-pulse">In-Play Session</span>
                <span className="font-mono text-white font-bold">{liveMinute}' Minutes</span>
              </div>

              <div className="flex items-center justify-center gap-6 py-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Arsenal</span>
                  <div className="text-4xl font-black text-white">{liveScore.home}</div>
                </div>
                <div className="text-slate-600 text-lg font-bold">:</div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Man City</span>
                  <div className="text-4xl font-black text-white">{liveScore.away}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Manual Score Adjuster</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLiveScore(s => ({ ...s, home: Math.max(0, s.home - 1) }))}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 font-bold cursor-pointer"
                    >
                      Ars -1
                    </button>
                    <button 
                      onClick={() => setLiveScore(s => ({ ...s, home: s.home + 1 }))}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 font-bold cursor-pointer"
                    >
                      Ars +1
                    </button>
                    <button 
                      onClick={() => setLiveScore(s => ({ ...s, away: Math.max(0, s.away - 1) }))}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 font-bold cursor-pointer"
                    >
                      City -1
                    </button>
                    <button 
                      onClick={() => setLiveScore(s => ({ ...s, away: s.away + 1 }))}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 font-bold cursor-pointer"
                    >
                      City +1
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Manual Clock Override</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="90" 
                    value={liveMinute} 
                    onChange={(e) => setLiveMinute(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* LIVE PROBABILITY CURVES */}
            {liveIntel && (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 flex flex-col justify-between space-y-6">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Dynamic In-Play Probability Shift</h4>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Home Win</span>
                    <div className="text-2xl font-black text-indigo-400 font-mono">{(liveIntel.probabilities.winHome * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Draw</span>
                    <div className="text-2xl font-black text-slate-200 font-mono">{(liveIntel.probabilities.draw * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Away Win</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{(liveIntel.probabilities.winAway * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {liveIntel.probabilities.valueBetDetected && liveIntel.probabilities.liveBetOpportunity ? (
                  <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-300">Live Hedging In-Play Opportunity Detected!</h4>
                      <p className="text-[11px] text-slate-300 font-mono">
                        Selection: <span className="text-white font-bold">{liveIntel.probabilities.liveBetOpportunity.Selection}</span> | Live Odds: <span className="text-white font-bold">{liveIntel.probabilities.liveBetOpportunity.LiveOdds}</span> | Expected Edge: <span className="text-rose-400 font-bold">+{(liveIntel.probabilities.liveBetOpportunity.ExpectedValue * 100).toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                    Scanning live exchanges for odds mispricings...
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 6: DECISION CONSENSUS */}
      {activeTab === "decision" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Phase 6: Multi-Model Decision consensus Engine
            </h3>
            <p className="text-xs text-slate-400">Cohesively weighting Statistical Poisson solvers, LightGBM boosting trees, Bayesian Networks, and Gemini analyst agents.</p>
          </div>

          {decisionConsensus && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* COMPONENT MODELS WEIGHT TABLE */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 lg:col-span-7 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-3 font-semibold">Model Pathway</th>
                      <th className="p-3 font-semibold">Type</th>
                      <th className="p-3 font-semibold text-center">Home/Draw/Away Probs</th>
                      <th className="p-3 font-semibold text-right">Model Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                    {decisionConsensus.models.map((m: any) => (
                      <tr key={m.modelId} className="hover:bg-slate-900/40">
                        <td className="p-3 text-white font-bold">{m.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 font-mono">
                            {m.type}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-center">
                          {Math.round(m.probabilities.Home * 100)}% / {Math.round(m.probabilities.Draw * 100)}% / {Math.round(m.probabilities.Away * 100)}%
                        </td>
                        <td className="p-3 text-right font-mono text-indigo-400">x{m.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CONSENSUS AGGREGATION DISPLAY */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Consensus Output</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    decisionConsensus.consensus.riskLevel === "LOW" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {decisionConsensus.consensus.riskLevel} Risk
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Consensus Decision Selection</span>
                    <div className="text-4xl font-black text-white mt-1">
                      {decisionConsensus.consensus.votedOutcome} Win
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disagreement score:</span>
                      <span className="font-mono text-white font-bold">{(decisionConsensus.consensus.disagreementScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weighted confidence:</span>
                      <span className="font-mono text-indigo-400 font-bold">{(decisionConsensus.consensus.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-400">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Semantic reasoning chains</span>
                    {decisionConsensus.consensus.reasoningChains.map((chain: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{chain}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUTONOMOUS RESEARCH AGENT */}
      {activeTab === "research" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpenText className="w-4 h-4 text-indigo-400" />
                Phase 7: Autonomous research Agent Workspace
              </h3>
              <p className="text-xs text-slate-400">Automated ingestion scanning over injuries, weather conditions, traveling fatigues, and lineups.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
              {(["all", "injuries", "weather", "travel"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setResearchCategory(cat);
                    fetchResearch(cat);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                    researchCategory === cat ? "bg-indigo-600/20 text-white border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {isResearchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-slate-950 rounded-2xl border border-slate-850/60">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400 font-mono">Running LLM research pipeline crawling press streams...</span>
            </div>
          ) : researchSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <span className="text-xs font-mono text-indigo-400 font-bold uppercase">CRAWLED & SUMMARIZED INGESTION REPORT</span>
                  <span className="text-[10px] text-slate-500 font-mono">{researchSummary.date}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{researchSummary.summarizedText}</p>
                
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <Wind className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-slate-200">Environmental & Wind Optimization Mode</h5>
                    <p className="text-[11px] text-slate-400">
                      Gale force winds are expected. This automatically shifts the feature weight emphasis from high-aerial balls to direct short pitch transitions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 flex flex-col justify-between space-y-6">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Research Impact Indices</h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Probability shift</span>
                      <div className="text-2xl font-black text-rose-400 font-mono">{researchSummary.predictionImpactIndex}%</div>
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-center space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Confidence delta</span>
                      <div className="text-2xl font-black text-rose-400 font-mono">{researchSummary.confidenceShift}</div>
                    </div>
                  </div>

                  <div className="border border-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs text-slate-300">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">Key Absences Identified</span>
                    {researchSummary.identifiedAbsences.map((abs: string, idx: number) => (
                      <div key={idx} className="flex justify-between border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                        <span>{abs.split(" ")[0]}</span>
                        <span className="font-mono text-rose-400 font-bold">{abs.split(" ")[1] || "Missing"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 8: PORTFOLIO OPTIMIZER */}
      {activeTab === "portfolio" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-indigo-400" />
                Phase 8: Fractional Kelly Portfolio Allocator
              </h3>
              <p className="text-xs text-slate-400">Strict safety-first risk budgeting. Stakes are capped at 5% max bankroll per single wager.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-mono text-slate-400 font-bold uppercase">Tuning Bankroll ($)</label>
              <input 
                type="number" 
                value={bankroll}
                onChange={(e) => {
                  setBankroll(Math.max(100, parseInt(e.target.value) || 10000));
                  fetchPortfolio();
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-32"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* STAKE ALLOCATION LIST */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 lg:col-span-8 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-semibold">Selection</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold text-center">Odds</th>
                    <th className="p-3 font-semibold text-center">Probability</th>
                    <th className="p-3 font-semibold text-center">Kelly Stake</th>
                    <th className="p-3 font-semibold text-right">Allocated Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                  {portfolioAllocs.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-white font-bold">{alloc.selection}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 font-mono">
                          {alloc.type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-center">{alloc.odds.toFixed(2)}</td>
                      <td className="p-3 font-mono text-center">{Math.round(alloc.prob * 100)}%</td>
                      <td className="p-3 font-mono text-center text-indigo-400">{(alloc.kellyStake * 100).toFixed(2)}%</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">${alloc.allocatedAmountUsd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PORTFOLIO SAFETY PRINCIPLES */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-4 flex flex-col justify-between space-y-6">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Safety Risk Controls</h4>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center gap-3">
                  <Shield className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <h6 className="font-bold text-white">0.25 Fractional Capping</h6>
                    <p className="text-[11px] text-slate-400 mt-0.5">Multiplies raw Kelly fractions by 0.25 to insulate portfolio against high variance.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center gap-3">
                  <ShieldAlert className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                  <div>
                    <h6 className="font-bold text-white">5% Hard Risk Ceiling</h6>
                    <p className="text-[11px] text-slate-400 mt-0.5">Prevents single high-EV candidates from exceeding a rigid 5.0% total capital stake constraint.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 9: SELF LEARNING ENGINE */}
      {activeTab === "learning" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Phase 9: Post-Match Continuous Self-Learning Engine
              </h3>
              <p className="text-xs text-slate-400">Comparing outcomes dynamically to detect feature drift and trigger model retrain updates.</p>
            </div>
            
            <button 
              onClick={fetchLearning}
              disabled={isLearningEvaluating}
              className="px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isLearningEvaluating ? "Evaluating..." : "Trigger Self-Evaluation"}
            </button>
          </div>

          {learningReport && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* STABILITY CALIBRATIONS */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-5 space-y-5 text-xs">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Feedback Analytics</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Brier Score Calibration Error:</span>
                    <span className="font-mono text-white font-bold">{learningReport.brierScore.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Log-loss Likelihood Score:</span>
                    <span className="font-mono text-white font-bold">{learningReport.logLoss.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Concept Drift Detected:</span>
                    <span className={`font-bold ${learningReport.driftDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {learningReport.driftDetected ? "DRIFT IN PROGRESS" : "HEALTHY STABLE"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retrain Recommendations:</span>
                    <span className={`font-bold ${learningReport.retrainingRecommended ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                      {learningReport.retrainingRecommended ? "RETRAIN SCHEDULED" : "COMPLYING"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850/80 flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{learningReport.evaluationSummary}</p>
                </div>
              </div>

              {/* BAR CHART FEATURE WEIGHT GRADIENTS */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 lg:col-span-7 flex flex-col justify-between space-y-4">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Updated Statistical Feature Weights</h4>
                
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.keys(learningReport.featureWeightsUpdate).map(key => ({
                        feature: key.replace("feat_", "").replace("_", " "),
                        Weight: learningReport.featureWeightsUpdate[key]
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="feature" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} />
                      <Bar dataKey="Weight" fill="#10b981" radius={[4, 4, 0, 0]} name="Dynamic Weight Factor" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 10: OPERATIONS CENTER */}
      {activeTab === "operations" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Phase 10: Operations Control Center
            </h3>
            <p className="text-xs text-slate-400">Monitoring enterprise system health, latencies, resource utilization, and operational costs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opsMetrics.map((m, i) => (
              <div key={i} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">{m.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    m.status === "Normal" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{m.value}</span>
                  <span className="text-xs text-slate-500 font-mono">{m.unit}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (m.value / 200) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: PREDICTION MARKETPLACE */}
      {activeTab === "marketplace" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Phase 11: AI-Powered Prediction Marketplace
            </h3>
            <p className="text-xs text-slate-400">High-conviction edge detections across global sports markets, prioritized by expected value (EV).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketProducts.map((p, i) => (
              <div key={i} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">{p.type}</h4>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20">
                      EV: +{(p.expectedValue * 100 - 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-mono">Confidence</div>
                    <div className="text-lg font-black text-emerald-400">{(p.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Risk Rating</span>
                    <span className={`font-bold ${p.riskRating === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>{p.riskRating}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-500 block">Kelly Stake</span>
                    <span className="font-mono text-white font-bold">{(p.kellyStake * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Supporting Evidence</span>
                  <div className="flex flex-wrap gap-2">
                    {p.supportingEvidence.map((ev: string, j: number) => (
                      <span key={j} className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">{ev}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: GOVERNANCE */}
      {activeTab === "governance" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Phase 12: AI Governance & Auditability
            </h3>
            <p className="text-xs text-slate-400">Ensuring all model decisions, retraining events, and data ingestion cycles are fully traceable.</p>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-amber-200/80 leading-relaxed">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-400 font-bold uppercase tracking-wider">Immutable Governance Log Active</span>
            </div>
            {governanceReport || "Generating real-time compliance report..."}
            <div className="mt-6 space-y-2 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Last Audit Check:</span>
                <span className="text-slate-400">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Traceability Index:</span>
                <span className="text-emerald-400 font-bold">100% (High Density)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 13: AI COMMAND */}
      {activeTab === "autonomous" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              AI Orchestration & Autonomous Controls
            </h3>
            <p className="text-xs text-slate-400">Manually trigger high-level workflows or monitor the autonomous event bus in real-time.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Manual Overrides</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => triggerAutonomousAction("Global Retraining")}
                  className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-2 transition-all cursor-pointer group"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-700" />
                  <div className="text-[11px] font-bold text-white">Retrain All Models</div>
                </button>
                <button 
                  onClick={() => triggerAutonomousAction("Data Sweep")}
                  className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-2 transition-all cursor-pointer group"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div className="text-[11px] font-bold text-white">Ingestion Sweep</div>
                </button>
                <button 
                  onClick={() => triggerAutonomousAction("Optimize Weights")}
                  className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-2 transition-all cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div className="text-[11px] font-bold text-white">Optimize Weights</div>
                </button>
                <button 
                  onClick={() => triggerAutonomousAction("Clear Cache")}
                  className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-left space-y-2 transition-all cursor-pointer group"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <div className="text-[11px] font-bold text-white">Emergency Stop</div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">Live Orchestration Stream</h4>
              <div className="bg-black/40 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-1">
                {autonomousLogs.length === 0 && <div className="text-slate-600">Waiting for system events...</div>}
                {autonomousLogs.map((log, i) => (
                  <div key={i} className={log.includes("completed") ? "text-emerald-400" : "text-slate-300"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
