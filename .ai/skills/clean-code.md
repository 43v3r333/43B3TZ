# 🧼 Clean Code & Development Standards

## 1. Purpose
To define guidelines for writing legible, self-documenting, and maintainable software.

## 2. When to Use
- Every software commit, feature branch, component design, and routine implementation.

## 3. When NOT to Use
- Never. Clean code standards are mandatory across all files in the ecosystem.

## 4. Architecture
```
[ Clean Code Principles ] ---> [ High Readability ] ---> [ Low Cognitive Load ] ---> [ High Reliability ]
```

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
```typescript
// 🟢 Good: Clear intent, single responsibility, well-named
export function calculateWinPercentage(wins: number, totalGames: number): number {
  if (totalGames <= 0) {
    return 0;
  }
  return (wins / totalGames) * 100;
}
```

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
