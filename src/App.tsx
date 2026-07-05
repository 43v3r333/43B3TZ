import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Info,
  Layers,
  ArrowUpRight,
  Target,
  Cpu,
  Globe,
  Lock,
  DollarSign,
  Lightbulb,
  Compass,
  Users,
  CheckCircle2,
  Terminal,
  Loader2,
  Search,
  Award,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- STABLE MOCK & STATIC DATA ---
const KPI_TRENDS = [
  { name: 'Mon', roi: 4.2, yield: 3.1, volume: 11200 },
  { name: 'Tue', roi: 5.8, yield: 4.5, volume: 11800 },
  { name: 'Wed', roi: 4.9, yield: 3.8, volume: 12050 },
  { name: 'Thu', roi: 7.2, yield: 6.1, volume: 12450 },
  { name: 'Fri', roi: 8.4, yield: 7.2, volume: 12800 },
  { name: 'Sat', roi: 8.9, yield: 8.4, volume: 14100 },
  { name: 'Sun', roi: 9.1, yield: 9.1, volume: 13900 },
];

const PRESET_FIXTURES = [
  { name: "Liverpool vs Manchester City", sport: "Soccer" },
  { name: "Boston Celtics vs LA Lakers", sport: "Basketball" },
  { name: "Carlos Alcaraz vs Novak Djokovic", sport: "Tennis" },
  { name: "Kansas City Chiefs vs San Francisco 49ers", sport: "Football" },
];

const DEPARTMENTS = [
  { id: "AI Research", role: "Chief AI Officer", leader: "Dr. Aris Thorne", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "Engineering", role: "Chief Technology Officer", leader: "Sarah Chen", icon: Network, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: "Sports Research", role: "Head of Sports Intelligence", leader: "Marcus Vance", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "Product", role: "Chief Product Officer", leader: "Elena Rostova", icon: Compass, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "Business", role: "Chief Revenue Officer", leader: "Christian West", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "Customer Success", role: "Head of Customer Success", leader: "Liam O'Connor", icon: Users, color: "text-teal-500", bg: "bg-teal-500/10" },
  { id: "Operations", role: "Head of DevOps & Platform", leader: "Hiroshi Tanaka", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "Security", role: "Chief Information Security Officer", leader: "Diana Prince", icon: Lock, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "Finance", role: "Chief Financial Officer", leader: "Arthur Dent", icon: TrendingUp, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: "Strategy", role: "Head of Corporate Strategy", leader: "Frederik Noer", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: "AI Board of Directors", role: "Executive Board Representative", leader: "Consensus Vector", icon: ShieldCheck, color: "text-violet-500", bg: "bg-violet-500/10" }
];

interface ReasoningResult {
  id: string;
  fixture: string;
  prediction: string;
  confidence: number;
  calibration: number;
  governance: {
    model: string;
    version: string;
    retrained: string;
  };
  evidence: {
    supporting: string[];
    contradicting: string[];
    riskFactors: string[];
  };
  sizing: {
    recommendedSize: number;
    kellyMultiplier: number;
    expectedValue: number;
    riskRating: string;
    stressTestVerdict: string;
  };
}

interface DepartmentBriefing {
  department: string;
  report: string;
  decisions: string[];
  framework: {
    businessImpact: "High" | "Medium" | "Low";
    engineeringEffort: "High" | "Medium" | "Low";
    risk: "High" | "Medium" | "Low";
    expectedROI: string;
    scientificEvidence: string;
    customerValue: string;
    priority: "Critical" | "High" | "Medium" | "Low";
  };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'executive' | 'reasoner' | 'command' | 'ops'>('executive');
  
  // --- STATE FOR LEADERBOARD DATA ---
  const [leaderboard, setLeaderboard] = useState<any>(null);
  
  // --- STATE FOR REASONING TERMINAL ---
  const [selectedSport, setSelectedSport] = useState<string>("Soccer");
  const [customFixture, setCustomFixture] = useState<string>("Arsenal vs Chelsea");
  const [isReasoning, setIsReasoning] = useState<boolean>(false);
  const [reasoningProgress, setReasoningProgress] = useState<string>("");
  const [reasoningResult, setReasoningResult] = useState<ReasoningResult | null>(null);

  // --- STATE FOR ELT COMMAND CENTER ---
  const [selectedDept, setSelectedDept] = useState<string>("AI Research");
  const [deptBriefing, setDeptBriefing] = useState<DepartmentBriefing | null>(null);
  const [isDeptLoading, setIsDeptLoading] = useState<boolean>(false);

  // --- STATE FOR REPORT TERMINAL ---
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [isTerminalRunning, setIsTerminalRunning] = useState<boolean>(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    fetchLeaderboard();
    fetchDepartmentBriefing("AI Research");
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/v1/business/leaderboards");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to load leaderboards:", err);
    }
  };

  const fetchDepartmentBriefing = async (deptName: string) => {
    setIsDeptLoading(true);
    try {
      const res = await fetch(`/api/v1/business/briefing?department=${encodeURIComponent(deptName)}`);
      if (res.ok) {
        const data = await res.json();
        setDeptBriefing(data);
      }
    } catch (err) {
      console.error("Failed to fetch department briefing:", err);
    } finally {
      setIsDeptLoading(false);
    }
  };

  // --- TRIGGER ON-DEMAND SPORTS REASONING ENGINE ---
  const handleRunReasoning = async (fixture: string, sport: string) => {
    setIsReasoning(true);
    setReasoningResult(null);
    
    const steps = [
      "Initializing XG-Deep-Neural-v4 cluster...",
      "Sourcing SportRadar telemetry streams...",
      "Sourcing real-time Betfair orderbook delta updates...",
      "Calculating expected ECE calibration metrics...",
      "Computing optimal fractional-Kelly portfolio sizing...",
      "Validating findings through consensus reasoning engine..."
    ];

    // Simulate real-time progress steps for beautiful design UX
    for (let i = 0; i < steps.length; i++) {
      setReasoningProgress(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const res = await fetch("/api/v1/business/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixture, sport })
      });
      if (res.ok) {
        const data = await res.json();
        setReasoningResult(data);
      }
    } catch (err) {
      console.error("Error executing sports reasoning:", err);
    } finally {
      setIsReasoning(false);
    }
  };

  // --- RUN EXECUTIVE OR GOVERNANCE CODES ---
  const runTerminalCommand = async (type: 'weekly' | 'compliance') => {
    setIsTerminalRunning(true);
    setTerminalOutput("Connecting to secure operational terminal...\nAuthenticating quantum signature...\nExecuting intelligence protocols...\n\n");
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const endpoint = type === 'weekly' ? "/api/v1/business/reports/weekly" : "/api/v1/business/governance/compliance";
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setTerminalOutput(prev => prev + (data.report || "No output returned."));
      }
    } catch (err: any) {
      setTerminalOutput(prev => prev + `[FATAL] Action failed: ${err.message}`);
    } finally {
      setIsTerminalRunning(false);
    }
  };

  const activeDeptConfig = DEPARTMENTS.find(d => d.id === selectedDept) || DEPARTMENTS[0];

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 border-b border-gray-900 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/10">
              <ShieldCheck className="w-6 h-6 text-white" id="logo-icon" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display flex items-center gap-2">
                43B3TZ-OS <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs px-2.5 py-0.5 rounded-full">v4.0.0-PRO</span>
              </h1>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">Enterprise Operations & Sports Intelligence Command</p>
            </div>
          </div>
        </div>
        
        {/* TAB CONTROLS */}
        <nav className="flex flex-wrap bg-[#0c0c0c] p-1 rounded-xl border border-gray-900 gap-1">
          {[
            { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
            { id: 'reasoner', label: 'Sports Reasoner', icon: Cpu },
            { id: 'command', label: 'ELT Command Center', icon: Users },
            { id: 'ops', label: 'Ops & Research', icon: Layers }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'command') {
                  fetchDepartmentBriefing(selectedDept);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' : 'text-gray-400 hover:text-white hover:bg-[#151515]'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'executive' && (
            <motion.div 
              key="exec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* PRIMARY KPI STRIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Daily ROI", value: "+8.42%", desc: "+1.2% over yesterday", icon: TrendingUp, color: "text-green-500", border: "border-green-500/10" },
                  { label: "Platform Yield", value: "9.11%", desc: "100% scientifically calibrated", icon: Activity, color: "text-blue-500", border: "border-blue-500/10" },
                  { label: "Prediction Vol.", value: "12,450", desc: "Active telemetry feeds", icon: BarChart3, color: "text-purple-500", border: "border-purple-500/10" },
                  { label: "Win Rate", value: "76.2%", desc: "Average across all markets", icon: Target, color: "text-amber-500", border: "border-amber-500/10" }
                ].map((stat, i) => (
                  <div key={i} className={`bg-[#0a0a0a] p-6 rounded-2xl border border-gray-900 hover:border-gray-800 transition-all duration-300`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl bg-[#111] ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-700 hover:text-gray-400 transition-colors cursor-pointer" />
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight font-display mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-[10px] text-gray-600 font-mono">{stat.desc}</div>
                  </div>
                ))}
              </div>

              {/* CHART & LEADERBOARD SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* INTERACTIVE CHART */}
                <div className="lg:col-span-2 bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">Performance Benchmarking</h2>
                      <p className="text-xs text-gray-500 mt-1">Live platform yield optimization track vs industry baseline</p>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Platform ROI</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500/30 rounded-full" /> Yield Bounds</span>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={KPI_TRENDS}>
                        <defs>
                          <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                        <XAxis dataKey="name" stroke="#444" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#444" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090909', border: '1px solid #1a1a1a', borderRadius: '12px' }}
                          labelStyle={{ color: '#aaa', fontFamily: 'monospace' }}
                        />
                        <Area type="monotone" dataKey="roi" stroke="#2563eb" fillOpacity={1} strokeWidth={2} fill="url(#colorRoi)" />
                        <Area type="monotone" dataKey="yield" stroke="#6366f1" fillOpacity={0} strokeDasharray="4 4" strokeWidth={1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PERFORMANCE LEADERBOARD (PROGRAM 6) */}
                <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900 flex flex-col justify-between">
                  <div>
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-500" /> Model Benchmarks
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">Live algorithmic rankings and feature impacts</p>
                    </div>

                    <div className="space-y-5">
                      {(leaderboard?.models || [
                        { name: "XG-Deep-Neural-v4", winRate: 0.78, roi: 0.14, status: "Champion" },
                        { name: "Poisson-Ensemble-v3", winRate: 0.72, roi: 0.09, status: "Challenger" },
                        { name: "Elo-Adaptive-v2", winRate: 0.68, roi: 0.04, status: "Legacy" }
                      ]).map((model: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-900 last:border-0">
                          <div>
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              {model.name}
                              {model.status === 'Champion' && (
                                <span className="bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border border-blue-500/10">
                                  {model.status}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Win Rate: {(model.winRate * 100).toFixed(0)}%</div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-mono font-semibold text-green-500">+{model.roi * 100}% ROI</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-900">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2">Feature Importance Matrix</div>
                    <div className="flex flex-wrap gap-2">
                      {(leaderboard?.features || [
                        { name: "home_form_exp_decay", importance: 0.82 },
                        { name: "travel_distance_km", importance: 0.65 }
                      ]).map((feat: any, i: number) => (
                        <span key={i} className="bg-[#111] text-gray-400 text-[10px] font-mono px-2 py-1 rounded border border-gray-800">
                          {feat.name} ({(feat.importance * 100).toFixed(0)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* STRATEGIC REPORTS & TERMINAL RUNNER */}
              <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">Executive Audit Console</h2>
                    <p className="text-xs text-gray-500 mt-1">Generate complete executive briefings and operational compliance logs in real-time</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => runTerminalCommand('weekly')}
                      disabled={isTerminalRunning}
                      className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-gray-300 font-mono text-xs rounded-xl border border-gray-800 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isTerminalRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Terminal className="w-3.5 h-3.5" />}
                      Generate Weekly Report
                    </button>
                    <button 
                      onClick={() => runTerminalCommand('compliance')}
                      disabled={isTerminalRunning}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isTerminalRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      Run Compliance Audit
                    </button>
                  </div>
                </div>

                {/* VIRTUAL TERMINAL OUTPUT */}
                <div className="bg-[#030303] p-5 rounded-xl border border-gray-900 font-mono text-xs text-gray-400 overflow-x-auto h-64 relative">
                  {terminalOutput ? (
                    <pre className="whitespace-pre-wrap leading-relaxed">{terminalOutput}</pre>
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-gray-600 gap-2">
                      <Terminal className="w-8 h-8 text-gray-800" />
                      <span>Console idle. Select an audit action above to execute.</span>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: INTERACTIVE SPORTS REASONER */}
          {activeTab === 'reasoner' && (
            <motion.div 
              key="reasoner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* CONTROL BOARD */}
              <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900">
                <h2 className="text-xl font-bold text-white font-display mb-2">On-Demand Sports Reasoning Terminal</h2>
                <p className="text-xs text-gray-500 mb-6">Enter a custom fixture or match and utilize the core server-side Gemini intelligence models to produce calibrated predictions.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Select Discipline</label>
                    <select 
                      value={selectedSport} 
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Soccer">Soccer (Association Football)</option>
                      <option value="Basketball">Basketball (NBA/EuroLeague)</option>
                      <option value="Tennis">Tennis (ATP/WTA Tour)</option>
                      <option value="Football">Football (NFL Gridiron)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Fixture / Competitors</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={customFixture}
                        onChange={(e) => setCustomFixture(e.target.value)}
                        placeholder="e.g., Real Madrid vs Barcelona"
                        className="w-full bg-[#111] border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <Search className="w-4 h-4 text-gray-500 absolute left-4 top-3.5" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* PRESETS CHIPS */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_FIXTURES.map((preset, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setCustomFixture(preset.name);
                          setSelectedSport(preset.sport);
                        }}
                        className="bg-[#111] hover:bg-[#1a1a1a] text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-gray-800 transition-colors cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleRunReasoning(customFixture, selectedSport)}
                    disabled={isReasoning || !customFixture}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isReasoning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Neural Weights...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4" />
                        <span>Run Scientific Reasoning</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RESULTS CONTAINER */}
              <AnimatePresence mode="wait">
                {isReasoning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#0a0a0a] p-10 rounded-2xl border border-gray-900 flex flex-col items-center justify-center text-center h-80 gap-4"
                  >
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <div className="font-mono text-xs text-blue-400 animate-pulse">{reasoningProgress}</div>
                    <p className="text-xs text-gray-500 max-w-sm mt-2">Evaluating Bayesian variables, past team performance factors, and recent sleep patterns.</p>
                  </motion.div>
                )}

                {!isReasoning && reasoningResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* LEADING REASONING BOX */}
                    <div className="lg:col-span-2 bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900 space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-900 pb-6">
                        <div>
                          <div className="text-[10px] text-blue-500 font-mono uppercase tracking-widest mb-1">{reasoningResult.id}</div>
                          <h2 className="text-xl md:text-2xl font-bold text-white font-display">{reasoningResult.fixture}</h2>
                        </div>
                        <div className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
                          PREDICTION: {reasoningResult.prediction}
                        </div>
                      </div>

                      {/* STATS STRIP */}
                      <div className="grid grid-cols-2 gap-6 bg-[#030303] p-5 rounded-xl border border-gray-900">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Model Confidence</div>
                          <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${reasoningResult.confidence * 100}%` }} />
                          </div>
                          <span className="text-xl font-bold text-white font-display">{(reasoningResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Expected Calibration Error (ECE)</div>
                          <span className="text-xl font-bold text-green-400 font-display">{(reasoningResult.calibration * 100).toFixed(3)}%</span>
                          <div className="text-[9px] text-gray-600 mt-0.5 uppercase tracking-widest font-mono">Statistical Excellence</div>
                        </div>
                      </div>

                      {/* EVIDENCE BLOCK */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Supporting Evidence
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {reasoningResult.evidence.supporting.map((item, i) => (
                              <div key={i} className="text-xs text-gray-400 bg-[#0f0f0f] p-3 rounded-lg border border-gray-900 flex items-start gap-2.5">
                                <span className="text-green-500 font-mono">[{i+1}]</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
                              <AlertTriangle className="w-4 h-4 text-amber-500" /> Contradictory Signals
                            </h3>
                            <div className="space-y-2">
                              {reasoningResult.evidence.contradicting.map((item, i) => (
                                <div key={i} className="text-[11px] text-gray-400 bg-[#0f0f0f] p-3 rounded-lg border border-gray-900 flex items-start gap-2.5">
                                  <span className="text-amber-500 font-mono">[-]</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-xs font-semibold text-white flex items-center gap-2 mb-3">
                              <Info className="w-4 h-4 text-red-500" /> Operational Risk Factors
                            </h3>
                            <div className="space-y-2">
                              {reasoningResult.evidence.riskFactors.map((item, i) => (
                                <div key={i} className="text-[11px] text-gray-400 bg-[#0f0f0f] p-3 rounded-lg border border-gray-900 flex items-start gap-2.5">
                                  <span className="text-red-500 font-mono">[!]</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SIZING & PORTFOLIO SIDE PANEL */}
                    <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900 space-y-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-gray-900 pb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" /> Portfolio Optimization
                      </h3>

                      <div className="space-y-5">
                        <div className="p-4 bg-[#030303] rounded-xl border border-gray-900 text-center">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-1">Recommended Stake Size</div>
                          <div className="text-3xl font-extrabold text-blue-500 tracking-tight">{(reasoningResult.sizing.recommendedSize * 100).toFixed(2)}%</div>
                          <div className="text-[9px] text-gray-600 font-mono mt-1">OF ENTERPRISE BANKROLL ($1M)</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3.5 bg-[#030303] rounded-xl border border-gray-900">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Expected Edge</div>
                            <div className="text-sm font-bold text-white">+{(reasoningResult.sizing.expectedValue * 100).toFixed(2)}%</div>
                          </div>
                          <div className="p-3.5 bg-[#030303] rounded-xl border border-gray-900">
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Kelly Multiplier</div>
                            <div className="text-sm font-bold text-white">{reasoningResult.sizing.kellyMultiplier} Quarter-Kelly</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-900">
                          <span className="text-xs text-gray-500 uppercase">Risk Assessment</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${reasoningResult.sizing.riskRating === 'Low' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {reasoningResult.sizing.riskRating} Risk
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Monte Carlo Stress Test</div>
                          <div className="text-xs text-gray-400 leading-relaxed bg-[#030303] p-3.5 rounded-lg border border-gray-900">
                            {reasoningResult.sizing.stressTestVerdict}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-900 text-center">
                        <span className="text-[10px] text-gray-600 font-mono">GOVERNANCE VERIFIED v{reasoningResult.governance.version}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isReasoning && !reasoningResult && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#0a0a0a] p-12 rounded-2xl border border-gray-900 flex flex-col items-center justify-center text-center h-64 text-gray-500 gap-3"
                  >
                    <Search className="w-8 h-8 text-gray-800" />
                    <div>
                      <p className="text-sm font-medium text-white">Console Awaiting Instruction</p>
                      <p className="text-xs text-gray-600 mt-1">Select a fixture preset above or input your custom game to generate an on-demand report.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 3: ELT OPERATIONS COMMAND CENTER */}
          {activeTab === 'command' && (
            <motion.div 
              key="command"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* DEPARTMENTS SIDEBAR */}
              <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-gray-900 space-y-2.5">
                <div className="mb-4 px-2">
                  <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Operating Divisions</h3>
                  <p className="text-[10px] text-gray-600 mt-0.5">Corporate ELT Governance Architecture</p>
                </div>
                
                <div className="space-y-1">
                  {DEPARTMENTS.map((dept, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSelectedDept(dept.id);
                        fetchDepartmentBriefing(dept.id);
                      }}
                      className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-all ${selectedDept === dept.id ? 'bg-[#111] border border-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-[#070707]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${dept.bg} ${dept.color}`}>
                          <dept.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold leading-none">{dept.id}</div>
                          <div className="text-[9px] text-gray-500 mt-1">{dept.role}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVE DEPARTMENT VIEW */}
              <div className="lg:col-span-3 space-y-8">
                {/* DEPT HEADER */}
                <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-900 pb-6 mb-6">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${activeDeptConfig.color}`}>{activeDeptConfig.role}</span>
                      <h2 className="text-2xl font-bold text-white font-display mt-0.5">{selectedDept}</h2>
                    </div>
                    <button 
                      onClick={() => fetchDepartmentBriefing(selectedDept)}
                      disabled={isDeptLoading}
                      className="px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-xs text-gray-300 font-semibold border border-gray-800 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      {isDeptLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> : <Activity className="w-3.5 h-3.5 text-blue-400" />}
                      Generate Live Audit Briefing
                    </button>
                  </div>

                  {/* LOADING BRIEF */}
                  <AnimatePresence mode="wait">
                    {isDeptLoading ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center text-gray-500 gap-3"
                      >
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="font-mono text-xs text-blue-400 animate-pulse">Retrieving quantitative review vector...</span>
                      </motion.div>
                    ) : deptBriefing ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        {/* THE CHIEF OFFICER REPORT */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Weekly Operational Review</h3>
                          <p className="text-sm text-gray-300 leading-relaxed bg-[#030303] p-5 rounded-xl border border-gray-900 font-light">
                            "{deptBriefing.report}"
                          </p>
                        </div>

                        {/* SPRINT DECISIONS */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Active Sprint Decisions (Executing Now)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {deptBriefing.decisions.map((decision, i) => (
                              <div key={i} className="p-4 bg-[#0c0c0c] rounded-xl border border-gray-900 flex flex-col justify-between">
                                <span className="text-[10px] font-mono text-blue-500 mb-2">DECISION_0{i+1}</span>
                                <p className="text-xs text-gray-300 leading-relaxed font-medium">{decision}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DECISION FRAMEWORK AUDIT */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Decision Framework Evaluation</h3>
                          <div className="overflow-x-auto border border-gray-900 rounded-xl bg-[#030303]">
                            <table className="w-full text-left text-xs text-gray-400">
                              <thead className="bg-[#090909] border-b border-gray-900 text-[10px] uppercase tracking-wider text-gray-500">
                                <tr>
                                  <th className="p-4 font-semibold">Impact Matrix</th>
                                  <th className="p-4 font-semibold">Effort Rating</th>
                                  <th className="p-4 font-semibold">Expected ROI</th>
                                  <th className="p-4 font-semibold">Scientific Basis</th>
                                  <th className="p-4 font-semibold text-right">Priority</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-900/50">
                                  <td className="p-4">
                                    <div className="font-semibold text-white">Business Impact: {deptBriefing.framework.businessImpact}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Customer Value: {deptBriefing.framework.customerValue}</div>
                                  </td>
                                  <td className="p-4">
                                    <div>Effort: {deptBriefing.framework.engineeringEffort}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">Risk: {deptBriefing.framework.risk}</div>
                                  </td>
                                  <td className="p-4 font-mono text-green-400 font-semibold">{deptBriefing.framework.expectedROI}</td>
                                  <td className="p-4 text-[11px] font-mono max-w-xs">{deptBriefing.framework.scientificEvidence}</td>
                                  <td className="p-4 text-right">
                                    <span className="bg-blue-600/10 text-blue-400 border border-blue-600/25 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-mono">
                                      {deptBriefing.framework.priority}
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: OPS & RESEARCH */}
          {activeTab === 'ops' && (
            <motion.div 
              key="ops"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DATA PROVIDER STATUS */}
                <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900">
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3 font-display">
                    <Activity className="w-5 h-5 text-blue-500" /> Global Data Platform Status
                  </h2>
                  <div className="space-y-4">
                    {[
                      { name: "SportRadar Enterprise", type: "Official Feed", latency: "45ms", health: 99.9, cost: "$450/day", status: "Active" },
                      { name: "Betfair API-NG", type: "Exchange orderbook", latency: "120ms", health: 99.5, cost: "$115/day", status: "Active" },
                      { name: "OpenWeather Pro", type: "Climatic feeds", latency: "310ms", health: 98.2, cost: "$35/day", status: "Active" }
                    ].map((provider, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-[#0f0f0f] rounded-xl border border-gray-900 hover:border-gray-800 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {provider.name}
                            <span className="bg-green-500/10 text-green-400 text-[8px] font-mono px-1 rounded uppercase tracking-wider">
                              {provider.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">{provider.type} • {provider.cost}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-blue-500 font-semibold">{provider.latency}</div>
                          <div className="text-xs text-green-500 font-mono mt-0.5">{provider.health}% Health</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PORTFOLIO INTEL */}
                <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3 font-display">
                      <TrendingUp className="w-5 h-5 text-purple-500" /> Portfolio Risk Exposure
                    </h2>
                    
                    <div className="space-y-6">
                      {[
                        { league: "EPL (English Premier League)", exposure: 0.50, limit: 250000, value: 125000, barColor: "bg-blue-500" },
                        { league: "NBA (National Basketball)", exposure: 0.425, limit: 200000, value: 85000, barColor: "bg-indigo-500" },
                        { league: "La Liga (Spanish Soccer)", exposure: 0.28, limit: 150000, value: 42000, barColor: "bg-amber-500" }
                      ].map((p, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400 font-medium">{p.league}</span>
                            <span className="text-white font-mono">${p.value.toLocaleString()} / ${p.limit.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
                            <div className={`h-full ${p.barColor}`} style={{ width: `${p.exposure * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#030303] p-4 rounded-xl border border-gray-900 text-xs text-gray-500 leading-relaxed mt-6">
                    <strong>Program 5 Mandate:</strong> Staking volume allocation maintains a fractional Kelly maximum limits boundary of 2.5% per single counterparty ledger block to protect the enterprise seed bankroll.
                  </div>
                </div>
              </div>

              {/* EXPERIMENT REGISTRY */}
              <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" /> Scientific Experiment Registry
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Reproducibility logs and peer-review evidence-based promotions</p>
                  </div>
                  <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/15">
                    Scientific Governance Active
                  </span>
                </div>

                <div className="overflow-x-auto border border-gray-900 rounded-xl bg-[#030303]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#090909] border-b border-gray-900 text-[10px] uppercase tracking-wider text-gray-500">
                        <th className="p-4 font-semibold">Experiment Title</th>
                        <th className="p-4 font-semibold">Model Version</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold">Statistical Significance</th>
                        <th className="p-4 text-right pr-6 font-semibold">Expected Business Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-400">
                      {[
                        { name: "LSTM Fatigue Integration", version: "v1.5.0-alpha", status: "Promoted", p: "0.003", impact: "High (+4.2% accuracy delta)", researcher: "Dr. Aris Thorne" },
                        { name: "Sentiment Analysis on Referee Bias", version: "v1.4.3-beta", status: "Archived", p: "0.450", impact: "Low (No correlation detected)", researcher: "Sarah Chen" },
                        { name: "Var-Intervention Drift Analysis", version: "v1.4.1-rc1", status: "Running", p: "0.021", impact: "Medium (+1.8% accuracy delta)", researcher: "Marcus Vance" }
                      ].map((exp, i) => (
                        <tr key={i} className="border-b border-gray-900/50 last:border-0 hover:bg-[#070707] transition-all">
                          <td className="p-4 font-semibold text-white">
                            {exp.name}
                            <div className="text-[10px] text-gray-600 font-mono mt-1">Lead: {exp.researcher}</div>
                          </td>
                          <td className="p-4 font-mono text-gray-500">{exp.version}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider ${exp.status === 'Promoted' ? 'bg-green-500/10 text-green-400 border border-green-500/15' : exp.status === 'Archived' ? 'bg-gray-500/10 text-gray-500 border border-gray-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'}`}>
                              {exp.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-amber-500 font-bold">p={exp.p}</td>
                          <td className="p-4 text-right pr-6 text-white font-medium">{exp.impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER SECTION */}
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 text-center flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-600 text-[10px] tracking-widest uppercase font-mono">
          43B3TZ TECHNOLOGIES • CONFIDENTIAL & PROPRIETARY QUANT SYSTEM
        </p>
        <p className="text-gray-600 text-[10px] tracking-widest uppercase font-mono">
          ESTABLISHED 2026 • THE PALANTIR OF SPORTS ANALYTICS
        </p>
      </footer>
    </div>
  );
};

export default App;
