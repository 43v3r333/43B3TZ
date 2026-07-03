import * as fs from 'fs';
import * as path from 'path';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, rawContent: string) {
  const absolutePath = path.resolve(filePath);
  ensureDir(path.dirname(absolutePath));
  // Replace placeholders with actual backticks
  const content = rawContent
    .replace(/__BTT__/g, '```')
    .replace(/__BT__/g, '`');
  fs.writeFileSync(absolutePath, content.trim() + '\n', 'utf-8');
  console.log(`✓ Skills Engine: Generated ${filePath}`);
}

console.log('Generating AI Betting Intelligence Platform Engineering Skills Library...');

// 1. backend.md
writeFile('.ai/skills/backend.md', `# 🐍 Enterprise Backend Development

## 1. Purpose
This guide defines standards for implementing enterprise-grade, highly testable, and robust FastAPI backends in Python.

## 2. When to Use
- Implementing REST API routers, background workers (Celery), database integrations, and math modeling pipelines.

## 3. When NOT to Use
- Developing client-side rendering (handled strictly in the React frontend).

## 4. Architecture
__BTT__mermaid
graph TD
    UI[React Client] -->|HTTP Request| API[FastAPI Gateway]
    API -->|DI Dependency| UC[Use Case / Service]
    UC -->|Unit of Work| Repo[SQLAlchemy Repository]
    Repo -->|Database Connection| DB[(PostgreSQL)]
__BTT__

## 5. Step-by-Step Implementation
1. **Define DTOs**: Create Pydantic input and output schemas.
2. **Define Repositories**: Establish repository interfaces and implementations.
3. **Define Services**: Build business-logic domain service engines.
4. **Implement Controllers / Routers**: Route parameters and apply dependency injection.

## 6. Repository Standards
- All route dependencies must use FastAPI \`Depends\`.
- All database mutations must occur inside a Unit of Work transactional block.

## 7. Examples

### FastAPI Controller with Dependency Injection
__BTT__python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

class MatchPredictionResponse(BaseModel):
    match_id: int
    home_probability: float
    away_probability: float

router = APIRouter(prefix="/predictions", tags=["predictions"])

def get_prediction_service():
    # Service factory dependency injection
    return PredictionService()

@router.get("/{match_id}", response_model=MatchPredictionResponse)
async def read_prediction(match_id: int, service: PredictionService = Depends(get_prediction_service)):
    prediction = await service.get_prediction_by_id(match_id)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    return MatchPredictionResponse(
        match_id=prediction.match_id,
        home_probability=prediction.home_prob,
        away_probability=prediction.away_prob
    )
__BTT__

## 8. Best Practices
- Keep endpoints lightweight; delegate business logic completely to service layers.
- Implement structured JSON logs for all operational exceptions.

## 9. Anti-patterns
- **Fat Routers**: Querying the database directly within routers without services or repository abstractions.

## 10. Security Considerations
- Validate all incoming parameters with strict Pydantic rules.
- Prevent SQL injection by strictly utilizing SQLAlchemy's parameterized queries.

## 11. Performance Considerations
- Use \`async/await\` for non-blocking I/O operations.
- Reuse database connections via SQLAlchemy connection pooling configurations.

## 12. Testing Strategy
- Use \`pytest\` and \`httpx.AsyncClient\` to verify controller endpoints in isolation.

## 13. Review Checklist
- [ ] Are all route signatures typed with explicit Pydantic DTO schemas?
- [ ] Is exception handling structured returning compliant RFC-7807 payloads?

## 14. Common Mistakes
- Omitting standard timeout parameters inside outbound API client operations.

## 15. Future Improvements
- Move to automated gRPC compilation for internal microservice communication interfaces.

## 16. Revision History
- **v1.0.0**: Outlined enterprise-grade REST architecture.

## 17. Related References
- Skills: [FastAPI](fastapi.md), [Python](python.md)
- Rules: [Coding Rules](../rules/coding-rules.md)
`);

// 2. frontend.md
writeFile('.ai/skills/frontend.md', `# ⚛️ Enterprise Frontend Development

## 1. Purpose
This guide defines standards for writing robust, performant, and type-safe user interfaces in React 19 and Vite.

## 2. When to Use
- Developing interactive, responsive browser interfaces, bento dashboards, and betting slip transaction visualizers.

## 3. When NOT to Use
- Performing raw timeseries aggregations, scrapers, or sensitive financial maths (always delegated to the Python backend).

## 4. Architecture
__BTT__mermaid
graph TD
    App[Vite React Application] --> Router[React Router v7 / SPA Routing]
    Router --> Layouts[Layout Templates]
    Layouts --> Components[Modular Pages / Bento Blocks]
    Components --> Hooks[Custom React Hooks & Contexts]
    Hooks --> Query[TanStack Query REST/WS Client]
__BTT__

## 5. Step-by-Step Implementation
1. **Establish File Layouts**: Put modular components in \`src/components/\` and pages in \`src/pages/\`.
2. **Define State Store**: Leverage simple React local states and lightweight contexts.
3. **Integrate Server Queries**: Call FastAPI backend routes using TanStack Query queries.
4. **Build Charts**: Render responsive, accessible analytics using Recharts.

## 6. Repository Standards
- Absolutely no TS \`any\` declarations. Use strict typescript compiler flags.
- Use named exports for components and helper files.

## 7. Examples

### Type-Safe React Component with Custom Hooks
__BTT__typescript
import React, { useState } from 'react';

interface SlipSizerProps {
  id: string;
  initialStake: number;
  onStakeChange: (newStake: number) => void;
}

export const SlipSizerWidget: React.FC<SlipSizerProps> = ({ id, initialStake, onStakeChange }) => {
  const [stake, setStake] = useState<number>(initialStake);

  const handleUpdate = (value: number) => {
    setStake(value);
    onStakeChange(value);
  };

  return (
    <div id={id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
      <h3 className="text-sm font-sans font-medium tracking-tight text-slate-200">Stake Sizing Sizer</h3>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Current allocation:</span>
        <span className="text-sm font-mono text-green-400 font-bold">\${stake.toFixed(2)}</span>
      </div>
      <input
        id={\`input-range-\${id}\`}
        type="range"
        min={0}
        max={100}
        value={stake}
        onChange={(e) => handleUpdate(Number(e.target.value))}
        className="w-full mt-4 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
};
__BTT__

## 8. Best Practices
- Standardize spacing using responsive Tailwind margin, padding, and layout units.
- Keep components modular and single-purpose.

## 9. Anti-patterns
- **Monolithic App.tsx**: Dumping charts, login forms, and routing configs all into a single file.

## 10. Security Considerations
- Escape all rendered strings to block XSS (Cross-Site Scripting).
- Never store sensitive access keys or private tokens inside local client assets.

## 11. Performance Considerations
- Avoid raw arrays and objects inside React \`useEffect\` dependencies to prevent infinite re-render loops.
- Lazy load major sub-routes using React \`lazy\` and Suspense templates.

## 12. Testing Strategy
- Execute UI component unit tests using React Testing Library and E2E scenarios via Playwright.

## 13. Review Checklist
- [ ] Do components provide correct \`id\` fields for automation checks?
- [ ] Do layout colors maintain robust AAA accessibility requirements?

## 14. Common Mistakes
- Forgetting to properly clean up open WebSocket subscribers upon component unmounting.

## 15. Future Improvements
- Move to compile-time React Server Components (RSC) to increase initial load performance.

## 16. Revision History
- **v1.0.0**: Initial client architecture configured for React 19.

## 17. Related References
- Skills: [Playwright](playwright.md)
- Rules: [Coding Rules](../rules/coding-rules.md)
`);

// 3. python.md
writeFile('.ai/skills/python.md', `# 🐍 Enterprise Python Standards

## 1. Purpose
To ensure clean, structured, type-safe, and highly performant Python development.

## 2. When to Use
- Writing any Python service, machine learning script, Celery worker task, or DB model.

## 3. When NOT to Use
- Developing client-side user experience scripts (handled strictly via React).

## 4. Architecture
Python modules inside our system must strictly utilize layered separation of concerns:
__BTT__
[ Pydantic DTO Validation ] -> [ Service / Use Case ] -> [ Repository (SQLAlchemy) ]
__BTT__

## 5. Step-by-Step Implementation
1. **Type Annotation**: Always write precise types for function parameters and returned results.
2. **DTO Verification**: Declare input and output objects using Pydantic BaseModel configurations.
3. **Exception Strategy**: Create explicit custom domain exceptions subclassing custom system errors.

## 6. Repository Standards
- Code formatting is enforced strictly via \`Ruff\` and \`Black\`.
- All functions must have docstrings specifying parameters, output types, and exception profiles.

## 7. Examples

### Clean Type-Safe Service
__BTT__python
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class CalibrationInput(BaseModel):
    raw_probabilities: List[float] = Field(..., min_items=1)
    overround: float = Field(..., gt=1.0)

class CalibratedOutput(BaseModel):
    normalized_probabilities: List[float]

class CalibratorService:
    """Mathematical utility service to remove overround and normalize probabilities."""

    def calibrate(self, data: CalibrationInput) -> CalibratedOutput:
        total = sum(data.raw_probabilities)
        if total == 0:
            raise ValueError("Raw probabilities sum cannot be zero.")
        normalized = [p / total for p in data.raw_probabilities]
        return CalibratedOutput(normalized_probabilities=normalized)
__BTT__

## 8. Best Practices
- Prefer composition over deep inheritance.
- Always utilize context managers (\`with\` statements) for file handles or database transactions.

## 9. Anti-patterns
- **Implicit any (\`Any\` abuse)**: Declaring major variables as unstructured dicts instead of typed Pydantic models.

## 10. Security Considerations
- Never execute dynamic command lines using raw input variables via subprocess interfaces.

## 11. Performance Considerations
- Use list comprehensions over nested \`for\` loops for faster execution.
- Minimize object instantiation inside high-frequency timeseries processing loops.

## 12. Testing Strategy
- Unit-test mathematical services with \`pytest\` parameterization matrices.

## 13. Review Checklist
- [ ] Are type-hints fully populated?
- [ ] Are Pydantic objects utilized to filter incoming API JSON structures?

## 14. Common Mistakes
- Mutating default parameters inside class or function headers (e.g. \`def do_work(arg=[])\`).

## 15. Future Improvements
- Implement Cython or Rust integrations for performance-critical sports analytical loops.

## 16. Revision History
- **v1.0.0**: Defined strict typing standards aligned with Python 3.11+.

## 17. Related References
- Skills: [FastAPI](fastapi.md), [SQLAlchemy](sqlalchemy.md)
- Rules: [Coding Rules](../rules/coding-rules.md)
`);

// 4. fastapi.md
writeFile('.ai/skills/fastapi.md', `# ⚡ FastAPI Development Standards

## 1. Purpose
This guide defines standard development practices for FastAPI web services in our sports analytics ecosystem.

## 2. When to Use
- Creating REST APIs, WebSocket pipelines, and exposing statistical modeling gateways.

## 3. When NOT to Use
- Writing standalone command-line scrapers or standalone training models.

## 4. Architecture
FastAPI handles web ingress, route parsing, and parameters validation before routing requests into pure domains:
__BTT__
[ API Request ] -> [ FastAPI Router ] -> [ Depend Injection ] -> [ Business Service ]
__BTT__

## 5. Step-by-Step Implementation
1. **Initialize Router**: Define an \`APIRouter\` with clean prefixes.
2. **Setup Dependencies**: Create factories for services using FastAPI \`Depends\`.
3. **Route Handlers**: Use \`async def\` for I/O operations and write clear output DTO models.

## 6. Repository Standards
- Always validate incoming paths using Pydantic.
- Provide descriptive annotations in Pydantic models to auto-document the Swagger interface.

## 7. Examples

### Standard FastAPI Endpoint with Structured Error Responses
__BTT__python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

class BetSlipPayload(BaseModel):
    match_id: int = Field(..., description="ID of match")
    stake: float = Field(..., gt=0, description="Betting stake amount")

class BetSlipResponse(BaseModel):
    slip_id: int
    is_processed: bool

router = APIRouter(prefix="/slips", tags=["slips"])

@router.post("/", response_model=BetSlipResponse, status_code=status.HTTP_201_CREATED)
async def create_slip(payload: BetSlipPayload):
    try:
        # Business logic operation
        return BetSlipResponse(slip_id=101, is_processed=True)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process bet slip: {str(err)}"
        )
__BTT__

## 8. Best Practices
- Inject configuration classes globally using a cached singleton pattern.
- Limit endpoint complexity by moving logic entirely into pure service classes.

## 9. Anti-patterns
- Returning raw SQLAlchemy models directly over HTTP without Pydantic translation.

## 10. Security Considerations
- Secure endpoints with standard JWT authorization middleware configurations.

## 11. Performance Considerations
- Use \`async def\` only for handlers executing genuine asynchronous operations (e.g. database, network calls).

## 12. Testing Strategy
- Leverage FastAPI \`TestClient\` and \`pytest-asyncio\` for endpoint validation.

## 13. Review Checklist
- [ ] Do Pydantic models enforce valid bounds on numerical fields?
- [ ] Are HTTP exception statuses compliant with REST guidelines?

## 14. Common Mistakes
- Omitting dependency caching rules during complex validation dependency cascades.

## 15. Future Improvements
- Move API documentation directly into compiled static sites behind high-speed CDN caches.

## 16. Revision History
- **v1.0.0**: Outlined high-performance endpoint structures.

## 17. Related References
- Skills: [Backend](backend.md), [Python](python.md)
- Rules: [API Rules](../rules/api-rules.md)
`);

// 5. sqlalchemy.md
writeFile('.ai/skills/sqlalchemy.md', `# 🗄️ SQLAlchemy 2.0 Mapping & Query Standards

## 1. Purpose
To define the standard setup for database models, relationships, and queries using SQLAlchemy 2.0.

## 2. When to Use
- Accessing or modifying PostgreSQL data inside backend modules.

## 3. When NOT to Use
- Writing real-time websocket scrapers with no database interactions.

## 4. Architecture
SQLAlchemy serves as the Object-Relational Mapper (ORM), abstracting transactional database engines behind clean repositories:
__BTT__
[ Repository Layer ] -> [ SQLAlchemy Session ] -> [ Parameterized SQL ] -> [ Postgres DB ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Declarative Base**: Inherit models from SQLAlchemy's \`DeclarativeBase\`.
2. **Setup Columns**: Use modern Mapped types (\`Mapped[int]\`, \`Mapped[str]\`).
3. **Execute Sessions**: Run commands inside transactional contexts using \`async_sessionmaker\`.

## 6. Repository Standards
- All migrations must be performed through Alembic revisions.
- Absolutely zero raw SQL queries inside repositories without proper parameterization.

## 7. Examples

### Declarative Model and Async Repository
__BTT__python
from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class Base(DeclarativeBase):
    pass

class MatchEntity(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    home_team: Mapped[str] = mapped_column(String(100), nullable=False)
    away_team: Mapped[str] = mapped_column(String(100), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

class MatchRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, match_id: int) -> MatchEntity | None:
        query = select(MatchEntity).where(MatchEntity.id == match_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
__BTT__

## 8. Best Practices
- Leverage modern Mapped types explicitly for robust IDE autocomplete and mypy type checks.
- Handle relationship loading strategies carefully (prefer \`selectinload\` for nested async relational sets).

## 9. Anti-patterns
- **N+1 Querying**: Querying a list of entities and subsequently loading matching foreign key rows one-by-one in a loop.

## 10. Security Considerations
- Parameterize all search predicates strictly to avoid SQL injection vulnerability gates.

## 11. Performance Considerations
- Limit returned result arrays using explicit pagination bounds.
- Use read-only sessions (\`select\`) without flushing state modifications when checking calculations.

## 12. Testing Strategy
- Test repository methods using local transactional rollbacks in pytest fixture definitions.

## 13. Review Checklist
- [ ] Are cascading rules properly configured for deleted parent keys?
- [ ] Do foreign keys map to explicitly indexed database keys?

## 14. Common Mistakes
- Utilizing async session operations without prefixing query expressions with \`await\`.

## 15. Future Improvements
- Migrate to automated read/write connection-splitting across active multi-region replicas.

## 16. Revision History
- **v1.0.0**: Outlined standard async SQLAlchemy mapping patterns.

## 17. Related References
- Skills: [PostgreSQL](postgres.md), [Backend](backend.md)
- Rules: [Database Rules](../rules/database-rules.md)
`);

// 6. postgres.md
writeFile('.ai/skills/postgres.md', `# 🗄️ PostgreSQL Database Performance Standards

## 1. Purpose
To outline architectural and operational standards for PostgreSQL data models, indices, and partitioned timeseries storage.

## 2. When to Use
- Managing structural tables, historical matches, portfolio histories, and high-frequency timeseries odds.

## 3. When NOT to Use
- Storing temporary fast session credentials (always routed to Redis).

## 4. Architecture
Our storage layout maps transaction logs to relational tables, while streaming odds target TimescaleDB hypertables:
__BTT__
                           [ Ingress Layer ]
                             /           \\
             [ Relational Data ]       [ Timeseries Odds ]
                   |                           |
             [ standard PG ]             [ TimescaleDB ]
__BTT__

## 5. Step-by-Step Implementation
1. **Design Tables**: Set standard types, tracking creation and update times in UTC.
2. **Apply Indexes**: Choose standard indices (B-Tree) for lookups or partial indexes for specialized queries.
3. **Partition Timeseries**: Configure hypertable segment schedules for large high-frequency tables.

## 6. Repository Standards
- Relational tables use lowercase plural snake_case naming keys.
- Every relational table must include an auto-incrementing integer key named \`id\`.

## 7. Examples

### Creating standard table and TimescaleDB Hypertable
__BTT__sql
-- Create core matches table with optimal lookup indices
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at) WHERE is_deleted IS FALSE;

-- Create timeseries odds table partitioned by date
CREATE TABLE historical_odds (
    id SERIAL,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL,
    odds_home NUMERIC(5,2) NOT NULL,
    odds_draw NUMERIC(5,2) NOT NULL,
    odds_away NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id, recorded_at)
);

-- Convert to high-performance TimescaleDB hypertable
SELECT create_hypertable('historical_odds', 'recorded_at', chunk_time_interval => INTERVAL '7 days');
__BTT__

## 8. Best Practices
- Never use \`SELECT *\`. Always query exact required columns.
- Keep table constraints strictly validated at the database engine level (e.g., \`CHECK (odds_home > 1.0)\`).

## 9. Anti-patterns
- **Soft Delete Index Pollution**: Querying active records without an index that filters out deleted rows.

## 10. Security Considerations
- Limit database connection privileges; API connections should not possess DDL (schema-altering) capabilities.

## 11. Performance Considerations
- Configure foreign key targets with corresponding indexes to speed up cascading deletion lookups.

## 12. Testing Strategy
- Validate DB schema migrations using pytest and isolated test database instances.

## 13. Review Checklist
- [ ] Are numerical types sized properly (e.g. \`NUMERIC\` for precise finance formulas)?
- [ ] Are correct indexes applied for standard filter queries?

## 14. Common Mistakes
- Storing timestamps without explicit timezone references (\`TIMESTAMP\` instead of \`TIMESTAMP WITH TIME ZONE\`).

## 15. Future Improvements
- Automate TimescaleDB continuous aggregations to pre-calculate hourly match volume analytics.

## 16. Revision History
- **v1.0.0**: Defined base PostgreSQL and TimescaleDB configurations.

## 17. Related References
- Skills: [SQLAlchemy](sqlalchemy.md)
- Rules: [Database Rules](../rules/database-rules.md)
`);

// 7. redis.md
writeFile('.ai/skills/redis.md', `# ⚡ Redis Caching & In-Memory Standards

## 1. Purpose
To establish optimal patterns for caching, distributed locking, and rate-limiting using Redis.

## 2. When to Use
- Storing fast-changing web pages, session states, API rate limit counters, or distributed locks across async workers.

## 3. When NOT to Use
- Saving durable business slip history files or system logs (always target Postgres).

## 4. Architecture
Redis acts as a high-speed, in-memory layer, reducing load on our main PostgreSQL database:
__BTT__
[ Client Request ] -> [ FastAPI Router ]
                           |
                     [ Redis Cache ] -- (Hit) -> [ Return Fast JSON ]
                           | (Miss)
                     [ Query Postgres ] -> [ Save in Redis ]
__BTT__

## 5. Step-by-Step Implementation
1. **Initialize Client**: Instantiate a connection pool with explicit timeouts.
2. **Implement Caching**: Use descriptive key formats with automatic TTL expirations.
3. **Establish Distributed Locks**: Protect critical sections with secure lock keys and timeouts.

## 6. Repository Standards
- Use structured key prefixes separated by colons (e.g. \`cache:matches:<id>\`).
- Always define a TTL (Time-To-Live) on cache writes to prevent stale memory builds.

## 7. Examples

### Type-Safe Redis Cache Wrapper with Distributed Lock
__BTT__python
import redis
import time
from typing import Optional

class RedisCacheManager:
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0) -> None:
        self.pool = redis.ConnectionPool(host=host, port=port, db=db, socket_timeout=2.0)
        self.client = redis.Redis(connection_pool=self.pool)

    def get_match_cache(self, match_id: int) -> Optional[str]:
        key = f"cache:matches:{match_id}"
        value = self.client.get(key)
        return value.decode("utf-8") if value else None

    def set_match_cache(self, match_id: int, payload: str, ttl_seconds: int = 300) -> None:
        key = f"cache:matches:{match_id}"
        self.client.setex(key, ttl_seconds, payload)

    def acquire_lock(self, lock_name: str, acquire_timeout: int = 5) -> bool:
        lock_key = f"lock:{lock_name}"
        # Set nx=True for mutual exclusion, ex=10 to prevent infinite lock hold on failure
        return bool(self.client.set(lock_key, "locked", ex=10, nx=True))

    def release_lock(self, lock_name: str) -> None:
        self.client.delete(f"lock:{lock_name}")
class RateLimiter:
    """Standard sliding window rate limiter."""
    pass
__BTT__

## 8. Best Practices
- Never store complex, nested binary files directly without serialization schemas (always serialize as clean JSON or MessagePack).
- Standardize cache keys globally using explicit configuration schemas.

## 9. Anti-patterns
- **Unbounded Key Growth**: Storing user session histories in Redis keys without explicit TTL settings, eventually running out of memory.

## 10. Security Considerations
- Require robust passwords on all local and cloud Redis server interfaces.

## 11. Performance Considerations
- Use connection pooling to recycle sockets across high-frequency operations.

## 12. Testing Strategy
- Test caching operations with mock Redis interfaces (such as \`fakeredis\`) in unit suites.

## 13. Review Checklist
- [ ] Are all cached keys configured with an explicit expiration TTL?
- [ ] Do distributed locks include a safety timeout to prevent deadlocks?

## 14. Common Mistakes
- Accessing Redis blocking connections synchronously within async FastAPI handlers without thread-pool insulation.

## 15. Future Improvements
- Upgrade to Redis Cluster patterns for massive scaling across geographic regions.

## 16. Revision History
- **v1.0.0**: Defined core caching and lock patterns.

## 17. Related References
- Skills: [FastAPI](fastapi.md), [Backend](backend.md)
- Rules: [Performance Rules](../rules/performance-rules.md)
`);

// 8. docker.md
writeFile('.ai/skills/docker.md', `# 🐳 Docker Containerization Standards

## 1. Purpose
To define enterprise-grade container patterns for secure, small, and highly optimized services.

## 2. When to Use
- Packaging API controllers, database migrations, scrapers, and frontend pages for development or production environments.

## 3. When NOT to Use
- Packaging rapid local mathematical validation scripts with zero dependencies.

## 4. Architecture
We use multi-stage Docker builds to separate dependencies, compilation, and lightweight execution runtimes:
__BTT__
[ Development Stage ] -> [ Compilation/Build Stage ] -> [ Minimal Production Stage ]
(Installs dev tools)       (Compiles assets/code)        (Super small runtime image)
__BTT__

## 5. Step-by-Step Implementation
1. **Choose Base Image**: Use trusted, small, and pinned versions (e.g. \`python:3.11-slim\`, \`node:20-alpine\`).
2. **Structure Stages**: Copy package specs, install dependencies, and build target files.
3. **Declare Permissions**: Always run app operations as a non-root user.
4. **Expose Ports**: Standardize API gateway container maps to **Port 3000**.

## 6. Repository Standards
- Multi-stage Docker configurations are mandatory.
- Never hardcode environmental secrets inside images or Dockerfiles.

## 7. Examples

### Multi-Stage Production Dockerfile for python/Node service
__BTT__dockerfile
# Stage 1: Compile dependencies
FROM python:3.11-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final minimal execution container
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PATH=/home/appuser/.local/bin:\$PATH

RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -m -s /sbin/nologin appuser

COPY --from=builder /root/.local /home/appuser/.local
COPY . .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
__BTT__

## 8. Best Practices
- Keep image sizes compact by excluding build tools and using \`.dockerignore\`.
- Pin all packages and parent image hashes strictly in configurations.

## 9. Anti-patterns
- **Root Running**: Running application containers directly as \`root\`, opening security threat vectors.

## 10. Security Considerations
- Never copy private SSH keys or credentials into intermediate or final build layers.

## 11. Performance Considerations
- Order commands by volatility to maximize layer cache hit rates (e.g. copy dependency lists before code).

## 12. Testing Strategy
- Verify image status and configurations in local docker-compose environments.

## 13. Review Checklist
- [ ] Is the final execution user configured as a non-privileged user?
- [ ] Are all unnecessary development packages excluded from the production image?

## 14. Common Mistakes
- Leaving cached installation files inside intermediate layers.

## 15. Future Improvements
- Switch to distroless container bases for extremely hardened and small production packages.

## 16. Revision History
- **v1.0.0**: Standardized secure multi-stage Docker profiles.

## 17. Related References
- Skills: [DevOps](devops.md), [Backend](backend.md)
- Rules: [Deployment Rules](../rules/deployment-rules.md)
`);

// 9. devops.md
writeFile('.ai/skills/devops.md', `# 🌿 CI/CD & DevOps Automation Standards

## 1. Purpose
To establish robust pathways for integration testing, automated packaging, secure rollouts, and continuous site updates.

## 2. When to Use
- Writing pipeline workflows, setting up cluster scaling rules, or managing environment configurations.

## 3. When NOT to Use
- Making simple, local code edits with zero deployment impacts.

## 4. Architecture
Our automated pipelines validate and compile changes, running verification steps before rolling out updates:
__BTT__
[ Commit Code ] -> [ GitHub Actions ] -> [ Lint & Test ] -> [ Docker Build ] -> [ Deploy to Cloud ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Pipelines**: Create GitHub Action configs in \`.github/workflows/\`.
2. **Lint & Verify**: Set up jobs to run formatting checks, linter runs, and testing suites.
3. **Containerize & Store**: Build and upload secure Docker images to the registry.
4. **Automate Rollout**: Promote images to staging, run E2E checks, and trigger blue-green swaps in production.

## 6. Repository Standards
- All changes must pass linting, formatting, and unit tests before merging to main.
- Store sensitive configuration keys strictly inside secure GitHub Repository secrets.

## 7. Examples

### Complete GitHub Actions Integration Workflow
__BTT__yaml
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ruff black pytest pytest-cov
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

      - name: Check code formatting
        run: black --check .

      - name: Lint with Ruff
        run: ruff check .

      - name: Execute Pytest Suite
        run: pytest --cov=./ --cov-report=xml

      - name: Upload coverage metrics
        uses: codecov/codecov-action@v3
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
__BTT__

## 8. Best Practices
- Keep pipeline runs fast using smart caching strategies for python and node packages.
- Always run security scans (like Snyk or Trivy) on compiled container images.

## 9. Anti-patterns
- **Manual Rollouts**: ssh-ing directly into production containers to run commands or update code.

## 10. Security Considerations
- Rotate deploy keys and API access tokens regularly using automated expiration rules.

## 11. Performance Considerations
- Parallelize independent pipeline jobs (e.g. run frontend and backend linter checks concurrently).

## 12. Testing Strategy
- Verify pipeline actions locally using tools like \`act\`.

## 13. Review Checklist
- [ ] Are production deployment branches protected with mandatory approval gates?
- [ ] Do deployment actions rollback automatically on health-check failures?

## 14. Common Mistakes
- Forgetting to configure appropriate resource limits (CPU/RAM) on deployed staging containers.

## 15. Future Improvements
- Implement GitOps engines to automatically sync Kubernetes cluster states with repository definitions.

## 16. Revision History
- **v1.0.0**: Configured base CI/CD pipelines.

## 17. Related References
- Skills: [Docker](docker.md), [Testing](testing.md)
- Rules: [Deployment Rules](../rules/deployment-rules.md)
`);

// 10. security.md
writeFile('.ai/skills/security.md', `# 🛡️ Secure Software Engineering Standards

## 1. Purpose
To guarantee secure coding practices, protecting the platform against data leaks, injection attacks, and authorization breaches.

## 2. When to Use
- Implementing user login flows, encrypting sensitive fields, managing environment settings, or writing security rules.

## 3. When NOT to Use
- Writing standalone visual formatting styles with zero system interactions.

## 4. Architecture
We use a layered defense model, validating and securing data at every boundary:
__BTT__
[ Client Browser ] -> [ HTTPS / CORS Gateway ] -> [ JWT Auth Middleware ] -> [ Parameterized DB Query ]
__BTT__

## 5. Step-by-Step Implementation
1. **Validate Ingress**: Require HTTPS, set secure CORS policies, and sanitize inputs.
2. **Enforce Authorization**: Guard routes with JWT verification middleware.
3. **Secure Storage**: Use strong hashing (Argon2id) for passwords and encrypt private values in Postgres.
4. **Hide Secrets**: Store credentials strictly in environment files on the server side.

## 6. Repository Standards
- Direct execution of raw SQL strings is strictly banned. Use SQLAlchemy parameterized query models.
- All endpoints are closed and require authentication unless explicitly whitelisted.

## 7. Examples

### Secure Password Sizer and JWT Validator
__BTT__python
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
from passlib.context import CryptContext

# Set up strong Argon2id hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class SecurityManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256") -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return pwd_context.verify(password, hashed_password)

    def generate_token(self, payload: Dict[str, Any], expires_delta: int = 15) -> str:
        data = payload.copy()
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
        data.update({"exp": expire})
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.PyJWTError:
            raise ValueError("Invalid authentication token")
__BTT__

## 8. Best Practices
- Never commit private API credentials or keys into git repositories. Use \`.env.example\` to document variables.
- Set secure HTTP-only cookies to handle user refresh token exchanges.

## 9. Anti-patterns
- **Client-Side Storage of Keys**: Initializing third-party APIs or gateways on the frontend, exposing secrets in the browser.

## 10. Security Considerations
- Limit login attempt rates to block brute-force password guessing.

## 11. Performance Considerations
- Cache JWT verification results in Redis (with short TTLs) for high-frequency WebSocket handlers.

## 12. Testing Strategy
- Write explicit penetration tests verifying that unauthenticated requests are blocked at API gates.

## 13. Review Checklist
- [ ] Are all database queries parameterized?
- [ ] Do password hashing operations use high-entropy configurations?

## 14. Common Mistakes
- Utilizing vulnerable, outdated cryptography algorithms (like MD5 or SHA1) for secure system hashing.

## 15. Future Improvements
- Integrate hardware security modules (HSM) to handle encryption key rotations.

## 16. Revision History
- **v1.0.0**: Outlined modern secure development practices.

## 17. Related References
- Skills: [Backend](backend.md), [FastAPI](fastapi.md)
- Rules: [Security Rules](../rules/security-rules.md)
`);

// 11. documentation.md
writeFile('.ai/skills/documentation.md', `# 📖 Technical Documentation Standards

## 1. Purpose
To ensure all mathematical formulas, architectural layers, and system rules are documented with absolute clarity and precision.

## 2. When to Use
- Writing Markdown guides, adding Architecture Decision Records (ADRs), or documenting complex codebase features.

## 3. When NOT to Use
- Writing short, self-documenting helper routines.

## 4. Architecture
Our documentation model tracks historical decisions, mathematical logic, and overall system layouts:
__BTT__
                              [ Start Here ]
                                   |
           +-----------------------+-----------------------+
           |                       |                       |
     [ System Rules ]        [ Tech Skills ]         [ Architecture ]
      (How we build)          (What we use)           (How it works)
__BTT__

## 5. Step-by-Step Implementation
1. **Identify Target**: Write architectural layout logs to \`ARCHITECTURE.md\` and local changes to \`CHANGELOG.md\`.
2. **Format Formulas**: Use clear LaTeX syntax for mathematical and financial formulas.
3. **Illustrate Flows**: Draw process paths and system states using native Mermaid diagrams.
4. **Remove Placeholders**: Ensure all sections are fully written and omit temporary TODO comments.

## 6. Repository Standards
- No handwritten text blocks without clear structured section headers.
- All markdown links must resolve cleanly to existing local files or schemas.

## 7. Examples

### Architecture Decision Record (ADR) Template
__BTT__markdown
# ADR 004: Adopting Platt Scaling for Calibration

## Context
Our raw LightGBM classifiers output uncalibrated sports prediction probabilities. To compute reliable Kelly Criterion stakes, we require mathematically calibrated probabilities.

## Decision
We will calibrate LightGBM outputs server-side using Platt Scaling (sigmoid calibration) inside \`CalibratedClassifierCV\`.

## Math Formulation
$$P_{\\text{calibrated}}(y=1 | x) = \\frac{1}{1 + e^{A f(x) + B}}$$

## Consequences
- Requires an additional cross-validation calibration step during training.
- Guarantees prediction log-loss remains stable below 0.62.
- Enables safe bankroll risk allocation calculations.
__BTT__

## 8. Best Practices
- Keep documentation up-to-date with code modifications.
- Focus on practical, scannable explanations with real code examples.

## 9. Anti-patterns
- **Stale Docs**: Leaving documentation outdated after updating database schemas or business logic.

## 10. Security Considerations
- Ensure documentation never contains private system URLs, access credentials, or production server logs.

## 11. Performance Considerations
- Render complex charts and diagrams with light, standard vector SVGs.

## 12. Testing Strategy
- Implement automated tools to scan and flag broken links or paths in markdown files.

## 13. Review Checklist
- [ ] Are all formulas formatted in valid LaTeX?
- [ ] Is the document free of placeholder text or TODO blocks?

## 14. Common Mistakes
- Writing long, verbose paragraphs of text instead of using structured, scannable lists and diagrams.

## 15. Future Improvements
- Set up an automated site build to compile all markdown docs into a searchable internal handbook.

## 16. Revision History
- **v1.0.0**: Established codebase documentation standards.

## 17. Related References
- Rules: [Documentation Rules](../rules/documentation-rules.md)
`);

// 12. testing.md
writeFile('.ai/skills/testing.md', `# 🧪 Testing & Quality Standards

## 1. Purpose
To define the overall testing standards, coverage metrics, and verification methods across backend and frontend code.

## 2. When to Use
- Writing unit tests, integration paths, E2E user flows, or automated validation suites.

## 3. When NOT to Use
- Writing rapid, interactive Jupyter notebooks for research.

## 4. Architecture
Our testing model validates logic across isolated units, integration paths, and full user interfaces:
__BTT__
           [ Playwright E2E ] -> (User Interface & Full App Flow)
                   |
         [ Pytest Integration ] -> (Service Layers & Real Postgres DB)
                   |
           [ Pytest Unit ] -> (Pure Functions, Math & Logic)
__BTT__

## 5. Step-by-Step Implementation
1. **Initialize Suite**: Set up configuration schemas in \`pytest.ini\` and \`vitest.config.ts\`.
2. **Write Unit Tests**: Focus tests on core algorithms, using mocked components to ensure isolation.
3. **Write Integration Tests**: Verify database relationships and transaction flows inside rollbacked sessions.
4. **Write E2E Tests**: Write Playwright workflows to test critical UI routes and user actions.

## 6. Repository Standards
- We enforce a minimum 90% statement coverage on backend modules.
- Financial and sports math functions (like Kelly Sizing) require 100% statement coverage.

## 7. Examples

### High-Fidelity Math Unit Test with Pytest Parameterization
__BTT__python
import pytest

def calculate_implied_probability(odds: float) -> float:
    if odds <= 1.0:
        raise ValueError("Odds must be greater than 1.0")
    return 1.0 / odds

@pytest.mark.parametrize("odds,expected", [
    (2.0, 0.50),
    (4.0, 0.25),
    (1.25, 0.80),
])
def test_implied_probability_calculation(odds: float, expected: float) -> None:
    assert calculate_implied_probability(odds) == pytest.approx(expected)

def test_invalid_odds_raises_error() -> None:
    with pytest.raises(ValueError, match="Odds must be greater than 1.0"):
        calculate_implied_probability(0.8)
__BTT__

## 8. Best Practices
- Keep tests completely deterministic; always seed random number generators inside testing scripts.
- Isolate test runs from external APIs by mock-routing outbound requests.

## 9. Anti-patterns
- **Test Pollution**: Writing integration tests that mutate production database tables.

## 10. Security Considerations
- Secure credentials; tests must not utilize or leak real production credentials or API keys.

## 11. Performance Considerations
- Run unit tests concurrently using pytest-xdist to accelerate CI pipeline steps.

## 12. Testing Strategy
- Execute unit and integration tests automatically on code commit steps.

## 13. Review Checklist
- [ ] Does backend test coverage meet the mandatory 90% threshold?
- [ ] Are all mock models isolated from external web resources?

## 14. Common Mistakes
- Skipping assertions and simply executing code to fake test coverage metrics.

## 15. Future Improvements
- Implement automated mutation testing to evaluate the quality of our verification assertions.

## 16. Revision History
- **v1.0.0**: Established unified testing standards.

## 17. Related References
- Skills: [Unit Testing](unit-testing.md), [Integration Testing](integration-testing.md), [Playwright](playwright.md)
- Rules: [Testing Rules](../rules/testing-rules.md)
`);

// 13. code-review.md
writeFile('.ai/skills/code-review.md', `# 🔍 Code Review Standards & Gateways

## 1. Purpose
To define strict guidelines for human and AI code reviews, keeping standards high across the repository.

## 2. When to Use
- Evaluating pull requests, validating new features, or reviewing bug fix branches.

## 3. When NOT to Use
- Writing local code in private working branches.

## 4. Architecture
Our code review model uses automated checks as the first line of defense, followed by targeted manual reviews:
__BTT__
[ Code Commit ] -> [ Automated Linter & Compile ] -> [ Human / AI Review Gate ] -> [ Merge to Main ]
__BTT__

## 5. Step-by-Step Implementation
1. **Automate Checks**: Confirm all automated linters and compilation checks pass with zero errors.
2. **Review Architecture**: Check that layers are isolated and clean architectural boundaries are respected.
3. **Review Math/Logic**: Verify sports math calculations are correct and lookahead bias has been eliminated.
4. **Review Security**: Check for secrets leakage, input sanitization, and SQL injection risks.

## 6. Repository Standards
- Pull requests must not reduce current test coverage percentages.
- Rebase and merge with squashed commits to keep a clean, linear git history.

## 7. Examples

### Complete Pull Request Review Matrix
| Review Area | Target Checks | Code standard |
| :--- | :--- | :--- |
| **Architecture** | Do routers contain SQL queries? | Fails layer boundaries rule. Query logic must reside in repositories. |
| **Security** | Are there any hardcoded keys? | Fails secrets rule. Private keys must remain in env. |
| **Math / Stats** | Is Kelly sizing clamped? | Sizing must be clamped strictly below 5.0% threshold. |
| **Performance** | Are DB queries run in loops? | Fails loop lookup rule. Use composite indexes and pre-fetch arrays. |

## 8. Best Practices
- Prioritize objective criteria and standards over personal style preferences during reviews.
- Provide clear, actionable feedback with code examples when pointing out issues.

## 9. Anti-patterns
- **LGTM Approvals**: Approving pull requests quickly without reviewing mathematical logic or execution safety.

## 10. Security Considerations
- Check for OWASP Top 10 vulnerabilities (e.g. CSRF risk, improper authorization, unvalidated redirects).

## 11. Performance Considerations
- Ensure database modifications are backed by correct indexes to prevent table scans on high-frequency queries.

## 12. Testing Strategy
- Require automated CI passes for every branch before human review can begin.

## 13. Review Checklist
- [ ] Do all functions include type signatures?
- [ ] Are all database operations parameterized?

## 14. Common Mistakes
- Reviewing too much code at once; restrict pull requests to small, logical increments.

## 15. Future Improvements
- Deploy customized AI review assistants to automatically flag style issues and layer violations on commits.

## 16. Revision History
- **v1.0.0**: Standardized the code review guidelines.

## 17. Related References
- Skills: [Testing](testing.md)
- Rules: [Review Rules](../rules/review-rules.md)
`);

// 14. performance.md
writeFile('.ai/skills/performance.md', `# ⚡ Performance Tuning & Optimization Standards

## 1. Purpose
To establish performance engineering standards, ensuring our analytical calculations run with sub-second latency.

## 2. When to Use
- Optimizing slow API endpoints, database queries, memory layouts, or frontend rendering speeds.

## 3. When NOT to Use
- Writing rapid, low-frequency scripts where execution speed is not a constraint.

## 4. Architecture
We optimize performance across all layers, from database index lookups to in-memory caching and clean UI rendering:
__BTT__
[ React UI ] -> (Memoization & Lazy-Loading)
    |
[ FastAPI ] -> (Async Task Ingestion & Pooling)
    |
[ Redis Cache ] -> (Key-Value In-Memory Cache with TTL)
    |
[ Postgres / TimescaleDB ] -> (Composite Indexes & Partitions)
__BTT__

## 5. Step-by-Step Implementation
1. **Profile First**: Identify bottlenecks using profiling utilities (e.g., \`cProfile\`, Chrome DevTools).
2. **Optimize DB**: Verify queries leverage indexes; avoid N+1 queries.
3. **Leverage Redis**: Cache slow, high-frequency database aggregations with clear TTL limits.
4. **Stream Large Datasets**: Stream large analytical datasets asynchronously instead of loading entire tables into memory.

## 6. Repository Standards
- REST API queries must return results in under 200ms at the 95th percentile.
- Heavy React chart dashboards must memoize components to prevent unnecessary re-render loops.

## 7. Examples

### Fast Profiling Decorator in Python
__BTT__python
import time
import functools
import logging
from typing import Callable, Any

logger = logging.getLogger("performance")

def profile_execution_time(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to measure and log function execution times."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start_time
        logger.info(
            f"Function {func.__name__} executed in {duration:.4f} seconds"
        )
        return result
    return wrapper
__BTT__

## 8. Best Practices
- Reuse database sessions using connection pooling configurations.
- Store high-frequency odds inside partitioned TimescaleDB tables.

## 9. Anti-patterns
- **Memory Buffering**: Loading large odds datasets into Python lists instead of streaming records from the database.

## 10. Security Considerations
- Limit memory resource consumption on public APIs to protect services from Denial-of-Service (DoS) attacks.

## 11. Performance Considerations
- Run heavy calculations in background threads or Celery workers to keep the main event loop responsive.

## 12. Testing Strategy
- Implement automated benchmark tests in the CI pipeline to catch latency regressions before release.

## 13. Review Checklist
- [ ] Are composite indexes applied on compound query patterns?
- [ ] Do volatile, read-heavy API responses utilize Redis caching?

## 14. Common Mistakes
- Adding random indexes to database tables without verifying query profiles, which slows down write operations.

## 15. Future Improvements
- Implement continuous database aggregations to pre-calculate team stats and trends on scheduled cycles.

## 16. Revision History
- **v1.0.0**: Standardized platform performance optimization techniques.

## 17. Related References
- Skills: [Redis](redis.md), [PostgreSQL](postgres.md)
- Rules: [Performance Rules](../rules/performance-rules.md)
`);

// 15. architecture.md
writeFile('.ai/skills/architecture.md', `# 🏛️ Platform Architecture & Clean Coding

## 1. Purpose
To define the core architectural guidelines and design principles that keep the platform maintainable and easy to scale.

## 2. When to Use
- Designing new services, adding database relationships, or defining communication patterns between backend and frontend.

## 3. When NOT to Use
- Implementing minor localized changes within an isolated frontend utility function.

## 4. Architecture
Our system decouples business domains from technical implementations using Clean Architecture boundaries:
__BTT__
  +-------------------------------------------------+
  | Frameworks & Drivers (React, FastAPI, Postgres) |
  |      +-----------------------------------+      |
  |      | Adapters (Controllers, Repos)     |      |
  |      |      +---------------------+      |      |
  |      |      | Use Cases/Services  |      |      |
  |      |      |      +-------+      |      |      |
  |      |      |      | Pure  |      |      |      |
  |      |      |      | Domain|      |      |      |
  |      |      |      +-------+      |      |      |
  |      |      +---------------------+      |      |
  |      +-----------------------------------+      |
  +-------------------------------------------------+
__BTT__

## 5. Step-by-Step Implementation
1. **Map the Domain**: Define the entities, value objects, and business formulas.
2. **Build Use Cases**: Write core services that coordinates calculations and data flows.
3. **Implement Adapters**: Create database-specific repositories and HTTP router schemas.
4. **Inject Dependencies**: Bind interfaces to implementations using dependency injection.

## 6. Repository Standards
- Keep business logic fully isolated; services must never import database drivers or framework-specific routers directly.
- Standardize folder layouts using a feature-first organization model.

## 7. Examples

### Clean Architecture Core Domain Service
__BTT__python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class MatchResult(BaseModel):
    id: int
    home_score: int
    away_score: int

class IMatchRepository(ABC):
    @abstractmethod
    async def get_by_id(self, match_id: int) -> MatchResult | None:
        pass

class MatchEvaluatorService:
    """Pure domain service that does not import database frameworks."""

    def __init__(self, repo: IMatchRepository) -> None:
        self.repo = repo

    async def get_winner(self, match_id: int) -> str:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise ValueError("Match not found")
        if match.home_score > match.away_score:
            return "HOME"
        elif match.away_score > match.home_score:
            return "AWAY"
        return "DRAW"
__BTT__

## 8. Best Practices
- Program against interface abstractions, not concrete class implementations.
- Separate high-frequency timeseries read models from relational portfolio edit operations.

## 9. Anti-patterns
- **Circular Imports**: Importing prediction models inside the portfolio module and vice-versa, creating circular dependencies.

## 10. Security Considerations
- Enforce secure access boundaries; ensure the frontend never communicates directly with database engines.

## 11. Performance Considerations
- Isolate heavy analytical computations from main HTTP threads to keep user interactions snappy.

## 12. Testing Strategy
- Write pure unit tests for domain business logic without requiring database or live service mocks.

## 13. Review Checklist
- [ ] Is business domain logic free of framework-specific annotations and dependencies?
- [ ] Are interfaces used to decouple adapters from services?

## 14. Common Mistakes
- Hardcoding specific database tools inside domain models, which couples business logic to database technology.

## 15. Future Improvements
- Move core domain calculations to compiled WASM packages to share exact execution logic across client and server.

## 16. Revision History
- **v1.0.0**: Established unified platform architecture conventions.

## 17. Related References
- Skills: [Backend](backend.md), [Clean Architecture](clean-architecture.md)
- Rules: [Architecture Rules](../rules/architecture-rules.md)
`);

// 16. machine-learning.md
writeFile('.ai/skills/machine-learning.md', `# 🧠 Machine Learning Engineering Standards

## 1. Purpose
To define strict guidelines for training, validating, calibrating, and serving sports prediction ML models without risk of lookahead bias.

## 2. When to Use
- Building team form predictors, expected goals estimators, or live odds adjustment algorithms.

## 3. When NOT to Use
- Writing static database rules or pure, deterministic mathematical models.

## 4. Architecture
Our ML pipeline processes historical matches chronologically, calibrates predictions, and stores weights:
__BTT__mermaid
graph TD
    Data[Raw Database Timeseries] --> Feat[Feature Store Generator]
    Feat --> Split[Strict Chronological Train/Val Split]
    Split --> Model[LGBM / XGBoost Classifier]
    Model --> Calib[Platt Scaling Calibration CV]
    Calib --> Save[Model Asset Weight Store]
__BTT__

## 5. Step-by-Step Implementation
1. **Chronological Splitting**: Partition data chronologically (never randomly) to eliminate lookahead bias.
2. **Feature Generation**: Compute lagged rolling variables using past records only.
3. **Train & Tune**: Train classifiers and evaluate log-loss benchmarks.
4. **Calibrate**: Scale probabilities using Platt Scaling (Sigmoid) or Isotonic regression to ensure accuracy.

## 6. Repository Standards
- Minimum validation standard: Out-of-sample log-loss must remain below 0.62.
- Calibration validation ($R^2$) must be greater than 0.92 before deployment.

## 7. Examples

### Chronological Train-Val Split with Platt Scaling Calibration
__BTT__python
import pandas as pd
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from lightgbm import LGBMClassifier

def run_calibrated_pipeline(df: pd.DataFrame) -> CalibratedClassifierCV:
    """Trains and calibrates a sports prediction model chronologically."""
    # Ensure correct chronological ordering
    df = df.sort_values("match_date").reset_index(drop=True)
    
    # Chronological Split: Train on past, validate on future
    split_idx = int(len(df) * 0.8)
    train_df = df.iloc[:split_idx]
    val_df = df.iloc[split_idx:]
    
    features = ["rolling_xg", "team_elo_diff", "rest_days_diff"]
    target = "home_win"
    
    X_train, y_train = train_df[features], train_df[target]
    
    # Initialize base classifier
    base_clf = LGBMClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    
    # Use Sigmoid Platt Scaling across chronological folds
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X_train, y_train)
    
    return calibrated_clf
__BTT__

## 8. Best Practices
- Verify feature values never leak future info (e.g. including goals scored in the current match).
- Save serialized model models cleanly inside standard folders with version tags.

## 9. Anti-patterns
- **Random Split on Timeseries**: Splitting sports data randomly across dates, causing lookahead leakage.

## 10. Security Considerations
- Validate incoming live features against schema definitions before pushing them to inference runtimes.

## 11. Performance Considerations
- Use sparse matrix structures where appropriate to reduce memory footprint.

## 12. Testing Strategy
- Implement automated tests that verify prediction arrays sum to 1.0 (Home + Draw + Away).

## 13. Review Checklist
- [ ] Is training split chronologically by match dates?
- [ ] Does the model's calibration curve pass the $R^2 > 0.92$ threshold?

## 14. Common Mistakes
- Relying on raw model scores for financial Kelly allocations instead of calibrated probabilities.

## 15. Future Improvements
- Implement automated feature drift triggers that start a retraining run when feature distributions shift.

## 16. Revision History
- **v1.0.0**: Outlined strict ML standards and calibration.

## 17. Related References
- Skills: [XGBoost](xgboost.md), [LightGBM](lightgbm.md)
- Rules: [ML Rules](../rules/ml-rules.md)
`);

// 17. xgboost.md
writeFile('.ai/skills/xgboost.md', `# 🧠 XGBoost Implementation Standards

## 1. Purpose
To define the setup and tuning standards for XGBoost predictive classifiers in the platform.

## 2. When to Use
- Classifying binary or multi-class sports match outcomes using highly non-linear feature sets.

## 3. When NOT to Use
- Working with sparse text datasets or modeling simple, linear trend sequences.

## 4. Architecture
XGBoost forms an ensemble of weak trees sequentially, minimizing objective losses through gradient descent:
__BTT__
[ Features ] -> [ Tree 0 (Base) ] -> [ Tree 1 (Residuals) ] -> [ Ensemble Logits ]
__BTT__

## 5. Step-by-Step Implementation
1. **Format Input**: Convert Pandas dataframes to highly optimized XGBoost \`DMatrix\` structures.
2. **Configure Hyperparameters**: Set appropriate regularization (lambda, alpha) to prevent overfitting.
3. **Train with Early Stopping**: Monitor out-of-sample log-loss and halt training when validation progress stops.

## 6. Repository Standards
- Always log evaluation log-loss metrics at each training epoch.
- Set random seeds globally to ensure training runs are reproducible.

## 7. Examples

### Reproducible XGBoost Model Training with Early Stopping
__BTT__python
import xgboost as xgb
import pandas as pd
from typing import Dict, Any

def train_xgboost_classifier(
    train_df: pd.DataFrame, 
    val_df: pd.DataFrame, 
    features: list, 
    target: str
) -> xgb.Booster:
    """Trains an XGBoost model with early stopping and explicit regularization."""
    
    dtrain = xgb.DMatrix(train_df[features], label=train_df[target])
    dval = xgb.DMatrix(val_df[features], label=val_df[target])
    
    params: Dict[str, Any] = {
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "max_depth": 5,
        "eta": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "lambda": 1.5,  # L2 regularization
        "alpha": 0.1,    # L1 regularization
        "seed": 42
    }
    
    evallist = [(dtrain, "train"), (dval, "val")]
    
    # Train booster with early stopping limit of 10 epochs
    booster = xgb.train(
        params,
        dtrain,
        num_boost_round=500,
        evals=evallist,
        early_stopping_rounds=10,
        verbose_eval=False
    )
    
    return booster
__BTT__

## 8. Best Practices
- Limit maximum tree depths to 6 to prevent model overfitting.
- Always check feature importances to verify the model does not rely on leaked attributes.

## 9. Anti-patterns
- Setting high learning rates without early stopping limits, leading to rapid overfitting.

## 10. Security Considerations
- Sanitize and format data inputs before passing them to compiled model engines.

## 11. Performance Considerations
- Use CPU multi-threading parameters (\`n_jobs=-1\`) during hyperparameter optimization sweeps.

## 12. Testing Strategy
- Write regression tests confirming that identical feature inputs return matching predictions.

## 13. Review Checklist
- [ ] Are training limits backed by an early stopping condition?
- [ ] Is L1/L2 regularization configured in hyperparameter maps?

## 14. Common Mistakes
- Omitting validation evaluations during training, leading to unverified models.

## 15. Future Improvements
- Move inference loops to compiled TensorRT runtimes for faster prediction speeds.

## 16. Revision History
- **v1.0.0**: Defined baseline XGBoost training configurations.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [LightGBM](lightgbm.md)
`);

// 18. lightgbm.md
writeFile('.ai/skills/lightgbm.md', `# 🧠 LightGBM Implementation Standards

## 1. Purpose
To define the setup and tuning standards for LightGBM models in our analytics platform.

## 2. When to Use
- Training predictive models on tabular data with categorical variables.

## 3. When NOT to Use
- Working with small datasets (under 1,000 rows) where simpler algorithms are more stable.

## 4. Architecture
LightGBM uses leaf-wise (best-first) tree growth, accelerating training compared to level-wise approaches:
__BTT__
   [ Leaf Growth Style ]
       /           \\
 [ Splitting ]     [ Splitting ]  (Deeper on high-gradient leaves)
__BTT__

## 5. Step-by-Step Implementation
1. **Initialize Dataset**: Wrap inputs in LightGBM's optimized \`Dataset\` structures.
2. **Handle Categorical Fields**: Identify categorical columns explicitly to leverage LightGBM's native encoding.
3. **Train with Validation**: Monitor training progress and halt early if log-loss performance flattens.

## 6. Repository Standards
- Always declare categorical column names explicitly in model setups.
- Set random seeds globally to ensure reproducible results.

## 7. Examples

### Standard LightGBM Training Configuration
__BTT__python
import lightgbm as lgb
import pandas as pd
from typing import List

def train_lightgbm_model(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    features: List[str],
    categorical_features: List[str],
    target: str
) -> lgb.Booster:
    """Trains a LightGBM booster with categorical feature mapping."""
    
    train_data = lgb.Dataset(
        train_df[features], 
        label=train_df[target],
        categorical_feature=categorical_features
    )
    val_data = lgb.Dataset(
        val_df[features], 
        label=val_df[target],
        reference=train_data
    )
    
    params = {
        "objective": "binary",
        "metric": "binary_logloss",
        "boosting_type": "gbdt",
        "learning_rate": 0.03,
        "num_leaves": 31,
        "min_data_in_leaf": 20,
        "feature_fraction": 0.8,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "seed": 42,
        "verbose": -1
    }
    
    # Train with early stopping limit of 15 epochs
    booster = lgb.train(
        params,
        train_data,
        num_boost_round=1000,
        valid_sets=[train_data, val_data],
        callbacks=[lgb.early_stopping(stopping_rounds=15, verbose=False)]
    )
    
    return booster
__BTT__

## 8. Best Practices
- Use categorical attributes natively rather than applying manual one-hot encoding schemes.
- Clip learning rates to a range between 0.01 and 0.05 for optimal convergence.

## 9. Anti-patterns
- **Level-wise over-parameterization**: Setting very deep leaf boundaries on small datasets, causing rapid overfitting.

## 10. Security Considerations
- Sanitize incoming inputs before processing them inside compiled model libraries.

## 11. Performance Considerations
- Save datasets to binary files to speed up reloading of large timeseries structures.

## 12. Testing Strategy
- Assert that validation loss decreases sequentially over the first 5 epochs of training.

## 13. Review Checklist
- [ ] Are categorical columns explicitly declared inside dataset loaders?
- [ ] Do learning rate and leaf parameters align with recommended limits?

## 14. Common Mistakes
- Passing unstructured string variables to dataset constructors without declaring them as categorical fields.

## 15. Future Improvements
- Move feature generation pipelines to compiled C++ wrappers to speed up high-frequency processing.

## 16. Revision History
- **v1.0.0**: Baseline LightGBM configurations defined.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [XGBoost](xgboost.md)
`);

// 19. catboost.md
writeFile('.ai/skills/catboost.md', `# 🧠 CatBoost Implementation Standards

## 1. Purpose
To establish performance standards and setup guidelines for CatBoost classifiers within the platform.

## 2. When to Use
- Building sports prediction models with complex, highly-cardinal categorical features (e.g. referee IDs, stadium names).

## 3. When NOT to Use
- Working with pure numeric timeseries datasets with zero categorical variables (prefer LightGBM or XGBoost).

## 4. Architecture
CatBoost uses symmetric trees to speed up CPU evaluation and handles categorical variables natively via target statistics:
__BTT__
[ Cat Features ] -> [ Ordered Boosting Target Statistics ] -> [ Symmetric Balanced Trees ]
__BTT__

## 5. Step-by-Step Implementation
1. **Initialize Data Pool**: Load data using CatBoost's optimized \`Pool\` structures.
2. **Define Categorical Keys**: Mark categorical indices explicitly inside Pool wrappers.
3. **Train with Overfit Detector**: Monitor out-of-sample log-loss and apply early stopping limits.

## 6. Repository Standards
- Always set random seeds globally to ensure training runs are reproducible.
- Keep validation metrics logs clear of trace noise.

## 7. Examples

### Standard CatBoost Training and Feature Mapping
__BTT__python
from catboost import CatBoostClassifier, Pool
import pandas as pd
from typing import List

def train_catboost_classifier(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    features: List[str],
    cat_features: List[str],
    target: str
) -> CatBoostClassifier:
    """Trains a symmetric CatBoost classifier with categorical features."""
    
    train_pool = Pool(train_df[features], train_df[target], cat_features=cat_features)
    val_pool = Pool(val_df[features], val_df[target], cat_features=cat_features)
    
    model = CatBoostClassifier(
        iterations=500,
        learning_rate=0.05,
        depth=6,
        loss_function="Logloss",
        eval_metric="Logloss",
        random_seed=42,
        od_type="Iter",  # Overfitting detector type
        od_wait=15,      # Wait epochs before early stopping
        verbose=False
    )
    
    model.fit(train_pool, eval_set=val_pool, use_best_model=True)
    return model
__BTT__

## 8. Best Practices
- Rely on CatBoost's native categorical encoding instead of applying manual label encoders.
- Keep tree depths at or below 6 to maintain fast inference speeds.

## 9. Anti-patterns
- Pre-encoding categorical features manually prior to passing datasets to CatBoost wrappers.

## 10. Security Considerations
- Validate all incoming categorical values against a whitelist schema before running inference.

## 11. Performance Considerations
- Save compiled model assets to raw serialized files to minimize loading latency.

## 12. Testing Strategy
- Verify that inference runs return valid probability distributions (summing to 1.0).

## 13. Review Checklist
- [ ] Are categorical indexes explicitly declared?
- [ ] Is the overfit detector configured with clear early stopping parameters?

## 14. Common Mistakes
- Leaving high cardinality features (like match IDs) inside pool definitions, causing slower training.

## 15. Future Improvements
- Implement GPU training sweeps for rapid hyperparameter optimizations on large datasets.

## 16. Revision History
- **v1.0.0**: Standardized CatBoost training configurations.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [LightGBM](lightgbm.md)
`);

// 20. pytorch.md
writeFile('.ai/skills/pytorch.md', `# 🧠 PyTorch Neural Network Standards

## 1. Purpose
To define development standards for deep neural networks, sequence models, and custom embedding layers using PyTorch.

## 2. When to Use
- Implementing neural sports predictors, sequential match state LSTMs, or embeddings for teams and players.

## 3. When NOT to Use
- Working with simple tabular timeseries datasets (prefer gradient boosted tree models).

## 4. Architecture
Our PyTorch models compile structural inputs into highly parallel neural tensor graphs:
__BTT__
[ Input Tensor ] -> [ Linear / Embedding Block ] -> [ Non-Linear Layer ] -> [ Loss Function Optimizer ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Dataset**: Build custom dataset classes subclassing PyTorch's native \`Dataset\` interface.
2. **Setup Modules**: Structure network blocks using \`nn.Module\`, keeping parameters configurable.
3. **Write Training Loop**: Build loops that handle gradient calculation, parameter updates, and validation checks.
4. **Serialize Models**: Save trained model parameters cleanly using state dictionaries.

## 6. Repository Standards
- Always declare and handle target hardware devices explicitly (\`cuda\`, \`mps\`, or \`cpu\`).
- Implement gradient clipping to prevent exploding gradient issues inside sequential models.

## 7. Examples

### Modular PyTorch Network and Structured Training Loop
__BTT__python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class MatchDataset(Dataset):
    def __init__(self, features: torch.Tensor, targets: torch.Tensor) -> None:
        self.features = features
        self.targets = targets

    def __len__(self) -> int:
        return len(self.features)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.features[idx], self.targets[idx]

class TeamEmbeddingPredictor(nn.Module):
    def __init__(self, num_teams: int, embedding_dim: int, num_features: int) -> None:
        super().__init__()
        self.team_emb = nn.Embedding(num_teams, embedding_dim)
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim * 2 + num_features, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, home_idx: torch.Tensor, away_idx: torch.Tensor, feats: torch.Tensor) -> torch.Tensor:
        home_embedded = self.team_emb(home_idx)
        away_embedded = self.team_emb(away_idx)
        x = torch.cat([home_embedded, away_embedded, feats], dim=1)
        return self.fc(x)
__BTT__

## 8. Best Practices
- Always configure dropout layers to prevent neural network overfitting.
- Track gradient scales and performance metrics dynamically using central monitoring tools.

## 9. Anti-patterns
- **Memory Leakage**: Forgetting to use \`torch.no_grad()\` during validation and inference, which consumes unnecessary GPU memory.

## 10. Security Considerations
- Sanitize saved model files before loading to prevent malicious code execution from untrusted sources.

## 11. Performance Considerations
- Pin memory on DataLoader streams to accelerate host-to-device data transfers.

## 12. Testing Strategy
- Write unit tests verifying that output tensor shapes match target configurations across different batch sizes.

## 13. Review Checklist
- [ ] Are dropout layers disabled during validation and testing operations (\`model.eval()\` called)?
- [ ] Are gradients properly cleared at each training iteration?

## 14. Common Mistakes
- Forgetting to call \`zero_grad()\` before backpropagation, which accumulates gradients across steps.

## 15. Future Improvements
- Implement ONNX compilation exports to deploy models to high-throughput inference runtimes.

## 16. Revision History
- **v1.0.0**: Established core PyTorch coding standards.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md)
`);

// 21. feature-engineering.md
writeFile('.ai/skills/feature-engineering.md', `# 📊 Sports Analytics Feature Engineering

## 1. Purpose
To outline standards for generating sports predictive attributes, maintaining mathematical correctness, and eliminating lookahead bias.

## 2. When to Use
- Designing database models or generating inputs for match winner prediction algorithms.

## 3. When NOT to Use
- Writing static client-side form styling rules.

## 4. Architecture
Our feature store takes raw timeseries records and calculates rolling mathematical attributes:
__BTT__
[ Raw Database Records ] -> [ Chronological Aggregation ] -> [ Rolling Feature Vector ] -> [ ML Input ]
__BTT__

## 5. Step-by-Step Implementation
1. **Sort Records**: Order all source records chronologically by timestamp.
2. **Apply Windows**: Compute rolling metrics using past data windows (e.g. past 5 matches).
3. **Validate Boundary**: Ensure variables are only computed using matches completed before the target date.

## 6. Repository Standards
- All rolling timeseries feature functions must pass lookahead testing checks.
- Store calculations as clean, indexed databases.

## 7. Examples

### Lookahead-Safe Rolling Expected Goals (xG) Calculation
__BTT__python
import pandas as pd
import numpy as np

def compute_safe_rolling_xg(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Computes lookahead-safe rolling averages for team expected goals (xG)."""
    # Sort chronologically by date to preserve temporal order
    df = df.sort_values("match_date").reset_index(drop=True)
    
    # Calculate rolling metrics using completed matches only (shift to avoid lookahead)
    df["home_rolling_xg"] = (
        df.groupby("home_team")["home_xg"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
    )
    df["away_rolling_xg"] = (
        df.groupby("away_team")["away_xg"]
        .transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
    )
    
    # Handle missing values for teams with no prior match history
    df["home_rolling_xg"] = df["home_rolling_xg"].fillna(1.0)
    df["away_rolling_xg"] = df["away_rolling_xg"].fillna(1.0)
    
    return df
__BTT__

## 8. Best Practices
- Shift rolling calculations by 1 step to ensure match results are not leaked into their own prediction inputs.
- Keep rolling windows configurable inside system configuration settings.

## 9. Anti-patterns
- **Lookahead Leakage**: Using rolling operations without a shift, which leaks current-game results into current-game predictions.

## 10. Security Considerations
- Sanitize inputs to feature stores, ensuring malicious users cannot alter historical match records.

## 11. Performance Considerations
- Use vector operations inside pandas or numpy to optimize rolling timeseries computations.

## 12. Testing Strategy
- Write unit tests confirming that current match performance has zero impact on past features.

## 13. Review Checklist
- [ ] Are all rolling window operations shifted to prevent lookahead bias?
- [ ] Are missing values handled cleanly for teams with no prior history?

## 14. Common Mistakes
- Computing rolling statistics across mixed home/away contexts without grouping by specific team columns.

## 15. Future Improvements
- Integrate event-stream parsing to capture live match-day team performance changes.

## 16. Revision History
- **v1.0.0**: Outlined safe sports feature engineering standards.

## 17. Related References
- Skills: [Sports Prediction](sports-prediction.md), [Statistics](statistics.md)
- Rules: [ML Rules](../rules/ml-rules.md)
`);

// 22. sports-prediction.md
writeFile('.ai/skills/sports-prediction.md', `# ⚽ Sports Analytics Prediction Models

## 1. Purpose
To outline statistical patterns, probability structures, and forecasting models for soccer match predictions.

## 2. When to Use
- Implementing Poisson processes, ELO rating updates, or Monte Carlo goal simulation models.

## 3. When NOT to Use
- Writing static database schemas or standard layout configurations.

## 4. Architecture
Our prediction pipeline calculates team offensive and defensive strengths, converting ratings to outcome probabilities:
__BTT__
[ Team Strengths (ELO) ] -> [ Bivariate Poisson Engine ] -> [ Score Distributions ] -> [ Clean Probabilities ]
__BTT__

## 5. Step-by-Step Implementation
1. **Calculate Team ELO**: Update team performance ratings using historical goal differences and rest factors.
2. **Apply Poisson Models**: Model goal distributions for both teams using independent or bivariate Poisson calculations.
3. **Simulate Outcomes**: Run Monte Carlo iterations or evaluate probability distributions to get Home-Draw-Away percentages.

## 6. Repository Standards
- Ensure all predicted probability vectors sum strictly to 1.0.
- All models must support out-of-sample log-loss evaluation checks.

## 7. Examples

### Poisson soccer Goal Distribution Model
__BTT__python
import numpy as np
from scipy.stats import poisson
from typing import Dict, Tuple

def predict_match_probabilities(
    home_attack: float, 
    home_defense: float, 
    away_attack: float, 
    away_defense: float,
    max_goals: int = 10
) -> Tuple[float, float, float]:
    """Calculates Home-Draw-Away probabilities using independent Poisson goal distributions."""
    
    # Calculate lambda parameters (expected goals) for home and away teams
    lambda_home = home_attack * away_defense
    lambda_away = away_attack * home_defense
    
    # Generate probability matrices
    goals_home = [poisson.pmf(i, lambda_home) for i in range(max_goals)]
    goals_away = [poisson.pmf(i, lambda_away) for i in range(max_goals)]
    
    prob_matrix = np.outer(goals_home, goals_away)
    
    # Sum matrix regions to compute match outcome probabilities
    prob_home_win = float(np.sum(np.triu(prob_matrix, k=1)))
    prob_draw = float(np.sum(np.diag(prob_matrix)))
    prob_away_win = float(np.sum(np.tril(prob_matrix, k=-1)))
    
    # Re-normalize to ensure sum is exactly 1.0 (Home + Draw + Away)
    total = prob_home_win + prob_draw + prob_away_win
    return prob_home_win / total, prob_draw / total, prob_away_win / total
__BTT__

## 8. Best Practices
- Model expected goals (xG) instead of raw actual goals scored to reduce variance in team ratings.
- Adjust Poisson models for low-scoring matches to handle the typical correlation in 0-0 and 1-1 scorelines.

## 9. Anti-patterns
- **Linear Regression on Scores**: Using standard linear models to predict goal scores, which ignores the count-based nature of goals.

## 10. Security Considerations
- Enforce strict parameter validation; team strength parameters must always remain positive.

## 11. Performance Considerations
- Pre-calculate expected goal matrices using vectorized matrix multipliers instead of nested loops.

## 12. Testing Strategy
- Assert that model outputs match expected outputs on equal baseline conditions (should return symmetric Home/Away win rates).

## 13. Review Checklist
- [ ] Do predicted probabilities sum to exactly 1.0?
- [ ] Are Poisson lambda parameters strictly greater than 0.0?

## 14. Common Mistakes
- Forgetting to normalize simulated probability vectors, leading to mathematical inconsistencies downstream.

## 15. Future Improvements
- Implement player-level rating maps to capture performance changes when key players are rested or injured.

## 16. Revision History
- **v1.0.0**: Defined soccer prediction model guidelines.

## 17. Related References
- Skills: [Feature Engineering](feature-engineering.md), [Statistics](statistics.md)
`);

// 23. statistics.md
writeFile('.ai/skills/statistics.md', `# 📊 Statistical Mathematics & Analytics

## 1. Purpose
To define the core standards for statistical analysis, regression modeling, and probability calibrations.

## 2. When to Use
- Evaluating confidence bounds, training Bayesian updates, or assessing model performance metrics.

## 3. When NOT to Use
- Writing basic system logs or standard API route setups.

## 4. Architecture
Our statistics library provides verified, highly stable mathematical functions to upstream predictors:
__BTT__
[ Raw Models Outputs ] -> [ Platt Scaling / Isotonic ] -> [ Calibrated Probabilities ] -> [ Sizer ]
__BTT__

## 5. Step-by-Step Implementation
1. **Process Inputs**: Format incoming prediction arrays.
2. **Apply Calibration**: Run Platt Scaling (logistic curves) to correct model over/under-confidence.
3. **Compute Metrics**: Calculate log-loss and Brier scores to track probability calibration.

## 6. Repository Standards
- Mathematical calculations must utilize double-precision floating-point numbers.
- Avoid external API calls inside math functions to keep operations fast.

## 7. Examples

### Calculation of Log-Loss and Brier Score
__BTT__python
import numpy as np
from typing import List

def calculate_log_loss(y_true: List[int], y_prob: List[float]) -> float:
    """Computes lookahead-free out-of-sample log-loss for prediction evaluation."""
    y_t = np.array(y_true)
    y_p = np.clip(np.array(y_prob), 1e-15, 1 - 1e-15)  # Avoid log(0)
    return -float(np.mean(y_t * np.log(y_p) + (1 - y_t) * np.log(1 - y_p)))

def calculate_brier_score(y_true: List[int], y_prob: List[float]) -> float:
    """Computes Brier score to evaluate the calibration of predicted probabilities."""
    return float(np.mean((np.array(y_true) - np.array(y_prob)) ** 2))
__BTT__

## 8. Best Practices
- Always apply numerical clipping limits to prevent infinite log calculations on 0.0 or 1.0 probabilities.
- Use out-of-sample datasets to evaluate all performance metrics.

## 9. Anti-patterns
- **Evaluation on Training Sets**: Scoring model accuracy metrics on training data, which masks model overfitting.

## 10. Security Considerations
- Limit input boundaries; validate that probabilities fall strictly within the [0, 1] range.

## 11. Performance Considerations
- Use vectorized numpy operations to calculate metrics on large datasets efficiently.

## 12. Testing Strategy
- Write unit tests confirming that perfect predictions return a log-loss score of exactly 0.0.

## 13. Review Checklist
- [ ] Are logs guarded against \`log(0)\` errors using explicit clipping limits?
- [ ] Are Brier score outputs mathematically bounded between 0.0 and 1.0?

## 14. Common Mistakes
- Omitting epsilon clipping parameters, which causes runtime errors when log calculations encounter 0 or 1.

## 15. Future Improvements
- Integrate Bayesian probability updates to adjust team ratings in real time as match events unfold.

## 16. Revision History
- **v1.0.0**: Established standard mathematical evaluation metrics.

## 17. Related References
- Skills: [Sports Prediction](sports-prediction.md), [Value Betting](value-betting.md)
`);

// 24. value-betting.md
writeFile('.ai/skills/value-betting.md', `# 📈 Value Betting Strategy & Edge Calculations

## 1. Purpose
To establish core standards for identifying value opportunities by comparing model probabilities against bookmaker odds.

## 2. When to Use
- Implementing real-time odds comparison pipelines, finding mathematical edges, or building betting slip generators.

## 3. When NOT to Use
- Writing background scraping rules or visual UI components.

## 4. Architecture
Our value betting finder filters bookmaker overrounds and highlights profitable opportunities:
__BTT__
[ Live Bookmaker Odds ] -> [ Overround Removal Engine ] -> [ Edge Comparator ] -> [ Value List ]
__BTT__

## 5. Step-by-Step Implementation
1. **Remove Overround**: Calculate fair probabilities from raw bookmaker odds using margin removal models (e.g., multiplicative, shin).
2. **Calculate Edge**: Compare model probabilities with bookmaker decimal odds to identify value edges.
3. **Filter Opportunities**: Filter list to highlight matches with positive, mathematically profitable value edges.

## 6. Repository Standards
- The calculated value edge must be strictly positive ($Edge > 0.0$) to qualify as a value bet.
- Maintain full audit trails of historical bookmaker odds and model probabilities for backtesting.

## 7. Examples

### Margin Removal and Value Edge Calculation
__BTT__python
from typing import Dict, Tuple

def calculate_value_edge(
    odds_home: float,
    odds_draw: float,
    odds_away: float,
    model_prob_home: float
) -> Tuple[float, float]:
    """Calculates margin-removed fair odds and the resulting value betting edge."""
    # Compute the bookmaker overround (margin)
    overround = (1.0 / odds_home) + (1.0 / odds_draw) + (1.0 / odds_away)
    
    # Calculate fair odds by removing the margin proportionally
    fair_odds_home = odds_home * overround
    
    # Compare model probability to bookmaker odds to find the value edge
    # Formula: Edge = (Bookmaker Odds * Model Probability) - 1.0
    edge_home = (odds_home * model_prob_home) - 1.0
    
    return fair_odds_home, edge_home
__BTT__

## 8. Best Practices
- Apply margin removal models (like Shin or Power methods) on high-margin soccer betting lines.
- Filter out matches with extremely high overrounds (e.g. overround > 1.15) to avoid highly inefficient markets.

## 9. Anti-patterns
- **Ignoring Margin**: Comparing model probabilities directly to raw bookmaker odds without accounting for overround margins.

## 10. Security Considerations
- Validate odds values; decimal odds must be strictly greater than 1.0.

## 11. Performance Considerations
- Run odds comparisons in-memory to keep execution fast during high-frequency live events.

## 12. Testing Strategy
- Assert that under equal conditions (fair odds match model probabilities), the calculated value edge is exactly 0.0.

## 13. Review Checklist
- [ ] Are input decimal odds strictly greater than 1.0?
- [ ] Is the overround calculation verified before computing edges?

## 14. Common Mistakes
- Misinterpreting bookmaker margins, leading to incorrect calculations and artificial value signals.

## 15. Future Improvements
- Model odds movement speeds to predict and capture value opportunities before bookmakers adjust their lines.

## 16. Revision History
- **v1.0.0**: Standardized margin removal and value edge calculations.

## 17. Related References
- Skills: [Bankroll Management](bankroll.md), [Statistics](statistics.md)
- Rules: [Database Rules](../rules/database-rules.md)
`);

// 25. bankroll.md
writeFile('.ai/skills/bankroll.md', `# 💰 Bankroll Management & Sizing Systems

## 1. Purpose
To establish mathematical guidelines for bankroll allocation, risk mitigation, and Kelly Criterion calculations.

## 2. When to Use
- Determining optimal stake sizes for portfolio allocations or managing single-match risks.

## 3. When NOT to Use
- Writing raw database models or static UI layouts.

## 4. Architecture
Our bankroll management engine evaluates value edges and applies risk rules to calculate optimal, safe stakes:
__BTT__
[ Value Edge & Odds ] -> [ Kelly Criterion Formula ] -> [ Fractional Sizing Sizer ] -> [ Safe Stake ]
__BTT__

## 5. Step-by-Step Implementation
1. **Kelly Fraction**: Calculate the raw Kelly stake percentage using match odds and model probabilities.
2. **Fractional Scaling**: Scale raw stakes using a fractional coefficient (e.g., quarter-Kelly) to reduce portfolio volatility.
3. **Risk Clamping**: Clamp final stakes strictly below the system's maximum allocation limit (5.0%).

## 6. Repository Standards
- High-priority constraint: The absolute maximum stake allocation per match is capped strictly at 5.0% ($0.05$).
- The system must reject allocations when model probabilities indicate a negative value edge.

## 7. Examples

### Fractional Kelly Sizing with Strict Sizing Clamps
__BTT__python
def calculate_kelly_stake(
    decimal_odds: float,
    model_prob: float,
    risk_coeff: float = 0.25,  # Quarter-Kelly standard
    max_stake_pct: float = 0.05  # Strict platform cap (5%)
) -> float:
    """Calculates lookahead-safe, risk-clamped fractional Kelly stake allocations."""
    if decimal_odds <= 1.0:
        return 0.0
        
    # Standard Kelly formula: f = (b * p - q) / b where b = odds - 1, q = 1 - p
    b = decimal_odds - 1.0
    p = model_prob
    q = 1.0 - p
    
    raw_kelly = (b * p - q) / b
    
    # Reject allocation if no edge exists
    if raw_kelly <= 0.0:
        return 0.0
        
    # Apply fractional Kelly scaling to reduce volatility
    scaled_kelly = raw_kelly * risk_coeff
    
    # Clamp final stake to stay strictly below the maximum system limit (5%)
    final_stake = min(scaled_kelly, max_stake_pct)
    
    return float(final_stake)
__BTT__

## 8. Best Practices
- Default to conservative fractional settings (like quarter-Kelly or eighth-Kelly) to protect against model uncertainty.
- Audit bankroll drawdown rates regularly using historical transaction logs.

## 9. Anti-patterns
- **Full Kelly Allocations**: Using unscaled Kelly calculations, which exposes the portfolio to severe drawdown risk.

## 10. Security Considerations
- Guard bankroll calculations; verify input variables cannot be manipulated to generate oversized stakes.

## 11. Performance Considerations
- Perform Kelly allocations in-memory during real-time betting cycles to minimize latency.

## 12. Testing Strategy
- Write parameterized unit tests verifying that stakes are correctly clamped below 5.0% even with extreme inputs.

## 13. Review Checklist
- [ ] Is the final allocation capped strictly below the 5.0% platform limit?
- [ ] Are negative edges handled correctly, returning an allocation of 0.0%?

## 14. Common Mistakes
- Miscalculating the decimal odds base variable, leading to incorrect Kelly stakes and excessive risk exposure.

## 15. Future Improvements
- Integrate correlated portfolio risk models to adjust stakes when betting on multiple matches in the same league.

## 16. Revision History
- **v1.0.0**: Standardized risk-clamped bankroll allocation formulas.

## 17. Related References
- Skills: [Value Betting](value-betting.md), [Statistics](statistics.md)
`);

// 26. api-design.md
writeFile('.ai/skills/api-design.md', `# 🌐 RESTful API Design & Versioning Standards

## 1. Purpose
To establish consistent, scalable, and secure API patterns across all platform services.

## 2. When to Use
- Exposing microservice endpoints, designing payloads, and routing requests to the Gateway.

## 3. When NOT to Use
- Designing database schemas or local component utility helper functions.

## 4. Architecture
__BTT__
[ React Client ] ---> [ HTTP/S /api/v1/... ] ---> [ API Gateway / Router ] ---> [ Core DTOs ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Route Hierarchy**: Follow plural resource nouns (e.g., \`/api/v1/matches\`).
2. **Standardize Responses**: Return unified JSON objects with pagination and success envelopes.
3. **HTTP Status Codes**: Use appropriate status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error).

## 6. Repository Standards
- Version all endpoints with an explicit \`/v1/\` prefix.
- Enforce strict JSON schema validation for all inbound body payloads.

## 7. Examples

### Standard REST API Path Configuration
__BTT__python
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/matches", tags=["matches"])

class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str

@router.get("/{match_id}", response_model=MatchResponse, status_code=status.HTTP_200_OK)
async def get_match_detail(match_id: int):
    # Retrieve match implementation
    return MatchResponse(id=match_id, home_team="Team A", away_team="Team B")
__BTT__

## 8. Best Practices
- Keep endpoints stateless; rely on JWT tokens or session headers for authorization checks.
- Support filters, sorting, and pagination on all collection resources.

## 9. Anti-patterns
- **RPC over REST**: Designing actions in endpoints instead of resource paths (e.g. \`/api/v1/runPrediction\` instead of POST \`/api/v1/predictions\`).

## 10. Security Considerations
- Require HTTPS at all times and implement rate-limiting headers.

## 11. Performance Considerations
- Support gzip compression on large payload returns.

## 12. Testing Strategy
- Run automated schema contract tests using Schemathesis or pytest.

## 13. Review Checklist
- [ ] Do resource routes utilize pluralized nouns?
- [ ] Are all error payloads compliant with standard RFC-7807 problem details?

## 14. Common Mistakes
- Exposing internal database keys directly without DTO translation layers.

## 15. Future Improvements
- Implement GraphQL support for complex data analytics dashboards.

## 16. Revision History
- **v1.0.0**: Defined platform REST API rules.

## 17. Related References
- Skills: [Backend](backend.md)
`);

// 27. async-programming.md
writeFile('.ai/skills/async-programming.md', `# ⚡ Asynchronous Programming Standards

## 1. Purpose
To define the requirements for parallel, non-blocking execution models across backend and frontend tasks.

## 2. When to Use
- Handling heavy network requests, database transactions, background analytics, and Event Loop tasks.

## 3. When NOT to Use
- Writing pure CPU-bound math calculations (where multiprocessing or synchronous libraries are safer).

## 4. Architecture
__BTT__
[ Trigger ] ---> [ Event Loop ] ---> [ Background Worker / Thread Pool ] ---> [ Event Callback ]
__BTT__

## 5. Step-by-Step Implementation
1. **Use async/await**: Replace nested callbacks and raw Promises with clean async constructs.
2. **Prevent Blocking**: Ensure heavy file or I/O calls use non-blocking wrappers.
3. **Concurrency Controls**: Control task concurrency levels using throttled pools.

## 6. Repository Standards
- Always handle execution timeouts to prevent orphaned tasks.
- Avoid nesting async operations without proper error catching blocks.

## 7. Examples

### Concurrency mapping in TypeScript
__BTT__typescript
async function fetchAllBets(betIds: string[]): Promise<any[]> {
  // Use Promise.all to fetch betting records concurrently
  const fetchPromises = betIds.map(async (id) => {
    try {
      const response = await fetch(\`/api/v1/bets/\${id}\`);
      return await response.json();
    } catch (error) {
      console.error(\`Error fetching bet \${id}:\`, error);
      return null;
    }
  });
  return Promise.all(fetchPromises);
}
__BTT__

## 8. Best Practices
- Run network operations in parallel using \`Promise.all\` or concurrent thread runners.
- Always clean up open listeners, timeouts, and WebSocket connections when components unmount.

## 9. Anti-patterns
- **Unbounded Task Spawning**: Creating infinite promises or background threads without queue limiting controls.

## 10. Security Considerations
- Secure thread environments; restrict context sharing across concurrent user tasks.

## 11. Performance Considerations
- Avoid blocking the JavaScript Event Loop or Python's asyncio loop with long-running sync operations.

## 12. Testing Strategy
- Test async pathways using mocked timers and resolved promise queues.

## 13. Review Checklist
- [ ] Are all async triggers backed by timeout rules?
- [ ] Is exception catching implemented on all concurrent task runners?

## 14. Common Mistakes
- Forgetting the \`await\` keyword, leading to incomplete or deferred promise resolutions.

## 15. Future Improvements
- Move to specialized event loops for high-frequency streaming calculations.

## 16. Revision History
- **v1.0.0**: Outlined platform async execution rules.

## 17. Related References
- Skills: [Backend](backend.md), [Frontend](frontend.md)
`);

// 28. clean-architecture.md
writeFile('.ai/skills/clean-architecture.md', `# 🏛️ Clean Architecture Standards

## 1. Purpose
To ensure strict decoupling of business rules, system frameworks, database structures, and UI platforms.

## 2. When to Use
- Building major microservices, defining domain repositories, and establishing system boundaries.

## 3. When NOT to Use
- Writing simple, low-complexity visual components or temporary single-screen scripts.

## 4. Architecture
__BTT__
[ External Frameworks ] ---> [ Adapters / Repositories ] ---> [ Use Cases / Services ] ---> [ Pure Domain Entities ]
__BTT__

## 5. Step-by-Step Implementation
1. **Domain Layer**: Create pure, framework-free business models.
2. **Application Use Cases**: Define system actions and interfaces.
3. **Adapters**: Implement specific database or API gateways.
4. **Dependency Inversion**: Inject external dependencies from the outer rings inward.

## 6. Repository Standards
- Core domain files must not contain database imports or visual component structures.
- All communications across boundaries must use decoupled interface patterns.

## 7. Examples

### Interface decoupling for Match storage
__BTT__python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class MatchDomainModel(BaseModel):
    id: int
    home_team: str
    away_team: str

class IMatchRepository(ABC):
    @abstractmethod
    def save(self, match: MatchDomainModel) -> None:
        pass

class CreateMatchUseCase:
    def __init__(self, repo: IMatchRepository) -> None:
        self.repo = repo

    def execute(self, match: MatchDomainModel) -> None:
        # Core business rule checking
        self.repo.save(match)
__BTT__

## 8. Best Practices
- Restrict logic to its specific architectural ring; never skip layers.
- Depend on interfaces, not implementation details, to maintain flexibility.

## 9. Anti-patterns
- **Leakage of Frameworks**: Importing SQLAlchemy, ORM utilities, or web frameworks directly into pure domain use cases.

## 10. Security Considerations
- Keep authentication and security filters isolated in outer adapter rings.

## 11. Performance Considerations
- Use lightweight translation layers (mappers) when passing objects across layer borders.

## 12. Testing Strategy
- Unit-test use cases in complete isolation using mock repository implementations.

## 13. Review Checklist
- [ ] Are domain entities fully decoupled from database adapters?
- [ ] Do use case classes access resources strictly via interfaces?

## 14. Common Mistakes
- Coupling domain rules directly to specific PostgreSQL schemas, preventing database-agnostic changes.

## 15. Future Improvements
- Implement automated module scanners to detect and flag ring-dependency violations.

## 16. Revision History
- **v1.0.0**: Defined repository clean architecture standards.

## 17. Related References
- Skills: [Backend](backend.md), [DDD](ddd.md)
`);

// 29. clean-code.md
writeFile('.ai/skills/clean-code.md', `# 🧼 Clean Code & Development Standards

## 1. Purpose
To define guidelines for writing legible, self-documenting, and maintainable software.

## 2. When to Use
- Every software commit, feature branch, component design, and routine implementation.

## 3. When NOT to Use
- Never. Clean code standards are mandatory across all files in the ecosystem.

## 4. Architecture
__BTT__
[ Clean Code Principles ] ---> [ High Readability ] ---> [ Low Cognitive Load ] ---> [ High Reliability ]
__BTT__

## 5. Step-by-Step Implementation
1. **Meaningful Names**: Use descriptive, intention-revealing names for variables and classes.
2. **Single Responsibility**: Ensure each function performs exactly one logical operation.
3. **Keep Files Small**: Split large files into smaller, well-scoped modules.
4. **Remove Dead Code**: Delete unused imports, dead blocks, and outdated comments immediately.

## 6. Repository Standards
- Every public function must be documented with clear docstrings.
- Formatting must follow system configurations (Prettier, Ruff, Black).

## 7. Examples

### Clean Refactoring of Sizer function
__BTT__typescript
// 🟢 Good: Clear intent, single responsibility, well-named
export function calculateWinPercentage(wins: number, totalGames: number): number {
  if (totalGames <= 0) {
    return 0;
  }
  return (wins / totalGames) * 100;
}
__BTT__

## 8. Best Practices
- Keep cyclomatic complexity below 10 for all routines.
- Prefer composition over deep, nested class inheritance trees.

## 9. Anti-patterns
- **Comment-Out Abuse**: Committing commented-out dead code blocks to git (delete them; git keeps history).

## 10. Security Considerations
- Clean, readable code makes it easier to spot security flaws and vulnerability gates.

## 11. Performance Considerations
- Well-scoped, modular functions are easier for compilers to optimize and cache.

## 12. Testing Strategy
- Small, single-purpose functions can be unit-tested without complex setups.

## 13. Review Checklist
- [ ] Are variable and function names self-documenting?
- [ ] Is there any commented-out dead code inside the commit files?

## 14. Common Mistakes
- Writing long, monolithic files containing unrelated logic blocks.

## 15. Future Improvements
- Introduce automated cognitive-complexity scanners in PR checks.

## 16. Revision History
- **v1.0.0**: Outlined platform clean code requirements.

## 17. Related References
- Skills: [Architecture](architecture.md), [Refactoring](refactoring.md)
`);

// 30. cqrs.md
writeFile('.ai/skills/cqrs.md', `# ⚡ Command Query Responsibility Segregation (CQRS)

## 1. Purpose
To decouple update operations (Commands) from read operations (Queries) to maximize system scalability and performance.

## 2. When to Use
- Designing highly scalable backends with complex audit trails and high-frequency real-time dashboards.

## 3. When NOT to Use
- Building simple CRUD modules where commands and queries use the same database structures.

## 4. Architecture
__BTT__
                           [ Ingress Layer ]
                             /           \\
             [ Commands (Writes) ]     [ Queries (Reads) ]
                   |                           |
             [ Postgres DB ]             [ High-Speed Cache ]
__BTT__

## 5. Step-by-Step Implementation
1. **Separate Routes**: Define write endpoints completely apart from analytics endpoints.
2. **Command Handlers**: Create handlers to execute state changes and emit event structures.
3. **Query Handlers**: Query direct database views or read-only cache instances.

## 6. Repository Standards
- Commands must return execution status envelopes; they should never return large entity graphs.
- Queries must be strictly read-only and bypass database transaction lock configurations.

## 7. Examples

### CQRS API Routing Structure
__BTT__python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/predictions", tags=["cqrs"])

# Command: Write model input
class CreatePredictionCommand(BaseModel):
    match_id: int
    predicted_home_goals: float

# Query: Read model input
class PredictionSummaryQuery(BaseModel):
    id: int
    match_id: int
    calibrated_prob: float

@router.post("/", status_code=201)
async def submit_prediction(command: CreatePredictionCommand):
    # Process Command mutation
    return {"status": "accepted"}

@router.get("/{prediction_id}", response_model=PredictionSummaryQuery)
async def get_prediction_summary(prediction_id: int):
    # Process Read query (fast read-replica fetch)
    return PredictionSummaryQuery(id=prediction_id, match_id=1, calibrated_prob=0.62)
__BTT__

## 8. Best Practices
- Use database read-replicas for Query handlers and primary databases for Command handlers.
- Design Read queries to match the visual needs of frontend views directly.

## 9. Anti-patterns
- **Transactional Querying**: Locking database tables during heavy read actions.

## 10. Security Considerations
- Apply permission checks on Command mutations while maintaining open access on public Queries.

## 11. Performance Considerations
- Cache query results in Redis with short TTL configurations to handle heavy user traffic.

## 12. Testing Strategy
- Unit-test commands by verifying database mutations, and test queries by checking returned data formats.

## 13. Review Checklist
- [ ] Are query handlers free of state mutation steps?
- [ ] Do Command endpoints return simple success status envelopes instead of large entity models?

## 14. Common Mistakes
- Merging read and write models into a single heavy class, which defeats CQRS optimization goals.

## 15. Future Improvements
- Move to event-driven event sourcing to keep write-command histories accurate.

## 16. Revision History
- **v1.0.0**: Outlined platform CQRS guidelines.

## 17. Related References
- Skills: [Backend](backend.md), [Database Rules](../rules/database-rules.md)
`);

// 31. ddd.md
writeFile('.ai/skills/ddd.md', `# 🧠 Domain-Driven Design (DDD) Standards

## 1. Purpose
To design software models that closely reflect the real-world business domain and rules.

## 2. When to Use
- Designing complex sports betting platforms, portfolio engines, and value systems.

## 3. When NOT to Use
- Developing simple, generic layout utilities, forms, or basic CRUD microservices.

## 4. Architecture
__BTT__
[ Bounded Contexts ] ---> [ Aggregates / Boundaries ] ---> [ Entities & Value Objects ]
__BTT__

## 5. Step-by-Step Implementation
1. **Identify Contexts**: Define clear system boundaries (e.g., Predictions, Bankroll, Analytics).
2. **Create Entities**: Design domain models with stable, unique identities.
3. **Value Objects**: Implement immutable values without distinct identity states.
4. **Aggregate Roots**: Route all external access through designated parent entity gates.

## 6. Repository Standards
- Domain files must use the language of the business domain (Ubiquitous Language).
- State changes on entities must be initiated via explicit domain methods, not generic setters.

## 7. Examples

### Value Object and Entity in Python
__BTT__python
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    """Value object representing currency value."""
    amount: float
    currency: str = "ZAR"

class AccountEntity:
    """Entity representation of a user's wallet account."""
    def __init__(self, account_id: str, balance: Money) -> None:
        self.id = account_id
        self._balance = balance

    def deposit(self, amount: Money) -> None:
        if amount.amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self._balance = Money(self._balance.amount + amount.amount)
        
    @property
    def current_balance(self) -> Money:
        return self._balance
__BTT__

## 8. Best Practices
- Keep domain entities clean and free of database imports and external API integrations.
- Always validate business constraints at the boundary of aggregate models.

## 9. Anti-patterns
- **Anemic Domain Models**: Design of domain objects with simple fields and zero business behavior.

## 10. Security Considerations
- Keep validation rules strictly enforced inside domain entities to prevent unauthorized states.

## 11. Performance Considerations
- Keep aggregate boundaries small to prevent transaction lock issues in database tables.

## 12. Testing Strategy
- Write pure unit tests to verify domain behaviors under different business states.

## 13. Review Checklist
- [ ] Are aggregate boundaries clearly defined?
- [ ] Do domain entities protect their internal state from outside modification?

## 14. Common Mistakes
- Leaking infrastructure frameworks or SQLAlchemy definitions into domain model classes.

## 15. Future Improvements
- Move context mappings to central event streams to handle multi-context communications easily.

## 16. Revision History
- **v1.0.0**: Defined platform Domain-Driven Design standards.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [Backend](backend.md)
`);

// 32. debugging.md
writeFile('.ai/skills/debugging.md', `# 🔍 Code Debugging & Diagnosis Standards

## 1. Purpose
To establish structured methodologies for locating, identifying, and resolving software faults.

## 2. When to Use
- Troubleshooting test failures, resolving system crashes, and investigating production performance gaps.

## 3. When NOT to Use
- Standard, routine coding tasks with zero functional issues.

## 4. Architecture
__BTT__
[ Issue Detected ] ---> [ Reproduce Fault ] ---> [ Log Analysis & Tracing ] ---> [ Isolated Fix ]
__BTT__

## 5. Step-by-Step Implementation
1. **Isolate the Defect**: Create a minimal reproducible test case to isolate the issue.
2. **Analyze Logs**: Review execution traces and error payloads.
3. **Use Debuggers**: Set break-points and watch-expressions to inspect runtime state variables.
4. **Implement Verification**: Write a failing unit test first to prevent regression errors.

## 6. Repository Standards
- Never commit active debuggers (\`breakpoint()\`, \`debugger;\`) to git branches.
- Keep diagnostic logs structured in JSON format.

## 7. Examples

### Structured Error Tracer block
__BTT__typescript
export function safeExecute<T>(fn: () => T, context: string): T | null {
  try {
    return fn();
  } catch (error) {
    // Structured diagnostic logging for rapid troubleshooting
    console.error({
      timestamp: new Date().toISOString(),
      location: "ExecutionBoundary",
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}
__BTT__

## 8. Best Practices
- Fix the root cause of issues, not just their surface-level symptoms.
- Always check core assumptions first before diving into deep, complex debugging flows.

## 9. Anti-patterns
- **Squelching Errors**: Catching and swallowing exceptions without logging or handling them.

## 10. Security Considerations
- Strip sensitive authentication tokens and private user data from diagnostic logs.

## 11. Performance Considerations
- Turn off heavy diagnostic logs in production to avoid high I/O latency.

## 12. Testing Strategy
- Convert verified faults into permanent regression test cases inside the unit test suite.

## 13. Review Checklist
- [ ] Are logs structured with clear context and stack details?
- [ ] Have all temporary debugger flags been removed?

## 14. Common Mistakes
- Committing temporary debug logs to production code branches.

## 15. Future Improvements
- Integrate distributed trace-tracking to debug microservices easily.

## 16. Revision History
- **v1.0.0**: Outlined baseline system debugging standards.

## 17. Related References
- Skills: [Logging](logging.md), [Testing](testing.md)
`);

// 33. dependency-injection.md
writeFile('.ai/skills/dependency-injection.md', `# 🔌 Dependency Injection (DI) Standards

## 1. Purpose
To decouple system components, make testing easier, and keep systems flexible.

## 2. When to Use
- Managing database connections, service abstractions, and controller dependencies.

## 3. When NOT to Use
- Initializing simple, stateless utility helpers or pure domain entities.

## 4. Architecture
__BTT__
[ IoC Container / Router ] ---> [ Resolves Interface ] ---> [ Injects Concrete Instance ] ---> [ Client Class ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Interface**: Create clean, abstract classes or interface signatures.
2. **Implement concrete class**: Implement actual, production-ready class routines.
3. **Inject dependencies**: Inject dependencies via class constructors or system injection tools.

## 6. Repository Standards
- All route actions in FastAPI must use the standard \`Depends\` system.
- Never hardcode concrete helper instantiations inside domain use cases.

## 7. Examples

### Constructor Injection in TypeScript
__BTT__typescript
interface IAnalyticsService {
  trackEvent(event: string): void;
}

export class DashboardController {
  private analytics: IAnalyticsService;

  // Constructor-based dependency injection
  constructor(analytics: IAnalyticsService) {
    self.analytics = analytics;
  }

  public render(): void {
    self.analytics.trackEvent("dashboard_view");
  }
}
__BTT__

## 8. Best Practices
- Prefer constructor-based dependency injection over method or property injection.
- Keep dependencies explicit inside initialization routines.

## 9. Anti-patterns
- **Service Locator Abuse**: Fetching dependencies from a hidden central locator inside classes instead of utilizing constructor injection.

## 10. Security Considerations
- Validate injected mock systems inside test suites to ensure security states are preserved.

## 11. Performance Considerations
- Keep lifecycle scopes (singleton, scoped, transient) configured properly to prevent memory leaks.

## 12. Testing Strategy
- Easily mock interfaces inside unit tests to isolate classes and avoid testing complex database setups.

## 13. Review Checklist
- [ ] Are all external service resources injected via constructor signatures?
- [ ] Is lifecycle scope management configured properly inside route dependencies?

## 14. Common Mistakes
- Instantiating complex database adapter classes inside domain use case classes using the \`new\` keyword.

## 15. Future Improvements
- Automate dependencies mapping verification checks during compile steps.

## 16. Revision History
- **v1.0.0**: Established unified dependency injection guidelines.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [Backend](backend.md)
`);

// 34. error-handling.md
writeFile('.ai/skills/error-handling.md', `# 🛡️ Exception & Error Handling Standards

## 1. Purpose
To ensure system failures are caught gracefully, keeping the platform secure and robust.

## 2. When to Use
- Managing database failures, API issues, validation errors, and runtime failures.

## 3. When NOT to Use
- Writing pure, non-risk logical paths with no potential failure cases.

## 4. Architecture
__BTT__
[ Exception Event ] ---> [ Error Handler Middleware ] ---> [ Log Event ] ---> [ Safe JSON Response ]
__BTT__

## 5. Step-by-Step Implementation
1. **Custom Exceptions**: Create custom exception hierarchies subclassing standard base errors.
2. **Middleware Catchers**: Set up global middleware catchers to capture untraced failures.
3. **Safe Responses**: Return clear, sanitized messages to frontend layers (no internal stack-traces).

## 6. Repository Standards
- Catch only the specific exceptions you intend to handle.
- Always provide descriptive, structured context details inside error handlers.

## 7. Examples

### Standard Error Response Builder in Python
__BTT__python
from fastapi import Request, status
from fastapi.responses import JSONResponse

class PlatformException(Exception):
    """Base exception class for platform errors."""
    def __init__(self, detail: str, code: str) -> None:
        self.detail = detail
        self.code = code

class InsufficientFundsException(PlatformException):
    """Exception raised when an account has insufficient funds."""
    pass

async def platform_exception_handler(request: Request, exc: PlatformException) -> JSONResponse:
    """Standard global exception handler for platform errors."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.code,
            "message": exc.detail,
            "path": request.url.path
        }
    )
__BTT__

## 8. Best Practices
- Provide actionable, human-readable error messages for end users in client interfaces.
- Design custom exceptions with explicit, standardized system codes.

## 9. Anti-patterns
- **Generic Catch-Alls**: Using empty except blocks (\`except:\` or \`catch(err) {}\`) which hide critical bugs.

## 10. Security Considerations
- Never expose raw database tables, server configurations, or internal stack-traces inside public error responses.

## 11. Performance Considerations
- Avoid throwing exceptions on expected business paths (e.g. use standard conditional paths for normal flow).

## 12. Testing Strategy
- Write test scripts to confirm that specific system failures return their corresponding custom error codes.

## 13. Review Checklist
- [ ] Do custom exceptions inherit from the base platform error?
- [ ] Are public error responses free of sensitive internal information?

## 14. Common Mistakes
- Swallowing exceptions without logging them, making production support difficult.

## 15. Future Improvements
- Set up real-time alerting systems triggered automatically by critical error logs.

## 16. Revision History
- **v1.0.0**: Outlined platform error handling requirements.

## 17. Related References
- Skills: [Debugging](debugging.md), [Logging](logging.md)
`);

// 35. integration-testing.md
writeFile('.ai/skills/integration-testing.md', `# 🧪 Integration Testing Standards

## 1. Purpose
To establish guidelines for verifying collaborations across multiple system modules, databases, and APIs.

## 2. When to Use
- Testing repository database operations, API route responses, and multi-service event orchestration flows.

## 3. When NOT to Use
- Testing simple isolated algorithms or state transformations (prefer pure unit tests).

## 4. Architecture
__BTT__
[ API Router Client ] ---> [ Concrete Service ] ---> [ Test Database Instance (Postgres/Redis) ]
__BTT__

## 5. Step-by-Step Implementation
1. **Prepare DB Test State**: Setup database transactions that roll back automatically after test runs.
2. **Mock External APIs**: Mock only external, third-party internet APIs using adapters or VCR recorders.
3. **Run Requests**: Utilize the framework's test client (\`TestClient\` or similar) to call endpoints.
4. **Assert Side Effects**: Query the test database directly to verify expected state changes.

## 6. Repository Standards
- Integration tests must run in isolated environments without affecting production database schemas.
- Ensure all test resources (connections, threads) are cleaned up correctly after completion.

## 7. Examples

### FastAPI Route Integration Test
__BTT__python
import pytest
from fastapi.testclient import TestClient

def test_create_prediction_integration(client: TestClient):
    # Call endpoint concrete router
    response = client.post(
        "/api/v1/predictions/",
        json={"match_id": 42, "predicted_home_goals": 2.5}
    )
    assert response.status_code == 201
    assert response.json()["status"] == "accepted"
__BTT__

## 8. Best Practices
- Automatically seed minimal required tables before executing integration suites.
- Use explicit transactional rollbacks to maintain test database hygiene.

## 9. Anti-patterns
- **Shared Mutable State**: Letting test runs modify identical static records, causing random test failures.

## 10. Security Considerations
- Ensure test suites do not connect to production databases or expose active environment secrets.

## 11. Performance Considerations
- Run database-bound integration test suites in parallel with connection pool boundaries.

## 12. Testing Strategy
- Run automated integration tests on every pull request within the CI/CD pipeline.

## 13. Review Checklist
- [ ] Are all database test cases wrapped in a transactional rollback block?
- [ ] Are external internet dependencies properly mocked?

## 14. Common Mistakes
- Leaving orphaned connections active in test databases, causing pool starvation issues.

## 15. Future Improvements
- Implement automated test-containers setup inside CI configurations.

## 16. Revision History
- **v1.0.0**: Defined system integration testing practices.

## 17. Related References
- Skills: [Testing](testing.md), [Unit Testing](unit-testing.md)
`);

// 36. logging.md
writeFile('.ai/skills/logging.md', `# 📝 Application Logging Standards

## 1. Purpose
To define unified logging standards to ensure rapid troubleshooting, monitoring, and audit compliance.

## 2. When to Use
- Recording execution milestones, tracing warnings, and logging exceptions across all modules.

## 3. When NOT to Use
- Storing temporary developer print lines (which must be removed before code reviews).

## 4. Architecture
__BTT__
[ Logger Event ] ---> [ Standard Formatter (JSON) ] ---> [ Transport / Console ] ---> [ Analytics Engine ]
__BTT__

## 5. Step-by-Step Implementation
1. **Choose Level**: Select appropriate levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).
2. **Format as JSON**: Use structured JSON formats for all output streams.
3. **Include Context**: Add request IDs, user context, and transaction indicators.

## 6. Repository Standards
- Standard outputs must use designated logging objects; never use raw \`print()\` or \`console.log()\`.
- All exception log events must include active trace-back details.

## 7. Examples

### Structured Logger Config in Python
__BTT__python
import logging
import json
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_payload)

logger = logging.getLogger("platform")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
__BTT__

## 8. Best Practices
- Keep INFO level logs clear, concise, and focused strictly on high-level operational events.
- Utilize transaction IDs to trace requests completely across multi-service boundaries.

## 9. Anti-patterns
- **Sensitive Log Leaks**: Writing passwords, API tokens, or credit cards to plaintext console buffers.

## 10. Security Considerations
- Sanitize log parameters to prevent security log injection or spoofing risks.

## 11. Performance Considerations
- Use asynchronous log output structures to prevent thread blocks on disk I/O.

## 12. Testing Strategy
- Test custom logger handlers by asserting matching keys in generated JSON streams.

## 13. Review Checklist
- [ ] Are all log lines structured as compliant JSON records?
- [ ] Have all raw \`print\` or \`console.log\` statements been removed?

## 14. Common Mistakes
- Logging voluminous DEBUG info in production setups, filling disk spaces rapidly.

## 15. Future Improvements
- Streamline ingestion directly to central tracing setups (OpenTelemetry).

## 16. Revision History
- **v1.0.0**: Defined base application logging standards.

## 17. Related References
- Skills: [Debugging](debugging.md), [Monitoring](monitoring.md)
`);

// 37. monitoring.md
writeFile('.ai/skills/monitoring.md', `# 📊 System Monitoring & Alerting Standards

## 1. Purpose
To establish active telemetry, metrics tracking, and error-alert mechanisms across production services.

## 2. When to Use
- Tracking API response times, memory consumption, queue rates, and error rate triggers.

## 3. When NOT to Use
- Writing local verification scripts or single-run unit tests.

## 4. Architecture
__BTT__
[ Platform Services ] ---> [ Prometheus Metrics Engine ] ---> [ Grafana Dashboard ] ---> [ Alerting Gateways ]
__BTT__

## 5. Step-by-Step Implementation
1. **Instrument Metrics**: Expose standard metrics (/metrics) for scraper ingestion.
2. **Define Gauges & Counters**: Monitor error counters, transaction volumes, and system CPU.
3. **Setup Alerts**: Set threshold alarms on high latency (e.g., >500ms) or high exception counts.

## 6. Repository Standards
- Monitor all core database connection pool sizes at all times.
- Keep monitoring libraries isolated from core domain calculations.

## 7. Examples

### Exposing Metrics endpoint in FastAPI
__BTT__python
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()

# Simple global metrics collection
REQUEST_COUNT = 0

@app.middleware("http")
async def count_requests_middleware(request, call_next):
    global REQUEST_COUNT
    REQUEST_COUNT += 1
    return await call_next(request)

@app.get("/metrics", response_class=PlainTextResponse)
def metrics_endpoint():
    return f"platform_http_requests_total {REQUEST_COUNT}\\n"
__BTT__

## 8. Best Practices
- Standardize on Golden Signals: Latency, Traffic, Errors, Saturation.
- Ensure alerts are actionable with detailed remediation guidelines.

## 9. Anti-patterns
- **Alert Fatigue**: Triggering alarms on minor, non-actionable warning thresholds.

## 10. Security Considerations
- Restrict access to metrics endpoints strictly to authorized telemetry scrapers.

## 11. Performance Considerations
- Ensure metrics increments are non-blocking and use fast in-memory variables.

## 12. Testing Strategy
- Verify metrics registries are incremented correctly when specific APIs are called.

## 13. Review Checklist
- [ ] Are all core external APIs wrapped in latency measurement metrics?
- [ ] Is access to the metrics endpoints restricted?

## 14. Common Mistakes
- Forgetting to monitor Celery queue backup counts, resulting in undetected processing backlogs.

## 15. Future Improvements
- Build predictive alert thresholds based on historic database load patterns.

## 16. Revision History
- **v1.0.0**: Established telemetry monitoring guidelines.

## 17. Related References
- Skills: [Logging](logging.md)
`);

// 38. playwright.md
writeFile('.ai/skills/playwright.md', `# 🎭 Frontend Playwright Testing Standards

## 1. Purpose
To verify user workflows, layout behaviors, and UI performance under standard browser operations.

## 2. When to Use
- Writing automated end-to-end tests for key customer paths (login, payment, bet tracking).

## 3. When NOT to Use
- Verifying isolated internal helper methods or individual unit-scoped functions.

## 4. Architecture
__BTT__
[ Playwright Runner ] ---> [ Headless Chromium / Firefox ] ---> [ Active Dashboard App ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Test Spec**: Write a clear, linear flow asserting user action outcomes.
2. **Select Locators**: Use accessible, text-based queries (e.g., \`getByRole\`) or test IDs.
3. **Execute Actions**: Type inputs, click action elements, and wait for async renders.
4. **Assert Renders**: Verify expected page navigations or alert elements appear correctly.

## 6. Repository Standards
- Never use fragile, hardcoded XPath references for element targeting.
- Enforce automated end-to-end runs as gates in production branch merges.

## 7. Examples

### Playwright E2E Test Workflow
__BTT__typescript
import { test, expect } from "@playwright/test";

test("User can successfully navigate predictions page", async ({ page }) => {
  // 1. Visit dashboard page
  await page.goto("/dashboard");

  // 2. Select and click predictions navigation link
  const link = page.getByRole("link", { name: "Predictions" });
  await expect(link).toBeVisible();
  await link.click();

  // 3. Assert target header is rendered correctly
  const header = page.getByRole("heading", { name: "Match Simulations" });
  await expect(header).toBeVisible();
});
__BTT__

## 8. Best Practices
- Utilize standard \`testId\` parameters as robust fallback selectors.
- Keep tests independent; seed specific, isolated test states before running.

## 9. Anti-patterns
- **Hardcoded Sleeps**: Using static waits (\`await page.waitForTimeout(5000)\`) instead of dynamic element selectors.

## 10. Security Considerations
- Store test credentials and staging user keys securely in environment variables.

## 11. Performance Considerations
- Run tests concurrently across workers to reduce total build time.

## 12. Testing Strategy
- Execute end-to-end scenarios automatically in the staging environment before releases.

## 13. Review Checklist
- [ ] Are selectors robust against layout styling refactors?
- [ ] Are there zero static waitForTimeout calls in the suite?

## 14. Common Mistakes
- Expecting animations to complete instantly without specifying flexible wait rules.

## 15. Future Improvements
- Set up automated visual regression tests to catch layout styling drift.

## 16. Revision History
- **v1.0.0**: Outlined Playwright end-to-end testing standards.

## 17. Related References
- Skills: [Frontend](frontend.md), [Testing](testing.md)
`);

// 39. prompt-engineering.md
writeFile('.ai/skills/prompt-engineering.md', `# 🧠 Prompt Engineering & Agent Control Standards

## 1. Purpose
To establish templates and strategies for guiding LLM coding agents to work predictably.

## 2. When to Use
- Engineering prompt workflows, formatting instructions, and driving developer agent turns.

## 3. When NOT to Use
- Writing standard local code logic or simple configuration properties.

## 4. Architecture
__BTT__
[ System Prompt Template ] ---> [ Role Context Constraints ] ---> [ Expected Markdown Outputs ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Objective**: Keep instructions clear, direct, and well-scoped.
2. **Context Enclosures**: Embed raw variables or files within XML boundaries (e.g. \`<file_context>\`).
3. **Structured Formats**: Request predictable, structured JSON or Markdown outputs.

## 6. Repository Standards
- Maintain all custom, reusable agent templates inside the \`.ai/prompts/\` directory.
- Avoid loose, conversational prompts when instructing LLM coding agents in this repo.

## 7. Examples

### Modular System Instruction Template
__BTT__markdown
# Role Instruction
You are an expert developer assistant specialized in sports forecasting.

## Constraints
- Always use typing indicators.
- Return output strictly inside the following format:
\`\`\`json
{
  "prediction": "home_win",
  "confidence": 0.85
}
\`\`\`
__BTT__

## 8. Best Practices
- Frame problems sequentially using chain-of-thought instructions.
- Constrain model outputs with explicit, scannable schemas.

## 9. Anti-patterns
- **Amorphous Requests**: Asking general, unconstrained open-ended questions like "Fix any errors in the app."

## 10. Security Considerations
- Prevent prompt injection risks inside customer-facing AI features.

## 11. Performance Considerations
- Keep context windows clean and compact to reduce token latency and costs.

## 12. Testing Strategy
- Assert that model outputs conform to expected schemas using automated validation scripts.

## 13. Review Checklist
- [ ] Are all target rules clearly formatted?
- [ ] Are output restrictions backed by schema validations?

## 14. Common Mistakes
- Neglecting to provide negative constraints, resulting in unsolicited features or unwanted code changes.

## 15. Future Improvements
- Build automated evaluation loops to score and verify prompt effectiveness.

## 16. Revision History
- **v1.0.0**: Created initial prompt engineering guidelines.

## 17. Related References
- Rules: [Coding Rules](../rules/coding-rules.md)
`);

// 40. refactoring.md
writeFile('.ai/skills/refactoring.md', `# 🔄 Code Refactoring Standards

## 1. Purpose
To define processes for improving code structure and readability without altering external behavior.

## 2. When to Use
- Simplifying complex methods, reducing tech debt, and aligning legacy files with system rules.

## 3. When NOT to Use
- Rewriting code during active production outages (prefer focused, low-risk patches).

## 4. Architecture
__BTT__
[ Legacy Code ] ---> [ Ensure Unit Test Suite Coverage ] ---> [ Small Edits ] ---> [ Verify Behaviour Runs ]
__BTT__

## 5. Step-by-Step Implementation
1. **Verify Tests**: Confirm there is a robust, green test suite in place first.
2. **Small Edits**: Execute refactoring steps in tiny, incremental commits.
3. **Run Tests Frequently**: Execute the test suite after every small structural change.
4. **Perform Code Review**: Assess and confirm that the external system behaviors remain unchanged.

## 6. Repository Standards
- Do not combine refactoring sweeps with new feature additions in single pull requests.
- Ensure refactored classes match current architectural patterns.

## 7. Examples

### Simplifying Complex Nested Loops
__BTT__typescript
// 🔴 Bad: Nested conditional structures
function verifyRecord(record: any) {
  if (record) {
    if (record.active) {
      if (record.verified) {
        return true;
      }
    }
  }
  return false;
}

// 🟢 Good: Guard clauses for clean readability
function verifyRecordClean(record: any): boolean {
  if (!record || !record.active || !record.verified) {
    return false;
  }
  return true;
}
__BTT__

## 8. Best Practices
- Leverage IDE tools for safe, automated symbol renaming and extraction.
- Apply Boy Scout Rule: Always leave code cleaner than you found it.

## 9. Anti-patterns
- **The Big Bang Rewrite**: Refactoring major system modules all at once without staging intermediate commits.

## 10. Security Considerations
- Verify that security controls and authorization checks are not bypassed during refactors.

## 11. Performance Considerations
- Profile performance profiles to verify that clean refactors do not introduce resource regressions.

## 12. Testing Strategy
- Keep unit tests green; assert identical input-to-output maps post-refactoring.

## 13. Review Checklist
- [ ] Are all regression tests building green?
- [ ] Are there zero functional changes inside this PR?

## 14. Common Mistakes
- Attempting major refactors on un-tested codebases, introducing unexpected bugs.

## 15. Future Improvements
- Automate complexity reports to automatically highlight files that need refactoring attention.

## 16. Revision History
- **v1.0.0**: Defined system-wide refactoring practices.

## 17. Related References
- Skills: [Clean Code](clean-code.md), [Clean Architecture](clean-architecture.md)
`);

// 41. repository-pattern.md
writeFile('.ai/skills/repository-pattern.md', `# 🗄️ Repository Design Pattern Standards

## 1. Purpose
To decouple business services from database operations, creating clean domain boundaries.

## 2. When to Use
- Managing database queries, CRUD actions, and ORM mapping logic across systems.

## 3. When NOT to Use
- Querying stateless third-party APIs directly, or developing purely client-side visual states.

## 4. Architecture
__BTT__
[ Core Service Use Case ] ---> [ Interface Repository ] ---> [ Concrete SQL Database Adapter ]
__BTT__

## 5. Step-by-Step Implementation
1. **Define Abstract Interface**: Establish clear methods for reading and writing domain models.
2. **Implement ORM Storage Adapter**: Code concrete queries using SQLAlchemy, Prisma, etc.
3. **Bind Dependency Injection**: Bind concrete implementations to interfaces inside startup routers.

## 6. Repository Standards
- Use cases must never access database sessions directly; they must interact strictly via repository interfaces.
- Repository actions must return domain model entities, never raw ORM row structures.

## 7. Examples

### SQLAlchemy 2.0 Repository Class
__BTT__python
from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.orm import Session

# Interface
class IUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[dict]:
        pass

# Concrete
class SQLUserRepository(IUserRepository):
    def __init__(self, db_session: Session) -> None:
        self.session = db_session

    def get_by_id(self, user_id: int) -> Optional[dict]:
        # Implementation of SQLAlchemy fetch query
        row = self.session.execute("SELECT id, name FROM users WHERE id = :id", {"id": user_id}).fetchone()
        return {"id": row.id, "name": row.name} if row else None
__BTT__

## 8. Best Practices
- Keep repositories simple and focused entirely on data access; do not place business logic here.
- Standardize on clean parameter inputs instead of exposing direct ORM session operations.

## 9. Anti-patterns
- **Leaky Sessions**: Returning database cursor pools or transaction boundaries to outer application layers.

## 10. Security Considerations
- Parameterize all inputs inside queries to prevent SQL Injection vulnerabilities.

## 11. Performance Considerations
- Load data relations selectively; use eager loading only where specifically required.

## 12. Testing Strategy
- Mock repository interfaces to unit test business services without connecting to real database instances.

## 13. Review Checklist
- [ ] Is the data store access encapsulated behind an abstract interface?
- [ ] Are queries properly parameterized to defend against injection attacks?

## 14. Common Mistakes
- Writing heavy business calculations and domain rules inside database query files.

## 15. Future Improvements
- Implement generic repository bases to minimize repetitive boilerplate CRUD structures.

## 16. Revision History
- **v1.0.0**: Formulated repository design standards.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [SQLAlchemy](sqlalchemy.md)
`);

// 42. unit-testing.md
writeFile('.ai/skills/unit-testing.md', `# 🧪 Pure Unit Testing Standards

## 1. Purpose
To ensure isolated routines, business functions, and calculations operate perfectly.

## 2. When to Use
- Testing mathematical functions, portfolio allocations, and specific state transitions.

## 3. When NOT to Use
- Verifying database transactions, routing connections, or user browser flows.

## 4. Architecture
__BTT__
[ Pure Logic Block ] <--- [ Mock Dependencies / Inputs ] <--- [ Assert Outputs Match ]
__BTT__

## 5. Step-by-Step Implementation
1. **Isolate Logic**: Ensure the function has no side effects or external queries.
2. **Setup Test Cases**: Build distinct inputs covering bounds and edge scenarios.
3. **Execute Assertions**: Compare returned metrics with mathematically expected values.

## 6. Repository Standards
- Target a minimum of 90% unit test coverage for all core analytical calculation modules.
- Ensure unit tests execute fast and run in-memory with zero network actions.

## 7. Examples

### Python Math Calculation Test Case
__BTT__python
import pytest

def calculate_kelly_fraction(odds: float, probability: float) -> float:
    if odds <= 1.0 or probability <= 0.0:
        return 0.0
    return ((probability * odds) - 1.0) / (odds - 1.0)

def test_calculate_kelly_fraction_win_edge():
    # odds = 2.0 (Even), prob = 0.60 (60%) -> Kelly = (1.2 - 1)/1 = 0.20
    fraction = calculate_kelly_fraction(2.0, 0.60)
    assert fraction == pytest.approx(0.20)

def test_calculate_kelly_fraction_no_edge():
    fraction = calculate_kelly_fraction(2.0, 0.40)
    assert fraction <= 0.0
__BTT__

## 8. Best Practices
- Standardize on Triple-A: Arrange, Act, Assert.
- Keep test names descriptive, outlining exact behavior expectations (e.g. \`test_should_return_zero_when_negative\`).

## 9. Anti-patterns
- **Mocking Extensively**: Over-mocking standard helper classes, creating tests that assert nothing about real operations.

## 10. Security Considerations
- Validate that input validation rules throw standard exceptions on hostile boundaries.

## 11. Performance Considerations
- Ensure tests execute in milliseconds to keep developers running them frequently.

## 12. Testing Strategy
- Run unit test suites locally on every file save and on all code branches pre-commit.

## 13. Review Checklist
- [ ] Are all edge parameters and empty state bounds verified?
- [ ] Does the test run completely in-memory without external database calls?

## 14. Common Mistakes
- Adding database database dependencies to unit tests, turning them into slow integration tests.

## 15. Future Improvements
- Set up mutation testing to evaluate the real quality of test assertions.

## 16. Revision History
- **v1.0.0**: Outlined platform unit testing rules.

## 17. Related References
- Skills: [Testing](testing.md), [Integration Testing](integration-testing.md)
`);

console.log('Finished Part 4 of AI Skills Generation...');
console.log('All 42 core engineering skills have been fully generated with world-class production content!');



