# 📦 Dependency Upgrade & Security Advisory History

## 📋 Governance & Control Metadata
- **Purpose**: Chronological log of package modifications, major lockfile upgrades, and security fixes.
- **Update Policy**: Log upgrades and library updates immediately.
- **Owner**: Security Architect / DevOps Lead
- **Review Frequency**: Bi-weekly
- **Cross References**: [Security History](security-history.md), [Technical Debt](technical-debt.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Production dependencies baseline alignment.

---

## 📑 Dependency Activity Log

### June 15, 2026: PyJWT Security Advisory Fix
- **Dependency affected**: `PyJWT` (Python JWT authentication library)
- **Previous version**: `2.4.0`
- **New version**: `2.8.0`
- **Reason**: Patched a CVE involving key confusion vulnerabilities during JWT verification sweeps.
- **Impact**: Cleaned authentication gates.

---

### June 24, 2026: Frontend React 19 Upgrades
- **Dependency affected**: React Framework Core, Recharts
- **Previous version**: React 18.2
- **New version**: React 19.0.0
- **Reason**: Optimized browser execution cycles and layout animations via React Server components and hooks.
- **Impact**: Shaved 40ms off interface interaction delay metrics.
