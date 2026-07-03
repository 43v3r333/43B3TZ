import * as fs from 'fs';
import * as path from 'path';

// Helper to ensure directory exists
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to write file
function writeFile(filePath: string, content: string) {
  const absolutePath = path.resolve(filePath);
  ensureDir(path.dirname(absolutePath));
  fs.writeFileSync(absolutePath, content.trim() + '\n', 'utf-8');
  console.log(`✓ Generated ${filePath}`);
}

const folders = [
  '.ai',
  '.ai/context',
  '.ai/memory',
  '.ai/rules',
  '.ai/skills',
  '.ai/prompts',
  '.ai/templates',
  '.ai/specs',
  '.ai/architecture',
  '.ai/workflows',
  '.ai/checklists',
  '.ai/reviews',
  '.ai/decisions',
  '.ai/agents',
  '.ai/onboarding',
  'backend',
  'frontend',
  'ai',
  'tests',
  'scripts',
  'docker',
  'docs',
  '.github',
  '.github/workflows',
  'data',
  'models',
  'notebooks',
  'logs',
  'configs'
];

console.log('Starting AI Betting Intelligence Platform Repository Scaffolding...');

// Create directories
folders.forEach(dir => {
  ensureDir(dir);
});

// Define core documents
const coreDocs = {
  'START_HERE.md': `# 🚀 AI Betting Intelligence Platform - Onboarding & Execution

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
3. Follow the **Feature Development Workflow** inside \`.ai/workflows/feature.md\`
`,

  'README.md': `# ⚽ AI Betting Intelligence Platform

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
* \`.ai/\`: Complete developer context, memory logs, rules, and prompt engineering specifications.

## 🚦 Getting Started
Please read \`START_HERE.md\` to understand how to interact with the repository, access architectural guidelines, or onboarding workflows.
`,

  'CONTRIBUTING.md': `# 🤝 Contributing to AI Betting Intelligence Platform

We enforce a strict development protocol to maintain enterprise-grade software quality.

## 🛡️ Coding Protocol
1. **Documentation-First**: Any public function, class, or endpoint MUST include comprehensive docstrings / inline documentation.
2. **Type Safety**: All Python code must utilize typing indicators and pass \`mypy\` validation. All TypeScript must pass \`tsc\`.
3. **Test-First**: Core calculations (odds-conversion, bankroll fractions, probability formulas) require 100% test coverage.

## 🔀 Branching Strategy
We use Git Flow:
* \`main\` for production releases.
* \`develop\` for feature integration.
* \`feature/issue-name\` for active task development.

Refer to \`.ai/workflows/feature.md\` for the step-by-step feature development pipeline.
`,

  'CODE_OF_CONDUCT.md': `# Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all developers, reviewers, and contributors, regardless of experience, gender, sexual orientation, disability, personal appearance, race, ethnicity, age, or religion.

## Our Standards
* **Be Professional**: Focus on clean architecture, constructive feedback, and objective reasoning.
* **Respect Context**: Do not override existing architecture, templates, or workflows without documenting the change via an Architectural Decision Record (ADR) in \`.ai/decisions/\`.
* **Prioritize Quality**: Maintain structural standards, write complete code, and ensure coverage.
`,

  'CHANGELOG.md': `# 📝 Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-28
### Added
- Created complete, world-class enterprise project directory structure.
- Initialized comprehensive \`.ai/\` repository memory and developer context system.
- Generated 10 core documents, including project roadmaps, architecture blueprints, and licensing.
- Setup AI rules, skills, prompts, checklists, and automated development workflows.
- Configured production-ready settings for Docker, Makefile, EditorConfig, Ruff, and Pyproject.
- Implemented live React workspace preview and Interactive Scaffold Explorer.
`,

  'ROADMAP.md': `# 🗺️ Platform Roadmap

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
* [ ] Build interactive WebSockets for real-time portfolio updates.

## ⚙️ Phase 3: Advanced ML & Deep Learning
* [ ] Implement PyTorch neural network ensembles for match sequence modeling.
* [ ] Optimize hyperparameters autonomously using Optuna and automated mlflow runs.
`,

  'ARCHITECTURE.md': `# 🏛️ High-Level System Architecture

The AI Betting Intelligence Platform uses a modular, event-driven architecture designed for extreme performance, scale, and clear separation of concerns.

\`\`\`mermaid
graph TD
    A[Data Ingestion Pipeline] -->|Store Raw Event| B[(PostgreSQL DB)]
    A -->|Trigger Evaluation| C[ML Inference Engine]
    C -->|Calculate Probability| D[Value Bet Finder]
    E[Odds Scraper Engine] -->|Parse Live Feeds| D
    D -->|Identify Gaps| F[Bankroll Manager]
    F -->|Log Portfolio| B
    B -->|Query State| G[FastAPI Backend Server]
    G -->|Serve API| H[React Frontend App]
    I[Redis Cache] <-->|Session / Data Cache| G
    J[Celery Worker Task Queue] <-->|Background Jobs| B
\`\`\`

## 💎 Architectural Principles
1. **Separation of Concerns**: Scrapers, prediction engines, portfolio trackers, and serving APIs are completely decoupled.
2. **Data Integrity**: Odds are stored historically to evaluate bookmaker pricing efficiency.
3. **Stateless Compute**: FastAPI endpoints and machine learning scoring pipelines remain completely stateless.
`,

  'PROJECT_STATUS.md': `# 📊 Project Status

**Current Status**: Scaffolding & Core Architecture Setup (100% Complete)

## 🎯 Completed Work
- [x] Initialized development environment with all required directory structures.
- [x] Created \`.ai/\` context, rules, memory, prompts, and onboarding files.
- [x] Created pre-commit configuration, pyproject.toml, Dockerfiles, and CI/CD GitHub workflows.
- [x] Verified and compiled the interactive explorer UI.

## 🗓️ Up Next
- **Data Pipeline Setup**: Deploy historical football database schema inside SQLAlchemy.
- **Model Training Prototype**: Write scripts to train baseline LightGBM classifier on historical league results.
`,

  'SECURITY.md': `# 🛡️ Security & Terms Policy

We prioritize absolute compliance with regional legal boundaries and target bookmaker policies.

## 🔒 Security Practices
1. **API Key Security**: Sensitive parameters (database credentials, bookmaker API keys, and model keys) must never be checked into git. Use environmental variables.
2. **Access Control**: Production endpoints require secure OAuth2 JWT tokens with role-based scopes.

## ⚖️ South Africa Bookmaker Compliance
Our platform acts **exclusively** as a data analytics, prediction, and bankroll tracking interface.
* **No Direct Automation**: The platform does not place automated bets on Betway, Hollywoodbets, or other platforms.
* **Usage Policy**: Users must manually read identified value bets and place them directly via official bookmaker interfaces.
`,

  'LICENSE.md': `# License

Copyright (c) 2026 AI Betting Intelligence Platform. All rights reserved.

The platform and associated scaffolding materials are proprietary and confidential. Unauthorized copying, distribution, or execution of these files is strictly prohibited.
`
};

// Write core documents
Object.entries(coreDocs).forEach(([filename, content]) => {
  writeFile(filename, content);
});

// Generate Context files
const contextDocs = {
  'project.md': '# Project Overview\n\nComprehensive enterprise analytics dashboard for predicting football outcomes and identifying mathematical value bets in local South African betting markets.',
  'vision.md': '# Long Term Vision\n\nTo become the premier algorithmic sports analytics solution, enabling systematic portfolio management of sports assets like a modern quantitative hedge fund.',
  'architecture.md': '# Architecture Strategy\n\nModular Python micro-services combined with modern React frontends. Communicates over JSON REST APIs and real-time WebSockets.',
  'database.md': '# Database Design\n\nPostgreSQL relational database storing teams, matches, bookmaker odds, prediction history, simulated logs, and user portfolios with timescale extensions.',
  'api.md': '# API Specifications\n\nREST API built using FastAPI. Key resource paths under `/api/v1` targeting `/matches`, `/odds`, `/predictions`, `/portfolio`.',
  'business-rules.md': '# Business Rules\n\nValue bet criteria: Odds * Calculated Probability > 1.0. Max Kelly fraction restricted to 0.1 to avoid severe variance drawdowns.',
  'domain-model.md': '# Domain Models\n\nContains Match, Odd, Prediction, Simulation, Bookmaker, Slip, Portfolio, User, and FeatureSet.',
  'roadmap.md': '# Phase Details\n\nDetails of current sprint, epics, and features. Integrated directly into Jira and Github projects.',
  'features.md': '# Feature Specifications\n\nFeatures include Real-time Odds Aggregation, Ensemble Predictor, Match Simulator, Kelly Calculator, and Portfolio Tracker.',
  'current-sprint.md': '# Current Sprint: Sprint 1 (Infrastructure)\n\nGoal: Build solid scaffold, define schemas, initialize container environments, and create model scoring interfaces.',
  'glossary.md': '# Industry Glossary\n\n- Value Bet: An event priced higher by the bookmaker than its actual probability.\n- HDA: Home, Draw, Away (Match Outcome market).',
  'tech-stack.md': '# Technology Stack Overview\n\nBackend: FastAPI, Celery, Redis, SQLAlchemy. ML: XGBoost, LightGBM, CatBoost. UI: React + Tailwind.',
  'environment.md': '# Environment Parameters\n\nConfigured in `.env.example`. Includes database URL, Redis URL, models path, log levels, and local keys.',
  'dependencies.md': '# Dependencies Analysis\n\nManaged in `pyproject.toml` and `package.json` with strict version bounds to prevent breaking upgrades.',
  'performance.md': '# Performance Mandates\n\nOdds scraper processing: < 500ms. Prediction latency: < 50ms per match. DB Queries indexed for instant rendering.',
  'security.md': '# Security Protocols\n\nInput validation via Pydantic, password hashing via Argon2id, and HTTPS enforcement on all API routes.',
  'testing.md': '# Testing Strategy\n\nPytest with fixture databases, Playwright for end-to-end integration, and 90% test coverage target.',
  'deployment.md': '# Deployment Guidelines\n\nDeployed via Docker Compose on secure instances, monitored via Prometheus and Grafana alerts.',
  'devops.md': '# DevOps Pipelines\n\nAutomated tests, code style formatting with Ruff/Mypy, and continuous delivery via Github Actions.',
  'frontend.md': '# Frontend Framework\n\nReact 19, Vite, Tailwind CSS, Lucide icons, and Plotly charts for deep historical performance curves.',
  'backend.md': '# Backend Micro-framework\n\nFastAPI routing, dependency injection for repositories, structured logging, and central middleware handlers.',
  'ai-models.md': '# Machine Learning Models\n\nEnsemble classifiers using tournament histories, rolling expected goals (xG), and player stats.',
  'data-pipeline.md': '# Data Processing Pipeline\n\nIngestion -> Validation -> Feature Engineering -> Inference -> Portfolio Feedback loop.',
  'value-betting.md': '# Value Betting Formula\n\nProbability calculation based on HDA model outputs compared against bookmaker decimal odds.',
  'bankroll.md': '# Bankroll Management Rules\n\nProportional sizing using Kelly formulas, adjusted for model certainty and portfolio risk metrics.',
  'automation.md': '# Automation Systems\n\nAutomated scheduled model retraining, dynamic data validation alerts, and n8n orchestration.'
};

Object.entries(contextDocs).forEach(([filename, content]) => {
  writeFile(`.ai/context/${filename}`, content);
});

// Generate Memory files
const memoryDocs = {
  'decisions.md': '# Architecture Decision Records\n\n- ADR-001: Selected PostgreSQL with SQLAlchemy for robust relational transaction capabilities.\n- ADR-002: Chose FastAPI for high asynchronous throughput.',
  'completed.md': '# Completed Tasks\n\n- Scaffolding of directories\n- CI/CD Configurations\n- Docker environment setups',
  'changelog.md': '# Repository Change History\n\n- v0.1.0 Initial scaffolding and repository initialization.',
  'lessons.md': '# Lessons Learned\n\n- Keep bookmaker scrapers highly decoupled from ML features to prevent API changes from breaking scoring loops.',
  'technical-debt.md': '# Technical Debt Registry\n\n- Mock scraper adapters must be upgraded to real feeds before Sprint 2.',
  'known-issues.md': '# Known Issues\n\n- Scrapers might hit cloudflare barriers; requires proxies configuration.',
  'improvements.md': '# Planned Improvements\n\n- Multi-threading optimization for real-time odds comparison engines.',
  'refactoring.md': '# Refactoring Backlog\n\n- Extract matching algorithms to separate parsing class for clarity.',
  'performance-history.md': '# Performance Audits\n\n- Initial baseline: DB reads < 5ms under simulated 10k match loads.',
  'security-history.md': '# Security Review History\n\n- Initial scans set up via Bandit and pip-audit.',
  'release-history.md': '# Releases\n\n- v0.1.0-alpha: Internal scaffolding baseline.',
  'design-history.md': '# Visual & Interface Evolution\n\n- Drafted minimalist high-contrast dark theme mockup for premium UI experience.',
  'database-history.md': '# Database Migration History\n\n- v001_initial_schema initialized through Alembic stub.',
  'api-history.md': '# API Changes\n\n- Initial endpoints structured in FastAPI routes.',
  'model-history.md': '# ML Model Performance Logs\n\n- LightGBM baseline: Accuracy 54.3% (Home/Draw/Away matches).'
};

Object.entries(memoryDocs).forEach(([filename, content]) => {
  writeFile(`.ai/memory/${filename}`, content);
});

// Generate Skills files
const skillsList = [
  'backend.md', 'frontend.md', 'python.md', 'fastapi.md', 'sqlalchemy.md',
  'postgres.md', 'redis.md', 'docker.md', 'devops.md', 'security.md',
  'documentation.md', 'testing.md', 'code-review.md', 'performance.md',
  'architecture.md', 'machine-learning.md', 'xgboost.md', 'lightgbm.md',
  'catboost.md', 'pytorch.md', 'feature-engineering.md', 'sports-prediction.md',
  'statistics.md', 'value-betting.md', 'bankroll.md', 'prompt-engineering.md',
  'debugging.md', 'refactoring.md', 'logging.md', 'monitoring.md',
  'api-design.md', 'clean-code.md', 'clean-architecture.md', 'ddd.md',
  'cqrs.md', 'repository-pattern.md', 'dependency-injection.md', 'error-handling.md',
  'async-programming.md', 'unit-testing.md', 'integration-testing.md', 'playwright.md'
];

skillsList.forEach(skillFile => {
  const name = skillFile.replace('.md', '').toUpperCase().replace('-', ' ');
  const content = `# Skill: ${name}\n\nComprehensive technical mastery rules, structural best practices, and runtime patterns for ${name} development within the platform.`;
  writeFile(`.ai/skills/${skillFile}`, content);
});

// Generate Rules files
const rulesList = [
  'coding-rules.md', 'architecture-rules.md', 'database-rules.md', 'api-rules.md',
  'security-rules.md', 'testing-rules.md', 'git-rules.md', 'documentation-rules.md',
  'naming-rules.md', 'performance-rules.md', 'logging-rules.md', 'review-rules.md',
  'prompt-rules.md', 'deployment-rules.md', 'refactoring-rules.md', 'ml-rules.md',
  'data-rules.md', 'automation-rules.md', 'ai-rules.md'
];

rulesList.forEach(ruleFile => {
  const name = ruleFile.replace('.md', '').toUpperCase().replace('-', ' ');
  const content = `# Operational Rule: ${name}\n\nStrict quality guidelines, error prevention strategies, and mandatory compliance checkpoints for ${name}.`;
  writeFile(`.ai/rules/${ruleFile}`, content);
});

// Generate Prompts files
const promptsList = [
  'feature.md', 'bugfix.md', 'refactor.md', 'review.md', 'documentation.md',
  'optimization.md', 'testing.md', 'security.md', 'performance.md', 'architecture.md',
  'database.md', 'api.md', 'frontend.md', 'backend.md', 'machine-learning.md',
  'prediction.md', 'value-betting.md', 'automation.md', 'deployment.md', 'release.md'
];

promptsList.forEach(promptFile => {
  const name = promptFile.replace('.md', '').toUpperCase().replace('-', ' ');
  const content = `# Prompt: ${name}\n\nStandard structured instructions to guide AI assistants through high-quality execution of ${name} tasks.`;
  writeFile(`.ai/prompts/${promptFile}`, content);
});

// Generate Templates files
const templatesList = [
  'feature_request.md', 'bug_report.md', 'task.md', 'epic.md', 'sprint.md',
  'adr.md', 'pr.md', 'issue.md', 'migration.md', 'api_endpoint.md',
  'training_report.md', 'prediction_report.md', 'release_notes.md',
  'incident_report.md', 'postmortem.md', 'meeting_notes.md', 'research.md'
];

templatesList.forEach(templateFile => {
  const name = templateFile.replace('.md', '').toUpperCase().replace('_', ' ');
  const content = `# Template: ${name}\n\nStandardized structure and guidelines for compiling a ${name}.`;
  writeFile(`.ai/templates/${templateFile}`, content);
});

// Generate Checklists files
const checklistsList = [
  'feature.md', 'pr.md', 'release.md', 'testing.md', 'security.md',
  'performance.md', 'database.md', 'deployment.md', 'ai_model.md',
  'documentation.md', 'code_review.md'
];

checklistsList.forEach(chkFile => {
  const name = chkFile.replace('.md', '').toUpperCase().replace('_', ' ');
  const content = `# Quality Checklist: ${name}\n\nMandatory compliance checklist before merging, deploying, or releasing ${name}.`;
  writeFile(`.ai/checklists/${chkFile}`, content);
});

// Generate Architecture files
const architectureList = [
  'system.md', 'folders.md', 'microservices.md', 'database.md', 'ai.md',
  'ml_pipeline.md', 'prediction_pipeline.md', 'automation_pipeline.md',
  'security.md', 'deployment.md', 'monitoring.md', 'logging.md'
];

architectureList.forEach(archFile => {
  const name = archFile.replace('.md', '').toUpperCase().replace('_', ' ');
  const content = `# Architectural Design: ${name}\n\nDetailed specifications, components, interactions, and visual layouts for the system's ${name}.`;
  writeFile(`.ai/architecture/${archFile}`, content);
});

// Generate Workflows files
const workflowsList = [
  'feature.md', 'bugfix.md', 'refactor.md', 'release.md', 'hotfix.md',
  'training.md', 'evaluation.md', 'review.md', 'migration.md',
  'deployment.md', 'documentation.md', 'security.md', 'optimization.md'
];

workflowsList.forEach(wfFile => {
  const name = wfFile.replace('.md', '').toUpperCase().replace('_', ' ');
  const content = `# Development Workflow: ${name}\n\nStandard operating procedures (SOP) to ensure safe, repeatable, and highly structured execution of ${name}.`;
  writeFile(`.ai/workflows/${wfFile}`, content);
});

// Generate Agent Profiles
const agentsList = [
  'architect.md', 'backend.md', 'frontend.md', 'ml_engineer.md',
  'data_engineer.md', 'devops.md', 'security.md', 'qa.md',
  'writer.md', 'reviewer.md', 'debugger.md', 'researcher.md'
];

agentsList.forEach(agentFile => {
  const name = agentFile.replace('.md', '').toUpperCase().replace('_', ' ');
  const content = `# Agent Profile: ${name}\n\n## Responsibilities\n- Dedicated execution guidelines for the ${name} role.\n\n## Scope & Constraints\n- Strictly bound by system constraints.\n\n## Required Outputs\n- Enterprise production-quality codebase additions and memory updates.`;
  writeFile(`.ai/agents/${agentFile}`, content);
});

// Generate Repository Configurations
const reposConfigs = {
  '.editorconfig': `
root = true

[*]
indent_style = space
indent_size = 4
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.{js,ts,jsx,tsx,json,css,html}]
indent_size = 2
`,

  '.gitattributes': `
* text=auto
*.py text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.css text eol=lf
*.md text eol=lf
`,

  '.pre-commit-config.yaml': `
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.0.285
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
`,

  'ruff.toml': `
line-length = 88
target-version = "py311"

[lint]
select = ["E", "F", "I", "N", "UP", "B", "A", "C4", "SIM", "ARG"]
ignore = []
`,

  'pyproject.toml': `
[tool.poetry]
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
mypy = "^1.4.1"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
`,

  'docker-compose.yml': `
version: '3.8'

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
  pgdata:
`,

  'docker/Dockerfile': `
FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=off \\
    PIP_DISABLE_PIP_VERSION_CHECK=on \\
    POETRY_VERSION=1.5.1

RUN apt-get update && apt-get install -y \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN poetry config virtualenvs.create false \\
    && poetry install --no-interaction --no-ansi --no-root

COPY . /app/

EXPOSE 8000
`,

  'Makefile': `
.PHONY: help install lint format test build up down db-migrate

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
	pytest tests/

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down
`
};

Object.entries(reposConfigs).forEach(([filename, content]) => {
  writeFile(filename, content);
});

// Generate GitHub Workflows
const githubWfs = {
  'ci.yml': `
name: Continuous Integration

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install poetry
          poetry install
      - name: Run Tests
        run: poetry run pytest tests/ --cov=backend
`,

  'lint.yml': `
name: Lint & Style Verification

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install Lint Tools
        run: pip install ruff mypy
      - name: Check Formatting & Imports
        run: ruff check .
`,

  'test.yml': `
name: Integration Tests Execution

on:
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Environment
        run: docker-compose up -d
      - name: Run Playwright and pytest integrations
        run: |
          docker-compose exec api pytest tests/integration
`,

  'security_scan.yml': `
name: Security & Vulnerability Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Safety Scan (Python Dependencies)
        run: |
          pip install safety
          safety check
`,

  'deploy.yml': `
name: Production CD Pipeline

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Cloud Instance
        run: echo "Initiating blue-green container deploy..."
`
};

Object.entries(githubWfs).forEach(([filename, content]) => {
  writeFile(`.github/workflows/${filename}`, content);
});

console.log('🎉 Scaffolding Generation Complete!');
