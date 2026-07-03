# 🔍 Code Debugging & Diagnosis Standards

## 1. Purpose
To establish structured methodologies for locating, identifying, and resolving software faults.

## 2. When to Use
- Troubleshooting test failures, resolving system crashes, and investigating production performance gaps.

## 3. When NOT to Use
- Standard, routine coding tasks with zero functional issues.

## 4. Architecture
```
[ Issue Detected ] ---> [ Reproduce Fault ] ---> [ Log Analysis & Tracing ] ---> [ Isolated Fix ]
```

## 5. Step-by-Step Implementation
1. **Isolate the Defect**: Create a minimal reproducible test case to isolate the issue.
2. **Analyze Logs**: Review execution traces and error payloads.
3. **Use Debuggers**: Set break-points and watch-expressions to inspect runtime state variables.
4. **Implement Verification**: Write a failing unit test first to prevent regression errors.

## 6. Repository Standards
- Never commit active debuggers (`breakpoint()`, `debugger;`) to git branches.
- Keep diagnostic logs structured in JSON format.

## 7. Examples

### Structured Error Tracer block
```typescript
export function safeExecute<T>(fn: () => T, context: string): T | null {
  try {
    return fn();
  } catch (error) {
    // Structured diagnostic logging for rapid troubleshooting
    console.error({
      timestamp: new Date().toISOString(),
      location: "ExecutionBoundary",
      context,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}
```

## 8. Best Practices
- Fix the root cause of issues, not just their surface-level symptoms.
- Always check core assumptions first before diving into deep, complex debugging flows.

## 9. Anti-patterns
- **Squelching Errors**: Catching and swallowing exceptions without logging or handling them.

## 10. Security Considerations
- Strip sensitive authentication tokens and private user data from diagnostic logs.

## 11. Performance Considerations
- Turn off heavy diagnostic logs in production to avoid high I/O latency.

## 12. Testing Strategy
- Convert verified faults into permanent regression test cases inside the unit test suite.

## 13. Review Checklist
- [ ] Are logs structured with clear context and stack details?
- [ ] Have all temporary debugger flags been removed?

## 14. Common Mistakes
- Committing temporary debug logs to production code branches.

## 15. Future Improvements
- Integrate distributed trace-tracking to debug microservices easily.

## 16. Revision History
- **v1.0.0**: Outlined baseline system debugging standards.

## 17. Related References
- Skills: [Logging](logging.md), [Testing](testing.md)
