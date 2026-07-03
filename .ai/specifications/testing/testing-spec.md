# Complete Testing and Quality Specifications

## 1. Unit Testing Strategy
- **Framework**: Pytest for Backend, Vitest for Frontend.
- **Coverage Gate**: 100% of sizer engines and Kelly calculations must be covered, with overall module coverage > 80%.

## 2. Integration & End-to-End Gates
Playwright verifies core user stories:
1. User logs in.
2. Value bet alerts are streamed via mock WebSocket gateway.
3. User selects recommended trade and logs slip.
4. Capital values adjust correctly on the trader ledger.
