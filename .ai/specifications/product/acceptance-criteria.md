# Acceptance Criteria Specification

## AC-101: Value Edge Sizing Accuracy
- **Criterion**: The Kelly Sizer calculation must perfectly apply the fractional Kelly formula with a configurable multiplier (e.g., 0.25 for quarter Kelly).
- **Metric Check**: Calculated stakes must match verified spreadsheet matrices with a margin of error < 0.0001%.

## AC-102: Notification Speed Boundaries
- **Criterion**: High-speed value bet alerts must route through Redis Pub/Sub, format templates, and hit external gateways (Telegram Bot) in under 200ms from the instant of discovery.
