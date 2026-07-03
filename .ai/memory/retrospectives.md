# 🏁 Sprint Retrospectives Log

## 📋 Governance & Control Metadata
- **Purpose**: Sprint-by-sprint team reviews of processes, velocity, wins, failures, and action plans.
- **Update Policy**: Append new retrospective notes at the end of every 2-week sprint.
- **Owner**: Scrum Master / Tech Lead
- **Review Frequency**: Bi-weekly
- **Cross References**: [Engineering Journal](engineering-journal.md), [Improvements](improvements.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Baseline retrospectives log.

---

## 📑 Sprint Reviews

### Sprint 12: "Golden Calibration" (2026-06-15 to 2026-06-28)
- **Goals**: Deliver Platt Scaling, build the visual React portfolio tracker, and finalize backend models.
- **Wins**:
  - Calibration module reached Expected Calibration Error (ECE) under 0.025.
  - Portfolio performance dashboard renders charts cleanly under 100ms.
- **Failures**:
  - API load tests revealed high latency when scraping and query tasks executed concurrently.
- **Action Items**:
  - [x] Split the Celery queues to isolate high-frequency scraper ticks from heavier database queries.
  - [x] Implement Redis-based response caching for the active matches API.
