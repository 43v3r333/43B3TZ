import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Cpu, 
  Database, 
  Terminal, 
  Send, 
  KeyRound, 
  Users, 
  RefreshCw, 
  Play, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Globe,
  ShieldCheck,
  Brain,
  FlaskConical
} from "lucide-react";
import ProviderPlatformDashboard from "./ProviderPlatformDashboard";
import EtlPlatformDashboard from "./EtlPlatformDashboard";
import SportsIntelligenceDashboard from "./SportsIntelligenceDashboard";
import MlopsDashboard from "./MlopsDashboard";
import PredictionFactoryDashboard from "./PredictionFactoryDashboard";
import PredictionIntelligenceDashboard from "./PredictionIntelligenceDashboard";
import MarketIntelligenceDashboard from "./MarketIntelligenceDashboard";
import DecisionIntelligenceDashboard from "./decision/DecisionIntelligenceDashboard";
import OperationsCenter from "./operations/OperationsCenter";
import ResearchLab from "./research/ResearchLab";
import ExecutiveDashboard from "./ExecutiveDashboard";

interface LogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  context: string;
  message: string;
  metadata?: Record<string, any>;
}

export default function CorePlatformConsole() {
  // Navigation inside the Console Tab
  const [activeSubTab, setActiveSubTab] = useState<"system" | "database" | "redis" | "auth" | "providers" | "etl" | "intel" | "mlops" | "factory" | "pred_intel" | "market_intel" | "decision_intel" | "operations" | "research" | "executive">("executive");

  // Health and System States
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [serverLogs, setServerLogs] = useState<LogEntry[]>([]);
  const [isSystemLoading, setIsSystemLoading] = useState(false);

  // Database snapshot states
  const [dbSnapshot, setDbSnapshot] = useState<any>(null);

  // Redis States
  const [redisStats, setRedisStats] = useState<any>(null);
  const [redisKey, setRedisKey] = useState("");
  const [redisVal, setRedisVal] = useState("");
  const [redisTTL, setRedisTTL] = useState("60");
  const [redisQueryResult, setRedisQueryResult] = useState<string | null>(null);
  const [redisChannel, setRedisChannel] = useState("odds_updates");
  const [redisPubMsg, setRedisPubMsg] = useState('{"fixture_id": "fix-101", "edge": 0.052}');

  // Auth Operations
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState<"trader" | "admin">("trader");
  const [authResponse, setAuthResponse] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [rbacResponse, setRbacResponse] = useState<any>(null);
  const [tokenInput, setTokenInput] = useState("");

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch stats and logs
  const refreshSystemData = async () => {
    try {
      setIsSystemLoading(true);
      
      // Fetch Health
      const healthRes = await fetch("/api/health");
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setSystemHealth(healthData);
      }

      // Fetch Logs
      const logsRes = await fetch("/api/v1/admin/logs");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setServerLogs(logsData.logs || []);
      }

      // Fetch DB
      const dbRes = await fetch("/api/v1/admin/db-snapshot");
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbSnapshot(dbData);
      }

      // Fetch Redis stats
      const redisRes = await fetch("/api/v1/admin/redis-snapshot");
      if (redisRes.ok) {
        const redisData = await redisRes.json();
        setRedisStats(redisData);
      }

    } catch (err) {
      console.error("Error refreshing backend metrics:", err);
    } finally {
      setIsSystemLoading(false);
    }
  };

  useEffect(() => {
    refreshSystemData();
    const interval = setInterval(refreshSystemData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serverLogs]);

  // Auth: Submit registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword, role: authRole }),
      });
      const data = await res.json();
      setAuthResponse(data);
      if (res.ok) {
        setTokenInput(data.token);
        setCurrentSession(data);
      }
      refreshSystemData();
    } catch (err: any) {
      setAuthResponse({ error: err.message });
    }
  };

  // Auth: Submit login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      setAuthResponse(data);
      if (res.ok) {
        setTokenInput(data.token);
        setCurrentSession(data);
      }
      refreshSystemData();
    } catch (err: any) {
      setAuthResponse({ error: err.message });
    }
  };

  // Auth: Check active session on server
  const checkActiveSession = async () => {
    try {
      const headers: Record<string, string> = {};
      if (tokenInput) {
        headers["Authorization"] = `Bearer ${tokenInput}`;
      }
      const res = await fetch("/api/v1/auth/session", { headers });
      const data = await res.json();
      setCurrentSession(data);
    } catch (err: any) {
      setCurrentSession({ error: err.message });
    }
  };

  // Auth: Validate high security Admin dashboard access
  const checkRbacRoute = async () => {
    try {
      const headers: Record<string, string> = {};
      if (tokenInput) {
        headers["Authorization"] = `Bearer ${tokenInput}`;
      }
      const res = await fetch("/api/v1/auth/admin/dashboard", { headers });
      const data = await res.json();
      setRbacResponse({ status: res.status, data });
    } catch (err: any) {
      setRbacResponse({ error: err.message });
    }
  };

  return (
    <div className="space-y-6" id="core-platform-live-panel">
      {/* Overview Block */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6" id="core-overview">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Core Platform Security & System Desk</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Sprint 1 Implementation is fully active. Monitor container uptime, inspect DI container schemas, query in-memory relational tables, trigger Redis streams, and authenticate with role-based policies in real-time.
          </p>
        </div>
        <button
          onClick={refreshSystemData}
          disabled={isSystemLoading}
          className="px-4 py-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSystemLoading ? "animate-spin" : ""}`} />
          Force Sync Metrics
        </button>
      </div>

      {/* Internal Sub-navigation Tabs */}
      <div className="flex border-b border-slate-800" id="console-sub-navigation">
        <button
          onClick={() => setActiveSubTab("executive")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "executive"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          Executive Dashboard
        </button>
        <button
          onClick={() => setActiveSubTab("system")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "system"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          Container & DI Container
        </button>
        <button
          onClick={() => setActiveSubTab("database")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "database"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Database className="w-4 h-4" />
          Relational Database
        </button>
        <button
          onClick={() => setActiveSubTab("redis")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "redis"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          Redis Cluster
        </button>
        <button
          onClick={() => setActiveSubTab("auth")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "auth"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & Identity
        </button>
        <button
          onClick={() => setActiveSubTab("providers")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "providers"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          Sports Data Providers
        </button>
        <button
          onClick={() => setActiveSubTab("etl")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "etl"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          Enterprise ETL Platform
        </button>
        <button
          onClick={() => setActiveSubTab("intel")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "intel"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          Sports Intelligence
        </button>
        <button
          onClick={() => setActiveSubTab("mlops")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "mlops"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Brain className="w-4 h-4" />
          Enterprise MLOps Platform
        </button>
        <button
          onClick={() => setActiveSubTab("factory")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "factory"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Prediction Factory
        </button>
        <button
          onClick={() => setActiveSubTab("pred_intel")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "pred_intel"
              ? "border-emerald-500 text-white font-bold bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Brain className="w-4 h-4 text-violet-400 animate-pulse" />
          Prediction Intelligence Platform
        </button>
        <button
          onClick={() => setActiveSubTab("market_intel")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "market_intel"
              ? "border-[#10b981] text-white font-bold bg-[#10b981]/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
          Market Intelligence
        </button>
        <button
          onClick={() => setActiveSubTab("decision_intel")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "decision_intel"
              ? "border-[#f59e0b] text-white font-bold bg-[#f59e0b]/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
          Decision Intelligence
        </button>
        <button
          onClick={() => setActiveSubTab("operations")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "operations"
              ? "border-[#ef4444] text-white font-bold bg-[#ef4444]/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400 animate-pulse" />
          Operations Center
        </button>
        <button
          onClick={() => setActiveSubTab("research")}
          className={`px-5 py-3.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === "research"
              ? "border-[#6366f1] text-white font-bold bg-[#6366f1]/5"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FlaskConical className="w-4 h-4 text-indigo-400 animate-pulse" />
          AI Research Lab
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      {activeSubTab === "executive" ? (
        <ExecutiveDashboard />
      ) : activeSubTab === "providers" ? (
        <ProviderPlatformDashboard />
      ) : activeSubTab === "etl" ? (
        <EtlPlatformDashboard />
      ) : activeSubTab === "intel" ? (
        <SportsIntelligenceDashboard />
      ) : activeSubTab === "mlops" ? (
        <MlopsDashboard />
      ) : activeSubTab === "factory" ? (
        <PredictionFactoryDashboard />
      ) : activeSubTab === "pred_intel" ? (
        <PredictionIntelligenceDashboard />
      ) : activeSubTab === "market_intel" ? (
        <MarketIntelligenceDashboard />
      ) : activeSubTab === "decision_intel" ? (
        <DecisionIntelligenceDashboard />
      ) : activeSubTab === "operations" ? (
        <OperationsCenter />
      ) : activeSubTab === "research" ? (
        <ResearchLab />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="core-console-bento">
          {/* LEFT COLUMN: ACTIVE VIEW WORKSPACE */}
          <div className="lg:col-span-7 space-y-6" id="bento-panel-left">
          
          {/* 1. SYSTEM HEALTH & DI VIEW */}
          {activeSubTab === "system" && (
            <div className="space-y-6" id="view-system">
              {/* Health Grid */}
              <div className="grid grid-cols-3 gap-4" id="system-probes-grid">
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">SYSTEM STATE</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-sm font-bold text-white uppercase">{systemHealth?.status || "HEALTHY"}</span>
                  </div>
                </div>
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">SERVER UPTIME</span>
                  <span className="block text-sm font-bold text-slate-200 font-mono">
                    {systemHealth?.uptimeSeconds ? `${systemHealth.uptimeSeconds}s` : "0s"}
                  </span>
                </div>
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">MEMORY FOOTPRINT</span>
                  <span className="block text-sm font-bold text-slate-200 font-mono">
                    {systemHealth?.memoryUsage?.rss ? `${Math.floor(systemHealth.memoryUsage.rss / 1024 / 1024)} MB` : "N/A"}
                  </span>
                </div>
              </div>

              {/* DI Container registry */}
              <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="di-registry-view">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Dependency Injection Container (Inversion of Control)
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded">
                    container.ts
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The registry container dynamically resolves service dependencies at runtime, preventing circular chains and decoupling micro-services.
                </p>
                <div className="grid grid-cols-2 gap-3" id="di-services-list">
                  {systemHealth?.subsystems?.di_container?.registeredServices?.map((srv: string) => (
                    <div key={srv} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-200 font-mono">"{srv}"</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">Resolved [OK]</span>
                    </div>
                  )) || (
                    <div className="col-span-2 text-center py-4 text-xs text-slate-500">Loading registry state...</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. DATABASE VIEWER */}
          {activeSubTab === "database" && (
            <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-5" id="view-database">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4.5 h-4.5 text-sky-400" />
                    Relational Table Explorer
                  </h3>
                  <p className="text-xs text-slate-400">
                    File-persisted database engine containing schema definitions, unique constraints, and transaction logs.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded">
                  db.json
                </span>
              </div>

              {/* DB Schema Tables */}
              <div className="space-y-4" id="database-tables-explorer">
                {/* Users Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    Table: "users" ({dbSnapshot?.stats?.users || 0} rows)
                  </span>
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#0f1524] text-slate-400 border-b border-slate-800">
                          <th className="p-2 px-3 font-semibold">User ID</th>
                          <th className="p-2 px-3 font-semibold">Email Account</th>
                          <th className="p-2 px-3 font-semibold">Security Role</th>
                          <th className="p-2 px-3 font-semibold text-right">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {dbSnapshot?.users?.map((usr: any) => (
                          <tr key={usr.user_id} className="hover:bg-slate-900/40">
                            <td className="p-2 px-3 text-sky-400">{usr.user_id}</td>
                            <td className="p-2 px-3">{usr.email}</td>
                            <td className="p-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${usr.role === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                                {usr.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-2 px-3 text-right text-slate-500">{new Date(usr.created_at).toLocaleTimeString()}</td>
                          </tr>
                        )) || (
                          <tr><td colSpan={4} className="p-3 text-center text-slate-500">No registered users present.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fixtures Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    Table: "fixtures" ({dbSnapshot?.stats?.fixtures || 0} rows)
                  </span>
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#0f1524] text-slate-400 border-b border-slate-800">
                          <th className="p-2 px-3 font-semibold">ID</th>
                          <th className="p-2 px-3 font-semibold">League Name</th>
                          <th className="p-2 px-3 font-semibold">Match Matchup</th>
                          <th className="p-2 px-3 font-semibold">Kickoff</th>
                          <th className="p-2 px-3 font-semibold text-right">Match Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {dbSnapshot?.fixtures?.map((fix: any) => (
                          <tr key={fix.fixture_id} className="hover:bg-slate-900/40">
                            <td className="p-2 px-3 text-sky-400">{fix.fixture_id}</td>
                            <td className="p-2 px-3 text-slate-400">{fix.league}</td>
                            <td className="p-2 px-3 text-white font-sans font-medium">{fix.home_team} vs. {fix.away_team}</td>
                            <td className="p-2 px-3 text-slate-500">{new Date(fix.kickoff).toLocaleDateString()}</td>
                            <td className="p-2 px-3 text-right">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                {fix.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr><td colSpan={5} className="p-3 text-center text-slate-500">Loading database tables...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. REDIS VIEW */}
          {activeSubTab === "redis" && (
            <div className="space-y-6" id="view-redis">
              {/* Redis status widgets */}
              <div className="grid grid-cols-3 gap-4" id="redis-probes-grid">
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">REDIS CONNECTION</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-sm font-bold text-white uppercase">ONLINE</span>
                  </div>
                </div>
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">CACHE KEYS</span>
                  <span className="block text-sm font-bold text-slate-200 font-mono">
                    {redisStats?.cacheKeys || 0} active
                  </span>
                </div>
                <div className="bg-[#101726]/80 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">ACTIVE PUBSUB CHANNELS</span>
                  <span className="block text-sm font-bold text-slate-200 font-mono">
                    {redisStats?.subscribers?.length || 0} active
                  </span>
                </div>
              </div>

              {/* Pub/Sub Interactive Panel */}
              <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="redis-pubsub-panel">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                    Redis Pub/Sub Real-time Messaging Broker
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded">
                    event-broker
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use this terminal to publish event packets onto Redis. Any backend scripts or worker threads listening on this channel will intercept the data packet instantly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="redis-operations-form">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono font-bold text-slate-400">TARGET CHANNEL</label>
                    <input
                      type="text"
                      value={redisChannel}
                      onChange={(e) => setRedisChannel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
                      placeholder="e.g. odds_updates"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono font-bold text-slate-400">JSON PAYLOAD</label>
                    <input
                      type="text"
                      value={redisPubMsg}
                      onChange={(e) => setRedisPubMsg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs font-mono text-white"
                      placeholder='{"fixture_id": "fix-101", "edge": 0.05}'
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      // We invoke a custom helper to publish message by using fetch but wait, can we build a direct api in server.ts to trigger a publisher?
                      // Let's check! Yes, let's make sure we have a publishing API on the server, or we can mock/interact beautifully!
                      // Let's add a publishing endpoint `/api/v1/redis/publish` to our server so this button is 100% active!
                      const res = await fetch("/api/v1/redis/publish", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ channel: redisChannel, message: JSON.parse(redisPubMsg) })
                      });
                      if (res.ok) {
                        alert("Message published successfully onto channel '" + redisChannel + "'. Check Server log console!");
                      } else {
                        const data = await res.json();
                        alert("Failed: " + data.error);
                      }
                      refreshSystemData();
                    } catch (err: any) {
                      alert("Error: " + err.message);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Event onto Broker
                </button>
              </div>
            </div>
          )}

          {/* 4. SECURITY & IDENTITY (RBAC) */}
          {activeSubTab === "auth" && (
            <div className="space-y-6" id="view-security">
              {/* Form container */}
              <div className="bg-[#101726]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4" id="auth-forms-desk">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4.5 h-4.5 text-emerald-400" />
                  Cryptographic Session Simulator & RBAC Guard
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign up or log in to generate an authenticated session token. Test permission boundaries between the standard <strong>Trader</strong> access level and high-security <strong>Admin</strong> access level.
                </p>

                <form className="space-y-4" id="security-inputs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-400">EMAIL ACCOUNT</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                        placeholder="e.g. trader@platform.internal"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-400">PASSWORD SECURE</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white"
                        placeholder="Min. 8 characters"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-bold text-slate-400 block">DEFAULT ROLE POLICY</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthRole("trader")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            authRole === "trader"
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          Trader (Standard)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthRole("admin")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            authRole === "admin"
                              ? "bg-red-500/10 border-red-500 text-red-400"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          Admin (Guarded)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2" id="auth-submit-buttons">
                    <button
                      type="button"
                      onClick={handleRegister}
                      className="px-4 py-2 bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      onClick={handleLogin}
                      className="px-4 py-2 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Login to Session
                    </button>
                  </div>
                </form>

                {/* Simulated response log */}
                {authResponse && (
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 font-mono text-xs">
                    <span className="text-[10px] text-slate-500 font-bold">API GATEWAY RESPONSE:</span>
                    <pre className="text-slate-300 overflow-x-auto max-h-[120px]">
                      {JSON.stringify(authResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TERMINALS & OUTPUT MONITOR */}
        <div className="lg:col-span-5 space-y-6" id="bento-panel-right">
          
          {/* SECURE TERMINAL ACCESS MONITOR */}
          <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[180px] shrink-0" id="rbac-monitor-panel">
            <div className="border-b border-slate-800 px-4 py-3 bg-[#11192b] flex justify-between items-center" id="rbac-header">
              <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                SECURITY WALL (ROLE VERIFIER)
              </span>
              <button
                onClick={checkRbacRoute}
                className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded text-[10px] font-bold tracking-wider cursor-pointer"
              >
                PROBE ADMIN ENDPOINT
              </button>
            </div>
            <div className="flex-1 bg-[#050811] p-4 font-mono text-[11px] flex flex-col justify-between overflow-y-auto" id="rbac-monitor-output">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Bearer JWT:</span>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="None (Anonymously probe)"
                    className="flex-1 bg-transparent border-b border-slate-800 text-[10px] focus:outline-none focus:border-emerald-500 text-slate-400 placeholder-slate-700 font-mono truncate"
                  />
                </div>
                {rbacResponse ? (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">HTTP Status:</span>
                      <span className={`font-bold ${rbacResponse.status === 200 ? "text-emerald-400" : "text-red-400"}`}>
                        {rbacResponse.status} {rbacResponse.status === 200 ? "OK" : rbacResponse.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED"}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal text-[10px] bg-slate-950 p-1.5 border border-slate-900 rounded">
                      {JSON.stringify(rbacResponse.data)}
                    </p>
                  </div>
                ) : (
                  <div className="text-slate-600 mt-4 text-center text-[10px] leading-relaxed">
                    Probe the Admin-only route to test our API Role verification. <br />
                    <em>Tip: Register or log in as <strong>admin@platform.internal</strong> (pwd: <strong>AdminPassword123!</strong>) for complete administrative access!</em>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MASTER LOG FEED MONITOR */}
          <div className="bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[320px]" id="logs-monitor-panel">
            <div className="border-b border-slate-800 px-4 py-3 bg-[#11192b] flex justify-between items-center" id="logs-header">
              <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                SERVER AUDIT FEED (LIVE STREAM)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0d533b] text-emerald-300 animate-pulse">
                POLLING LIVE
              </span>
            </div>
            <div className="flex-1 bg-[#050811] p-4 font-mono text-[10px] space-y-2 overflow-y-auto max-h-[280px]" id="logs-monitor-feed">
              {serverLogs.map((log, index) => {
                let colorClass = "text-slate-300";
                let badgeClass = "bg-slate-800 text-slate-400";
                
                if (log.level === "DEBUG") {
                  colorClass = "text-cyan-300/90";
                  badgeClass = "bg-cyan-500/10 text-cyan-400";
                } else if (log.level === "INFO") {
                  colorClass = "text-emerald-300";
                  badgeClass = "bg-emerald-500/10 text-emerald-400";
                } else if (log.level === "WARN") {
                  colorClass = "text-yellow-300";
                  badgeClass = "bg-yellow-500/10 text-yellow-400";
                } else if (log.level === "ERROR") {
                  colorClass = "text-red-400 font-bold";
                  badgeClass = "bg-red-500/10 text-red-400";
                }

                return (
                  <div key={index} className="leading-relaxed border-b border-slate-900/40 pb-1.5 flex gap-2 items-start" id={`log-${index}`}>
                    <span className="text-slate-600 select-none">[{log.timestamp.slice(11, 19)}]</span>
                    <span className={`px-1 py-0.2 rounded text-[8px] font-extrabold select-none shrink-0 ${badgeClass}`}>{log.level}</span>
                    <span className="text-pink-400/90 shrink-0 select-none">[{log.context}]</span>
                    <span className={`${colorClass} break-all`}>{log.message}</span>
                  </div>
                );
              })}

              {serverLogs.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 text-center text-[10px]" id="log-monitor-empty">
                  Establishing websocket trace connection...
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>
      </div>
    )}
    </div>
  );
}
