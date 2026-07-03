# 📈 Continuous Improvement Register

## 📋 Governance & Control Metadata
- **Purpose**: Repository of feature optimizations, architectural enhancements, and developer experience (DX) plans.
- **Update Policy**: Document new improvement concepts post-sprint retro. Update status on active work.
- **Owner**: Product Owner / Architect
- **Review Frequency**: Monthly
- **Cross References**: [Retrospectives](retrospectives.md), [Technical Debt](technical-debt.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Baseline register alignment.

---

## 💡 Improvement Pipeline

### 1. Real-time Feature Recalculations
- **ID**: IMP-001
- **Scope**: Machine Learning / Ingestion
- **Description**: Migrate features calculation from daily batch jobs to real-time event updates via Redis Streams.
- **Expected ROI**: Real-time predictions will immediately adjust to line shifts, injuries, or in-play events.
- **Priority**: **HIGH**
- **Status**: Planned (`v1.2.0`)

### 2. Auto-tuning Hyperparameter Pipelines
- **ID**: IMP-002
- **Scope**: MLOps
- **Description**: Schedule weekly Optuna training loops to continuously optimize LGBM, XGBoost, and CatBoost hyperparameter definitions.
- **Expected ROI**: Protects prediction accuracy against historical statistical drift.
- **Priority**: **MEDIUM**
- **Status**: Backlog

### 3. Progressive Web App (PWA) Support
- **ID**: IMP-003
- **Scope**: Frontend / UI
- **Description**: Enable full service-worker caching on the React interface to allow offline review of historical portfolios.
- **Expected ROI**: Exceptional client loading metrics and offline data availability.
- **Priority**: **LOW**
- **Status**: Backlog

### 4. Direct Telegram Alerting Channel
- **ID**: IMP-004
- **Scope**: Execution / Notifications
- **Description**: Integrate a FastAPI alert router triggering instant Telegram messages when high-value (>3.0% edge) opportunities appear.
- **Expected ROI**: Minimizes delay between model discovery and stake placement.
- **Priority**: **HIGH**
- **Status**: Active (Scheduled for `v1.1.0`)
