# ⚽ Sports Analytics Prediction Models

## 1. Purpose
To outline statistical patterns, probability structures, and forecasting models for soccer match predictions.

## 2. When to Use
- Implementing Poisson processes, ELO rating updates, or Monte Carlo goal simulation models.

## 3. When NOT to Use
- Writing static database schemas or standard layout configurations.

## 4. Architecture
Our prediction pipeline calculates team offensive and defensive strengths, converting ratings to outcome probabilities:
```
[ Team Strengths (ELO) ] -> [ Bivariate Poisson Engine ] -> [ Score Distributions ] -> [ Clean Probabilities ]
```

## 5. Step-by-Step Implementation
1. **Calculate Team ELO**: Update team performance ratings using historical goal differences and rest factors.
2. **Apply Poisson Models**: Model goal distributions for both teams using independent or bivariate Poisson calculations.
3. **Simulate Outcomes**: Run Monte Carlo iterations or evaluate probability distributions to get Home-Draw-Away percentages.

## 6. Repository Standards
- Ensure all predicted probability vectors sum strictly to 1.0.
- All models must support out-of-sample log-loss evaluation checks.

## 7. Examples

### Poisson soccer Goal Distribution Model
```python
import numpy as np
from scipy.stats import poisson
from typing import Dict, Tuple

def predict_match_probabilities(
    home_attack: float, 
    home_defense: float, 
    away_attack: float, 
    away_defense: float,
    max_goals: int = 10
) -> Tuple[float, float, float]:
    """Calculates Home-Draw-Away probabilities using independent Poisson goal distributions."""
    
    # Calculate lambda parameters (expected goals) for home and away teams
    lambda_home = home_attack * away_defense
    lambda_away = away_attack * home_defense
    
    # Generate probability matrices
    goals_home = [poisson.pmf(i, lambda_home) for i in range(max_goals)]
    goals_away = [poisson.pmf(i, lambda_away) for i in range(max_goals)]
    
    prob_matrix = np.outer(goals_home, goals_away)
    
    # Sum matrix regions to compute match outcome probabilities
    prob_home_win = float(np.sum(np.triu(prob_matrix, k=1)))
    prob_draw = float(np.sum(np.diag(prob_matrix)))
    prob_away_win = float(np.sum(np.tril(prob_matrix, k=-1)))
    
    # Re-normalize to ensure sum is exactly 1.0 (Home + Draw + Away)
    total = prob_home_win + prob_draw + prob_away_win
    return prob_home_win / total, prob_draw / total, prob_away_win / total
```

## 8. Best Practices
- Model expected goals (xG) instead of raw actual goals scored to reduce variance in team ratings.
- Adjust Poisson models for low-scoring matches to handle the typical correlation in 0-0 and 1-1 scorelines.

## 9. Anti-patterns
- **Linear Regression on Scores**: Using standard linear models to predict goal scores, which ignores the count-based nature of goals.

## 10. Security Considerations
- Enforce strict parameter validation; team strength parameters must always remain positive.

## 11. Performance Considerations
- Pre-calculate expected goal matrices using vectorized matrix multipliers instead of nested loops.

## 12. Testing Strategy
- Assert that model outputs match expected outputs on equal baseline conditions (should return symmetric Home/Away win rates).

## 13. Review Checklist
- [ ] Do predicted probabilities sum to exactly 1.0?
- [ ] Are Poisson lambda parameters strictly greater than 0.0?

## 14. Common Mistakes
- Forgetting to normalize simulated probability vectors, leading to mathematical inconsistencies downstream.

## 15. Future Improvements
- Implement player-level rating maps to capture performance changes when key players are rested or injured.

## 16. Revision History
- **v1.0.0**: Defined soccer prediction model guidelines.

## 17. Related References
- Skills: [Feature Engineering](feature-engineering.md), [Statistics](statistics.md)
