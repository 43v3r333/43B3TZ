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
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- MOCK DATA ---
const KPI_DATA = [
  { name: 'Mon', roi: 4.2, yield: 3.1 },
  { name: 'Tue', roi: 5.8, yield: 4.5 },
  { name: 'Wed', roi: 3.9, yield: 2.8 },
  { name: 'Thu', roi: 7.2, yield: 6.1 },
  { name: 'Fri', roi: 8.4, yield: 7.2 },
  { name: 'Sat', roi: 6.1, yield: 5.4 },
  { name: 'Sun', roi: 9.2, yield: 8.1 },
];

const PREDICTION_REPORT = {
  id: "PRED-2026-EPL-042",
  fixture: "Liverpool vs Manchester City",
  prediction: "Home Win (1)",
  confidence: 0.72,
  calibration: 0.02, // ECE
  governance: {
    model: "XG-Deep-Neural-v4",
    version: "1.4.2-stable",
    retrained: "2026-06-28",
  },
  evidence: {
    supporting: [
      "Liverpool home record: unbeaten in 12 matches",
      "Man City missing Rodri (central defensive core)",
      "Market moving significantly towards Home (-0.15 odds shift)"
    ],
    contradicting: [
      "Head-to-head favors City in last 3 encounters at Anfield",
      "Alisson (LIV) is at 85% fitness"
    ],
    riskFactors: [
      "90% chance of heavy rain affecting ball speed",
      "Late tactical shift expected from Pep Guardiola"
    ]
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'executive' | 'intelligence' | 'operations'>('executive');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 p-8 font-sans">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            43B3TZ-OS <span className="text-blue-500 font-mono text-sm ml-2">v4.0.0-PRO</span>
          </h1>
          <p className="text-gray-500 mt-1">Enterprise AI Sports Intelligence Operating System</p>
        </div>
        
        <nav className="flex bg-[#111] p-1 rounded-xl border border-gray-800">
          {[
            { id: 'executive', label: 'Executive' },
            { id: 'intelligence', label: 'Deep Intel' },
            { id: 'operations', label: 'Ops & Research' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'executive' ? (
            <motion.div 
              key="exec"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Program 4: Executive KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Daily ROI", value: "+8.42%", icon: TrendingUp, color: "text-green-500" },
                  { label: "Platform Yield", value: "9.11%", icon: Activity, color: "text-blue-500" },
                  { label: "Prediction Vol.", value: "12,450", icon: BarChart3, color: "text-purple-500" },
                  { label: "Win Rate", value: "76.2%", icon: Target, color: "text-amber-500" }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg bg-[#1a1a1a] ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* ROI Trends */}
              <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white">Performance Benchmarking</h2>
                  <div className="flex gap-4 text-xs font-mono">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Platform ROI</span>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={KPI_DATA}>
                      <defs>
                        <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="roi" stroke="#2563eb" fillOpacity={1} fill="url(#colorRoi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'intelligence' ? (
            <motion.div 
              key="intel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Program 7: Trust & Transparency */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-xs text-blue-500 font-mono mb-1 uppercase tracking-widest">{PREDICTION_REPORT.id}</div>
                      <h2 className="text-2xl font-bold text-white">{PREDICTION_REPORT.fixture}</h2>
                    </div>
                    <div className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-full text-sm font-bold border border-blue-600/20">
                      {PREDICTION_REPORT.prediction}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-2">Model Confidence</div>
                      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${PREDICTION_REPORT.confidence * 100}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                      <div className="mt-2 text-xl font-bold text-white">{(PREDICTION_REPORT.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase mb-2">Scientific Calibration (ECE)</div>
                      <div className="text-xl font-bold text-green-500">{PREDICTION_REPORT.calibration.toFixed(3)}</div>
                      <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">Exceptional Precision</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-blue-500" /> Supporting Evidence
                      </h3>
                      <ul className="space-y-3">
                        {PREDICTION_REPORT.evidence.supporting.map((ev, i) => (
                          <li key={i} className="text-sm text-gray-400 bg-[#1a1a1a] p-3 rounded-lg flex items-center gap-3">
                            <div className="w-1 h-1 bg-green-500 rounded-full" /> {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Factors
                      </h3>
                      <ul className="space-y-3">
                        {PREDICTION_REPORT.evidence.riskFactors.map((ev, i) => (
                          <li key={i} className="text-sm text-gray-400 bg-[#1a1a1a] p-3 rounded-lg flex items-center gap-3">
                            <div className="w-1 h-1 bg-amber-500 rounded-full" /> {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program 2: Governance Side Panel */}
              <div className="space-y-8">
                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> Model Governance
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Model Architecture", value: PREDICTION_REPORT.governance.model },
                      { label: "Build Version", value: PREDICTION_REPORT.governance.version },
                      { label: "Last Retraining", value: PREDICTION_REPORT.governance.retrained },
                      { label: "Deployment State", value: "Production" }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                        <span className="text-xs text-gray-500 uppercase">{row.label}</span>
                        <span className="text-xs font-mono text-gray-200">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <button className="w-full py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-xs font-bold text-gray-300 hover:bg-[#222] transition-colors flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> View Full Model Card
                    </button>
                  </div>
                </div>

                <div className="bg-blue-600/5 p-6 rounded-2xl border border-blue-600/20">
                  <h3 className="text-sm font-bold text-blue-500 flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4" /> Experiment Shadowing
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This prediction is currently being validated by <span className="text-blue-400 font-mono">Challenger-7</span> (Shadow Deployment) to measure statistical superiority.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="ops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Program 1: Data Platform Status */}
                <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-500" /> Global Data Platform
                  </h2>
                  <div className="space-y-4">
                    {[
                      { name: "SportRadar Enterprise", type: "Official", latency: "45ms", health: 99 },
                      { name: "Betfair API-NG", type: "Exchange", latency: "120ms", health: 96 },
                      { name: "OpenWeather Pro", type: "Weather", latency: "310ms", health: 98 }
                    ].map((provider, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                        <div>
                          <div className="text-sm font-bold text-white">{provider.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{provider.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-blue-500">{provider.latency}</div>
                          <div className="text-xs text-green-500">{provider.health}% Health</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Program 5: Portfolio Exposures */}
                <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-500" /> Portfolio Intelligence
                  </h2>
                  <div className="space-y-6">
                    {[
                      { league: "EPL", exposure: 0.5 },
                      { league: "NBA", exposure: 0.42 },
                      { league: "La Liga", exposure: 0.28 }
                    ].map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-400">{p.league} Exposure</span>
                          <span className="text-white">{(p.exposure * 100).toFixed(0)}% of Limit</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${p.exposure * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Program 3: Scientific Experiment Registry */}
              <div className="bg-[#111] p-8 rounded-2xl border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-amber-500" /> Scientific Experiment Registry
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
                        <th className="pb-4 font-medium">Experiment</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Significance</th>
                        <th className="pb-4 font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {[
                        { name: "LSTM Fatigue Integration", status: "Promoted", p: "0.003", impact: "High" },
                        { name: "Referee Sentiment Analysis", status: "Archived", p: "0.450", impact: "Low" },
                        { name: "Var-Intervention Drift", status: "Running", p: "0.021", impact: "Medium" }
                      ].map((exp, i) => (
                        <tr key={i} className="border-b border-gray-800/50 last:border-0">
                          <td className="py-4 font-medium text-white">{exp.name}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${exp.status === 'Promoted' ? 'bg-green-500/10 text-green-500' : exp.status === 'Archived' ? 'bg-gray-500/10 text-gray-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {exp.status}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-xs text-amber-500">p={exp.p}</td>
                          <td className="py-4 text-xs">{exp.impact}</td>
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

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-xs tracking-widest uppercase">
          Confidential & Proprietary • 43B3TZ-OS Scientific Intelligence Division
        </p>
      </footer>
    </div>
  );
};

export default App;
