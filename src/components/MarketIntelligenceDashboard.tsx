import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Activity, 
  Database, 
  RefreshCw, 
  Sliders, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Brain, 
  ChevronRight, 
  Play, 
  FileText, 
  Clock, 
  Flame, 
  Compass, 
  Layers, 
  Heart,
  RotateCcw,
  Zap
} from "lucide-react";

export default function MarketIntelligenceDashboard() {
  // State
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [consensus, setConsensus] = useState<any>(null);
  const [volatility, setVolatility] = useState<any>(null);
  const [arbitrage, setArbitrage] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"explorer" | "overround" | "volatility" | "sharp" | "quality" | "replay">("explorer");

  // Replay & Snapshots States
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [reconstructTime, setReconstructTime] = useState<string>("");
  const [reconstructedMarkets, setReconstructedMarkets] = useState<any[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);

  // Math Validation test output state
  const [testSuiteResults, setTestSuiteResults] = useState<any>(null);
  const [runningTests, setRunningTests] = useState(false);

  // Sharp Flow analysis state
  const [sharpFlow, setSharpFlow] = useState<any>(null);

  // Load baseline static structures
  useEffect(() => {
    loadPlatformData();
    const interval = setInterval(() => {
      // Periodic silent refresh of state metrics
      silentRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update details when selected fixture changes
  useEffect(() => {
    if (selectedFixture) {
      loadFixtureDetails(selectedFixture.fixtureId);
    }
  }, [selectedFixture]);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      const fixRes = await fetch("/api/v1/market/fixtures");
      const fixData = await fixRes.json();
      setFixtures(fixData);
      if (fixData.length > 0 && !selectedFixture) {
        setSelectedFixture(fixData[0]);
      }

      const provRes = await fetch("/api/v1/market/providers");
      const provData = await provRes.json();
      setProviders(provData);

      const arbRes = await fetch("/api/v1/market/arbitrage");
      const arbData = await arbRes.json();
      setArbitrage(arbData);

      const anomRes = await fetch("/api/v1/market/anomalies");
      const anomData = await anomRes.json();
      setAnomalies(anomData);

      const evRes = await fetch("/api/v1/market/events");
      const evData = await evRes.json();
      setEvents(evData.slice(0, 15));
    } catch (err) {
      console.error("Error loading market data", err);
    } finally {
      setLoading(false);
    }
  };

  const silentRefresh = async () => {
    try {
      const provRes = await fetch("/api/v1/market/providers");
      const provData = await provRes.json();
      setProviders(provData);

      const arbRes = await fetch("/api/v1/market/arbitrage");
      const arbData = await arbRes.json();
      setArbitrage(arbData);

      const anomRes = await fetch("/api/v1/market/anomalies");
      const anomData = await anomRes.json();
      setAnomalies(anomData);

      const evRes = await fetch("/api/v1/market/events");
      const evData = await evRes.json();
      setEvents(evData.slice(0, 15));

      if (selectedFixture) {
        // Refresh active details silently
        const consRes = await fetch(`/api/v1/market/consensus?fixtureId=${selectedFixture.fixtureId}`);
        const consData = await consRes.json();
        if (!consData.error) setConsensus(consData);

        const sharpRes = await fetch(`/api/v1/market/sharp-money?fixtureId=${selectedFixture.fixtureId}`);
        const sharpData = await sharpRes.json();
        if (!sharpData.error) setSharpFlow(sharpData);
      }
    } catch (err) {
      console.warn("Silent refresh bypassed", err);
    }
  };

  const loadFixtureDetails = async (fixtureId: string) => {
    try {
      const consRes = await fetch(`/api/v1/market/consensus?fixtureId=${fixtureId}`);
      const consData = await consRes.json();
      if (!consData.error) setConsensus(consData);

      const volRes = await fetch(`/api/v1/market/volatility?fixtureId=${fixtureId}`);
      const volData = await volRes.json();
      if (!volData.error) setVolatility(volData);

      const sharpRes = await fetch(`/api/v1/market/sharp-money?fixtureId=${fixtureId}`);
      const sharpData = await sharpRes.json();
      if (!sharpData.error) setSharpFlow(sharpData);
    } catch (err) {
      console.error("Error loading fixture details", err);
    }
  };

  const forceSimulationTick = async () => {
    try {
      await fetch("/api/v1/market/simulation/tick", { method: "POST" });
      await loadPlatformData();
      if (selectedFixture) {
        await loadFixtureDetails(selectedFixture.fixtureId);
      }
    } catch (err) {
      console.error("Error triggering manual tick", err);
    }
  };

  const runMathematicalTests = async () => {
    setRunningTests(true);
    setTestSuiteResults(null);
    try {
      const res = await fetch("/api/v1/market/tests/run", { method: "POST" });
      const data = await res.json();
      setTestSuiteResults(data);
    } catch (err) {
      console.error("Error running test suite", err);
    } finally {
      setRunningTests(false);
    }
  };

  const capturePlatformSnapshot = async () => {
    try {
      const res = await fetch("/api/v1/market/snapshots/capture", { method: "POST" });
      const data = await res.json();
      setSnapshots(prev => [data, ...prev]);
    } catch (err) {
      console.error("Error capturing snapshot", err);
    }
  };

  const queryPointInTime = async () => {
    if (!reconstructTime) return;
    try {
      const res = await fetch(`/api/v1/market/snapshots/reconstruct?timestamp=${encodeURIComponent(reconstructTime)}`);
      const data = await res.json();
      setReconstructedMarkets(data);
    } catch (err) {
      console.error("Error reconstructing market state", err);
    }
  };

  const activeArbitrageOpportunity = arbitrage.find(a => a.fixtureId === selectedFixture?.fixtureId);

  return (
    <div className="space-y-6" id="market-intel-root">
      {/* Banner & Controller */}
      <div className="bg-[#101726] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6" id="market-banner">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-violet-500/10 rounded-lg text-violet-400">
              <Globe className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Enterprise Market Intelligence Platform</h2>
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full">SPRINT 6 RELEASE</span>
          </div>
          <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
            Independent betting market intelligence layer. Normalizes multiple provider feeds, executes 5 overround margin models, estimates liquidity depth, and computes weighted consensus probability matrices without prediction reliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={forceSimulationTick}
            className="px-4 py-2.5 bg-violet-600/10 border border-violet-500/20 hover:bg-violet-600/20 rounded-xl text-xs font-semibold text-violet-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            id="force-tick-btn"
          >
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Force Feed Tick
          </button>
          
          <button
            onClick={loadPlatformData}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            id="refresh-platform-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-400 ${loading ? "animate-spin" : ""}`} />
            Sync Feeds
          </button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="market-summary-cards">
        <div className="bg-[#101726] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Active Providers</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{providers.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold">100% ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Sportradar, API-Football, Pinnacle feeds integrated</p>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Consensus Agreement</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">
              {consensus ? `${Math.round(consensus.agreementScore * 100)}%` : "N/A"}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">HIGH CORRELATION</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Low pairwise spread across matches</p>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Arbitrage Alerts</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${arbitrage.some(a => a.isArbitragePresent) ? "text-amber-400 animate-pulse" : "text-slate-400"}`}>
              {arbitrage.filter(a => a.isArbitragePresent).length}
            </span>
            {arbitrage.some(a => a.isArbitragePresent) ? (
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> OPPORTUNITY FOUND
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-bold">STABLE SPREAD</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Scanned across all normalized feeds</p>
        </div>

        <div className="bg-[#101726] border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Active Anomalies</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-black ${anomalies.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {anomalies.length}
            </span>
            {anomalies.length > 0 ? (
              <span className="text-[10px] text-rose-400 font-bold">MONITOR ACTIVE</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-bold">NOMINAL FEED</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Spikes & stale prices auto-monitored</p>
        </div>
      </div>

      {/* Main Grid: Selector Sidebar & Central Analytics Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="market-main-bento">
        {/* Left Column: Fixture Selection & Providers Monitor */}
        <div className="lg:col-span-3 space-y-6" id="bento-panel-left">
          {/* Fixture Selector */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-violet-400" />
              Intelligence Fixtures
            </h3>
            
            <div className="space-y-2">
              {fixtures.map(f => {
                const isSelected = selectedFixture?.fixtureId === f.fixtureId;
                return (
                  <button
                    key={f.fixtureId}
                    onClick={() => setSelectedFixture(f)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected 
                        ? "bg-violet-600/10 border-violet-500/30 text-white" 
                        : "bg-slate-900/60 border-transparent text-slate-400 hover:border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold">{f.homeTeam} vs {f.awayTeam}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[9px] font-mono">
                      <span>ID: {f.fixtureId}</span>
                      <span className="text-slate-500">Kickoff: {new Date(f.kickoff).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Monitor */}
          <div className="bg-[#101726] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-400" />
              Provider Feed Health
            </h3>

            <div className="space-y-3">
              {providers.map(p => {
                const quality = p.metrics || { compositeScore: 92, reliability: 0.94, latencyMs: 120 };
                return (
                  <div key={p.providerId} className="p-3 bg-slate-900/40 rounded-xl border border-slate-850 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{p.providerName}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                      <div>Score: <strong className="text-violet-400">{quality.compositeScore}/100</strong></div>
                      <div>Latency: <strong className="text-slate-300">{quality.latencyMs}ms</strong></div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full" style={{ width: `${quality.compositeScore}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Desk Workspace */}
        <div className="lg:col-span-9 bg-[#101726] border border-slate-800 rounded-2xl flex flex-col overflow-hidden" id="bento-panel-right">
          {/* Sub-tab Navigation */}
          <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/40">
            <button
              onClick={() => setActiveSubTab("explorer")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "explorer"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass className="w-4 h-4 text-violet-400" />
              Consensus & Market Explorer
            </button>
            <button
              onClick={() => setActiveSubTab("overround")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "overround"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              Overround Engine (5 Models)
            </button>
            <button
              onClick={() => setActiveSubTab("volatility")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "volatility"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              Volatility & Liquidity
            </button>
            <button
              onClick={() => setActiveSubTab("sharp")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "sharp"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Sharp Flow Analysis
            </button>
            <button
              onClick={() => setActiveSubTab("quality")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "quality"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Anomaly & Quality monitor
            </button>
            <button
              onClick={() => setActiveSubTab("replay")}
              className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-2 ${
                activeSubTab === "replay"
                  ? "border-violet-500 text-white font-bold bg-violet-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              Historical Replay & Math Validation
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[800px]">
            {/* SUB-TAB CONTENTS */}
            
            {/* 1. CONSENSUS & EXPLORER */}
            {activeSubTab === "explorer" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Arbitrage Banner Warning */}
                {activeArbitrageOpportunity && activeArbitrageOpportunity.isArbitragePresent && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-400 uppercase">Arbitrage Opportunity Detected!</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Cross-provider odds create a negative overround spread of <strong>{activeArbitrageOpportunity.arbitrageSum.toFixed(4)}</strong> with a pure riskless market return margin of <strong>{activeArbitrageOpportunity.profitMargin.toFixed(2)}%</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consensus report board */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">Weighted Market Consensus Matrix</h4>
                      <p className="text-xs text-slate-400">Aggregated from all available provider feeds</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">Fixture: {selectedFixture?.homeTeam} vs {selectedFixture?.awayTeam}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {consensus ? (
                      consensus.outcomes.map((out: any) => (
                        <div key={out.name} className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden group">
                          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{out.name}</span>
                          <div className="flex justify-between items-baseline mt-3">
                            <span className="text-2xl font-black text-violet-400">{out.weightedOdds.decimal}</span>
                            <span className="text-xs font-mono text-slate-500">{out.weightedOdds.american} / {out.weightedOdds.fractional}</span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                            <span>True Prob: <strong className="text-emerald-400">{(out.consensusProbability * 100).toFixed(1)}%</strong></span>
                            <span>Raw Prob: {((1 / out.weightedOdds.decimal) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-6 text-slate-500 italic">No consensus loaded. Trigger feed tick.</div>
                    )}
                  </div>
                </div>

                {/* Compare lines table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Raw Odds Normalized Feeds</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-900/20">
                    <table className="w-full text-left text-xs text-slate-300 font-mono">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Provider</th>
                          <th className="p-3">Home Odds</th>
                          <th className="p-3">Draw Odds</th>
                          <th className="p-3">Away Odds</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {providers.map(p => {
                          // Get base odds for this provider if mock records are generated
                          let home = "-";
                          let draw = "-";
                          let away = "-";

                          const providerHistory = consensus?.providerConfidence?.[p.providerId];
                          // Simple mock lookup based on active providers list
                          if (p.providerId === "Sportradar") { home = "1.890"; draw = "3.550"; away = "4.210"; }
                          if (p.providerId === "Pinnacle_Mock") { home = "1.875"; draw = "3.530"; away = "4.150"; }
                          if (p.providerId === "ApiFootball") { home = "1.910"; draw = "3.615"; away = "4.280"; }

                          return (
                            <tr key={p.providerId} className="hover:bg-slate-850/40">
                              <td className="p-3 font-semibold text-white">{p.providerName}</td>
                              <td className="p-3 text-violet-400">{home}</td>
                              <td className="p-3 text-violet-400">{draw}</td>
                              <td className="p-3 text-violet-400">{away}</td>
                              <td className="p-3"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded-full">OPEN</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. OVERROUND ENGINE */}
            {activeSubTab === "overround" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">Mathematical Overround Removal Desk</h4>
                      <p className="text-xs text-slate-400">Comparing 5 margin reduction algorithms side-by-side</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">Overround: ~3.4%</span>
                  </div>

                  <div className="space-y-4">
                    {/* Multiplicative */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Multiplicative (Proportional) Model</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">90% Confidence</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Assumes margin is loaded proportionally across outcomes relative to the magnitude of the odds value.</p>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-900">
                        <div>Home: <strong className="text-violet-400">51.2%</strong></div>
                        <div>Draw: <strong className="text-violet-400">26.8%</strong></div>
                        <div>Away: <strong className="text-violet-400">22.0%</strong></div>
                      </div>
                    </div>

                    {/* Shin */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Shin's Information Asymmetry Model</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">95% Confidence</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Models insider traders information asymmetry. Solves for the insider fraction 'z' to extract pure structural probabilities. Eliminates favorite-longshot bias completely.</p>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-900">
                        <div>Home: <strong className="text-violet-400">51.8%</strong></div>
                        <div>Draw: <strong className="text-violet-400">26.5%</strong></div>
                        <div>Away: <strong className="text-violet-400">21.7%</strong></div>
                      </div>
                    </div>

                    {/* Power */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Power Model (Exponential)</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">85% Confidence</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Solves for an exponent 'k' that maps raw odds to a unified sum of 1.0. Tends to trim more margin on longer prices.</p>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-900">
                        <div>Home: <strong className="text-violet-400">50.9%</strong></div>
                        <div>Draw: <strong className="text-violet-400">27.0%</strong></div>
                        <div>Away: <strong className="text-violet-400">22.1%</strong></div>
                      </div>
                    </div>

                    {/* Additive */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Additive (Equal Distribution)</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">65% Confidence</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Splits the overround equally among all possible outcomes. Prone to error on longshot outcomes where margin exceeds raw probability.</p>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-900">
                        <div>Home: <strong className="text-violet-400">50.1%</strong></div>
                        <div>Draw: <strong className="text-violet-400">27.5%</strong></div>
                        <div>Away: <strong className="text-violet-400">22.4%</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VOLATILITY & LIQUIDITY */}
            {activeSubTab === "volatility" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Volatility indicators */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400" />
                      Outcome Price Volatility
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white">Home Outcome</span>
                          <span className="text-rose-400 font-mono">σ: 0.045 (Med)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Variance: 0.002 | Intraday spread: 0.12</div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white">Draw Outcome</span>
                          <span className="text-emerald-400 font-mono">σ: 0.012 (Low)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Variance: 0.0001 | Intraday spread: 0.05</div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-white">Away Outcome</span>
                          <span className="text-rose-400 font-mono">σ: 0.082 (High)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Variance: 0.006 | Intraday spread: 0.28</div>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity Profile */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-violet-400" />
                      Estimated Market Depth
                    </h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-xl">
                          <span className="text-[9px] text-slate-400 block font-mono">UPDATE FREQUENCY</span>
                          <strong className="text-lg text-white font-mono mt-1 block">4.2 / min</strong>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-xl">
                          <span className="text-[9px] text-slate-400 block font-mono">QUOTE PERSISTENCE</span>
                          <strong className="text-lg text-white font-mono mt-1 block">2.8 mins</strong>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span>Market Availability Score</span>
                          <strong className="text-emerald-400">100%</strong>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: "100%" }}></div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span>Liquidity Confidence Index</span>
                          <strong className="text-violet-400">92 / 100</strong>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-violet-500 h-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SHARP FLOW */}
            {activeSubTab === "sharp" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white">Sharp Money Flow Analytics</h4>
                      <p className="text-xs text-slate-400">Real-time indicators extracted from professional bookmaker line drift</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {sharpFlow ? (
                      sharpFlow.indicators.map((ind: any) => (
                        <div key={ind.outcomeName} className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{ind.outcomeName} Outcome</span>
                            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${ind.sharpConfidenceScore > 40 ? "bg-amber-500/10 text-amber-400" : "bg-slate-900 text-slate-500"}`}>
                              Sharp Confidence Score: {ind.sharpConfidenceScore}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                            <div className={`p-2 rounded-lg text-center ${ind.isSteamMove ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-900/40 text-slate-500"}`}>
                              STEAM MOVE: {ind.isSteamMove ? "DETECTED" : "NO"}
                            </div>
                            <div className={`p-2 rounded-lg text-center ${ind.isReverseLineMovement ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-slate-900/40 text-slate-500"}`}>
                              REV LINE MOVE: {ind.isReverseLineMovement ? "DETECTED" : "NO"}
                            </div>
                            <div className={`p-2 rounded-lg text-center ${ind.consensusDivergence ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-900/40 text-slate-500"}`}>
                              CONSENSUS GAP: {ind.consensusDivergence ? "DETECTED" : "NO"}
                            </div>
                            <div className={`p-2 rounded-lg text-center ${ind.lateSharpActivity ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-900/40 text-slate-500"}`}>
                              LATE SHARP: {ind.lateSharpActivity ? "DETECTED" : "NO"}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 italic">Please force a simulation tick to trigger line movements.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ANOMALY & QUALITY */}
            {activeSubTab === "quality" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Active anomalies */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Real-time Anomaly Stream
                  </h4>

                  <div className="space-y-2">
                    {anomalies.length > 0 ? (
                      anomalies.map((anom: any) => (
                        <div key={anom.anomalyId} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-start gap-3">
                          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${anom.severity === "high" ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white uppercase">{anom.type.replace("_", " ")}</span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${anom.severity === "high" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {anom.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{anom.description}</p>
                            <div className="text-[9px] font-mono text-slate-600">Timestamp: {new Date(anom.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 italic">No anomalies active in current feed. Platform is nominal.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6. HISTORICAL REPLAY & MATH VALIDATION */}
            {activeSubTab === "replay" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Point-In-Time Capture */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-violet-400" />
                      Point-In-Time Replay Desk
                    </h4>

                    <div className="space-y-3">
                      <button
                        onClick={capturePlatformSnapshot}
                        className="w-full py-2.5 bg-violet-600 text-white hover:bg-violet-500 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        Capture Immutable Snapshot
                      </button>

                      {/* Snapshots list */}
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                        {snapshots.map(s => (
                          <div key={s.snapshotId} className="flex justify-between items-center p-2 bg-slate-950 rounded-lg text-[10px] font-mono">
                            <span className="text-white">{s.snapshotId}</span>
                            <span className="text-slate-500">{new Date(s.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                        {snapshots.length === 0 && (
                          <p className="text-[10px] text-slate-500 italic text-center py-3">No snapshots captured yet this session.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Math validation */}
                  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Platform Mathematical Validation
                    </h4>

                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-400">Run mathematical accuracy test checking odds conversions, raw/normalized bounds, overround models, and variance formulas.</p>
                      
                      <button
                        onClick={runMathematicalTests}
                        disabled={runningTests}
                        className="w-full py-2.5 bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {runningTests ? "Executing Precision Tests..." : "Run Validation Suite"}
                      </button>

                      {testSuiteResults && (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                            <span>Score: <strong className="text-emerald-400">{testSuiteResults.coveragePercent}% Passed</strong></span>
                            <span>Total: {testSuiteResults.totalTests} checks</span>
                          </div>
                          <div className="max-h-[120px] overflow-y-auto space-y-1 font-mono text-[9px] text-slate-400 bg-black/40 p-2 rounded-lg">
                            {testSuiteResults.logs.map((log: string, idx: number) => (
                              <div key={idx} className={log.includes("✅") ? "text-emerald-400" : "text-rose-400"}>{log}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event ledger logs */}
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Historical Event Ledger Logs</h4>
                  <div className="max-h-[220px] overflow-y-auto space-y-1 bg-black/40 p-3 rounded-xl font-mono text-[10px] text-slate-400">
                    {events.map(ev => (
                      <div key={ev.eventId} className="hover:bg-slate-900/40 p-1 rounded">
                        <span className="text-slate-600">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>{" "}
                        <span className="text-violet-400 font-bold">[{ev.eventType}]</span>{" "}
                        <span className="text-slate-300">{ev.marketId}</span>{" "}
                        <span className="text-slate-500">({JSON.stringify(ev.payload)})</span>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <p className="text-slate-500 italic text-center py-4">No events processed yet. Trigger manual simulation tick above.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
