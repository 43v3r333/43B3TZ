# 🛡️ Project Risk Register

## 📋 Governance & Control Metadata
- **Purpose**: Documents technical, operational, and financial risks alongside active mitigations.
- **Update Policy**: Update as project parameters evolve. Review on major milestones.
- **Owner**: Project Manager / Lead Architect
- **Review Frequency**: Monthly
- **Cross References**: [Security History](security-history.md), [Known Issues](known-issues.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Initial enterprise risk baseline.

---

## 📊 Risk Matrix

| Risk ID | Description | Category | Probability | Impact | Score | Active Mitigation Plan | Review Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | Bookmaker endpoint access blocks | Operational | **High** | **High** | **9/9** | Diversify scraping adapters; implement fallback API integrations; use browser farm rotations. | 2026-07-29 |
| **RISK-02** | Model Overfitting & Concept Drift | Technical | **Medium** | **High** | **6/9** | Run weekly Drift Reports tracking calibration divergence; schedule automated training loops. | 2026-07-29 |
| **RISK-03** | Server Outage on High Volume Matchdays | Technical | **Low** | **High** | **3/9** | Container deployment on auto-scaling GCP Cloud Run; configure isolated cache instances. | 2026-08-15 |
| **RISK-04** | API Key leakage in public repositories | Security | **Low** | **Critical** | **3/9** | Enforce pre-commit git secret scans; encrypt credentials via dynamic Vault config. | 2026-08-15 |
