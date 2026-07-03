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
  console.log(`✓ Rules Engine: Generated ${filePath}`);
}

console.log('Generating AI Betting Intelligence Platform System Rules...');

// 1. coding-rules.md
writeFile('.ai/rules/coding-rules.md', `# 💻 Coding Rules & Standards

## 1. Purpose
To establish unified, mathematically-defensible, and type-safe development practices across Python (Backend) and TypeScript (Frontend).

## 2. Scope
Applies to all source code files, components, models, and helper scripts in the repository.

## 3. Core Principles
- **Predictability Over Cleverness**: Code must be obvious to both humans and LLM agents.
- **Strict Typing**: No implicit \`any\`, wildcards, or untyped API responses.
- **Fail Fast & Loudly**: Raise clean, structured errors as close to the failure point as possible.

## 4. Mandatory Rules
### Python Standards
- **Version Constraint**: Python 3.11+.
- **Formatting**: Enforced strictly by \`Ruff\` and \`Black\`.
- **Type Hints**: Mandatory for all function signatures and class variables. No exceptions.
- **File Organization**: Max file size is 500 lines. Split large modules into separate domain sub-modules.
- **Complexity**: Cyclomatic complexity per function must not exceed 10.

### TypeScript Standards
- **Version Constraint**: TypeScript 5.0+, React 19, Vite.
- **Import Rules**: Name imports strictly; do not use wildcard or object destructuring on imports.
- **Immutability**: Prefer \`readonly\` collections and state structures.
- **Asynchronous Standards**: Avoid raw promises; use \`async/await\` with clean \`try/catch\` handlers.

## 5. Recommended Practices
- Limit class sizes to 300 lines and function sizes to 30 lines.
- Keep dependency injections clean using FastAPI's dependency injection mechanisms.
- Define all constants and enums globally instead of hardcoding them.

## 6. Examples

### 🟢 Good Python Example (Calibrated Predictor)
__BTT__python
from typing import Dict, Any

class OutcomePredictor:
    """Predicts match probabilities using calibrated models."""
    
    def __init__(self, model_weights: Dict[str, float]) -> None:
        self.model_weights = model_weights

    def predict_probability(self, home_form: float, away_form: float) -> float:
        """Calculates a normalized probability between 0.0 and 1.0."""
        score = (home_form * self.model_weights.get("home", 0.5)) - (away_form * self.model_weights.get("away", 0.5))
        return 1.0 / (1.0 + (2.71828 ** -score))
__BTT__

### 🔴 Bad Python Example (No typing, magic numbers, lookahead risk)
__BTT__python
# No type hints, magic numbers, high complexity
def pred(h, a):
    s = h * 0.65 - a * 0.45
    return 1 / (1 + 2.718 ** -s) # Magic number, no calibration
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Magic Numbers**: Hardcoding overrounds, tax rules, or Kelly risk limits outside configs.
- **Shadow Re-renders (React)**: Including raw objects or arrays directly in React \`useEffect\` dependencies.

## 8. Decision Tree: Where should code go?
\`\`\`mermaid
graph TD
    A[Is it business math/formulas?] -->|Yes| B[backend/services/pure_domain/]
    A -->|No| C[Is it DB / API related?]
    C -->|Yes| D[backend/database/ or backend/api/]
    C -->|No| E[frontend/src/components/]
\`\`\`

## 9. Review Checklist
- [ ] Are all types explicitly declared?
- [ ] Does cyclomatic complexity stay under 10?
- [ ] Are there any un-isolated magic numbers?

## 10. Automation Opportunities
- Ruff linter executes automatically on pre-commit hooks.
- GitHub Actions blocks pull requests with implicit TS \`any\` typings.

## 11. Future Improvements
- Move all business math formulas into WASM packages to share exact client-server execution layers.

## 12. Revision History
- **v1.0.0**: Initial coding standards aligned with Python 3.11 and React 19.

## 13. Related Documents
- [Naming Rules](naming-rules.md)
- [Architecture Rules](architecture-rules.md)
`);

// 2. architecture-rules.md
writeFile('.ai/rules/architecture-rules.md', `# 🏛️ Architecture Rules & Standards

## 1. Purpose
To maintain absolute separation of concerns, high scalability, and zero-leakage boundaries.

## 2. Scope
Applies to the multi-layered interactions between React frontends, FastAPI Gateways, and timeseries storage.

## 3. Core Principles
- **DDD & Clean Architecture**: Domain modeling must be pure and free from framework-specific database drivers or API bindings.
- **CQRS Principle**: Separate high-throughput timeseries reads from relational portfolio edits.
- **Dependency Inversion**: High-level policies must not depend on low-level detail. Both must depend on abstractions.

## 4. Mandatory Rules
- **Layer Integrity**: React can never talk to the database directly; it must route through FastAPI API endpoints.
- **Feature-First Structure**: Group modules by domain logic (e.g., \`predictions\`, \`portfolio\`) rather than purely technical roles (e.g., \`controllers\`, \`views\`).
- **No Synchronous Scrapes**: Scraper tasks must run asynchronously inside Celery workers; FastAPI routes can only queue or query results from Postgres.

## 5. Recommended Practices
- Keep DB interactions wrapped in SQLAlchemy repositories.
- Use WebSockets exclusively for high-fidelity live match feeds, reverting to standard REST for slip logs.

## 6. Examples

### 🟢 Good Architecture Diagram
__BTT__mermaid
graph LR
    ReactUI -->|Asynchronous API| FastAPI
    FastAPI -->|Repository Interface| Repository
    Repository -->|SQLAlchemy| Postgres
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Fat Controllers**: Placing SQL queries or Kelly sizer algorithms directly inside FastAPI router definitions.
- **Circular Imports**: Importing prediction models inside the portfolio module and vice-versa without interface wrappers.

## 8. Decision Tree: Decoupling States
\`\`\`mermaid
graph TD
    A[New feature requested] --> B{Does it require real-time streaming?}
    B -->|Yes| C[Add WebSocket subscriber route]
    B -->|No| D[Add standard REST controller using Repository]
\`\`\`

## 9. Review Checklist
- [ ] Is domain logic isolated from FastAPI/SQLAlchemy framework references?
- [ ] Are background workers running asynchronously?
- [ ] Is there zero lookahead leakage?

## 10. Automation Opportunities
- ArchUnit-style tests in pytest validating package structure import rules.

## 11. Future Improvements
- Transition prediction calculations to a microservices architecture.

## 12. Revision History
- **v1.0.0**: Scaffolding clean layers, repository interfaces, and Celery worker separation.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Database Rules](database-rules.md)
`);

// 3. database-rules.md
writeFile('.ai/rules/database-rules.md', `# 🗄️ Database Rules & Standards

## 1. Purpose
To ensure transactional safety, optimal indexing performance, and time-series efficiency for high-volume sports odds.

## 2. Scope
Applies to all database schemas, table modifications, indices, partitioning configurations, and raw SQL queries.

## 3. Core Principles
- **No Physical Deletes**: Soft deletes are mandatory for relational transactions and portfolios to maintain full audit logs.
- **Relational Integrity**: Foreign keys must always include cascading rules and explicit indices.
- **Partitioned Time-Series**: Store high-frequency bookmaker odds inside partitioned TimescaleDB hypertables.

## 4. Mandatory Rules
- **Naming Conventions**: Relational tables must use lowercase, plural snake_case. Column names must be singular snake_case.
- **Primary Keys**: Every relational table must define an autoincrementing integer primary key named \`id\`.
- **Soft Deletion**: Include an \`is_deleted\` boolean column indexed to filter records by default.
- **Audit Columns**: Every table must record \`created_at\` and \`updated_at\` timestamps in UTC.
- **Migrations**: No hand-written schema edits; all updates must be tracked with Alembic migration revisions.

## 5. Recommended Practices
- Use composite indices on composite query patterns (e.g., \`match_id\`, \`updated_at\`).
- Apply optimistic locking using an integer version column for concurrent slip settlements.

## 6. Examples

### 🟢 Good SQL Definition (Timescale Hypertable)
__BTT__sql
CREATE TABLE historical_odds (
    id SERIAL,
    match_id INT NOT NULL,
    bookmaker VARCHAR(50) NOT NULL,
    odds_home NUMERIC(5,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id, updated_at)
);
SELECT create_hypertable('historical_odds', 'updated_at', chunk_time_interval => INTERVAL '7 days');
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Unindexed Foreign Keys**: Creating a foreign key to \`matches\` without a corresponding index, leading to slow cascade checks.
- **Truncate Execution**: Emptying tables inside unit tests rather than rolling back transactions.

## 8. Decision Tree: Selecting Indexes
\`\`\`mermaid
graph TD
    A[New table column added] --> B{Is it used in WHERE clauses?}
    B -->|Yes| C{Is it high cardinality?}
    C -->|Yes| D[Apply B-Tree Index]
    C -->|No| E[Apply Partial or Composite Index]
    B -->|No| F[No Index needed]
\`\`\`

## 9. Review Checklist
- [ ] Are all table and column names in standard snake_case?
- [ ] Do foreign keys have corresponding indexes?
- [ ] Is Alembic migration checked and tested?

## 10. Automation Opportunities
- PR validation triggers check for direct raw SQL strings inside python code files.

## 11. Future Improvements
- Automated archival jobs moving older time-series data (>180 days) to cold object storage.

## 12. Revision History
- **v1.0.0**: Initial database standards featuring TimescaleDB patterns.

## 13. Related Documents
- [Architecture Rules](architecture-rules.md)
- [Performance Rules](performance-rules.md)
`);

// 4. api-rules.md
writeFile('.ai/rules/api-rules.md', `# 🔌 API Rules & Conventions

## 1. Purpose
To ensure robust, predictable, and standardized client-server interfaces.

## 2. Scope
Applies to all REST API routers, parameters, response formats, and WebSocket adapters.

## 3. Core Principles
- **Standard Envelope**: All API responses must utilize the uniform JSON payload envelope.
- **Stateless Authentication**: Rely strictly on crytographically signed JWTs.
- **Backward Compatibility**: Any change to fields must be backward-compatible; else increment version (/api/v2).

## 4. Mandatory Rules
- **Response Format**: Every response must return: \`{ success: boolean, data: object, error: object, meta: object }\`.
- **HTTP Status Codes**: Use standard codes strictly (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 429 Too Many Requests).
- **Idempotency Headers**: API writes handling stakes or slip creation must enforce an \`Idempotency-Key\` header check.
- **DTO Validation**: Utilize Pydantic schemas in FastAPI to validate incoming JSON structures strictly.

## 5. Recommended Practices
- Limit API response times to under 200ms using caching mechanisms (Redis).
- Provide clean Swagger documentation for all endpoints automatically.

## 6. Examples

### 🟢 Good FastAPI Route
__BTT__python
@router.get("/api/v1/predictions/{match_id}", response_model=ApiResponseEnvelope[PredictionDto])
async def get_prediction(match_id: int, service: PredictionService = Depends(get_prediction_service)):
    prediction = await service.get_by_match_id(match_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return ApiResponseEnvelope(success=True, data=prediction)
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Exposing Internal DB Entities**: Directly returning SQLAlchemy models over the API without a Pydantic DTO mapping step.
- **Plain Text Errors**: Returning unstructured traceback strings on 500 server errors.

## 8. Decision Tree: API Error Handling
\`\`\`mermaid
graph TD
    A[Error occurs in backend] --> B{Is it a validation issue?}
    B -->|Yes| C[Return 422 Unprocessable Entity with details]
    B -->|No| D{Is it a permissions block?}
    D -->|Yes| E[Return 403 Forbidden with trace ID]
    D -->|No| F[Return 500 Internal Error and log structural JSON traceback]
\`\`\`

## 9. Review Checklist
- [ ] Is the response wrapped in the uniform JSON envelope?
- [ ] Are Pydantic schemas used for validation?
- [ ] Is Swagger documentation up-to-date?

## 10. Automation Opportunities
- Automatic schema validation tests validating FastAPI Swagger specs on build.

## 11. Future Improvements
- Migrate core WebSocket servers to specialized streaming adapters to support massive live concurrency.

## 12. Revision History
- **v1.0.0**: Defined REST standards and uniform response envelopes.

## 13. Related Documents
- [Security Rules](security-rules.md)
- [Documentation Rules](documentation-rules.md)
`);

// 5. security-rules.md
writeFile('.ai/rules/security-rules.md', `# 🛡️ Security Rules & Standards

## 1. Purpose
To ensure strict security and full protection against the OWASP Top 10 vulnerabilities.

## 2. Scope
Applies to client-side input validation, API gateways, database persistence, and configuration secrets.

## 3. Core Principles
- **Defense in Depth**: Do not rely on single-point security check gates; validate access at the frontend, API, and repository levels.
- **Least Privilege Principle**: API tokens, database clients, and service accounts must hold the absolute minimum rights.
- **Secure By Default**: All endpoints are closed, secured, and authorized unless explicitly whitelisted.

## 4. Mandatory Rules
- **No Client Keys**: All API keys, including the Gemini API key, must reside strictly on the server side. Never expose them to browser clients.
- **SQL Injection Prevention**: Direct raw SQL string execution is strictly banned. Use SQLAlchemy parameterized query models.
- **Cryptographic Signatures**: Use Argon2id for password hashing. JWT keys must be generated using strong high-entropy seeds.
- **Input Sanitization**: Escape all incoming strings to block Cross-Site Scripting (XSS) and SQL Injection vectors.

## 5. Recommended Practices
- Limit JWT lifetimes to 15 minutes, refreshing credentials through secure, HTTP-only cookies.
- Execute automated dependency vulnerability sweeps weekly.

## 6. Examples

### 🟢 Good Security Isolation (Server-Side Proxy Pattern)
__BTT__typescript
// In server.ts (Node backend / Express Proxy)
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
app.post("/api/predictions/evaluate", async (req, res) => {
    // API key stays hidden from the client browser
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: req.body.prompt
    });
    res.json(response);
});
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Client-Side Secrets**: Initializing payment gateways or AI frameworks on React clients using private secret keys.
- **Loose CORS Policies**: Setting \`Access-Control-Allow-Origin: * \` on production instances.

## 8. Decision Tree: Storing Secrets
\`\`\`mermaid
graph TD
    A[New secret key required] --> B{Does the client need direct access?}
    B -->|Yes| C[Expose via public non-sensitive config VITE_ prefix]
    B -->|No| D[Store in .env and access strictly on backend process.env]
\`\`\`

## 9. Review Checklist
- [ ] Is there zero private secret key leakage inside git repositories?
- [ ] Are all database operations fully parameterized?
- [ ] Is CORS configured with an explicit production domain whitelist?

## 10. Automation Opportunities
- GitHub security alerts track raw secrets and private key leaks automatically.

## 11. Future Improvements
- Implement mutual TLS (mTLS) configurations across database-to-gateway layers.

## 12. Revision History
- **v1.0.0**: Strict server-side secrets rule configuration and parameterized queries.

## 13. Related Documents
- [Database Rules](database-rules.md)
- [API Rules](api-rules.md)
`);

// 6. testing-rules.md
writeFile('.ai/rules/testing-rules.md', `# 🧪 Testing Rules & Quality Mandates

## 1. Purpose
To achieve 100% mathematical precision for Kelly allocation pipelines and zero-lookahead ML prediction models.

## 2. Scope
Applies to Pytest units, integration scenarios, end-to-end user flows, and model drift backtesting scripts.

## 3. Core Principles
- **Isolation**: Tests must never communicate with external bookmaker servers. Use mock responses.
- **Deterministic Repetition**: Math, stats, and Kelly calculations must produce identical outcomes given identical inputs.
- **Safety Verification**: Ensure maximum single bankroll limits (5.0%) can never be breached, even with highly skewed inputs.

## 4. Mandatory Rules
- **Coverage Budgets**: Minimum 90% statement coverage on backend modules, and 100% coverage on value calculations and sizing algorithms.
- **Lookahead Leakage Testing**: Unit tests must actively check that feature engineering never references match properties scheduled later than the target time.
- **Database Rollback**: Integration tests must execute inside transactions that roll back automatically after completion.
- **E2E Playwright Tests**: Core visual paths (calendar, portfolio, sizer sliders) must be verified via Playwright.

## 5. Recommended Practices
- Use deterministic mock templates for database factories rather than hardcoded SQL records.
- Run the full test suite before any PR merges.

## 6. Examples

### 🟢 Good Kelly Criterion Unit Test
__BTT__python
def test_kelly_sizer_absolute_max():
    """Verify that Kelly calculations clamp stakes to 5.0% under any circumstance."""
    from services.kelly_sizer import calculate_kelly_fraction
    
    # Highly skewed parameters (Odds = 10.0, true probability = 99%)
    fraction = calculate_kelly_fraction(odds=10.0, true_probability=0.99, risk_coeff=0.25)
    
    # Absolute platform cap is 5.0% (0.05)
    assert fraction <= 0.05
__BTT__

## 7. Anti-patterns & Common Mistakes
- **No Assertions**: Writing tests that execute code but fail to verify properties.
- **Production DB Pollution**: Running tests directly against live TimescaleDB databases.

## 8. Decision Tree: Mocking Strategy
\`\`\`mermaid
graph TD
    A[Unit Test wants to fetch Odds] --> B{Does it require live network?}
    B -->|Yes| C[Fails rule! Apply Mock adapter returns deterministic odds]
    B -->|No| D[Proceed with standard test logic]
\`\`\`

## 9. Review Checklist
- [ ] Is test coverage over 90%?
- [ ] Are all mock frameworks isolated from live third-party network connections?
- [ ] Is lookahead leakage fully tested?

## 10. Automation Opportunities
- GitHub Actions automatically runs \`pytest\` and \`npm run test\` on every push.

## 11. Future Improvements
- Automated mutation testing to assess quality boundaries on value-finding algorithms.

## 12. Revision History
- **v1.0.0**: Configured rigorous math verification tests.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Performance Rules](performance-rules.md)
`);

// 7. git-rules.md
writeFile('.ai/rules/git-rules.md', `# 🌿 Git Rules & Branching Standards

## 1. Purpose
To maintain clean, linear project histories with clear traceability.

## 2. Scope
Applies to all commits, branch lifecycles, PR flows, and releases.

## 3. Core Principles
- **Linear History**: Rebase feature branches before merging; avoid messy merge commits.
- **Traceability**: Commit messages must refer to specific technical contexts or tickets.
- **Immutable Releases**: Do not modify tags or release artifacts once deployed.

## 4. Mandatory Rules
- **Branch Naming**: Enforce standard prefixes: \`feat/\`, \`fix/\`, \`docs/\`, \`refactor/\`, \`perf/\`.
- **Semantic Commit Messages**: Format commits as: \`<type>(<scope>): <short description>\` (e.g., \`feat(portfolio): add kelly sizing sliders\`).
- **PR Gateways**: Pull requests must pass all linter and compilation checks before merge approval.
- **Rebase Policy**: Always merge with Fast-Forward options or squash branch commits to clean up history.

## 5. Recommended Practices
- Tag releases with explicit SemVer specifications (e.g., \`v1.2.0\`).
- Delete remote branches immediately following successful merge operations.

## 6. Examples

### 🟢 Good Commit History
__BTT__
feat(ingest): add betway sa decimal scraper
fix(math): fix float overflow in fractional kelly
docs(rules): update database-rules with soft delete rules
__BTT__

## 7. Anti-patterns & Common Mistakes
- **WIP Commits**: Committing un-buildable or un-linted code under generic "WIP" titles.
- **Force Pushing Main**: Force-pushing (\`git push -f\`) directly to the main or staging branches.

## 8. Decision Tree: Commit Formatting
\`\`\`mermaid
graph TD
    A[New commit ready] --> B{Does it introduce a feature?}
    B -->|Yes| C[Commit with: feat(...)]
    B -->|No| D{Does it fix a bug?}
    D -->|Yes| E[Commit with: fix(...)]
    D -->|No| F[Commit with: chore/refactor/docs(...)]
\`\`\`

## 9. Review Checklist
- [ ] Does the commit follow SemVer standards?
- [ ] Is the branch rebased and free of merge conflicts?
- [ ] Has the pull request passed all CI compilation checks?

## 10. Automation Opportunities
- Husky git-hooks enforce commit-message formatting locally on developer workstations.

## 11. Future Improvements
- Auto-generate change logs on release tag commits.

## 12. Revision History
- **v1.0.0**: Defined strict branching conventions.

## 13. Related Documents
- [Documentation Rules](documentation-rules.md)
- [Review Rules](review-rules.md)
`);

// 8. documentation-rules.md
writeFile('.ai/rules/documentation-rules.md', `# 📖 Documentation Rules & Guidelines

## 1. Purpose
To preserve enterprise-grade architectural logic and complete algorithmic clarity for humans and AI agents.

## 2. Scope
Applies to markdown files, index documentations, Swagger definitions, and inline code documentation blocks.

## 3. Core Principles
- **Living Memory**: Documentation must represent the current actual system states; never let documents become stale.
- **Zero Ambiguity**: Business logic and math parameters must contain clear definitions with mathematical equations ($$\\LaTeX$$).
- **Asymmetry Preservation**: Ensure all platform structures, directories, and data lineages are accurately represented.

## 4. Mandatory Rules
- **No Placeholders**: Never write TODOs, stubs, or placeholders inside rules or guides. All sections must be complete.
- **Mermaid Diagrams**: Complex sequence flows or architecture structures must utilize native Mermaid diagrams.
- **API Swagger Upgrades**: Every FastAPI modification must maintain fully typed Pydantic descriptions.
- **Refactoring Records**: Track major technical changes inside explicit Architecture Decision Records (ADR).

## 5. Recommended Practices
- Use clean Markdown syntax, checking links and image rendering before push operations.
- Cross-reference related files explicitly at the bottom of every rule document.

## 6. Examples

### 🟢 Good Dynamic Formulas
$$\\text{Value Edge} = (\\text{Bookmaker Odds} \\times P_{\\text{model}}) - 1.0 > 0.0$$

### 🔴 Bad Documentation Block
__BTT__
# Odds parser
TODO: Write how this works later when we finish the code.
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Stale Context**: Updating core code files (e.g., adding a table) but neglecting database schema or architecture documentations.
- **Verbose Clutter**: Writing long paragraphs about standard setup steps instead of keeping guides highly scannable.

## 8. Decision Tree: When to update docs?
\`\`\`mermaid
graph TD
    A[Code change executed] --> B{Does it modify database or API?}
    B -->|Yes| C[Update database.md/api.md and ADR]
    B -->|No| D{Does it change business formulas?}
    D -->|Yes| E[Update business-rules.md]
    D -->|No| F[No documentation update required]
\`\`\`

## 9. Review Checklist
- [ ] Are all equations rendered in valid LaTeX format?
- [ ] Is there zero placeholder text inside the file?
- [ ] Are related links fully resolved and correct?

## 10. Automation Opportunities
- Automated documentation link sweeps flag dead relative anchors on commits.

## 11. Future Improvements
- Deploy automated documentation build pipelines outputting high-fidelity static pages.

## 12. Revision History
- **v1.0.0**: Outlined platform documentation standards.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Git Rules](git-rules.md)
`);

// 9. naming-rules.md
writeFile('.ai/rules/naming-rules.md', `# 🏷️ Naming Rules & Conventions

## 1. Purpose
To eliminate cognitive overhead by maintaining completely predictable names.

## 2. Scope
Applies to all files, variables, folders, classes, routes, and environment parameters in the repository.

## 3. Core Principles
- **Descriptive Over Compact**: Prioritize readability over brief naming styles. Prefer \`calculated_kelly_percentage\` to \`ckp\`.
- **Aesthetic Pairings**: Match filenames and exports closely to their operational target domains.
- **Case Consistency**: Use standard case rules for different file types.

## 4. Mandatory Rules
- **Directories & Folders**: Lowercase, plural, separated by underscores (e.g., \`backend/services/pure_domain/\`).
- **Python Files**: snake_case (e.g., \`match_evaluator.py\`).
- **TypeScript Files**: PascalCase for React components (\`PredictionCard.tsx\`), camelCase for utility scripts (\`formatOdds.ts\`).
- **Python Classes**: PascalCase (\`ValueBetFinder\`).
- **Functions & Variables**: camelCase in TypeScript (\`const isValueBet = ...\`), snake_case in Python (\`def get_best_odds(...)\`).
- **Constants**: UPPERCASE snake_case (\`MAX_SINGLE_ALLOCATION_PCT = 0.05\`).

## 5. Recommended Practices
- Use prefixes for API routes reflecting their hierarchy (e.g., \`/api/v1/predictions\`).
- Always match environment variable naming keys to \`.env.example\`.

## 6. Examples

### Naming Table Matrix
| Entity | Case Style | Example |
| :--- | :--- | :--- |
| Folder / Directory | Lowercase snake_case | \`portfolio_slips\` |
| React Component | PascalCase | \`KellySizerWidget.tsx\` |
| Python Service | PascalCase | \`SizerService\` |
| Local Variable | camelCase (TS) / snake_case (Py) | \`activeSlips\` / \`active_slips\` |
| Database Table | Lowercase plural | \`historical_odds\` |

## 7. Anti-patterns & Common Mistakes
- **Hungarian Notation**: Prefixes like \`str_name\` or \`arr_scores\` inside modern typed code.
- **Ambiguous Flags**: Naming booleans \`status\` or \`active\` instead of descriptive names like \`is_active\` or \`has_settled\`.

## 8. Decision Tree: Creating Names
\`\`\`mermaid
graph TD
    A[New file created] --> B{Is it a React component?}
    B -->|Yes| C[PascalCase: MatchWidget.tsx]
    B -->|No| D{Is it a Python source file?}
    D -->|Yes| E[snake_case: odds_scraper.py]
    D -->|No| F[Follow specific file format standard]
\`\`\`

## 9. Review Checklist
- [ ] Are all React components written in PascalCase?
- [ ] Do constant variables use strict UPPERCASE snake_case?
- [ ] Are folders formatted in lowercase snake_case?

## 10. Automation Opportunities
- Ruff linter warns on non-snake_case functions in Python.

## 11. Future Improvements
- Strict folder and filename enforcement validation tools on commit.

## 12. Revision History
- **v1.0.0**: Initial naming standards established.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Database Rules](database-rules.md)
`);

// 10. performance-rules.md
writeFile('.ai/rules/performance-rules.md', `# ⚡ Performance Rules & Standards

## 1. Purpose
To guarantee sub-second rendering, instant calculations, and high async data ingestion throughput.

## 2. Scope
Applies to DB indexing, query execution pathways, API responses, React state updates, and worker scheduling.

## 3. Core Principles
- **No Lookups Inside Loops**: Prevent $O(N^2)$ calculations, especially in rolling timeseries evaluations.
- **Cache Volatile Aggregations**: Serve read-heavy match statistics directly from memory caching brokers.
- **Stateless Execution**: Minimize server session payloads to speed up container ingress.

## 4. Mandatory Rules
- **API Response Target**: REST API endpoints must return results in under 200ms at the 95th percentile.
- **Database Partitioning**: Maintain high-frequency time-series tables under active TimescaleDB hypertables.
- **React State Budget**: Minimize expensive parent components re-renders; memoize heavy charts using \`useMemo\`.
- **Connection Pools**: Database adapters must implement connection pooling to recycle active sessions.

## 5. Recommended Practices
- Use Redis keys with 5-minute TTL constraints for volatile match lists.
- Stream large odds datasets asynchronously instead of buffering files in memory.

## 6. Examples

### 🟢 Good Python Optimizations (Connection Reuse)
__BTT__python
# Reusing session pool structures instead of spawning DB connection on every iteration
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import create_engine

engine = create_engine("postgresql://...", pool_size=10, max_overflow=20)
SessionLocal = scoped_session(sessionmaker(bind=engine))
__BTT__

## 7. Anti-patterns & Common Mistakes
- **N+1 Queries**: Fetching matches and subsequently running individual queries to fetch odds for each match in a loop.
- **Unbounded React Renders**: Modifying state in components without restricting useEffect arrays.

## 8. Decision Tree: Optimize Pipeline
\`\`\`mermaid
graph TD
    A[API route exceeds 200ms budget] --> B{Does it run DB queries?}
    B -->|Yes| C{Are composite indexes applied?}
    C -->|No| D[Apply indices and retest]
    C -->|Yes| E[Apply Redis cache layer with 5m TTL]
    B -->|No| F[Optimize business logic algorithmic complexity]
\`\`\`

## 9. Review Checklist
- [ ] Are all high-frequency API responses cached?
- [ ] Are there zero N+1 database operations?
- [ ] Do heavy charting components use React memoization?

## 10. Automation Opportunities
- Performance test suites execute automated benchmark validations on master merges.

## 11. Future Improvements
- Transition to TimescaleDB continuous aggregate materialized views.

## 12. Revision History
- **v1.0.0**: Outlined sub-200ms latency standard configurations.

## 13. Related Documents
- [Database Rules](database-rules.md)
- [Logging Rules](logging-rules.md)
`);

// 11. logging-rules.md
writeFile('.ai/rules/logging-rules.md', `# 📝 Logging Rules & Structured Logging Standards

## 1. Purpose
To ensure full observability, instant diagnostics, and clear audit tracing on live production instances.

## 2. Scope
Applies to all application routers, background jobs, model execution logs, and transactional records.

## 3. Core Principles
- **Structure Over Text**: Raw text tracebacks are strictly banned. All server logs must use structured JSON.
- **Strict Anonymization**: Never log PII, passwords, private keys, or secure session credentials.
- **Trace Context Preservation**: Maintain trace identifiers across async queues and client interfaces.

## 4. Mandatory Rules
- **JSON Format**: Every log entry must compile as a valid single-line JSON document.
- **Correlated Logs**: API gateways must inject a \`trace_id\` header and propagate it to all background processes.
- **Log Levels**: Use levels correctly:
  - \`INFO\`: Standard server starts, scheduled jobs, slip additions.
  - \`WARNING\`: Rate limiting triggers, database retries, validation errors.
  - \`ERROR\`: Unhandled exceptions, scraper crashes, DB connection drops.
- **PII Scrubbing**: Logs must pass sanitization filters preventing key exposures.

## 5. Recommended Practices
- Log Kelly mathematical inputs alongside sizer execution runs to track potential deviations.
- Forward logs to central collectors using standard agents.

## 6. Examples

### 🟢 Good JSON Log Payload
__BTT__json
{"timestamp": "2026-06-28T22:42:35Z", "trace_id": "ab99-1223-aff6", "level": "INFO", "message": "Calculated value-betting slip", "edge": 0.144, "stake": 0.05}
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Text Logs**: Using standard \`print()\` or unconfigured logging setups in production.
- **Sensitive Data Logging**: Outputting full request structures containing login passwords.

## 8. Decision Tree: Logging Exceptions
\`\`\`mermaid
graph TD
    A[Exception raised in service] --> B{Is it a business error?}
    B -->|Yes| C[Log at WARNING level with context fields]
    B -->|No| D[Log at ERROR level with stacktrace field inside JSON payload]
\`\`\`

## 9. Review Checklist
- [ ] Are all log lines output as valid single-line JSON?
- [ ] Is the trace ID propagated cleanly across the service flow?
- [ ] Are passwords and API credentials sanitized?

## 10. Automation Opportunities
- Continuous monitoring systems alert on elevated counts of \`ERROR\` logs automatically.

## 11. Future Improvements
- Implement distributed trace dashboards tracking request times across micro-service calls.

## 12. Revision History
- **v1.0.0**: Structured JSON logging standards established.

## 13. Related Documents
- [Security Rules](security-rules.md)
- [Performance Rules](performance-rules.md)
`);

// 12. review-rules.md
writeFile('.ai/rules/review-rules.md', `# 🔍 Code Review Rules & Quality Gateways

## 1. Purpose
To maintain zero-compromise engineering standards through clean, structured review checklists.

## 2. Scope
Applies to all pull requests, feature merges, and repository updates.

## 3. Core Principles
- **Objective Criteria**: Reviews must evaluate code against concrete guidelines rather than personal opinions.
- **Automation First**: Linter and compile checks must pass before a human or AI reviewer begins evaluation.
- **Rigorous Proofs**: Ensure all math, models, and security limits are validated during review gates.

## 4. Mandatory Rules
- **Linter Gates**: No human review may occur until \`Ruff\` and \`npm run lint\` compile with zero errors.
- **Coverage Minimums**: PRs reducing coverage budgets below the 90% threshold must be rejected.
- **Security Scans**: Evaluate all PRs for secrets leaks, unprotected endpoints, and SQL parameters.
- **Calibrated Verification**: Ensure machine learning modifications include out-of-sample log-loss reviews.

## 5. Recommended Practices
- Standardize PR templates requiring code authors to list related tickets and test instructions explicitly.
- Maintain a friendly, supportive tone in all feedback cycles.

## 6. Comprehensive Review Checklist Matrix

### 📁 Architecture Review
- [ ] Code strictly respects layer integrity boundaries.
- [ ] Repository pattern is used for all database operations.
- [ ] No circular dependencies exist between domains.

### 🛡️ Security Review
- [ ] All API credentials remain strictly server-side.
- [ ] Inputs are fully validated and parameterized.
- [ ] CORS is restricted to production domains.

### ⚡ Performance Review
- [ ] Database queries are indexed. No N+1 queries.
- [ ] Volatile API endpoints are cached (Redis).
- [ ] React components are memoized.

### 🧪 Testing Review
- [ ] Statement coverage meets the 90% threshold.
- [ ] Mock adapters isolate tests from external networks.
- [ ] Lookahead bias detection tests are implemented.

## 7. Anti-patterns & Common Mistakes
- **LGTM Reviews**: Approving PRs quickly without active code execution or test verifications.
- **Mixing Scope**: Bundling unrelated refactoring inside a bugfix pull request.

## 8. Decision Tree: PR Acceptance
\`\`\`mermaid
graph TD
    A[PR submitted] --> B{Does it pass lint and compile checks?}
    B -->|No| C[Reject instantly]
    B -->|Yes| D{Does statement coverage exceed 90%?}
    D -->|No| E[Request more tests]
    D -->|Yes| F[Proceed with manual / AI checklist approvals]
\`\`\`

## 9. Automation Opportunities
- Automatic GitHub checks block merging until all unit tests and security reviews pass.

## 11. Future Improvements
- Deploy AI reviewer bots to comment on standard naming and architecture rules automatically.

## 12. Revision History
- **v1.0.0**: Initial code review pipeline configuration.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Security Rules](security-rules.md)
`);

// 13. prompt-rules.md
writeFile('.ai/rules/prompt-rules.md', `# 🧠 Prompt Rules & AI Behavior Standards

## 1. Purpose
To govern how AI assistants interpret prompt contexts, design plans, and execute code within the repository.

## 2. Scope
Applies to all developer-to-AI interactions, prompt specifications, and autonomous development loops.

## 3. Core Principles
- **No Speculative Actions**: Always inspect current file states before attempting edits. Never assume structures.
- **Incremental Implementation**: Execute changes in logical, modular steps; verify code builds after each change.
- **Strict Compliance**: The instructions in \`.ai/rules/\` and \`.ai/context/\` are absolute. No AI generation may bypass them.

## 4. Mandatory Rules
- **Read First**: Always call \`view_file\` on targeting files before issuing \`edit_file\` or \`multi_edit_file\` operations.
- **Formulate Design Plan**: For any change request, formulate a maximum 3-bullet plan before starting coding, unless the user requests informational feedback.
- **Fail Gracefully**: If a build fails, analyze the logs, correct the targeted file, and compile again. Limit consecutive attempts to 3.
- **No Mock Stubs**: AI assistants must write production-ready, fully typed code. Fake placeholders or simulated databases are strictly forbidden.

## 5. Recommended Practices
- Summarize final accomplishments using clear, humble, and design-focused outcomes.
- Proactively suggest updating \`AGENTS.md\` or \`GEMINI.md\` when encountering repetitive design constraints.

## 6. Examples

### 🟢 Good AI Thinking Process
1. Inspect \`metadata.json\` and \`package.json\` to verify active project scopes.
2. Read targeting components explicitly to locate target lines.
3. Apply precise edits, run \`compile_applet\` to confirm build status, and summarize outcomes.

## 7. Anti-patterns & Common Mistakes
- **Over-Engineering**: Implementing unrequested pages, sidebars, or complex layouts for simple single-view tools.
- **Loose API Calls**: Guessing route paths or database properties instead of inspecting existing codebase states.

## 8. Decision Tree: AI Execution Path
\`\`\`mermaid
graph TD
    A[User requests change] --> B[Formulate 3-bullet plan]
    B --> C[Read targeting code files]
    C --> D[Apply edits incrementally]
    D --> E[Run compile_applet and confirm build]
    E --> F[Provide concise scannable summary]
\`\`\`

## 9. Review Checklist
- [ ] Did the AI assistant formulate a 3-bullet plan before coding?
- [ ] Were all modified files read immediately before editing?
- [ ] Did the build compile successfully?

## 10. Automation Opportunities
- Prompt rules are automatically injected into system contexts for every turn of the agent.

## 11. Future Improvements
- Continuous fine-tuning of system templates to optimize structural alignment with project architectures.

## 12. Revision History
- **v1.0.0**: Outlined mandatory AI behavior rules.

## 13. Related Documents
- [AI Rules](ai-rules.md)
- [Review Rules](review-rules.md)
`);

// 14. deployment-rules.md
writeFile('.ai/rules/deployment-rules.md', `# 🐳 Deployment Rules & Release Standards

## 1. Purpose
To guarantee zero-downtime, fully secure, and observable production releases.

## 2. Scope
Applies to Docker configurations, container ingress paths, rollback triggers, and environment promotions.

## 3. Core Principles
- **Immutable Artifacts**: Production containers must be compiled once, tested, and promoted across environments unchanged.
- **Twelve-Factor App Configuration**: Store all application secrets and URLs strictly inside environment configurations.
- **Zero-Downtime Swaps**: Releases must execute blue-green deployment transitions to prevent user service drops.

## 4. Mandatory Rules
- **Ingress Mapping**: All external traffic routes exclusively through Nginx reverse proxies on container **Port 3000**.
- **Container Sizing**: Dockerfiles must use multi-stage builds to maintain a secure footprint under 300MB.
- **Health Verification**: Containers must expose a secure health endpoint (\`/api/health\`) returning status details.
- **Automatic Rollbacks**: Deployments must revert to the previous container image automatically if health checks fail.

## 5. Recommended Practices
- Execute smoke tests on green staging environments before shifting live DNS routing tables.
- Isolate development networks completely from production database replicas.

## 6. Examples

### 🟢 Good Multi-Stage Production Dockerfile Example
__BTT__dockerfile
# Stage 1: Build static assets and dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Clean production container
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Hardcoded URLs**: Embedding production API or database connection URLs directly inside Docker configurations.
- **Deploying Untested Containers**: Promoting images to production without passing automated test coverage benchmarks.

## 8. Decision Tree: Deployment Steps
\`\`\`mermaid
graph TD
    A[Build container image] --> B[Run pytest and client validations]
    B -->|Pass| C[Deploy to Green instance]
    B -->|Fail| D[Halt build and alert team]
    C --> E{Does /api/health pass?}
    E -->|Yes| F[Route live traffic to Green and reclaim Blue]
    E -->|No| G[Trigger immediate rollback to last Blue stable image]
\`\`\`

## 9. Review Checklist
- [ ] Is multi-stage Docker compilation working?
- [ ] Is port 3000 mapped correctly?
- [ ] Do health checks execute automatically on startup?

## 10. Automation Opportunities
- Automated deployment pipelines triggered on main branch master merges.

## 11. Future Improvements
- Implement canary release loops to shift minor user percentages slowly to new updates.

## 12. Revision History
- **v1.0.0**: Initial deployment architecture specifications defined.

## 13. Related Documents
- [Architecture Rules](architecture-rules.md)
- [Performance Rules](performance-rules.md)
`);

// 15. refactoring-rules.md
writeFile('.ai/rules/refactoring-rules.md', `# 🔄 Refactoring Rules & Standards

## 1. Purpose
To ensure code remains highly maintainable without introducing regressions or changing functional outcomes.

## 2. Scope
Applies to all code refactoring exercises, cleanup branches, and dependency upgrades.

## 3. Core Principles
- **Refactor vs. Feature Separation**: Refactoring must never be mixed with feature development or bug fixes in the same branch.
- **Regression Proofing**: Verify existing test coverage before modifying code. Run the test suite before and after refactoring.
- **Incremental Steps**: Apply small, targeted edits. Avoid rewriting entire modules in single sweeps.

## 4. Mandatory Rules
- **No Behavioral Changes**: Refactoring must only change code structure, never functional outputs or business mathematics.
- **Verify test budgets**: If coverage declines after refactoring, the change must be rejected.
- **Deprecation Warning**: Mark outdated interfaces or modules with explicit deprecation annotations prior to final removal.
- **Review gates**: Major refactoring sweeps must be backed by an Architecture Decision Record (ADR).

## 5. Recommended Practices
- Write structural unit tests to guard complex math formulas before altering their internal paths.
- Avoid cleaning code simply to match styling preferences unless it strictly improves cyclomatic complexity scores.

## 6. Examples

### 🟢 Good Refactoring (Decoupled Sizer Logic)
__BTT__python
# Decoupling sizer parameters from DB objects to allow unit test execution without database connection
def calculate_stake(bankroll: float, odds: float, probability: float) -> float:
    # Isolated business math
    return bankroll * ((odds * probability - 1) / (odds - 1)) * 0.1
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Refactogedon**: Making extensive edits across multiple domains at once, resulting in un-mergeable branches.
- **Sneaking Features**: Slipping minor functional requests inside refactoring commits.

## 8. Decision Tree: When is refactoring allowed?
\`\`\`mermaid
graph TD
    A[Code smell identified] --> B{Are there existing unit tests?}
    B -->|No| C[Write unit tests first to establish safety baseline]
    B -->|Yes| D{Does code compile cleanly?}
    D -->|Yes| E[Apply targeted, incremental refactoring step and re-run tests]
    D -->|No| F[Fix build compilation before refactoring]
\`\`\`

## 9. Review Checklist
- [ ] Did functional outcomes remain 100% identical?
- [ ] Has the test suite been executed with green results?
- [ ] Are deprecation timelines explicitly documented?

## 10. Automation Opportunities
- Linter checks and test coverages run automatically in pre-commit loops to guard against regressions.

## 11. Future Improvements
- Integrate automated code smell analysis tools flagging high complexity indices.

## 12. Revision History
- **v1.0.0**: Outlined strict refactoring safety policies.

## 13. Related Documents
- [Coding Rules](coding-rules.md)
- [Testing Rules](testing-rules.md)
`);

// 16. ml-rules.md
writeFile('.ai/rules/ml-rules.md', `# 🧠 Machine Learning Rules & Modeling Standards

## 1. Purpose
To guarantee robust, calibrated, and reproducible predictions while eliminating lookahead risk.

## 2. Scope
Applies to training pipelines, feature store updates, calibration processes, and live inference.

## 3. Core Principles
- **Statistical Calibration Over Accuracy**: Focus on probability calibration (Platt Scaling) over raw binary classification accuracy.
- **Zero Lookahead Risk**: Enforce rigid chronological dataset splitting to prevent future results from polluting past parameters.
- **Reproducible Pipeline**: Ensure seed configurations, hyperparameter ranges, and feature logs are fully tracked.

## 4. Mandatory Rules
- **Calibration Check**: All outcome classifiers (LightGBM, XGBoost) must pass Platt Scaling calibration tests ($R^2 > 0.92$).
- **No Future Leakage**: Training pipelines must separate training features chronologically using strict timezone-aware indices.
- **Ensemble Validation**: Validate that overall log-loss scores on out-of-sample datasets remain below 0.62.
- **Weekly Evaluation**: Evaluate models weekly. Retrain if out-of-sample log-loss rises by more than 0.05 (model drift detection).

## 5. Recommended Practices
- Save model configurations as standardized, version-controlled serialized artifact matrices.
- Monitor feature importances dynamically to trace predictive performance shifts.

## 6. Examples

### 🟢 Good Calibration Validation Code Pattern
__BTT__python
from sklearn.calibration import CalibratedClassifierCV
from lightgbm import LGBMClassifier

def train_calibrated_model(X_train, y_train):
    """Trains a LightGBM model calibrated with Platt Scaling."""
    base_clf = LGBMClassifier(n_estimators=100, random_state=42)
    # Calibrate probabilities using sigmoid scaling (Platt Scaling)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X_train, y_train)
    return calibrated_clf
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Random Splits on Timeseries**: Using standard random train-test splits on historical matches, causing lookahead leakage.
- **Uncalibrated Probabilities**: Using raw model outputs directly for Kelly stakes without overround removal or calibration.

## 8. Decision Tree: Model Promotion
\`\`\`mermaid
graph TD
    A[New model trained] --> B{Does out-of-sample log-loss <= 0.62?}
    B -->|No| C[Reject model and adjust features]
    B -->|Yes| D{Does calibration curve pass R^2 > 0.92?}
    D -->|No| E[Apply scaling adapters]
    D -->|Yes| F[Promote model to staging]
\`\`\`

## 9. Review Checklist
- [ ] Are datasets partitioned strictly on chronological boundaries?
- [ ] Has model calibration been computed and evaluated?
- [ ] Is out-of-sample log-loss under 0.62?

## 10. Automation Opportunities
- Automatic weekly drift monitors trigger retraining runs and update metrics dashboards.

## 11. Future Improvements
- Integrate neural sequencing layers (LSTM / Transformer networks) to process dynamic match-day events.

## 12. Revision History
- **v1.0.0**: Initial ML standards, lookahead controls, and calibration standards.

## 13. Related Documents
- [Data Rules](data-rules.md)
- [Testing Rules](testing-rules.md)
`);

// 17. data-rules.md
writeFile('.ai/rules/data-rules.md', `# 📊 Data Rules & Validation Standards

## 1. Purpose
To ensure total data quality, consistency, and traceability throughout ingestion and processing.

## 2. Scope
Applies to public tables, scraper payloads, feature stores, and relational data migrations.

## 3. Core Principles
- **Validation at Ingress**: Validate raw data immediately upon collection. Never allow malformed data into database tables.
- **Immutable Raw Logs**: Preserve raw ingested logs exactly as parsed. Do not modify source records.
- **Clear Data Lineage**: Document and trace feature calculations back to their original source tables.

## 4. Mandatory Rules
- **Pydantic Validation**: All incoming scraper structures must conform to and validate against Pydantic schemas.
- **Handling Missing Values**: Impute missing variables using clear, non-lookahead methodologies (e.g., historical group medians).
- **Outlier Bounds**: Detect and flag extreme odds or results (e.g., Odds < 1.01) before persistence operations.
- **Anonymization**: Never store PII or unencrypted credentials inside dataset entities.

## 5. Recommended Practices
- Maintain detailed logs of feature transformations to ensure ease of debugging.
- Run automated database health checks to identify dangling foreign keys or unindexed nodes.

## 6. Examples

### 🟢 Good Scraper Ingress Validation
__BTT__python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class OddsScrapeDto(BaseModel):
    match_id: int
    bookmaker: str = Field(min_length=2, max_length=50)
    odds_home: float = Field(gt=1.0)
    odds_draw: float = Field(gt=1.0)
    odds_away: float = Field(gt=1.0)
    scraped_at: datetime

    @field_validator("odds_home")
    def validate_realistic_odds(cls, value: float) -> float:
        if value > 1000.0:
            raise ValueError("Odds are unrealistically high")
        return value
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Silent Data Corruption**: Failing to check for empty strings or invalid float parses, resulting in downstream runtime crashes.
- **Mutating Historical Records**: Modifying live database rows to adjust features instead of logging new timeseries entries.

## 8. Decision Tree: Ingest Pipeline
\`\`\`mermaid
graph TD
    A[Scraper fetches odds] --> B{Does payload pass Pydantic schema?}
    B -->|Yes| C[Save raw odds to TimescaleDB]
    B -->|No| D[Log validation warning and drop payload]
\`\`\`

## 9. Review Checklist
- [ ] Are all raw incoming payloads validated via Pydantic?
- [ ] Are outliers and anomalies handled securely?
- [ ] Is there clear lineage tracking for feature transformations?

## 10. Automation Opportunities
- Ingest pipelines automatically monitor payload volumes and raise alerts on drops.

## 11. Future Improvements
- Deploy real-time schema registry validation across all data-sharing interfaces.

## 12. Revision History
- **v1.0.0**: Initial data quality and Pydantic validation standards.

## 13. Related Documents
- [ML Rules](ml-rules.md)
- [Database Rules](database-rules.md)
`);

// 18. automation-rules.md
writeFile('.ai/rules/automation-rules.md', `# ⚙️ Automation Rules & Background Task Standards

## 1. Purpose
To maintain resilient, idempotent, and highly available background task queues.

## 2. Scope
Applies to scraper crons, model drift evaluators, database cleanup workers, and alerting pipelines.

## 3. Core Principles
- **Strict Idempotency**: Running a background task multiple times must produce the exact same outcome. No double-allocation risks.
- **Fail Gracefully with Backoffs**: Network failures must execute structured exponential retry loops.
- **Total Observability**: Monitor task execution volumes, durations, and failure frequencies.

## 4. Mandatory Rules
- **Idempotent Slips**: Portfolio allocation tasks must match against unique identifiers to prevent duplicate logins.
- **Retry Backoff**: Celery worker tasks must implement exponential backoff loops ($5s, 15s, 60s, 300s$).
- **Scraper Proxy Rotation**: Scraper adapters must rotate target request profiles to bypass rate blocks.
- **Instant Alerts**: If tasks fail 3 consecutive times, trigger alerting webhooks to the dev channel immediately.

## 5. Recommended Practices
- Log execution durations to trace performance bottlenecks.
- Separate high-priority short tasks (slip log) from low-priority long tasks (historical scraping) using dedicated queues.

## 6. Examples

### 🟢 Good Idempotent Worker Design Pattern
__BTT__python
from celery import Celery
import time

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3)
def scrape_betway_odds(self, match_id: int):
    try:
        # Perform scraping operations
        pass
    except Exception as exc:
        # Exponential backoff retry: 5s, 25s, 125s
        retry_delay = 5 ** (self.request.retries + 1)
        raise self.retry(exc=exc, countdown=retry_delay)
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Unbounded Retries**: Retrying tasks infinitely, resulting in worker queue blocks.
- **Double Stakes Execution**: Placing multiple slips because a worker thread completed slowly and triggered a second attempt.

## 8. Decision Tree: Task Scheduling
\`\`\`mermaid
graph TD
    A[New worker task created] --> B{Does it write transactions?}
    B -->|Yes| C[Enforce strict idempotency validation checks]
    B -->|No| D{Does it interact with external APIs?}
    D -->|Yes| E[Configure proxy rotation and backoff retries]
    D -->|No| F[Standard scheduling config]
\`\`\`

## 9. Review Checklist
- [ ] Are all transaction tasks designed to be strictly idempotent?
- [ ] Do external scraper workers implement proxy rotation?
- [ ] Are retry limits configured with exponential backoffs?

## 10. Automation Opportunities
- System monitoring suites track queue depths and automatically provision additional workers during busy weekends.

## 11. Future Improvements
- Implement self-healing schedules that automatically scale target request gaps based on active rate limits.

## 12. Revision History
- **v1.0.0**: Defined strict background worker and retry standards.

## 13. Related Documents
- [Performance Rules](performance-rules.md)
- [Logging Rules](logging-rules.md)
`);

// 19. ai-rules.md
writeFile('.ai/rules/ai-rules.md', `# 🤖 AI Rules & Autonomous Agent Directives

## 1. Purpose
To establish the ultimate operational constitution, behavioral mandates, and quality rules for every AI coding assistant contributing to this repository.

## 2. Scope
Applies to all code generations, edits, planning sequences, reviews, and memory updates made by AI systems.

## 3. Core Principles
- **Read-Before-Write Mandate**: Never modify, add, or delete files without first calling \`view_file\` to verify their current state.
- **Zero Placeholder Tolerance**: TODO comments, code stubs, or placeholder implementations are strictly banned. Produce 100% complete, production-ready code.
- **Zero-Regression Principle**: Preserve and test existing functionality. Ensure backward compatibility across all integration files.

## 4. Mandatory Rules
- **Onboarding Check**: Always read [START_HERE.md](/START_HERE.md), [README.md](/README.md), and all files inside \`.ai/context/\` prior to execution.
- **Formulate Design Plan**: For any change request, formulate a maximum 3-bullet plan before starting coding, unless the user requests informational feedback.
- **Verify with Build**: Run \`compile_applet\` to verify that modifications build successfully. If errors occur, resolve them immediately and compile again (maximum of 3 attempts before stopping).
- **Update Living Records**: Keep logs, changelogs, database records, and rules directories fully updated.
- **HMR WS Warning**: Ignore benign WebSocket connection errors during developer builds.

## 5. Recommended Practices
- Suggest optimizing developer conventions when repetitive patterns emerge.
- Maintain a humble, professional, and scannable communication rhythm.

## 6. Examples

### 🟢 Good AI Planning Sequence
__BTT__
1. Read the targeting component.
2. Formulate 3-bullet plan.
3. Apply precise modular modifications.
4. Run compile_applet and confirm build.
5. Summarize the accomplishments.
__BTT__

## 7. Anti-patterns & Common Mistakes
- **Stale Context Errors**: Attempting surgical code edits without reading targeting lines first, leading to mismatch failures.
- **Unrequested Feature Bloat**: Adding complex layouts or secondary APIs when only simple single-screen tools are requested.

## 8. Decision Tree: AI Thinking Process
\`\`\`mermaid
graph TD
    A[Receive prompt request] --> B[Check metadata and project context]
    B --> C[Verify exact file states using view_file]
    C --> D[Identify potential Skill triggers]
    D --> E[Formulate design plan and execute code edits]
    E --> F[Run compile_applet and verify build status]
    F --> G[Log completed accomplishments]
\`\`\`

## 9. Review Checklist
- [ ] Were all edited files read prior to modification?
- [ ] Did the assistant formulate a 3-bullet plan?
- [ ] Is the generated code entirely complete and free of TODO placeholders?

## 10. Automation Opportunities
- System contexts automatically inject these rules to guide agent execution.

## 11. Future Improvements
- Refine model alignments to maximize structural compatibility with modular file separations.

## 12. Revision History
- **v1.0.0**: Initial operational directives established.

## 13. Related Documents
- [Prompt Rules](prompt-rules.md)
- [Review Rules](review-rules.md)
`);

console.log('🎉 System Rules Generation Complete! All 19 rule files are fully populated and complete.');
