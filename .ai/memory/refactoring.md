# 🔄 Refactoring History

## 📋 Governance & Control Metadata
- **Purpose**: Historical audit of major code improvements and structural cleanups.
- **Update Policy**: Log refactoring sweeps immediately upon production merge.
- **Owner**: Engineering Lead
- **Review Frequency**: Bi-weekly
- **Cross References**: [Technical Debt](technical-debt.md), [Clean Code Skill](../skills/clean-code.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Initial comprehensive baseline.

---

## 🏛️ Refactoring Log

### REF-001: Modularized FastAPI Endpoints (Router Refactor)
- **Date**: 2026-05-30
- **Scope**: `backend/main.py` refactored into `backend/api/v1/endpoints/`
- **Reason**: The initial monolithic `main.py` grew to over 2,000 lines, making it difficult to maintain and causing merge conflicts.
- **Before**: Single file containing all authentication, matches, and prediction calculations.
- **After**: Modular API structure utilizing FastAPI's `APIRouter`, dividing routes into `auth.py`, `matches.py`, `predictions.py`, and `portfolios.py`.
- **Performance Impact**: Zero direct CPU impact; drastically reduced developer merge collisions.
- **Regression Testing**: Fully verified by running integration tests in `tests/api/`.
- **Lessons Learned**: Enforce file length limits (max 500 lines) early in development.

---

### REF-002: Transitioned SQLAlchemy Queries to Version 2.0 Syntax
- **Date**: 2026-06-12
- **Scope**: All database service files inside `backend/services/`
- **Reason**: Mixing legacy SQLAlchemy 1.x query structures with modern async calls led to unpredictable connection leaks.
- **Before**: Raw string SQL and legacy `session.query()` syntax.
- **After**: Strict modern 2.0 `select()` structures using asynchronous mappings.
- **Performance Impact**: Average DB lookup latency dropped by 18% across the gateway.
- **Regression Testing**: All repository-level tests verified green.
- **Lessons Learned**: Avoid legacy tutorial syntax; enforce modern framework APIs.
