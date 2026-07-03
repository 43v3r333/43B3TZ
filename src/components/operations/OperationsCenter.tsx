
import React, { useState } from "react";
import { Activity, ShieldCheck, BarChart2, AlertTriangle, RefreshCw } from "lucide-react";

export default function OperationsCenter() {
  const [activeView, setActiveView] = useState("overview");

  return (
    <div className="space-y-6" id="operations-center-root">
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">Operations Center</h2>
          <p className="text-xs text-slate-400">System health, risk metrics, and platform readiness.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2">
             <RefreshCw className="w-3.5 h-3.5" />
             Refresh
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase">System Risk</h3>
            </div>
            <div className="text-3xl font-black text-white">12%</div>
            <p className="text-[10px] text-slate-500">Low operational risk profile.</p>
        </div>
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase">Platform Health</h3>
            </div>
            <div className="text-3xl font-black text-white">99.9%</div>
            <p className="text-[10px] text-slate-500">All systems operational.</p>
        </div>
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase">Portfolio Volatility</h3>
            </div>
            <div className="text-3xl font-black text-white">8.4%</div>
            <p className="text-[10px] text-slate-500">Within acceptable bounds.</p>
        </div>
      </div>
    </div>
  );
}
