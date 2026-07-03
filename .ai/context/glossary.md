# 📖 Technical & Domain Glossary

Comprehensive definitions, context details, and practical examples of core terms within our sports analytics platform.

---

## ⚽ Betting & Quantitative Finance Terms

### 📈 Value Bet
An event priced higher by the bookmaker than its actual probability.
- *Mathematical Formula*:
  $$\text{Value Edge} = (\text{Bookmaker Odds} \times P_{\text{model}}) - 1.0 > 0.0$$
- *Example*: Odds = 2.5, Probability = 45% (0.45). Edge = (2.5 * 0.45) - 1.0 = +12.5%. This is a strong value bet.

### 💰 Kelly Criterion
A mathematical formula used to determine the optimal size of a series of bets to maximize logarithmic wealth growth.
- *Mathematical Formula*:
  $$f^* = \frac{p \cdot b - q}{b}$$
- *Where*: $p$ is the true winning probability, $b$ is the net odds (decimal odds - 1), and $q$ is the probability of losing ($1 - p$).

### 🚫 Overround
The profit margin built into a bookmaker's prices.
- *Example*: A 3-way soccer market with odds of 2.0 (Home), 3.0 (Draw), and 3.5 (Away) has an implied probability sum of:
  $$\frac{1}{2.0} + \frac{1}{3.0} + \frac{1}{3.5} = 0.50 + 0.333 + 0.285 = 1.118 \implies 11.8\% \text{ Overround}$$

---

## 🧠 Machine Learning & Data Terms

### 📊 Expected Goals (xG)
A metric assessing the quality of a goalscoring opportunity based on parameters like shot distance, angle, and defender pressure.
- *Example*: A shot from the penalty spot typically holds an xG of 0.76 (76% historical conversion rate).

### 🎯 Platt Scaling
A method for transforming the outputs of classification models into calibrated probability distributions.
- *Why it matters*: Ensures that if a LightGBM model estimates a home win probability of 60%, home teams win exactly 60% of those matches historically.

### 🧬 Lookahead Bias
A common mistake where future, unavailable information is used during feature engineering, resulting in over-optimistic model performance.
- *Prevention*: Enforce strict chronological time splits in the database when training.
