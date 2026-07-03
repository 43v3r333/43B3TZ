# 🌿 CI/CD & DevOps Automation Standards

## 1. Purpose
To establish robust pathways for integration testing, automated packaging, secure rollouts, and continuous site updates.

## 2. When to Use
- Writing pipeline workflows, setting up cluster scaling rules, or managing environment configurations.

## 3. When NOT to Use
- Making simple, local code edits with zero deployment impacts.

## 4. Architecture
Our automated pipelines validate and compile changes, running verification steps before rolling out updates:
```
[ Commit Code ] -> [ GitHub Actions ] -> [ Lint & Test ] -> [ Docker Build ] -> [ Deploy to Cloud ]
```

## 5. Step-by-Step Implementation
1. **Define Pipelines**: Create GitHub Action configs in `.github/workflows/`.
2. **Lint & Verify**: Set up jobs to run formatting checks, linter runs, and testing suites.
3. **Containerize & Store**: Build and upload secure Docker images to the registry.
4. **Automate Rollout**: Promote images to staging, run E2E checks, and trigger blue-green swaps in production.

## 6. Repository Standards
- All changes must pass linting, formatting, and unit tests before merging to main.
- Store sensitive configuration keys strictly inside secure GitHub Repository secrets.

## 7. Examples

### Complete GitHub Actions Integration Workflow
```yaml
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
          token: ${{ secrets.CODECOV_TOKEN }}
```

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
- Verify pipeline actions locally using tools like `act`.

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
