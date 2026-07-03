# Value Betting Module Specification

## 1. Purpose
Identifies value discrepancies between market odds prices and calibrated model probabilities.

## 2. Business Logic
A "Value Bet" is defined when Expected Value ($EV$) is positive:
$$ EV = P(\\text{Win}) \\times \\text{Odds} - 1 > 0 $$

Where:
- $P(\\text{Win})$: Calibrated model probability.
- $\\text{Odds}$: Bookmaker market odds price.

## 3. Sequence Flow
\`\`\`mermaid
sequenceDiagram
    Odds Engine->>Value Engine: Publish odds_update Event
    Value Engine->>DB: Fetch Calibrated Predictions
    Value Engine->>Value Engine: Calculate Expected Value (EV)
    alt EV > 0
        Value Engine->>Sizer Engine: Enqueue for Sizing
    end
\`\`\`
