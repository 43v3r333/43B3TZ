# 🦾 Enterprise Architecture: Bankroll & Portfolio Engine Specification

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: value-betting-engine, simulation-engine, reporting-engine
- **Revision History**:
- `v1.0.0` (2026-06-29): Initial baseline Bankroll specification.

---

## 🎯 1. Purpose & Objectives
Exposes how the platform allocates capital across identified value opportunities, managing risk and drawdown.

---

## 🔍 2. Scope & Applicability
Mandatory standard for sizer implementations and financial loggers.

---

## 🏢 3. Structural Responsibilities
- **Responsibility**: Implement fractional Kelly Criterion models to determine optimal staking sizes.
- **Responsibility**: Enforce strict maximum exposure boundaries per single slip (clamped to 5.0%).
- **Responsibility**: Dynamically manage capital limits and restrict staking during drawdown cooling periods.

---

## 🎨 4. Core Design Principles
- **Design Principle**: Mathematical Sobriety: Risk limits represent an absolute barrier; never override sizer outputs under any circumstance.
- **Design Principle**: Long-Term Yield Focused: Optimize the geometric growth rate of bankroll while minimizing variance.
- **Design Principle**: Strict Isolation: Isolate sizer calculations from user emotional factors.

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
- **Architectural Decision**: Adopt a Fractional Kelly factor of $0.10$ ($1/10$th Kelly) to safely reduce volatility.
- **Architectural Decision**: Clamp absolute maximum stake per single bet to $5.0\%$ of the total liquid bankroll.

---



## ⚙️ 7. Core Technical Deep Dive

### 🧮 Portfolio Sizing Formulations

#### 1. Full Kelly Criterion Sizing
For decimal odds $b$ (expressed as net decimal odds, i.e., $O_i - 1.0$), win probability $p$, and loss probability $q = 1.0 - p$:
$$ f^* = \frac{p \times b - q}{b} = \frac{p \times O_i - 1.0}{O_i - 1.0} $$
Where $f^*$ is the optimal fraction of the bankroll to allocate.

#### 2. Fractional Kelly Sizing with Clamping
To protect capital against calibration error and reduce variance, we apply a fractional scaling factor $k = 0.10$ ($1/10$th Kelly):
$$ f_{\text{fractional}} = k \times f^* $$
The final stake is clamped to a safety threshold $C = 0.05$ (5% max allocation):
$$ f_{\text{final}} = \min(f_{\text{fractional}}, C) $$


---


## 💡 8. Implementation Best Practices
- **Best Practice**: Re-calculate active bankroll balance dynamically prior to executing any sizing routine.
- **Best Practice**: Enforce an aggregate daily exposure cap: maximum $20.0\%$ of total bankroll outstanding in active matches.

---

## ❌ 9. Architectural Anti-patterns
- **Anti-Pattern**: Applying full Kelly sizing, leading to high risk of complete portfolio ruin.
- **Anti-Pattern**: Recommending stakes based on absolute fiat values instead of bankroll percentages.

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: Portfolio states are audited, blocking requests attempting to place stakes exceeding account limits.

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: Sizing logic evaluates instantly, executing in less than 0.5ms.

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: Sizing logs are archived in TimescaleDB hypertables, tracking capital curves across millions of historical slips.

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: Tested against historic drawdown curves to confirm sizer keeps risk of ruin under 0.01%.

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: SRE alerts trigger if bankroll balance experiences consecutive rapid drops exceeding 15%.

---

## ⚠️ 15. Common Architectural Mistakes
- **Execution Mistake**: Staking overlapping correlated bets concurrently without adjusting for shared risk.
- **Execution Mistake**: Failing to record unsettled slip exposure when sizing new opportunities.

---

## 🚀 16. Continuous Future Improvements
- **Future Improvement**: Deploy multi-bet simultaneous Kelly allocation models solving risk covariance matrices.
- **Future Improvement**: Integrate automatic bankroll re-balancing across connected bookmaker accounts.

---

## 🕵️ 17. Architecture Review Checklist
- [ ] **Verify**: Confirm the sizer clamps absolute maximum single stakes to 5.0% of liquid assets.
- [ ] **Verify**: Verify that Kelly stakes return exactly 0.0 if the calculated edge is negative.

---

## 🔗 18. References & Linked Resources
- [value-betting-engine](value-betting-engine.md)
- [simulation-engine](simulation-engine.md)
- [reporting-engine](reporting-engine.md)
