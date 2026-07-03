# 🦾 Enterprise Architecture: Event-Driven Architecture Reference

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: bounded-contexts, module-interactions, dependency-graph
- **Revision History**:
- `v1.0.0` (2026-06-29): Initial baseline Event-Driven specification.

---

## 🎯 1. Purpose & Objectives
Exposes how the platform uses asynchronous messages and event-driven architectures to maintain decoupling.

---

## 🔍 2. Scope & Applicability
Standard guide for developers designing pub-sub and worker workflows.

---

## 🏢 3. Structural Responsibilities
- **Responsibility**: Maintain transactional boundaries using clean asynchronous message channels.
- **Responsibility**: Specify standard event schemas and ensure structural payloads validation.
- **Responsibility**: Manage dead-letter queue structures to protect messages from loss.

---

## 🎨 4. Core Design Principles
- **Design Principle**: Producer Decoupling: Producers emit events without knowing which consumers will handle them.
- **Design Principle**: At-Least-Once Delivery: Enforce acknowledgement rules to ensure zero events are lost.

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
- **Architectural Decision**: Use Redis Stream structures and Celery workers as the core event distribution engine.
- **Architectural Decision**: Validate all event payloads using strict Pydantic schemas prior to dispatch.

---



## ⚙️ 7. Core Technical Deep Dive

### 📩 Core Event Payload Specifications

#### 1. FixtureCreated Event (`fixtures.event.created`)
```json
{
  "event_id": "f5b3a4c1-2290-4a7a-9cb8-a5b81a293c6f",
  "event_type": "fixtures.event.created",
  "timestamp": "2026-06-30T05:00:00Z",
  "correlation_id": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "payload": {
    "fixture_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    "league": "SA Premier Division",
    "home_team": "Kaizer Chiefs",
    "away_team": "Orlando Pirates",
    "kickoff": "2026-07-04T15:00:00Z"
  }
}
```

#### 2. OddsUpdated Event (`odds.event.updated`)
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


---


## 💡 8. Implementation Best Practices
- **Best Practice**: Incorporate correlation IDs on all event headers to enable distributed trace mappings.
- **Best Practice**: Ensure event handlers are idempotent to safely handle duplicate message deliveries.

---

## ❌ 9. Architectural Anti-patterns
- **Anti-Pattern**: Designing synchronous API endpoints that wait for background events to resolve before returning.
- **Anti-Pattern**: Publishing unstructured text strings instead of typed JSON schemas.

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: Event messages are encrypted in transit and can only be decrypted by authorized services.

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: Maintains high throughput, processing thousands of events per second with sub-millisecond dispatch times.

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: Since event consumers are stateless, they can scale horizontally to handle backlogs.

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: Tested using mock event streams, asserting correct consumer reactions.

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: Monitors queue depths, consumer lag times, and dead-letter queue (DLQ) write rates.

---

## ⚠️ 15. Common Architectural Mistakes
- **Execution Mistake**: Allowing infinite retry loops on corrupt message structures.
- **Execution Mistake**: Creating circular event patterns where Event A triggers Event B, which triggers Event A.

---

## 🚀 16. Continuous Future Improvements
- **Future Improvement**: Transition core messaging loops to Apache Kafka or RabbitMQ for advanced routing.
- **Future Improvement**: Support real-time event-sourcing audits.

---

## 🕵️ 17. Architecture Review Checklist
- [ ] **Verify**: Confirm all events have unique UUID identifiers and timestamps.
- [ ] **Verify**: Verify that dead-letter queues are configured with automatic notification triggers.

---

## 🔗 18. References & Linked Resources
- [bounded-contexts](bounded-contexts.md)
- [module-interactions](module-interactions.md)
- [dependency-graph](dependency-graph.md)
