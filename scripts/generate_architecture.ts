import * as fs from 'fs';
import * as path from 'path';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, content: string) {
  const absolutePath = path.resolve(filePath);
  ensureDir(path.dirname(absolutePath));
  const processed = content.trim().replace(/__BTT__/g, '```') + '\n';
  fs.writeFileSync(absolutePath, processed, 'utf-8');
}

console.log('Generating Enterprise Architecture Knowledge Base...');

const folder = '.ai/architecture';

// Helper to generate the standard layout requested
function buildDoc(title: string, spec: {
  purpose: string;
  scope: string;
  responsibilities: string[];
  principles: string[];
  decisions: string[];
  bestPractices: string[];
  antiPatterns: string[];
  security: string;
  performance: string;
  scalability: string;
  testing: string;
  operations: string;
  mistakes: string[];
  improvements: string[];
  checklist: string[];
  history: { version: string; date: string; changes: string }[];
  references: string[];
  diagrams?: string;
  customSections?: string;
}) {
  const responsibilitiesStr = spec.responsibilities.map(r => `- **Responsibility**: ${r}`).join('\n');
  const principlesStr = spec.principles.map(p => `- **Design Principle**: ${p}`).join('\n');
  const decisionsStr = spec.decisions.map(d => `- **Architectural Decision**: ${d}`).join('\n');
  const bestPracticesStr = spec.bestPractices.map(bp => `- **Best Practice**: ${bp}`).join('\n');
  const antiPatternsStr = spec.antiPatterns.map(ap => `- **Anti-Pattern**: ${ap}`).join('\n');
  const mistakesStr = spec.mistakes.map(m => `- **Execution Mistake**: ${m}`).join('\n');
  const improvementsStr = spec.improvements.map(imp => `- **Future Improvement**: ${imp}`).join('\n');
  const checklistStr = spec.checklist.map(cl => `- [ ] **Verify**: ${cl}`).join('\n');
  const historyStr = spec.history.map(h => `- \`${h.version}\` (${h.date}): ${h.changes}`).join('\n');
  const referencesStr = spec.references.map(ref => `- [${ref}](${ref.toLowerCase().replace(/\s+/g, '-')}.md)`).join('\n');

  return `# 🦾 Enterprise Architecture: ${title}

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: ${spec.references.join(', ') || 'None'}
- **Revision History**:
${historyStr}

---

## 🎯 1. Purpose & Objectives
${spec.purpose}

---

## 🔍 2. Scope & Applicability
${spec.scope}

---

## 🏢 3. Structural Responsibilities
${responsibilitiesStr || '- *No direct structural responsibilities defined.*'}

---

## 🎨 4. Core Design Principles
${principlesStr || '- *No custom design principles defined.*'}

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
${decisionsStr || '- *No architectural decisions specified.*'}

---

${spec.diagrams ? `## 📊 6. Architectural Diagrams\n${spec.diagrams}\n\n---\n` : ''}

${spec.customSections ? `## ⚙️ 7. Core Technical Deep Dive\n${spec.customSections}\n\n---\n` : ''}

## 💡 8. Implementation Best Practices
${bestPracticesStr || '- *No core best practices identified.*'}

---

## ❌ 9. Architectural Anti-patterns
${antiPatternsStr || '- *No core anti-patterns identified.*'}

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: ${spec.security}

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: ${spec.performance}

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: ${spec.scalability}

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: ${spec.testing}

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: ${spec.operations}

---

## ⚠️ 15. Common Architectural Mistakes
${mistakesStr || '- *No common mistakes identified.*'}

---

## 🚀 16. Continuous Future Improvements
${improvementsStr || '- *No future improvements scheduled.*'}

---

## 🕵️ 17. Architecture Review Checklist
${checklistStr || '- [ ] *No validation checklist required.*'}

---

## 🔗 18. References & Linked Resources
${referencesStr || '- *No direct links mapped.*'}
`;
}

// 1. architecture-index.md
writeFile(`${folder}/architecture-index.md`, buildDoc('Architecture Directory Index', {
  purpose: 'Serves as the central navigation blueprint and structural index for all Enterprise Architecture documents on the Platform.',
  scope: 'Applies workspace-wide as the starting point for developers, system operators, and AI agents.',
  responsibilities: [
    'Define the structural mapping of the entire architecture handbook.',
    'Establish the recommended reading sequence and dependency mappings.',
    'Ensure clear classification of system architecture layers.'
  ],
  principles: [
    'Maintain a single source of truth for architectural directives.',
    'Enforce continuous cross-referencing between related modules.',
    'Keep documentation fully updated alongside major version changes.'
  ],
  decisions: [
    'Adopt a structured directory hierarchy mapped directly to platform execution contexts.',
    'Utilize clear metadata headers for tracking, review ownership, and compliance.'
  ],
  bestPractices: [
    'Refer to the Index before implementing features to find the correct system blueprints.',
    'Follow the foundational-to-operational reading order.'
  ],
  antiPatterns: [
    'Creating undocumented modules without adding them to this structural master index.',
    'Allowing file names and cross-references to diverge from the active directory tree.'
  ],
  security: 'The Master Index contains no private credentials or configuration assets, representing a safe public overview of the design blueprint.',
  performance: 'Optimized as low-overhead Markdown pages parsed quickly by both human eyes and multi-agent context builders.',
  scalability: 'Elastic, non-blocking documentation format that scales linearly with the number of system sub-modules.',
  testing: 'Verified via pre-commit documentation audits checking for broken markdown links and anchor elements.',
  operations: 'Maintained directly in git repositories to preserve comprehensive history tracking and structural reviews.',
  mistakes: [
    'Skipping the Index when onboarding new development resources.',
    'Creating circular references between isolated architecture sheets.'
  ],
  improvements: [
    'Integrate automated markdown checkers into CI/CD pipelines to ensure absolute link completeness.',
    'Enable dynamic Mermaid diagram updates directly from code structural parses.'
  ],
  checklist: [
    'Verify all 38 core architecture sheets are mapped inside the Index table.',
    'Confirm that zero broken relative paths exist between directories.'
  ],
  history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline enterprise index layout.' }],
  references: ['System Overview', 'Clean Architecture', 'Domain Driven Design'],
  diagrams: `
__BTT__mermaid
flowchart TD
    Index[architecture-index.md] --> Foundational[Foundational Guidelines]
    Index --> CoreEngine[Core Predict & Match Engine]
    Index --> Supporting[Supporting & Auth Modules]
    Index --> OpsLogs[Operations & Infrastructure]

    subgraph Foundational
        Foundational --> system-overview.md
        Foundational --> clean-architecture.md
        Foundational --> domain-driven-design.md
        Foundational --> bounded-contexts.md
    end

    subgraph CoreEngine
        CoreEngine --> module-interactions.md
        CoreEngine --> backend-architecture.md
        CoreEngine --> data-ingestion.md
        CoreEngine --> odds-provider.md
        CoreEngine --> feature-store.md
        CoreEngine --> feature-engineering.md
        CoreEngine --> ml-pipeline.md
        CoreEngine --> prediction-engine.md
        CoreEngine --> value-betting-engine.md
        CoreEngine --> bankroll-engine.md
        CoreEngine --> simulation-engine.md
    end

    subgraph Supporting
        Supporting --> frontend-architecture.md
        Supporting --> api-architecture.md
        Supporting --> database-architecture.md
        Supporting --> authentication-architecture.md
        Supporting --> authorization-architecture.md
        Supporting --> caching-architecture.md
        Supporting --> event-driven.md
        Supporting --> notification-engine.md
        Supporting --> reporting-engine.md
    end

    subgraph OpsLogs
        OpsLogs --> logging.md
        OpsLogs --> monitoring.md
        OpsLogs --> observability.md
        OpsLogs --> scalability.md
        OpsLogs --> infrastructure.md
        OpsLogs --> deployment.md
        OpsLogs --> disaster-recovery.md
        OpsLogs --> testing.md
    end
__BTT__
`,
  customSections: `
### 🗺️ Master Document Hierarchy Table

| Category | File | Description |
| :--- | :--- | :--- |
| **Index** | \`architecture-index.md\` | The master table of contents and structural reading pathways. |
| **System Vision** | \`system-overview.md\` | Full C4 context and high-level flow of the quantitative edge framework. |
| **Architecture Styles**| \`clean-architecture.md\` | Layers, dependency rule definitions, and frontend-backend clean bounds. |
| **Domain Modeling** | \`domain-driven-design.md\` | Aggregates, bounding contexts, value objects, and mapping rules. |
| **Context Map** | \`bounded-contexts.md\` | Boundary specifications for Fixtures, Predictions, Odds, Users, etc. |
| **Core API** | \`api-architecture.md\` | REST schemas, OAuth2 JWT contracts, WebSocket events, and error flows. |
| **Data Platform** | \`database-architecture.md\`| PostgreSQL and TimescaleDB timeseries configurations and hypertable tables. |
| **Predictive ML** | \`ml-pipeline.md\` | Model training loops, calibration, champion-challenger validations. |
| **Capital Allocation** | \`bankroll-engine.md\` | Kelly Criterion calculations and strict 5.0% allocation cap rule. |
| **Mitigation & SRE** | \`disaster-recovery.md\` | Recovery plans, replication, backup retention, and outage responses. |
`
}));

// 2. system-overview.md
writeFile(`${folder}/system-overview.md`, buildDoc('System Overview', {
  purpose: 'Exposes the complete multi-tier sports analytics and probability modeling platform overview.',
  scope: 'Defines the general architectural, operational, and data pipelines.',
  responsibilities: [
    'Define the high-level business goals (neutralize overrounds, identify pricing edges, size stakes).',
    'Structure the data flow from regional web scraping down to user execution dashboards.',
    'Establish the high-level boundaries between backend (Python) and frontend (React).'
  ],
  principles: [
    'Quantitative Financial Rigor: Treat sports selections strictly like financial derivatives arbitrage.',
    'Eventual Consistency: Odds ingest is high-frequency, but analytical reports update on a regular interval.',
    'Failsafe Allocation: Absolute security over bankroll capital; math rules above user hunches.'
  ],
  decisions: [
    'Use Python FastAPI for high-throughput asynchronous API performance and typing via Pydantic.',
    'Deploy TimescaleDB on PostgreSQL to combine relational analytics with efficient timeseries performance.'
  ],
  bestPractices: [
    'Isolate the ingestion scrappers from prediction pipelines to prevent ingestion delays from blocking predictions.',
    'Always log calculations of value-bet edges alongside odds and probabilities to provide a full audit trail.'
  ],
  antiPatterns: [
    'Direct coupling of web scrapers with ML models without database staging layers.',
    'Bypassing the 5% portfolio risk threshold under any active operational conditions.'
  ],
  security: 'Encapsulate scrapers, ML training pipelines, and core database nodes behind private networking layers.',
  performance: 'API routes resolve within 50ms, scraper loops run asynchronously using Celery and Redis event queues.',
  scalability: 'Horizontally scalable container pods hosted in Cloud Run, leveraging DB write-read replica splits.',
  testing: 'Full integration testing replicating the ingestion, model scoring, and Kelly sizer execution pipeline.',
  operations: 'Prometheus metrics monitoring scraper rates, queue depths, API latencies, and prediction calibration metrics.',
  mistakes: [
    'Hardcoding bookmaker scrape target structures within the main database handlers.',
    'Failing to monitor Celery queue backlog, delaying odds updates.'
  ],
  improvements: [
    'Integrate distributed caching across all active odds endpoints to reduce DB CPU loads.',
    'Deploy real-time scraper health metrics detailing blockings or CAPTCHA triggers.'
  ],
  checklist: [
    'Confirm that the C4 Context Diagram accurately reflects the outer system dependencies.',
    'Verify that the data flow pipeline contains clear deduplication layers.'
  ],
  history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline system overview release.' }],
  references: ['architecture-index', 'clean-architecture', 'bounded-contexts'],
  diagrams: `
### 🌐 C4 Context Diagram
__BTT__mermaid
graph TD
    User([System Analyst / Trader]) -->|Web HTTPS/WSS| App[React Tailwind Dashboard]
    App -->|JSON API/Auth| API[FastAPI Web Gateway]
    API -->|Read/Write| DB[(PostgreSQL / TimescaleDB)]
    
    subgraph Background Processors
        Celery[Celery Task Queue] -->|Bulk Ingest| DB
        Celery -->|Read Models| DB
    end

    Celery -->|HTTP Scrape| Bookies[SA Bookmakers: Betway, Hollywoodbets]
    Celery -->|HTTP Ingest| Feeds[Sports Soccer Data Feeds]
__BTT__

### 🔄 System Flowchart
__BTT__mermaid
graph TD
    A[Scrapers Ingest Live Odds] -->|Celery Redis Queue| B[Database Staging Table]
    B -->|Trigger Feature Store| C[Compute Rolling Metrics]
    C -->|Generate Vectors| D[Ensemble Scoring Engine]
    D -->|H/D/A Pure Probabilities| E[Platt Scaling Calibration]
    E -->|Calibrated Probabilities| F[Value Bet Identifier]
    F -->|Calculate Edge vs Live Odds| G[Kelly Staking Sizer]
    G -->|Clamped Portfolio Allocation| H[User Alerts & UI Dashboard]
__BTT__
`
}));

console.log('Successfully completed Group 1 (Indices & Overview)...');

// Define files 3 to 20
const docsGroup2 = [
  {
    filename: 'clean-architecture.md',
    title: 'Clean Architecture Blueprint',
    purpose: 'Defines the enterprise layer boundaries and structural rules governing dependencies across the platform.',
    scope: 'Enforced across both Python FastAPI backend and React Vite frontend modules.',
    responsibilities: [
      'Isolate pure business logic (Entities) from frameworks, databases, and network adapters.',
      'Enforce the inward-only dependency rule: outer layers depend on inner layers, never vice-versa.',
      'Provide decoupled interface adapters for easy replacement of DB, API, or visual layers.'
    ],
    principles: [
      'Framework Independence: The core domain does not know about FastAPI, Celery, or React.',
      'Database Independence: All storage operations use interface abstractions (Repositories).',
      'Testability: Use cases can be fully unit-tested in isolation without real DB or network connections.'
    ],
    decisions: [
      'Model domains using clean concentric circles: Entities -> Use Cases -> Adapters -> Infrastructure.',
      'Use dependency injection containers (FastAPI Depends) to resolve repository dependencies at runtime.'
    ],
    bestPractices: [
      'Never pass raw DB models (SQLAlchemy) past the Repository boundary; map them to pure Domain Entities.',
      'Declare custom exceptions inside the Use Case layer, allowing API routers to catch and map them to HTTP responses.'
    ],
    antiPatterns: [
      'Importing FastAPI or SQLAlchemy inside pure business logic classes.',
      'Accessing the database directly from UI controllers or endpoints.'
    ],
    security: 'Isolating pure domain rules from infrastructure prevents security vulnerabilities like SQL injections from accessing domain invariants.',
    performance: 'Extremely thin layers with zero framework overhead, facilitating high-speed compiled execution.',
    scalability: 'By separating layers, any single layer (e.g., scraping adapter) can scale independently of core math solvers.',
    testing: 'Highly mockable design where pure domain unit tests run instantly with zero docker or DB dependencies.',
    operations: 'Clear error paths trace exceptions to specific architectural layers in JSON structured console outputs.',
    mistakes: [
      'Mixing presentation logic (formatting floats) inside raw Domain calculations.',
      'Letting database-specific transaction logic bleed into high-level business use cases.'
    ],
    improvements: [
      'Develop automatic clean architecture linting rules that block imports violating inward-only paths.',
      'Introduce code generators to bootstrap new clean layers.'
    ],
    checklist: [
      'Confirm that domain files contain zero imports from sqlalchemy, fastapi, or celery.',
      'Verify that all use cases communicate with external systems strictly via interface abstractions.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Created clean architecture layout standard.' }],
    references: ['system-overview', 'domain-driven-design', 'bounded-contexts'],
    diagrams: `
__BTT__mermaid
graph TD
    subgraph Infrastructure [Infrastructure Layer]
        FastAPI[FastAPI Routers]
        Drizzle[SQLAlchemy DB]
        Celery[Celery Tasks]
    end

    subgraph Adapters [Interface Adapters Layer]
        Repo[SQLAlchemy Repositories]
        Controller[API Controllers]
        DTO[Data Transfer Objects]
    end

    subgraph UseCases [Use Cases Layer]
        CalcValue[Value Betting Use Case]
        SolveKelly[Kelly Allocation Use Case]
    end

    subgraph Domain [Core Domain Layer]
        Match[Match Entity]
        Slip[Slip Entity]
        Odds[Odds Value Object]
    end

    Infrastructure --> Adapters
    Adapters --> UseCases
    UseCases --> Domain
__BTT__
`
  },
  {
    filename: 'domain-driven-design.md',
    title: 'Domain-Driven Design (DDD) Reference',
    purpose: 'Exposes core tactical and strategic DDD patterns used to structure the platform code.',
    scope: 'Mandatory standard for organizing modules, bounded contexts, and state invariants.',
    responsibilities: [
      'Define domains, subdomains, aggregates, value objects, and domain events.',
      'Delineate bounded contexts to prevent model confusion (e.g. odds in scraper vs odds in sizer).',
      'Manage global transactional integrity through strict Aggregate Root boundaries.'
    ],
    principles: [
      'Ubiquitous Language: Use shared terminology (e.g. Overround, Fair Odds, Kelly Slip, Margin) across code, databases, and business documents.',
      'Transactional Consistency: Ensure invariants within an Aggregate Root are updated in a single transaction.'
    ],
    decisions: [
      'Organize directories by bounded contexts rather than technical layers (e.g., backend/prediction/ rather than backend/services/).',
      'Publish Domain Events asynchronously to communicate changes between isolated bounded contexts.'
    ],
    bestPractices: [
      'Keep value objects immutable; return new instances on modifications.',
      'Only Reference Aggregates by ID; never embed raw child objects across context boundaries.'
    ],
    antiPatterns: [
      'Anemic Domain Model: Aggregates containing only getters/setters with logic residing in services.',
      'Allowing direct cross-context database joins in SQLAlchemy or raw queries.'
    ],
    security: 'Aggregate boundaries prevent corrupt state updates, safeguarding financial slips from illegitimate adjustments.',
    performance: 'Aggregates limit database locking scope, keeping transactions fast and concurrent.',
    scalability: 'Since bounded contexts are decoupled, they can be easily split into standalone microservices as platform scale increases.',
    testing: 'Value objects and aggregates are tested deterministically through stateless unit assertions.',
    operations: 'Domain events serve as natural audit logs and analytical stream inputs.',
    mistakes: [
      'Making the entire database a single gigantic aggregate, causing frequent lock contentions.',
      'Leaking domain invariants into database schema configurations.'
    ],
    improvements: [
      'Introduce events auditing engines to persist and trace published domain events historically.',
      'Leverage event-sourcing for critical ledger-related contexts like Bankroll Slip changes.'
    ],
    checklist: [
      'Confirm all domain events have unique UUID trackers and timestamps.',
      'Verify that value objects override equality checks based on their internal properties.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline DDD specification.' }],
    references: ['clean-architecture', 'bounded-contexts', 'module-interactions'],
    diagrams: `
__BTT__mermaid
classDiagram
    class MatchAggregate {
        +UUID match_id
        +Fixture fixture
        +Odds live_odds
        +Probability prediction
        +addPrediction(ModelScore)
        +updateOdds(LiveOdds)
    }
    class Fixture {
        +String league
        +String team_home
        +String team_away
        +DateTime kickoff
    }
    class Odds {
        +float home_win
        +float draw
        +float away_win
        +float overround
    }
    class Probability {
        +float p_home
        +float p_draw
        +float p_away
        +float confidence
    }
    MatchAggregate --> Fixture
    MatchAggregate --> Odds
    MatchAggregate --> Probability
__BTT__
`
  },
  {
    filename: 'bounded-contexts.md',
    title: 'Bounded Contexts Specification',
    purpose: 'Exposes boundaries, interfaces, and database ownership rules for every domain context in the platform.',
    scope: 'Enforced across all development microservices and engineering teams.',
    responsibilities: [
      'Establish explicit boundaries for contexts (Fixtures, Predictions, Odds, Users, Bankroll, ML, etc.).',
      'Prevent model pollution by isolating vocabulary definitions within contexts.',
      'Define clear API contracts and asynchronous event triggers between contexts.'
    ],
    principles: [
      'Database Ownership: A bounded context must own its schema; other contexts can only access its data via public APIs.',
      'Loose Coupling: Communicate exclusively via REST endpoints, WebSockets, or published events.'
    ],
    decisions: [
      'Segment the database into schemas/namespaces matching bounded contexts.',
      'Use a Shared Kernel strictly for shared utility helper files and common type definitions.'
    ],
    bestPractices: [
      'Define explicit translation adapters (Anti-Corruption Layers) when interacting with external supplier feeds.',
      'Maintain an up-to-date Context Map diagram mapping upstream-downstream relationships.'
    ],
    antiPatterns: [
      'Shared Database tables modified by multiple independent bounded contexts.',
      'Direct imports of classes or services across isolated context folders.'
    ],
    security: 'Context isolation limits security breaches; compromising the notifications context cannot compromise user wallets or credentials.',
    performance: 'Optimizes database query performance by keeping schemas specialized and normalized within contexts.',
    scalability: 'Allows containerization of specific contexts (e.g. Scrapers and Odds Ingestion) to handle peak load spikes.',
    testing: 'Allows mocking entire external contexts, enabling rapid localized context testing.',
    operations: 'Easily isolate memory or CPU leaks to specific bounded context runtimes.',
    mistakes: [
      'Confusing the "Odds Ingestion" context model of odds with the "Value Engine" odds representations.',
      'Creating dense direct synchronous call chains across contexts, leading to cascading failures.'
    ],
    improvements: [
      'Implement OpenAPI contracts matching each context boundary to enable strict API gateway validation.',
      'Transition inter-context communications to Kafka or RabbitMQ as team sizes grow.'
    ],
    checklist: [
      'Verify that zero tables are modified by more than a single bounded context service.',
      'Confirm that all inter-context REST calls utilize authenticated communication tokens.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Bounded Context specification.' }],
    references: ['domain-driven-design', 'module-interactions', 'dependency-graph'],
    diagrams: `
__BTT__mermaid
graph LR
    Fixtures[Fixtures Context] -->|Upstream| Predictions[Predictions Context]
    Odds[Odds Context] -->|Upstream| Value[Value Betting Context]
    Predictions -->|Upstream| Value
    Value -->|Downstream| Bankroll[Bankroll & Portfolio Context]
    Users[Users Context] -->|Upstream| Bankroll
__BTT__
`
  },
  {
    filename: 'module-interactions.md',
    title: 'Module Interactions & Sequence Flows',
    purpose: 'Provides clear visual blueprints detailing how independent modules interact to complete complex business flows.',
    scope: 'Applies to all software engineering integrations and sequence validations.',
    responsibilities: [
      'Expose execution sequences across scrapers, database, ML ensemblers, sizers, and user dashboards.',
      'Identify race conditions and define synchronous vs asynchronous processing bounds.',
      'Provide trace blueprints to debug pipeline errors.'
    ],
    principles: [
      'Async by Default: High-overhead tasks (scraping, model retraining) must run asynchronously in background queues.',
      'Symmetric Communication: Return rapid HTTP acknowledgments and process heavy computational loops out-of-band.'
    ],
    decisions: [
      'Use Redis as an intermediate high-speed event cache and message broker between FastAPI and Celery.',
      'Broadcast real-time execution states via secure WebSockets directly to active user interfaces.'
    ],
    bestPractices: [
      'Ensure every multi-module flow includes a correlation ID passed across all network boundaries.',
      'Always implement idempotent task handlers to safely recover from midway pipeline crashes.'
    ],
    antiPatterns: [
      'Running sports analytics model training or predictions inside synchronous API request-response loops.',
      'Blocking scrapper processes while waiting for prediction engines to compute probabilities.'
    ],
    security: 'Tracing interactions validates that unauthorized requests cannot hijack internal sizer parameters.',
    performance: 'Decoupled asynchronous interactions keep API gateways responsive under concurrent load surges.',
    scalability: 'Permits horizontal scaling of scrapers or prediction workers without modifying the central API gateway.',
    testing: 'Sequence models facilitate clear stubbing configurations during integration test suites.',
    operations: 'Trace interactions on distributed APM dashboards using unified trace and span identifiers.',
    mistakes: [
      'Forgetting to propagate trace headers through Celery task parameters.',
      'Triggering duplicate prediction tasks for the same match due to un-deduplicated scraping events.'
    ],
    improvements: [
      'Adopt OpenTelemetry tracing standards system-wide.',
      'Introduce automatic retry with exponential backoff on all inter-module REST requests.'
    ],
    checklist: [
      'Confirm all sequence paths have matching trace ID propagation rules.',
      'Verify that all background tasks have configurable, non-blocking timeout limits.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Module Interactions specification.' }],
    references: ['bounded-contexts', 'backend-architecture', 'api-architecture'],
    diagrams: `
### ⚡ Core Ingest to Value Bet Flow
__BTT__mermaid
sequenceDiagram
    participant S as Web Scrapers
    participant Q as Redis / Celery
    participant DB as TimescaleDB
    participant ML as ML Prediction Engine
    participant V as Value Engine
    participant K as Kelly Sizer

    S->>Q: Ingest Live Odds Event
    Q->>DB: Persist Raw Odds (timeseries)
    Q->>ML: Fetch Feature Vector
    ML-->>Q: Return Rollings xG & Ratings
    Q->>ML: Execute Probability Scoring
    ML-->>Q: Return Calibrated Probabilities
    Q->>V: Match Odds vs Probabilities
    V->>V: stripping Overrounds
    V-->>Q: Identified Value Edge (>0)
    Q->>K: Run Kelly Allocation Solver
    K-->>Q: Safe Size Clamped (<=5%)
    Q->>DB: Persist Active Slip & Log
__BTT__
`
  },
  {
    filename: 'dependency-graph.md',
    title: 'Dependency Graph & Circular Dependency Prevention',
    purpose: 'Exposes system dependency directions, module rules, and structures preventing circular reference loops.',
    scope: 'Repository-wide architecture verification gate.',
    responsibilities: [
      'Document all internal and external module dependencies.',
      'Provide concrete strategies to break circular import dependencies.',
      'Define clear workspace directories ownership boundaries.'
    ],
    principles: [
      'Unidirectional Flow: Dependencies must only flow down from higher layers (UI) to lower layers (DB).',
      'Dependency Inversion: Higher-level modules depend on abstractions (interfaces), not concrete implementations.'
    ],
    decisions: [
      'Integrate strict dependency check tools (like import-linter or dependency-cruiser) inside PR validation workflows.',
      'Decouple modules by introducing domain events instead of direct model imports.'
    ],
    bestPractices: [
      'Never import files from another bounded context directly; interact exclusively via context interfaces or events.',
      'Extract shared model classes, utilities, and constants to a common shared library package.'
    ],
    antiPatterns: [
      'Module A importing Module B, which imports Module A, causing runtime import failures.',
      'Allowing presentation helpers to import backend database schemas.'
    ],
    security: 'A clean, well-defined dependency graph prevents malicious code injection from spreading across isolated modules.',
    performance: 'Reduces application bundle sizes (frontend) and node memory footprints (backend) by eliminating bloated imports.',
    scalability: 'Easily isolate and migrate decoupled sub-modules into microservices as requirements scale.',
    testing: 'Allows isolated mocking of dependent modules, accelerating testing runtimes.',
    operations: 'Simplifies error tracebacks, indicating exactly where a failure originated.',
    mistakes: [
      'Importing domain entities directly inside database migration files.',
      'Creating cross-context circular relations in SQLAlchemy tables.'
    ],
    improvements: [
      'Automate dependency graph generation inside every production build documentation runner.',
      'Transition codebase to a monorepo setup to strictly isolate packages.'
    ],
    checklist: [
      'Verify that zero circular dependencies are highlighted by linter checks.',
      'Confirm that the Shared Kernel has zero dependencies on other platform modules.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline dependency map.' }],
    references: ['bounded-contexts', 'clean-architecture', 'architecture-index'],
    diagrams: `
__BTT__mermaid
graph TD
    UI[React Frontend] -->|HTTP/REST| API[FastAPI Web Server]
    API -->|DI Resolves| SVC[Domain Services]
    SVC -->|Repository Contracts| DB[PostgreSQL / TimescaleDB]
    Celery[Celery Tasks] -->|Read/Write| DB
    Celery -->|Evaluate| ML[ML Model Registry]
    ML -->|Inference Vectors| FS[Feature Store]
__BTT__
`
  },
  {
    filename: 'backend-architecture.md',
    title: 'Backend Architecture Specification',
    purpose: 'Provides detailed instructions on Python FastAPI backend structure, layers, dependency injection, and request lifecycles.',
    scope: 'Standard backend blueprint for all engineers developing core platform services.',
    responsibilities: [
      'Expose backend layout (Routers -> Use Cases -> Services -> Repositories -> Models).',
      'Detail asynchronous database session management and dependency injection rules.',
      'Outline background processing pipelines using Redis and Celery queues.'
    ],
    principles: [
      'Asynchronous First: Use async/await syntax for all IO-bound network, cache, or database calls.',
      'Strict Schema Validation: Use Pydantic V2 models to validate all API request-response boundaries.',
      'Centralized Exception Management: Catch and map exceptions in custom middleware.'
    ],
    decisions: [
      'Adopt SQLAlchemy 2.0 Async Session Managers for high-performance concurrent DB pooling.',
      'Resolve controller dependencies via FastAPI Depends structures to keep classes mockable.'
    ],
    bestPractices: [
      'Implement structured JSON logging using structlog across all routers and workers.',
      'Limit task executions on Celery to prevent memory bloating over long runtimes.'
    ],
    antiPatterns: [
      'Utilizing blocking synchronous libraries (e.g., requests) inside async endpoint definitions.',
      'Hardcoding connection pools or DB secrets within router files.'
    ],
    security: 'SQLAlchemy ORM automatically parameterizes all queries, preventing SQL injection exploits. Password hashing uses Argon2id.',
    performance: 'Leverages UVicorn and Asyncio loops, routinely maintaining API response latencies below 45ms.',
    scalability: 'API gateways are stateless, allowing simple scaling using auto-scaling Cloud Run clusters.',
    testing: 'Fully tested using Pytest, utilizing async test clients and transactional test DB rollback rollouts.',
    operations: 'Integrates Prometheus instrumentation to track API endpoints execution speeds, error counts, and DB connection states.',
    mistakes: [
      'Using un-awaited database queries, leading to silent failures and dangling session locks.',
      'Forgetting to configure CORS origins properly, blocking legitimate frontend clients.'
    ],
    improvements: [
      'Integrate automatic API query profiling to log slow database transactions.',
      'Optimize FastAPI routing tables using static compiled routing modules.'
    ],
    checklist: [
      'Confirm all database session calls are enclosed inside async context manager blocks.',
      'Verify that all Pydantic schemas include explicit type annotations and field descriptions.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Backend blueprint.' }],
    references: ['clean-architecture', 'api-architecture', 'database-architecture'],
    diagrams: `
### ⚙️ FastAPI Request Lifecycle
__BTT__mermaid
sequenceDiagram
    Incoming Request ->> FastAPI Middleware: Intercept Trace ID / Auth Headers
    FastAPI Middleware ->> APIRouter: Route Matching
    APIRouter ->> Dependency Injector: Resolve DB Session & Auth Claims
    Dependency Injector ->> Controller: Invoke Handler
    Controller ->> Use Case Service: Call Domain Logic
    Use Case Service ->> Repository: Fetch Entities
    Repository ->> Database: Exec SQL (Async)
    Database -->> Repository: Result Data
    Repository -->> Use Case Service: Domain Entity
    Use Case Service -->> Controller: Model Output
    Controller -->> APIRouter: Pydantic Schema Mapping
    APIRouter -->> Outgoing Response: Return JSON
__BTT__
`
  },
  {
    filename: 'frontend-architecture.md',
    title: 'Frontend Architecture Blueprint',
    purpose: 'Exposes React 19 / Vite / Tailwind UI component hierarchy, state management, and asset structure.',
    scope: 'Mandatory standard for all frontend engineering additions.',
    responsibilities: [
      'Define component folder structure, layouts, and custom state managers.',
      'Specify secure API calling mechanisms, WebSocket handlers, and route protection rules.',
      'Enforce accessibility (WAI-ARIA) and performance rendering guidelines.'
    ],
    principles: [
      'Declarative Rendering: UI state is an immutable function of data, animated gracefully via Motion.',
      'Visual Consistency: Style elements exclusively using Tailwind utility tokens, adhering strictly to the Cosmic theme.',
      'Component Isolation: Keep UI components lean and stateless, delegating heavy logic to custom React hooks.'
    ],
    decisions: [
      'Use Vite as the build tool for extremely fast development builds and bundle optimization.',
      'Leverage Recharts for clean, responsive data visualizations and historical ROI charting.'
    ],
    bestPractices: [
      'Wrap all lazy-loaded route tabs inside Suspense blocks containing clean skeleton loaders.',
      'Manage API states cleanly to prevent duplicate rendering and data flickering.'
    ],
    antiPatterns: [
      'Consolidating all UI states, charts, and table handlers inside App.tsx.',
      'Manipulating DOM elements directly instead of using React state controls.'
    ],
    security: 'XSS protection enabled via React JSX auto-escaping. Authentication tokens are handled inside safe HttpOnly cookies.',
    performance: 'Optimized using React memo, lazy-loading routes, and code splitting, yielding Google Lighthouse scores > 90.',
    scalability: 'Clean component decomposition allows multiple developers to work concurrently on separate panels.',
    testing: 'Validated via React Testing Library unit assertions and comprehensive Playwright end-to-end user path simulations.',
    operations: 'Emits structured telemetry events to detect dashboard performance anomalies and uncaught exceptions.',
    mistakes: [
      'Failing to clean up active WebSockets or intervals on component unmounting, leading to memory leaks.',
      'Using non-responsive, fixed pixel widths on layout boxes, breaking mobile viewport rendering.'
    ],
    improvements: [
      'Transition state management to Zustland or Redux Toolkit if application logic complexifies.',
      'Configure Tailwind CSS purging rules to minimize production CSS bundle footprints.'
    ],
    checklist: [
      'Confirm all image tags declare referrerPolicy="no-referrer" for privacy and safety.',
      'Verify that all interactive elements have explicit, readable IDs for testing and accessibility.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Frontend blueprint.' }],
    references: ['system-overview', 'api-architecture', 'testing'],
    diagrams: `
__BTT__mermaid
graph TD
    App[App.tsx Main Container] --> Nav[Sidebar Navigation & Theme Controller]
    App --> MainStage[Main Stage Canvas]
    
    subgraph Views [Modular Views]
        MainStage --> D1[Dashboard View: Active Bets]
        MainStage --> D2[Predictor View: xG Ensembles]
        MainStage --> D3[History View: Yield & Log Analysis]
    end

    subgraph Core [Shared Core Systems]
        D1 & D2 & D3 --> Client[API Client Service]
        D1 & D2 & D3 --> WS[WebSocket Real-time Manager]
        D1 & D2 & D3 --> Motion[Motion Animations]
    end
__BTT__
`
  },
  {
    filename: 'api-architecture.md',
    title: 'API Architecture & Contract Guidelines',
    purpose: 'Exposes design rules for REST and WebSocket contracts, versioning, token security, and error responses.',
    scope: 'Universal standard for inter-system and client-server API design.',
    responsibilities: [
      'Define RESTful standards, route version structures, and response schemas.',
      'Specify authentication mechanisms, rate limiting rules, and WebSocket protocols.',
      'Maintain clear error classifications mapped to standard HTTP response codes.'
    ],
    principles: [
      'Predictable REST: URIs identify resources; standard HTTP verbs (GET, POST, etc.) declare actions.',
      'Self-Documenting: Keep OpenAPI (Swagger) specifications perfectly synchronized with actual API schemas.',
      'Stateless Ingress: API nodes store zero local sessions, keeping requests highly portable.'
    ],
    decisions: [
      'Version routes strictly via URL prefixes: `/api/v1/...`.',
      'Implement JWT token authorization, verifying claims securely on every request.'
    ],
    bestPractices: [
      'Ensure every error response returns a standardized JSON structure with machine-readable error codes.',
      'Expose cursor-based pagination on high-frequency datasets (like live odds and historic slips).'
    ],
    antiPatterns: [
      'Returning raw HTTP 500 exceptions with database stack traces to the public.',
      'Executing heavy, slow reports without enforcing reasonable timeouts.'
    ],
    security: 'HTTPS TLS v1.3 mandatory. Enforce strict rate-limiting via Redis token bucket models (e.g. 100 req/min per user).',
    performance: 'Responses compressed using Gzip, caching high-frequency static endpoints (like team rosters) for 5 minutes.',
    scalability: 'API statelessness allows elastic load-balancing across independent geographical container instances.',
    testing: 'Tested automatically using Pytest REST clients, asserting on data schemas, headers, and HTTP status codes.',
    operations: 'API logs capture response times, payload sizes, authentication states, and client user-agents.',
    mistakes: [
      'Exposing internal DB schema primary keys directly, increasing exposure to scraping or ID enumeration attacks.',
      'Failing to handle WebSocket client disconnects gracefully, leaking server file descriptors.'
    ],
    improvements: [
      'Transition core data pipelines to gRPC to accelerate high-speed backend integrations.',
      'Develop automatic API contract testers to prevent breaking changes in minor releases.'
    ],
    checklist: [
      'Verify that all PUT/POST API payloads are validated against Pydantic model configurations.',
      'Confirm that the OpenAPI JSON documentation generates cleanly on server startup.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline API specification.' }],
    references: ['backend-architecture', 'authentication-architecture', 'event-driven'],
    diagrams: `
### 🔒 Standard Secure Ingress Flow
__BTT__mermaid
sequenceDiagram
    Client ->&gt; API Ingress: GET /api/v1/predictions?limit=10
    API Ingress ->&gt; Rate Limiter: Check Rate Limits (Redis Key)
    Rate Limiter --&gt;&gt; API Ingress: Allowed (Remaining: 99)
    API Ingress ->&gt; Auth Middleware: Decode & Validate JWT Token
    Auth Middleware --&gt;&gt; API Ingress: Token Valid (Scope: read:predictions)
    API Ingress ->&gt; Controller: Invoke Prediction Handler
    Controller --&gt;&gt; Client: Return HTTP 200 (JSON payload)
__BTT__
`
  },
  {
    filename: 'database-architecture.md',
    title: 'Database & Storage Architecture Blueprint',
    purpose: 'Exposes database design schemas, TimescaleDB configurations, indexing, partitioning, and backup strategies.',
    scope: 'Mandatory handbook for database administrators, backend developers, and data engineers.',
    responsibilities: [
      'Manage relational schema models and ensure clean transactional consistency.',
      'Optimize timeseries storage for high-frequency live bookmaker odds.',
      'Enforce robust continuous backup systems and quick point-in-time recovery (PITR) playbooks.'
    ],
    principles: [
      'Normalized Core: Maintain highly normalized relationships for transactional tables (fixtures, users, slips).',
      'Efficient Timeseries: Partition and compress historic high-frequency odds tables to limit disk costs.',
      'Single Point of Modification: All database updates must run via migration files.'
    ],
    decisions: [
      'Deploy PostgreSQL 16 with TimescaleDB extensions enabled.',
      'Establish `odds_timeseries` as a hypertable partitioned dynamically into 24-hour chunks.'
    ],
    bestPractices: [
      'Add compound indexes on tables regularly queried together (e.g., `fixture_id` + `bookmaker_id` in odds tables).',
      'Configure auto-vacuuming and write-ahead-logging (WAL) parameters based on high-write ingestion loads.'
    ],
    antiPatterns: [
      'Storing huge raw JSON strings in relational text fields, bypassing Postgres type validation checks.',
      'Running analytics queries directly on production master database nodes instead of read-replicas.'
    ],
    security: 'Database password hashes utilize modern encryption standards. Data-at-rest and data-in-transit are encrypted.',
    performance: 'Uses PgBouncer for high-efficiency connection pooling, and optimizes indexes to keep query runtimes < 10ms.',
    scalability: 'Uses TimescaleDB compression policies to reduce historical timeseries footprints by up to 90%, preserving server storage.',
    testing: 'Database migrations are validated against local transient containers before applying on production environments.',
    operations: 'Tracks DB health metrics including index hit ratios, active lock counts, and backup verification results.',
    mistakes: [
      'Executing schema alterations on large active production tables without pre-evaluating table locks.',
      'Failing to monitor DB storage limits, risking complete container freezing.'
    ],
    improvements: [
      'Integrate automatic slow query alerting to identify and fix unindexed queries before they cause outages.',
      'Enable automated database failover across read replica pools.'
    ],
    checklist: [
      'Confirm all tables have auto-incrementing bigserial or UUID primary keys.',
      'Verify that TimescaleDB compression is scheduled to trigger on data older than 7 days.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Database blueprint.' }],
    references: ['system-overview', 'backend-architecture', 'data-ingestion'],
    diagrams: `
### 🗄️ Relational Schema Entity Relationship Diagram (ERD)
__BTT__mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string hashed_password
    }
    FIXTURES {
        uuid id PK
        string home_team
        string away_team
        datetime kickoff
        string status
    }
    ODDS_TIMESERIES {
        timestamp timestamp PK
        uuid fixture_id FK
        string bookmaker
        float home_odds
        float draw_odds
        float away_odds
    }
    PREDICTIONS {
        uuid id PK
        uuid fixture_id FK
        float prob_home
        float prob_draw
        float prob_away
        float brier_score
    }
    VALUE_BETS {
        uuid id PK
        uuid fixture_id FK
        float edge
        float fair_odds
    }
    SLIPS {
        uuid id PK
        uuid user_id FK
        uuid value_bet_id FK
        float stake_amount
        string outcome
    }

    USERS ||--o{ SLIPS : places
    FIXTURES ||--o{ ODDS_TIMESERIES : logs
    FIXTURES ||--o{ PREDICTIONS : scores
    FIXTURES ||--o{ VALUE_BETS : contains
    VALUE_BETS ||--o{ SLIPS : target
__BTT__
`
  },
  {
    filename: 'data-ingestion.md',
    title: 'Data Ingestion & Scraper Pipeline Architecture',
    purpose: 'Exposes how regional sports scrapers and historical feed providers ingest data into the database.',
    scope: 'Blueprint for data engineers and scrapper developers.',
    responsibilities: [
      'Ingest live odds, match status updates, and results continuously from regional platforms.',
      'Execute robust cleaning, parsing, and data validation routines to prevent pipeline contamination.',
      'Enforce scraping rate limits and exponential backoff behaviors on network exceptions.'
    ],
    principles: [
      'Graceful Degradation: If a single scraper fails, other scrapers must continue operating.',
      'Politeness & Compliance: Respect robots.txt directives and limit scrapers concurrency to prevent target service disruption.',
      'Idempotent Writes: Ingested events must write cleanly without generating duplicate records.'
    ],
    decisions: [
      'Run scrapers inside asynchronous Celery workers triggered regularly by Celery Beat scheduler tasks.',
      'Use a staging table model to store raw scraping objects before performing ETL validation checks.'
    ],
    bestPractices: [
      'Implement user-agent rotation policies and dynamic proxy networks to prevent connection blocking.',
      'Sanitize text patterns (e.g. standardizing team names like "Man United" and "Manchester United") in adapter layers.'
    ],
    antiPatterns: [
      'Directly writing raw, unvalidated scraper strings into production transaction tables.',
      'Hardcoding scraper crawl intervals inside core codebase configuration modules.'
    ],
    security: 'Scraper credentials and target endpoints are stored securely inside Environment variables, never committed to git.',
    performance: 'Ingestion loops utilize async requests, parsing and committing hundreds of odds ticks per second.',
    scalability: 'Scraper tasks are distributed across elastically scaling Celery background workers, scaling easily with match count.',
    testing: 'Scrapers are tested using recorded network responses (mocked via VCR.py) to prevent hitting live endpoints in test loops.',
    operations: 'Emits Prometheus metrics on scraper execution runtimes, HTML parse failures, and target response codes.',
    mistakes: [
      'Failing to handle target website DOM structural changes, causing silent scraping failures.',
      'Omitting rate limiting, leading to quick server-side IP address bans.'
    ],
    improvements: [
      'Deploy automatic AI-powered DOM parsers capable of adapting to layout adjustments.',
      'Integrate real-time proxy speed auditing systems.'
    ],
    checklist: [
      'Confirm all scrapers declare a strict, non-blocking HTTP timeout limit.',
      'Verify that team name standardization dictionaries are loaded from a central schema file.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Data Ingestion spec.' }],
    references: ['system-overview', 'database-architecture', 'odds-provider'],
    diagrams: `
__BTT__mermaid
graph TD
    Trigger[Celery Beat Trigger] -->|Launch Worker| Worker[Scraper Task Worker]
    Worker -->|Fetch HTML/JSON| Target[Regional SA Bookmakers]
    Target -->|Raw Payload| Parse[Sanitization & Parse ACL Layer]
    Parse -->|Extract Standardized Data| Validate[Schema & Range Validator]
    Validate -->|Passes| Stage[Database Staging Table]
    Validate -->|Fails| DeadLetter[Dead Letter Log Cache]
    Stage -->|Trigger ETL Sync| Prod[Production Hypertable Tables]
__BTT__
`
  },
  {
    filename: 'odds-provider.md',
    title: 'Odds Provider Abstraction & Adapter Layer',
    purpose: 'Exposes how the platform decouples business logic from individual bookmaker APIs through strict adapter layers.',
    scope: 'Universal standard for integrating new regional bookmakers.',
    responsibilities: [
      'Define unified interfaces for accessing, normalizing, and comparing betting odds.',
      'Map bookmaker-specific market types to standardized platform enumeration formats.',
      'Handle provider-specific exceptions, rate limits, and network connection resets.'
    ],
    principles: [
      'Loose Coupling: The platform must not have direct knowledge of individual bookmakers (e.g., Betway).',
      'Unified Currency & Decimals: Normalise decimal formats, and enforce standardized South African Rand (ZAR) structures.'
    ],
    decisions: [
      'Implement an `IOddsProvider` abstract base class defining the standard interface requirements.',
      'Implement isolated bookmaker adapters (e.g., `BetwayProviderAdapter`, `HollywoodbetsProviderAdapter`) inheriting from the base class.'
    ],
    bestPractices: [
      'Use a factory pattern (`OddsProviderFactory`) to dynamically load active bookmaker providers.',
      'Regularly run provider health checks, raising flags if a provider returns stale odds.'
    ],
    antiPatterns: [
      'Adding bookmaker-specific conditional code inside core value-bet prediction routines.',
      'Failing to isolate provider-specific API changes, causing platform-wide compilation breaks.'
    ],
    security: 'API authentication tokens and keys for external providers are rotated automatically every 30 days.',
    performance: 'Adapters cache normalized odds inside Redis to prevent repetitive high-overhead database queries.',
    scalability: 'Easily add new bookmaker adapters without modifying downstream scoring, prediction, or sizing services.',
    testing: 'Provides clear abstract mock classes to test value calculations with deterministic odds arrays.',
    operations: 'Generates operational metrics detailing provider API response latency, connection drops, and drift rates.',
    mistakes: [
      'Confusing home/away team mappings due to inconsistent provider text formats.',
      'Failing to normalize odds decimal points, leading to catastrophic staking calculation errors.'
    ],
    improvements: [
      'Implement real-time odds comparison tables to identify inter-provider arbitrage opportunities.',
      'Support automated scraper failover paths to fallback mirror sites.'
    ],
    checklist: [
      'Confirm the new provider adapter inherits cleanly from the IOddsProvider interface.',
      'Verify that team mappings are successfully resolved against the standardized database roster.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Odds Provider spec.' }],
    references: ['system-overview', 'data-ingestion', 'value-betting-engine'],
    customSections: `
### 🛠️ IOddsProvider Abstract Definition
__BTT__python
from abc import ABC, abstractmethod
from typing import List, Dict
from models import NormalizedOdds

class IOddsProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def fetch_live_odds(self, fixture_id: str) -> NormalizedOdds:
        """Fetch, sanitize, and return normalized decimal odds."""
        pass

    @abstractmethod
    def normalise_teams(self, raw_home: str, raw_away: str) -> Dict[str, str]:
        """Standardize raw team strings into system identifiers."""
        pass
__BTT__
`
  },
  {
    filename: 'feature-store.md',
    title: 'Feature Store Specification',
    purpose: 'Exposes how the platform computes, stores, and serves features for model training and real-time inference.',
    scope: 'Mandatory guide for machine learning engineers and data scientists.',
    responsibilities: [
      'Store standardized sports-analytics feature vectors historically and serve them with low latency.',
      'Enforce exact point-in-time correctness to prevent data leakage during model training runs.',
      'Maintain feature schemas, descriptions, and operational metadata.'
    ],
    principles: [
      'Dual Serving: Feature store must serve high-throughput offline batches (training) and low-latency online values (inference).',
      'Consistent Definitions: Use identical SQL/Python definitions for features across offline and online environments.'
    ],
    decisions: [
      'Utilize a specialized Feature Store schema on PostgreSQL for online serving.',
      'Save historical features inside highly compressed Parquet format files on Cloud Storage for cheap training access.'
    ],
    bestPractices: [
      'Track and audit all feature versions alongside model performance metrics.',
      'Regularly calculate statistical feature drift (e.g., tracking mean feature drift vs baseline profiles).'
    ],
    antiPatterns: [
      'Calculating heavy rolling features on-the-fly inside real-time prediction loops.',
      'Overwriting historical features with modern values, creating complete data leakage.'
    ],
    security: 'Access to the Feature Store is restricted via fine-grained IAM roles to authenticated ML worker nodes.',
    performance: 'Real-time feature queries utilize Redis-backed caches, keeping feature retrieval times below 5ms.',
    scalability: 'Feature tables are scaled using partition patterns matching league, season, or match kickoff times.',
    testing: 'Tested using statistical validation checks (e.g. Great Expectations) asserting feature range and completeness.',
    operations: 'Monitors feature store health, tracking features null-value rates, data volumes, and update schedules.',
    mistakes: [
      'Mixing training target labels inside real-time inference feature sets.',
      'Failing to handle missing feature inputs, causing model scoring crashes.'
    ],
    improvements: [
      'Migrate feature serving to specialized enterprise feature store platforms (like Feast).',
      'Automate dynamic feature selection pipelines based on information gain analysis.'
    ],
    checklist: [
      'Confirm that the Feature Store has zero direct dependencies on raw staging tables.',
      'Verify that all rolling features utilize safe point-in-time queries to avoid future-leakage.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Feature Store blueprint.' }],
    references: ['database-architecture', 'feature-engineering', 'ml-pipeline'],
    diagrams: `
__BTT__mermaid
graph TD
    DB[(TimescaleDB Raw Data)] -->|Scheduled ETL Jobs| Compute[Compute Rolling Windows]
    Compute -->|Persist Online| RedisCache[(Redis Online Store)]
    Compute -->|Write Offline Batch| Storage[(Cloud Storage Parquet)]
    
    subgraph Consumers
        RealTime[Inference Pipeline] -->|Low-latency GET| RedisCache
        ModelTrain[Model Retraining Loop] -->|Batch Load| Storage
    end
__BTT__
`
  },
  {
    filename: 'feature-engineering.md',
    title: 'Feature Engineering Guide',
    purpose: 'Exposes core mathematical and structural formulas used to generate model training features.',
    scope: 'Blueprint for data scientists designing predictive features.',
    responsibilities: [
      'Define rolling statistics for team form, Expected Goals (xG), Elo ratings, rest days, and market trends.',
      'Ensure standard scaling and normalization behaviors across feature sets.',
      'Track and document feature importance scores.'
    ],
    principles: [
      'Soccer Domain Domain Knowledge: Features must reflect true competitive performance (fatigue, Elo, attack/defense parameters).',
      'Information Entropy: Select non-redundant, high-signal features while pruning weak predictors.'
    ],
    decisions: [
      'Standardize feature calculations to use rolling window intervals (e.g., 5-match form, 10-match form).',
      'Use robust estimators (like ELO and Poisson Expected Goals) to normalize team strengths.'
    ],
    bestPractices: [
      'Incorporate odds movement trends to capture market intelligence and late roster shifts.',
      'Verify that weather, travel distance, and rest days are factored into team fatigue indices.'
    ],
    antiPatterns: [
      'Using absolute goal metrics (e.g., Goals scored) without adjusting for opponent defensive strength.',
      'Calculating rolling averages that include the target match outcome, causing immediate target leakage.'
    ],
    security: 'Feature generation models are compiled into immutable library packages, preventing runtime tampering.',
    performance: 'Feature calculations utilize highly optimized pandas vector operations, avoiding heavy, slow python loops.',
    scalability: 'Feature calculations run as distributed batch jobs, executing efficiently across multiple processing nodes.',
    testing: 'Mathematical algorithms are verified using unit assertions against static match datasets.',
    operations: 'Feature importance metrics are logged dynamically during model training sweeps.',
    mistakes: [
      'Forgetting overround adjustments when engineering odds-implied features.',
      'Failing to scale features prior to training models sensitive to scale.'
    ],
    improvements: [
      'Incorporate deep spatial-temporal team trajectory metrics.',
      'Enable automated feature generation sweeps using genetic programming libraries.'
    ],
    checklist: [
      'Confirm all rolling feature formulas assert correct lagging offsets.',
      'Verify feature variance inflation factor (VIF) limits remain below threshold limits to avoid multicollinearity.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Feature Engineering spec.' }],
    references: ['feature-store', 'ml-pipeline', 'prediction-engine'],
    customSections: `
### ⚽ Core Sports Analytics Mathematical Formulations

#### 1. Expected Goals (xG) Team Strengths
For match $i$ between Home Team $H$ and Away Team $A$, we compute offensive and defensive strengths:
$$ \\text{Home Attacking Strength} (H) = \\frac{\\text{Mean xG scored at home by } H}{\\text{League Mean Home xG Scored}} $$
$$ \\text{Away Defensive Strength} (A) = \\frac{\\text{Mean xG conceded away by } A}{\\text{League Mean Away xG Conceded}} $$
$$ \\text{Expected Goals Home} (\\mu_H) = \\text{Home Attacking Strength} (H) \\times \\text{Away Defensive Strength} (A) \\times \\text{League Mean Home Goals} $$

#### 2. ELO Team Strength Rating Update Formula
Following a match outcome $S \\in \\{1.0 \\text{ (Win)}, 0.5 \\text{ (Draw)}, 0.0 \\text{ (Loss)}\\}$:
$$ R_{\\text{new}} = R_{\\text{old}} + K \\times (S - E) $$
Where the expected outcome $E$ is given by:
$$ E = \\frac{1}{10^{-(R_{\\text{old}} - R_{\\text{opponent}})/400} + 1} $$
`
  },
  {
    filename: 'ml-pipeline.md',
    title: 'Machine Learning Ingestion & Retraining Pipeline',
    purpose: 'Exposes how models are trained, evaluated, calibrated, tracked, and safely registered.',
    scope: 'Comprehensive guide for MLOps Engineers and Data Scientists.',
    responsibilities: [
      'Coordinate model training, cross-validation, and hyperparameter optimization loops.',
      'Enforce Platt Scaling and Isotonic Regression to output perfectly calibrated probability models.',
      'Implement Champion-Challenger evaluation gates before registering new model versions.'
    ],
    principles: [
      'Continuous Validation: Models must always be validated against independent, out-of-time test sets.',
      'Rigor over Hype: Prefer highly interpretable gradient boosted decision trees (LightGBM) over black-box networks.',
      'Traceable Lineage: Every model artifact must link directly to the exact dataset, features, and hyperparameters used to train it.'
    ],
    decisions: [
      'Use Optuna as the unified platform for hyperparameter tuning sweeps.',
      'Save trained models in standardized binary serialization formats inside MLflow Model Registry.'
    ],
    bestPractices: [
      'Enforce a strict temporal validation split: train on seasons 2021-2024, validate on 2025, test on 2026.',
      'Calculate Expected Calibration Error (ECE) and Brier Scores to audit model calibration quality.'
    ],
    antiPatterns: [
      'Using traditional randomized K-Fold cross validation on sports timeseries data, causing heavy future-leakage.',
      'Deploying uncalibrated model outputs directly into capital sizing engines.'
    ],
    security: 'Model artifact hashes are verified on ingestion to protect system files from arbitrary code injection.',
    performance: 'Model scoring is highly parallelized, evaluating batch arrays in less than 3ms per row.',
    scalability: 'Retraining pipelines run as standalone Celery tasks, allocating cloud resources only when training is active.',
    testing: 'Validates model performance bounds against historical dummy baselines (like market odds) to prove positive return.',
    operations: 'ML dashboard tracks drift, prediction distributions, and active champion performance metrics.',
    mistakes: [
      'Allowing training dataset target labels to bleed into testing validation sets.',
      'Relying on model accuracy metrics rather than calibration quality (Brier score) for betting evaluations.'
    ],
    improvements: [
      'Integrate automatic online training loops capable of adjusting weights after every game week.',
      'Support multi-task learning networks predicting goals, cards, and corners concurrently.'
    ],
    checklist: [
      'Confirm that the Champion model outperforms the Challenger model on test datasets before merging.',
      'Verify that Platt scaling calibration parameters are exported alongside model artifacts.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline ML Pipeline spec.' }],
    references: ['feature-store', 'feature-engineering', 'prediction-engine'],
    diagrams: `
__BTT__mermaid
graph TD
    Data[Dataset Ingest] --> Temporal[Temporal Train/Val/Test Split]
    Temporal --> Tuning[Optuna Hyperparameter Sweeps]
    Tuning --> Ensemble[Train LightGBM/XGBoost/CatBoost Ensembles]
    Ensemble --> Calibration[Calibrate Probabilities via Platt Scaling]
    Calibration --> Evaluation[Evaluate: Brier Score, ECE, Yield]
    Evaluation --> Gate{Challenger Beats Champion?}
    Gate -->|Yes| Registry[Promote to Production Registry]
    Gate -->|No| Archive[Archive Challenger Artifact]
__BTT__
`
  },
  {
    filename: 'prediction-engine.md',
    title: 'Prediction Engine Architecture',
    purpose: 'Exposes how the system scores matches using an ensemble of classifiers and exports calibrated probability vectors.',
    scope: 'Mandatory guide for core backend and ML engineers.',
    responsibilities: [
      'Generate Home-Draw-Away (H/D/A) match probabilities given rolling feature vectors.',
      'Combine models via structured voting or weighted averaging schemes.',
      'Expose a model confidence metric indicating the reliability of the calculated probability.'
    ],
    principles: [
      'Rigorous Calibration: Probabilities must represent true historical frequencies.',
      'Defensive Inference: Fail gracefully by emitting standard baseline distributions if inputs are missing.',
      'Deterministic Execution: Identical inputs must yield identical output arrays.'
    ],
    decisions: [
      'Construct ensembles combining LightGBM, XGBoost, and CatBoost models.',
      'Use Platt Scaling (logistic calibration) to map raw decision function scores to real probabilities.'
    ],
    bestPractices: [
      'Evaluate Brier Scores continually across predictions to ensure calibration holds.',
      'Cache prediction results under match IDs to avoid repetitive computational evaluations.'
    ],
    antiPatterns: [
      'Outputting un-normalized probabilities that do not sum to 1.0.',
      'Allowing predictions to run without asserting input features shape compatibility.'
    ],
    security: 'Prediction services are locked, restricting access strictly to authenticated internally routed API tokens.',
    performance: 'Inference uses fast, multi-threaded C implementations, executing in milliseconds.',
    scalability: 'Horizontally scalable container workers handle huge match card surges concurrently without degradation.',
    testing: 'Verified using static test beds, asserting prediction consistency over fixed match profiles.',
    operations: 'Fires analytical triggers tracking average prediction confidence and calibration drift over time.',
    mistakes: [
      'Over-relying on a single model during league adjustments, bypassing ensemble protections.',
      'Failing to handle blank features, leading to model scoring crashes.'
    ],
    improvements: [
      'Deploy custom neural network layers predicting dynamic odds changes over time.',
      'Introduce real-time probability streaming pipelines via WebSockets.'
    ],
    checklist: [
      'Verify that all probability predictions sum exactly to 1.0 (with low floating tolerance).',
      'Confirm that the Brier score remains within the target threshold (< 0.60).'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Prediction Engine blueprint.' }],
    references: ['ml-pipeline', 'value-betting-engine', 'simulation-engine'],
    customSections: `
### 🧠 Calibrated Ensemble Scoring Mechanism
For a given match feature vector $x$, we evaluate:
1. **Model Outputs**:
   $$ P_{\\text{LGBM}}(y|x), \\quad P_{\\text{XGB}}(y|x), \\quad P_{\\text{CAT}}(y|x) $$
2. **Weighted Ensemble**:
   $$ P_{\\text{raw}}(y|x) = w_1 P_{\\text{LGBM}} + w_2 P_{\\text{XGB}} + w_3 P_{\\text{CAT}} $$
3. **Platt Calibration Mapping**:
   $$ P_{\\text{calibrated}}(y|x) = \\frac{1}{1 + e^{A P_{\\text{raw}} + B}} $$
   *(Where $A$ and $B$ are scaling parameters trained on validation datasets)*
`
  },
  {
    filename: 'value-betting-engine.md',
    title: 'Value Betting Engine Specification',
    purpose: 'Exposes how the platform detects and calculates profitable value opportunities against South African bookmaker margins.',
    scope: 'Blueprint for developers implementing arbitrage and sizer models.',
    responsibilities: [
      'Calculate the pure mathematical expected value (EV) for every fixture market.',
      'Strip built-in bookmaker overround margins to evaluate "Fair Odds" proxies.',
      'Filter and rank value bets based on edge thresholds and predictive confidence bounds.'
    ],
    principles: [
      'Absolute Precision: EV calculations must use exact, calibrated probability inputs.',
      'Market-Driven Validation: Value is calculated strictly against real-time bookmaker prices.',
      'Safety Gating: Automatically discard matches where odds drift exceeds safety boundaries.'
    ],
    decisions: [
      'Enforce a strict value bet threshold: $Edge > 0.02$ ($2\\%$ edge) to execute slips.',
      'Adopt the Multiplicative Overround Removal model as the baseline stripping standard.'
    ],
    bestPractices: [
      'Compare edges across regional providers to execute on the highest priced option.',
      'Log the entire state of the bookmaker market at the exact millisecond of value bet creation.'
    ],
    antiPatterns: [
      'Calculating value bets using raw odds containing built-in overround margins.',
      'Directly exposing value bets with negative edges to capital sizing layers.'
    ],
    security: 'Integrates verification gates ensuring odds inputs have not been manipulated or corrupted.',
    performance: 'Optimized vector operations calculate value across thousands of odds records in less than 2ms.',
    scalability: 'The value bet identifier is stateless and processes pipelines concurrently.',
    testing: 'Verified via unit testing with fixture odds, asserting edge accuracy and overround removal logic.',
    operations: 'SRE metrics track average edge size, market volumes, and count of value bets published daily.',
    mistakes: [
      'Failing to handle bookmaker price changes, recommending stale bets that have already shrunk.',
      'Confusing the overround formula, leading to overestimated edges.'
    ],
    improvements: [
      'Integrate the Harville and Shin overround removal formulas to handle highly asymmetric markets.',
      'Support real-time SMS or Telegram notifications targeting high-edge (>10%) opportunities.'
    ],
    checklist: [
      'Confirm that the edge formula correctly maps bookmaker odds and model probabilities.',
      'Verify that odds records are marked as stale if they are not updated within 15 minutes.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Value Betting blueprint.' }],
    references: ['odds-provider', 'prediction-engine', 'bankroll-engine'],
    customSections: `
### 📐 Value Bet Mathematical Formulations

#### 1. Overround Calculation
For bookmaker decimal odds on mutually exclusive outcomes $O_1, O_2, O_3$ (e.g. Home, Draw, Away):
$$ \\text{Overround} (M) = \\sum_{i=1}^{n} \\frac{1}{O_i} - 1.0 $$
An overround $M > 0$ represents the bookmaker's built-in profit margin.

#### 2. Multiplicative Overround Removal (Fair Odds)
To find the fair implied probability $p_i^*$ stripped of the bookmaker margin:
$$ p_i^* = \\frac{1 / O_i}{1.0 + M} = \\frac{1 / O_i}{\\sum (1 / O_i)} $$
$$ \\text{Fair Odds} (O_i^*) = \\frac{1}{p_i^*} $$

#### 3. Value Edge Equation
Given the calibrated model probability $P_i$ and the active bookmaker decimal odds $O_i$:
$$ \\text{Value Edge} = (O_i \\times P_i) - 1.0 $$
A value bet is valid strictly when $\\text{Value Edge} > 0$.
`
  },
  {
    filename: 'bankroll-engine.md',
    title: 'Bankroll & Portfolio Engine Specification',
    purpose: 'Exposes how the platform allocates capital across identified value opportunities, managing risk and drawdown.',
    scope: 'Mandatory standard for sizer implementations and financial loggers.',
    responsibilities: [
      'Implement fractional Kelly Criterion models to determine optimal staking sizes.',
      'Enforce strict maximum exposure boundaries per single slip (clamped to 5.0%).',
      'Dynamically manage capital limits and restrict staking during drawdown cooling periods.'
    ],
    principles: [
      'Mathematical Sobriety: Risk limits represent an absolute barrier; never override sizer outputs under any circumstance.',
      'Long-Term Yield Focused: Optimize the geometric growth rate of bankroll while minimizing variance.',
      'Strict Isolation: Isolate sizer calculations from user emotional factors.'
    ],
    decisions: [
      'Adopt a Fractional Kelly factor of $0.10$ ($1/10$th Kelly) to safely reduce volatility.',
      'Clamp absolute maximum stake per single bet to $5.0\\%$ of the total liquid bankroll.'
    ],
    bestPractices: [
      'Re-calculate active bankroll balance dynamically prior to executing any sizing routine.',
      'Enforce an aggregate daily exposure cap: maximum $20.0\\%$ of total bankroll outstanding in active matches.'
    ],
    antiPatterns: [
      'Applying full Kelly sizing, leading to high risk of complete portfolio ruin.',
      'Recommending stakes based on absolute fiat values instead of bankroll percentages.'
    ],
    security: 'Portfolio states are audited, blocking requests attempting to place stakes exceeding account limits.',
    performance: 'Sizing logic evaluates instantly, executing in less than 0.5ms.',
    scalability: 'Sizing logs are archived in TimescaleDB hypertables, tracking capital curves across millions of historical slips.',
    testing: 'Tested against historic drawdown curves to confirm sizer keeps risk of ruin under 0.01%.',
    operations: 'SRE alerts trigger if bankroll balance experiences consecutive rapid drops exceeding 15%.',
    mistakes: [
      'Staking overlapping correlated bets concurrently without adjusting for shared risk.',
      'Failing to record unsettled slip exposure when sizing new opportunities.'
    ],
    improvements: [
      'Deploy multi-bet simultaneous Kelly allocation models solving risk covariance matrices.',
      'Integrate automatic bankroll re-balancing across connected bookmaker accounts.'
    ],
    checklist: [
      'Confirm the sizer clamps absolute maximum single stakes to 5.0% of liquid assets.',
      'Verify that Kelly stakes return exactly 0.0 if the calculated edge is negative.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Bankroll specification.' }],
    references: ['value-betting-engine', 'simulation-engine', 'reporting-engine'],
    customSections: `
### 🧮 Portfolio Sizing Formulations

#### 1. Full Kelly Criterion Sizing
For decimal odds $b$ (expressed as net decimal odds, i.e., $O_i - 1.0$), win probability $p$, and loss probability $q = 1.0 - p$:
$$ f^* = \\frac{p \\times b - q}{b} = \\frac{p \\times O_i - 1.0}{O_i - 1.0} $$
Where $f^*$ is the optimal fraction of the bankroll to allocate.

#### 2. Fractional Kelly Sizing with Clamping
To protect capital against calibration error and reduce variance, we apply a fractional scaling factor $k = 0.10$ ($1/10$th Kelly):
$$ f_{\\text{fractional}} = k \\times f^* $$
The final stake is clamped to a safety threshold $C = 0.05$ (5% max allocation):
$$ f_{\\text{final}} = \\min(f_{\\text{fractional}}, C) $$
`
  }
];

docsGroup2.forEach(doc => {
  writeFile(`${folder}/${doc.filename}`, buildDoc(doc.title, doc));
});

console.log('Successfully completed Group 2 (Files 3 to 20)...');

// Define files 20 to 38
const docsGroup3 = [
  {
    filename: 'simulation-engine.md',
    title: 'Simulation & Monte Carlo Engine Specification',
    purpose: 'Exposes the statistical simulation mechanics used to stress test capital allocations and project long-term yield bounds.',
    scope: 'Enforced within predictive and risk simulation services.',
    responsibilities: [
      'Model expected match scorelines using Poisson and negative binomial goal distributions.',
      'Execute multi-trial Monte Carlo matches simulations to identify tail risks.',
      'Stress test Kelly sizing algorithms under synthetic severe drawdown runs.'
    ],
    principles: [
      'Statistical Conservatism: Base probability simulations on worst-case model calibration limits.',
      'High-Speed Trials: Run simulation trials asynchronously inside parallel vector grids.'
    ],
    decisions: [
      'Use NumPy vector calculations inside Python simulation pipelines to execute 100,000 trials in <1s.',
      'Incorporate a correlation coefficient (Bivariate Poisson) to adjust for home-away score correlations.'
    ],
    bestPractices: [
      'Always include the confidence interval (95% range) alongside projected yield metrics.',
      'Update model simulated covariance matrices weekly to account for shifts in league play styles.'
    ],
    antiPatterns: [
      'Simulating goals as independent variables, ignoring that home/away scores are highly correlated.',
      'Using simulation results to override real bankroll clamp limitations.'
    ],
    security: 'Simulation engines run inside secure sandboxed worker tasks with zero public network access.',
    performance: 'Optimized vector loops avoid Python overhead, using compiled Cython or NumPy structures.',
    scalability: 'Simulation pipelines are horizontally scalable across independent server pods.',
    testing: 'Validated using historical outcomes to confirm simulated ranges contain actual scorelines with correct frequencies.',
    operations: 'Prometheus metrics monitor simulation worker task execution times, memory loads, and run counts.',
    mistakes: [
      'Simulating high-scoring leagues using standard Poisson parameters, failing to capture extreme tail goal counts.',
      'Failing to adjust simulations for mid-season team manager changes.'
    ],
    improvements: [
      'Integrate neural-network simulation layers to predict live game state trajectories.',
      'Support real-time portfolio performance simulator graphs on the trader dashboard.'
    ],
    checklist: [
      'Confirm Poisson models adjust for bivariate home-away score correlation coefficients.',
      'Verify simulated capital curves apply fractional Kelly constraints correctly.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Simulation blueprint.' }],
    references: ['value-betting-engine', 'bankroll-engine', 'reporting-engine'],
    customSections: `
### ⚽ Bivariate Poisson Probability Model
For home goals $X$ and away goals $Y$, the joint probability distribution is modeled as:
$$ P(X=x, Y=y) = e^{-(\\lambda_1 + \\lambda_2 + \\lambda_3)} \\frac{\\lambda_1^x}{x!} \\frac{\\lambda_2^y}{y!} \\sum_{k=0}^{\\min(x,y)} \\binom{x}{k} \\binom{y}{k} k! \\left( \\frac{\\lambda_3}{\\lambda_1 \\lambda_2} \\right)^k $$
Where:
- $\\lambda_1$: Expected home goals scored.
- $\\lambda_2$: Expected away goals scored.
- $\\lambda_3$: Covariance parameter modeling scoring dependency between teams.
`
  },
  {
    filename: 'notification-engine.md',
    title: 'Notification & Alerting Engine Specification',
    purpose: 'Exposes how the platform dispatches high-speed value bet alerts across multiple channels.',
    scope: 'Unified alerting standard across backend and integration layers.',
    responsibilities: [
      'Deliver real-time value bet notifications with sub-second latencies.',
      'Format alerts dynamically matching target channels (SMS, WebSockets, Telegram channels).',
      'Manage user subscription topics and throttling limits to prevent spamming.'
    ],
    principles: [
      'Instant Delivery: High-value opportunities must route immediately before odds expire.',
      'Topic-Driven: Alert systems must use publish-subscribe patterns to easily isolate targets.'
    ],
    decisions: [
      'Deploy Redis Pub/Sub as the main messaging broker for WebSocket connections.',
      'Leverage async webhook managers to deliver third-party (Telegram, SMS) alerts out-of-band.'
    ],
    bestPractices: [
      'Deduplicate alerts targeting the same value bet across overlapping channels.',
      'Configure automatic fallback mechanisms if a primary channel provider (e.g., SMS Gateway) fails.'
    ],
    antiPatterns: [
      'Blocking core sizer processes while waiting for Telegram or Email API acknowledgments.',
      'Sending raw JSON debug payloads directly inside public user channels.'
    ],
    security: 'Alert templates are strictly filtered to prevent cross-site scripting (XSS) or arbitrary code execution.',
    performance: 'Deliver notifications across all channels in less than 200ms from the instant of value bet discovery.',
    scalability: 'WebSocket connections are distributed across multiple state-free gateway pods behind a sticky-load balancer.',
    testing: 'Notification modules are tested using sandbox mock configurations to prevent charging real API balances.',
    operations: 'Alert metrics track delivery latency, delivery success rates, and outstanding active WebSocket connections.',
    mistakes: [
      'Triggering duplicate alerts for minor bookmaker odds fluctuations.',
      'Failing to clean up inactive WebSocket client connections, causing high server memory bloat.'
    ],
    improvements: [
      'Deploy automated AI-powered alert summaries customizing notifications based on individual user styles.',
      'Support localized language formatting for international alerts.'
    ],
    checklist: [
      'Verify that all external API integrations utilize non-blocking async network calls.',
      'Confirm that the Telegram bot credentials are encrypted inside the environment config.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Notification spec.' }],
    references: ['module-interactions', 'api-architecture', 'event-driven'],
    diagrams: `
__BTT__mermaid
graph TD
    Sizer[Sizer Discovers Value Bet] -->|Publish Event| Redis[Redis Pub/Sub Channel]
    Redis -->|Broadcast| WS[WebSocket Gateway Pods]
    Redis -->|Queue Task| Celery[Celery Push Workers]
    
    WS -->|WSS Socket| UI[React UI Client]
    Celery -->|Async HTTP| Telegram[Telegram Bot API]
    Celery -->|Async HTTP| Twilio[Twilio SMS API]
__BTT__
`
  },
  {
    filename: 'reporting-engine.md',
    title: 'Reporting & Analytics Engine Specification',
    purpose: 'Exposes how the platform aggregates historical transaction records into unified audit, ROI, and yield metrics.',
    scope: 'Universal standard for analytical reports and bento-grid widgets.',
    responsibilities: [
      'Generate unified trader analytics covering yield, win-rate, drawdown, and Brier calibrations.',
      'Support dynamic data aggregation across custom intervals (daily, weekly, league-wide).',
      'Export secure PDF and CSV analytical summaries for external compliance reviews.'
    ],
    principles: [
      'Absolute Auditability: All reports must trace back to concrete, unchanged database rows.',
      'No Rounded Approximations: Keep high-precision decimal values for all monetary and sizing calculations.'
    ],
    decisions: [
      'Execute analytical reports directly against TimescaleDB hypertables utilizing timeseries bucket structures.',
      'Generate charts using highly interactive Recharts layers on the client-side UI dashboard.'
    ],
    bestPractices: [
      'Incorporate rolling average metrics to highlight performance adjustments over market cycles.',
      'Pre-warm and cache yesterday\'s reports to speed up initial dashboard loading times.'
    ],
    antiPatterns: [
      'Calculating complex historic portfolio averages inside real-time transactional tables.',
      'Loading millions of raw slips onto the client browser to calculate simple summary statistics.'
    ],
    security: 'Access to reports is governed by strict Role-Based Access Controls, blocking unauthorized data access.',
    performance: 'Complex historical reports execute on read-replicas, completing in less than 150ms.',
    scalability: 'Report caches are stored inside Redis, protecting core databases from redundant query hits.',
    testing: 'Verified via regression tests comparing mock slip sets against mathematically calculated targets.',
    operations: 'Operational alerts track reporting times, cache hit ratios, and background pre-warming tasks.',
    mistakes: [
      'Confusing Yield (profit/turnover) with ROI (profit/bankroll) inside trader dashboards.',
      'Failing to handle blank histories, leading to division-by-zero crashes on new user accounts.'
    ],
    improvements: [
      'Deploy automated AI-powered performance analysis summarizing areas of peak profitability.',
      'Support dynamic currency conversion across international report cards.'
    ],
    checklist: [
      'Confirm all monetary summaries are calculated using precise big decimal or localized rounding rules.',
      'Verify that reports can be generated without triggering table locks on active slip ledgers.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Reporting specification.' }],
    references: ['database-architecture', 'frontend-architecture', 'bankroll-engine'],
    customSections: `
### 📊 Key Financial Performance Equations

#### 1. Yield Metric
$$ \\text{Yield} = \\frac{\\text{Net Profit}}{\\text{Total Capital Turnover}} = \\frac{\\sum (\\text{Return}_i - \\text{Stake}_i)}{\\sum \\text{Stake}_i} $$

#### 2. Brier Calibration Score (Accuracy Evaluation)
For $N$ predictions of mutually exclusive binary outcomes $y_i \\in \\{0,1\\}$ with predicted probabilities $f_i$:
$$ \\text{Brier Score} = \\frac{1}{N} \\sum_{i=1}^{N} (f_i - y_i)^2 $$
A lower Brier Score indicates higher calibration accuracy (maximum limit of 0.0 represents perfection).
`
  },
  {
    filename: 'authentication-architecture.md',
    title: 'Authentication Architecture Blueprint',
    purpose: 'Exposes how the platform validates identity, registers traders, and securely issues stateless sessions.',
    scope: 'Universal security baseline across API gateways and authorization modules.',
    responsibilities: [
      'Enforce password hashing using high-grade hashing models.',
      'Issue and verify stateless JSON Web Tokens (JWT) for secure API communications.',
      'Support secure Google Workspace OAuth2 login pathways.'
    ],
    principles: [
      'Zero Trust: Every incoming request must prove authentication claims; assume zero persistent trust.',
      'Stateless Verification: Authenticate requests using decentralized cryptography, avoiding active DB hits.'
    ],
    decisions: [
      'Hash passwords using Argon2id with strict parameters (m=65536, t=3, p=4).',
      'Store JWT tokens inside HTTP-only, SameSite=Strict cookies to protect against CSRF and XSS.'
    ],
    bestPractices: [
      'Implement short token expiration limits (15 minutes) alongside secure, rotating refresh tokens.',
      'Enforce multi-factor authentication (MFA) for administrative and portfolio actions.'
    ],
    antiPatterns: [
      'Storing authentication tokens inside client-side LocalStorage.',
      'Committing raw JWT keys or secrets inside git source code files.'
    ],
    security: 'Tokens are verified using asymmetric RS256 keys. Session validation handles IP address changes dynamically.',
    performance: 'JWT checks execute in-memory inside the API Gateway, adding less than 1ms to API calls.',
    scalability: 'Because sessions are stateless, any API node can instantly authenticate requests without checking database states.',
    testing: 'Tested using simulated token lifecycles, asserting that invalid, expired, or tampered tokens are rejected.',
    operations: 'Authentication systems log login attempts, IP geography shifts, and session revocation rates.',
    mistakes: [
      'Using weak MD5 or SHA256 hashes to store user credentials.',
      'Omitting CORS protections on authentication endpoints, allowing unauthorized cross-origin requests.'
    ],
    improvements: [
      'Transition authentication systems to standard passkey (WebAuthn) passwordless access.',
      'Integrate real-time anomaly detection identifying automated login attacks.'
    ],
    checklist: [
      'Confirm passwords are never logged in plain-text inside debug files.',
      'Verify JWT keys are loaded strictly from secure Cloud Secrets storage.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Authentication specification.' }],
    references: ['api-architecture', 'authorization-architecture', 'disaster-recovery'],
    diagrams: `
__BTT__mermaid
sequenceDiagram
    Client ->> OAuth Ingress: POST /api/v1/auth/login (credentials)
    OAuth Ingress ->> DB: Fetch User Hash
    DB -->> OAuth Ingress: User Record
    OAuth Ingress ->> OAuth Ingress: Verify Argon2id
    OAuth Ingress ->> Secure Token Service: Issue RS256 Tokens
    Secure Token Service -->> Client: Return HttpOnly Cookie (JWT) & JSON User Metadata
__BTT__
`
  },
  {
    filename: 'authorization-architecture.md',
    title: 'Authorization & Role-Based Access Control Specification',
    purpose: 'Exposes how the platform protects endpoints and models using strict Role-Based Access Controls (RBAC).',
    scope: 'Universal authorization standard across all platform endpoints and roles.',
    responsibilities: [
      'Define standard user roles: Admin, Trader, Analyst, Reader.',
      'Enforce fine-grained RBAC permissions mapping roles to actions (e.g., write:slips, read:predictions).',
      'Prevent unauthorized endpoint access using automated route decorators.'
    ],
    principles: [
      'Least Privilege: Access is granted to the minimum necessary level of permissions required to complete the task.',
      'Explicit Authorization: Deny access by default; all access permissions must be explicitly declared.'
    ],
    decisions: [
      'Declare roles and permissions within JWT claims.',
      'Decorate FastAPI endpoints with strict dependency decorators (`depends_permission("write:slips")`).'
    ],
    bestPractices: [
      'Verify that administrative actions require multi-signature approvals on production servers.',
      'Regularly audit role definitions and permissions maps against compliance guidelines.'
    ],
    antiPatterns: [
      'Hardcoding permission checks inside core business or database model classes.',
      'Allowing traders to edit historical odds parameters or training configurations.'
    ],
    security: 'Prevents vertical and horizontal privilege escalations, protecting trading portfolios and users data.',
    performance: 'Decentralized JWT checks keep routing quick and overhead-free.',
    scalability: 'Role configurations are modular, allowing effortless addition of custom permissions maps.',
    testing: 'Endpoints are tested using mock users representing each role to verify correct access blocks.',
    operations: 'Maintains structured security trails logging all denied access attempts with source IP details.',
    mistakes: [
      'Confusing Authorization (permissions) with Authentication (identity) inside routers.',
      'Omitting privilege checks on delete endpoints, allowing global deletions.'
    ],
    improvements: [
      'Transition authorization check layers to centralized open policy agents (like OPA).',
      'Implement real-time session revocation capabilities.'
    ],
    checklist: [
      'Confirm all endpoints modifying database state are protected by permission decorators.',
      'Verify that the Admin role is the only role with permissions to delete resources.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Authorization blueprint.' }],
    references: ['api-architecture', 'authentication-architecture', 'logging'],
    customSections: `
### 🛡️ Role to Permissions Standard Matrix

| Role | Permissions Mapping | Scope Description |
| :--- | :--- | :--- |
| **Admin** | \`read:*\`, \`write:*\`, \`delete:*\` | Full system control, infrastructure management, configuration changes. |
| **Trader** | \`read:*\`, \`write:slips\`, \`write:bankroll\` | Manage wallet assets, log active slips, run portfolio allocation models. |
| **Analyst**| \`read:*\`, \`write:models\`, \`write:predictions\` | Run ML retraining sweeps, adjust feature configurations, evaluate scoring. |
| **Reader** | \`read:fixtures\`, \`read:predictions\`, \`read:odds\` | View active dashboards, read predictions, trace current value edges. |
`
  },
  {
    filename: 'caching-architecture.md',
    title: 'Caching & Data Pre-warming Architecture',
    purpose: 'Exposes the multi-tier caching standard used to maximize throughput and limit database locks.',
    scope: 'Universal caching standard across API gateways, workers, and scrapers.',
    responsibilities: [
      'Minimize database CPU loads by caching high-frequency static datasets.',
      'Manage Redis cache-aside, write-through, and cache-invalidation flows.',
      'Pre-warm critical data pools (odds tables, team indices) on regular schedules.'
    ],
    principles: [
      'Validate Cache Invalidation: A cache without a robust invalidation rule is a critical system vulnerability.',
      'Data Locality: Store hot static resources closest to the execution point.'
    ],
    decisions: [
      'Deploy Redis as the centralized distributed caching cluster.',
      'Set strict, automated Time-To-Live (TTL) limits on all cached keys.'
    ],
    bestPractices: [
      'Use structured JSON strings for cached values to preserve model representations.',
      'Implement a fallback circuit breaker: if Redis drops, route requests directly to the database without crashing the client.'
    ],
    antiPatterns: [
      'Caching high-frequency timeseries data without checking memory consumption limits.',
      'Forgetting to invalidate cached odds when a match gets postponed or canceled.'
    ],
    security: 'Redis connections are fully encrypted (TLS) and require strong password credentials.',
    performance: 'Reduces hot endpoint response latencies to <5ms, bypassing heavy database queries.',
    scalability: 'Reduces database read-replica CPU consumption, freeing resources for write operations.',
    testing: 'Tested by evaluating API outputs before and after invalidation events to confirm correct freshness.',
    operations: 'Monitors Redis cache hit/miss ratios, total memory footprint, and network loads.',
    mistakes: [
      'Using the same Redis instance for caching, Celery task broker, and WebSockets without isolating database IDs.',
      'Failing to handle cache stampedes on hot match cards.'
    ],
    improvements: [
      'Deploy localized in-memory caches (like lru-cache) alongside distributed Redis layers.',
      'Configure auto-scaling Redis clusters to dynamically handle traffic peaks.'
    ],
    checklist: [
      'Confirm all cache keys have explicit, finite TTL parameters.',
      'Verify that cache bypass options are supported for development and troubleshooting.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Caching specification.' }],
    references: ['backend-architecture', 'database-architecture', 'monitoring'],
    diagrams: `
__BTT__mermaid
graph TD
    Client[API Request] --> Controller[API Controller]
    Controller -->|Check Cache| Redis{Redis Cache Hit?}
    Redis -->|Yes| Return[Return JSON Payload]
    Redis -->|No| DB[(PostgreSQL Database)]
    DB -->|Write Back| Redis
    DB --> Return
__BTT__
`
  },
  {
    filename: 'event-driven.md',
    title: 'Event-Driven Architecture Reference',
    purpose: 'Exposes how the platform uses asynchronous messages and event-driven architectures to maintain decoupling.',
    scope: 'Standard guide for developers designing pub-sub and worker workflows.',
    responsibilities: [
      'Maintain transactional boundaries using clean asynchronous message channels.',
      'Specify standard event schemas and ensure structural payloads validation.',
      'Manage dead-letter queue structures to protect messages from loss.'
    ],
    principles: [
      'Producer Decoupling: Producers emit events without knowing which consumers will handle them.',
      'At-Least-Once Delivery: Enforce acknowledgement rules to ensure zero events are lost.'
    ],
    decisions: [
      'Use Redis Stream structures and Celery workers as the core event distribution engine.',
      'Validate all event payloads using strict Pydantic schemas prior to dispatch.'
    ],
    bestPractices: [
      'Incorporate correlation IDs on all event headers to enable distributed trace mappings.',
      'Ensure event handlers are idempotent to safely handle duplicate message deliveries.'
    ],
    antiPatterns: [
      'Designing synchronous API endpoints that wait for background events to resolve before returning.',
      'Publishing unstructured text strings instead of typed JSON schemas.'
    ],
    security: 'Event messages are encrypted in transit and can only be decrypted by authorized services.',
    performance: 'Maintains high throughput, processing thousands of events per second with sub-millisecond dispatch times.',
    scalability: 'Since event consumers are stateless, they can scale horizontally to handle backlogs.',
    testing: 'Tested using mock event streams, asserting correct consumer reactions.',
    operations: 'Monitors queue depths, consumer lag times, and dead-letter queue (DLQ) write rates.',
    mistakes: [
      'Allowing infinite retry loops on corrupt message structures.',
      'Creating circular event patterns where Event A triggers Event B, which triggers Event A.'
    ],
    improvements: [
      'Transition core messaging loops to Apache Kafka or RabbitMQ for advanced routing.',
      'Support real-time event-sourcing audits.'
    ],
    checklist: [
      'Confirm all events have unique UUID identifiers and timestamps.',
      'Verify that dead-letter queues are configured with automatic notification triggers.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Event-Driven specification.' }],
    references: ['bounded-contexts', 'module-interactions', 'dependency-graph'],
    customSections: `
### 📩 Core Event Payload Specifications

#### 1. FixtureCreated Event (\`fixtures.event.created\`)
\`\`\`json
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
\`\`\`

#### 2. OddsUpdated Event (\`odds.event.updated\`)
\`\`\`json
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
\`\`\`
`
  },
  {
    filename: 'logging.md',
    title: 'Logging & Audit Trails Standard',
    purpose: 'Exposes the structured logging and audit standard required across all platform layers.',
    scope: 'Universal standard for loggers, audit tables, and telemetry.',
    responsibilities: [
      'Enforce structured JSON logging formats across all services.',
      'Log system events, transaction records, and user adjustments in unalterable audits.',
      'Filter and block sensitive data (passwords, tokens) from entering log outputs.'
    ],
    principles: [
      'No Arbitrary Text Logs: Logs must use parsed JSON structures; avoid unstructured prints.',
      'Traceability: Every log line must include a correlation ID tracing back to the entry point.'
    ],
    decisions: [
      'Use Python `structlog` to format JSON output streams to standard output (stdout).',
      'Deploy immutable audit tables to track changes to sizer capital settings and trading balances.'
    ],
    bestPractices: [
      'Map logs to appropriate severity levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).',
      'Aggregate log streams centrally to facilitate quick cross-service queries.'
    ],
    antiPatterns: [
      'Using Python raw prints or basic logger formats without JSON structures.',
      'Logging sensitive user data (e.g. API keys or plain-text credentials).'
    ],
    security: 'Protects log files from tampering, and ensures they contain zero secrets or customer information.',
    performance: 'Non-blocking async log handlers prevent logging tasks from slowing down performance loops.',
    scalability: 'Stdout logging allows modern cloud engines (like GCP Logging) to aggregate logs dynamically.',
    testing: 'Tested using assertion checks to confirm logger components successfully scrub secret keys.',
    operations: 'Centralized log aggregation allows SREs to isolate pipeline errors inside unified dashboards.',
    mistakes: [
      'Forgetting to catch exceptions cleanly, letting long traceback strings swamp output logs.',
      'Using the WRONG severity level, flooding production systems with DEBUG noise.'
    ],
    improvements: [
      'Deploy automatic AI log analyzers to highlight system anomalies before outages occur.',
      'Support dynamic logging level adjustment on active production containers.'
    ],
    checklist: [
      'Confirm all loggers generate parsed JSON strings to stdout.',
      'Verify that all correlation IDs are successfully propagated across services.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Logging spec.' }],
    references: ['backend-architecture', 'monitoring', 'observability'],
    customSections: `
### 📝 Standard JSON Structured Log Schema
\`\`\`json
{
  "timestamp": "2026-06-30T05:10:00.123Z",
  "level": "INFO",
  "logger": "prediction_engine",
  "message": "Successfully scored match",
  "trace_id": "t1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "span_id": "s1a2b3c4",
  "context": {
    "fixture_id": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    "league": "SA Premier Division",
    "model_version": "v2.1.0",
    "execution_time_ms": 12.5,
    "predictions": {
      "home": 0.45,
      "draw": 0.30,
      "away": 0.25
    }
  }
}
\`\`\`
`
  },
  {
    filename: 'monitoring.md',
    title: 'Monitoring & SLI/SLA Framework',
    purpose: 'Exposes how the platform tracks health metrics, Service Level Indicators (SLIs), and Service Level Objectives (SLOs).',
    scope: 'Universal monitoring baseline for SREs and system administrators.',
    responsibilities: [
      'Expose metric capture setups across APIs, workers, scrapers, and databases.',
      'Establish clear thresholds for latency, error rates, and scraper uptime metrics.',
      'Maintain alert routing configurations to dispatch alerts to target teams.'
    ],
    principles: [
      'No Blank Alerts: Alerts must link to actionable playbooks; avoid alerts that do not require intervention.',
      'Metric Simplicity: Focus monitoring on key user-facing outcomes (API response latency, scraper rates).'
    ],
    decisions: [
      'Leverage Prometheus to pull metric targets across active containers.',
      'Use Grafana to visualize system performance and track SLO objectives.'
    ],
    bestPractices: [
      'Incorporate the four golden signals (Latency, Traffic, Errors, Saturation) in all dashboards.',
      'Group alerting thresholds dynamically based on moving standard deviations.'
    ],
    antiPatterns: [
      'Setting overly sensitive alert triggers, causing alarm fatigue.',
      'Failing to monitor database connection pool utilization.'
    ],
    security: 'Metrics endpoints are locked, restricting access to authorized monitoring collectors.',
    performance: 'Prometheus scraping endpoints add minimal overhead (<0.1% CPU).',
    scalability: 'Monitors auto-scaling performance to verify container instances expand as load increases.',
    testing: 'Alerting thresholds are validated in test environments by simulating system failures.',
    operations: 'Alerts route automatically to target Slack channels and PagerDuty schedules.',
    mistakes: [
      'Omitting scraper ingestion checks, failing to notice when a scraper begins generating empty feeds.',
      'Failing to log disk usage, leading to silent database freezes.'
    ],
    improvements: [
      'Integrate machine-learning metric anomaly detectors.',
      'Deploy automated self-healing scripts triggered by critical operational alerts.'
    ],
    checklist: [
      'Verify that all endpoints declare a corresponding latency SLO metric.',
      'Confirm that the scraper error rate remains below the threshold limit.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Monitoring blueprint.' }],
    references: ['logging', 'observability', 'disaster-recovery'],
    customSections: `
### 📈 Service Level Indicator (SLI) Standards

| SLI | Metric Equation | Target Objective (SLO) | Severity |
| :--- | :--- | :--- | :--- |
| **API Latency** | \`% of requests resolved in <50ms\` | **99.5%** | High |
| **API Error Rate** | \`% of 5xx errors / total requests\` | **<0.1%** | Critical |
| **Scraper Success**| \`% of successful scrapes / total attempts\` | **98.0%** | Medium |
| **Predictor Freshness** | \`Time since last prediction sweep\` | **<15 mins** | High |
`
  },
  {
    filename: 'observability.md',
    title: 'Observability & Distributed Tracing Specification',
    purpose: 'Exposes how the platform implements open telemetry, context propagation, and error tracing.',
    scope: 'Universal standard for distributed tracing and Sentry error telemetry.',
    responsibilities: [
      'Capture end-to-end execution spans across APIs, databases, Celery queues, and scrapers.',
      'Propagate trace context parameters across asynchronous processing boundaries.',
      'Capture unhandled exception traces and report details to central debugging panels.'
    ],
    principles: [
      'Full Visibility: Trace every request from client click to database write.',
      'Context Preservation: Never drop trace headers when crossing asynchronous network bounds.'
    ],
    decisions: [
      'Adopt OpenTelemetry as the standardized tracing format.',
      'Integrate Sentry to capture client and server errors dynamically.'
    ],
    bestPractices: [
      'Include trace and span IDs in all log lines to enable rapid cross-referencing.',
      'Configure tracing sampling parameters dynamically to control storage cost bounds.'
    ],
    antiPatterns: [
      'Failing to propagate trace context parameters across celery worker calls.',
      'Failing to capture database query execution spans inside tracing panels.'
    ],
    security: 'Tracing payloads are parsed, filtering out customer credentials, API keys, and personal info.',
    performance: 'OpenTelemetry collectors utilize asynchronous UDP protocols to export traces without blocking active thread processes.',
    scalability: 'Distributed traces facilitate localization of slow services inside complex microservice systems.',
    testing: 'Traces are validated during integration test loops, verifying correct span links.',
    operations: 'APM dashboards provide deep visualization of system bottlenecks.',
    mistakes: [
      'Setting the tracing sample rate to 100% on high-frequency live markets, generating huge storage bills.',
      'Ignoring Sentry alert spikes, treating errors as benign noise.'
    ],
    improvements: [
      'Implement real-time visual tracing maps on the developer dashboard.',
      'Support automatic trace correlation with active git commit histories.'
    ],
    checklist: [
      'Verify that Sentry is initialized correctly on both React client and Python backend.',
      'Confirm that trace propagation headers are included in all asynchronous Celery payloads.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Observability blueprint.' }],
    references: ['logging', 'monitoring', 'backend-architecture'],
    diagrams: `
__BTT__mermaid
graph LR
    UI[React App] -->|Trace Headers: traceparent| API[FastAPI Ingress]
    API -->|Span 1: Auth| Auth[JWT Validator]
    API -->|Span 2: DB Query| DB[(PostgreSQL)]
    API -->|Span 3: Dispatch Worker| Redis[(Redis Queue)]
    Redis -->|Context Propagated| Worker[Celery prediction Worker]
    Worker -->|Span 4: Score Model| ML[Model Engine]
__BTT__
`
  },
  {
    filename: 'scalability.md',
    title: 'Scalability & Load Balancer Reference',
    purpose: 'Exposes how the platform handles massive odds ingestion spikes and scales to thousands of concurrent users.',
    scope: 'Blueprint for infrastructure designers and devops engineers.',
    responsibilities: [
      'Design stateless, horizontally scalable container topologies.',
      'Configure auto-scaling thresholds and load balancing rules.',
      'Optimize database scaling parameters (read-replicas, connection pooling).'
    ],
    principles: [
      'Stateless Core: API nodes must store zero session states, enabling elastic, multi-region scaling.',
      'Dynamic Auto-scaling: Scale resources based on actual demand metrics (CPU, queue backlog).'
    ],
    decisions: [
      'Deploy stateless container instances on GCP Cloud Run.',
      'Configure auto-scaling triggers based on target CPU utilization (set at 70%).'
    ],
    bestPractices: [
      'Utilize read-replicas for all heavy read operations (reporting, dashboard history charts).',
      'Deploy caching layers (Redis) to decouple hot endpoints from core relational databases.'
    ],
    antiPatterns: [
      'Scaling databases vertically instead of utilizing connection pooling and read-replicas.',
      'Using local container storage for persistent assets.'
    ],
    security: 'Load balancers terminate SSL certificates, restricting access to secure HTTPS/WSS protocols.',
    performance: 'Maintains low API latency under concurrent load surges by distributing traffic evenly across active nodes.',
    scalability: 'Proven horizontal scaling, dynamically expanding from 2 to 50+ API nodes in under 2 minutes.',
    testing: 'Validated via regular load testing runs (using Locust) to find and fix system limits.',
    operations: 'Monitors horizontal pod count, load balancer latencies, and auto-scaling events.',
    mistakes: [
      'Hardcoding connection counts in server scripts, causing connection pool exhaustion during scale-out events.',
      'Failing to scale background workers, causing massive message queues during match spikes.'
    ],
    improvements: [
      'Deploy multi-region load balancers to minimize global user latencies.',
      'Incorporate serverless databases to scale storage dynamically.'
    ],
    checklist: [
      'Verify that all API endpoints are fully stateless.',
      'Confirm that PgBouncer is configured correctly to pool database connections.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Scalability specification.' }],
    references: ['system-overview', 'database-architecture', 'infrastructure'],
    diagrams: `
__BTT__mermaid
graph TD
    Ingress[Cloud Load Balancer] -->|Terminates SSL / Round Robin| API1[FastAPI Node 1]
    Ingress --> API2[FastAPI Node 2]
    Ingress --> APIn[FastAPI Node N]
    
    API1 & API2 & APIn --> PgBouncer[PgBouncer Connection Pooler]
    PgBouncer --> DB_Master[(PostgreSQL Master - Writes)]
    PgBouncer --> DB_Replica[(PostgreSQL Replica - Reads)]
__BTT__
`
  },
  {
    filename: 'infrastructure.md',
    title: 'Infrastructure & Containerization Specification',
    purpose: 'Exposes how the platform utilizes container configurations and environment variables for local and production runtimes.',
    scope: 'Universal baseline for all development container definitions.',
    responsibilities: [
      'Provide clean, multi-stage Docker configurations optimized for lightweight production footprints.',
      'Expose unified docker-compose blueprints to bootstrap local environments easily.',
      'Enforce environment variable injection paths.'
    ],
    principles: [
      'Environment Parity: Keep development, staging, and production environments as identical as possible.',
      'Minimal Container Footprints: Utilize multi-stage builds to exclude build tools from production runtimes.'
    ],
    decisions: [
      'Deploy multi-stage Docker builds to compile frontend assets and isolate backend environments.',
      'Enforce environment configuration strictly using `.env` injections.'
    ],
    bestPractices: [
      'Run container processes as non-root users to limit system vulnerabilities.',
      'Scan containers regularly for security vulnerabilities before deployment.'
    ],
    antiPatterns: [
      'Committing secret keys, passwords, or configuration assets inside active Docker files.',
      'Letting unnecessary developer files (like node_modules or .git) build inside final container layers.'
    ],
    security: 'Isolates processes using standard secure containers, running processes under non-privileged accounts.',
    performance: 'Reduces production container sizes to <200MB, speeding up cold starts and scaling speeds.',
    scalability: 'Facilitates standard, lightweight container deployment across modern orchestration engines.',
    testing: 'Containers are validated in staging environments prior to production release.',
    operations: 'Container metrics trace CPU, memory, network load, and execution logs.',
    mistakes: [
      'Failing to declare correct `.dockerignore` paths, bloating container build weights.',
      'Hardcoding environment-specific configurations inside base container structures.'
    ],
    improvements: [
      'Deploy automated container scanning tools inside CI/CD pipelines.',
      'Support serverless container architectures.'
    ],
    checklist: [
      'Confirm all Dockerfiles leverage lightweight alpine or slim base images.',
      'Verify that all container layers run under non-root users.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Infrastructure spec.' }],
    references: ['system-overview', 'backend-architecture', 'deployment'],
    customSections: `
### 🐳 Production Multi-Stage Python Dockerfile Blueprint
\`\`\`dockerfile
# Stage 1: Build Dependencies
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production Execution
FROM python:3.11-slim as runner

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    libpq5 \\
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 3000

# Run as non-privileged system user
RUN useradd -u 8888 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3000"]
\`\`\`
`
  },
  {
    filename: 'deployment.md',
    title: 'Deployment & CI/CD Pipeline',
    purpose: 'Exposes the automated deployment, integration pipeline, and zero-downtime release blueprints.',
    scope: 'Universal standard for continuous deployment and release configurations.',
    responsibilities: [
      'Coordinate CI/CD pipelines verifying commits before merging to primary branches.',
      'Automate linting, unit testing, and vulnerability check steps.',
      'Deploy zero-downtime blue-green upgrades on Cloud Run clusters.'
    ],
    principles: [
      'Continuous Integration: Commits to the primary branch must be verified automatically.',
      'Zero-Downtime Deployments: Maintain active server runtimes during releases using gradual routing shifts.'
    ],
    decisions: [
      'Use GitHub Actions to orchestrate pipeline steps.',
      'Deploy to Google Cloud Run utilizing blue-green gradual traffic allocations.'
    ],
    bestPractices: [
      'Require senior engineer approvals before merging changes to production release channels.',
      'Automate rollback procedures if any deployment shows performance anomalies.'
    ],
    antiPatterns: [
      'Deploying changes directly to production servers manually.',
      'Skipping linting or testing steps to bypass pipeline runtimes.'
    ],
    security: 'CI/CD pipelines authenticate with Google Cloud using secure OIDC credentials, eliminating static key risks.',
    performance: 'Deployments compile quickly, resolving complete build-to-test checks in under 5 minutes.',
    scalability: 'Facilitates elastic deployment across global environments.',
    testing: 'Pipelines require 100% test success before enabling container promotions.',
    operations: 'Deployment logs trace pipeline durations, build successes, and container tags.',
    mistakes: [
      'Merging untested database migrations that lock production tables.',
      'Failing to run integration tests prior to traffic routing shifts.'
    ],
    improvements: [
      'Incorporate AI-powered deployment anomaly detectors.',
      'Deploy automated Canary testing patterns.'
    ],
    checklist: [
      'Confirm that all pipeline actions use exact version hashes.',
      'Verify that rollback playbooks can execute with a single click.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Deployment spec.' }],
    references: ['infrastructure', 'disaster-recovery', 'testing'],
    diagrams: `
__BTT__mermaid
graph TD
    Commit[Commit to Main] --> Lint[Run Linters & Format Checks]
    Lint --> Test[Execute Pytest & React Tests]
    Test --> Build[Build Production Docker Images]
    Build --> Scan[Scan Container Vulnerabilities]
    Scan --> Deploy[Deploy to Cloud Run - Staging]
    Deploy --> E2E[Execute Playwright E2E Tests]
    E2E --> Shift[Gradual Traffic Shift to Production - Blue/Green]
__BTT__
`
  },
  {
    filename: 'disaster-recovery.md',
    title: 'Disaster Recovery & Outage Blueprint',
    purpose: 'Exposes recovery playbooks, Recovery Point/Time Objectives, database failovers, and backup strategies.',
    scope: 'Universal guide for SREs during system outages and critical data losses.',
    responsibilities: [
      'Define recovery targets: Recovery Point Objective (RPO) and Recovery Time Objective (RTO).',
      'Provide step-by-step instructions for database failover and data restoration.',
      'Expose plans for regional cloud outages.'
    ],
    principles: [
      'Rigor over Speed: Verify data integrity and security before bringing systems back online after a crash.',
      'Continuous Backups: Run dynamic backup sweeps continuously to protect active records.'
    ],
    decisions: [
      'Define strict objectives: RPO = 1 hour (max data loss limit), RTO = 15 minutes (max restoration delay limit).',
      'Use continuous WAL archiving to enable Point-In-Time-Recovery (PITR) on PostgreSQL databases.'
    ],
    bestPractices: [
      'Test restoration playbooks quarterly to confirm they remain functional.',
      'Store backups across multiple geographical cloud zones to protect against primary regional failures.'
    ],
    antiPatterns: [
      'Failing to verify backups, discovering corrupt files during restoration attempts.',
      'Relying on manual snapshots for database protection.'
    ],
    security: 'Backups are fully encrypted at rest using AES-256 and stored inside secure write-once cloud storage buckets.',
    performance: 'Failovers route traffic instantly via DNS transitions, minimizing user-facing disruptions.',
    scalability: 'Supports automated failover across read replica pools.',
    testing: 'Validated via scheduled, non-disruptive DR drills simulating zone outages.',
    operations: 'Maintains distinct notification channels alert-routing SREs directly during outages.',
    mistakes: [
      'Storing database secrets inside backup files, compromising keys during security breaches.',
      'Failing to stop automated scrapers during restoration runs, duplicating ingest data.'
    ],
    improvements: [
      'Deploy automated self-healing cloud routing structures.',
      'Incorporate real-time active-active multi-region databases.'
    ],
    checklist: [
      'Confirm all backups are verified and readable.',
      'Verify SRE teams have direct access keys to independent backup storage blocks.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Disaster Recovery specification.' }],
    references: ['database-architecture', 'monitoring', 'scalability'],
    customSections: `
### 📋 Disaster Recovery Tier Objectives

| Recovery Metric | Target Objective | Implementation Strategy |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **<1 Hour** | Hourly encrypted PostgreSQL snapshots + continuous WAL archiving to GCS. |
| **Recovery Time Objective (RTO)** | **<15 Mins** | Automated load balancer traffic redirection to secondary active-passive zone. |
| **Backup Retention Policy** | **30 Days** | Encrypted GCS bucket with immutability locks (WORM) and lifecycle rules. |
| **Data Integrity Verification**| **Weekly** | Automated backup restoration tests onto ephemeral staging databases. |
`
  },
  {
    filename: 'testing.md',
    title: 'Testing Strategy & Quality Gates',
    purpose: 'Exposes the comprehensive testing framework, quality metrics, and continuous integration validation rules.',
    scope: 'Universal standard for developers writing test suites and verifying code.',
    responsibilities: [
      'Define quality metrics: required unit test coverage (80% minimum), and visual check gates.',
      'Expose test methodologies across Pytest backend and React Testing frontend.',
      'Enforce automated integration and end-to-end user path verifications.'
    ],
    principles: [
      'Pristine Quality: Quality checks are non-negotiable; never bypass testing gates to meet deadlines.',
      'Test Decoupling: Unit tests must execute in isolation, using mocked resources instead of real databases.'
    ],
    decisions: [
      'Enforce Pytest as the primary backend testing framework and React Testing Library on frontends.',
      'Use Playwright to execute automated end-to-end user flow verifications.'
    ],
    bestPractices: [
      'Mock external bookmaker APIs and scraping target networks using recorded network responses.',
      'Verify that ML calibration tests run on every model version change to ensure accuracy holds.'
    ],
    antiPatterns: [
      'Allowing unit tests to communicate with active third-party APIs during pipeline runs.',
      'Writing superficial assertions to increase coverage percentages without testing logic.'
    ],
    security: 'Tests run in clean, isolated pipelines, protecting operational keys and customer data.',
    performance: 'Optimized test suites parallelize tests to execute hundreds of unit assertions in <10s.',
    scalability: 'Facilitates addition of customized test suites as modules expand.',
    testing: 'Continuous integration pipelines verify that all tests pass before allowing merges.',
    operations: 'Operational dashboards track testing performance, coverage rates, and pipeline success.',
    mistakes: [
      'Writing fragile tests tied to specific UI elements, breaking on minor visual updates.',
      'Omitting edge cases (like blank inputs or negative values) from test profiles.'
    ],
    improvements: [
      'Deploy automated AI-powered test generators.',
      'Incorporate performance stress tests directly inside validation pipelines.'
    ],
    checklist: [
      'Confirm unit test coverage matches or exceeds the required 80% limit.',
      'Verify all integration tests execute successfully without accessing real production databases.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Testing specification.' }],
    references: ['backend-architecture', 'frontend-architecture', 'deployment'],
    customSections: `
### 🧪 Core Test Bed Blueprint Examples

#### 1. Python Pytest Unit Mocking (\`test_value_betting.py\`)
\`\`\`python
import pytest
from engines.value import calculate_edge, remove_overround

def test_overround_removal():
    odds = {"home": 2.15, "draw": 3.20, "away": 3.40}
    fair_probs = remove_overround(odds)
    assert abs(sum(fair_probs.values()) - 1.0) < 1e-5
    assert fair_probs["home"] < (1.0 / 2.15)

def test_edge_calculation():
    odds_home = 2.50
    prob_home = 0.45  # Calibrated model probability
    edge = calculate_edge(odds_home, prob_home)
    assert edge == pytest.approx(0.125)  # (2.50 * 0.45) - 1.0 = 0.125 (12.5% edge)
\`\`\`
`
  },
  {
    filename: 'sequence-diagrams.md',
    title: 'System Sequence Diagrams',
    purpose: 'Exposes complete, high-fidelity visual interaction sequences across all platform workflows.',
    scope: 'Universal visualization standard for complex system interactions.',
    responsibilities: [
      'Provide clear, detailed sequence representations for prediction generation, odds scraping, and slip settling.',
      'Visualize async processing steps, Redis event loops, and WebSocket updates.',
      'Serve as the baseline guide to trace pipeline communication paths.'
    ],
    principles: [
      'Visual Clarity: Keep sequence diagrams scannable, detailed, and perfectly matching actual code behaviors.',
      'Detailed Labeling: Every arrow must define a concrete action, protocol (HTTP/REST, WS, PubSub), and return payload.'
    ],
    decisions: [
      'Model all sequence diagrams inside Mermaid to facilitate in-line updates.',
      'Ensure every key system workflow is visually represented.'
    ],
    bestPractices: [
      'Group related interactions into clean logical blocks.',
      'Regularly update diagrams to reflect modifications to backend service endpoints.'
    ],
    antiPatterns: [
      'Designing conceptual sequence diagrams that do not match the actual code communication steps.',
      'Omitting error or exception paths from interaction charts.'
    ],
    security: 'Validates that security validations are handled at the correct steps during system interactions.',
    performance: 'Identifies redundant network calls and database queries inside sequence paths.',
    scalability: 'Decoupled sequence steps facilitate microservice migrations.',
    testing: 'Sequence paths guide integration testing scenarios.',
    operations: 'Helps SREs identify and trace bottlenecks inside multi-tier workflows.',
    mistakes: [
      'Failing to represent connection failure paths.',
      'Mixing conceptual business views with actual software execution details.'
    ],
    improvements: [
      'Deploy automated tools to generate visual traces from active server transactions.',
      'Support dynamic dependency visualizations on SRE consoles.'
    ],
    checklist: [
      'Verify that the sequence diagrams match the active backend endpoints.',
      'Confirm all asynchronous worker steps are correctly highlighted.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Sequence Diagrams released.' }],
    references: ['module-interactions', 'api-architecture', 'event-driven'],
    diagrams: `
### ⚡ High-Fidelity Odds Scraping & DB Ingest Sequence
__BTT__mermaid
sequenceDiagram
    autonumber
    participant Scraper as Celery Scraper Worker
    participant Bookie as Bookmaker API (Betway)
    participant Redis as Redis Cache / Lock
    participant DB as TimescaleDB Master
    participant WS as WebSocket Broadcaster

    Scraper->>Redis: Check Ingestion Lock (match_id)
    Redis-->>Scraper: Lock Acquired (TTL = 10s)
    Scraper->>Bookie: GET /v1/active-odds
    Bookie-->>Scraper: HTTP 200 (JSON payload)
    Scraper->>Scraper: Sanitize & Standardize Teams
    Scraper->>DB: INSERT INTO odds_timeseries (Async)
    DB-->>Scraper: Insert Complete (Timescale Hypertable)
    Scraper->>WS: Broadcast OddsUpdate Event
    WS-->>UI: Send WebSocket Event (odds_updated)
    Scraper->>Redis: Release Ingestion Lock (match_id)
__BTT__

### 🎯 Machine Learning Inference & Value Bet Pipeline Sequence
__BTT__mermaid
sequenceDiagram
    autonumber
    participant Scheduler as Celery Beat
    participant MLWorker as ML Inference Worker
    participant DB as TimescaleDB Replica
    participant Sizer as Bankroll Sizer Engine
    participant Notify as Notification Engine

    Scheduler->>MLWorker: Trigger Inference Task (fixture_id)
    MLWorker->>DB: Fetch Feature Vectors & Rolling Forms
    DB-->>MLWorker: Feature Values Returned
    MLWorker->>MLWorker: Run LGBM/XGB Ensemble Prediction
    MLWorker->>MLWorker: Apply Platt Scaling (Calibration)
    MLWorker->>DB: INSERT INTO predictions
    MLWorker->>Sizer: Evaluate Value Edge & fractional Kelly Sizing
    Sizer->>Sizer: Check Kelly Clamps (Max 5.0% Slip Allocation)
    Sizer->>DB: INSERT INTO value_bets
    Sizer->>Notify: Dispatch ValueAlert Event
    Notify-->>User: Push Alert (Telegram & WebSocket Client)
__BTT__
`
  },
  {
    filename: 'state-machines.md',
    title: 'Platform State Machines',
    purpose: 'Exposes standard lifecycles, states, and transition rules for key platform aggregates.',
    scope: 'Universal standard for state transitions and validation rules.',
    responsibilities: [
      'Define finite state machines for fixtures, predictions, value bets, and user slips.',
      'Enforce transition rules, blocking invalid status changes (e.g., settling a pending slip before kick-off).',
      'Log state transition histories to preserve comprehensive audits.'
    ],
    principles: [
      'Deterministic Transitions: State changes must be driven by strict, validated event triggers.',
      'Auditability: Every state change must record a corresponding event timestamp and user/worker ID.'
    ],
    decisions: [
      'Model state machines inside database schema validations and application models.',
      'Publish state transition events asynchronously to inform dependent microservices.'
    ],
    bestPractices: [
      'Validate state transitions inside database transaction blocks.',
      'Enforce safe default states (e.g., Fixtures default to "Scheduled", Slips default to "Pending").'
    ],
    antiPatterns: [
      'Updating state values directly in memory without checking active transition rules.',
      'Failing to handle terminal states, allowing settled records to re-enter active loops.'
    ],
    security: 'Prevents fraudulent or malicious state changes, protecting financial assets and transaction audits.',
    performance: 'Transitions execute instantly in database blocks, avoiding synchronization delays.',
    scalability: 'Decoupled event triggers allow horizontal scaling of state-monitoring services.',
    testing: 'Tested using state-transition assertion checks, verifying correct blocks on illegal movements.',
    operations: 'Operational metrics monitor state lifecycles and average duration in each state.',
    mistakes: [
      'Failing to handle postponed matches, leaving fixtures stuck in "Scheduled" state indefinitely.',
      'Letting slips get settled twice, duplicating payouts.'
    ],
    improvements: [
      'Deploy automated state-monitoring alert systems.',
      'Transition key state ledgers to immutable blockchains.'
    ],
    checklist: [
      'Confirm database models enforce strict state constraints.',
      'Verify that state changes generate corresponding audit log records.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline State Machines released.' }],
    references: ['database-architecture', 'bankroll-engine', 'logging'],
    diagrams: `
### ⚽ Match Fixture Lifecycle State Machine
__BTT__mermaid
stateDiagram-v2
    [*] --> Scheduled: Fixture Discovered
    Scheduled --> InPlay: Kick-off Time Reached
    Scheduled --> Postponed: Postponement Event
    Postponed --> Scheduled: Rescheduled Time Set
    Postponed --> Cancelled: Match Abandoned
    InPlay --> Suspended: Weather / Incident Outage
    Suspended --> InPlay: Play Resumed
    Suspended --> Postponed: Match Abandoned midway
    InPlay --> Completed: Regular/Extra Time Finished
    Completed --> [*]: Results Settled & Log Archived
    Cancelled --> [*]: Refunds Settled & Slip Invalidated
__BTT__

### 🎟️ User Trading Slip Lifecycle State Machine
__BTT__mermaid
stateDiagram-v2
    [*] --> Pending: Slip Logged by Sizer
    Pending --> Placed: Confirmed placed on Bookmaker
    Pending --> Expired: Odds shifted / Time elapsed
    Placed --> Postponed: Match Postponed
    Placed --> Settled_Win: Match Completed - Outcome Win
    Placed --> Settled_Loss: Match Completed - Outcome Loss
    Placed --> Settled_Refund: Match Cancelled / Refund Event
    Postponed --> Placed: Match Rescheduled
    Postponed --> Settled_Refund: Match Cancelled
    Settled_Win --> [*]: Profits Added to Bankroll Balance
    Settled_Loss --> [*]: Capital Deducted & Ledger Settled
    Settled_Refund --> [*]: Capital Restored & Ledger Settled
    Expired --> [*]: Slip Closed
__BTT__
`
  },
  {
    filename: 'component-diagrams.md',
    title: 'Platform Component Diagrams',
    purpose: 'Exposes detailed component structures, module bounds, and dependency links within services.',
    scope: 'Universal standard for architectural component layouts.',
    responsibilities: [
      'Detail key architectural layers (Database, Worker, API, frontend) down to individual code modules.',
      'Expose internal component dependency maps, preventing clean boundary bypasses.',
      'Serve as the onboarding blueprint for engineers modifying core platform systems.'
    ],
    principles: [
      'Component Isolation: Keep components modular, self-contained, and communicating via strict API interfaces.',
      'Single Responsibility: Each component must own a single cohesive set of business logic.'
    ],
    decisions: [
      'Model architectural layouts inside Mermaid C4 component charts.',
      'Enforce directory separations aligning directly with visual component maps.'
    ],
    bestPractices: [
      'Encapsulate database access logic inside dedicated repository layers.',
      'Organize components hierarchically by bounded contexts.'
    ],
    antiPatterns: [
      'Creating dense, monolithic services mixing data access, business, and visual rendering.',
      'Allowing presentation helpers to import backend model schemas.'
    ],
    security: 'Validates that sensitive processing components are isolated behind internal secure networks.',
    performance: 'Decoupled components limit computational overhead and transaction locks.',
    scalability: 'Facilitates transition of decoupled components to independent cloud services.',
    testing: 'Supports localized module mocking, enabling faster test executions.',
    operations: 'Helps SREs trace performance bottlenecks to specific codebase folders.',
    mistakes: [
      'Mixing bookmaker-specific parsing details inside the general odds normalization classes.',
      'Creating circular imports across adjacent components.'
    ],
    improvements: [
      'Deploy automated code parsing tools to generate live component maps directly from code.',
      'Support dynamic configuration loads across isolated containers.'
    ],
    checklist: [
      'Confirm that the component diagram matches the active folder structure.',
      'Verify that components communicate with databases exclusively via repository layers.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Component Diagrams released.' }],
    references: ['clean-architecture', 'bounded-contexts', 'dependency-graph'],
    diagrams: `
### 🏗️ Backend API Core Components (C4 Component Diagram)
__BTT__mermaid
graph TD
    subgraph FastAPI_Server [FastAPI Application container]
        subgraph Web_Controllers [Web API Controllers]
            AuthCtrl[Auth Controller]
            FixCtrl[Fixture Controller]
            PredCtrl[Prediction Controller]
            SlipCtrl[Trading Slip Controller]
        end

        subgraph Core_Services [Domain Use Cases & Services]
            AuthSvc[Auth Service - Argon2id/JWT]
            ValueSvc[Value Bet Engine Service]
            SizerSvc[Kelly Sizer Service]
            NotifySvc[Alert Broker Service]
        end

        subgraph Data_Repositories [Data Repositories Layer]
            UserRepo[User Repository]
            FixRepo[Fixture Repository]
            OddsRepo[Odds Repository]
            PredRepo[Prediction Repository]
            SlipRepo[Slip Repository]
        end

        Web_Controllers --> Core_Services
        Core_Services --> Data_Repositories
    end

    Data_Repositories --> DB[(PostgreSQL Master Database)]
__BTT__

### 🧠 Machine Learning & Inference Components (C4 Component Diagram)
__BTT__mermaid
graph TD
    subgraph Celery_Worker [Celery background Processing container]
        subgraph Task_Handlers [Celery task Handlers]
            ScrapeTask[Scrape Task]
            TrainTask[Model Retraining Task]
            InferTask[Model Inference Task]
        end

        subgraph ML_Subsystems [ML Prediction & Feature Subsystem]
            StoreClient[Feature Store Client]
            FeatureEng[Feature Engineering Module]
            EnsembleScore[Ensemble Scoring Engine]
            CalibrationMod[Platt Calibration Module]
        end

        subgraph DB_Connectors [Database Repositories & Adapters]
            TimescaleConn[TimescaleDB Timeseries Adapter]
            RegistryConn[MLflow Model Registry Adapter]
        end

        Task_Handlers --> ML_Subsystems
        ML_Subsystems --> DB_Connectors
    end

    DB_Connectors --> DB[(PostgreSQL / TimescaleDB)]
__BTT__
`
  },
  {
    filename: 'deployment-diagrams.md',
    title: 'Platform Deployment Diagrams',
    purpose: 'Exposes production deployment layouts, cloud environments, container networks, and routing paths.',
    scope: 'Universal infrastructure blueprint for DevOps and SRE teams.',
    responsibilities: [
      'Detail physical production cloud configurations and networking paths.',
      'Specify container grouping, load balancing, firewall structures, and DB clusters.',
      'Serve as the master operational handbook for SREs configuring production networks.'
    ],
    principles: [
      'Defense in Depth: Protect systems using multiple layers of firewalls, private subnets, and IAM roles.',
      'High Availability: Deploy container nodes across multiple zones to ensure continuous service runtimes.'
    ],
    decisions: [
      'Use Google Cloud Platform (GCP) as the primary production cloud platform.',
      'Deploy application containers within Google Cloud Run, utilizing GCP load balancers and Cloud SQL.'
    ],
    bestPractices: [
      'Isolate backend database, cache, and worker nodes inside private virtual networks.',
      'Manage all infrastructure configurations using Terraform scripts.'
    ],
    antiPatterns: [
      'Exposing database or Redis connection ports directly to the public internet.',
      'Hardcoding cloud secrets inside static infrastructure definitions.'
    ],
    security: 'All public endpoints require TLS v1.3. Private networks are locked behind Cloud IAM roles.',
    performance: 'GCP load balancers terminate SSL quickly and route traffic via fast, low-latency fibers.',
    scalability: 'Cloud Run dynamically auto-scales container counts from 0 to 100+ to handle sudden traffic peaks.',
    testing: 'Verified in staging sandbox environments prior to production terraform deployments.',
    operations: 'Operational alerts track database storage limits, load balancer errors, and auto-scaling status.',
    mistakes: [
      'Placing background workers in the same auto-scaling container pool as the API gateway, risking slow response times.',
      'Omitting database read replicas, flooding master databases during traffic surges.'
    ],
    improvements: [
      'Deploy multi-region failover load balancers.',
      'Incorporate serverless PostgreSQL configurations to scale storage dynamically.'
    ],
    checklist: [
      'Verify that all database and Redis connection points require secure private networks.',
      'Confirm that the Terraform configuration matches the active production cloud setup.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Deployment Diagrams released.' }],
    references: ['infrastructure', 'deployment', 'disaster-recovery'],
    diagrams: `
### 🌐 GCP Production Deployment Infrastructure (C4 Deployment Diagram)
__BTT__mermaid
graph TD
    subgraph Public_Internet [Public Internet]
        User[Trader Browser / Mobile Client] -->|HTTPS / WSS| CDN[Cloud Load Balancer / Cloud CDN]
    end

    subgraph GCP_VPC [GCP Virtual Private Cloud]
        CDN -->|Route HTTPS / Public Gateways| CloudRun_API[GCP Cloud Run - FastAPI Stateless Containers]

        subgraph Private_Subnet [Private Virtual Network - Decoupled Core]
            CloudRun_API -->|Dispatch Async Tasks| Redis[(Redis - Cache & Message Broker)]
            Redis -->|Celery Workers| CloudRun_Worker[GCP Cloud Run - Background Worker Containers]
            CloudRun_Worker -->|Trigger Inference| MLflow[MLflow Model Registry]
            
            CloudRun_API & CloudRun_Worker -->|DB Connections| PgBouncer[PgBouncer Connection Pooler]
            PgBouncer -->|Relational Queries| SQL_Master[(GCP Cloud SQL PostgreSQL Master)]
            PgBouncer -->|Timeseries Reads| Timescale[(TimescaleDB Timeseries Cluster)]
            
            SQL_Master -->|Replication| SQL_Replica[(GCP Cloud SQL PostgreSQL Replica)]
        end
    end
__BTT__
`
  }
];

docsGroup3.forEach(doc => {
  writeFile(`${folder}/${doc.filename}`, buildDoc(doc.title, doc));
});

console.log('Successfully completed Group 3 (Files 21 to 38)...');

// Define files 39 to 47 (Overwriting legacy placeholder files)
const docsGroup4 = [
  {
    filename: 'ai.md',
    title: 'Artificial Intelligence Strategy & Integration Blueprint',
    purpose: 'Exposes how the platform structures, secures, and interacts with Artificial Intelligence services, specifically utilizing the Gemini SDK server-side.',
    scope: 'Unified reference standard across prediction, summarization, and agent workflows.',
    responsibilities: [
      'Initialize and manage the @google/genai TypeScript client in isolated server contexts.',
      'Provide structured prompts, templates, and temperature bounds for consistent LLM responses.',
      'Abstract external LLM latency through background queues, preventing synchronous blocks.'
    ],
    principles: [
      'Strict Separation: Keep LLM logic entirely server-side; never expose API keys or direct SDKs to client browsers.',
      'Structured Outputs: Require schema validations (e.g. JSON mode or Pydantic models) for all parsed model outputs.',
      'Graceful Degradation: Ensure system functionality holds if an external AI API experiences downtime.'
    ],
    decisions: [
      'Initialize GoogleGenAI client instances on-demand within server route contexts, leveraging process.env.GEMINI_API_KEY.',
      'Isolate all heavy intelligence processing inside Celery tasks to maintain high responsiveness on client interfaces.'
    ],
    bestPractices: [
      'Utilize system instructions to lock models into safe, deterministic roles.',
      'Employ semantic routing layers to dispatch prompts to appropriate target models.'
    ],
    antiPatterns: [
      'Hardcoding API keys in static files or frontend components.',
      'Awaiting live model calls in the middle of standard real-time odds calculation loops.'
    ],
    security: 'API keys are stored inside Cloud Secrets and retrieved at runtime using secure container environments.',
    performance: 'Leverages model caching and prompt optimization to keep round-trip response times <800ms.',
    scalability: 'AI execution nodes are stateless and can scale horizontally to handle complex analysis workloads.',
    testing: 'Tested using sandbox mock responses to verify prompt outputs handle unexpected parsing targets gracefully.',
    operations: 'Traces prompt usage, response latency, token consumption, and rate limits dynamically.',
    mistakes: [
      'Forgetting to validate JSON schemas returned by the model, causing unhandled parsing exceptions.',
      'Flooding models with excessive context, leading to token exhaustion and elevated usage costs.'
    ],
    improvements: [
      'Support dynamic routing across alternative model variants to optimize response speeds and costs.',
      'Deploy localized vector indices to provide contextually rich prompt grounding.'
    ],
    checklist: [
      'Confirm that the Gemini API Key is never printed inside output logs.',
      'Verify that all model integrations define explicit network timeouts.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline AI Integration Blueprint.' }],
    references: ['prediction-engine', 'value-betting-engine', 'security'],
    diagrams: `
__BTT__mermaid
graph LR
    API[FastAPI Router] -->|Enqueue Request| Redis[(Redis Broker)]
    Redis -->|Celery Worker| Worker[AI Background Worker]
    Worker -->|Fetch context| DB[(PostgreSQL)]
    Worker -->|Invoke Server-Side| Gemini[Gemini 2.5 Flash API]
    Gemini -->|JSON Response| Worker
    Worker -->|Validate Schema & Save| DB
    Worker -->|Notify Event| WS[WebSocket Broadcaster]
__BTT__
`
  },
  {
    filename: 'automation_pipeline.md',
    title: 'Continuous Automation Pipeline & Agent Lifecycle',
    purpose: 'Exposes how the platform structures background automation pipelines, scheduling intervals, and autonomous agent loops.',
    scope: 'Universal guide for developers building background scrapers, checkers, and scheduler tasks.',
    responsibilities: [
      'Configure Celery Beat scheduling intervals across all cron-style operations.',
      'Ensure scrapers and settlement checkers run in separate, non-overlapping task pools.',
      'Manage agent workspaces and ensure safe concurrent execution bounds.'
    ],
    principles: [
      'Task Idempotency: All tasks must be safe to rerun; duplicates should cause no data anomalies.',
      'Strict Isolation: Keep task states decoupled; a failing scraping task must never halt the primary API gateway.'
    ],
    decisions: [
      'Deploy Celery Beat to manage unified task scheduling.',
      'Utilize Redis distributed locks to prevent multiple worker nodes from scraping identical bookmaker endpoints concurrently.'
    ],
    bestPractices: [
      'Incorporate retry policies with exponential backoff on all network-intensive tasks.',
      'Log automation loop start and stop states with unique run IDs to track performance.'
    ],
    antiPatterns: [
      'Running heavy analysis loops inside the main API process thread.',
      'Designing background tasks that run infinitely without built-in timeouts.'
    ],
    security: 'Tasks are executed under non-privileged system service accounts, restricting unauthorized system access.',
    performance: 'Redis locks prevent redundant calculations, keeping background CPU loads below 30%.',
    scalability: 'Worker containers scale elastically based on outstanding message backlogs.',
    testing: 'Tested using mock task schedules, verifying correct execution sequences and error recovery loops.',
    operations: 'Operational metrics monitor task duration, queue backlog, lock collision counts, and error rates.',
    mistakes: [
      'Omitting lock timeouts, causing pipelines to halt indefinitely if a worker container crashes during an active scrape.',
      'Using identical queues for high-priority alerts and low-priority historical scraping.'
    ],
    improvements: [
      'Transition key scheduling queues to highly resilient distributed brokers.',
      'Support dynamic task interval configurations through administrative consoles.'
    ],
    checklist: [
      'Verify that all scheduled tasks declare explicit maximum execution timeouts.',
      'Confirm that scraping worker tasks utilize proxy rotation to avoid rate limits.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Automation specification.' }],
    references: ['system-overview', 'module-interactions', 'event-driven'],
    diagrams: `
__BTT__mermaid
graph TD
    Beat[Celery Beat Scheduler] -->|Dispatch Scrape Fixtures Cron| Queue[Celery Message Queue]
    Beat -->|Dispatch Settler Cron| Queue
    Queue -->|Worker Pool 1| ScrapeWorker[Scrape Worker]
    Queue -->|Worker Pool 2| SettleWorker[Settle Worker]
    
    ScrapeWorker -->|HTTP Scrape| Bookmaker[Bookmaker API]
    SettleWorker -->|Database Settle| DB[(TimescaleDB Master)]
__BTT__
`
  },
  {
    filename: 'database.md',
    title: 'Database Systems & Schema Governance',
    purpose: 'Exposes the platform\'s relational and timeseries storage strategy, schema management, and migration rules.',
    scope: 'Universal standard for developers writing schemas, queries, and executing migrations.',
    responsibilities: [
      'Define database table definitions inside Drizzle or SQLAlchemy schemas.',
      'Separate static relational records (users, leagues) from high-frequency timeseries charts (odds, predictions).',
      'Manage version-controlled migration files and ensure safe schema updates.'
    ],
    principles: [
      'Strict Normalization: Relational entities must remain clean, distinct, and indexed to minimize redundant data.',
      'Timeseries Optimization: Store raw market values in append-only partitions, avoiding update locks on active rows.'
    ],
    decisions: [
      'Use PostgreSQL as the relational foundation and TimescaleDB hypertables for all timeseries logs.',
      'Enforce zero-downtime migrations (adding columns with safe defaults, never dropping columns in single releases).'
    ],
    bestPractices: [
      'Index all columns used frequently in JOIN or WHERE statements.',
      'Use connection pooler layers (like PgBouncer) to protect databases from scale-out traffic peaks.'
    ],
    antiPatterns: [
      'Running heavy analytical scans against production master databases during peak trading hours.',
      'Using VARCHAR columns without length limitations for structured data.'
    ],
    security: 'Databases are isolated within private virtual subnets; all active credentials are fully encrypted.',
    performance: 'Keeps queries fast (avg <15ms) through partitions, indexes, and connection pooling.',
    scalability: 'Read-replicas scale reads horizontally, while TimescaleDB hypertables distribute massive time-series volumes.',
    testing: 'Migrations are tested on ephemeral test databases, confirming rollbacks execute without errors.',
    operations: 'Operational metrics monitor connection pool saturation, transaction rates, disk space, and query speeds.',
    mistakes: [
      'Running queries without explicit limit parameters, causing high server memory spikes.',
      'Failing to clean up temporary table variables, bloat database size.'
    ],
    improvements: [
      'Deploy automated query analyzers to highlight slow execution paths.',
      'Support dynamic data compression for records older than 90 days.'
    ],
    checklist: [
      'Confirm all table migrations are reversible.',
      'Verify that TimescaleDB hypertables define appropriate chunk intervals.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Database specification.' }],
    references: ['database-architecture', 'caching-architecture', 'disaster-recovery'],
    customSections: `
### 🗄️ Database Table Separation Scheme

\`\`\`
+------------------------------------+      +------------------------------------+
|     Relational Postgres Core       |      |     TimescaleDB Timeseries Core    |
+------------------------------------+      +------------------------------------+
| * users                            |      | * odds_timeseries (Hypertable)     |
| * fixtures                         | ---> | * predictions_timeseries (Hyper)   |
| * leagues_metadata                 |      | * slips_history (Hypertable)       |
| * user_profiles                    |      |                                    |
+------------------------------------+      +------------------------------------+
\`\`\`
`
  },
  {
    filename: 'folders.md',
    title: 'Code Organization & Directory Standards',
    purpose: 'Exposes directory layouts, module separation standards, and import boundaries required across all platforms.',
    scope: 'Unified reference guide for all engineers adding files or modules.',
    responsibilities: [
      'Enforce clean layer separations (Controller, Service, Repository, Entity).',
      'Verify that frontend components remain purely visual, delegating state and logic to custom hooks.',
      'Manage import rules to prevent circular dependencies.'
    ],
    principles: [
      'Strict Separation: Keep backend, frontend, and script files strictly isolated in their respective folders.',
      'Cohesive Modules: Group related features (e.g. auth controllers, auth services, auth repositories) within logical spaces.'
    ],
    decisions: [
      'Organize backend services following Clean Architecture principles (Core, Application, Infrastructure).',
      'Structure React applications with clear separations of components, context, and hooks.'
    ],
    bestPractices: [
      'Extract reused interfaces and types into a centralized `src/types.ts` file.',
      'Maintain clear documentation inside any folder describing its structural purpose.'
    ],
    antiPatterns: [
      'Mixing custom backend scripts inside visual React folders.',
      'Importing infrastructure components directly from domain logic classes.'
    ],
    security: 'File permissions are configured to restrict executable permissions on static asset directories.',
    performance: 'Clean folders reduce compilation sizes and speed up cold container boot times.',
    scalability: 'Modular boundaries make it simple to extract specific modules into independent microservices.',
    testing: 'Enables focused unit tests corresponding directly to specific directory files.',
    operations: 'Simplifies developer onboarding and file discovery.',
    mistakes: [
      'Creating redundant utility files across directories instead of updating shared libraries.',
      'Using absolute paths pointing outside the workspace boundary.'
    ],
    improvements: [
      'Deploy automated import linter gates to enforce boundary rules.',
      'Transition folder models to monorepos for complex platform ecosystems.'
    ],
    checklist: [
      'Verify that all folders contain a brief README detailing their purpose.',
      'Confirm that backend modules do not import client-side React files.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Folder standards.' }],
    references: ['clean-architecture', 'domain-driven-design', 'dependency-graph']
  },
  {
    filename: 'microservices.md',
    title: 'Microservice Topology & Gateway Boundaries',
    purpose: 'Exposes service boundaries, gateway configurations, and deployment topologies for modular services.',
    scope: 'Universal guide for microservice designers and infrastructure engineers.',
    responsibilities: [
      'Define boundaries separating core API services from background workers and data scrapers.',
      'Configure API Gateway routing rules, handling traffic shifts and authorization checks.',
      'Enforce decoupled messaging patterns to allow independent service lifecycles.'
    ],
    principles: [
      'Domain Decoupling: Services must own their databases; never share schemas across distinct service boundaries.',
      'Asynchronous Communication: Standardize on async event pub-sub to maintain system resilience.'
    ],
    decisions: [
      'Adopt a modular monolith design with clear bounded contexts, easing transition to full microservices when needed.',
      'Route all external user requests through a unified API gateway terminal.'
    ],
    bestPractices: [
      'Implement circuit breakers to prevent failing services from causing system-wide cascades.',
      'Incorporate consistent correlation IDs to enable tracing across microservice boundaries.'
    ],
    antiPatterns: [
      'Creating highly chatty synchronous API chains across microservices.',
      'Sharing relational tables directly across decoupled backend systems.'
    ],
    security: 'Intra-service communication is encrypted and restricted using private virtual networks.',
    performance: 'Reduces connection overheads using HTTP/2 or gRPC for internal service communications.',
    scalability: 'Allows services to scale independently based on their specific workload requirements.',
    testing: 'Tested using isolated mock endpoints to verify service interactions.',
    operations: 'Operational dashboards track inter-service latency, call rates, and circuit status.',
    mistakes: [
      'Failing to handle network timeout exceptions during inter-service API calls.',
      'Creating circular dependency networks where Service A calls Service B, which calls Service A.'
    ],
    improvements: [
      'Transition key services to highly efficient gRPC architectures.',
      'Deploy service mesh managers (like Istio) to automate traffic routing.'
    ],
    checklist: [
      'Verify that all microservice boundaries align directly with domain bounded contexts.',
      'Confirm that failing services do not halt unrelated platform features.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Microservices specification.' }],
    references: ['bounded-contexts', 'module-interactions', 'api-architecture'],
    diagrams: `
__BTT__mermaid
graph TD
    Client[User Client] -->|HTTPS / WSS| GW[API Gateway Ingress]
    GW -->|Route REST| CoreAPI[Core Trading API]
    GW -->|Route WSS| WSGate[WebSocket Gateway]
    
    CoreAPI -->|Publish Events| Redis[(Redis Broker)]
    Redis -->|Process Tasks| Scraper[Scraper Service]
    Redis -->|Process Tasks| MLWorker[ML Inference Worker]
__BTT__
`
  },
  {
    filename: 'ml_pipeline.md',
    title: 'Machine Learning Lifecycles & Pipeline Orchestration',
    purpose: 'Exposes model retraining schedules, features ingestion loops, evaluation benchmarks, and deployment steps.',
    scope: 'Universal standard for ML engineers, analysts, and SREs.',
    responsibilities: [
      'Orchestrate model retraining pipelines on regular (e.g. weekly) schedules.',
      'Verify feature calculations match exact specifications in both training and inference contexts.',
      'Deploy and validate candidate models through strict shadow-execution testing loops.'
    ],
    principles: [
      'Absolute Reproducibility: Every trained model version must link directly to specific dataset snapshots.',
      'Calibration First: Prioritize model calibration (probabilistic accuracy) over raw binary score limits.'
    ],
    decisions: [
      'Track all model versions, configurations, and evaluation metrics inside MLflow.',
      'Utilize XGBoost and LightGBM ensemble models as primary sports predictors.'
    ],
    bestPractices: [
      'Run shadow testing sweeps, comparing candidate models against active predictors prior to promotion.',
      'Incorporate Brier Scores to evaluate model probability calibrations.'
    ],
    antiPatterns: [
      'Promoting ML models directly to production based purely on training accuracy metrics.',
      'Hardcoding feature weights or coefficient bounds inside static application files.'
    ],
    security: 'Training datasets are cleaned, stripping all sensitive user details or personal identifiers.',
    performance: 'Calculates probability scores quickly, completing inference loops in <10ms.',
    scalability: 'Horizontally scales training nodes inside dedicated cloud compute environments.',
    testing: 'Tested via historical backtests across 5+ seasons of league records to evaluate long-term accuracy stability.',
    operations: 'Operational metrics monitor model drift, prediction trends, and API latency.',
    mistakes: [
      'Omitting feature store checks, leading to data drift during active seasons.',
      'Retraining models on corrupted data pools without validating baseline rows.'
    ],
    improvements: [
      'Deploy automated data pipeline orchestrators (like Airflow or Prefect).',
      'Support automated retraining alerts based on predictive drift limits.'
    ],
    checklist: [
      'Confirm all model files are archived inside secure MLflow storage buckets.',
      'Verify that Brier Scores are calculated and logged for all prediction runs.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline ML Pipeline spec.' }],
    references: ['ml-pipeline', 'prediction-engine', 'feature-store']
  },
  {
    filename: 'prediction_pipeline.md',
    title: 'Real-Time Prediction Pipeline & Scoring Engine',
    purpose: 'Exposes how the platform scores fixtures in real-time, executing feature extractions, model evaluation, and calibration.',
    scope: 'Universal specification for active predictive systems and scoring services.',
    responsibilities: [
      'Trigger inference runs automatically when new fixtures or odds updates are received.',
      'Extract dynamic forms and team performance variables from active feature stores.',
      'Format and calibrate raw model predictions into implied probabilities.'
    ],
    principles: [
      'Sub-Second Inference: Implied model probabilities must update instantly to capture active market value.',
      'Calibration Governance: Raw outputs must always pass calibration layers (e.g. Platt Scaling) before use.'
    ],
    decisions: [
      'Execute inference loops asynchronously inside Celery task workers to avoid API delays.',
      'Store predictions directly in Relational Databases alongside feature version tags to support future calibration audits.'
    ],
    bestPractices: [
      'Use pre-compiled or serialized model files (e.g. JSON or ONNX) to speed up load times.',
      'Incorporate fallback values for team form parameters when evaluating new teams with limited history.'
    ],
    antiPatterns: [
      'Evaluating predictions inside core real-time HTTP server threads.',
      'Applying uncalibrated model outputs directly to bankroll sizer engines.'
    ],
    security: 'Inference workers run inside locked secure subnets with zero public ingress paths.',
    performance: 'Completes calculations in <12ms, allowing high throughput processing on live feeds.',
    scalability: 'Inference nodes scale out elastically, handling thousands of concurrent matches.',
    testing: 'Validated using test suites to confirm that identical inputs always return identical probabilities.',
    operations: 'Operational alerts trigger if prediction pipelines fail to run on active scheduled fixtures.',
    mistakes: [
      'Using outdated feature parameters, causing outdated prediction calculations.',
      'Omitting form fallbacks, crashing when encountering newly promoted teams.'
    ],
    improvements: [
      'Deploy localized ONNX runtime containers to maximize scoring speeds.',
      'Support real-time prediction updates on live matches.'
    ],
    checklist: [
      'Verify that all predictions include explicit model and feature version labels.',
      'Confirm that the calibration layer is active on all prediction output paths.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Prediction Pipeline specification.' }],
    references: ['prediction-engine', 'feature-engineering', 'data-ingestion'],
    diagrams: `
__BTT__mermaid
graph TD
    Trigger[Fixture Event] -->|Async Task| Worker[Inference Worker]
    Worker -->|Fetch Features| Store[(Feature Store)]
    Worker -->|Load Model| Reg[(MLflow Model Registry)]
    Worker -->|Score Ensemble| Predictor[Ensemble Scoring Engine]
    Predictor -->|Raw Probability| Calibration[Platt Calibration Layer]
    Calibration -->|Implied Probability| DB[(PostgreSQL Predictions)]
__BTT__
`
  },
  {
    filename: 'security.md',
    title: 'Comprehensive Security & Cryptographic Posture',
    purpose: 'Exposes security controls, CORS limits, credentials protections, encryption-at-rest, and IAM configurations.',
    scope: 'Universal security handbook for all development and operations tasks.',
    responsibilities: [
      'Enforce SSL/TLS encryption across all public network routes.',
      'Implement strict CORS permissions, blocking unauthorized cross-origin requests.',
      'Encrypt sensitive data (user password hashes, API keys) at rest and in transit.'
    ],
    principles: [
      'Secure by Default: Restrict all permissions and endpoints by default; grant access explicitly.',
      'Defense in Depth: Protect systems using multiple layers of firewalls, subnets, and access policies.'
    ],
    decisions: [
      'Implement CORS regulations allowing requests strictly from authorized domains.',
      'Store all third-party API credentials in Cloud KMS (Key Management Service) or Google Secret Manager.'
    ],
    bestPractices: [
      'Perform regular dependency scanning to catch and fix known security vulnerabilities.',
      'Enforce strong MFA and role definitions for all administrative dashboards.'
    ],
    antiPatterns: [
      'Exposing database or cache connection ports to the public internet.',
      'Committing secrets or API keys inside code repositories.'
    ],
    security: 'Aligns with OWASP Top 10 standards to defend against typical web vulnerabilities.',
    performance: 'Minimizes cryptographic overheads using accelerated hardware processors.',
    scalability: 'IAM profiles and network boundaries scale elastically alongside services.',
    testing: 'Tested via automated vulnerability scans inside CI/CD deployment runs.',
    operations: 'Maintains distinct security logs tracing all access modifications, denied calls, and privilege requests.',
    mistakes: [
      'Using weak hash algorithms (like MD5) to store sensitive user data.',
      'Allowing wide wildcard CORS settings (*), risking CSRF vulnerabilities.'
    ],
    improvements: [
      'Integrate automatic threat analysis systems to block malicious IP patterns dynamically.',
      'Support passkey (WebAuthn) passwordless authentication pipelines.'
    ],
    checklist: [
      'Confirm that no secrets are committed inside any active code repositories.',
      'Verify that all endpoints modifying server state are protected by authorization layers.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline Security specification.' }],
    references: ['authentication-architecture', 'authorization-architecture', 'infrastructure']
  },
  {
    filename: 'system.md',
    title: 'Global Systems Topology & Hardware Allocation',
    purpose: 'Exposes hardware specs, container sizing, cloud zones, and physical network topologies.',
    scope: 'Unified system topology reference for operations and SRE teams.',
    responsibilities: [
      'Specify cpu/memory boundaries for all platform container types.',
      'Configure database scaling profiles and read replica allocations.',
      'Define physical network layouts, separating public gateways from private workers.'
    ],
    principles: [
      'Optimal Allocation: Size containers based on real-world memory profiles, avoiding waste while maintaining safety margin.',
      'Decoupled Scaling: Scale independent workflows separately to optimize resource use.'
    ],
    decisions: [
      'Standardize on 1 vCPU and 2GB Memory configurations for API containers, and 2 vCPU and 4GB Memory for ML inference workers.',
      'Utilize Google Cloud SQL for relational databases, allocating high-speed SSD storage.'
    ],
    bestPractices: [
      'Maintain at least 30% safety margins when sizing active memory configurations.',
      'Configure automatic scale-out alerts to detect container resource exhaustion early.'
    ],
    antiPatterns: [
      'Deploying resource-heavy ML workers inside identical small container pools as light API routers.',
      'Omitting container memory caps, risking Out-Of-Memory (OOM) crashes.'
    ],
    security: 'All containers are run in private networks, restricting direct public internet ingress.',
    performance: 'Sizing rules prevent container throttles, keeping response times consistent under load surges.',
    scalability: 'Enables smooth, independent scaling of individual platform nodes.',
    testing: 'Sizing bounds are validated via regular synthetic load testing runs.',
    operations: 'Traces CPU usage, memory foot-print, network loads, and storage metrics across nodes.',
    mistakes: [
      'Setting database connection limits too low, blocking active worker nodes.',
      'Failing to monitor container throttles, leading to slow response times.'
    ],
    improvements: [
      'Transition key services to serverless container networks.',
      'Support automatic resource sizing based on ML-driven load predictors.'
    ],
    checklist: [
      'Verify that all containers specify explicit CPU and memory caps.',
      'Confirm database memory limits are sized correctly based on active dataset footprints.'
    ],
    history: [{ version: 'v1.0.0', date: '2026-06-29', changes: 'Initial baseline System specification.' }],
    references: ['system-overview', 'infrastructure', 'scalability'],
    diagrams: `
__BTT__mermaid
graph TD
    In[Cloud Load Balancer] -->|Route API HTTP| API[GCP Cloud Run API Container: 1 vCPU, 2GB RAM]
    API -->|Async Job| Redis[(Redis Caching Node)]
    Redis -->|Execute Task| Worker[GCP Cloud Run Worker Container: 2 vCPU, 4GB RAM]
    
    API & Worker -->|Relational Queries| DB[(GCP Cloud SQL PostgreSQL: 2 vCPU, 8GB RAM)]
__BTT__
`
  }
];

docsGroup4.forEach(doc => {
  writeFile(`${folder}/${doc.filename}`, buildDoc(doc.title, doc));
});

console.log('Successfully completed Group 4 (Files 39 to 47 - Legacy Placeholders Overwritten)...');



