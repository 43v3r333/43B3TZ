# 🌿 Git Rules & Branching Standards

## 1. Purpose
To maintain clean, linear project histories with clear traceability.

## 2. Scope
Applies to all commits, branch lifecycles, PR flows, and releases.

## 3. Core Principles
- **Linear History**: Rebase feature branches before merging; avoid messy merge commits.
- **Traceability**: Commit messages must refer to specific technical contexts or tickets.
- **Immutable Releases**: Do not modify tags or release artifacts once deployed.

## 4. Mandatory Rules
- **Branch Naming**: Enforce standard prefixes: `feat/`, `fix/`, `docs/`, `refactor/`, `perf/`.
- **Semantic Commit Messages**: Format commits as: `<type>(<scope>): <short description>` (e.g., `feat(portfolio): add kelly sizing sliders`).
- **PR Gateways**: Pull requests must pass all linter and compilation checks before merge approval.
- **Rebase Policy**: Always merge with Fast-Forward options or squash branch commits to clean up history.

## 5. Recommended Practices
- Tag releases with explicit SemVer specifications (e.g., `v1.2.0`).
- Delete remote branches immediately following successful merge operations.

## 6. Examples

### 🟢 Good Commit History
```
feat(ingest): add betway sa decimal scraper
fix(math): fix float overflow in fractional kelly
docs(rules): update database-rules with soft delete rules
```

## 7. Anti-patterns & Common Mistakes
- **WIP Commits**: Committing un-buildable or un-linted code under generic "WIP" titles.
- **Force Pushing Main**: Force-pushing (`git push -f`) directly to the main or staging branches.

## 8. Decision Tree: Commit Formatting
```mermaid
graph TD
    A[New commit ready] --> B{Does it introduce a feature?}
    B -->|Yes| C[Commit with: feat(...)]
    B -->|No| D{Does it fix a bug?}
    D -->|Yes| E[Commit with: fix(...)]
    D -->|No| F[Commit with: chore/refactor/docs(...)]
```

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
