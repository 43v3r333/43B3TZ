# 🌐 Environment Environments & Variables

Guidelines and variable definitions across our local development, staging, and production environments.

---

## 🔑 Environment Variables Specification

The platform utilizes environmental configurations to manage database credentials, API keys, and server settings securely.

| Variable Name | Purpose | Default / Example Value | Required? |
| :--- | :--- | :--- | :--- |
| **GEMINI_API_KEY** | Server-side Gemini API key. | `"AI_Studio_Secret_Token"` | **Yes** (Server-only) |
| **DATABASE_URL** | PostgreSQL database connection string. | `"postgresql://postgres:secure_password@localhost:5432/betting"` | **Yes** |
| **REDIS_URL** | Redis cache and queue connection string. | `"redis://localhost:6379/0"` | **Yes** |
| **LOG_LEVEL** | Logging verbosity filter. | `"INFO"` | No (defaults to `"INFO"`) |
| **APP_URL** | Production hosting domain. | `"https://bettingintel.europe-west2.run.app"` | **Yes** |

---

## 🐳 Docker Deployment Setup

We utilize multi-stage Dockerfiles to build optimized, secure development and production containers:

### Production Multi-Stage Build Flow:
1. **Base Builder**: Ingests light-slim Python, compiles development compilers (gcc, libpq), and installs Poetry dependencies.
2. **Production Stage**: Copies only clean installed library paths and source code files, minimizing the container footprint to under 300MB.
