# Simulation & Monte Carlo Engine Specification

## 1. Purpose
Executes statistical match simulations to stress test capital allocations and project long-term yield bounds.

## 2. Monte Carlo Execution Loop
The engine executes 100,000 parallel trials for match scorelines based on bivariate Poisson expectations.

\`\`\`mermaid
graph TD
    Init[Load Match Covariance] -->|Generate Trials| Loop[Loop 100,000 Trials]
    Loop -->|Bivariate Poisson Score| Calc[Record Home/Draw/Away outcomes]
    Calc -->|Compile Stats| Bounds[Calculate 95% Confidence Interval]
\`\`\`

## 3. Stress Testing Metrics
- **Expected Max Drawdown**: Simulate fractional Kelly stake histories to identify probability of 20%, 30%, and 50% capital losses over a 1,000-trade season.
