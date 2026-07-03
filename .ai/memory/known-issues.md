# 🐛 Active Known Issues & Bug Tracker

## 📋 Governance & Control Metadata
- **Purpose**: Captures active, unresolved system behaviors, and operational bugs.
- **Update Policy**: AI must log new issues upon detection and transition status when resolved.
- **Owner**: QA Engineering Lead
- **Review Frequency**: Weekly
- **Cross References**: [Technical Debt](technical-debt.md), [Incident History](incident-history.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Active production issue status.

---

## 🐞 Bug Ledger

### ISSUE-001: Hollywoodbets Scraping Failures Under High Traffic
- **Issue ID**: ISSUE-001
- **Severity**: **CRITICAL**
- **Affected Modules**: `backend/scrapers/hollywoodbets.py`
- **Root Cause**: Bookmaker utilizes Cloudflare anti-bot verification challenges during high-traffic match windows.
- **Workaround**: Route Hollywoodbets scraping tasks through a premium proxy network with automated headless browser rotation.
- **Status**: **RESOLVED**
- **Linked Fixes**: Implemented in `/backend/scrapers/hollywoodbets.py` with rotating proxies & stealth browser fallbacks
- **Regression Tests**: Verified passing via `/tests/scrapers/test_hollywood_bypass.py`

---

### ISSUE-002: Floating-point Inaccuracies in Portfolio Profit Computations
- **Issue ID**: ISSUE-002
- **Severity**: **LOW**
- **Affected Modules**: `frontend/src/components/stats_panel.tsx`
- **Root Cause**: React UI performs rolling calculations on float-based currency returns, introducing minor precision drift.
- **Workaround**: Format displayed float values using `.toFixed(2)` on all dashboard visual widgets.
- **Status**: RESOLVED
- **Linked Fixes**: Commit `7a4b12c` (merged)
- **Regression Tests**: None (Visual fix)

---

### ISSUE-003: Memory Leak in Recharts Dashboard Elements on Mobile Safari
- **Issue ID**: ISSUE-003
- **Severity**: **MEDIUM**
- **Affected Modules**: `frontend/src/components/charts/`
- **Root Cause**: Rapid real-time data ticks cause canvas re-render loops in Safari's layout engine.
- **Workaround**: Debounce real-time updates to 5-second intervals on mobile viewports.
- **Status**: OPEN
- **Linked Fixes**: Issue #87
- **Regression Tests**: Automated visual regression suite under Safari environments.
