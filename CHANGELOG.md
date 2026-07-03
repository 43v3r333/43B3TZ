# 📝 Changelog

All notable changes to the **AI Betting Intelligence Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.1] - 2026-07-02
### Added
- **AI Research Lab (Calibration)**: Implemented Platt Scaling and Isotonic Regression (PAVA) in `/server/research/calibration-lab/`.
- **AI Research API**: Added `/api/v1/research/experiments` and `/api/v1/research/experiments/run` routes.
- **Database Partitioning Prep (DEBT-002)**: Drafted TimescaleDB hypertable partitioning SQL script `/database/migrations/001_timeseries_partitioning_debt002.sql`.
- **Ingestion Patch (ISSUE-001)**: Created premium proxy-routing and stealth browser scraper connector `/backend/scrapers/hollywoodbets.py` and regression test `/tests/scrapers/test_hollywood_bypass.py`.

### Changed
- **Express Server**: Registered `/api/v1/research` API routes in `server.ts`.
- **UI Research Console**: Upgraded `ResearchLab.tsx` to interact with the API, run trials, and compare ECE and Brier metrics side-by-side.

### Fixed
- **Known Issues Ledger**: Resolved `ISSUE-001` and validated scraping bypass under high traffic.

---

## [1.2.0] - 2026-07-01
### Added
- **Sports Intelligence Platform (Sprint 2C)**:
  - **Dynamic Elo Rating Engine**: Seed ratings (1500), update ratings, home advantage multipliers, relegation offsets, and season resets.
  - **Expected Goals (xG) Engine**: Calculates match expected goals, shot quality, finishing efficiency, and expected points distributions.
  - **Form & Momentum Engine**: Processes rolling outcomes, adjusts for opponent strength, and tracks trend momentum & direction.
  - **Fatigue & Travel Engine**: Measures days rest, travel distances, and 21-day fixture congestion.
  - **Referee & Weather Normalizers**: Models referee booking rates, card strictness, home bias ratios, and weather-driven pitch degradation indices.
  - **Betting Market Intelligence**: Computes overround margins, Closing Line Value (CLV), steam/sharp notifications, and Soccer Power Index (SPI) models.
  - **Data Quality Engine**: Evaluates metrics for freshness, coverage, reliability, and confidence.
  - **Temporal Snapshot Storage**: Stores versioned, point-in-time state deltas allowing time-travel recoveries.
  - **Historical Replay Worker & Event Bus**: Deterministic re-processing of curated records with pub-sub state synchronization.
  - **Sports Intelligence Console UI**: React visualizer covering all intelligence engines, replay controls, temporal state restores, and verification tests.
- **Sports Data Providers Platform (Sprint 2A & 2B)**:
  - Standardized normalized DTO structures for sport feeds.
  - Prioritized `ProviderRegistry` with automatic failover cascades.
  - Resilient cache, retry controllers with exponential backoffs, rate-limiters, and Prometheus metrics trackers.
  - Fully simulated provider interactive playground.

---

## [0.1.0] - 2026-06-29
### Added
- **Permanent AI Memory Engine**: Structured directory patterns under \`.ai/\` containing context logs, development workflows, rules, and machine learning guidelines.
- **Root Documentation Scaffolding**: Added fully drafted, production-ready manuals:
  - [START_HERE.md](/START_HERE.md) - Interactive developer and model onboarding manual.
  - [README.md](/README.md) - High-level system overview and local setup commands.
  - [ROADMAP.md](/ROADMAP.md) - A thorough 12-phase product roadmap outlining development milestones.
  - [PROJECT_STATUS.md](/PROJECT_STATUS.md) - Real-time sprint dashboard tracking tasks, risks, and metrics.
  - [ARCHITECTURE.md](/ARCHITECTURE.md) - Deep architectural layers, data diagrams, and database schemas.
- **React Frontend Dashboard**: Initial multi-tab interface supporting:
  - **Overview Tab**: Live match calendars, active analytics dashboards, and risk-management summaries.
  - **Explorer Tab**: Read and navigate workspace code directories.
  - **Architecture Tab**: Visual system architecture flow diagrams and component descriptions.
  - **Sandbox Tab**: Interactive overround stripper and Fractional Kelly Criterion calculation calculators.
  - **Agents Tab**: Profile constraints for specialized AI agents.
- **Docker Compose Scaffolding**: Configured multi-stage Docker deployment recipes for PostgreSQL, Redis, and Python environments.
- **Python Configuration Profiles**: Drafted dependency profiles under \`pyproject.toml\` alongside linter configurations inside \`ruff.toml\`.

---

## [0.0.1] - 2026-06-15
### Added
- Initial project concept and architecture design.
- Basic folder structure design and README.md outline.
