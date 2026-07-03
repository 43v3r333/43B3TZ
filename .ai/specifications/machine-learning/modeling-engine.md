# ML Modeling Engine: Mathematical Specifications

## 1. Poisson Modeling Engine
The expected goals are generated using a bivariate Poisson scoreline distribution adjusting for home advantage:
$$ P(X=x, Y=y) = e^{-(\\lambda_1 + \\lambda_2 + \\lambda_3)} \\frac{\\lambda_1^x}{x!} \\frac{\\lambda_2^y}{y!} \\sum_{k=0}^{\\min(x,y)} \\binom{x}{k} \\binom{y}{k} k! \\left( \\frac{\\lambda_3}{\\lambda_1 \\lambda_2} \\right)^k $$

Where:
- $\\lambda_1$: Expected home goals ($h \\times a_{def}$).
- $\\lambda_2$: Expected away goals ($a \\times h_{def}$).
- $\\lambda_3$: Covariance adjusting for low scoring soccer match dynamics.

## 2. ELO Rating Engine
Team rating adjustments are calculated after every settled fixture:
$$ R_{\\text{new}} = R_{\\text{old}} + K \\times (S_i - E_i) $$

Where:
- $S_i$: Actual match outcome (1.0 for win, 0.5 for draw, 0.0 for loss).
- $E_i$: Expected outcome probability based on rating differences.
- $K$: Weight coefficient (set dynamically at 32).
