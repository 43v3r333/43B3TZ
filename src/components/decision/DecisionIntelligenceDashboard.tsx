
import React, { useState, useEffect } from "react";
import { Brain, TrendingUp, AlertTriangle, ChevronRight, Activity, ShieldCheck, Zap, Compass, BarChart2 } from "lucide-react";

export default function DecisionIntelligenceDashboard() {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<any>(null);

  const runDecision = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/decision/run", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketType: "match_outcome", entityId: "fixture-1", predictionId: "pred-1", marketId: "market-1" })
      });
      const data = await res.json();
      setDecision(data);
    } catch (err) {
      console.error("Error running decision", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="decision-intel-root">
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Enterprise Decision Intelligence Platform</h2>
          <p className="text-xs text-slate-400">Analytical decision support engine. No automation, no betting.</p>
        </div>
        <button
          onClick={runDecision}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 rounded-xl text-xs font-semibold text-emerald-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          Run Analytical Decision
        </button>
      </div>

      {decision && (
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Decision Intelligence Output</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 font-mono">Composite Score</span>
                <div className="text-3xl font-black text-emerald-400">{decision.scoring.compositeScore}</div>
             </div>
             <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 font-mono">Risk Score</span>
                <div className="text-3xl font-black text-rose-400">{decision.scoring.riskScore}</div>
             </div>
          </div>
          {/* Add more detailed visualization here */}
        </div>
      )}
    </div>
  );
}
