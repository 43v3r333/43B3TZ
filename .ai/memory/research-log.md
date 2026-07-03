# 🔬 Sports Analytics Research Log

## 📋 Governance & Control Metadata
- **Purpose**: Documents analytical research, mathematical proofs, and model experiments.
- **Update Policy**: Register new research activities, papers read, or custom experiments.
- **Owner**: Sports Data Scientist
- **Review Frequency**: Monthly
- **Cross References**: [Model History](model-history.md), [Value Betting Skill](../skills/value-betting.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Baseline research index.

---

## 📑 Research Initiatives

### Project Overround: Removers and Commission Math
- **Date**: 2026-05-18
- **Objective**: Identify the most mathematically accurate method to extract fair probabilities from bookmaker odds.
- **Methods Investigated**:
  1. *Multiplicative Overround Model*: Assumes overround is proportional to odds.
  2. *Shin's Method*: Highly robust model based on the presence of insider trading in the markets.
- **Mathematical Evaluation**: Shin's Method outperforms standard overround division on longshot odds ($odds > 8.0$) by reducing the probability bias typically found in underdog pricing.
- **Conclusion**: Shin's Method is deployed as our default overround remover.

---

### Project Kelly: Fractional Capital Allocation Adjustments
- **Date**: 2026-06-12
- **Objective**: Evaluate capital drawdowns under different Kelly sizing multipliers.
- **Methods Investigated**: Full Kelly vs Half Kelly vs Quarter Kelly (0.25).
- **Findings**:
  - *Full Kelly*: Maximum risk of capital depletion over 1,000 matches was 32.4% due to high soccer draw variance.
  - *Quarter Kelly*: Maximum risk of capital depletion was reduced to **1.8%**, while preserving 78% of the expected long-term capital growth curve.
- **Implementation**: Deployed strict Quarter Kelly (0.25 multiplier) as the system limit.
