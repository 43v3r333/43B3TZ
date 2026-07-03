# 📈 Value Betting Strategy & Edge Calculations

## 1. Purpose
To establish core standards for identifying value opportunities by comparing model probabilities against bookmaker odds.

## 2. When to Use
- Implementing real-time odds comparison pipelines, finding mathematical edges, or building betting slip generators.

## 3. When NOT to Use
- Writing background scraping rules or visual UI components.

## 4. Architecture
Our value betting finder filters bookmaker overrounds and highlights profitable opportunities:
```
[ Live Bookmaker Odds ] -> [ Overround Removal Engine ] -> [ Edge Comparator ] -> [ Value List ]
```

## 5. Step-by-Step Implementation
1. **Remove Overround**: Calculate fair probabilities from raw bookmaker odds using margin removal models (e.g., multiplicative, shin).
2. **Calculate Edge**: Compare model probabilities with bookmaker decimal odds to identify value edges.
3. **Filter Opportunities**: Filter list to highlight matches with positive, mathematically profitable value edges.

## 6. Repository Standards
- The calculated value edge must be strictly positive ($Edge > 0.0$) to qualify as a value bet.
- Maintain full audit trails of historical bookmaker odds and model probabilities for backtesting.

## 7. Examples

### Margin Removal and Value Edge Calculation
```python
from typing import Dict, Tuple

def calculate_value_edge(
    odds_home: float,
    odds_draw: float,
    odds_away: float,
    model_prob_home: float
) -> Tuple[float, float]:
    """Calculates margin-removed fair odds and the resulting value betting edge."""
    # Compute the bookmaker overround (margin)
    overround = (1.0 / odds_home) + (1.0 / odds_draw) + (1.0 / odds_away)
    
    # Calculate fair odds by removing the margin proportionally
    fair_odds_home = odds_home * overround
    
    # Compare model probability to bookmaker odds to find the value edge
    # Formula: Edge = (Bookmaker Odds * Model Probability) - 1.0
    edge_home = (odds_home * model_prob_home) - 1.0
    
    return fair_odds_home, edge_home
```

## 8. Best Practices
- Apply margin removal models (like Shin or Power methods) on high-margin soccer betting lines.
- Filter out matches with extremely high overrounds (e.g. overround > 1.15) to avoid highly inefficient markets.

## 9. Anti-patterns
- **Ignoring Margin**: Comparing model probabilities directly to raw bookmaker odds without accounting for overround margins.

## 10. Security Considerations
- Validate odds values; decimal odds must be strictly greater than 1.0.

## 11. Performance Considerations
- Run odds comparisons in-memory to keep execution fast during high-frequency live events.

## 12. Testing Strategy
- Assert that under equal conditions (fair odds match model probabilities), the calculated value edge is exactly 0.0.

## 13. Review Checklist
- [ ] Are input decimal odds strictly greater than 1.0?
- [ ] Is the overround calculation verified before computing edges?

## 14. Common Mistakes
- Misinterpreting bookmaker margins, leading to incorrect calculations and artificial value signals.

## 15. Future Improvements
- Model odds movement speeds to predict and capture value opportunities before bookmakers adjust their lines.

## 16. Revision History
- **v1.0.0**: Standardized margin removal and value edge calculations.

## 17. Related References
- Skills: [Bankroll Management](bankroll.md), [Statistics](statistics.md)
- Rules: [Database Rules](../rules/database-rules.md)
