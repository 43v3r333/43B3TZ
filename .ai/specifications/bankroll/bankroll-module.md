# Bankroll Module Specification

## 1. Purpose
Determines optimal wagering allocations using the fractional Kelly criterion.

## 2. Sizing Formula
The classic Kelly stake percentage $f^*$ is calculated as:
$$ f^* = \\frac{b \\times p - q}{b} = \\frac{p \\times (\\text{Odds} - 1) - (1 - p)}{\\text{Odds} - 1} = p - \\frac{1 - p}{\\text{Odds} - 1} $$

Where:
- $p$: Calibrated model probability of outcome win.
- $q$: Calibrated model probability of outcome loss ($1 - p$).
- $b$: Decimal odds price minus 1 (net odds).

To manage risk, the system enforces a strict fractional multiplier:
$$ \\text{Stake} = \\text{Bankroll} \\times f^* \\times \\text{Multiplier} $$
