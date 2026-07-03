# ⚡ Redis Caching & In-Memory Standards

## 1. Purpose
To establish optimal patterns for caching, distributed locking, and rate-limiting using Redis.

## 2. When to Use
- Storing fast-changing web pages, session states, API rate limit counters, or distributed locks across async workers.

## 3. When NOT to Use
- Saving durable business slip history files or system logs (always target Postgres).

## 4. Architecture
Redis acts as a high-speed, in-memory layer, reducing load on our main PostgreSQL database:
```
[ Client Request ] -> [ FastAPI Router ]
                           |
                     [ Redis Cache ] -- (Hit) -> [ Return Fast JSON ]
                           | (Miss)
                     [ Query Postgres ] -> [ Save in Redis ]
```

## 5. Step-by-Step Implementation
1. **Initialize Client**: Instantiate a connection pool with explicit timeouts.
2. **Implement Caching**: Use descriptive key formats with automatic TTL expirations.
3. **Establish Distributed Locks**: Protect critical sections with secure lock keys and timeouts.

## 6. Repository Standards
- Use structured key prefixes separated by colons (e.g. `cache:matches:<id>`).
- Always define a TTL (Time-To-Live) on cache writes to prevent stale memory builds.

## 7. Examples

### Type-Safe Redis Cache Wrapper with Distributed Lock
```python
import redis
import time
from typing import Optional

class RedisCacheManager:
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0) -> None:
        self.pool = redis.ConnectionPool(host=host, port=port, db=db, socket_timeout=2.0)
        self.client = redis.Redis(connection_pool=self.pool)

    def get_match_cache(self, match_id: int) -> Optional[str]:
        key = f"cache:matches:{match_id}"
        value = self.client.get(key)
        return value.decode("utf-8") if value else None

    def set_match_cache(self, match_id: int, payload: str, ttl_seconds: int = 300) -> None:
        key = f"cache:matches:{match_id}"
        self.client.setex(key, ttl_seconds, payload)

    def acquire_lock(self, lock_name: str, acquire_timeout: int = 5) -> bool:
        lock_key = f"lock:{lock_name}"
        # Set nx=True for mutual exclusion, ex=10 to prevent infinite lock hold on failure
        return bool(self.client.set(lock_key, "locked", ex=10, nx=True))

    def release_lock(self, lock_name: str) -> None:
        self.client.delete(f"lock:{lock_name}")
class RateLimiter:
    """Standard sliding window rate limiter."""
    pass
```

## 8. Best Practices
- Never store complex, nested binary files directly without serialization schemas (always serialize as clean JSON or MessagePack).
- Standardize cache keys globally using explicit configuration schemas.

## 9. Anti-patterns
- **Unbounded Key Growth**: Storing user session histories in Redis keys without explicit TTL settings, eventually running out of memory.

## 10. Security Considerations
- Require robust passwords on all local and cloud Redis server interfaces.

## 11. Performance Considerations
- Use connection pooling to recycle sockets across high-frequency operations.

## 12. Testing Strategy
- Test caching operations with mock Redis interfaces (such as `fakeredis`) in unit suites.

## 13. Review Checklist
- [ ] Are all cached keys configured with an explicit expiration TTL?
- [ ] Do distributed locks include a safety timeout to prevent deadlocks?

## 14. Common Mistakes
- Accessing Redis blocking connections synchronously within async FastAPI handlers without thread-pool insulation.

## 15. Future Improvements
- Upgrade to Redis Cluster patterns for massive scaling across geographic regions.

## 16. Revision History
- **v1.0.0**: Defined core caching and lock patterns.

## 17. Related References
- Skills: [FastAPI](fastapi.md), [Backend](backend.md)
- Rules: [Performance Rules](../rules/performance-rules.md)
