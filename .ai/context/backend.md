# 🐍 Backend Python Architecture & Design Patterns

Detailed specifications for our Python API framework, dependency injection, and CRUD controllers.

---

## 🐍 FastAPI, SQLAlchemy & Celery

- **FastAPI Core Gateway**: Handles asynchronous incoming requests, validates parameters using Pydantic models, and auto-generates Swagger documentation.
- **Repository Patterns**: Database queries are encapsulated inside SQLAlchemy Repository patterns. Exposing database details directly inside routers is forbidden.
- **Async Celery Workers**: Offloads high-latency, scheduled scraper jobs from the main API thread.

---

## 📂 Backend Folder Layout

```
├── backend/
│   ├── api/                   # Router paths, payloads, and JWT middlewares
│   ├── database/              # DB session connections, tables, and CRUD classes
│   └── services/              # Pure business logic: Kelly calculators, scraper adapters
```

---

## 🧩 Dependency Injection Standards

All external services (such as databases or scrapers) must be injected into controllers via FastAPI's `Depends` interface:

```python
@app.get("/api/v1/portfolio/slips")
async def get_portfolio_slips(
    repo: SlipRepository = Depends(get_slip_repository),
):
    return repo.get_all_active_slips()
```
