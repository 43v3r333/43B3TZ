# 🛠️ Platform Technology Stack

Detailed specifications, chosen alternatives, and development standards for the core components of our technology stack.

---

## 🛠️ Complete Stack Index

| Stack Layer | Technology | Why Chosen? | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Backend API** | Python 3.11 / FastAPI | High asynchronous request-handling and native Pydantic validation. | Express, Django, Go |
| **Task Queue** | Celery / Redis | Distributed background worker queue processing scheduled odds scraping. | n8n, Airflow |
| **Database** | PostgreSQL / TimescaleDB | Relational historical match repository and historical odds timeseries logging. | MongoDB, MySQL, DynamoDB |
| **ML Models** | LightGBM / XGBoost | Multi-classifier probability ensemble modeling match vectors. | PyTorch Nets, Scikit RF |
| **Frontend UI** | React 19 / TypeScript | Modern, high-performance UI components with static rendering. | Vue, Next.js, Angular |
| **Styling** | Tailwind CSS v4 | High-fidelity utility classes and premium high-contrast layouts. | CSS Modules, SASS |

---

## 🔒 Security & Standards Compliance

- **MyPy & tsc Checkpoints**: All Python and TypeScript code must compile without errors using strict type checking.
- **Ruff Linter Compliance**: All code must comply with Ruff linting rules, maintaining highly readable, standard layouts.
- **Alembic Database Migrations**: All schema modifications must proceed through formal, backward-compatible migrations.
