# 🗄️ Database Schema & Migration History

## 📋 Governance & Control Metadata
- **Purpose**: Logs schema modifications, migration paths, indexing updates, and performance optimizations.
- **Update Policy**: Append new migration schema structures immediately after execution.
- **Owner**: Lead Database Engineer
- **Review Frequency**: Bi-weekly
- **Cross References**: [Database Rules](../rules/database-rules.md), [Decisions](decisions.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Shipped database history log.

---

## 🧬 Schema Migrations Log

### Migration: `001_initial_scaffold.sql`
- **Execution Date**: 2026-05-10
- **Author**: @db-lead
- **Scope**: Created core `tournaments`, `matches`, and `historical_odds` structures.
- **Index Changes**: Added B-Tree index on `matches.match_time`.
- **Rollback Script**: `DROP TABLE historical_odds; DROP TABLE matches; DROP TABLE tournaments;`

---

### Migration: `002_add_calibration_tables.sql`
- **Execution Date**: 2026-06-18
- **Author**: @db-lead
- **Scope**: Added `predictions` table with Platt calibration metrics and Expected Calibration Error logs.
- **Index Changes**: Created composite index `idx_predictions_match_calibrated` on `(match_id, calibrated_prob)`.
- **Performance Tuning**: Confirmed dynamic lookup latency decreased from 45ms to 1.2ms.

---

### Migration: `003_add_portfolio_indices.sql`
- **Execution Date**: 2026-06-28
- **Author**: @db-lead
- **Scope**: Optimizations to portfolio balance metrics tracking over high historical ranges.
- **Index Changes**: Index created on `portfolio_history.updated_at`.
