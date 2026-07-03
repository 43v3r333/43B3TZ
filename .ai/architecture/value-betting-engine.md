# 🦾 Enterprise Architecture: Value Betting Engine Specification

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: odds-provider, prediction-engine, bankroll-engine
- **Revision History**:
- `v1.0.0` (2026-06-29): Initial baseline Value Betting blueprint.

---

## 🎯 1. Purpose & Objectives
Exposes how the platform detects and calculates profitable value opportunities against South African bookmaker margins.

---

## 🔍 2. Scope & Applicability
Blueprint for developers implementing arbitrage and sizer models.

---

## 🏢 3. Structural Responsibilities
- **Responsibility**: Calculate the pure mathematical expected value (EV) for every fixture market.
- **Responsibility**: Strip built-in bookmaker overround margins to evaluate "Fair Odds" proxies.
- **Responsibility**: Filter and rank value bets based on edge thresholds and predictive confidence bounds.

---

## 🎨 4. Core Design Principles
- **Design Principle**: Absolute Precision: EV calculations must use exact, calibrated probability inputs.
- **Design Principle**: Market-Driven Validation: Value is calculated strictly against real-time bookmaker prices.
- **Design Principle**: Safety Gating: Automatically discard matches where odds drift exceeds safety boundaries.

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
- **Architectural Decision**: Enforce a strict value bet threshold: $Edge > 0.02$ ($2\%$ edge) to execute slips.
- **Architectural Decision**: Adopt the Multiplicative Overround Removal model as the baseline stripping standard.

---



## ⚙️ 7. Core Technical Deep Dive

### 📐 Value Bet Mathematical Formulations

#### 1. Overround Calculation
For bookmaker decimal odds on mutually exclusive outcomes $O_1, O_2, O_3$ (e.g. Home, Draw, Away):
$$ \text{Overround} (M) = \sum_{i=1}^{n} \frac{1}{O_i} - 1.0 $$
An overround $M > 0$ represents the bookmaker's built-in profit margin.

#### 2. Multiplicative Overround Removal (Fair Odds)
To find the fair implied probability $p_i^*$ stripped of the bookmaker margin:
$$ p_i^* = \frac{1 / O_i}{1.0 + M} = \frac{1 / O_i}{\sum (1 / O_i)} $$
$$ \text{Fair Odds} (O_i^*) = \frac{1}{p_i^*} $$

#### 3. Value Edge Equation
Given the calibrated model probability $P_i$ and the active bookmaker decimal odds $O_i$:
$$ \text{Value Edge} = (O_i \times P_i) - 1.0 $$
A value bet is valid strictly when $\text{Value Edge} > 0$.


---


## 💡 8. Implementation Best Practices
- **Best Practice**: Compare edges across regional providers to execute on the highest priced option.
- **Best Practice**: Log the entire state of the bookmaker market at the exact millisecond of value bet creation.

---

## ❌ 9. Architectural Anti-patterns
- **Anti-Pattern**: Calculating value bets using raw odds containing built-in overround margins.
- **Anti-Pattern**: Directly exposing value bets with negative edges to capital sizing layers.

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: Integrates verification gates ensuring odds inputs have not been manipulated or corrupted.

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: Optimized vector operations calculate value across thousands of odds records in less than 2ms.

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: The value bet identifier is stateless and processes pipelines concurrently.

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: Verified via unit testing with fixture odds, asserting edge accuracy and overround removal logic.

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: SRE metrics track average edge size, market volumes, and count of value bets published daily.

---

## ⚠️ 15. Common Architectural Mistakes
- **Execution Mistake**: Failing to handle bookmaker price changes, recommending stale bets that have already shrunk.
- **Execution Mistake**: Confusing the overround formula, leading to overestimated edges.

---

## 🚀 16. Continuous Future Improvements
- **Future Improvement**: Integrate the Harville and Shin overround removal formulas to handle highly asymmetric markets.
- **Future Improvement**: Support real-time SMS or Telegram notifications targeting high-edge (>10%) opportunities.

---

## 🕵️ 17. Architecture Review Checklist
- [ ] **Verify**: Confirm that the edge formula correctly maps bookmaker odds and model probabilities.
- [ ] **Verify**: Verify that odds records are marked as stale if they are not updated within 15 minutes.

---

## 🔗 18. References & Linked Resources
- [odds-provider](odds-provider.md)
- [prediction-engine](prediction-engine.md)
- [bankroll-engine](bankroll-engine.md)
