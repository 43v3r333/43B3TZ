# 🧪 Testing Strategy & Quality Mandates

To guarantee extreme mathematical precision, we enforce strict testing standards across all modules.

---

## 🧪 Unified Test Categories

```mermaid
graph TD
    unit[Unit Tests] -->|Verify Math| math[Kelly / Margin formulas]
    integration[Integration Tests] -->|Verify Flow| repo[Repository CRUDs]
    e2e[End-to-End Tests] -->|Verify UI| pw[Playwright browser checks]
```

---

## 📈 Quality & Coverage Standards

- **Minimum Statement Coverage**: The test suite must cover at least **90%** of backend Python statements, with core math modules requiring 100% coverage.
- **Lookahead Bias Detection**: Tests must verify that ML feature stores contain 0 future match data leaks.
- **Continuous Integration Checkpoint**: Pull requests must pass all automated CI linter and test runs before merging.
