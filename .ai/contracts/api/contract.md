# API Subsystem Contract

## 1. Metadata
* **Purpose**: Defines standard REST and WebSocket interaction patterns, query limits, payloads, and error codes for high-speed value betting exchanges.
* **Version**: `v1.0.0`
* **Owner**: `API Architect` & `Chief Software Architect`
* **Compatibility Policy**: Minor version increments (`v1.x.y`) must be strictly backward-compatible. Major version updates (`v2.0.0`) are reserved for breaking changes.
* **Breaking-Change Policy**: Deprecation notices must be announced 90 days before route termination. Deprecated endpoints will return a `Warning` header in response.
* **Migration Strategy**: Blue-green routing with version prefixes (e.g., `/api/v1/` and `/api/v2/` active concurrently) to ensure zero-downtime client transitions.

---

## 2. API Contract Schema

### 2.1 REST Ingress: Fetch Fixtures (`GET /api/v1/fixtures`)
Fetches scheduled matches matching filters with query constraints.

#### Request Parameters
```json
{
  "query_params": {
    "league": { "type": "string", "required": false, "description": "Filter by league name" },
    "status": { "type": "string", "enum": ["scheduled", "in_play", "finished"], "default": "scheduled" },
    "limit": { "type": "integer", "maximum": 100, "default": 20 },
    "offset": { "type": "integer", "default": 0 }
  }
}
```

#### Response Payload Schema (HTTP 200 OK)
```json
{
  "type": "object",
  "required": ["count", "results"],
  "properties": {
    "count": { "type": "integer" },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["fixture_id", "league", "home_team", "away_team", "kickoff", "status"],
        "properties": {
          "fixture_id": { "type": "string", "format": "uuid" },
          "league": { "type": "string" },
          "home_team": { "type": "string" },
          "away_team": { "type": "string" },
          "kickoff": { "type": "string", "format": "date-time" },
          "status": { "type": "string" }
        }
      }
    }
  }
}
```

### 2.2 WebSocket Streaming Ingress: Live Odds Feed (`WSS /api/v1/odds/stream`)
Real-time bi-directional streaming of pricing updates.

#### Client Subscription Message Schema
```json
{
  "action": "subscribe",
  "topic": "odds:fixtures",
  "fixture_ids": ["f5b3a4c1-2290-4a7a-9cb8-a5b81a293c6f"]
}
```

#### Server Broadcast Message Schema
```json
{
  "event": "odds_update",
  "timestamp": "2026-06-30T05:01:00Z",
  "payload": {
    "fixture_id": "f5b3a4c1-2290-4a7a-9cb8-a5b81a293c6f",
    "bookmaker": "Betway",
    "odds": {
      "home_win": 2.15,
      "draw": 3.20,
      "away_win": 3.40
    }
  }
}
```

---

## 3. Validation Rules
1. **Pydantic Model Constraints**: All incoming request payloads must be parsed and validated against strict Pydantic base models.
2. **Numeric Limits**: Max items returned per request is strictly restricted to 100 to prevent database resource exhaustion.
3. **UUID Enforcement**: All database-linked identifiers must be UUIDv4 format.

---

## 4. Examples

### Client GET Request Example
```http
GET /api/v1/fixtures?league=SA%20Premier%20Division&limit=1 HTTP/1.1
Host: api.platform.internal
Accept: application/json
```

### Server Response Example
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999

{
  "count": 1,
  "results": [
    {
      "fixture_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
      "league": "SA Premier Division",
      "home_team": "Kaizer Chiefs",
      "away_team": "Orlando Pirates",
      "kickoff": "2026-07-04T15:00:00Z",
      "status": "scheduled"
    }
  ]
}
```
