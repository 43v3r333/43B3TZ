# 📊 Statistical Mathematics & Analytics

## 1. Purpose
To define the core standards for statistical analysis, regression modeling, and probability calibrations.

## 2. When to Use
- Evaluating confidence bounds, training Bayesian updates, or assessing model performance metrics.

## 3. When NOT to Use
- Writing basic system logs or standard API route setups.

## 4. Architecture
Our statistics library provides verified, highly stable mathematical functions to upstream predictors:
```
[ Raw Models Outputs ] -> [ Platt Scaling / Isotonic ] -> [ Calibrated Probabilities ] -> [ Sizer ]
```

## 5. Step-by-Step Implementation
1. **Process Inputs**: Format incoming prediction arrays.
2. **Apply Calibration**: Run Platt Scaling (logistic curves) to correct model over/under-confidence.
3. **Compute Metrics**: Calculate log-loss and Brier scores to track probability calibration.

## 6. Repository Standards
- Mathematical calculations must utilize double-precision floating-point numbers.
- Avoid external API calls inside math functions to keep operations fast.

## 7. Examples

### Calculation of Log-Loss and Brier Score
```python
import numpy as np
from typing import List

def calculate_log_loss(y_true: List[int], y_prob: List[float]) -> float:
    """Computes lookahead-free out-of-sample log-loss for prediction evaluation."""
    y_t = np.array(y_true)
    y_p = np.clip(np.array(y_prob), 1e-15, 1 - 1e-15)  # Avoid log(0)
    return -float(np.mean(y_t * np.log(y_p) + (1 - y_t) * np.log(1 - y_p)))

def calculate_brier_score(y_true: List[int], y_prob: List[float]) -> float:
    """Computes Brier score to evaluate the calibration of predicted probabilities."""
    return float(np.mean((np.array(y_true) - np.array(y_prob)) ** 2))
```

## 8. Best Practices
- Always apply numerical clipping limits to prevent infinite log calculations on 0.0 or 1.0 probabilities.
- Use out-of-sample datasets to evaluate all performance metrics.

## 9. Anti-patterns
- **Evaluation on Training Sets**: Scoring model accuracy metrics on training data, which masks model overfitting.

## 10. Security Considerations
- Limit input boundaries; validate that probabilities fall strictly within the [0, 1] range.

## 11. Performance Considerations
- Use vectorized numpy operations to calculate metrics on large datasets efficiently.

## 12. Testing Strategy
- Write unit tests confirming that perfect predictions return a log-loss score of exactly 0.0.

## 13. Review Checklist
- [ ] Are logs guarded against `log(0)` errors using explicit clipping limits?
- [ ] Are Brier score outputs mathematically bounded between 0.0 and 1.0?

## 14. Common Mistakes
- Omitting epsilon clipping parameters, which causes runtime errors when log calculations encounter 0 or 1.

## 15. Future Improvements
- Integrate Bayesian probability updates to adjust team ratings in real time as match events unfold.

## 16. Revision History
- **v1.0.0**: Established standard mathematical evaluation metrics.

## 17. Related References
- Skills: [Sports Prediction](sports-prediction.md), [Value Betting](value-betting.md)
