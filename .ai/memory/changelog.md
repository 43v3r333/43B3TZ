# 📝 Detailed Engineering Changelog

## 📋 Governance & Control Metadata
- **Purpose**: Records precise code-level changes, model iterations, and infrastructure modifications.
- **Update Policy**: Synchronize on every main-branch release. Categorize modifications strictly.
- **Owner**: Devops / Release Engineer
- **Review Frequency**: Bi-weekly
- **Cross References**: [Release History](release-history.md), [Completed Features](completed.md)
- **Revision History**:
  - `v1.3.0` (2026-07-01): Added Enterprise MLOps Control Plane.
  - `v1.2.0` (2026-07-01): Added Sports Intelligence Platform.
  - `v1.0.0` (2026-06-29): Baseline release alignment.

---

## [1.3.0] - 2026-07-01

### Added
- **Enterprise-Grade Feature Store**: Standardized dual offline/online feature cache supporting high-speed lookups, freshness audits, quality verification scores, and leak-free Point-in-Time historical queries.
- **PIT Dataset Builder**: Generates immutable chronologically split or walk-forward validation subsets with strict dataset hash checksum tracking, and custom balanced target class sampling.
- **Model Registry & Governance**: Tracks multiple model families (Logistic Regression, LightGBM, XGBoost, CatBoost, Random Forest), managing pending/approved states, automatic champion promotions, and fully auditable reversibility rollback routines.
- **Calibration & Optimization**: Computes Expected Calibration Error (ECE), Brier scores, Platt Scaling logits, Isotonic regression piecewise mappings, and optimal classification boundary thresholds.
- **Explainability Engine**: Implemented local SHAP value attribution bar charts, confidence score metrics, and global permutation feature importance calculations.
- **Drift Dashboard**: Automatically tracks data, prediction, concept, and target drifts using calculated Population Stability Index (PSI) coefficients with dynamic amber/red status alerts.
- **MLOps Control Panel**: Beautiful React console nested within the platform core console, providing tabbed panels for feature definitions, dataset compiling, training triggers, experiment lists, and real-time interactive explainable prediction tests.

### Changed
- **Express Server**: Mounted new MLOps REST router and bootstrap loaders during backend application initialization.
- **Integration Tests**: Appended custom suite containing 26 independent mathematical assertions inside `/server/tests/ml.test.ts` to core testing sequence.

---

## [1.2.0] - 2026-07-01

### Added
- **Dynamic Elo Rating Engine**: Added calculations for seed Elo, updates based on goals, home advantage factors, relegation risk indices, and season resets.
- **Expected Goals (xG) Engine**: Calculates expected goals, shot quality, finishing efficiency, and expected points distributions.
- **Form & Momentum Engine**: Processes weighted outcome strings, adjusts for opponent strength, and calculates trend momentum.
- **Fatigue & Travel Engine**: Tracks rest days, travel distances, and 21-day fixture congestion.
- **Referee & Weather Normalizers**: Analyzes referee strictness, booking rates, and home bias, alongside weather pitch degradation indicators.
- **Betting Market Intelligence**: Computes overrounds, Closing Line Value (CLV), steam alarms, sharp moves, and Soccer Power Index (SPI) models.
- **Data Quality Engine**: Evaluates freshness, coverage, reliability, and confidence indicators.
- **Temporal Snapshot Storage**: Added atomic immutable snapshot capture, history listings, and Point-in-Time state recovery.
- **Historical Replay Worker**: Allows automatic, deterministic re-calculation of all historical curated records.
- **Sports Intelligence Console**: Beautiful tabbed React view for managing and probing intelligence states, triggering replays, and running verification tests.

### Changed
- **Server Entrypoint**: Registered `/api/v1/intelligence` router and initialized Sports Intelligence bootstrap.
- **Historical snapshots**: Extended snapshot models to encompass dynamic quality indicators.

### Fixed
- **Linter Alignment**: Fixed type checking issues inside `intelligence.test.ts` and `types.ts` related to event bus enums and quality snapshots.

---

## [1.0.0] - 2026-06-29


### Added
- **Core Engine**: Fully production-ready ML model pipeline combining LightGBM, XGBoost, and CatBoost outcome predictors.
- **Valuation Module**: Kelly Criterion stake sizer featuring fractional multipliers (0.25) and a hard allocation ceiling (5.0%).
- **Telemetry**: Real-time logging framework writing JSON console outputs.
- **UI Components**: High-fidelity React 19 portfolio trackers utilizing Recharts visualizations.

### Changed
- **Database Rules**: Upgraded database access patterns from raw connections to SQLAlchemy 2.0 AsyncSessions to handle thread locks.
- **Cache Policy**: Optimized Redis keyspaces with custom namespaces (`odds:*`, `match:*`) to prevent eviction collisions.

### Fixed
- **API Router**: Fixed a websocket connection starvation issue caused by unclosed asynchronous sessions in loop processes.
- **Validation**: Fixed float representation inconsistencies in Kelly staking responses; numbers are now rounded to exactly two decimal places.

### Security
- **API Keys**: Moved all bookmaker endpoint keys and PostgreSQL credentials into standard environment structures.
- **Access Gates**: Added strict JWT authorization middleware across write endpoints.

---

## [0.9.0] - 2026-06-15

### Added
- **TimescaleDB Integration**: Set up hypertables for `historical_odds` with automatic weekly compression schedules.
- **Model Training Suite**: Implemented automated hyperparameters sweeps using Optuna.

### Changed
- **Linter System**: Replaced legacy ESLint setups with unified, strict TypeScript compilation controls.

### Fixed
- **Calibration Engine**: Resolved division-by-zero errors in overround removal logic when bookmaker markets were suspended.
