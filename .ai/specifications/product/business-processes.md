# Business Processes Specification

## 1. Odds Discovery to Alert Loop
\`\`\`mermaid
graph TD
    Scraper[Asynchronous Scraper] -->|Fetch Odds| Parser[Odds Parser]
    Parser -->|Log Timeseries| Timescale[(TimescaleDB)]
    Parser -->|Trigger Model| ML[ML Inference Worker]
    ML -->|Calibrate Probability| Sizer[Kelly Sizer Engine]
    Sizer -->|Edge Discovered| Notify[Notification Dispatcher]
    Notify -->|WSS Publish| UI[React Command Desk]
    Notify -->|Telegram Ingress| Bot[Telegram Bot Channel]
\`\`\`

## 2. Match Settlement Process
1. Match finishes -> API Ingress fetches official scorelines from API-Football.
2. Settle Worker marks active trader slips as "Won" or "Lost".
3. Bankroll Engine recalculates overall yield, ROI, and Brier calibration scores.
