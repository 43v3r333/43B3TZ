# ⚡ Asynchronous Programming Standards

## 1. Purpose
To define the requirements for parallel, non-blocking execution models across backend and frontend tasks.

## 2. When to Use
- Handling heavy network requests, database transactions, background analytics, and Event Loop tasks.

## 3. When NOT to Use
- Writing pure CPU-bound math calculations (where multiprocessing or synchronous libraries are safer).

## 4. Architecture
```
[ Trigger ] ---> [ Event Loop ] ---> [ Background Worker / Thread Pool ] ---> [ Event Callback ]
```

## 5. Step-by-Step Implementation
1. **Use async/await**: Replace nested callbacks and raw Promises with clean async constructs.
2. **Prevent Blocking**: Ensure heavy file or I/O calls use non-blocking wrappers.
3. **Concurrency Controls**: Control task concurrency levels using throttled pools.

## 6. Repository Standards
- Always handle execution timeouts to prevent orphaned tasks.
- Avoid nesting async operations without proper error catching blocks.

## 7. Examples

### Concurrency mapping in TypeScript
```typescript
async function fetchAllBets(betIds: string[]): Promise<any[]> {
  // Use Promise.all to fetch betting records concurrently
  const fetchPromises = betIds.map(async (id) => {
    try {
      const response = await fetch(`/api/v1/bets/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching bet ${id}:`, error);
      return null;
    }
  });
  return Promise.all(fetchPromises);
}
```

## 8. Best Practices
- Run network operations in parallel using `Promise.all` or concurrent thread runners.
- Always clean up open listeners, timeouts, and WebSocket connections when components unmount.

## 9. Anti-patterns
- **Unbounded Task Spawning**: Creating infinite promises or background threads without queue limiting controls.

## 10. Security Considerations
- Secure thread environments; restrict context sharing across concurrent user tasks.

## 11. Performance Considerations
- Avoid blocking the JavaScript Event Loop or Python's asyncio loop with long-running sync operations.

## 12. Testing Strategy
- Test async pathways using mocked timers and resolved promise queues.

## 13. Review Checklist
- [ ] Are all async triggers backed by timeout rules?
- [ ] Is exception catching implemented on all concurrent task runners?

## 14. Common Mistakes
- Forgetting the `await` keyword, leading to incomplete or deferred promise resolutions.

## 15. Future Improvements
- Move to specialized event loops for high-frequency streaming calculations.

## 16. Revision History
- **v1.0.0**: Outlined platform async execution rules.

## 17. Related References
- Skills: [Backend](backend.md), [Frontend](frontend.md)
