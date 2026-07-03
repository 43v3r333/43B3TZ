import * as fs from 'fs';
import * as path from 'path';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, rawContent: string) {
  const absolutePath = path.resolve(filePath);
  ensureDir(path.dirname(absolutePath));
  // Replace placeholders with actual backticks
  const content = rawContent
    .replace(/__BTT__/g, '```')
    .replace(/__BT__/g, '`');
  fs.writeFileSync(absolutePath, content.trim() + '\n', 'utf-8');
  console.log(`✓ Context Engine: Generated ${filePath}`);
}

console.log('Generating AI Betting Intelligence Platform Context files (Safe Mode)...');

// 1. project.md
writeFile('.ai/context/project.md', `# ⚽ Project Master Definition: AI Betting Intelligence Platform

## 🎯 Mission
To develop the world's most mathematically rigorous, scalable, and secure sports betting analytics platform, operating with the discipline of a quantitative sports arbitrage hedge fund.

## 🔮 Vision
To neutralize bookmaker pricing efficiencies across multiple global sports, starting with Football (Soccer), by deploying calibrated machine learning ensembles that empower users to manage sports prediction indices as systematic investment portfolios.

__BTT__mermaid
graph TD
    A[Scrapers Ingestion Layer] -->|Raw Odds timeseries| B[(PostgreSQL / TimescaleDB)]
    C[Historical Match Stats] -->|Ingestion Pipeline| B
    B -->|Feature Extraction| D[Ensemble Classifier Store]
    D -->|Probabilities Array| E[Platt Scaling Calibration]
    E -->|Calibrated True Probabilities| F[Value Bet Comparator]
    B -->|Query Active Lines| F
    F -->|Mathematically Edge Detected| G[Kelly Criterion Sizer]
    G -->|Fractional Allocated Stake| H[Portfolio slip records]
    H -->|Sync| B
__BTT__

## 📈 Core Objectives & Business Goals
1. **Mathematical Superiority**: Deliver match outcome predictions with miscalibration rates under 5% across major global soccer leagues.
2. **Systemic Risk Mitigation**: Enforce automated bankroll sizing frameworks to fully guard capital against long-term high-variance streaks.
3. **South Africa Market Compliance**: Build zero-execution, read-only analytics solutions that strictly adhere to regional Bookmaker Terms of Service (Betway SA, Hollywoodbets) by avoiding account-automation.
4. **Sub-second Response Times**: Ensure historical timeseries queries, margin calculations, and portfolio lookups compile under 200ms.

## 🧭 Target Users & Personas
* **Quantitative Sports Analyst (The Quant)**: Demands raw math accuracy, feature importance graphs, and API data access to design individual trading parameters.
* **Systematic Value Bettor (The Portfolio Trader)**: Focuses strictly on historical ROI, cumulative growth charts, bankroll safety buffers, and risk-adjusted drawdowns.
* **Casual Sports Enthusiast**: Seeks clean visual metrics, active match calendars, and simple fractional sizers to track casual stakes securely.

## 🏁 Success Metrics & KPIs
* **Predictive Precision**: Log-loss score under $0.62$ on out-of-sample matches.
* **Risk-Adjusted Return**: Consistent portfolio yield (ROI) exceeding $+4.5\\%$ over any 1,000 simulated events.
* **Platform Availability**: 99.9% uptime for the background scrape workers and serving REST gateways.

## 📂 Core Modules
- **Data Ingest Pipeline**: Scheduled scraper workers parsing public tables and processing metrics.
- **ML Scoring Engine**: Classifiers generating calibrated match outcome arrays.
- **Value Betting Module**: Overround-remover comparing prices vs. fair expectations.
- **Portfolio Sizer**: Kelly Criterion calculator clamping stakes to a strict 5.0% single-bet rule.
- **Serving Gateway**: FastAPI controllers exposing JSON REST endpoints.

## 🔗 Related Resources
* Onboarding Guidelines: [START_HERE.md](/START_HERE.md)
* Interactive UI Engine: [src/App.tsx](/src/App.tsx)
* Technical Roadmap: [ROADMAP.md](/ROADMAP.md)
`);

// 2. vision.md
writeFile('.ai/context/vision.md', `# 🔮 Immersive Long-Term Platform Vision

## 🗺️ 5-Year Enterprise Vision
Our trajectory extends beyond a simple tipping utility. We are building the foundational infrastructure for global **Sports Asset Management**. 

__BTT__mermaid
timeline
    title 5-Year Global Scale Roadmap
    2026 : Football Launch : South Africa Bookmakers Ingestion : Kelly Portfolio Engine
    2027 : Multi-Sport Integration : Rugby, Cricket, Basketball : Live-In-Play WebSockets
    2028 : Deep Learning Models : Neural Sequence Ensembles : Automated Hyperparameter Tuning
    2029 : Multi-Tenant SaaS : Strategy Customizers : Audited Ledger APIs
    2030 : Decentralized Sports Hedge Fund : Systematic Institutional API Solutions
__BTT__

## 🧠 AI-First Engineering Principles
- **Self-Documenting Codebase**: The repository serves as a permanent, living memory. Every algorithm must be accompanied by mathematical proofs and markdown guidelines.
- **No Lookahead Data Leakage**: All training matrices and scoring features must contain rigid chronological separations to ensure future results never leak into past parameters.
- **Calibration Over Raw Output**: Classifiers must prioritize statistical calibration over sheer binary accuracy. An estimate of 55% probability must represent a real-world frequency of exactly 55%.

## 💼 Commercialization & SaaS Strategies
1. **Tiered Subscription Model**:
   - *Bronze*: Basic HDA predictions, standard match calendar tables.
   - *Silver*: Live odds updates, value calculators, basic Kelly portfolios.
   - *Gold (Enterprise)*: API access, custom model weight adjustments, advanced TimescaleDB raw access.
2. **Sports Bookmaker Feed API**: Licensing high-fidelity, overround-stripped "Fair Odds" proxies to international analytics firms.

## ⚖️ Responsible AI Principles
- **Transparency**: Every prediction display includes a detailed feature importance breakdown, showing exactly why the model estimated a specific outcome.
- **No Gambling Encouragement**: The platform enforces a strict Fractional Kelly sizer to restrict aggressive staking and provides clear visual metrics on maximum expected drawdowns.
`);

// 3. architecture.md
writeFile('.ai/context/architecture.md', `# 🏛️ Enterprise Multi-Layer Architectural Specification

This document details the layered, clean, and modular design of the platform, enforcing strict separation of concerns and database-driven decoupled states.

__BTT__mermaid
graph TD
    subgraph Presentation Layer
        UI[React 19 Dashboard] <-->|JSON WebSockets| API[FastAPI Gateway]
    end

    subgraph Domain & Business Logic
        API -->|Request DTO| VAL[Value Finder Service]
        VAL -->|Inquire Allocation| KEL[Kelly Sizing Service]
    end

    subgraph Data & Persistence Layer
        VAL & KEL -->|Repository Pattern| REPO[SQLAlchemy Repositories]
        REPO <-->|Timeseries Queries| DB[(PostgreSQL / TimescaleDB)]
        REPO <-->|Cache / Session State| REDIS[(Redis Caching Broker)]
    end

    subgraph Processing & Inference
        DB -->|Ingest Worker| CEL[Celery Workers]
        FS[ML Feature Store] -->|Evaluate Data| ML[LGBM / XGBoost Service]
        ML -->|Arrays| CAL[Calibration Service]
        CAL -->|Calibrated True Prob| VAL
    end
__BTT__

## 🏗️ Layered Architecture Boundaries

### 1. Presentation Layer (Vite / React 19)
- Completely decoupled, lightweight, static client bundle.
- Communicates exclusively over asynchronous HTTPS REST and WebSockets.
- Local state managed strictly via React hooks to avoid unnecessary re-renders.

### 2. API Gateway Layer (FastAPI)
- Exposes versioned paths (__BT__/api/v1__BT__) utilizing Pydantic models for incoming payload validation.
- Completely stateless; processes sessions and authentication via cryptographic JWT structures.
- Implements dependency injection for all data access repositories.

### 3. Domain & Application Layer
- Houses pure business rules: Kelly sizing logic, overround removal, and match result settlement algorithms.
- Contains 0 references to third-party frameworks, database drivers, or presentation configurations.

### 4. Infrastructure & Persistence Layer
- Encapsulates database drivers (SQLAlchemy, Alembic), redis connection clients, and scraping protocols.
- Implements the Repository Pattern, ensuring any controller querying data proceeds through an interface boundary.

---

## ⚡ Observability, Fault Tolerance & Disaster Recovery

- **Structured JSON Logging**: Every server process logs trace identifiers, execution metrics, and context properties in JSON format to facilitate instant debugging:
  __BTT__json
  {"timestamp": "2026-06-28T22:42:35Z", "trace_id": "ab99-1223-aff6", "level": "INFO", "message": "Calculated value-betting slip", "edge": 0.144}
  __BTT__
- **Database Backup Strategy**: Nightly logical backups saved to regional cloud object storage, with write-ahead logs (WAL) continuously streamed to replication nodes to guarantee a Recovery Point Objective (RPO) under 5 minutes.
- **Graceful Scraper Retries**: Celery tasks implement exponential backoff ($5s, 15s, 60s, 300s$) and automatic proxy rotations when hit with network errors or rate blocks.
`);

// 4. database.md
writeFile('.ai/context/database.md', `# 🗄️ Database Schema & Storage Engineering

We utilize a hybrid relational and time-series model powered by PostgreSQL and the TimescaleDB extension, optimizing historical logging of bookmaker odds alongside transactional relational entities.

---

## 🏛️ Schema Entity-Relationship Blueprint

__BTT__mermaid
erDiagram
    TOURNAMENTS ||--o{ MATCHES : contains
    MATCHES ||--o{ HISTORICAL_ODDS : records
    MATCHES ||--|| PREDICTIONS : evaluates
    MATCHES ||--o{ PORTFOLIO_SLIPS : logs

    TOURNAMENTS {
        int id PK
        string name
        string country
    }
    MATCHES {
        int id PK
        int tournament_id FK
        datetime match_time
        string home_team
        string away_team
        int home_goals
        int away_goals
        string status
    }
    HISTORICAL_ODDS {
        int id PK
        int match_id FK "Index"
        string bookmaker "Index"
        float odds_home
        float odds_draw
        float odds_away
        datetime updated_at "Timescale Hypertable"
    }
    PREDICTIONS {
        int id PK
        int match_id FK "Unique"
        float prob_home
        float prob_draw
        float prob_away
        datetime created_at
    }
    PORTFOLIO_SLIPS {
        int id PK
        int match_id FK
        string selection
        float odds
        float stake_percentage
        float result_amount
        string status
        datetime created_at
    }
__BTT__

---

## ⚙️ Naming Conventions & Database Standards

1. **Table Names**: Lowercase, plural, separated by underscores (e.g., __BT__historical_odds__BT__, __BT__portfolio_slips__BT__).
2. **Column Names**: Lowercase, singular snake_case (e.g., __BT__match_time__BT__, __BT__stake_percentage__BT__).
3. **Primary Keys**: Every relational table must define an autoincrementing integer primary key named __BT__id__BT__.
4. **Foreign Keys**: Must match parent table fields and end with __BT___id__BT__ (e.g., __BT__tournament_id__BT__ references __BT__tournaments.id__BT__).
5. **Soft Deletion**: No physical rows are deleted from transactions, portfolios, or matches. Enforce an __BT__is_deleted__BT__ boolean column and a default index constraint.

---

## ⚡ Indexing & Partitioning Strategy

- **TimescaleDB Hypertables**: The __BT__historical_odds__BT__ table is configured as a TimescaleDB hypertable partitioned by the __BT__updated_at__BT__ timestamp column in 7-day intervals.
- **Indices**:
  - __BT__matches_tournament_id_match_time_idx__BT__: Compound index to speed up tournament schedule lookups.
  - __BT__historical_odds_match_id_bookmaker_updated_at_idx__BT__: Composite index for real-time price trend comparisons.
  - __BT__portfolio_slips_status_created_at_idx__BT__: Speeds up active portfolio status listings.

---

## 🔀 Migration Protocol (Alembic)

All database adjustments must proceed through formal Alembic migrations:
1. Generate migration scripts using: __BT__poetry run alembic revision -m "add_is_deleted_to_slips"__BT__
2. Ensure backward compatibility by applying defaults before removing outdated columns.
3. Verify migrations against a development PostgreSQL docker replica before pushing.
`);

// 5. api.md
writeFile('.ai/context/api.md', `# 🔌 Unified API Specification & REST Guidelines

The platform exposes an asynchronous JSON REST and WebSocket gateway under versioned paths (__BT__/api/v1__BT__).

---

## 🛠️ API Rules & Response Envelope

All API endpoints must return a standardized JSON envelope to simplify client-side integration:

__BTT__json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-06-28T22:42:35Z",
    "trace_id": "ab99-1223-aff6"
  }
}
__BTT__

In the event of a failure, the server must return appropriate HTTP status codes ($400$ for bad requests, $401$ for unauthorized, $422$ for validation issues) with a structured error body:

__BTT__json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'odds' must be greater than 1.0",
    "details": ["odds must be in range [1.01, 100.0]"]
  },
  "meta": {
    "timestamp": "2026-06-28T22:42:35Z",
    "trace_id": "ab99-1223-aff6"
  }
}
__BTT__

---

## 📂 Core Endpoints Index

### 1. Matches & Calendar
- __BT__GET /api/v1/matches__BT__: List upcoming scheduled match-events, supporting pagination, filtering by tournament, and status lookups.
- __BT__GET /api/v1/matches/{id}/odds__BT__: Fetch historical and live bookmaker prices for a specific match.

### 2. Model Predictions
- __BT__GET /api/v1/predictions__BT__: List calibrated model outcomes.
- __BT__GET /api/v1/predictions/{match_id}__BT__: Fetch detailed prediction vectors and feature importance coefficients for a specific event.

### 3. Portfolio & Transactions
- __BT__POST /api/v1/portfolio/slips__BT__: Log a new value bet entry.
- __BT__GET /api/v1/portfolio/metrics__BT__: Expose overall capital performance: cumulative ROI, win rates, and maximum drawdowns.

---

## 🚀 Rate Limiting, CORS & Idempotency

- **Rate Limiting**: Enforces rate limiting on all endpoints using a Redis token-bucket middleware ($60$ requests per minute per IP). Exceeding this rate returns a __BT__429 Too Many Requests__BT__ response.
- **Idempotent Write Requests**: Requests to update slips or log stakes must include an __BT__Idempotency-Key__BT__ header to prevent double-submitting stakes during network hiccups.
- **CORS Profile**: Permitted origins are strictly locked to production subdomains inside the API configuration layers.
`);

// 6. business-rules.md
writeFile('.ai/context/business-rules.md', `# 💼 Core Domain Logic & Business Rules

This manual documents the mathematical boundaries and regulatory rules governing the calculation pipelines of the platform.

---

## 🔢 Value Betting Core Business Logic

A **Value Bet** is defined as an event priced higher by the bookmaker than its actual probability. To calculate a valid mathematical edge:

1. **Calculate Implied Probability**:
   $$P_{\\text{implied}} = \\frac{1.0}{\\text{Bookmaker Odds}}$$
2. **Retrieve Model Calibrated Probability** ($P_{\\text{model}}$).
3. **Verify Positive Edge**:
   $$\\text{Value Edge} = (\\text{Bookmaker Odds} \\times P_{\\text{model}}) - 1.0 > 0.0$$

### 🚫 The Overround Margin (The "Juice")
Bookmakers incorporate a profit margin (overround) into their prices:
$$\\sum P_{\\text{implied}} > 1.0$$

The platform **MUST** remove this overround margin to extract the "Fair Odds" proxy before identifying positive value edge. Imposing an edge on odds with high overrounds without stripping margins is strictly forbidden.

---

## 💰 Fractional Kelly Bankroll Safety Regulations

To protect client capital, all calculated stakes are constrained using a **Fractional Kelly Criterion**:

$$f^* = \\frac{b \\cdot p - q}{b} \\times C_{\\text{fraction}}$$

*Where:*
- $b$: Decimal odds minus $1.0$ (net fractional odds).
- $p$: Calibrated probability of winning ($P_{\\text{model}}$).
- $q$: Probability of losing ($1.0 - p$).
- $C_{\\text{fraction}}$: Strict multiplier restricted to a range of $[0.1, 0.25]$ (default is $0.1$ for ultra-conservative capital growth).

### 🛡️ Strict Risk Constraints:
- **Max Single Allocation**: No single slip recommendation can exceed **5.0%** of the total portfolio bankroll under any circumstances.
- **Overlap Exposure adjustments**: If multiple matches kickoff simultaneously, individual Kelly fractions must be divided by the total number of simultaneous slips to prevent cumulative over-exposure.

---

## ⚖️ South Africa Bookmaker Regulatory Boundaries

- **Strict Read-Only Execution**: The software is strictly an analytics suite and must never automate the placement of bets on bookmaker sites. This is required to comply with regional South African bookmaker guidelines.
- **FICA Compliance Checkpoints**: Portfolio accounts require verified KYC validations if integrated with live ledger databases.
`);

// 7. domain-model.md
writeFile('.ai/context/domain-model.md', `# 🧬 System Domain Models & Entities

This manual defines the structured data entities and relationship constraints within our sports analytics context.

---

## 🧬 Domain Entity Map

__BTT__mermaid
classDiagram
    class Tournament {
        int id
        string name
        string country
    }
    class Match {
        int id
        int tournament_id
        datetime match_time
        string home_team
        string away_team
        int home_goals
        int away_goals
        string status
    }
    class HistoricalOdd {
        int id
        int match_id
        string bookmaker
        float odds_home
        float odds_draw
        float odds_away
        datetime updated_at
    }
    class Prediction {
        int id
        int match_id
        float prob_home
        float prob_draw
        float prob_away
        datetime created_at
    }
    class PortfolioSlip {
        int id
        int match_id
        string selection
        float odds
        float stake_percentage
        float result_amount
        string status
        datetime created_at
    }

    Tournament "1" --> "0..*" Match : contains
    Match "1" --> "0..*" HistoricalOdd : records
    Match "1" --> "1" Prediction : evaluates
    Match "1" --> "0..*" PortfolioSlip : logs
__BTT__

---

## 📝 Entity Lifecycles & State Transitions

### 1. Match State Lifecycle
__BTT__mermaid
stateDiagram-v2
    [*] --> Scheduled : Match added to calendar
    Scheduled --> Live : Match kickoffs
    Live --> Completed : Final whistle blown
    Live --> Postponed : Inclement weather
    Postponed --> Scheduled : Match rescheduled
    Completed --> [*] : Results settled
__BTT__

### 2. Portfolio Slip Settlement Flow
__BTT__mermaid
stateDiagram-v2
    [*] --> Pending : Kelly fraction calculated & slip logged
    Pending --> Won : Selection won
    Pending --> Lost : Selection lost
    Pending --> Voided : Match cancelled/postponed
    Won --> [*] : Capital credited
    Lost --> [*] : Capital debited
    Voided --> [*] : Capital returned
__BTT__

---

## 🧩 Key Model Attributes

* **Tournament**: Groups competitive leagues (e.g., Premier Soccer League (PSL), English Premier League (EPL)).
* **Match**: Individual sport event, capturing competing teams, scheduling, and results.
* **HistoricalOdd**: Records timeseries price fluctuations. Contains values for Home win, Draw, and Away win.
* **Prediction**: Houses the ML probability vector ($p_{\\text{home}}$, $p_{\\text{draw}}$, $p_{\\text{away}}$).
* **PortfolioSlip**: Tracks user allocations, stake percentages, and returns.
`);

// 8. roadmap.md
writeFile('.ai/context/roadmap.md', `# 🗺️ Technical Engineering Roadmap & Milestones

This document details the quarterly milestones, dependencies, and delivery schedules for the platform.

---

## 📅 Quarterly Engineering Milestones

### 📅 Q3 2026: Core Ingestion & Historical Seeding (Active)
- **Objective**: Deploy resilient bookmaker scraping worker networks and compile historical match results database.
- **Deliverables**: Celery beats schedules, PostgreSQL Timescale schemas, Betway parsing adapters, and automated backtesting databases.
- **Milestones**: Successfully store historical match stats and live odds files for the local South African Premier Soccer League (PSL) and the English Premier League (EPL).

### 📅 Q4 2026: ML Calibrations & Value Search Engine
- **Objective**: Deploy calibrated ensemble models to estimate true outcome probabilities and find pricing gaps.
- **Deliverables**: Feature store compilations, Platt Scaling calibration modules, and overround removal services.
- **Milestones**: Calibrated classifier models producing HDA array percentages, saved as serialized bin files.

### 📅 Q1 2027: Multi-Sport Expansion & Portfolios
- **Objective**: Extend prediction models to Rugby, Cricket, and Tennis alongside interactive portfolio log tools.
- **Deliverables**: Rugby feature set engines, Kelly portfolio controllers, and real-time WebSocket match tickers.
- **Milestones**: Complete unified interactive multi-sport portfolio tracker.

---

## 🛠️ ML & Modeling Roadmap

__BTT__mermaid
graph LR
    baseline[Poisson Baselines] --> lgbm[LightGBM Classifiers]
    lgbm --> ensemble[XGB/LGBM Ensembles]
    ensemble --> nn[PyTorch Deep Sequences]
    nn --> live[In-Play live models]
__BTT__

---

## 🚀 Infrastructure & Scaling Roadmap

- **TimescaleDB Scaling**: Implement database read replica nodes to separate REST API query traffic from live scraper writes.
- **Kubernetes Autoscaling**: Transition scrapers and ML scoring services into autoscaling Kubernetes pods to handle match days across hundreds of leagues.
`);

// 9. features.md
writeFile('.ai/context/features.md', `# 📋 System Feature Specifications

This manual catalogs the technical designs, business values, and acceptance criteria for the core features of our platform.

---

## 📂 Feature Index

### 1. Real-Time Bookmaker Odds Scraper
- **Description**: Automatically and asynchronously reads public odds pages to record price changes.
- **Business Value**: Ingests up-to-date prices to compute mathematical value edges before line prices shift.
- **Technical Architecture**: Async Python parsing workers orchestrated by **Celery** and **Redis**. Uses anti-fingerprinting protocols to prevent IP blocks.
- **Acceptance Criteria**: Continuous execution over 72 hours with an error rate below 1%.

### 2. Ensemble ML Outcome Predictor
- **Description**: Generates calibrated match outcome probabilities ($H/D/A$).
- **Business Value**: Provides a reliable benchmark against which to evaluate bookmaker pricing efficiency.
- **Technical Architecture**: Combines LightGBM, XGBoost, and CatBoost outcome probabilities.
- **Acceptance Criteria**: Log-loss score under $0.62$ on out-of-sample matches, with a calibration curve $R^2 > 0.92$.

### 3. Fractional Kelly Portfolio Manager
- **Description**: Computes optimal stake allocations using a fractional Kelly Criterion model to protect capital.
- **Business Value**: Guarantees long-term downside security, preventing exponential capital drawdowns.
- **Technical Architecture**: Relational transaction models with strict constraints.
- **Acceptance Criteria**: Allocation sizes are strictly limited to under 5.0% of total portfolio capital.

---

## 📈 Feature Development Lifecycle

__BTT__mermaid
graph LR
    spec[1. Specification] --> test[2. Unit Tests]
    test --> dev[3. Implementation]
    dev --> lint[4. Lint & Format]
    lint --> ci[5. CI Validation]
    ci --> merge[6. Release]
__BTT__
`);

// 10. current-sprint.md
writeFile('.ai/context/current-sprint.md', `# 🏃 Sprint Backlog: Sprint 1 (Infrastructure)

**Sprint Goal**: Establish a world-class, enterprise-grade AI-native workspace on disk, configure linting, compile verification setups, and initialize database schemas.

---

## 🎯 Active Tasks & Assignments

- [x] **Project Scaffolding**: Create full directory structure and 10 core documents. (Principal Architect)
- [x] **React Dashboard**: Implement multi-tab dashboard interface with value sizers and agent visualizers. (Frontend Agent)
- [x] **Linters & Formatters**: Configure Ruff, Black, and MyPy. (DevOps Agent)
- [ ] **SQLAlchemy Models**: Seed SQLAlchemy tables and Alembic migrations. (Data Engineer)
- [ ] **Betway Parser Scraper**: Write BeautifulSoup parser scraping Betway decimal lines. (Backend Agent)

---

## 🧪 Definition of Done (DoD)

A task is considered 100% complete only when it meets the following criteria:
- [ ] **Type Checked**: Pass zero errors under strict TypeScript compilation (__BT__tsc__BT__) or strict Python typing (__BT__mypy__BT__).
- [ ] **Tested**: Minimum **90% statement coverage** with complete unit and integration tests.
- [ ] **Documented**: Google style docstrings on all classes/methods; markdown guides updated.
- [ ] **Formatted**: Pass Ruff and Black styling rules.

---

## 🔄 Retrospective Template

When closing the sprint, write a retrospective log documenting:
1. **What Went Well**: (e.g., Fast workspace scaffolding compilation).
2. **Where We Struggled**: (e.g., Timeout issues during async command executions).
3. **Action Items**: (e.g., Keep shell executions lightweight and fast).
`);

// 11. glossary.md
writeFile('.ai/context/glossary.md', `# 📖 Technical & Domain Glossary

Comprehensive definitions, context details, and practical examples of core terms within our sports analytics platform.

---

## ⚽ Betting & Quantitative Finance Terms

### 📈 Value Bet
An event priced higher by the bookmaker than its actual probability.
- *Mathematical Formula*:
  $$\\text{Value Edge} = (\\text{Bookmaker Odds} \\times P_{\\text{model}}) - 1.0 > 0.0$$
- *Example*: Odds = 2.5, Probability = 45% (0.45). Edge = (2.5 * 0.45) - 1.0 = +12.5%. This is a strong value bet.

### 💰 Kelly Criterion
A mathematical formula used to determine the optimal size of a series of bets to maximize logarithmic wealth growth.
- *Mathematical Formula*:
  $$f^* = \\frac{p \\cdot b - q}{b}$$
- *Where*: $p$ is the true winning probability, $b$ is the net odds (decimal odds - 1), and $q$ is the probability of losing ($1 - p$).

### 🚫 Overround
The profit margin built into a bookmaker's prices.
- *Example*: A 3-way soccer market with odds of 2.0 (Home), 3.0 (Draw), and 3.5 (Away) has an implied probability sum of:
  $$\\frac{1}{2.0} + \\frac{1}{3.0} + \\frac{1}{3.5} = 0.50 + 0.333 + 0.285 = 1.118 \\implies 11.8\\% \\text{ Overround}$$

---

## 🧠 Machine Learning & Data Terms

### 📊 Expected Goals (xG)
A metric assessing the quality of a goalscoring opportunity based on parameters like shot distance, angle, and defender pressure.
- *Example*: A shot from the penalty spot typically holds an xG of 0.76 (76% historical conversion rate).

### 🎯 Platt Scaling
A method for transforming the outputs of classification models into calibrated probability distributions.
- *Why it matters*: Ensures that if a LightGBM model estimates a home win probability of 60%, home teams win exactly 60% of those matches historically.

### 🧬 Lookahead Bias
A common mistake where future, unavailable information is used during feature engineering, resulting in over-optimistic model performance.
- *Prevention*: Enforce strict chronological time splits in the database when training.
`);

// 12. tech-stack.md
writeFile('.ai/context/tech-stack.md', `# 🛠️ Platform Technology Stack

Detailed specifications, chosen alternatives, and development standards for the core components of our technology stack.

---

## 🛠️ Complete Stack Index

| Stack Layer | Technology | Why Chosen? | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Backend API** | Python 3.11 / FastAPI | High asynchronous request-handling and native Pydantic validation. | Express, Django, Go |
| **Task Queue** | Celery / Redis | Distributed background worker queue processing scheduled odds scraping. | n8n, Airflow |
| **Database** | PostgreSQL / TimescaleDB | Relational historical match repository and historical odds timeseries logging. | MongoDB, MySQL, DynamoDB |
| **ML Models** | LightGBM / XGBoost | Multi-classifier probability ensemble modeling match vectors. | PyTorch Nets, Scikit RF |
| **Frontend UI** | React 19 / TypeScript | Modern, high-performance UI components with static rendering. | Vue, Next.js, Angular |
| **Styling** | Tailwind CSS v4 | High-fidelity utility classes and premium high-contrast layouts. | CSS Modules, SASS |

---

## 🔒 Security & Standards Compliance

- **MyPy & tsc Checkpoints**: All Python and TypeScript code must compile without errors using strict type checking.
- **Ruff Linter Compliance**: All code must comply with Ruff linting rules, maintaining highly readable, standard layouts.
- **Alembic Database Migrations**: All schema modifications must proceed through formal, backward-compatible migrations.
`);

// 13. environment.md
writeFile('.ai/context/environment.md', `# 🌐 Environment Environments & Variables

Guidelines and variable definitions across our local development, staging, and production environments.

---

## 🔑 Environment Variables Specification

The platform utilizes environmental configurations to manage database credentials, API keys, and server settings securely.

| Variable Name | Purpose | Default / Example Value | Required? |
| :--- | :--- | :--- | :--- |
| **GEMINI_API_KEY** | Server-side Gemini API key. | __BT__"AI_Studio_Secret_Token"__BT__ | **Yes** (Server-only) |
| **DATABASE_URL** | PostgreSQL database connection string. | __BT__"postgresql://postgres:secure_password@localhost:5432/betting"__BT__ | **Yes** |
| **REDIS_URL** | Redis cache and queue connection string. | __BT__"redis://localhost:6379/0"__BT__ | **Yes** |
| **LOG_LEVEL** | Logging verbosity filter. | __BT__"INFO"__BT__ | No (defaults to __BT__"INFO"__BT__) |
| **APP_URL** | Production hosting domain. | __BT__"https://bettingintel.europe-west2.run.app"__BT__ | **Yes** |

---

## 🐳 Docker Deployment Setup

We utilize multi-stage Dockerfiles to build optimized, secure development and production containers:

### Production Multi-Stage Build Flow:
1. **Base Builder**: Ingests light-slim Python, compiles development compilers (gcc, libpq), and installs Poetry dependencies.
2. **Production Stage**: Copies only clean installed library paths and source code files, minimizing the container footprint to under 300MB.
`);

// 14. dependencies.md
writeFile('.ai/context/dependencies.md', `# 📦 Platform Dependency Management

This manual defines the dependency versions, safety checks, and upgrade policies for our project packages.

---

## 🐍 Backend Python Packages (pyproject.toml)

Our Python packages are managed through Poetry to guarantee reproducible builds across dev and production.

__BTT__toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100.0"
uvicorn = "^0.22.0"
sqlalchemy = "^2.0.19"
alembic = "^1.11.1"
psycopg2-binary = "^2.9.6"
redis = "^4.6.0"
celery = "^5.3.1"
pydantic = "^2.0.2"
xgboost = "^1.7.6"
lightgbm = "^4.0.0"
catboost = "^1.2"
scikit-learn = "^1.3.0"
numpy = "^1.24.3"
pandas = "^2.0.3"
__BTT__

---

## 🛡️ Dependency Upgrade & Safety Policies

- **Strict Pinning**: Avoid major wildcard updates (e.g., __BT__*__BT__). Always specify minor bounds to prevent breaking API changes from affecting production.
- **Weekly Vulnerability Scanning**: Run __BT__pip-audit__BT__ via GitHub Actions on every push to detect known vulnerabilities in third-party libraries.
- **Upgrade Protocol**: Major package upgrades must be tested inside a dedicated development branch, verifying test suite compatibility before merging.
`);

// 15. performance.md
writeFile('.ai/context/performance.md', `# ⚡ System Performance & Optimization Guidelines

We enforce strict performance budgets and optimization strategies to ensure instant rendering and high async throughput.

---

## ⚡ Performance Budgets

- **REST API Response Latency**: Endpoints must return responses in under **200ms** at the 95th percentile.
- **Odds Processing Latency**: Scrapers must process incoming odds arrays and compare prices in under **500ms**.
- **Model Ingest Latency**: ML scoring pipelines must generate match outcome predictions in under **50ms** per match vector.

---

## ⚡ Caching, Concurrency & Database Indexing

- **Redis-Backed Query Caching**: High-volume queries (such as live match schedules or active value lists) are cached in Redis with a 5-minute time-to-live (TTL).
- **Asynchronous FastAPI Routing**: Use Python __BT__async/await__BT__ syntax for all API gateway routes to maximize concurrent request-handling capacity.
- **TimescaleDB Index Optimization**: Relational databases enforce composite indexing on core query vectors (__BT__match_id__BT__, __BT__updated_at__BT__), optimizing historical odds queries.
`);

// 16. security.md
writeFile('.ai/context/security.md', `# 🛡️ System Security Specifications

This manual outlines the threat models, encryption standards, and secure coding practices for our platform.

---

## 🛡️ Core Threat Models & Mitigations

### 1. SQL Injection Risks
* **Threat**: Unsanitized query vectors exposing sensitive database rows.
* **Mitigation**: All database queries must proceed through SQLAlchemy's ORM or parameterized compiler models. Hand-written inline raw SQL is strictly forbidden.

### 2. Over-exposure Bankroll Risks
* **Threat**: Aggressive mathematical allocations causing severe portfolio drawdowns.
* **Mitigation**: The system enforces Fractional Kelly Criterion multipliers and limits single stakes to under 5.0% of the total portfolio capital.

---

## 🔒 Authentication & Data Protection

- **OAuth2 JWT Token Authorization**: Endpoints allowing slips logging or portfolio edits are secured behind cryptographically signed JSON Web Token filters.
- **Secure Cryptographic Hashing**: User passwords are encrypted using **Argon2id** hashing before persistence.
- **HTTPS Enforcement**: API servers are configured to reject plain text HTTP traffic, redirecting all incoming requests to secure HTTPS.
`);

// 17. testing.md
writeFile('.ai/context/testing.md', `# 🧪 Testing Strategy & Quality Mandates

To guarantee extreme mathematical precision, we enforce strict testing standards across all modules.

---

## 🧪 Unified Test Categories

__BTT__mermaid
graph TD
    unit[Unit Tests] -->|Verify Math| math[Kelly / Margin formulas]
    integration[Integration Tests] -->|Verify Flow| repo[Repository CRUDs]
    e2e[End-to-End Tests] -->|Verify UI| pw[Playwright browser checks]
__BTT__

---

## 📈 Quality & Coverage Standards

- **Minimum Statement Coverage**: The test suite must cover at least **90%** of backend Python statements, with core math modules requiring 100% coverage.
- **Lookahead Bias Detection**: Tests must verify that ML feature stores contain 0 future match data leaks.
- **Continuous Integration Checkpoint**: Pull requests must pass all automated CI linter and test runs before merging.
`);

// 18. deployment.md
writeFile('.ai/context/deployment.md', `# 🐳 Deployment Architecture & Blue-Green Release Flow

We package and deploy containerized services onto secure Cloud instances using GitHub Actions pipelines.

---

## 🐳 Container Ingress Routing

All incoming external traffic is routed through a secure Nginx reverse proxy layer mapping exclusively to **Port 3000** on container ports.

__BTT__mermaid
graph LR
    web[External Client Request] -->|Port 80/443 HTTPS| proxy[Nginx Proxy]
    proxy -->|Internal Forward| api[FastAPI Gateway Port 3000]
__BTT__

---

## 🚀 Blue-Green Zero-Downtime Releases

To guarantee high availability, production deploys execute zero-downtime blue-green release swaps:
1. Spin up a new production-ready staging container ("Green") alongside the active container ("Blue").
2. Run health tests to confirm "Green" is responsive on port 3000.
3. Update proxy routing tables to forward all incoming traffic to "Green".
4. Shut down and reclaim memory from the older "Blue" instance.
`);

// 19. devops.md
writeFile('.ai/context/devops.md', `# 🚀 DevOps & Continuous Integration Pipelines

This manual documents the automated workflows, infrastructure monitoring, and CI pipelines for the platform.

---

## 🚀 Continuous Integration (GitHub Actions)

Every code push or PR automatically triggers our CI pipelines to verify style formatting, typing, and tests:

__BTT__mermaid
graph LR
    push[Git Push] --> build[Set Up Environment]
    build --> format[Verify Formatting: Black/Ruff]
    format --> typing[Verify Typing: MyPy/tsc]
    typing --> test[Run Tests: Pytest/Playwright]
    test --> res{Passes?}
    res -->|Yes| deploy[Trigger Deployment]
    res -->|No| notify[Alert Team on Slack]
__BTT__

---

## 📊 Infrastructure Alerting & Metrics

- **System Metrics**: Monitored via Prometheus and visualized on Grafana.
- **Alert Triggers**: If API error rates exceed 2% or Celery task latency crosses 60s, automated alerts are sent to the engineering Slack channel immediately.
`);

// 20. frontend.md
writeFile('.ai/context/frontend.md', `# ⚛️ Frontend UI Architecture & State Patterns

This manual outlines the React 19 visual systems, responsive designs, and interactive chart visualizations.

---

## ⚛️ React 19 / TypeScript Stack

- **Vite & TypeScript**: Standard Vite development pipeline and strict TypeScript type structures. No wildcard typings are permitted.
- **Tailwind CSS v4**: Utility-first styling with custom dark theme variables defined under __BT__/src/index.css__BT__.
- **Lucide Icons**: All application icon resources must be imported from the __BT__lucide-react__BT__ package.

---

## 📂 UI Folder Structure

__BTT__
├── src/
│   ├── components/            # Extracted visual tables, cards, and modal components
│   ├── data/                  # Static structures and workspace lists
│   ├── index.css              # Global styles, Tailwind variables, and fonts
│   ├── main.tsx               # Main DOM renderer entry point
│   └── App.tsx                # Main interactive dashboard container
__BTT__

---

## 📊 Chart Visualizations

We use **Recharts** for data visualization, providing responsive design containers that resize fluidly across viewports.
`);

// 21. backend.md
writeFile('.ai/context/backend.md', `# 🐍 Backend Python Architecture & Design Patterns

Detailed specifications for our Python API framework, dependency injection, and CRUD controllers.

---

## 🐍 FastAPI, SQLAlchemy & Celery

- **FastAPI Core Gateway**: Handles asynchronous incoming requests, validates parameters using Pydantic models, and auto-generates Swagger documentation.
- **Repository Patterns**: Database queries are encapsulated inside SQLAlchemy Repository patterns. Exposing database details directly inside routers is forbidden.
- **Async Celery Workers**: Offloads high-latency, scheduled scraper jobs from the main API thread.

---

## 📂 Backend Folder Layout

__BTT__
├── backend/
│   ├── api/                   # Router paths, payloads, and JWT middlewares
│   ├── database/              # DB session connections, tables, and CRUD classes
│   └── services/              # Pure business logic: Kelly calculators, scraper adapters
__BTT__

---

## 🧩 Dependency Injection Standards

All external services (such as databases or scrapers) must be injected into controllers via FastAPI's __BT__Depends__BT__ interface:

__BTT__python
@app.get("/api/v1/portfolio/slips")
async def get_portfolio_slips(
    repo: SlipRepository = Depends(get_slip_repository),
):
    return repo.get_all_active_slips()
__BTT__
`);

// 22. ai-models.md
writeFile('.ai/context/ai-models.md', `# 🧠 Machine Learning Models & Ensemble Pipelines

This manual documents the classification, regression, and model versioning pipelines.

---

## 🧠 Outcome Classification Ensembles

The platform leverages a multi-classifier ensemble to estimate Home-Draw-Away (HDA) probabilities:

__BTT__mermaid
graph TD
    match[Match Feature Array] --> lgbm[LightGBM Classifier]
    match --> xgb[XGBoost Classifier]
    match --> cat[CatBoost Classifier]
    lgbm & xgb & cat -->|Probability Vector| ens[Ensemble Averager]
    ens -->|Raw Percentages| cal[Platt Scaling Calibration]
    cal -->|Calibrated True Probabilities| out[Value Comparator]
__BTT__

---

## 📈 Model Training & Drift Evaluation

- **Time-Series Cross-Validation**: To avoid lookahead biases, models are evaluated on chronological splits. Past matches are never used to train on future results.
- **Model Drift Detection**: We run automated evaluation loops every Monday. If the log loss score on out-of-sample data increases by more than 0.05, the retraining pipeline is triggered automatically.
`);

// 23. data-pipeline.md
writeFile('.ai/context/data-pipeline.md', `# 📊 Data Processing & Feature Engineering Ingestion

Detailed documentation on the ETL pipelines, data validations, and feature extraction layers.

---

## 🔄 ETL Pipeline Pipeline Flow

__BTT__mermaid
graph LR
    raw[Ingest Odds & Match Logs] --> val[Validation: Pydantic schemas]
    val --> store[Save Raw: PostgreSQL]
    store --> eng[Compute Features: Rolling rolling xG]
    eng --> ml[Score Predictions]
__BTT__

---

## 🧬 Feature Engineering Store

1. **Rolling Form Dynamics**: Computes weighted average goals, shots on target, and possession percentages over previous $k \\in [3, 5, 10]$ matches.
2. **Rest Day Vectors**: Measures travel distance and resting day gaps between matches for each team.
3. **Rating Systems**: Implements Elo rating modifications adjusted for league and competitive depth.
`);

// 24. value-betting.md
writeFile('.ai/context/value-betting.md', `# 💰 Mathematics of Value Betting & Edge Calculations

Detailed documentation on the mathematical formulas, overround removals, and valuation algorithms used by our platform.

---

## 🔢 Overround Strip Formulas

Bookmakers build margins into their odds:
$$\\sum P_{\\text{implied}} > 1.0$$

The platform removes these margins to estimate "Fair Odds" proxies using the Multiplicative Margin Model:

$$P_{\\text{fair}, i} = \\frac{P_{\\text{implied}, i}}{\\sum_{j=1}^k P_{\\text{implied}, j}}$$

---

## 💰 Expected Value (EV) Edge Calculations

Once we compute the fair probability proxy ($p$), we evaluate bookmaker decimal odds ($O$):

$$\\text{Expected Value (EV)} = (O \\times p) - 1.0$$

### 🛡️ Risk-Edge Constraints
A bet is logged as a **Value Bet** only when:
- Implied overround margins are successfully removed.
- Calculated mathematical edge exceeds $+2.5\\%$ ($\\text{EV} > 0.025$).
- Match data quality meets completeness criteria.
`);

// 25. bankroll.md
writeFile('.ai/context/bankroll.md', `# 💰 Capital Preservation & Bankroll Management Sizing

This document details the portfolio sizing algorithms and risk constraints that protect capital from high-variance streaks.

---

## 🔢 Fractional Kelly Allocation Formula

Stakes are sized using a Fractional Kelly Criterion model:

$$f^* = \\frac{b \\cdot p - q}{b} \\times C_{\\text{fraction}}$$

*Where:*
- $b$: Decimal odds minus $1.0$.
- $p$: Calibrated model probability.
- $q$: Probability of loss ($1.0 - p$).
- $C_{\\text{fraction}}$: Risk-tolerance coefficient clamped to $[0.1, 0.25]$.

---

## 🛡️ Staking Portfolio Constraints

__BTT__mermaid
graph TD
    raw[Raw Kelly Percentage] --> sizer[Fractional Sizer C_fraction=0.1]
    sizer --> clamp[Clamp Stake to Max 5.0%]
    clamp --> overlap[Divide by simultaneous overlaps]
    overlap --> portfolio[Final logged stake]
__BTT__

- **Strict Max Stake Clamp**: No slip can recommend an allocation exceeding **5.0%** of total bankroll.
- **Overlap Adjustment**: During busy match days, the allocated Kelly fraction is adjusted based on overlap counts to prevent over-exposure.
`);

// 26. automation.md
writeFile('.ai/context/automation.md', `# ⚙️ Platform Automation & Background Task Schedules

This document details the scheduled cron jobs, event-driven pipelines, and retry mechanisms.

---

## 📅 Scheduled Background Tasks

All background jobs are orchestrated using Celery Beats and scheduled cron triggers.

| Job Description | Trigger Schedule | Action Flow | Failure Tolerance |
| :--- | :--- | :--- | :--- |
| **Odds Scraper** | Every 15 minutes | Scrape and save Betway SA and Hollywoodbets prices. | 3 retries, rotated proxies |
| **Match Calendar Sync** | Daily at 02:00 AM | Ingest scheduled match events. | Alert on Slack on failure |
| **Model Evaluator** | Weekly on Mondays | Evaluate prediction log-loss and model drift. | Automatic retraining fallback |

---

## 🛠️ Automated Alerting Flows

If a scraping run fails 3 consecutive times or model validation metrics degrade, the DevOps system instantly alerts the team via Slack webhook integrations.
`);

console.log('🎉 Context Generation Complete! All 26 context files are fully populated and complete.');
