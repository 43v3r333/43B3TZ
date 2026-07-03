# 💰 Mathematics of Value Betting & Edge Calculations

Detailed documentation on the mathematical formulas, overround removals, and valuation algorithms used by our platform.

---

## 🔢 Overround Strip Formulas

Bookmakers build margins into their odds:
$$\sum P_{\text{implied}} > 1.0$$

The platform removes these margins to estimate "Fair Odds" proxies using the Multiplicative Margin Model:

$$P_{\text{fair}, i} = \frac{P_{\text{implied}, i}}{\sum_{j=1}^k P_{\text{implied}, j}}$$

---

## 💰 Expected Value (EV) Edge Calculations

Once we compute the fair probability proxy ($p$), we evaluate bookmaker decimal odds ($O$):

$$\text{Expected Value (EV)} = (O \times p) - 1.0$$

### 🛡️ Risk-Edge Constraints
A bet is logged as a **Value Bet** only when:
- Implied overround margins are successfully removed.
- Calculated mathematical edge exceeds $+2.5\%$ ($\text{EV} > 0.025$).
- Match data quality meets completeness criteria.
