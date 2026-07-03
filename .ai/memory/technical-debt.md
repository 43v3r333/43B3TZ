# 🗃️ Technical Debt Registry

## 📋 Governance & Control Metadata
- **Purpose**: Tracks intentional tradeoffs, architectural compromises, and planned remediation pipelines.
- **Update Policy**: Register items when making architectural concessions. Mark as resolved upon code updates.
- **Owner**: Tech Lead
- **Review Frequency**: Monthly
- **Cross References**: [Improvements Register](improvements.md), [Refactoring History](refactoring.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Base baseline alignment.

---

## 📊 Technical Debt Ledger

| Debt ID | Description | Affected Modules | Impact | Priority | Estimated Effort | Owner | Risk | Mitigation Plan | Target Release |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | Synchronous requests library in scrapers | `backend/scrapers/` | Blocks worker thread during slow responses | **Medium** | 3 days | @scrapers-dev | Socket timeout risks under bookmaker server loads | Set aggressive timeout limits (3s); plan rewrite using `httpx` async client. | `v1.1.0` |
| **DEBT-002** | Missing timeseries partitioning in raw match logs | `database/` | Query performance degradation over 6-month history | **High** | 5 days | @db-lead | Hypertable storage overheads and slow index scans | Transition match table to native TimescaleDB hypertable structures. | `v1.2.0` |
| **DEBT-003** | Frontend State Duplication | `frontend/src/` | Redundant API requests and layout flickering | **Low** | 2 days | @frontend-dev | Higher network payload costs | Unify state storage using Zustand or a clean React Context. | `v1.1.0` |
| ~~**DEBT-004**~~ | ~~Hardcoded model file loading~~ | `server/ml/registry/` | **RESOLVED** | — | — | @ml-ops | None | **Resolved in v1.3.0** via the Model Registry and dynamic version loader. | `v1.3.0` |
| **DEBT-005** | Lack of isolated testing databases | `tests/` | Testing processes occasionally pollute development tables | **High** | 3 days | @qa-lead | Corrupted records during parallel testing sweeps | Standardize Docker Compose testing setups running separate, auto-migrated DBs. | `v1.1.0` |
| **DEBT-006** | Simplified weather impact interpolation models | `server/intelligence/weather/` | Weather-to-pitch degradation uses static linear coefficients | **Low** | 2 days | @ml-engineer | Under-prediction of tactical impact in extreme wind or rainy conditions | Migrate to non-linear physical turf friction equations matching specific venue grass types. | `v1.3.0` |

