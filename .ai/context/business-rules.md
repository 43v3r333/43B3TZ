# 💼 Core Domain Logic & Business Rules

This manual documents the mathematical boundaries and regulatory rules governing the calculation pipelines of the platform.

---

## 🔢 Value Betting Core Business Logic

A **Value Bet** is defined as an event priced higher by the bookmaker than its actual probability. To calculate a valid mathematical edge:

1. **Calculate Implied Probability**:
   $$P_{\text{implied}} = \frac{1.0}{\text{Bookmaker Odds}}$$
2. **Retrieve Model Calibrated Probability** ($P_{\text{model}}$).
3. **Verify Positive Edge**:
   $$\text{Value Edge} = (\text{Bookmaker Odds} \times P_{\text{model}}) - 1.0 > 0.0$$

### 🚫 The Overround Margin (The "Juice")
Bookmakers incorporate a profit margin (overround) into their prices:
$$\sum P_{\text{implied}} > 1.0$$

The platform **MUST** remove this overround margin to extract the "Fair Odds" proxy before identifying positive value edge. Imposing an edge on odds with high overrounds without stripping margins is strictly forbidden.

---

## 💰 Fractional Kelly Bankroll Safety Regulations

To protect client capital, all calculated stakes are constrained using a **Fractional Kelly Criterion**:

$$f^* = \frac{b \cdot p - q}{b} \times C_{\text{fraction}}$$

*Where:*
- $b$: Decimal odds minus $1.0$ (net fractional odds).
- $p$: Calibrated probability of winning ($P_{\text{model}}$).
- $q$: Probability of losing ($1.0 - p$).
- $C_{\text{fraction}}$: Strict multiplier restricted to a range of $[0.1, 0.25]$ (default is $0.1$ for ultra-conservative capital growth).

### 🛡️ Strict Risk Constraints:
- **Max Single Allocation**: No single slip recommendation can exceed **5.0%** of the total portfolio bankroll under any circumstances.
- **Overlap Exposure adjustments**: If multiple matches kickoff simultaneously, individual Kelly fractions must be divided by the total number of simultaneous slips to prevent cumulative over-exposure.

---

## ⚖️ South Africa Bookmaker Regulatory Boundaries

- **Strict Read-Only Execution**: The software is strictly an analytics suite and must never automate the placement of bets on bookmaker sites. This is required to comply with regional South African bookmaker guidelines.
- **FICA Compliance Checkpoints**: Portfolio accounts require verified KYC validations if integrated with live ledger databases.
