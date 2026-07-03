# Notifications Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates notification payloads, templates, delivery speed SLA bounds, retry logic, and throttling across SMS, email, and Telegram bots.
* **Version**: `v1.0.0`
* **Owner**: `Notification Engineer`
* **Compatibility Policy**: Additional fields can be appended to notification contexts. Message templates must have fallback parameters for undefined fields.
* **Breaking-Change Policy**: Changing template variable names or removing support for channel-specific attributes triggers a major version increment.
* **Migration Strategy**: Blue-green routing for delivery queues to allow concurrent dispatch testing during upgrades.

---

## 2. Notification Ingestion Specifications

### 2.1 Schema: Ingest Alert Event (`notification.alert.dispatch`)
Fires when an alerting pipeline triggers a notification event.

```json
{
  "type": "object",
  "required": ["notification_id", "channels", "recipient_topic", "title", "body"],
  "properties": {
    "notification_id": { "type": "string", "format": "uuid" },
    "channels": {
      "type": "array",
      "items": { "type": "string", "enum": ["websocket", "telegram", "sms", "email"] }
    },
    "recipient_topic": { "type": "string" },
    "title": { "type": "string" },
    "body": { "type": "string" },
    "template_context": {
      "type": "object",
      "properties": {
        "fixture_id": { "type": "string", "format": "uuid" },
        "odds": { "type": "number" },
        "kelly_percentage": { "type": "number" }
      }
    }
  }
}
```

---

## 3. Validation Rules
1. **Latency SLA**: Notifications must dispatch and arrive at gateway buffers within `200ms` of the initial value bet discovery timestamp.
2. **Throttling Policy**: Alerts for overlapping value bet fluctuations targeting the same fixture must be throttled to a maximum of 1 alert per 5 minutes.
3. **Queue Isolation**: Low-priority email digest delivery must run on separate queues to prevent blocking high-priority live Telegram alerts.

---

## 4. Examples

### Raw Telegram Bot API Message payload
```json
{
  "chat_id": "@platform_live_value_bets",
  "text": "🚨 *VALUE BET ALERT*\n⚽ League: SA Premier Division\n🆚 Kaizer Chiefs vs Orlando Pirates\n📈 Price: 2.45 (Betway SA)\n📊 Edge: +12.5%\n💰 Recommended Stake: 1.5% Kelly\n[Trade Now](https://platform.internal/trade/8b9c0d1e)",
  "parse_mode": "MarkdownV2"
}
```
