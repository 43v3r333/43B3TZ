# ⚡ System Performance & Optimization Guidelines

We enforce strict performance budgets and optimization strategies to ensure instant rendering and high async throughput.

---

## ⚡ Performance Budgets

- **REST API Response Latency**: Endpoints must return responses in under **200ms** at the 95th percentile.
- **Odds Processing Latency**: Scrapers must process incoming odds arrays and compare prices in under **500ms**.
- **Model Ingest Latency**: ML scoring pipelines must generate match outcome predictions in under **50ms** per match vector.

---

## ⚡ Caching, Concurrency & Database Indexing

- **Redis-Backed Query Caching**: High-volume queries (such as live match schedules or active value lists) are cached in Redis with a 5-minute time-to-live (TTL).
- **Asynchronous FastAPI Routing**: Use Python `async/await` syntax for all API gateway routes to maximize concurrent request-handling capacity.
- **TimescaleDB Index Optimization**: Relational databases enforce composite indexing on core query vectors (`match_id`, `updated_at`), optimizing historical odds queries.
