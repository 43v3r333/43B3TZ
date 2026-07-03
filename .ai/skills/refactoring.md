# 🔄 Code Refactoring Standards

## 1. Purpose
To define processes for improving code structure and readability without altering external behavior.

## 2. When to Use
- Simplifying complex methods, reducing tech debt, and aligning legacy files with system rules.

## 3. When NOT to Use
- Rewriting code during active production outages (prefer focused, low-risk patches).

## 4. Architecture
```
[ Legacy Code ] ---> [ Ensure Unit Test Suite Coverage ] ---> [ Small Edits ] ---> [ Verify Behaviour Runs ]
```

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
```typescript
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
```

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
