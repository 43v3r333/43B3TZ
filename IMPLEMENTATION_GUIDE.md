# Enterprise Development & Implementation Guide

Welcome to the development guide for the high-speed sports value-betting exchange platform. This guide outlines onboarding checklists, reading paths, coding standards, definition of ready/done, testing policies, and release guidelines.

---

## 1. Quick Repository Startup Checklist

Follow these steps to spin up your local developer workstation environment:

1. **Verify Prerequisites**: Ensure you have Docker 24+, Node.js 18+, and Python 3.11+ installed on your system.
2. **Clone and Configure**: Copy `.env.example` into a local `.env` file:
   ```bash
   cp .env.example .env
   ```
3. **Spin Up Infrastructure**: Launch the local relational databases, caching node, and Celery queue clusters:
   ```bash
   docker-compose up -d
   ```
4. **Bootstrap Backend**: Initialize a virtual environment, install dependencies, and run database migrations:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   alembic upgrade head
   ```
5. **Bootstrap Frontend**: Install npm modules and start the Vite development server on port 3000:
   ```bash
   npm install
   npm run dev
   ```

---

## 2. Onboarding Reading Path

We recommend reading documentation in the following sequence to build a complete conceptual understanding before committing changes:

```
1. START_HERE.md (Overview)
       │
       ▼
2. / .ai/architecture/system-overview.md (Subsystem boundaries & flows)
       │
       ▼
3. / .ai/context/business-rules.md (Kelly wagering, probability limits, and sizing)
       │
       ▼
4. / .ai/contracts/ (API & Database boundaries)
```

---

## 3. Developer Standards & Agile Workflow

### 3.1 Definition of Ready (DoR)
A backlog ticket is considered "Ready" for developers to implement only if:
- [ ] **Functional scope is bounded**: No ambiguous goals; requirements specify exact input-output formats.
- [ ] **Contract matches**: Underlying API, event, or database table adjustments have an active contract.
- [ ] **Acceptance criteria are explicit**: Pass criteria defined with concrete testing outcomes.

### 3.2 Definition of Done (DoD)
A feature branch is ready to be merged into primary lines only if:
- [ ] **Code compiles cleanly**: Zero compilation errors or warning parameters in production build logs.
- [ ] **Linter check succeeds**: Strictly passes TypeScript and Python flake8/black formatting.
- [ ] **Tests run successfully**: Minimum unit test coverage of `80%` and key client flows checked via Playwright.
- [ ] **Secrets scanned**: Confirmed zero environment files, secrets, or credential tokens are committed.
- [ ] **Docs updated**: Outlining code changes in appropriate `.ai/context/` or `.ai/memory/` files.

---

## 4. Coding & AI Workflow Rules

1. **Clean Architecture Isolation**: Keep core application services separated from framework implementations. Controllers must never execute direct raw database queries.
2. **Double-Read Strategy**: When instructing AI coding agents, enforce double-reading of target code files before performing any code replacements. This prevents context drift and code cutoffs.
3. **No Mock Implementations**: Real database connections, real authentication validations, and actual external scraper calls must be written. Mock stubs are permitted strictly inside test files.

---

## 5. Deployment & Release Pipeline Gates

We enforce strict automated gates in our CI/CD pipelines:

```
Branch Push ──► Lint & Security Scan ──► Unit Tests (80%) ──► Shadow Deployment ──► Traffic Promotion (Blue-Green)
```

1. **Lint and Code Quality**: Validates syntax, types, and formatting guidelines.
2. **Security Vulnerability Checks**: Runs dependency scanners (e.g. Snyk or pip-audit) to verify zero critical alerts.
3. **Unit & Integration Tests**: All unit assertions must pass; database mocks must verify model queries.
4. **Shadow Run (Pre-Release)**: Promoted models or services run parallel to active instances, logging inputs and outputs without serving live user responses.
5. **Gradual Traffic Allocation**: Cloud Run shifts traffic from Blue to Green clusters in 10% steps, monitoring error rates to execute automatic rollbacks if errors exceed 0.5%.
