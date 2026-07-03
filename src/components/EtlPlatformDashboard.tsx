import React, { useState, useEffect } from "react";
import { 
  Play, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Search, 
  RefreshCw,
  FileText,
  Clock,
  Terminal,
  Filter,
  Flame,
  Globe,
  Database,
  BarChart3,
  Sliders,
  Check
} from "lucide-react";

interface DLQEntry {
  dlqId: string;
  providerName: string;
  entityType: string;
  rawPayload: any;
  errors: string[];
  checksum: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedReason?: string;
}

interface AuditRecord {
  auditId: string;
  landingId: string;
  providerName: string;
  entityType: string;
  checksum: string;
  transformationChain: string[];
  qualityScore: number;
  storageDestination: string;
  durationMs: number;
  operator: string;
  pipelineVersion: string;
  timestamp: string;
  stagesStatus: Record<string, { durationMs: number; success: boolean; error?: string }>;
}

export default function EtlPlatformDashboard() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"metrics" | "configuration" | "playground" | "audit" | "dlq" | "replay">("metrics");

  // State
  const [metrics, setMetrics] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [dlq, setDlq] = useState<DLQEntry[]>([]);
  const [workers, setWorkers] = useState<any>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsFilter, setLogsFilter] = useState("");

  // Replay Form States
  const [replayProvider, setReplayProvider] = useState("");
  const [replayEntityType, setReplayEntityType] = useState("");
  const [replayChecksum, setReplayChecksum] = useState("");
  const [replayResult, setReplayResult] = useState<any>(null);

  // DLQ Resolve Modal/State
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveReason, setResolveReason] = useState("");

  // Playground Simulation States
  const [simProvider, setSimProvider] = useState("Sportradar Premium");
  const [simEntityType, setSimEntityType] = useState("fixture");
  const [simPayloadText, setSimPayloadText] = useState("");
  const [simResult, setSimResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  // Pre-loaded Payload templates
  const payloadTemplates: Record<string, string> = {
    fixture_sportradar: JSON.stringify({
      sr_fixture_id: "sr-fix-8090",
      sr_league_name: "English Premier League",
      sr_country: "England",
      sr_home: "Manchester United",
      sr_away: "Arsenal",
      kickoff_timestamp: new Date(Date.now() + 86400000).toISOString(),
      status_code: "scheduled"
    }, null, 2),
    fixture_apifootball: JSON.stringify({
      fixture: { id: 772, date: new Date().toISOString(), status: { short: "FT" } },
      teams: { home: { name: "Kaizer Chiefs", id: 25 }, away: { name: "Orlando Pirates", id: 18 } },
      goals: { home: 1, away: 2 },
      league: { id: 12, name: "South African Premier Division", country: "South Africa", season: "2026" }
    }, null, 2),
    odds_sportradar: JSON.stringify({
      sr_fixture_id: "sr-fix-8090",
      match_odds: { home: 2.15, draw: 3.40, away: 3.10 },
      source_name: "Sportradar Live Feeds"
    }, null, 2),
    weather_generic: JSON.stringify({
      fixtureId: "sr-fix-8090",
      temp_c: 19.5,
      humidity_pct: 55,
      wind_speed: 14.2,
      weather_condition: "Cloudy"
    }, null, 2)
  };

  // Fetch all states
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Metrics
      const mRes = await fetch("/api/v1/etl/metrics");
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.stats);

      // Storage Stats
      const sRes = await fetch("/api/v1/etl/storage/stats");
      const sData = await sRes.json();
      if (sData.success) setStorageStats(sData.stats);

      // Config
      const cRes = await fetch("/api/v1/etl/config");
      const cData = await cRes.json();
      if (cData.success) setConfig(cData.config);

      // Audit logs
      const aRes = await fetch("/api/v1/etl/audit");
      const aData = await aRes.json();
      if (aData.success) setAuditLogs(aData.logs.reverse()); // latest first

      // DLQ
      const dRes = await fetch("/api/v1/etl/dlq");
      const dData = await dRes.json();
      if (dData.success) setDlq(dData.dlq);

      // Workers
      const wRes = await fetch("/api/v1/etl/workers");
      const wData = await wRes.json();
      if (wData.success) setWorkers(wData);
    } catch (err) {
      console.error("Failed fetching ETL console statistics", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Default payload to Sportradar fixture
    setSimPayloadText(payloadTemplates.fixture_sportradar);
  }, []);

  const handleTemplateChange = (templateKey: string) => {
    setSimPayloadText(payloadTemplates[templateKey] || "");
    if (templateKey.includes("fixture")) setSimEntityType("fixture");
    else if (templateKey.includes("odds")) setSimEntityType("odds");
    else if (templateKey.includes("weather")) setSimEntityType("weather");
  };

  // Toggle stage config
  const toggleStage = async (stageKey: string) => {
    if (!config) return;
    const updatedStages = { ...config.enabledStages, [stageKey]: !config.enabledStages[stageKey] };
    try {
      const res = await fetch("/api/v1/etl/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledStages: updatedStages })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed updating stage configuration", err);
    }
  };

  // Update overall config limit/version
  const handleConfigUpdate = async (field: string, val: any) => {
    try {
      const res = await fetch("/api/v1/etl/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: val })
      });
      const data = await res.json();
      if (data.success) setConfig(data.config);
    } catch (err) {
      console.error("Failed updating configuration settings", err);
    }
  };

  // Run replay
  const triggerReplay = async () => {
    setReplayResult(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/etl/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: replayProvider || undefined,
          entityType: replayEntityType || undefined,
          checksum: replayChecksum || undefined
        })
      });
      const data = await res.json();
      setReplayResult(data);
      fetchAllData();
    } catch (err: any) {
      setReplayResult({ success: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // DLQ Operations
  const handleResolveDLQ = async () => {
    if (!resolvingId || !resolveReason) return;
    try {
      const res = await fetch("/api/v1/etl/dlq/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dlqId: resolvingId, reason: resolveReason })
      });
      const data = await res.json();
      if (data.success) {
        setResolvingId(null);
        setResolveReason("");
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed resolving DLQ item", err);
    }
  };

  const handleDeleteDLQ = async (dlqId: string) => {
    if (!confirm("Remove this entry permanently from the Dead Letter Queue?")) return;
    try {
      const res = await fetch("/api/v1/etl/dlq/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dlqId })
      });
      const data = await res.json();
      if (data.success) fetchAllData();
    } catch (err) {
      console.error("Failed deleting DLQ entry", err);
    }
  };

  // Interactive Simulation
  const simulatePlayground = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const rawPayload = JSON.parse(simPayloadText);
      const res = await fetch("/api/v1/etl/ingest-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: simProvider,
          entityType: simEntityType,
          rawPayload,
          operator: "simulation_playground"
        })
      });
      const data = await res.json();
      setSimResult(data);
      fetchAllData();
    } catch (err: any) {
      setSimResult({ success: false, errors: [err.message] });
    } finally {
      setSimulating(false);
    }
  };

  // Truncate Storage
  const truncateData = async () => {
    if (!confirm("Are you absolutely sure you want to truncate the entire ETL Platform storage layers (Raw, Normalized, Curated) and reset all metrics?")) return;
    try {
      const res = await fetch("/api/v1/etl/storage/clear", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("ETL storage truncated successfully!");
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed truncating storage", err);
    }
  };

  // Filter audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const searchMatch = 
      log.landingId.toLowerCase().includes(logsSearch.toLowerCase()) ||
      log.providerName.toLowerCase().includes(logsSearch.toLowerCase()) ||
      log.checksum.toLowerCase().includes(logsSearch.toLowerCase()) ||
      log.entityType.toLowerCase().includes(logsSearch.toLowerCase());
    
    if (logsFilter) {
      return searchMatch && log.entityType === logsFilter;
    }
    return searchMatch;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6" id="etl-platform-main">
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Ingestion Node
            </span>
            <span className="text-slate-500 text-xs font-mono">
              Pipeline Version: {config?.pipelineVersion || "v1.0.0"}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            Enterprise ETL Platform
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Ingestion gateway, validation, quality scoring, deduplication, enrichment, and storage pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={fetchAllData}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={truncateData}
            className="px-3 py-1.5 rounded-lg border border-red-900/40 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all w-full md:w-auto justify-center"
          >
            <Flame className="w-3.5 h-3.5" />
            Truncate Storage
          </button>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION */}
      <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/20">
        {[
          { id: "metrics", label: "Overview & Metrics", icon: BarChart3 },
          { id: "configuration", label: "Pipeline Architect", icon: Sliders },
          { id: "playground", label: "Simulation Playground", icon: Terminal },
          { id: "audit", label: "Audit Ledger", icon: FileText },
          { id: "dlq", label: "Dead-Letter Queue", icon: AlertTriangle, badge: dlq.filter(d => !d.resolved).length },
          { id: "replay", label: "Historical Replays", icon: RotateCcw }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW WORKSPACE */}
      <div className="p-6">
        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === "metrics" && (
          <div className="space-y-6 animate-fade-in" id="etl-metrics-view">
            {/* INGESTION STATE BENTO-GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Records Ingested</span>
                <p className="text-2xl font-mono font-bold text-white mt-1">{metrics?.recordsProcessed || 0}</p>
                <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                  <span>Failures: {metrics?.failures || 0}</span>
                  <span>Retries: {metrics?.retries || 0}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Average Latency</span>
                <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{metrics?.averageLatencyMs || 0} ms</p>
                <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                  <span>Storage Write: {metrics?.averageStorageLatencyMs || 0} ms</span>
                  <span>Queue Depth: {workers?.workers?.pendingTasks || 0}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Identical Duplicates</span>
                <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{metrics?.duplicates || 0}</p>
                <div className="text-[10px] text-slate-500 mt-2">
                  <span>Bypassed from storage writes gracefully.</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Quality Grade Distribution</span>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-emerald-400">{metrics?.qualityDistribution?.excellent || 0}</div>
                    <div className="text-[8px] uppercase text-slate-500 mt-0.5">Exc</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-cyan-400">{metrics?.qualityDistribution?.good || 0}</div>
                    <div className="text-[8px] uppercase text-slate-500 mt-0.5">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-amber-400">{metrics?.qualityDistribution?.fair || 0}</div>
                    <div className="text-[8px] uppercase text-slate-500 mt-0.5">Fair</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-red-400">{metrics?.qualityDistribution?.poor || 0}</div>
                    <div className="text-[8px] uppercase text-slate-500 mt-0.5">Poor</div>
                  </div>
                </div>
              </div>
            </div>

            {/* STORAGE LAYERS BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Database className="w-4 h-4 text-emerald-500" />
                  PERSISTENT STORAGE LAYERS (INDEPENDENTLY QUERYABLE)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">1. Raw Landing Layer</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">Compressed</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">
                      Immutable store logging original vendor messages exactly as received with SHA-256 cryptographic checksum checks.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Total paylogged:</span>
                      <span className="font-mono font-bold text-white">{metrics?.recordsProcessed || 0} records</span>
                    </div>
                  </div>

                   <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">2. Normalized Layer</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Unified DTO</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">
                      Structured schemas where variable keys are mapped directly into standardized fields based on capabilities contracts.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Normalized count:</span>
                      <span className="font-mono font-bold text-white">{storageStats?.normalizedRecords || 0} records</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">3. Curated Layer</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Enriched</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2">
                      Aggregated golden records featuring fuzzy deduplications, weather/venue enrichments, quality indicators, and version traces.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Curated entities:</span>
                      <span className="font-mono font-bold text-white">
                        {Object.values(storageStats?.curatedRecords || {}).reduce((a: number, b: number) => a + b, 0)} records
                      </span>
                    </div>
                  </div>
                </div>

                {/* ENTITY TYPE COUNTS */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase mb-3">Curated Entity Ledger</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(storageStats?.curatedRecords || {}).map(([type, count]: [string, any]) => (
                      <div key={type} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60 flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-400 capitalize">{type}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BACKGROUND WORKERS & PROMETHEUS SCRAPING */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    BACKGROUND WORKER POOL
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Concurrency Workers:</span>
                      <span className="font-mono text-white font-bold">{workers?.workers?.activeWorkers || 0} / {workers?.workers?.concurrencyLimit || 3}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Scheduled Ingest Jobs:</span>
                      <span className="font-mono text-white font-bold">{workers?.schedulerJobs?.length || 0} active</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Validations Blocked (DLQ):</span>
                      <span className="font-mono text-red-400 font-bold">{dlq.length} entries</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    PROMETHEUS RAW SCRAPING
                  </h3>
                  <p className="text-slate-400 text-[11px]">
                    This platform exposes a fully compliant raw metrics scrape stream for Prometheus metric collections.
                  </p>
                  <a
                    href="/api/v1/etl/metrics/prometheus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center block px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
                  >
                    Scrape Scraper Endpoint
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE ARCHITECT CONFIG */}
        {activeTab === "configuration" && (
          <div className="space-y-6 animate-fade-in" id="etl-config-view">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-emerald-500" />
                    Ingestion Pipeline Architect
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Configure transaction orchestration, stage enables, retry thresholds, and rollback policies.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">Max Retries:</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={config?.retries || 3}
                      onChange={(e) => handleConfigUpdate("retries", parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-semibold">Version:</span>
                    <input
                      type="text"
                      value={config?.pipelineVersion || "v1.0.0"}
                      onChange={(e) => handleConfigUpdate("pipelineVersion", e.target.value)}
                      className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-center text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* STAGES LIST */}
              <div className="mt-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Ingestion Flow Stages ({Object.values(config?.enabledStages || {}).filter(Boolean).length} Active)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "landing", name: "1. Landing Layer Store", desc: "Accepts raw inputs, computes SHA-256 hash checks, compresses, and logs to RAW table." },
                    { key: "validation", name: "2. Hash Duplicate Checks", desc: "Computes checksum matches and flags redundant ingestion payloads to bypass storage writes." },
                    { key: "normalization", name: "3. Normalized Transformation", desc: "Standardizes spelling, extracts nested entities, and structures schemas cleanly." },
                    { key: "schemaValidation", name: "4. Schema Verification", desc: "Runs type assertions and required-field checks on the normalized objects." },
                    { key: "businessValidation", name: "5. Business Rule Checks", desc: "Evaluates mathematical limits, logic bounds, and referential validation." },
                    { key: "qualityScoring", name: "6. Quality Scoring Engine", desc: "Measures completeness, consistency, freshness, and accuracy on a 0-100 scale." },
                    { key: "deduplication", name: "7. Deduplication Merger", desc: "Runs natural key matches or fuzzy-name Levenshtein lookups to find entity twins." },
                    { key: "enrichment", name: "8. Metadata Enrichment", desc: "Resolves weather states, stadium surface layouts, regional timezones, and averages." },
                    { key: "transformation", name: "9. Curated Transformations", desc: "Converts pricing lines to probabilities, normalizes codes, and formats data casing." },
                    { key: "storage", name: "10. Layered Storage Inserter", desc: "Commits logs into normalized or merged curated collections cleanly." },
                    { key: "eventPublication", name: "11. Pub/Sub Notifications", desc: "Publishes system alerts (e.g. ValidationPassed) onto Redis messaging channels." },
                    { key: "auditLogging", name: "12. Audit Logger Trail", desc: "Records transaction telemetry, stage latency profiles, and error codes." }
                  ].map(stage => {
                    const isEnabled = config?.enabledStages?.[stage.key];
                    return (
                      <div 
                        key={stage.key}
                        onClick={() => toggleStage(stage.key)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-3 ${
                          isEnabled
                            ? "bg-slate-900/60 border-emerald-500/40 hover:border-emerald-500/70"
                            : "bg-slate-950/20 border-slate-800/80 hover:border-slate-700/60 opacity-60"
                        }`}
                      >
                        <div className="space-y-1">
                          <span className={`text-xs font-semibold ${isEnabled ? "text-white font-bold" : "text-slate-400"}`}>
                            {stage.name}
                          </span>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {stage.desc}
                          </p>
                        </div>

                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${isEnabled ? "bg-emerald-500" : "bg-slate-700"}`}>
                          <div className={`w-3 h-3 rounded-full bg-white shadow-md transition-transform ${isEnabled ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ROLLBACK POLICY */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Atomic Pipeline Rollback Policy</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    If enabled, any stage validation fail will trigger an immediate rollback of the entire transaction write session.
                  </p>
                </div>
                <button
                  onClick={() => handleConfigUpdate("rollbackOnFailure", !config?.rollbackOnFailure)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    config?.rollbackOnFailure
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-900 text-slate-400 border-slate-700"
                  }`}
                >
                  {config?.rollbackOnFailure ? "Rollback Enabled" : "Rollback Disabled"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE SIMULATION PLAYGROUND */}
        {activeTab === "playground" && (
          <div className="space-y-6 animate-fade-in" id="etl-playground-view">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: PAYLOAD INJECTOR */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Terminal className="w-4 h-4 text-emerald-500" />
                      Trace-and-Ingest Payload Simulation
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold">Template:</span>
                      <select
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="px-2 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium"
                      >
                        <option value="fixture_sportradar">Sportradar - Raw Fixture</option>
                        <option value="fixture_apifootball">API-Football - Nested Fixture</option>
                        <option value="odds_sportradar">Sportradar - Live Odds</option>
                        <option value="weather_generic">General Weather Payload</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Source Provider</label>
                      <input
                        type="text"
                        value={simProvider}
                        onChange={(e) => setSimProvider(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Entity Type</label>
                      <select
                        value={simEntityType}
                        onChange={(e) => setSimEntityType(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      >
                        <option value="fixture">Fixture</option>
                        <option value="odds">Odds</option>
                        <option value="weather">Weather</option>
                        <option value="statistics">Statistics</option>
                        <option value="player">Player</option>
                        <option value="team">Team</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Raw JSON Payload</label>
                    <textarea
                      rows={12}
                      value={simPayloadText}
                      onChange={(e) => setSimPayloadText(e.target.value)}
                      className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={simulatePlayground}
                    disabled={simulating}
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {simulating ? "Simulating..." : "Ingest & Trace Payload"}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: 12-STAGE PIPELINE TRACER */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 h-full min-h-[400px] flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-4">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    LIVE 12-STAGE PIPELINE Telemetry TRACE
                  </h3>

                  {simulating ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-12 text-slate-400 gap-3">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                      <span className="text-xs font-mono">Running transaction validation loops...</span>
                    </div>
                  ) : simResult ? (
                    <div className="space-y-4 flex-1">
                      {/* SIMULATION SUMMARY HEADER */}
                      <div className={`p-4 rounded-xl border flex justify-between items-center ${
                        simResult.success 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Simulation Result</span>
                          <h4 className="text-sm font-bold mt-0.5">{simResult.success ? "INGESTION SUCCESS" : "INGESTION FAILED"}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold block">AUDIT ID</span>
                          <span className="text-xs font-mono font-semibold text-white">{simResult.auditId || "N/A"}</span>
                        </div>
                      </div>

                      {/* STAGES CHRONOLOGY VIEW */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Chronological Execution Steps</span>
                        
                        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                          {[
                            { step: "landing", label: "1. Raw Landed immutable log" },
                            { step: "validation", label: "2. Hash duplicate checks" },
                            { step: "normalization", label: "3. Unified normalization mapping" },
                            { step: "schemaValidation", label: "4. Schema contract verification" },
                            { step: "businessValidation", label: "5. Business logic assertions" },
                            { step: "qualityScoring", label: "6. Quality indexes calculation" },
                            { step: "deduplication", label: "7. Deduplication matches checks" },
                            { step: "enrichment", label: "8. Meteorological & contextual enrich" },
                            { step: "transformation", label: "9. Curated transformation pipelines" },
                            { step: "storage", label: "10. Layered storage persistence" },
                            { step: "eventPublication", label: "11. Pub/sub event broadcasting" },
                            { step: "auditLogging", label: "12. Audit ledger committing" }
                          ].map((st, sIdx) => {
                            const isStageEnabled = config?.enabledStages?.[st.step];
                            // If the simulation failed, see if this stage ran
                            // We mock individual statuses or show check marks if successful
                            const isSuccessful = simResult.success;
                            
                            return (
                              <div key={st.step} className="flex justify-between items-center p-2 rounded bg-slate-900 border border-slate-800/60 text-xs">
                                <div className="flex items-center gap-2">
                                  {!isStageEnabled ? (
                                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                                  ) : isSuccessful ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  )}
                                  <span className={isStageEnabled ? "text-slate-300" : "text-slate-500 line-through"}>
                                    {st.label}
                                  </span>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  {!isStageEnabled ? (
                                    <span className="text-[10px] px-1 py-0.5 rounded bg-slate-950 text-slate-500 uppercase font-mono">Bypassed</span>
                                  ) : isSuccessful ? (
                                    <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase font-mono">Passed</span>
                                  ) : (
                                    <span className="text-[10px] px-1 py-0.5 rounded bg-red-500/10 text-red-400 uppercase font-mono">Failed</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* FAILURES DETAILS */}
                      {simResult.errors && simResult.errors.length > 0 && (
                        <div className="p-3 rounded bg-red-950/20 border border-red-900/40 text-red-400 text-xs">
                          <span className="font-bold block mb-1 uppercase text-[10px]">Uncaught Stage Errors:</span>
                          <ul className="list-disc list-inside space-y-1">
                            {simResult.errors.map((err: string, idx: number) => (
                              <li key={idx} className="font-mono">{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center py-12 text-slate-500 text-center">
                      <Terminal className="w-12 h-12 text-slate-700 mb-2" />
                      <span className="text-xs font-semibold">Ready for payload trace injection.</span>
                      <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                        Select a payload template, modify values, and click "Ingest & Trace" to execute in the playground.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LEDGER */}
        {activeTab === "audit" && (
          <div className="space-y-4 animate-fade-in" id="etl-audit-view">
            {/* SEARCH AND FILTER */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter logs by landing ID, provider name, entity type, checksum..."
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={logsFilter}
                  onChange={(e) => setLogsFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">All Entity Types</option>
                  <option value="fixture">Fixture</option>
                  <option value="odds">Odds</option>
                  <option value="weather">Weather</option>
                  <option value="statistics">Statistics</option>
                  <option value="player">Player</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>

            {/* AUDIT LOG TABLE */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-950/40">
                      <th className="p-3">Audit ID / Timestamp</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Checksum (SHA-256)</th>
                      <th className="p-3 text-center">Quality</th>
                      <th className="p-3 text-right">Duration</th>
                      <th className="p-3">Storage Key</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                          No audit ledger entries logged. Run the simulator to populate logs!
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map(log => (
                        <tr key={log.auditId} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-mono">
                            <div className="text-white font-bold text-[11px]">{log.auditId}</div>
                            <div className="text-slate-500 text-[10px] mt-0.5">{new Date(log.timestamp).toLocaleString()}</div>
                          </td>
                          <td className="p-3 font-semibold text-white">{log.providerName}</td>
                          <td className="p-3 capitalize">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-semibold">
                              {log.entityType}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[10px]" title={log.checksum}>
                            {log.checksum.substring(0, 16)}...
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              log.qualityScore >= 90
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : log.qualityScore >= 75
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {log.qualityScore}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-white font-bold">{log.durationMs} ms</td>
                          <td className="p-3 text-slate-400 font-mono text-[10px]">{log.storageDestination}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEAD LETTER QUEUE */}
        {activeTab === "dlq" && (
          <div className="space-y-4 animate-fade-in" id="etl-dlq-view">
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-950/40">
                      <th className="p-3">DLQ Id / Timestamp</th>
                      <th className="p-3">Provider / Entity</th>
                      <th className="p-3">Failure Diagnostics</th>
                      <th className="p-3">Resolution State</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                    {dlq.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                          Dead Letter Queue is entirely empty! 0 validations failed.
                        </td>
                      </tr>
                    ) : (
                      dlq.map(entry => (
                        <tr key={entry.dlqId} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3 font-mono">
                            <div className="text-red-400 font-bold text-[11px]">{entry.dlqId}</div>
                            <div className="text-slate-500 text-[10px] mt-0.5">{new Date(entry.timestamp).toLocaleString()}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-white">{entry.providerName}</div>
                            <div className="text-slate-400 text-[10px] capitalize mt-0.5">{entry.entityType}</div>
                          </td>
                          <td className="p-3 max-w-sm">
                            <div className="text-slate-200 font-mono text-[11px] leading-relaxed">
                              {entry.errors.map((err, errIdx) => (
                                <div key={errIdx} className="flex items-start gap-1">
                                  <span className="text-red-400">●</span>
                                  <span>{err}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            {entry.resolved ? (
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  RESOLVED (BYPASS)
                                </span>
                                <div className="text-slate-400 text-[10px] font-mono leading-relaxed max-w-xs italic" title={entry.resolvedReason}>
                                  Reason: "{entry.resolvedReason}"
                                </div>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                UNRESOLVED FAULT
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right flex items-center justify-end gap-2 h-full mt-2.5">
                            {!entry.resolved && (
                              <button
                                onClick={() => setResolvingId(entry.dlqId)}
                                className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:text-white text-[11px] font-bold transition-all"
                              >
                                Resolve Override
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDLQ(entry.dlqId)}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-red-900 hover:text-red-400 text-[11px] font-semibold text-slate-300 transition-all"
                            >
                              Discard
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DLQ OVERRIDE RESOLVER DIALOG BOX */}
            {resolvingId && (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 max-w-md space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  Apply Manual Resolution Override
                </h4>
                <p className="text-slate-400 text-[11px]">
                  Bypasses structural failures by appending a diagnostic resolution reason.
                </p>
                <div>
                  <textarea
                    rows={3}
                    placeholder="Enter manual override justification (e.g. data validation correction, manual team patch, admin override)..."
                    value={resolveReason}
                    onChange={(e) => setResolveReason(e.target.value)}
                    className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setResolvingId(null)}
                    className="px-3 py-1.5 rounded bg-slate-900 text-slate-400 border border-slate-700 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolveDLQ}
                    className="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  >
                    Apply Override
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: HISTORICAL REPLAYS */}
        {activeTab === "replay" && (
          <div className="space-y-6 animate-fade-in" id="etl-replay-view">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-emerald-500" />
                  Historical Replay Ingestion Coordinator
                </h3>
                <p className="text-slate-400 text-xs">
                  Replay raw payloads saved inside our immutable Landing Layer back through the pipeline to apply updated enrichment or transforms.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Filter by Provider</label>
                    <input
                      type="text"
                      placeholder="e.g. Sportradar"
                      value={replayProvider}
                      onChange={(e) => setReplayProvider(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Filter by Entity Type</label>
                    <select
                      value={replayEntityType}
                      onChange={(e) => setReplayEntityType(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                    >
                      <option value="">All Entities</option>
                      <option value="fixture">Fixture</option>
                      <option value="odds">Odds</option>
                      <option value="weather">Weather</option>
                      <option value="statistics">Statistics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase">Filter by Checksum</label>
                    <input
                      type="text"
                      placeholder="64-char SHA-256 hash"
                      value={replayChecksum}
                      onChange={(e) => setReplayChecksum(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  onClick={triggerReplay}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isLoading ? "Executing Replay..." : "Trigger Replay Session"}
                </button>
              </div>

              {/* REPLAY RESULTS AND TIMINGS */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-4">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    REPLAY SESSION REPORT
                  </h3>

                  {replayResult ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 block">Total Processed:</span>
                          <span className="text-sm font-bold text-white font-mono">{replayResult.stats?.processed || 0} records</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block">Session Duration:</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">{replayResult.stats?.durationMs || 0} ms</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Successes</span>
                          <span className="text-xl font-bold font-mono text-emerald-400">{replayResult.stats?.successes || 0}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Failures</span>
                          <span className="text-xl font-bold font-mono text-red-400">{replayResult.stats?.failures || 0}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-slate-500 text-center flex flex-col items-center justify-center">
                      <Clock className="w-12 h-12 text-slate-800 mb-2" />
                      <span className="text-xs">No active replay report generated in this session.</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Metrics logged in overview dashboards upon replay completion.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
