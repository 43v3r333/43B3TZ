# 📦 Platform Dependency Management

This manual defines the dependency versions, safety checks, and upgrade policies for our project packages.

---

## 🐍 Backend Python Packages (pyproject.toml)

Our Python packages are managed through Poetry to guarantee reproducible builds across dev and production.

```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100.0"
uvicorn = "^0.22.0"
sqlalchemy = "^2.0.19"
alembic = "^1.11.1"
psycopg2-binary = "^2.9.6"
redis = "^4.6.0"
celery = "^5.3.1"
pydantic = "^2.0.2"
xgboost = "^1.7.6"
lightgbm = "^4.0.0"
catboost = "^1.2"
scikit-learn = "^1.3.0"
numpy = "^1.24.3"
pandas = "^2.0.3"
```

---

## 🛡️ Dependency Upgrade & Safety Policies

- **Strict Pinning**: Avoid major wildcard updates (e.g., `*`). Always specify minor bounds to prevent breaking API changes from affecting production.
- **Weekly Vulnerability Scanning**: Run `pip-audit` via GitHub Actions on every push to detect known vulnerabilities in third-party libraries.
- **Upgrade Protocol**: Major package upgrades must be tested inside a dedicated development branch, verifying test suite compatibility before merging.
