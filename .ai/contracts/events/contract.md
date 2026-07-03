# Events Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates event structures, topic naming standards, trace propagation, and message delivery contracts across asynchronous workers.
* **Version**: `v1.0.0`
* **Owner**: `Lead Integration Engineer`
* **Compatibility Policy**: Consumers must ignore unlisted fields in event payloads to maintain forward compatibility. Redundant fields will be marked deprecated but remain in payloads for 2 minor versions.
* **Breaking-Change Policy**: Changing field names or deleting required properties triggers a major event schema version increment.
* **Migration Strategy**: Parallel event publishing (dual dispatch) or multi-schema consumers during version transitions.

---

## 2. Event Payload Schema Specifications

### 2.1 Schema: Fixture Created Event (`fixtures.event.created`)
Dispatched when a new match is registered in the system.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "FixtureCreatedEvent",
  "type": "object",
  "required": ["event_id", "event_type", "timestamp", "correlation_id", "payload"],
  "properties": {
    "event_id": { "type": "string", "format": "uuid" },
    "event_type": { "type": "string", "const": "fixtures.event.created" },
    "timestamp": { "type": "string", "format": "date-time" },
    "correlation_id": { "type": "string", "format": "uuid" },
    "payload": {
      "type": "object",
      "required": ["fixture_id", "league", "home_team", "away_team", "kickoff"],
      "properties": {
        "fixture_id": { "type": "string", "format": "uuid" },
        "league": { "type": "string" },
        "home_team": { "type": "string" },
        "away_team": { "type": "string" },
        "kickoff": { "type": "string", "format": "date-time" }
      }
    }
  }
}
```

---

## 3. Validation Rules
1. **Header Metadata**: All dispatched events must include standard headers: `event_id`, `event_type`, `timestamp`, and `correlation_id` to ensure tracing integrity.
2. **Naming Standard**: Event topics must follow the lowercase dot notation structure: `<domain>.<entity>.<action>`.
3. **Trace Propagation**: Trace context fields must be copied explicitly from incoming API headers into event metadata wrappers.

---

## 4. Examples

### Event Payload Example (`odds.event.updated`)
```json
{
  "event_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "event_type": "odds.event.updated",
  "timestamp": "2026-06-30T05:01:00Z",
  "correlation_id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "payload": {
    "fixture_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    "bookmaker": "Betway",
    "odds": {
      "home_win": 2.15,
      "draw": 3.20,
      "away_win": 3.40
    }
  }
}
```
