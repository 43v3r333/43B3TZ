# ⚡ Performance Tuning & Optimization Standards

## 1. Purpose
To establish performance engineering standards, ensuring our analytical calculations run with sub-second latency.

## 2. When to Use
- Optimizing slow API endpoints, database queries, memory layouts, or frontend rendering speeds.

## 3. When NOT to Use
- Writing rapid, low-frequency scripts where execution speed is not a constraint.

## 4. Architecture
We optimize performance across all layers, from database index lookups to in-memory caching and clean UI rendering:
```
[ React UI ] -> (Memoization & Lazy-Loading)
    |
[ FastAPI ] -> (Async Task Ingestion & Pooling)
    |
[ Redis Cache ] -> (Key-Value In-Memory Cache with TTL)
    |
[ Postgres / TimescaleDB ] -> (Composite Indexes & Partitions)
```

## 5. Step-by-Step Implementation
1. **Profile First**: Identify bottlenecks using profiling utilities (e.g., `cProfile`, Chrome DevTools).
2. **Optimize DB**: Verify queries leverage indexes; avoid N+1 queries.
3. **Leverage Redis**: Cache slow, high-frequency database aggregations with clear TTL limits.
4. **Stream Large Datasets**: Stream large analytical datasets asynchronously instead of loading entire tables into memory.

## 6. Repository Standards
- REST API queries must return results in under 200ms at the 95th percentile.
- Heavy React chart dashboards must memoize components to prevent unnecessary re-render loops.

## 7. Examples

### Fast Profiling Decorator in Python
```python
import time
import functools
import logging
from typing import Callable, Any

logger = logging.getLogger("performance")

def profile_execution_time(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to measure and log function execution times."""
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start_time
        logger.info(
            f"Function {func.__name__} executed in {duration:.4f} seconds"
        )
        return result
    return wrapper
```

## 8. Best Practices
- Reuse database sessions using connection pooling configurations.
- Store high-frequency odds inside partitioned TimescaleDB tables.

## 9. Anti-patterns
- **Memory Buffering**: Loading large odds datasets into Python lists instead of streaming records from the database.

## 10. Security Considerations
- Limit memory resource consumption on public APIs to protect services from Denial-of-Service (DoS) attacks.

## 11. Performance Considerations
- Run heavy calculations in background threads or Celery workers to keep the main event loop responsive.

## 12. Testing Strategy
- Implement automated benchmark tests in the CI pipeline to catch latency regressions before release.

## 13. Review Checklist
- [ ] Are composite indexes applied on compound query patterns?
- [ ] Do volatile, read-heavy API responses utilize Redis caching?

## 14. Common Mistakes
- Adding random indexes to database tables without verifying query profiles, which slows down write operations.

## 15. Future Improvements
- Implement continuous database aggregations to pre-calculate team stats and trends on scheduled cycles.

## 16. Revision History
- **v1.0.0**: Standardized platform performance optimization techniques.

## 17. Related References
- Skills: [Redis](redis.md), [PostgreSQL](postgres.md)
- Rules: [Performance Rules](../rules/performance-rules.md)
