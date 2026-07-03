# 🛡️ Security Audit & Threat Modeling History

## 📋 Governance & Control Metadata
- **Purpose**: Audit log of security assessments, credential rotations, and vulnerability cleanups.
- **Update Policy**: Update on every vulnerability scan, key rotation, or threat modeling update.
- **Owner**: Security Engineer
- **Review Frequency**: Quarterly
- **Cross References**: [Technical Debt](technical-debt.md), [API History](api-history.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Initial baseline security audit.

---

## 🔐 Threat Assessment & Modeling

### Core Attack Surface Analysis
1. **Scraper Authentication**: Credentials for bookmakers stored as environment variables.
2. **API Endpoint Poisoning**: Strict Pydantic input coercion shields the platform against SQL Injection and buffer overruns.
3. **WebSocket Spoofing**: JWT token validation enforced during the socket handshake.

---

## 📑 Security Audits Log

### SEC-001: Automated Dependency Scan (Snyk)
- **Date**: 2026-06-15
- **Status**: PASSED (0 Critical, 2 Medium vulnerabilities)
- **Findings**:
  - *PyJWT Legacy version dependency*: Upgraded from `2.4.0` to `2.8.0` to resolve token spoofing vulnerabilities.
  - *FastAPI CORS wildcards*: Restrictive CORS origins implemented in production configs.

### SEC-002: Dynamic Application Security Testing (DAST)
- **Date**: 2026-06-25
- **Status**: PASSED
- **Verification**: Confirmed that rate-limiting policies successfully prevent API token brute-forcing (60 requests per minute limit).
