# 🏛️ Platform Architecture & Clean Coding

## 1. Purpose
To define the core architectural guidelines and design principles that keep the platform maintainable and easy to scale.

## 2. When to Use
- Designing new services, adding database relationships, or defining communication patterns between backend and frontend.

## 3. When NOT to Use
- Implementing minor localized changes within an isolated frontend utility function.

## 4. Architecture
Our system decouples business domains from technical implementations using Clean Architecture boundaries:
```
  +-------------------------------------------------+
  | Frameworks & Drivers (React, FastAPI, Postgres) |
  |      +-----------------------------------+      |
  |      | Adapters (Controllers, Repos)     |      |
  |      |      +---------------------+      |      |
  |      |      | Use Cases/Services  |      |      |
  |      |      |      +-------+      |      |      |
  |      |      |      | Pure  |      |      |      |
  |      |      |      | Domain|      |      |      |
  |      |      |      +-------+      |      |      |
  |      |      +---------------------+      |      |
  |      +-----------------------------------+      |
  +-------------------------------------------------+
```

## 5. Step-by-Step Implementation
1. **Map the Domain**: Define the entities, value objects, and business formulas.
2. **Build Use Cases**: Write core services that coordinates calculations and data flows.
3. **Implement Adapters**: Create database-specific repositories and HTTP router schemas.
4. **Inject Dependencies**: Bind interfaces to implementations using dependency injection.

## 6. Repository Standards
- Keep business logic fully isolated; services must never import database drivers or framework-specific routers directly.
- Standardize folder layouts using a feature-first organization model.

## 7. Examples

### Clean Architecture Core Domain Service
```python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class MatchResult(BaseModel):
    id: int
    home_score: int
    away_score: int

class IMatchRepository(ABC):
    @abstractmethod
    async def get_by_id(self, match_id: int) -> MatchResult | None:
        pass

class MatchEvaluatorService:
    """Pure domain service that does not import database frameworks."""

    def __init__(self, repo: IMatchRepository) -> None:
        self.repo = repo

    async def get_winner(self, match_id: int) -> str:
        match = await self.repo.get_by_id(match_id)
        if not match:
            raise ValueError("Match not found")
        if match.home_score > match.away_score:
            return "HOME"
        elif match.away_score > match.home_score:
            return "AWAY"
        return "DRAW"
```

## 8. Best Practices
- Program against interface abstractions, not concrete class implementations.
- Separate high-frequency timeseries read models from relational portfolio edit operations.

## 9. Anti-patterns
- **Circular Imports**: Importing prediction models inside the portfolio module and vice-versa, creating circular dependencies.

## 10. Security Considerations
- Enforce secure access boundaries; ensure the frontend never communicates directly with database engines.

## 11. Performance Considerations
- Isolate heavy analytical computations from main HTTP threads to keep user interactions snappy.

## 12. Testing Strategy
- Write pure unit tests for domain business logic without requiring database or live service mocks.

## 13. Review Checklist
- [ ] Is business domain logic free of framework-specific annotations and dependencies?
- [ ] Are interfaces used to decouple adapters from services?

## 14. Common Mistakes
- Hardcoding specific database tools inside domain models, which couples business logic to database technology.

## 15. Future Improvements
- Move core domain calculations to compiled WASM packages to share exact execution logic across client and server.

## 16. Revision History
- **v1.0.0**: Established unified platform architecture conventions.

## 17. Related References
- Skills: [Backend](backend.md), [Clean Architecture](clean-architecture.md)
- Rules: [Architecture Rules](../rules/architecture-rules.md)
