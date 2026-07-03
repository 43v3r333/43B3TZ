# 🌐 API Gateway Endpoint & Integration History

## 📋 Governance & Control Metadata
- **Purpose**: Design history and contract registry of the FastAPI API endpoints.
- **Update Policy**: Document new routes, schema updates, or breaking changes.
- **Owner**: API Gateway Lead
- **Review Frequency**: Monthly
- **Cross References**: [Decisions](decisions.md), [Security History](security-history.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Production contract specification alignment.

---

## 🗺️ Current API Layout (`v1`)

All API endpoints are versioned with the `/api/v1` prefix.

### ⚽ Matches
- `GET /api/v1/matches` - Retrieve soccer match listings with optional league filtering.
- `GET /api/v1/matches/{match_id}` - Retrieve detailed match data including raw odds.

### 🧠 Predictions & Analytics
- `GET /api/v1/predictions/active` - Retrieve predictions with model edge calculations.
- `POST /api/v1/predictions/calibrate` - Force recalculation of model Platt calibrations.

### 💰 Portfolios
- `GET /api/v1/portfolios/history` - Time-series portfolio balance datasets.
- `POST /api/v1/portfolios/bet` - Execute a simulated bet log.

---

## 📝 API Modification Audit Log

### June 15, 2026: Standardized JSON Error Specifications
- **Change**: Standardized all validation failures to match RFC-7807 problem details.
- **Impact**: Frontend error cards render descriptive validation error logs cleanly.

### June 22, 2026: Upgraded Websocket Payload Serialization
- **Change**: Upgraded JSON payload encoders to use Orjson.
- **Performance Gain**: Reduced JSON serialization CPU latency by 65%.
