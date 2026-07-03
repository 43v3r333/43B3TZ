# 🚨 Production Incident History & Postmortems

## 📋 Governance & Control Metadata
- **Purpose**: Postmortems, timelines, root cause analyses, and action items for production incidents.
- **Update Policy**: Log incidents within 24 hours of resolution.
- **Owner**: DevOps / SRE Lead
- **Review Frequency**: Monthly
- **Cross References**: [Known Issues](known-issues.md), [Lessons Learned](lessons.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Unified historic incidents baseline.

---

## 📑 Incident Reports

### INC-2026-001: Cloudflare Bot Challenges Blocked Hollywoodbets Ingestion
- **Incident Date**: 2026-06-12
- **Severity**: **CRITICAL** (Total Hollywoodbets scraping downtime for 6 hours)
- **Timeline**:
  - *08:00 UTC*: Automated alerts reported zero odds ticks from Hollywoodbets.
  - *08:15 UTC*: Confirmed HTTP 403 Forbidden responses on scraping workers.
  - *09:30 UTC*: Identified dynamic Cloudflare JS challenge blockages.
  - *14:00 UTC*: Integrated rotated proxy provider with automated headless browsers; scraping restored.
- **Root Cause**: Bookmaker deployed updated DDoS shields before high-profile Premier League fixtures.
- **Resolution**: Implemented dynamic browser headers emulation and premium proxies.
- **Preventative Actions**:
  - [x] Configure automated alerting when odds ticks are zero for $>30$ minutes.
  - [x] Integrate fallback scraping endpoints via public sports statistics APIs.
  - [x] Weekly scheduled scanning of bookmaker network parameters.
