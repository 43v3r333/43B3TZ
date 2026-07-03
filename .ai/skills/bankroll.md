# 💰 Bankroll Management & Sizing Systems

## 1. Purpose
To establish mathematical guidelines for bankroll allocation, risk mitigation, and Kelly Criterion calculations.

## 2. When to Use
- Determining optimal stake sizes for portfolio allocations or managing single-match risks.

## 3. When NOT to Use
- Writing raw database models or static UI layouts.

## 4. Architecture
Our bankroll management engine evaluates value edges and applies risk rules to calculate optimal, safe stakes:
```
[ Value Edge & Odds ] -> [ Kelly Criterion Formula ] -> [ Fractional Sizing Sizer ] -> [ Safe Stake ]
```

## 5. Step-by-Step Implementation
1. **Kelly Fraction**: Calculate the raw Kelly stake percentage using match odds and model probabilities.
2. **Fractional Scaling**: Scale raw stakes using a fractional coefficient (e.g., quarter-Kelly) to reduce portfolio volatility.
3. **Risk Clamping**: Clamp final stakes strictly below the system's maximum allocation limit (5.0%).

## 6. Repository Standards
- High-priority constraint: The absolute maximum stake allocation per match is capped strictly at 5.0% ($0.05$).
- The system must reject allocations when model probabilities indicate a negative value edge.

## 7. Examples

### Fractional Kelly Sizing with Strict Sizing Clamps
```python
def calculate_kelly_stake(
    decimal_odds: float,
    model_prob: float,
    risk_coeff: float = 0.25,  # Quarter-Kelly standard
    max_stake_pct: float = 0.05  # Strict platform cap (5%)
) -> float:
    """Calculates lookahead-safe, risk-clamped fractional Kelly stake allocations."""
    if decimal_odds <= 1.0:
        return 0.0
        
    # Standard Kelly formula: f = (b * p - q) / b where b = odds - 1, q = 1 - p
    b = decimal_odds - 1.0
    p = model_prob
    q = 1.0 - p
    
    raw_kelly = (b * p - q) / b
    
    # Reject allocation if no edge exists
    if raw_kelly <= 0.0:
        return 0.0
        
    # Apply fractional Kelly scaling to reduce volatility
    scaled_kelly = raw_kelly * risk_coeff
    
    # Clamp final stake to stay strictly below the maximum system limit (5%)
    final_stake = min(scaled_kelly, max_stake_pct)
    
    return float(final_stake)
```

## 8. Best Practices
- Default to conservative fractional settings (like quarter-Kelly or eighth-Kelly) to protect against model uncertainty.
- Audit bankroll drawdown rates regularly using historical transaction logs.

## 9. Anti-patterns
- **Full Kelly Allocations**: Using unscaled Kelly calculations, which exposes the portfolio to severe drawdown risk.

## 10. Security Considerations
- Guard bankroll calculations; verify input variables cannot be manipulated to generate oversized stakes.

## 11. Performance Considerations
- Perform Kelly allocations in-memory during real-time betting cycles to minimize latency.

## 12. Testing Strategy
- Write parameterized unit tests verifying that stakes are correctly clamped below 5.0% even with extreme inputs.

## 13. Review Checklist
- [ ] Is the final allocation capped strictly below the 5.0% platform limit?
- [ ] Are negative edges handled correctly, returning an allocation of 0.0%?

## 14. Common Mistakes
- Miscalculating the decimal odds base variable, leading to incorrect Kelly stakes and excessive risk exposure.

## 15. Future Improvements
- Integrate correlated portfolio risk models to adjust stakes when betting on multiple matches in the same league.

## 16. Revision History
- **v1.0.0**: Standardized risk-clamped bankroll allocation formulas.

## 17. Related References
- Skills: [Value Betting](value-betting.md), [Statistics](statistics.md)
