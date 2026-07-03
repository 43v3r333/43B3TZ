# 🏛️ Architecture Decision Records (ADRs)

## 📋 Governance & Control Metadata
- **Purpose**: Tracks major structural, technological, and architectural choices.
- **Update Policy**: Append new ADR entries chronologically. Never delete historical decisions.
- **Owner**: Principal Architect / Tech Lead
- **Review Frequency**: Monthly
- **Cross References**: [Decision Index](decision-index.md), [Design History](design-history.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Unified baseline architectural alignment.

---

## 🧭 Architectural Context
The AI Betting Intelligence Platform operates in a high-frequency scraping, high-throughput timeseries analytics, and strict execution-safety sports prediction domain. Decisions prioritize low API latency, strict database concurrency, reproducible ML inference, and capital protection.

---

## 📥 Active Decision Records

### ADR-001: Selected PostgreSQL with TimescaleDB Extension for Core Storage
- **Date**: 2026-05-10
- **Status**: APPROVED
- **Context**: The platform ingestion layer processes continuous bookmaker odds ticks alongside standard relational entities (matches, portfolios, accounts).
- **Problem**: Storing high-frequency sports odds movements in standard RDBMS creates heavy write lock bottlenecks and high index sizes. NoSQL lacks strict relational integrity.
- **Alternatives Considered**:
  1. *MongoDB*: Excellent for variable JSON documents but poor joins and transactional safety.
  2. *InfluxDB*: High write speeds for timeseries but detached from relational entities.
- **Decision**: Chose PostgreSQL 16 extended with TimescaleDB for automated partitioning (hypertables) and compression of odds logs while preserving native foreign keys.
- **Consequences & Tradeoffs**:
  - (+) Native JOIN operations between matches and price logs.
  - (+) Automatic timeseries table partitioning based on updated_at fields.
  - (-) Requires specialized DB hosting or Docker setup with PG extensions.
- **Review Date**: 2027-05-10
- **Linked PRs**: #101, **Linked Issues**: #24

---

### ADR-002: Selected FastAPI over Django/Flask for API Gateway
- **Date**: 2026-05-12
- **Status**: APPROVED
- **Context**: The API serves real-time calibration updates, predictions, and WebSocket logs to client dashboards.
- **Problem**: Standard Python web frameworks block on I/O operations, limiting concurrent socket connections.
- **Alternatives Considered**:
  1. *Django REST Framework*: Rich features but synchronous by default; slow JSON serialization.
  2. *Express (Node.js)*: High concurrent performance but introduces language splitting across Python ML layers.
- **Decision**: Selected FastAPI with Pydantic v2 and Uvicorn.
- **Consequences & Tradeoffs**:
  - (+) Ultra-low latency (<20ms response endpoints).
  - (+) Out-of-the-box OpenAPI documentation and strict type coercion.
  - (-) Async SQLAlchemy 2.0 connection pool setup has high boilerplate complexity.
- **Review Date**: 2027-05-12
- **Linked PRs**: #112

---

### ADR-003: Implemented Redis Event Broker and High-Speed Cache
- **Date**: 2026-05-15
- **Status**: APPROVED
- **Context**: Bookmaker scrapers and ML evaluation runs require distributed queuing and fast visual caching.
- **Problem**: Database polling for job triggers causes high read lock rates on active tables.
- **Alternatives Considered**:
  1. *RabbitMQ*: Robust event broker but lacks value caching and session tracking features.
  2. *Postgres PG_NOTIFY*: Free but doesn't handle high queue throughput under system loads.
- **Decision**: Chose Redis as the unified worker broker (Celery) and in-memory cache for live odds feeds.
- **Consequences & Tradeoffs**:
  - (+) Sub-millisecond read access for current match probabilities.
  - (+) Unified caching and background queue broker structures.
  - (-) Cache eviction configurations require careful tuning to prevent memory overflows.
- **Review Date**: 2026-11-15

---

### ADR-004: Ensemble Model Blending for Outcome Probabilities
- **Date**: 2026-05-20
- **Status**: APPROVED
- **Context**: Sports events present high noise and variable league dynamics. Single models are prone to bias.
- **Problem**: Deep learning models overfit on small sports tables, while basic Poisson models fail to capture form shifts.
- **Alternatives Considered**:
  1. *Logistic Regression*: High transparency but fails to capture complex feature interactions.
  2. *Deep PyTorch MLP*: Extremely slow inference times and difficult training cycles.
- **Decision**: Blended LightGBM (40%), XGBoost (40%), and CatBoost (20%) using Platt Scaling calibration.
- **Consequences & Tradeoffs**:
  - (+) High prediction stability across different domestic leagues.
  - (-) High training complexity and model file size management overhead.
- **Review Date**: 2026-12-20

---

### ADR-006: Point-in-Time Snapshot Storage and Deterministic Historical Replay for Sports Intelligence
- **Date**: 2026-07-01
- **Status**: APPROVED
- **Context**: Calculating downstream sports intelligence metrics (Elo, xG, form, fatigue) involves stateful calculations over chronological streams of matches. To feed ML model training without future-data leakages, we must retrieve these metrics exactly as they stood at the moment before a historical fixture's kickoff.
- **Problem**: Storing only the "current state" of team ratings, player injuries, and form factors in database tables results in a loss of historical context. Standard update operations overwrite older values, preventing historical backtesting or auditing of prediction models on historical fixtures.
- **Alternatives Considered**:
  1. *Complete On-Demand Replay*: Re-calculate all historic values from scratch whenever looking up an old state. O(N) complexity; highly computationally intensive and slow.
  2. *Standard Postgres History Tables (Triggers)*: Copy rows to a separate history log table on every UPDATE statement. Robust but lacks structural serialization tailored for complex structured sports analytics.
- **Decision**: Built a custom, atomic, append-only Temporal Snapshot ledger (`HistoricalSnapshot<T>`). On every state change, calculation engines push a versioned snapshot of the state delta into a memory-indexed/TimescaleDB hypertable partition. Storage is optimized with O(1) indices. Reconstruct states seamlessly at or before any arbitrary timestamp.
- **Consequences & Tradeoffs**:
  - (+) Zero risk of out-of-sample data leaks during model backtesting runs.
  - (+) Easily auditable timeline history for every team, player, and betting market.
  - (-) Increased storage footprint due to storing multiple immutable versions of each entity. This is mitigated by compressing snapshots using JSON compression.
- **Review Date**: 2027-01-01
- **Linked PRs**: #201, **Linked Issues**: #55

---

### ADR-007: Enterprise MLOps Control Plane with Governance Gating and Decoupled Production Endpoints
- **Date**: 2026-07-01
- **Status**: APPROVED
- **Context**: Sprint 3 requires building a resilient, multi-family, explainable MLOps platform capable of supporting continuous offline retraining, drift detection, and calibration tracking. Live production prediction endpoints and live betting execution pipelines must be completely frozen, ensuring no live betting calculations are exposed.
- **Problem**: Deploying live prediction models to public-facing API routes poses compliance risks and creates architectural tight-coupling between data retrieval and ML training. To support future model scaling, we need a decoupled governance framework with manual review gates and robust explainability tools.
- **Alternatives Considered**:
  1. *Inline Model Ingestion*: Running predictions directly inside API endpoints utilizing in-memory imports of local files. High latency, zero visibility into drift or calibration error.
  2. *Standard Cloud ML Platform (Vertex AI / SageMaker)*: Powerful but costly and introduces heavy third-party vendor lock-in that degrades local container performance.
- **Decision**: Implemented an in-house, fully decoupled MLOps control plane under `server/ml/`. Core libraries separate data ingestion from model training using an append-only Experiment Tracker and a Model Registry that acts as a strict governance gateway. Models are fitted as challenger versions and require administrator approval before being promoted to Champion. Explainability is computed on-demand using localized SHAP attributions, and drift is verified using PSI metrics. No production prediction endpoints are exposed.
- **Consequences & Tradeoffs**:
  - (+) 100% adherence to regulatory constraints by freezing production prediction interfaces.
  - (+) Full historical traceability linking any future prediction to its exact dataset version, feature set, and model hyperparameter grid.
  - (+) Automated risk reduction via Populating Stability Index (PSI) alert triggers and instant champion rollback.
  - (-) Increased engineering effort required to manage parallel model files and hyperparameter registries locally in the sandboxed database.
- **Review Date**: 2027-01-01
- **Linked PRs**: #301, **Linked Issues**: #99

