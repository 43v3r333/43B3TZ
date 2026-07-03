# MVP Product Specification

## 1. MVP Scope Definition
The Minimum Viable Product (MVP) focuses on delivering the core forecasting and capital allocation loops for top-tier association football leagues.

## 2. Key Functional Pillars
1. **Live Odds Scraper Gateway**: Asynchronously ingest and parse match prices from Betway and Sportingbet.
2. **Predictive Model Inference**: Evaluate match probabilities using our pre-trained XGBoost league model.
3. **Kelly Sizer Engine**: Automatically calculate optimal trade stakes based on modeled value edge margins.
4. **Trader Ledger Dashboard**: Provide a responsive terminal interface to log trade slips, track bankroll, and monitor historical yields.
