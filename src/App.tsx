import { useState, useMemo } from "react";
import {
  FileText,
  FolderGit,
  ShieldAlert,
  Sparkles,
  GitBranch,
  ClipboardCheck,
  UserCheck,
  Settings,
  Activity,
  Play,
  CheckCircle2,
  Calculator,
  Code,
  Copy,
  Search,
  Database,
  Cpu,
  Coins,
  Terminal,
  ArrowRight,
  ChevronRight,
  Bookmark,
  Check,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { workspaceCategories, WorkspaceCategory, WorkspaceFile } from "./data/workspaceData";
import CorePlatformConsole from "./components/CorePlatformConsole";

export default function App() {
  const [activeTab, setActiveTab] = useState<"overview" | "explorer" | "architecture" | "sandbox" | "agents" | "core-platform">("overview");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("core");
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile>(workspaceCategories[0].files[0]);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sandbox State
  const [odds, setOdds] = useState<number>(2.45);
  const [prob, setProb] = useState<number>(55.0);
  const [kellyFraction, setKellyFraction] = useState<number>(0.1); // Fractional Kelly multiplier
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>("Betway SA");

  // Agent Simulator State
  const [selectedAgent, setSelectedAgent] = useState<string>("ml_engineer");
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);

  // Filter Categories & Files
  const filteredCategories = useMemo(() => {
    return workspaceCategories.map(cat => {
      const filteredFiles = cat.files.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, files: filteredFiles };
    }).filter(cat => cat.files.length > 0);
  }, [searchQuery]);

  const activeCategory = useMemo(() => {
    return workspaceCategories.find(c => c.id === selectedCategoryId) || workspaceCategories[0];
  }, [selectedCategoryId]);

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Math calculations for Value Bet Sandbox
  const valueEdge = useMemo(() => {
    return (odds * (prob / 100)) - 1.0;
  }, [odds, prob]);

  const rawKelly = useMemo(() => {
    const p = prob / 100;
    const q = 1 - p;
    const b = odds - 1;
    if (b <= 0) return 0;
    return ((b * p) - q) / b;
  }, [odds, prob]);

  const allocatedKellyPercentage = useMemo(() => {
    const raw = rawKelly;
    if (raw <= 0) return 0;
    const fractionalSize = raw * kellyFraction * 100;
    return Math.min(fractionalSize, 5.0); // Strict Max 5% single stake rule from business-rules.md
  }, [rawKelly, kellyFraction]);

  // Simulated Agent Console runs
  const runAgentSimulation = (agentId: string) => {
    if (isSimulatingAgent) return;
    setIsSimulatingAgent(true);
    setAgentLogs([]);
    
    const logsMap: Record<string, string[]> = {
      architect: [
        "🤖 [Architect] Initializing operational boundary validation...",
        "🔍 [Architect] Reviewing target architecture compliance in ARCHITECTURE.md...",
        "📂 [Architect] Scanning Repository Structure to verify directory nesting...",
        "✅ [Architect] Checked: Solid adherence to Repository Pattern and Dependency Injection.",
        "✍️ [Architect] System constraints are 100% compliant. Writing ADR-003 to decisions.md.",
        "🚀 [Architect] Workflow complete. Quality Check verified."
      ],
      ml_engineer: [
        "🤖 [ML Engineer] Loading historical odds dataset from local TimescaleDB store...",
        "🧹 [ML Engineer] Processing feature extraction: rolling Form indicators, Expected Goals (xG)...",
        "🎯 [ML Engineer] Running LightGBM classifier calibration test...",
        "📊 [ML Engineer] Model log-loss: 0.612, Platt Scaling calibration holds R² of 0.945.",
        "🔎 [ML Engineer] Backtesting on 5,000 matches yields calculated net ROI of +4.2%.",
        "📦 [ML Engineer] Exporting model checkpoint serialized in models/checkpoint_latest.bin.",
        "🎉 [ML Engineer] Complete: Ready to promote classifier according to ai_model.md checklist!"
      ],
      devops: [
        "🤖 [DevOps] Initiating CI pipeline container validation...",
        "🐳 [DevOps] Building multi-stage Docker environment for betting_intel_api...",
        "🏗️ [DevOps] Docker Compose status: postgres, redis, and api services online on port 8000.",
        "🔒 [DevOps] Running pip-audit scan and security analysis checks...",
        "🧪 [DevOps] Running pytest integration test suite inside environment...",
        "✅ [DevOps] 0 vulnerabilities detected. Unit and integration test coverage: 94.2%.",
        "🚀 [DevOps] Ready for blue-green production release flow."
      ]
    };

    const targetLogs = logsMap[agentId] || [
      `🤖 [${agentId.toUpperCase()}] Running automated workflow context audit...`,
      `✅ [${agentId.toUpperCase()}] Verified rules and memory synchronization successfully.`
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < targetLogs.length) {
        setAgentLogs(prev => [...prev, targetLogs[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsSimulatingAgent(false);
      }
    }, 700);
  };

  // Helper to map icon names to Lucide icons
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText className="w-5 h-5 text-sky-400" id="icon-file-text" />;
      case "FolderGit": return <FolderGit className="w-5 h-5 text-indigo-400" id="icon-folder-git" />;
      case "ShieldAlert": return <ShieldAlert className="w-5 h-5 text-emerald-400" id="icon-shield-alert" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-amber-400" id="icon-sparkles" />;
      case "GitBranch": return <GitBranch className="w-5 h-5 text-violet-400" id="icon-git-branch" />;
      case "ClipboardCheck": return <ClipboardCheck className="w-5 h-5 text-pink-400" id="icon-clipboard-check" />;
      case "UserCheck": return <UserCheck className="w-5 h-5 text-cyan-400" id="icon-user-check" />;
      case "Settings": return <Settings className="w-5 h-5 text-slate-400" id="icon-settings" />;
      default: return <FileText className="w-5 h-5" id="icon-default" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400" id="app-root">
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-[#0f1524]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" id="logo-container">
              <Activity className="w-6 h-6 text-emerald-400 animate-pulse" id="header-logo" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans" id="header-title">AI Betting Intelligence Platform</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full" id="header-status">PROD SCAFFOLD</span>
              </div>
              <p className="text-xs text-slate-400" id="header-subtitle">Enterprise Workspace Scaffolding & AI Context Memory Engine</p>
            </div>
          </div>

          {/* Tab Selection */}
          <nav className="flex items-center bg-slate-900/80 p-1 border border-slate-800 rounded-xl" id="nav-menu">
            <button
              id="tab-overview"
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Overview
            </button>
            <button
              id="tab-explorer"
              onClick={() => {
                setActiveTab("explorer");
                // Select first file if none is selected
                if (!selectedFile && activeCategory?.files?.length > 0) {
                  setSelectedFile(activeCategory.files[0]);
                }
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "explorer"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Workspace Explorer
            </button>
            <button
              id="tab-architecture"
              onClick={() => setActiveTab("architecture")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "architecture"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              System Flows
            </button>
            <button
              id="tab-sandbox"
              onClick={() => setActiveTab("sandbox")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "sandbox"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Value Betting Math
            </button>
            <button
              id="tab-agents"
              onClick={() => setActiveTab("agents")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "agents"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              AI Agents
            </button>
            <button
              id="tab-core-platform"
              onClick={() => setActiveTab("core-platform")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "core-platform"
                  ? "bg-[#10b981] text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Core Live Console
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col" id="main-content">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="tab-view-overview"
            >
              {/* Alert notification */}
              <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="onboarding-notice">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" id="notice-icon-bg">
                    <Bookmark className="w-5 h-5 text-emerald-400" id="notice-icon" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white" id="notice-heading">Scaffolding Verification Complete</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed" id="notice-text">
                      We have generated <strong>10 core documents</strong>, <strong>26 AI Context files</strong>, <strong>15 Memory logs</strong>, <strong>42 Specialized Skills</strong>, <strong>19 strict Architecture Rules</strong>, <strong>13 development Workflows</strong>, and production configurations on disk. All files are fully populated and enterprise-ready.
                    </p>
                  </div>
                </div>
                <button
                  id="notice-action"
                  onClick={() => setActiveTab("explorer")}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors shrink-0 flex items-center gap-1"
                >
                  Explore File Tree <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-bento-grid">
                {/* Core Document Explorer Panel */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 md:col-span-2 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-core">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                        <FileText className="w-6 h-6 text-sky-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">10 files</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">Core Repository Documents</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Essential standards for onboarding, licensing, and security compliance, including <code className="text-slate-300">START_HERE.md</code> and the <code className="text-slate-300">README.md</code>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId("core");
                      setSelectedFile(workspaceCategories[0].files[0]);
                      setActiveTab("explorer");
                    }}
                    className="mt-6 flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300 gap-1.5 transition-colors text-left"
                    id="bento-card-core-action"
                  >
                    Open Core Docs <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Context Panel */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-context">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <FolderGit className="w-6 h-6 text-indigo-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">26 files</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">AI Project Context</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Permanent knowledge mapping for domain models, business constraints, and external APIs.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId("context");
                      const cat = workspaceCategories.find(c => c.id === "context")!;
                      setSelectedFile(cat.files[0]);
                      setActiveTab("explorer");
                    }}
                    className="mt-6 flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 gap-1.5 transition-colors text-left"
                    id="bento-card-context-action"
                  >
                    Browse Context <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Rules Panel */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-rules">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldAlert className="w-6 h-6 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">19 files</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">AI Coding Rules</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Strict guidelines enforcing testing, naming, database operations, and git flows.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId("rules");
                      const cat = workspaceCategories.find(c => c.id === "rules")!;
                      setSelectedFile(cat.files[0]);
                      setActiveTab("explorer");
                    }}
                    className="mt-6 flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 gap-1.5 transition-colors text-left"
                    id="bento-card-rules-action"
                  >
                    Read Rules <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Workflows Panel */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-workflows">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                        <GitBranch className="w-6 h-6 text-violet-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">13 files</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">SOP Workflows</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Detailed procedural blueprints ensuring reproducible, safe developer operations.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId("workflows");
                      const cat = workspaceCategories.find(c => c.id === "workflows")!;
                      setSelectedFile(cat.files[0]);
                      setActiveTab("explorer");
                    }}
                    className="mt-6 flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 gap-1.5 transition-colors text-left"
                    id="bento-card-workflows-action"
                  >
                    View Workflows <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Skills Panel */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-skills">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">42 files</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Specialized Skills</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deep machine learning models calibration (Platt Scaling) and soccer analytics math.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategoryId("skills");
                      const cat = workspaceCategories.find(c => c.id === "skills")!;
                      setSelectedFile(cat.files[0]);
                      setActiveTab("explorer");
                    }}
                    className="mt-6 flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 gap-1.5 transition-colors text-left"
                    id="bento-card-skills-action"
                  >
                    Inspect Skills <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Playgrounds Bento Box */}
                <div className="bg-[#101726] border border-slate-800/80 rounded-2xl p-5 col-span-1 md:col-span-2 flex flex-col justify-between group hover:border-slate-700/60 transition-colors" id="bento-card-sandbox">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                        <Calculator className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider text-cyan-400 bg-cyan-400/10 rounded font-bold">Sandbox Ready</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Betting Mathematics Engine</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Calculate Fair Probabilities, remove bookmaker margins, run risk simulations, and compute custom Kelly allocations interactively.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("sandbox")}
                    className="mt-6 flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 gap-1.5 transition-colors text-left"
                    id="bento-card-sandbox-action"
                  >
                    Open Formula Sandbox <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* Developer Environment & Configurations Section */}
              <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6" id="overview-env-section">
                <div className="flex items-center gap-3 mb-6" id="env-header">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Settings className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Repository Environment & Compilation Manifests</h3>
                    <p className="text-xs text-slate-400">Strictly typed config declarations pre-compiled inside the workspace root.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="env-files-grid">
                  <div className="bg-[#141b2e] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between" id="env-card-python">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">pyproject.toml</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Poetry dependencies locked</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategoryId("configs");
                        const cat = workspaceCategories.find(c => c.id === "configs")!;
                        const file = cat.files.find(f => f.name === "pyproject.toml") || cat.files[0];
                        setSelectedFile(file);
                        setActiveTab("explorer");
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#141b2e] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between" id="env-card-docker">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">docker-compose.yml</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">DB, Redis, & Scraper stack</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategoryId("configs");
                        const cat = workspaceCategories.find(c => c.id === "configs")!;
                        const file = cat.files.find(f => f.name === "docker-compose.yml") || cat.files[0];
                        setSelectedFile(file);
                        setActiveTab("explorer");
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#141b2e] border border-slate-800/60 p-4 rounded-xl flex items-center justify-between" id="env-card-makefile">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono">Makefile</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Automated recipe shortcuts</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategoryId("configs");
                        const cat = workspaceCategories.find(c => c.id === "configs")!;
                        const file = cat.files.find(f => f.name === "Makefile") || cat.files[0];
                        setSelectedFile(file);
                        setActiveTab("explorer");
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EXPLORER TAB */}
          {activeTab === "explorer" && (
            <motion.div
              key="explorer-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-full min-h-[500px]"
              id="tab-view-explorer"
            >
              {/* Left-hand Category list & search */}
              <div className="lg:col-span-4 bg-[#0f1524] border border-slate-800 rounded-2xl p-4 flex flex-col gap-4" id="explorer-left-sidebar">
                {/* Search Bar */}
                <div className="relative" id="search-container">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    id="workspace-search-input"
                    placeholder="Search context, rules, configs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#141b2e] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1 overflow-y-auto flex-1 max-h-[450px]" id="categories-sidebar-scroller">
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">Workspace Modules</p>
                  {filteredCategories.map(cat => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        id={`category-btn-${cat.id}`}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          if (cat.files.length > 0) {
                            setSelectedFile(cat.files[0]);
                          }
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                          isSelected
                            ? "bg-slate-800 text-white border border-slate-700 shadow-md"
                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {getIcon(cat.icon)}
                          <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-400">
                          {cat.files.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Category Files List */}
                {activeCategory && (
                  <div className="border-t border-slate-800 pt-4 flex-1 overflow-y-auto max-h-[300px]" id="files-sidebar-scroller">
                    <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-2">
                      Files inside /{activeCategory.id === "core" ? "" : "." + activeCategory.id}
                    </p>
                    <div className="space-y-1">
                      {activeCategory.files.map(file => {
                        const isSelected = selectedFile?.path === file.path;
                        return (
                          <button
                            key={file.path}
                            id={`file-btn-${file.name}`}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                            }`}
                          >
                            <span className="truncate">{file.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40" />
                          </button>
                        );
                      })}
                      {activeCategory.files.length === 0 && (
                        <p className="text-xs text-slate-500 italic px-3 py-2">No files match search</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right-hand File Reader */}
              <div className="lg:col-span-8 bg-[#0f1524] border border-slate-800 rounded-2xl flex flex-col overflow-hidden" id="explorer-reader-panel">
                {selectedFile ? (
                  <>
                    {/* Header bar */}
                    <div className="border-b border-slate-800 px-5 py-4 bg-[#11192b] flex items-center justify-between" id="reader-header">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {selectedFile.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{selectedFile.path}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{selectedFile.name}</h3>
                      </div>
                      
                      <button
                        id="copy-path-btn"
                        onClick={() => copyToClipboard(selectedFile.content, selectedFile.path)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {copiedPath === selectedFile.path ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy File</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata summary */}
                    <div className="bg-[#141b2e]/60 border-b border-slate-800/60 px-5 py-3 text-xs text-slate-400 leading-relaxed" id="reader-description">
                      <strong>Focus:</strong> {selectedFile.description}
                    </div>

                    {/* File Content Text Area */}
                    <div className="flex-1 p-5 overflow-auto bg-[#0a0d16] font-mono text-xs text-slate-300 leading-relaxed max-h-[600px]" id="reader-content-block">
                      <pre className="whitespace-pre-wrap select-text">{selectedFile.content}</pre>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500" id="reader-placeholder">
                    <FileText className="w-12 h-12 mb-3 text-slate-700" />
                    <p className="text-sm font-semibold">No file selected</p>
                    <p className="text-xs text-slate-400 mt-1">Select a folder module and file from the left panel to begin reading.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SYSTEM ARCHITECTURE TAB */}
          {activeTab === "architecture" && (
            <motion.div
              key="architecture-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              id="tab-view-architecture"
            >
              <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6" id="architecture-header">
                <h3 className="text-base font-bold text-white mb-1">Algorithmic Sports Prediction & Execution Flows</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive operational overview mapping how raw odds data and ML predictions feed into bankroll calculations.
                </p>
              </div>

              {/* Step Flowchart Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" id="architecture-flowchart">
                {/* Step 1 */}
                <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 relative group" id="arch-step-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">1</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ingestion</h4>
                  </div>
                  <h5 className="text-sm font-semibold text-sky-400 mb-2">Odds Scrapers & Public Feeds</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Celery beats trigger parsers scraping Betway and Hollywoodbets decimal values for active PSL match-events.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Database className="w-3.5 h-3.5" /> postgres/timescaledb
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 relative group" id="arch-step-2">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">2</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Inference</h4>
                  </div>
                  <h5 className="text-sm font-semibold text-indigo-400 mb-2">Model Score (LGBM)</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Calibrated ensemble models classify Home-Draw-Away (HDA) probability arrays from historical rolling statistics.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Cpu className="w-3.5 h-3.5" /> xgboost / lightgbm
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 relative group" id="arch-step-3">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">3</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Evaluation</h4>
                  </div>
                  <h5 className="text-sm font-semibold text-amber-400 mb-2">Value-Edge Comparator</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Eliminates bookmaker overround margins and calculates whether implied decimal gap returns positive mathematical edge.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Calculator className="w-3.5 h-3.5" /> odds * prob &gt; 1.0
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 relative group" id="arch-step-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">4</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Allocation</h4>
                  </div>
                  <h5 className="text-sm font-semibold text-emerald-400 mb-2">Fractional Kelly Sizer</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Computes optimal risk stake sizes, constrained to max 5.0% total limits, adjusting for active portfolio overlays.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Coins className="w-3.5 h-3.5" /> risk-managed sizing
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-[#101726] border border-slate-800 rounded-xl p-5 relative group" id="arch-step-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">5</span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">API Layer</h4>
                  </div>
                  <h5 className="text-sm font-semibold text-cyan-400 mb-2">FastAPI Gateway</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Exposes validated endpoints serving predicted slips, portfolio metrics, and active PSL match stats to frontend clients.
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Terminal className="w-3.5 h-3.5" /> async uvicorn api
                  </div>
                </div>
              </div>

              {/* Data Loop Explanation */}
              <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6" id="architecture-logic-block">
                <h4 className="text-sm font-bold text-white mb-3">Understanding the Analytics Pipeline</h4>
                <div className="space-y-4 text-xs text-slate-400 leading-relaxed" id="arch-descriptions-list">
                  <p>
                    🏈 <strong>Event Identification & Scraper Queue</strong>: The system initializes an asynchronous task flow inside Celery. Odds are fetched concurrently to ensure pricing updates reflect accurate real-time data before they shift. Scrapers target public tables with strict request rate limiting.
                  </p>
                  <p>
                    🧠 <strong>Predictive Calibration</strong>: Probability arrays are calibrated against true performance metrics (incorporating expected goal rolling metrics instead of literal scores). Calibration parameters (Platt Scaling) ensure predicted percentages closely match absolute frequency distributions, validating the math before risk allocations proceed.
                  </p>
                  <p>
                    💰 <strong>Anti-Overexposure Limits</strong>: Because pure Kelly sizing formulas can be aggressive, our platform enforces Fractional Kelly limits (strictly clamped to a max 5% parameter as defined in <code className="text-slate-300">/.ai/context/bankroll.md</code>). This maintains robust downside capital safety even during severe out-of-distribution soccer matches.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* VALUE BETTING SANDBOX TAB */}
          {activeTab === "sandbox" && (
            <motion.div
              key="sandbox-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="tab-view-sandbox"
            >
              {/* Left Sandbox Control Panel */}
              <div className="lg:col-span-5 bg-[#0f1524] border border-slate-800 rounded-2xl p-6 space-y-6" id="sandbox-controls">
                <div id="sandbox-heading">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="text-cyan-400 w-5 h-5" /> Formula Sandbox Engine
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate real bookmaker decimal values and check if they pass predictive value rules.
                  </p>
                </div>

                {/* Target Match Config */}
                <div className="space-y-3" id="match-config">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Local SA Bookmaker</label>
                  <select
                    id="bookmaker-selector"
                    value={selectedBookmaker}
                    onChange={(e) => setSelectedBookmaker(e.target.value)}
                    className="w-full bg-[#141b2e] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Betway SA">Betway SA (South Africa)</option>
                    <option value="Hollywoodbets">Hollywoodbets (South Africa)</option>
                    <option value="Sportingbet">Sportingbet</option>
                  </select>
                </div>

                {/* Decimal Odds Slider */}
                <div className="space-y-2" id="odds-slider-container">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">BOOKMAKER DECIMAL ODDS (HDA)</span>
                    <span className="font-mono text-cyan-400 font-bold bg-cyan-400/10 px-2.5 py-0.5 rounded-md text-sm">{odds.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    id="odds-range-input"
                    min="1.10"
                    max="8.00"
                    step="0.05"
                    value={odds}
                    onChange={(e) => setOdds(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.10 (Heavy Favorite)</span>
                    <span>4.50 (Underdog)</span>
                    <span>8.00 (Long Shot)</span>
                  </div>
                </div>

                {/* AI Model Estimated Probability */}
                <div className="space-y-2" id="prob-slider-container">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">AI MODEL ESTIMATED PROBABILITY</span>
                    <span className="font-mono text-indigo-400 font-bold bg-indigo-400/10 px-2.5 py-0.5 rounded-md text-sm">{prob.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    id="probability-range-input"
                    min="10"
                    max="90"
                    step="0.5"
                    value={prob}
                    onChange={(e) => setProb(parseFloat(e.target.value))}
                    className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% probability</span>
                    <span>50% (Coin Toss)</span>
                    <span>90% certainty</span>
                  </div>
                </div>

                {/* Fractional Kelly Selector */}
                <div className="space-y-2" id="kelly-slider-container">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">FRACTIONAL KELLY MULTIPLIER</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-0.5 rounded-md text-sm">{(kellyFraction).toFixed(2)} Kelly</span>
                  </div>
                  <input
                    type="range"
                    id="kelly-range-input"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={kellyFraction}
                    onChange={(e) => setKellyFraction(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.05 (Conservative)</span>
                    <span>0.25 (Standard)</span>
                    <span>0.50 (Aggressive)</span>
                  </div>
                </div>
              </div>

              {/* Right Sandbox Outcome Visuals */}
              <div className="lg:col-span-7 space-y-6" id="sandbox-results">
                {/* Mathematical Edge Panel */}
                <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6" id="edge-calc-card">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Calculation Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="edge-stats-grid">
                    {/* Value Edge Card */}
                    <div className={`p-5 rounded-2xl border transition-all ${
                      valueEdge > 0
                        ? "bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981]"
                        : "bg-rose-500/5 border-rose-500/20 text-rose-400"
                    }`} id="edge-card-status">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Value Edge</p>
                      <h4 className="text-2xl font-black mt-1 font-mono tracking-tight">
                        {valueEdge > 0 ? `+${(valueEdge * 100).toFixed(1)}%` : `${(valueEdge * 100).toFixed(1)}%`}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {valueEdge > 0 
                          ? `💡 Value detected! Decimals on ${selectedBookmaker} are mispriced relative to true probability.`
                          : `❌ No value. Implied bookmaker odds are wider than model expectations.`
                        }
                      </p>
                    </div>

                    {/* Kelly Sizing Card */}
                    <div className={`p-5 rounded-2xl border transition-all ${
                      allocatedKellyPercentage > 0
                        ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`} id="kelly-card-status">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Allocated Stake Size</p>
                      <h4 className="text-2xl font-black mt-1 font-mono tracking-tight text-white">
                        {allocatedKellyPercentage > 0 ? `${allocatedKellyPercentage.toFixed(2)}%` : "0.00%"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {allocatedKellyPercentage > 0 
                          ? `💰 Safe allocated bet fraction of user portfolio (Max 5% clamp rule enforced).`
                          : `🛡️ No allocation. Avoid betting on events holding zero positive mathematical edge.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula Walkthrough */}
                <div className="bg-[#0f1524] border border-slate-800 rounded-2xl p-6 space-y-4" id="sandbox-formula-docs">
                  <h4 className="text-sm font-bold text-white">Behind the Calculations</h4>
                  
                  <div className="bg-[#0a0d16] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-3" id="sandbox-math-logs">
                    <p className="text-slate-300">
                      1. Implied Bookmaker Probability: <span className="text-cyan-400">{(1 / odds * 100).toFixed(1)}%</span>
                    </p>
                    <p className="text-slate-300">
                      2. True Model Probability Input: <span className="text-indigo-400">{prob.toFixed(1)}%</span>
                    </p>
                    <p className="text-slate-300">
                      3. Calculated raw Kelly ratio: <span className="text-emerald-400">{(rawKelly * 100).toFixed(2)}%</span>
                    </p>
                    <p className="text-slate-300">
                      4. Proportional scaling multiplier Applied: <span className="text-amber-400">x{kellyFraction}</span>
                    </p>
                    <p className="text-slate-300 font-semibold border-t border-slate-800 pt-2.5 flex items-center justify-between">
                      <span>FINAL CLAMPED STAKE VALUE:</span>
                      <span className="text-emerald-400 text-xs font-black">{allocatedKellyPercentage.toFixed(2)}% of Portfolio</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI AGENTS TAB */}
          {activeTab === "agents" && (
            <motion.div
              key="agents-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              id="tab-view-agents"
            >
              {/* Left Agent Profiles Selector */}
              <div className="lg:col-span-5 bg-[#0f1524] border border-slate-800 rounded-2xl p-6 space-y-4" id="agent-selector-panel">
                <div id="agent-panel-heading">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="text-cyan-400 w-5 h-5" /> AI Agent Simulator Profiles
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select an autonomous developer profile and simulate how they evaluate platform changes.
                  </p>
                </div>

                <div className="space-y-2" id="agents-list-group">
                  {/* ML Engineer Agent */}
                  <button
                    id="agent-btn-ml-engineer"
                    onClick={() => setSelectedAgent("ml_engineer")}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-start ${
                      selectedAgent === "ml_engineer"
                        ? "bg-slate-800 border-indigo-500 shadow-md"
                        : "bg-[#101726]/40 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Machine Learning Engineer</h4>
                      <p className="text-sm font-bold text-white mt-0.5">ml_engineer.md</p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Responsible for rolling form matrices, calibrating Platt logs, and pipeline evaluation.
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>

                  {/* Principal Architect Agent */}
                  <button
                    id="agent-btn-architect"
                    onClick={() => setSelectedAgent("architect")}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-start ${
                      selectedAgent === "architect"
                        ? "bg-slate-800 border-sky-500 shadow-md"
                        : "bg-[#101726]/40 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Principal System Architect</h4>
                      <p className="text-sm font-bold text-white mt-0.5">architect.md</p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Preserves design boundaries, ensures SOLID adherence, and records ADR metrics.
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>

                  {/* DevOps Engineer Agent */}
                  <button
                    id="agent-btn-devops"
                    onClick={() => setSelectedAgent("devops")}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-start ${
                      selectedAgent === "devops"
                        ? "bg-slate-800 border-emerald-500 shadow-md"
                        : "bg-[#101726]/40 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Platform DevOps Engineer</h4>
                      <p className="text-sm font-bold text-white mt-0.5">devops.md</p>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        Builds containers, verifies CI tests compliance, and orchestrates blue-green deploys.
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Right Agent Terminal Output */}
              <div className="lg:col-span-7 bg-[#0f1524] border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-[400px]" id="agent-terminal-panel">
                <div className="border-b border-slate-800 px-5 py-4 bg-[#11192b] flex justify-between items-center" id="terminal-header">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">AGENT REAL-TIME RUN CONSOLE</span>
                  </div>
                  <button
                    id="agent-simulate-run-btn"
                    onClick={() => runAgentSimulation(selectedAgent)}
                    disabled={isSimulatingAgent}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isSimulatingAgent ? "Running Audit..." : "Execute Agent Task"}</span>
                  </button>
                </div>

                <div className="flex-1 bg-[#050811] p-5 font-mono text-[11px] text-slate-300 space-y-2.5 overflow-y-auto max-h-[400px]" id="agent-logs-scroller">
                  {agentLogs.map((log, index) => {
                    let logColor = "text-slate-300";
                    if (log.includes("[ML Engineer]")) logColor = "text-indigo-300";
                    if (log.includes("[Architect]")) logColor = "text-sky-300";
                    if (log.includes("[DevOps]")) logColor = "text-emerald-300";
                    if (log.includes("Checked:") || log.includes("Complete:") || log.includes("vulnerabilities detected.")) logColor = "text-emerald-400 font-semibold";
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${logColor} leading-relaxed`}
                      >
                        {log}
                      </motion.div>
                    );
                  })}

                  {agentLogs.length === 0 && !isSimulatingAgent && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500" id="terminal-empty-view">
                      <Terminal className="w-10 h-10 mb-2.5 text-slate-800" />
                      <p className="font-semibold text-slate-600">Console Idle</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                        Select a profile profile and click <strong>Execute Agent Task</strong> to stream mock verification runs.
                      </p>
                    </div>
                  )}

                  {isSimulatingAgent && agentLogs.length < 3 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2" id="terminal-loading-spinner">
                      <div className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-emerald-500 animate-spin"></div>
                      <span>Streaming reasoning cycles...</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CORE PLATFORM CONSOLE TAB */}
          {activeTab === "core-platform" && (
            <motion.div
              key="core-platform-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              id="tab-view-core-platform"
            >
              <CorePlatformConsole />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#070b13] py-5 px-6 text-center" id="app-footer">
        <p className="text-xs text-slate-500 leading-normal" id="footer-copyright">
          AI Betting Intelligence Platform Scaffold & Context System • Deployed on Enterprise AI Node • South Africa Markets Compliant
        </p>
      </footer>
    </div>
  );
}
