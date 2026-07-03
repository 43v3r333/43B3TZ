# 🏛️ System Architecture Manual

This document serves as the comprehensive architectural reference for the **AI Betting Intelligence Platform**. It details the structural design, data flow patterns, security boundaries, and infrastructure components of the platform.

---

## 🏗️ High-Level System Architecture

The platform is designed around a modern, decoupled service-oriented architecture, ensuring high scalability, resilience, and operational safety.

```mermaid
graph TB
    subgraph Client Layer
        UI[React 19 Dashboard] <-->|WebSockets & HTTP| API[FastAPI Gateway]
    end

    subgraph Service Broker Layer
        API <-->|Write Event/Query| DB[(PostgreSQL / TimescaleDB)]
        API <-->|Trigger Job| REDIS[(Redis Event Broker & Cache)]
    end

    subgraph Background Processing Layer
        REDIS <-->|Fetch Job Queue| CEL[Celery Worker Cluster]
        CEL -->|Write Scraped Odds| DB
    end

    subgraph Analytics & Modeling Layer
        FS[ML Feature Store] <-->|Read Train / Write Feature| DB
        LGBM[LightGBM Service] & XGB[XGBoost Service] & CAT[CatBoost Service] -->|Predict Arrays| CAL[Calibration Service]
        CAL -->|Calibrated Fair Odds| API
    end
```

---

## 🧩 Architectural Layers & Components

### 1. Ingestion & Scraper Layer
* **Responsibility**: Scrapes public sports bookmaker lines (Betway SA, Hollywoodbets) and historical soccer match datasets.
* **Component Design**: Async Python scraping workers orchestrated by **Celery** and **Redis**. Uses anti-fingerprinting protocols to prevent IP blocks.
* **Database Target**: Writes raw timeseries odds data directly into **TimescaleDB** tables.

### 2. Database & Storage Layer
* **PostgreSQL / TimescaleDB**: Stores structured relational entities (Tournaments, Matches, Teams, Portfolios) alongside timeseries datasets (historical odds movements).
* **Redis**: Acts as the shared state broker, Celery task queue manager, and high-speed cache for live match odds and calculated values.

### 3. Machine Learning Prediction Layer
* **Feature Store**: Builds model features (rolling goals scored, Expected Goals (xG), resting intervals, player availability indices) on demand.
* **Ensemble Classifiers**: Combines LightGBM, XGBoost, and CatBoost outcome probabilities ($H/D/A$).
* **Calibration Module**: Uses Platt Scaling (logistic calibration) to ensure predicted probabilities match real-world historical frequencies:
  $$\\lim_{N \\to \\infty} \\frac{1}{N} \\sum_{i=1}^N I(y_i = 1 | p_i = p) = p$$

### 4. Valuation & Execution Engine
* **Overround Removers**: Strips bookmaker commission profit margins ("juice" or "overround") to extract clean "Fair Odds" benchmarks.
* **Kelly Criterion Portfolio Sizer**: Computes optimal stake allocations using a fractional model to protect capital:
  $$f^* = \\frac{p \\cdot b - q}{b} \\times \\text{Fractional Coefficient}$$
  *Where:*
  - $p$ is the calibrated true model probability.
  - $b$ represents the net bookmaker odds minus 1.
  - $q$ is the probability of loss ($1 - p$).
  - *Constraint*: Clamped to a maximum of 5.0% single-event allocation.

### 5. API Gateway Layer
* **FastAPI Web Server**: Exposes REST endpoints for CRUD actions (matches, portfolios, settings) and WebSockets for real-time odds and logs updates. Uses Pydantic for strict request validation and response serialization.

### 6. User Interface Layer
* **React 19 UI Dashboard**: Built with TypeScript, Vite, Tailwind CSS, and Lucide Icons. Features interactive charts (using Recharts) for tracking value performance curves and portfolio growth metrics.

---

## 🔄 Data Architecture & Schema Definitions

```mermaid
erDiagram
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
        int match_id FK
        string bookmaker
        float odds_home
        float odds_draw
        float odds_away
        datetime updated_at
    }
    PREDICTIONS {
        int id PK
        int match_id FK
        float prob_home
        float prob_draw
        float prob_away
        datetime created_at
    }
    PORTFOLIO_TRANSACTIONS {
        int id PK
        int match_id FK
        string selection
        float odds
        float stake_percentage
        float result_amount
        string status
        datetime created_at
    }

    TOURNAMENTS ||--o{ MATCHES : contains
    MATCHES ||--o{ HISTORICAL_ODDS : records
    MATCHES ||--|| PREDICTIONS : evaluates
    MATCHES ||--o{ PORTFOLIO_TRANSACTIONS : executes
```

---

## 🛡️ Security & Compliance Design

* **Read-Only Ingestion**: The system only reads public odds pages. No account automation or transactional submission APIs exist, ensuring full compliance with local regulatory guidelines.
* **Strict CORS Rules**: API endpoints enforce strict Origin filtering, permitting connections only from authorized UI dashboard domains.
* **Rate Limiting**: Enforces rate limiting ($60$ requests per minute per IP) to prevent denial-of-service attempts.

---

## ⚡ Future Architectural Enhancements

1. **Horizontal Scaling**: Transition Celery scraper workers into autoscaling Kubernetes pods to handle match days across hundreds of leagues.
2. **Server-Side Rendering (SSR)**: Migrate the React dashboard to Next.js or a pre-rendered setup to improve initial page load times in low-bandwidth environments.
3. **Advanced Calibration Models**: Implement Isotonic Regression calibration to complement Platt Scaling for high-volume matches.
