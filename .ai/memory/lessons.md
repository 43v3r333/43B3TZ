# 🧼 Engineering Lessons & Best Practices

## 📋 Governance & Control Metadata
- **Purpose**: Institutional memory of hard-won lessons, debugging breakthroughs, and systemic corrections.
- **Update Policy**: Document root causes immediately after solving complex bugs or performance incidents.
- **Owner**: Tech Lead / Chief Architect
- **Review Frequency**: Monthly
- **Cross References**: [Known Issues](known-issues.md), [Incident History](incident-history.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Formulated from initial release engineering retrospectives.

---

## 🧠 Core Engineering Learnings

### 1. Database Connection Leakage in Async WebSockets
- **Incident Description**: FastAPI server crashed after 4 hours of live bookmaker price updates due to PostgreSQL pool exhaustion.
- **Root Cause**: The WebSocket connection loop fetched match odds inside a `while True` loop, using an active db session context manager without releasing or cleaning it up properly.
- **Lesson Learned**: Always yield database sessions in short-lived requests, or use dedicated, stateless caching layers (like Redis) inside high-frequency WebSocket streams rather than querying the database directly on every tick.
- **Preventative Action**: Configured an API middleware interceptor to verify that no sessions are left open for more than 5 seconds.

### 2. Overround Removal in Suspended Markets
- **Incident Description**: The Calibration Engine threw float errors during active match suspensions (e.g., red card event).
- **Root Cause**: During suspension, bookmakers set outcome odds to nominal values (e.g., 1.01, 100.0, 100.0), resulting in an overround calculation greater than 1.5, causing our exponential overround remover to divide by zero.
- **Lesson Learned**: Never assume incoming bookmaker price ratios are normalized or clean. Markets must be validated before calculations are run.
- **Preventative Action**: Added an odds validation filter: if overround is $<1.01$ or $>1.20$, the market is classified as suspended or invalid, bypassing prediction evaluation.

### 3. Platt Scaling Overfitting on Low-Sample Leagues
- **Incident Description**: Model performance degraded severely on newly added cup competitions (e.g., domestic knockout tournaments).
- **Root Cause**: Platt Scaling calibration was run on low-sample subsets (under 100 match history data rows), producing skewed probability calibrations.
- **Lesson Learned**: Calibration parameters must be derived globally or on high-volume league hierarchies, never on isolated sparse tournaments.
- **Preventative Action**: Implemented a fallback mechanism: if tournament historical match counts are $<150$, use global league calibration parameters instead.

### 4. Celery Task Queue Congestion Under Rapid Bookmaker Line Changes
- **Incident Description**: Real-time odds updates displayed latencies of up to 45 seconds, rendering value execution calculations obsolete.
- **Root Cause**: All scraping, odds calculation, and model evaluation tasks were routed to a single unified Celery task queue, resulting in heavy database calculation blockages.
- **Lesson Learned**: High-priority events (real-time odds updates) must be separated from slow background runs (retrospective model evaluations).
- **Preventative Action**: Split Celery into three queues: `realtime_scraping` (high priority, sub-second SLAs), `analytics` (medium priority), and `batch_training` (low priority).

### 5. Deterministic State Reconstruction & PIT Snapshot Recovery
- **Incident Description**: Retrospective audits on historical machine learning predictions found state leakage where future statistics (e.g. team form or Elo ratings updated after the match) were inadvertently used in prior predictions.
- **Root Cause**: A single global mutable state for teams and players was mutated during replay runs, meaning query evaluation at historical dates accessed current-state indicators.
- **Lesson Learned**: To perform mathematically sound historical backtesting and out-of-sample evaluations, intelligence metrics must be strictly immutable and saved as versioned point-in-time snapshots.
- **Preventative Action**: Designed a versioned temporal ledger (`HistoricalSnapshot`). Every calculation engine update logs an immutable state delta. The storage layer exposes a `getSnapshotAtTime` query that perfectly reconstructs state values as they existed at any arbitrary timestamp.

### 6. Sandbox-Enforced Model Isolation & Governance
- **Incident Description**: Compliance audit flagged high-risk of uncalibrated or untested models being pushed directly to external clients under rapid market shifts.
- **Root Cause**: Lack of structured review gates or pipeline tracking before champion model promotion.
- **Lesson Learned**: Model fitting and deployment MUST be decoupled. Models should exist as challengers in a pending state until holdout validation matrices (F1, ECE, Log Loss) are explicitly reviewed, approved, and logged.
- **Preventative Action**: Developed a centralized, transaction-audited `ModelRegistry` and parallel `ExperimentTracker`. Only approved challenger model versions can be promoted to Champion, and all promotions log an immutable audit trace, ensuring 100% reversibility.

