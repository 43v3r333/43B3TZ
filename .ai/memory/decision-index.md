# 🗂️ Architecture Decision Record Index

## 📋 Governance & Control Metadata
- **Purpose**: Master index of all completed and proposed Architecture Decision Records (ADRs).
- **Update Policy**: Keep synchronized on every ADR creation, approval, or change of status.
- **Owner**: Tech Lead
- **Review Frequency**: Monthly
- **Cross References**: [Architecture Decisions](decisions.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Master index baseline.

---

## 🗃️ Index Table

| ADR ID | Decision Title | Status | Date | Linked Pull Request | Key Tech Affected |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | Selected PostgreSQL with TimescaleDB Extension | **APPROVED** | 2026-05-10 | PR #101 | TimescaleDB / Hypertable |
| **ADR-002** | Selected FastAPI over Django/Flask | **APPROVED** | 2026-05-12 | PR #112 | FastAPI / Pydantic |
| **ADR-003** | Implemented Redis Event Broker and Cache | **APPROVED** | 2026-05-15 | PR #115 | Redis / Celery |
| **ADR-004** | Ensemble Model Blending | **APPROVED** | 2026-05-20 | PR #122 | LightGBM / XGBoost / CatBoost |
| **ADR-005** | Standardized JWT Token Handshakes for WebSockets | **APPROVED** | 2026-06-18 | PR #135 | FastAPI Security / UI |
| **ADR-006** | Point-in-Time Snapshot Storage and Deterministic Replay | **APPROVED** | 2026-07-01 | PR #201 | Temporal Snapshot Storage / Replay |
| **ADR-007** | MLOps Control Plane & Governance Gating | **APPROVED** | 2026-07-01 | PR #301 | Model Registry / Explainable Inference |

