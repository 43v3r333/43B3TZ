# Non-Functional Requirements Specification

## 1. Performance & Latency
- Ingest and parse bookmaker odds feeds in < 100ms.
- API response times must resolve in under 50ms (99th percentile) for all read-cache endpoints.

## 2. Security and Authorization
- Enforce SSL/TLS 1.3 across all ingress routers.
- Hash passwords using Argon2id; sign state JWT sessions with RS256 keys.

## 3. Reliability & High Availability
- Minimum system uptime SLA of 99.95% using stateless Cloud Run container topologies.
- Failover database systems with RTO < 15 minutes and RPO < 1 hour.
