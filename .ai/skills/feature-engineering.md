# 📊 Sports Analytics Feature Engineering

## 1. Purpose
To outline standards for generating sports predictive attributes, maintaining mathematical correctness, and eliminating lookahead bias.

## 2. When to Use
- Designing database models or generating inputs for match winner prediction algorithms.

## 3. When NOT to Use
- Writing static client-side form styling rules.

## 4. Architecture
Our feature store takes raw timeseries records and calculates rolling mathematical attributes:
```
[ Raw Database Records ] -> [ Chronological Aggregation ] -> [ Rolling Feature Vector ] -> [ ML Input ]
```

## 5. Step-by-Step Implementation
1. **Sort Records**: Order all source records chronologically by timestamp.
2. **Apply Windows**: Compute rolling metrics using past data windows (e.g. past 5 matches).
3. **Validate Boundary**: Ensure variables are only computed using matches completed before the target date.

## 6. Repository Standards
- All rolling timeseries feature functions must pass lookahead testing checks.
- Store calculations as clean, indexed databases.

## 7. Examples

### Lookahead-Safe Rolling Expected Goals (xG) Calculation
```python
import pandas as pd
import numpy as np

def compute_safe_rolling_xg(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Computes lookahead-safe rolling averages for team expected goals (xG)."""
    # Sort chronologically by date to preserve temporal order
    df = df.sort_values("match_date").reset_index(drop=True)
    
    # Calculate rolling metrics using completed matches only (shift to avoid lookahead)
    df["home_rolling_xg"] = (
        df.groupby("home_team")["home_xg"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
    )
    df["away_rolling_xg"] = (
        df.groupby("away_team")["away_xg"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
    )
    
    # Handle missing values for teams with no prior match history
    df["home_rolling_xg"] = df["home_rolling_xg"].fillna(1.0)
    df["away_rolling_xg"] = df["away_rolling_xg"].fillna(1.0)
    
    return df
```

## 8. Best Practices
- Shift rolling calculations by 1 step to ensure match results are not leaked into their own prediction inputs.
- Keep rolling windows configurable inside system configuration settings.

## 9. Anti-patterns
- **Lookahead Leakage**: Using rolling operations without a shift, which leaks current-game results into current-game predictions.

## 10. Security Considerations
- Sanitize inputs to feature stores, ensuring malicious users cannot alter historical match records.

## 11. Performance Considerations
- Use vector operations inside pandas or numpy to optimize rolling timeseries computations.

## 12. Testing Strategy
- Write unit tests confirming that current match performance has zero impact on past features.

## 13. Review Checklist
- [ ] Are all rolling window operations shifted to prevent lookahead bias?
- [ ] Are missing values handled cleanly for teams with no prior history?

## 14. Common Mistakes
- Computing rolling statistics across mixed home/away contexts without grouping by specific team columns.

## 15. Future Improvements
- Integrate event-stream parsing to capture live match-day team performance changes.

## 16. Revision History
- **v1.0.0**: Outlined safe sports feature engineering standards.

## 17. Related References
- Skills: [Sports Prediction](sports-prediction.md), [Statistics](statistics.md)
- Rules: [ML Rules](../rules/ml-rules.md)
