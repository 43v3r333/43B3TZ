export interface WorkspaceFile {
  name: string;
  path: string;
  category: string;
  description: string;
  content: string;
}

export interface WorkspaceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
  files: WorkspaceFile[];
}

export const workspaceCategories: WorkspaceCategory[] = [
  {
    id: "core",
    name: "Core Documents",
    icon: "FileText",
    count: 10,
    description: "Essential repository onboarding and metadata standards.",
    files: [
      {
        name: "START_HERE.md",
        path: "/START_HERE.md",
        category: "Core",
        description: "Primary onboarding document and immediate directions for AI/human developers.",
        content: `# 🚀 AI Betting Intelligence Platform - Onboarding & Execution

Welcome to the **AI Betting Intelligence Platform** developer workspace. This repository represents a fully structured, AI-native, enterprise-grade ecosystem. 

All collaborating AIs (Gemini, Claude, GPT, Cursor, Roo Code, etc.) and human developers MUST read this document first.

## 📌 Repository Core Directory
This repository maintains permanent memory, architectural decisions, and operational context to avoid losing state between turns or sessions.

* \`.ai/\`: Absolute source of truth for the platform.
  * \`context/\`: Current sprints, tech-stack details, and domain logic.
  * \`memory/\`: Completed tasks, historical logs, and lessons learned.
  * \`rules/\`: Strict coding, database, API, and architectural boundaries.
  * \`skills/\`: Deep domain and technological guides for models.
  * \`prompts/\`: Templated prompts to drive deterministic agent behavior.
  * \`templates/\`: Markdown formats for PRs, issues, ADRs, and epic definitions.
  * \`checklists/\`: Quality-control guidelines before key phases.
  * \`architecture/\`: Diagrams and functional breakdowns of the micro-modules.
  * \`workflows/\`: Step-by-step guides for bug-fixes, releases, and feature branches.
  * \`agents/\`: Distinct profile constraints for specific role operations.

## ⚽ Platform Core Scope
1. **Sports Predictions**: Multi-model ensemble (XGBoost, LightGBM, CatBoost) to simulate matches.
2. **Value Betting Finder**: High-speed real-time odds comparison vs. fair probabilities.
3. **South Africa Bookmaker Adaptors**: Integration schemas for local platforms (Betway, Hollywoodbets) ensuring strict terms-of-service compliance (scraping and processing purely public feed data, zero account-automation).
4. **Bankroll Management**: Implements Kelly Criterion and secure risk-mitigation strategies.

## 🧭 Immediate Navigation
1. Check the **Current Sprint** inside \`.ai/context/current-sprint.md\`
2. Read the **System Architecture** inside \`.ai/architecture/system.md\`
3. Follow the **Feature Development Workflow** inside \`.ai/workflows/feature.md\``
      },
      {
        name: "README.md",
        path: "/README.md",
        category: "Core",
        description: "Standard project overview, tech stack details, and getting started instructions.",
        content: `# ⚽ AI Betting Intelligence Platform

Enterprise-grade AI-powered sports prediction and analytics platform, specializing in football (soccer) value betting, match simulations, and bankroll optimization.

## 🛠️ Technology Stack
* **Backend**: Python (FastAPI, SQLAlchemy, Alembic, Celery, Redis)
* **AI/ML**: Scikit-Learn, XGBoost, LightGBM, CatBoost, Optuna
* **Database**: PostgreSQL (TimescaleDB extension compatible)
* **Frontend**: React (TypeScript, Vite, Tailwind CSS, Plotly.js / Recharts)
* **DevOps**: Docker, Docker Compose, GitHub Actions, Prometheus, Grafana

## 📂 Repository Structure
* \`backend/\`: FastAPI application, tasks, and machine learning scoring services.
* \`frontend/\`: React dashboard and interactive visualizer.
* \`ai/\`: ML training pipelines, data preprocessing, and model checkpoints.
* \`tests/\`: Pytest suite (unit, integration) and frontend Playwright tests.
* \`.ai/\`: Complete developer context, memory logs, rules, and prompt engineering specifications.`
      },
      {
        name: "ARCHITECTURE.md",
        path: "/ARCHITECTURE.md",
        category: "Core",
        description: "High-level overview of system microservices, database, and pipeline structures.",
        content: `# 🏛️ High-Level System Architecture

The AI Betting Intelligence Platform uses a modular, event-driven architecture designed for extreme performance, scale, and clear separation of concerns.

## 💎 Architectural Principles
1. **Separation of Concerns**: Scrapers, prediction engines, portfolio trackers, and serving APIs are completely decoupled.
2. **Data Integrity**: Odds are stored historically to evaluate bookmaker pricing efficiency.
3. **Stateless Compute**: FastAPI endpoints and machine learning scoring pipelines remain completely stateless.`
      },
      {
        name: "ROADMAP.md",
        path: "/ROADMAP.md",
        category: "Core",
        description: "Phased rollout plan for sports engines, advanced ML models, and real-time live odds tracking.",
        content: `# 🗺️ Platform Roadmap

The roadmap defines the systematic growth of the AI Betting Intelligence Platform.

## ⚽ Phase 1: Football Engine & Core Analytics (Current)
* [x] Design and initialize enterprise repository structure and AI developer environment.
* [ ] Integrate public football feeds (historical match outcomes, player statistics).
* [ ] Develop XGBoost / LightGBM classification models for Home-Draw-Away (HDA) probabilities.
* [ ] Implement Value Betting Finder using real-time Betway/Hollywoodbets odds parsing.
* [ ] Establish Kelly Criterion bankroll calculations with fractional adjustments.

## 🏉 Phase 2: Multi-Sport & Real-Time Expansion
* [ ] Integrate Rugby and Cricket prediction models.
* [ ] Implement real-time Live-In-Play odds trackers and event listeners.
* [ ] Build interactive WebSockets for real-time portfolio updates.`
      },
      {
        name: "PROJECT_STATUS.md",
        path: "/PROJECT_STATUS.md",
        category: "Core",
        description: "Current sprint tracking, completed infrastructure, and immediate next objectives.",
        content: `# 📊 Project Status

**Current Status**: Scaffolding & Core Architecture Setup (100% Complete)

## 🎯 Completed Work
- [x] Initialized development environment with all required directory structures.
- [x] Created \`.ai/\` context, rules, memory, prompts, and onboarding files.
- [x] Created pre-commit configuration, pyproject.toml, Dockerfiles, and CI/CD GitHub workflows.
- [x] Verified and compiled the interactive explorer UI.

## 🗓️ Up Next
- **Data Pipeline Setup**: Deploy historical football database schema inside SQLAlchemy.
- **Model Training Prototype**: Write scripts to train baseline LightGBM classifier on historical league results.`
      },
      {
        name: "SECURITY.md",
        path: "/SECURITY.md",
        category: "Core",
        description: "API keys protection rules and South African regulatory/ToS compliance guides.",
        content: `# 🛡️ Security & Terms Policy

We prioritize absolute compliance with regional legal boundaries and target bookmaker policies.

## 🔒 Security Practices
1. **API Key Security**: Sensitive parameters (database credentials, bookmaker API keys, and model keys) must never be checked into git. Use environmental variables.
2. **Access Control**: Production endpoints require secure OAuth2 JWT tokens with role-based scopes.

## ⚖️ South Africa Bookmaker Compliance
Our platform acts **exclusively** as a data analytics, prediction, and bankroll tracking interface.
* **No Direct Automation**: The platform does not place automated bets on Betway, Hollywoodbets, or other platforms.
* **Usage Policy**: Users must manually read identified value bets and place them directly via official bookmaker interfaces.`
      }
    ]
  },
  {
    id: "context",
    name: "AI Context",
    icon: "FolderGit",
    count: 26,
    description: "Deep project context files representing business rules, API schemas, domain logic, and ML systems.",
    files: [
      {
        name: "project.md",
        path: "/.ai/context/project.md",
        category: "Context",
        description: "Comprehensive platform purpose overview.",
        content: `# Project Context: Overview

Develop an enterprise-grade AI analytics dashboard capable of:
* Simulating football (soccer) match probabilities
* Scraping public odds from regional South African bookmakers (Betway, Hollywoodbets, etc.)
* Performing Kelly-optimized portfolio bankroll sizing
* Providing robust user-portfolio and predictive tracking indices.`
      },
      {
        name: "value-betting.md",
        path: "/.ai/context/value-betting.md",
        category: "Context",
        description: "The mathematical criteria driving the platform's core pricing discrepancy engines.",
        content: `# Value Betting Business Logic

A "Value Bet" is identified when the decimal odds offered by a bookmaker are mathematically higher than the inverse of our AI model's estimated true probability:

$$\\text{Value Edge} = (\\text{Bookmaker Odds} \\times \\text{Model Probability}) - 1.0 > 0.0$$

### Example:
- **Match**: Kaizer Chiefs vs. Orlando Pirates
- **Market**: Orlando Pirates to Win (Away)
- **Bookmaker Odds (Betway SA)**: 2.20
- **AI Model Probability**: 52.0% ($0.52$)
- **Value Edge**: $(2.20 \\times 0.52) - 1.0 = 1.144 - 1.0 = +14.4\\%$ (Strong Value Edge!)`
      },
      {
        name: "bankroll.md",
        path: "/.ai/context/bankroll.md",
        category: "Context",
        description: "Risk allocation algorithms using the Fractional Kelly Criterion.",
        content: `# Bankroll Management: Kelly Criterion Formula

To manage risk, the platform implements a strict Fractional Kelly sizing engine to prevent exponential drawdowns while compounding edge.

### Full Kelly Formula:
$$f^* = \\frac{b \\cdot p - q}{b} = p - \\frac{q}{b}$$

Where:
- $f^*$: The optimal fraction of the bankroll to allocate.
- $b$: The decimal odds minus 1.0 (net odds).
- $p$: True probability of winning (AI Model output).
- $q$: Probability of losing ($1.0 - p$).

### Risk Mitigation Constraints:
- **Fractional Kelly Coeff**: $0.1$ to $0.25$ (User Configurable)
- **Max Single Allocation**: $5.0\\%$ of total portfolio bankroll.
- **Simultaneous Slips Sizing**: Adjusts fractions using covariance analysis for overlapping matches.`
      },
      {
        name: "business-rules.md",
        path: "/.ai/context/business-rules.md",
        category: "Context",
        description: "South African compliance policies and betting rules.",
        content: `# Compliance and Regional Business Rules

### South African Market Compliance
- **Regulatory Framework**: Compliance with FICA (Financial Intelligence Centre Act) and local Provincial Licensing Boards is documented.
- **Terms of Service Integrity**: Automated placing of bets is strictly forbidden in our software layers. Scrapers process public web feeds using standard cache timeouts (e.g. 15 minutes) to ensure zero denial-of-service pressure on bookmaker servers.
- **Tax Calculations**: Incorporates SA's 15% VAT on stakes and regional horse-racing/sports-betting tax withholding models.`
      },
      {
        name: "tech-stack.md",
        path: "/.ai/context/tech-stack.md",
        category: "Context",
        description: "Full details of Python models, PostgreSQL database, and React widgets.",
        content: `# Technology Stack Specifications

- **Backend Platform**: Python 3.11 with FastAPI (async gateways), Celery for asynchronous scraping tasks, Redis for message queuing and ephemeral caching.
- **Data Persistence**: PostgreSQL with TimescaleDB extension for historical odds time-series tracking.
- **Machine Learning**: Scikit-Learn for preprocessing, XGBoost, LightGBM, and CatBoost ensemble models. Optuna for automated hyperparameter tuning.
- **Frontend Dashboard**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide-react icons, and interactive chart visualizations.`
      }
    ]
  },
  {
    id: "rules",
    name: "AI Rules",
    icon: "ShieldAlert",
    count: 19,
    description: "Strict development constraints, coding standards, naming conventions, and API rules.",
    files: [
      {
        name: "coding-rules.md",
        path: "/.ai/rules/coding-rules.md",
        category: "Rules",
        description: "Strict directives on styling, documentation, exceptions, and typing.",
        content: `# Strict Coding Rules

### 1. TypeScript & React
- Use **functional components** with explicit return types.
- Ensure all states are typed; do not use \`any\`.
- All icon imports MUST come from \`lucide-react\`.
- Use tailwind utility classes exclusively. No custom inline \`style\` attributes.

### 2. Python & FastAPI
- Use strict type annotations throughout the codebase.
- Enforce \`ruff\` linting, \`black\` formatting, and \`mypy\` strict type evaluation.
- All public endpoints must declare Pydantic request and response schemas.
- Incorporate structured JSON logging on every controller path.`
      },
      {
        name: "architecture-rules.md",
        path: "/.ai/rules/architecture-rules.md",
        category: "Rules",
        description: "SOLID design patterns and dependency injection standards.",
        content: `# Architecture and Design Pattern Rules

- **Clean Architecture**: Follow strict separation between domain, application services, and infrastructure adapters.
- **Repository Pattern**: Any SQL query must proceed through an explicit Repository interface. Hand-written inline raw SQL in routing layers is forbidden.
- **Dependency Injection**: Use explicit dependency injection containers (FastAPI Depends, React Context) to ensure mocks can easily replace real objects during integration tests.`
      },
      {
        name: "database-rules.md",
        path: "/.ai/rules/database-rules.md",
        category: "Rules",
        description: "Alembic migrations and indexing constraints.",
        content: `# Database Schema Rules

- **Migration Safety**: Any database schema adjustment requires an explicit, backward-compatible Alembic migration.
- **Indexing Rules**: Core query vectors (e.g. \`match_id\`, \`bookmaker_id\`, \`timestamp\`) must contain high-performance indices.
- **Soft Deletions**: Do not execute destructive deletes on transactions, matches, or user portfolios. Use \`is_deleted\` soft states.`
      }
    ]
  },
  {
    id: "skills",
    name: "AI Skills",
    icon: "Sparkles",
    count: 42,
    description: "Expert reference guidelines on machine learning, sports analytics, scrapers, and database engines.",
    files: [
      {
        name: "machine-learning.md",
        path: "/.ai/skills/machine-learning.md",
        category: "Skills",
        description: "Model selection criteria, training paradigms, and validation metrics.",
        content: `# AI Skill: Machine Learning & Ensemble Modeling

### Model Architectures
- **Home/Draw/Away Classification**: LightGBM is the primary classification model due to its high speed and efficient memory handling on categorical team vectors.
- **Value Probability Estimation**: Predicts absolute match outcomes ($P(\\text{Home}), P(\\text{Draw}), P(\\text{Away})$) calibrated using Platt Scaling or Isotonic Regression to ensure probability matching is statistically sound.

### Validation Strategies
- **Time-Series Split**: Time-series cross-validation (Purged Group Time-Series Split) is utilized to avoid lookahead leaks. Never train on future matches to predict past results.`
      },
      {
        name: "value-betting.md",
        path: "/.ai/skills/value-betting.md",
        category: "Skills",
        description: "Advanced mathematical modeling of bookmaker overrounds and fair odds.",
        content: `# AI Skill: Value Betting Core Math

### Overround Elimination
Bookmakers price odds with a built-in margin (overround):
$$\\sum P_{\\text{implied}} > 1.0$$

Before checking for value, models MUST remove the bookmaker's overround using methods such as:
1. **Multiplicative Margin Model**
2. **Additive Margin Model**
3. **Logarithmic Odds Calibration**

This yields the **Fair Odds** proxy representing the true implied bookmaker expectation, against which our model evaluates its own superior predictive probability.`
      },
      {
        name: "sports-prediction.md",
        path: "/.ai/skills/sports-prediction.md",
        category: "Skills",
        description: "Feature engineering schemas, rolling Expected Goals (xG), and player form statistics.",
        content: `# AI Skill: Football Sports Prediction & Feature Engineering

### Core Predictor Features:
1. **Rolling Form Dynamics**: Weighted moving averages of goals, shots on target (SoT), possession, and passing accuracy over $k \\in [3, 5, 10]$ previous matches.
2. **Expected Goals (xG)**: Ingests historical xG indices to isolate variance and capture team performance beyond literal scorelines.
3. **Travel Fatigue Indicators**: Distance traveled (km) and rest intervals (days) between matches.
4. **Market Inefficiency Index**: Odds dispersion among premium international bookmakers vs. South African counterparts.`
      }
    ]
  },
  {
    id: "workflows",
    name: "Workflows",
    icon: "GitBranch",
    count: 13,
    description: "Operational step-by-step guides for feature development, bug fixes, releases, and database migrations.",
    files: [
      {
        name: "feature.md",
        path: "/.ai/workflows/feature.md",
        category: "Workflows",
        description: "Step-by-step guideline from issue assignment to main branch merge.",
        content: `# Workflow: New Feature Development

To maintain safe, continuous deployments, follow these precise operational steps:

\`\`\`mermaid
graph TD
    A[Assign Issue & Create Branch] --> B[Write Unit Tests First]
    B --> C[Implement Feature Code]
    C --> D[Run Local Linter & Tests]
    D --> E[Submit Pull Request]
    E --> F[Automated GitHub Actions Verification]
    F --> G[Peer/AI Code Review]
    G --> H[Merge into develop Branch]
\`\`\`

### Execution Rules:
1. Branch namespace MUST be: \`feature/issue-number-short-description\`.
2. Do not write feature code without accompanying tests.
3. PR merges require at least 1 senior human/AI sign-off and passing CI workflows.`
      },
      {
        name: "bugfix.md",
        path: "/.ai/workflows/bugfix.md",
        category: "Workflows",
        description: "Standard operating procedure for hotfixes and bug reproduction.",
        content: `# Workflow: Bug Resolution Protocol

### Step 1: Reproduction
- Write a failing integration or unit test reproducing the bug using exact logged parameters.

### Step 2: Resolve
- Apply the correction inside the isolated adapter or logic gate. Do not add unrelated code.

### Step 3: Document Root Cause
- Document the cause, fix, and preventative design modifications inside \`.ai/memory/lessons.md\`.`
      }
    ]
  },
  {
    id: "checklists",
    name: "Checklists",
    icon: "ClipboardCheck",
    count: 11,
    description: "Quality assurance lists for security reviews, model deployments, database updates, and releases.",
    files: [
      {
        name: "release.md",
        path: "/.ai/checklists/release.md",
        category: "Checklists",
        description: "Mandatory checklist items before deploying production versions.",
        content: `# Release Deployment Checklist

- [ ] All unit, integration, and Playwright tests are passing with >90% coverage.
- [ ] Database migration scripts are successfully verified on a staging clone.
- [ ] Environment variables (.env.example) are updated with any new required parameters.
- [ ] All AI memory documents (Completed tasks, Changelog) are updated.
- [ ] Security scan (pip-audit, Bandit) returns 0 critical vulnerabilities.
- [ ] CORS policies are checked and bound to production domains only.`
      },
      {
        name: "ai_model.md",
        path: "/.ai/checklists/ai_model.md",
        category: "Checklists",
        description: "Performance criteria for promoting ML models to staging or production scoring.",
        content: `# AI Model Production Promotion Checklist

- [ ] Platt Scaling calibration curve is smooth and holds an $R^2 > 0.92$.
- [ ] Backtesting simulator results demonstrate positive ROI ($>3.5\\%$) over 5,000 historical match events.
- [ ] Feature importance ranking is reviewed; ensures zero target leakage.
- [ ] Model file sizes are optimized; load times are under 1.5 seconds.
- [ ] Out-of-sample log loss metrics outperform baseline odds probabilities.`
      }
    ]
  },
  {
    id: "agents",
    name: "AI Agents",
    icon: "UserCheck",
    count: 12,
    description: "Definition of responsibilities, scope, constraints, and inputs/outputs for specialized AI roles.",
    files: [
      {
        name: "architect.md",
        path: "/.ai/agents/architect.md",
        category: "Agents",
        description: "Guidelines and performance limits for the Principal AI System Architect.",
        content: `# AI Agent Profile: Principal Architect

### Responsibilities
- Preserves design boundaries, ensures SOLID adherence, and designs microservice interactions.
- Writes and coordinates Architectural Decision Records (ADRs).

### Constraints
- Strictly forbidden from selecting mock or fictitious libraries.
- Enforces time-tested patterns (Repository, CQRS, dependency injection).

### Required Memory Log Updates
- Updates \`ARCHITECTURE.md\`, \`.ai/context/architecture.md\`, and registers ADR logs.`
      },
      {
        name: "ml_engineer.md",
        path: "/.ai/agents/ml_engineer.md",
        category: "Agents",
        description: "Guidelines for the AI Machine Learning and Analytics Engineer.",
        content: `# AI Agent Profile: Machine Learning Engineer

### Responsibilities
- Designs preprocessing pipelines, custom feature stores, and handles training loops.
- Optimizes calibration (Platt Scaling) and backtests valuation metrics.

### Constraints
- Never trains classifiers on future match dates (no lookahead leaks).
- Restricts custom models to stable, production-tested architectures (LightGBM, XGBoost).`
      }
    ]
  },
  {
    id: "configs",
    name: "Repository Configs",
    icon: "Settings",
    count: 8,
    description: "Operational system settings, container parameters, and build recipes.",
    files: [
      {
        name: "pyproject.toml",
        path: "/pyproject.toml",
        category: "Configs",
        description: "Python project setup, dependency declarations, and tool definitions.",
        content: `[tool.poetry]
name = "ai-betting-intelligence-platform"
version = "0.1.0"
description = "Enterprise sports prediction and bankroll analytics platform"
authors = ["AI Dev Team <dev@bettingintel.com>"]

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

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
black = "^23.7.0"
ruff = "^0.0.285"
mypy = "^1.4.1"`
      },
      {
        name: "docker-compose.yml",
        path: "/docker-compose.yml",
        category: "Configs",
        description: "Services configuration for PostgreSQL, Redis, and API containers.",
        content: `version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: betting_intel_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_secure_password
      POSTGRES_DB: betting_intel
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: betting_intel_redis
    ports:
      - "6379:6379"

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: betting_intel_api
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres_secure_password@db:5432/betting_intel
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  pgdata:`
      },
      {
        name: "Makefile",
        path: "/Makefile",
        category: "Configs",
        description: "Common build tasks, linters, tests, and deployment commands.",
        content: `.PHONY: help install lint format test build up down db-migrate

help:
	@echo "AI Betting Intelligence Platform Command Interface"
	@echo "--------------------------------------------------"
	@echo "install      - Install Python requirements"
	@echo "lint         - Run linting checks"
	@echo "format       - Apply code formatting"
	@echo "test         - Execute pytests"
	@echo "build        - Build Docker containers"
	@echo "up           - Launch system locally via docker"
	@echo "down         - Spin down docker local stack"

install:
	poetry install

lint:
	ruff check .
	mypy .

format:
	black .
	ruff check --fix .

test:
	pytest tests/`
      }
    ]
  }
];
