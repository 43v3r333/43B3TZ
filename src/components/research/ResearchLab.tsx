import React, { useState } from "react";
import { FlaskConical, Play, BarChart3, BookOpenText } from "lucide-react";

export default function ResearchLab() {
  const [experiments, setExperiments] = useState<any[]>([]);

  const startExperiment = () => {
    setExperiments([
      ...experiments,
      { id: Date.now(), name: "New Experiment", status: "running" }
    ]);
  };

  return (
    <div className="space-y-6" id="research-lab-root">
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">AI Research Lab</h2>
          <p className="text-xs text-slate-400">Isolated experimentation environment. No production impact.</p>
        </div>
        <button
          onClick={startExperiment}
          className="px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 rounded-xl text-xs font-semibold text-indigo-300 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          Start New Experiment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
          <FlaskConical className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">Active Experiments</h3>
          <div className="text-3xl font-black text-white">{experiments.length}</div>
        </div>
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">Leaderboard</h3>
          <div className="text-3xl font-black text-white">#1</div>
        </div>
        <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 space-y-4">
          <BookOpenText className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase">Knowledge Base</h3>
          <div className="text-3xl font-black text-white">14</div>
        </div>
      </div>
    </div>
  );
}
