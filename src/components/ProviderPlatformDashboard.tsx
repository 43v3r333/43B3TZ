import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Globe, 
  Gauge, 
  Sliders, 
  AlertTriangle, 
  Trash2, 
  Settings, 
  Radio, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal,
  CloudSun,
  Database,
  Search,
  BookOpen
} from "lucide-react";

interface ProviderStatus {
  name: string;
  version: string;
  priority: number;
  capabilities: string[];
  healthScore: number;
  lastSync: string | null;
}

interface ProviderMetric {
  providerName: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  totalLatencyMs: number;
  averageLatencyMs: number;
  cacheHitCount: number;
  cacheMissCount: number;
  cacheHitRatio: number;
  retryCount: number;
  rateLimitCount: number;
  freshnessSeconds: number;
}

interface DLQEntry {
  timestamp: string;
  providerName: string;
  action: string;
  error: string;
  category: string;
}

export default function ProviderPlatformDashboard() {
  const [registryStatus, setRegistryStatus] = useState<ProviderStatus[]>([]);
  const [providerMetrics, setProviderMetrics] = useState<ProviderMetric[]>([]);
  const [dlqEntries, setDlqEntries] = useState<DLQEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fake Provider Simulator config
  const [fakeSettings, setFakeSettings] = useState({
    forceFailure: false,
    authFails: false,
    slowResponse: false,
    simRateLimit: false
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Probe Interactive Console State
  const [selectedProvider, setSelectedProvider] = useState("FakeSportsData");
  const [selectedCapability, setSelectedCapability] = useState("fixtures");
  const [probeArgs, setProbeArgs] = useState('{\n  "competitionId": "comp-saf-psl",\n  "fixtureId": "f-1",\n  "teamId": "t-pirates"\n}');
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any>(null);

  // Fetch all state
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch Registry & Health
      const regRes = await fetch("/api/v1/providers/registry");
      const healthRes = await fetch("/api/v1/providers/health");
      const metricsRes = await fetch("/api/v1/providers/metrics");
      const dlqRes = await fetch("/api/v1/providers/dlq");

      if (regRes.ok && healthRes.ok) {
        const regData = await regRes.json();
        const healthData = await healthRes.json();
        
        // Map health scores to registry items
        const combined: ProviderStatus[] = (regData.registry || []).map((p: any) => {
          const rec = (healthData.healthRecords || []).find((h: any) => h.providerName === p.name);
          return {
            name: p.name,
            version: p.version,
            priority: p.priority,
            capabilities: p.capabilities || [],
            healthScore: rec ? rec.healthScore : 100,
            lastSync: rec ? rec.lastSuccessfulSync : null
          };
        });
        setRegistryStatus(combined);
      }

      if (metricsRes.ok) {
        const metData = await metricsRes.json();
        setProviderMetrics(metData.metrics || []);
      }

      if (dlqRes.ok) {
        const dlqData = await dlqRes.json();
        setDlqEntries(dlqData.dlq || []);
      }
    } catch (err) {
      console.error("Failed to load provider dashboard metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Update Fake Simulator config
  const handleUpdateFakeSettings = async (updates: Partial<typeof fakeSettings>) => {
    try {
      setIsUpdatingSettings(true);
      const nextSettings = { ...fakeSettings, ...updates };
      setFakeSettings(nextSettings);

      const res = await fetch("/api/v1/providers/configure-fake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFakeSettings(data.settings);
        }
      }
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to update simulator settings:", err);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Run operation probe
  const handleExecuteProbe = async () => {
    try {
      setIsProbing(true);
      setProbeResult(null);

      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(probeArgs);
      } catch (e) {
        // Fallback
      }

      const res = await fetch("/api/v1/providers/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: selectedProvider,
          capability: selectedCapability,
          args: parsedArgs
        })
      });

      const data = await res.json();
      setProbeResult({
        status: res.status,
        success: data.success,
        latencyMs: data.latencyMs,
        isValid: data.isValid,
        rawData: data.rawData,
        normalizedData: data.normalizedData,
        error: data.error
      });
      fetchDashboardData();
    } catch (err: any) {
      setProbeResult({
        success: false,
        error: err.message
      });
    } finally {
      setIsProbing(false);
    }
  };

  // Clear DLQ
  const handleClearDLQ = async () => {
    try {
      const res = await fetch("/api/v1/providers/dlq/clear", { method: "POST" });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="provider-dashboard-root">
      {/* 1. TOP CARDS: REGISTERED DRIVERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="driver-cards">
        {registryStatus.map((p) => {
          const isFailing = p.healthScore < 50;
          return (
            <div 
              key={p.name} 
              className={`bg-[#101726]/80 border ${isFailing ? "border-rose-500/20" : "border-slate-800"} rounded-xl p-5 space-y-4 relative overflow-hidden`}
              id={`provider-card-${p.name}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">{p.name}</span>
                  </div>
                  <span className="block text-[10px] font-mono text-slate-500">VERSION {p.version} | PRIORITY {p.priority}</span>
                </div>
                
                {/* Health Score Circular Indicator */}
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded ${
                    p.healthScore >= 90 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    p.healthScore >= 50 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    Health: {p.healthScore}%
                  </span>
                </div>
              </div>

              {/* Badges for Capabilities */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-mono font-bold text-slate-500">CAPABILITIES SUPPORTED</span>
                <div className="flex flex-wrap gap-1">
                  {p.capabilities.map(cap => (
                    <span key={cap} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-mono rounded text-slate-300">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footnote status */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>LAST SYNC:</span>
                <span className="text-slate-300">{p.lastSync ? new Date(p.lastSync).toLocaleTimeString() : "NEVER"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MIDDLE TWO-COLUMN GRID: CONFIG / DLQ & METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="middle-controls">
        {/* Left Column: Fault injection & DLQ */}
        <div className="lg:col-span-4 space-y-6">
          {/* Fault Injector Panel */}
          <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="fault-injector">
            <div className="flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Fake Driver Fault Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject intentional timeouts, credential invalidations, and rate limiter events into <strong>FakeSportsData</strong> to test failovers, circuit breakers, and backpressure scheduling.
            </p>

            <div className="space-y-3 pt-2">
              {/* Force Fail */}
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <div className="space-y-0.5 pr-2">
                  <span className="block text-xs font-semibold text-slate-200">Force Outage (500 Error)</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Simulates server crashes; triggers registry failover pipeline.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={fakeSettings.forceFailure}
                  disabled={isUpdatingSettings}
                  onChange={(e) => handleUpdateFakeSettings({ forceFailure: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                />
              </label>

              {/* Auth Failure */}
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <div className="space-y-0.5 pr-2">
                  <span className="block text-xs font-semibold text-slate-200">Invalid Credentials</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Simulates authentication blocks; marks health status offline.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={fakeSettings.authFails}
                  disabled={isUpdatingSettings}
                  onChange={(e) => handleUpdateFakeSettings({ authFails: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                />
              </label>

              {/* Simulated Latency */}
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <div className="space-y-0.5 pr-2">
                  <span className="block text-xs font-semibold text-slate-200">Slow Handshake (1.5s latency)</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Degrades latency scores; triggers circuit breaker testing.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={fakeSettings.slowResponse}
                  disabled={isUpdatingSettings}
                  onChange={(e) => handleUpdateFakeSettings({ slowResponse: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                />
              </label>

              {/* Rate Limit simulation */}
              <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                <div className="space-y-0.5 pr-2">
                  <span className="block text-xs font-semibold text-slate-200">Simulate Rate Limit Exhaustion</span>
                  <p className="text-[10px] text-slate-500 leading-snug">Throws HTTP 429; tests backoff scheduling & adaptive throttling.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={fakeSettings.simRateLimit}
                  disabled={isUpdatingSettings}
                  onChange={(e) => handleUpdateFakeSettings({ simRateLimit: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                />
              </label>
            </div>
          </div>

          {/* DLQ Monitor Panel */}
          <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="dlq-monitor">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Dead-Letter Queue (DLQ)</h3>
              </div>
              {dlqEntries.length > 0 && (
                <button 
                  onClick={handleClearDLQ}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Clear DLQ Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              When retry limits are fully exhausted, failures are dumped here for real-time forensic inspection.
            </p>

            {dlqEntries.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
                Dead Letter Queue is empty. No terminal failures recorded.
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
                {dlqEntries.map((e, idx) => (
                  <div key={idx} className="bg-rose-500/5 border border-rose-500/15 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center font-bold text-rose-400">
                      <span>{e.providerName} / {e.action}</span>
                      <span>{e.category}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{e.error}</p>
                    <div className="text-slate-500 text-right">{new Date(e.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registry Performance Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="metrics-desk">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gauge className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Driver Performance Metrics</h3>
              </div>
              <a 
                href="/api/v1/providers/metrics/prometheus" 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-mono text-emerald-400 flex items-center gap-1 transition-all"
              >
                <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                Prometheus Scrape Raw Feed
              </a>
            </div>

            <div className="overflow-x-auto" id="metrics-table-wrapper">
              <table className="w-full text-left font-mono text-xs text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500 font-bold">
                    <th className="py-2.5">DRIVER</th>
                    <th className="py-2.5 text-center">TOTAL REQS</th>
                    <th className="py-2.5 text-center">SUCCESS / FAIL</th>
                    <th className="py-2.5 text-center">AVG LATENCY</th>
                    <th className="py-2.5 text-center">CACHE HIT RATIO</th>
                    <th className="py-2.5 text-center">RETRIES</th>
                    <th className="py-2.5 text-center">RATE LIMITS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {providerMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-600">
                        No transactions registered yet. Use the Console below to probe.
                      </td>
                    </tr>
                  ) : (
                    providerMetrics.map(m => (
                      <tr key={m.providerName} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 font-semibold text-slate-200">{m.providerName}</td>
                        <td className="py-3 text-center text-slate-300 font-bold">{m.requestCount}</td>
                        <td className="py-3 text-center">
                          <span className="text-emerald-400">{m.successCount}</span>
                          <span className="text-slate-600 px-1">/</span>
                          <span className={m.failureCount > 0 ? "text-rose-400 font-bold" : "text-slate-500"}>{m.failureCount}</span>
                        </td>
                        <td className="py-3 text-center text-slate-300 font-bold">{m.averageLatencyMs.toFixed(1)}ms</td>
                        <td className="py-3 text-center">
                          <span className="text-teal-400 font-bold">{(m.cacheHitRatio * 100).toFixed(0)}%</span>
                          <span className="block text-[10px] text-slate-500">({m.cacheHitCount} hits)</span>
                        </td>
                        <td className="py-3 text-center text-amber-400">{m.retryCount}</td>
                        <td className="py-3 text-center text-rose-400">{m.rateLimitCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER AREA: LIVE PROBE INTEGRATED PLAYGROUND (Raw vs Canonical DTO Split Screen) */}
      <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-5" id="live-probe-playground">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-emerald-400" />
              Real-time Normalization and Capability Probe Console
            </h3>
            <p className="text-xs text-slate-400">
              Fire on any registered provider driver capability. See raw third-party models beautifully parsed into canonical domain models on-the-fly.
            </p>
          </div>

          <button
            onClick={handleExecuteProbe}
            disabled={isProbing}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {isProbing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Execute Normalization Probe
          </button>
        </div>

        {/* Selection Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500">TARGET PROVIDER</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-[#101726] border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            >
              <option value="FakeSportsData">FakeSportsData (All Capabilities)</option>
              <option value="Sportradar">Sportradar Mock (Fixtures & Odds)</option>
              <option value="API-Football">API-Football Mock (Fixtures & Odds)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500">CAPABILITY INTERFACE</label>
            <select
              value={selectedCapability}
              onChange={(e) => setSelectedCapability(e.target.value)}
              className="w-full bg-[#101726] border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
            >
              <option value="fixtures">fixtures (FixtureProvider)</option>
              <option value="odds">odds (OddsProvider)</option>
              <option value="statistics">statistics (StatisticsProvider)</option>
              <option value="weather">weather (WeatherProvider)</option>
              <option value="news">news (NewsProvider)</option>
              <option value="rankings">rankings (RankingProvider)</option>
              <option value="venues">venues (VenueProvider)</option>
              <option value="players">players (PlayerProvider)</option>
              <option value="competitions">competitions (CompetitionProvider)</option>
              <option value="teams">teams (TeamProvider)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-500">PAYLOAD ARGUMENTS (JSON)</label>
            <textarea
              rows={1}
              value={probeArgs}
              onChange={(e) => setProbeArgs(e.target.value)}
              className="w-full bg-[#101726] border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono resize-none"
            />
          </div>
        </div>

        {/* Results Pane */}
        {probeResult && (
          <div className="space-y-3" id="probe-results-output">
            {/* Meta headers */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500">STATUS:</span>
              <span className={probeResult.success ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {probeResult.success ? "SUCCESS" : "FAILED"}
              </span>

              <span className="text-slate-500">LATENCY:</span>
              <span className="text-slate-200 font-bold">{probeResult.latencyMs}ms</span>

              <span className="text-slate-500">CONTRACT VALIDATION:</span>
              {probeResult.success ? (
                probeResult.isValid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15">
                    <AlertCircle className="w-3.5 h-3.5" /> FAILED
                  </span>
                )
              ) : (
                <span className="text-slate-600">N/A</span>
              )}
            </div>

            {probeResult.error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-mono">
                Error during probe execution: {probeResult.error}
              </div>
            )}

            {/* Split view panels */}
            {probeResult.success && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left panel: raw vendor response */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5" />
                    RAW VENDOR PAYLOAD (INPUT)
                  </span>
                  <pre className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-[350px]">
                    {JSON.stringify(probeResult.rawData, null, 2)}
                  </pre>
                </div>

                {/* Right panel: normalized canonical DTO */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    CANONICAL DOMAIN MODEL (STANDARDIZED DTO OUTPUT)
                  </span>
                  <pre className="bg-slate-950/80 border border-emerald-500/5 border-slate-900 rounded-xl p-4 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-[350px]">
                    {JSON.stringify(probeResult.normalizedData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
