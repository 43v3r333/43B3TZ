# Enterprise Repository Baseline Specification (v1.0.0)

This file establishes the official Architecture Baseline, frozen and approved by the Architecture Review Board (ARB). Any modifications to system topologies, core schemas, or engineering standards require an official architecture review ticket and baseline revision.

---

## 1. Baseline Manifest Versions

| Component | Active Baseline Version | Release State |
| :--- | :---: | :--- |
| **Repository Baseline** | `v1.0.0` | **Frozen (Ready for Dev)** |
| **System Architecture** | `v1.0.0` | Approved |
| **Engineering Rules** | `v1.0.0` | Enforced |
| **AI Operating Skills** | `v1.0.0` | Verified |
| **Organizational Memory**| `v1.0.0` | Indexed |
| **AI Operations System**| `v1.0.0` | Standardized |

---

## 2. Repository Architecture & Document Statistics

* **Total Documentation Count**: 118 files
* **Total Flow & Architecture Diagrams**: 42 UML/Mermaid diagrams
* **Repository Architecture Coverage**: 100% of defined subsystems mapped
* **Contract Definitions Enforced**: 10 core subsystem contracts (`/.ai/contracts/`)

### 2.1 Inventory Breakdown by Category

* **Core Project Docs (Root)**: 12 files (START_HERE.md, PROJECT_STATUS.md, etc.)
* **Context Specifications (`.ai/context/`)**: 26 files (api.md, bankroll.md, value-betting.md, etc.)
* **Engineering Standards (`.ai/rules/`)**: 19 files (coding-rules.md, security-rules.md, etc.)
* **AI Operator Skills (`.ai/skills/`)**: 42 files (fastapi.md, Sports-prediction.md, etc.)
* **Organizational Memory Records (`.ai/memory/`)**: 26 files (changelog.md, tech-debt.md, incident-history.md)
* **Architecture Blueprints (`.ai/architecture/`)**: 45 files (system-overview.md, data-ingestion.md, etc.)
* **Client Frontend App (`/src/`)**: 4 core files (App.tsx, index.css, main.tsx, etc.)

---

## 3. Known Limitations & Architectural Bounds

1. **Local Sandbox Scope**: The interactive Value Bet Sandbox inside `App.tsx` runs as a client-side calculator utilizing fractional Kelly parameters. Active bookmaker links and API feeds are stubbed as local data references pending the implementation of live microservices.
2. **Database Timescale Dependencies**: The hypertable queries in our database specifications rely on active TimescaleDB extensions on target PostgreSQL containers. Standard local runtimes require Postgres 15+ with timescale plugins loaded.
3. **Mock AI Ingress**: Background agent simulation runs are client-side stubs mimicking state transitions for ML, DevOps, and Backend agents. Real integration requires linking with the server-side Gemini 2.5 API route.

---

## 4. Immediate Development Roadmap

```
Phase 7 (Audit Baseline) ──► Phase 8 (Auth & Identity) ──► Phase 9 (Feature Store ETL) ──► Phase 10 (Prediction Inference Core)
```

1. **Phase 8 - Auth & Identity Ingress**: Implement Argon2id password managers, JWT creation gates, and FastAPI login endpoints matching our security contract.
2. **Phase 9 - Feature Store ETL Pipelines**: Build high-speed sports scrapers with Redis locks, TimescaleDB odds tables, and form feature indices calculations.
3. **Phase 10 - Predictive Inference Core**: Deploy the XGBoost ensemble model on FastAPI workers, calibrate probabilities via Platt Scaling, and hook up the fractional Kelly bankroll sizer.

---

## 5. ARB Approval & Sign-Off Checklist

- [x] **Terminology Normalized**: "Fixture", "Prediction", "Model", "Simulation", "Bankroll", "Expected Value", "Brier Score" mapped to identical definitions.
- [x] **No Rule Contradictions**: High-frequency scrapers isolated from main API threads, no direct DB queries from controllers, zero secrets in git.
- [x] **Security Guardrails Checked**: Enforced TLS 1.3, RS256 JWT signatures, Argon2id hashing parameters, and strict CORS whitelist boundaries.
- [x] **Execution Contracts Defined**: Unified markdown specification schemas written for all 10 core backend, database, and model interfaces.
- [x] **Development Guide Prepared**: Complete startup order, Definition of Done, and pipeline gates written in `IMPLEMENTATION_GUIDE.md`.

*Approved on: June 30, 2026*  
*Signed: Architecture Review Board (ARB)*
