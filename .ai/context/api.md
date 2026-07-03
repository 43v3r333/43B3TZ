# 🔌 Unified API Specification & REST Guidelines

The platform exposes an asynchronous JSON REST and WebSocket gateway under versioned paths (`/api/v1`).

---

## 🛠️ API Rules & Response Envelope

All API endpoints must return a standardized JSON envelope to simplify client-side integration:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-06-28T22:42:35Z",
    "trace_id": "ab99-1223-aff6"
  }
}
```

In the event of a failure, the server must return appropriate HTTP status codes ($400$ for bad requests, $401$ for unauthorized, $422$ for validation issues) with a structured error body:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'odds' must be greater than 1.0",
    "details": ["odds must be in range [1.01, 100.0]"]
  },
  "meta": {
    "timestamp": "2026-06-28T22:42:35Z",
    "trace_id": "ab99-1223-aff6"
  }
}
```

---

## 📂 Core Endpoints Index

### 1. Matches & Calendar
- `GET /api/v1/matches`: List upcoming scheduled match-events, supporting pagination, filtering by tournament, and status lookups.
- `GET /api/v1/matches/{id}/odds`: Fetch historical and live bookmaker prices for a specific match.

### 2. Model Predictions
- `GET /api/v1/predictions`: List calibrated model outcomes.
- `GET /api/v1/predictions/{match_id}`: Fetch detailed prediction vectors and feature importance coefficients for a specific event.

### 3. Portfolio & Transactions
- `POST /api/v1/portfolio/slips`: Log a new value bet entry.
- `GET /api/v1/portfolio/metrics`: Expose overall capital performance: cumulative ROI, win rates, and maximum drawdowns.

---

## 🚀 Rate Limiting, CORS & Idempotency

- **Rate Limiting**: Enforces rate limiting on all endpoints using a Redis token-bucket middleware ($60$ requests per minute per IP). Exceeding this rate returns a `429 Too Many Requests` response.
- **Idempotent Write Requests**: Requests to update slips or log stakes must include an `Idempotency-Key` header to prevent double-submitting stakes during network hiccups.
- **CORS Profile**: Permitted origins are strictly locked to production subdomains inside the API configuration layers.
