import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Wind, 
  Dribbble, 
  User, 
  Scale, 
  BarChart2, 
  Activity, 
  ShieldAlert,
  Search,
  History,
  Timer
} from "lucide-react";

export default function SportsIntelligenceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"teams" | "players" | "elo" | "xg" | "form" | "fatigue" | "referees" | "market" | "spi" | "quality" | "history">("elo");
  const [loading, setLoading] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testPassed, setTestPassed] = useState<boolean | null>(null);

  // Data states
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [elos, setElos] = useState<any[]>([]);
  const [xgs, setXgs] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [fatigues, setFatigues] = useState<any[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [spis, setSpis] = useState<any[]>([]);
  const [qualities, setQualities] = useState<any[]>([]);
  
  // Historical snapshots & PIT state
  const [searchEntityId, setSearchEntityId] = useState("team-1");
  const [searchEntityType, setSearchEntityType] = useState("team");
  const [pitTimestamp, setPitTimestamp] = useState(new Date().toISOString());
  const [historyResults, setHistoryResults] = useState<any[]>([]);
  const [pitResult, setPitResult] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const loadAllIntelligenceData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/v1/intelligence/storage/stats");
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const teamRes = await fetch("/api/v1/intelligence/teams");
      const teamData = await teamRes.json();
      if (teamData.success) setTeams(teamData.records);

      const playerRes = await fetch("/api/v1/intelligence/players");
      const playerData = await playerRes.json();
      if (playerData.success) setPlayers(playerData.records);

      const eloRes = await fetch("/api/v1/intelligence/elo");
      const eloData = await eloRes.json();
      if (eloData.success) setElos(eloData.records);

      const xgRes = await fetch("/api/v1/intelligence/xg");
      const xgData = await xgRes.json();
      if (xgData.success) setXgs(xgData.records);

      const formRes = await fetch("/api/v1/intelligence/form");
      const formData = await formRes.json();
      if (formData.success) setForms(formData.records);

      const fatigueRes = await fetch("/api/v1/intelligence/fatigue");
      const fatigueData = await fatigueRes.json();
      if (fatigueData.success) setFatigues(fatigueData.records);

      const refRes = await fetch("/api/v1/intelligence/referee");
      const refData = await refRes.json();
      if (refData.success) setReferees(refData.records);

      const marketRes = await fetch("/api/v1/intelligence/market");
      const marketData = await marketRes.json();
      if (marketData.success) setMarkets(marketData.records);

      const spiRes = await fetch("/api/v1/intelligence/spi");
      const spiData = await spiRes.json();
      if (spiData.success) setSpis(spiData.records);

      const qualRes = await fetch("/api/v1/intelligence/quality");
      const qualData = await qualRes.json();
      if (qualData.success) setQualities(qualData.records);

    } catch (err: any) {
      console.error("Error loading intelligence data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllIntelligenceData();
  }, []);

  const triggerHistoricalReplay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/intelligence/replay", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await loadAllIntelligenceData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runVerificationTests = async () => {
    setLoading(true);
    setTestOutput("Executing rigorous integration tests against Sports Intelligence Platform...");
    setTestPassed(null);
    try {
      const res = await fetch("/api/v1/intelligence/tests/run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTestPassed(true);
        setTestOutput(data.message);
        await loadAllIntelligenceData();
      } else {
        setTestPassed(false);
        setTestOutput(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setTestPassed(false);
      setTestOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const querySnapshotsHistory = async () => {
    try {
      const res = await fetch(`/api/v1/intelligence/snapshots/history?entityId=${searchEntityId}&entityType=${searchEntityType}`);
      const data = await res.json();
      if (data.success) {
        setHistoryResults(data.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const queryPointInTime = async () => {
    try {
      const res = await fetch(`/api/v1/intelligence/snapshots/pit?entityId=${searchEntityId}&entityType=${searchEntityType}&timestamp=${encodeURIComponent(pitTimestamp)}`);
      const data = await res.json();
      if (data.success) {
        setPitResult(data.snapshot);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterData = (list: any[], keySelector: (item: any) => string) => {
    if (!searchTerm) return list;
    return list.filter(item => keySelector(item).toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <div className="space-y-6" id="sports-intel-platform">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full uppercase">
              Deterministic Layer
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">Sports Intelligence Platform</h2>
          <p className="text-xs text-slate-400 mt-1">
            Converts normalized sports fixtures, weather logs, and market liquidity into pristine, downstream-ready intelligence matrices.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={loadAllIntelligenceData}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Platform
          </button>
          
          <button
            onClick={triggerHistoricalReplay}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run Historical Replay
          </button>

          <button
            onClick={runVerificationTests}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5 transition-all shadow-lg shadow-violet-600/10"
          >
            <Activity className="w-3.5 h-3.5" />
            Verify Tests
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">ELO RATINGS</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-400 block mt-1">
            {stats?.eloRatings || 0} <span className="text-xs text-slate-400 font-normal">calc</span>
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">xG PERFORMANCE</span>
          <span className="text-2xl font-mono font-extrabold text-blue-400 block mt-1">
            {stats?.xgMetrics || 0} <span className="text-xs text-slate-400 font-normal">eval</span>
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">FORM RUNS</span>
          <span className="text-2xl font-mono font-extrabold text-yellow-500 block mt-1">
            {stats?.formMetrics || 0} <span className="text-xs text-slate-400 font-normal">teams</span>
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">FATIGUE TRACK</span>
          <span className="text-2xl font-mono font-extrabold text-red-400 block mt-1">
            {stats?.fatigueMetrics || 0} <span className="text-xs text-slate-400 font-normal">entities</span>
          </span>
        </div>
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/20 col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 block">PIT SNAPSHOTS</span>
          <span className="text-2xl font-mono font-extrabold text-purple-400 block mt-1">
            {stats?.totalSnapshots || 0} <span className="text-xs text-slate-400 font-normal">PIT</span>
          </span>
        </div>
      </div>

      {/* TEST RUNNER REPORTING BOX */}
      {testOutput && (
        <div className={`p-4 rounded-xl border ${testPassed === true ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : testPassed === false ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-slate-900 border-slate-800 text-slate-400"} text-xs flex gap-3 items-start`}>
          {testPassed === true ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : testPassed === false ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 animate-spin" />
          )}
          <div className="space-y-1">
            <span className="font-semibold uppercase font-mono block">VERIFICATION TEST SUITE</span>
            <p className="font-mono whitespace-pre-wrap">{testOutput}</p>
          </div>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
        {[
          { id: "elo", label: "Elo Ratings", icon: TrendingUp },
          { id: "xg", label: "Expected Goals (xG)", icon: BarChart2 },
          { id: "form", label: "Team Form & Momentum", icon: Activity },
          { id: "fatigue", label: "Fatigue & Travel", icon: ShieldAlert },
          { id: "referees", label: "Referee Metrics", icon: Scale },
          { id: "market", label: "Market Intelligence", icon: Timer },
          { id: "spi", label: "SPI Index", icon: Dribbble },
          { id: "quality", label: "Metric Quality", icon: CheckCircle2 },
          { id: "history", label: "PIT Snapshot Recovery", icon: History }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === t.id
                ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH AND FILTER */}
      {activeTab !== "history" && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search intelligence ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-lg text-white font-medium outline-none transition-all placeholder-slate-500"
          />
        </div>
      )}

      {/* TAB VIEWPORTS */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/20">
        {activeTab === "elo" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Elo Rating Index</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Team ID</th>
                    <th className="py-3 px-4">Elo Rating</th>
                    <th className="py-3 px-4">Home Advantage Boost</th>
                    <th className="py-3 px-4">Relegation Risk Indicator</th>
                    <th className="py-3 px-4">Timeline Records</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(elos, e => e.teamId).map((e) => (
                    <tr key={e.teamId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{e.teamId}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-extrabold">{e.rating}</td>
                      <td className="py-3 px-4 font-mono">+{e.homeAdvantage} pts</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${e.relegationRisk > 0.5 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                          {(e.relegationRisk * 100).toFixed(0)}% Risk
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[10px]">
                        {e.history?.length || 0} updates
                      </td>
                    </tr>
                  ))}
                  {elos.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                        No Elo ratings compiled. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "xg" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Expected Goals (xG) Engine Outcomes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Fixture ID</th>
                    <th className="py-3 px-4">Home xG</th>
                    <th className="py-3 px-4">Away xG</th>
                    <th className="py-3 px-4">Shot Quality (H/A)</th>
                    <th className="py-3 px-4">Expected Points (H/A)</th>
                    <th className="py-3 px-4">Finishing Efficiency (H/A)</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(xgs, x => x.fixtureId).map((x) => (
                    <tr key={x.fixtureId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{x.fixtureId}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{x.xGHome.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{x.xGAway.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        {x.shotQualityHome?.toFixed(2)} / {x.shotQualityAway?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">
                        {x.expectedPointsHome?.toFixed(1)} / {x.expectedPointsAway?.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-400">
                        {x.finishingEfficiencyHome?.toFixed(2)}x / {x.finishingEfficiencyAway?.toFixed(2)}x
                      </td>
                    </tr>
                  ))}
                  {xgs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No xG metrics compiled. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "form" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Form & Directional Momentum</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Team ID</th>
                    <th className="py-3 px-4">Last 5 Runs</th>
                    <th className="py-3 px-4">Weighted Form Index</th>
                    <th className="py-3 px-4">Opponent Adjusted</th>
                    <th className="py-3 px-4">Trend Momentum</th>
                    <th className="py-3 px-4">Trend Direction</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(forms, f => f.entityId).map((f) => (
                    <tr key={f.entityId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{f.entityId}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 font-mono font-bold text-[10px]">
                          {f.last5?.map((outcome: string, idx: number) => (
                            <span key={idx} className={`px-1.5 py-0.5 rounded ${outcome === "W" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : outcome === "D" ? "bg-amber-500/15 text-amber-400 border border-amber-500/25" : "bg-red-500/15 text-red-400 border border-red-500/25"}`}>
                              {outcome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">{f.weightedForm}%</td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{f.opponentStrengthAdjusted}%</td>
                      <td className="py-3 px-4 font-mono text-purple-400 font-extrabold">{f.momentum} / 100</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${f.trendDirection === "rising" ? "bg-emerald-500/10 text-emerald-400" : f.trendDirection === "falling" ? "bg-red-500/10 text-red-400" : "bg-slate-800 text-slate-400"}`}>
                          {f.trendDirection}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {forms.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No team form indices compiled. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "fatigue" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fatigue & Recovery Indicators</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Days Rest</th>
                    <th className="py-3 px-4">Last Travel Distance</th>
                    <th className="py-3 px-4">21-Day Fixture Count</th>
                    <th className="py-3 px-4">Back to Back Matches</th>
                    <th className="py-3 px-4">Recovery Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(fatigues, f => f.entityId).map((f) => (
                    <tr key={f.entityId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{f.entityId}</td>
                      <td className="py-3 px-4 font-mono text-indigo-400 font-bold">{f.daysRest} days</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{f.travelDistance} km</td>
                      <td className="py-3 px-4 font-mono font-semibold">{f.fixtureCongestion} fixtures</td>
                      <td className="py-3 px-4 font-mono font-bold text-[10px]">{f.backToBackMatches ? "YES" : "NO"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className={`h-full rounded-full ${f.recoveryScore > 75 ? "bg-emerald-500" : f.recoveryScore > 45 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${f.recoveryScore}%` }} />
                          </div>
                          <span className={`font-mono font-bold ${f.recoveryScore > 75 ? "text-emerald-400" : f.recoveryScore > 45 ? "text-amber-400" : "text-red-400"}`}>
                            {f.recoveryScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {fatigues.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No fatigue metrics calculated. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "referees" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Referee Booking & Bias Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Referee Name</th>
                    <th className="py-3 px-4">Avg Yellows</th>
                    <th className="py-3 px-4">Avg Reds</th>
                    <th className="py-3 px-4">Avg Penalties</th>
                    <th className="py-3 px-4">Strictness Score</th>
                    <th className="py-3 px-4">Home Bias Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(referees, r => r.name).map((r) => (
                    <tr key={r.refereeId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white">{r.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-yellow-500">{r.cardsYellow} yellows</td>
                      <td className="py-3 px-4 font-mono font-bold text-red-500">{r.cardsRed} reds</td>
                      <td className="py-3 px-4 font-mono">{r.penalties} pen</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-blue-400">{r.historicalTendencies?.strictnessScore} / 100</td>
                      <td className="py-3 px-4 font-mono text-purple-400 font-bold">{r.homeBias}x</td>
                    </tr>
                  ))}
                  {referees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No referee metrics catalogued. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "market" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Odds Liquidity & Market Signals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Fixture ID</th>
                    <th className="py-3 px-4">Opening (H/D/A)</th>
                    <th className="py-3 px-4">Closing (H/D/A)</th>
                    <th className="py-3 px-4">Overround Margin</th>
                    <th className="py-3 px-4">Closing Line Value (CLV)</th>
                    <th className="py-3 px-4">Market Signals</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(markets, m => m.fixtureId).map((m) => (
                    <tr key={m.fixtureId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{m.fixtureId}</td>
                      <td className="py-3 px-4 font-mono">
                        {m.openingOdds?.home} / {m.openingOdds?.draw} / {m.openingOdds?.away}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-white">
                        {m.closingOdds?.home} / {m.closingOdds?.draw} / {m.closingOdds?.away}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{(m.overround * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                        {(m.closingLineValue * 100).toFixed(2)}% CLV
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {m.sharpMovement && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              SHARP MOVE
                            </span>
                          )}
                          {m.steamMoves && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              STEAM ALARM
                            </span>
                          )}
                          {!m.sharpMovement && !m.steamMoves && (
                            <span className="text-[10px] text-slate-500 font-mono">STABLE MARKET</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {markets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No betting market metrics calculated. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "spi" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Soccer Power Index (SPI)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Team ID</th>
                    <th className="py-3 px-4">Offense Rating (Exp Goals Scored)</th>
                    <th className="py-3 px-4">Defense Rating (Exp Goals Conceded)</th>
                    <th className="py-3 px-4">Soccer Power Index Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(spis, s => s.teamId).map((s) => (
                    <tr key={s.teamId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{s.teamId}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">+{s.offenseRating} gls</td>
                      <td className="py-3 px-4 font-mono font-bold text-red-400">-{s.defenseRating} gls</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-blue-400 text-sm">{s.spiScore} / 100</td>
                    </tr>
                  ))}
                  {spis.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-mono">
                        No SPI metrics calculated. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "quality" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metric Quality & Reliability Index</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 uppercase font-mono font-bold">
                    <th className="py-3 px-4">Entity ID</th>
                    <th className="py-3 px-4">Freshness Index</th>
                    <th className="py-3 px-4">Field Coverage</th>
                    <th className="py-3 px-4">Source Reliability</th>
                    <th className="py-3 px-4">Confidence Indicator</th>
                  </tr>
                </thead>
                <tbody>
                  {filterData(qualities, q => q.entityId).map((q) => (
                    <tr key={q.entityId} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="py-3 px-4 font-bold text-white font-mono">{q.entityId}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{q.freshness}%</td>
                      <td className="py-3 px-4 font-mono text-blue-400">{q.coverage}%</td>
                      <td className="py-3 px-4 font-mono text-indigo-400">{q.reliability}%</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-purple-400">{q.confidence}%</td>
                    </tr>
                  ))}
                  {qualities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                        No Quality metrics analyzed. Run historical replay first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Entity Type</label>
                <select
                  value={searchEntityType}
                  onChange={(e) => setSearchEntityType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="team">Team</option>
                  <option value="player">Player</option>
                  <option value="elo">Elo Rating</option>
                  <option value="xg">xG</option>
                  <option value="form">Form Run</option>
                  <option value="fatigue">Fatigue Index</option>
                  <option value="referee">Referee</option>
                  <option value="market">Odds Market</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Entity ID</label>
                <input
                  type="text"
                  value={searchEntityId}
                  onChange={(e) => setSearchEntityId(e.target.value)}
                  placeholder="e.g. team-1, player-1"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={querySnapshotsHistory}
                  className="w-full px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex justify-center items-center gap-1.5"
                >
                  <History className="w-4 h-4 text-emerald-400" />
                  Fetch Versions
                </button>
              </div>
            </div>

            {/* VERSION SNAPSHOTS RESULTS */}
            {historyResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase">Version Snapshots Found ({historyResults.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {historyResults.map((h) => (
                    <div key={h.snapshotId} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500">VERSION {h.version}</span>
                        <span className="text-emerald-400 font-bold">{new Date(h.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-[10px] font-mono text-slate-400 overflow-auto max-h-32 p-2 bg-slate-900 rounded border border-slate-800/50">
                        {JSON.stringify(h.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POINT IN TIME FORM */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Point-in-Time Temporal Query</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1.5">Recover State At or Before Timestamp</label>
                  <input
                    type="text"
                    value={pitTimestamp}
                    onChange={(e) => setPitTimestamp(e.target.value)}
                    placeholder="YYYY-MM-DDTHH:MM:SSZ"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <button
                  onClick={queryPointInTime}
                  className="w-full px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow shadow-emerald-500/10 flex justify-center items-center gap-1.5"
                >
                  <Timer className="w-4 h-4" />
                  Recover PIT State
                </button>
              </div>

              {pitResult ? (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Temporal Snapshot Resolved</span>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pb-2 border-b border-slate-800">
                    <span>Snapshot ID: {pitResult.snapshotId}</span>
                    <span>Version: v{pitResult.version}</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 overflow-auto p-2.5 bg-slate-900 rounded border border-slate-800/80 max-h-48">
                    {JSON.stringify(pitResult.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono">No temporal recoveries queries run.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
