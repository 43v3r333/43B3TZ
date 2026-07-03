# 🏛️ Clean Architecture Standards

## 1. Purpose
To ensure strict decoupling of business rules, system frameworks, database structures, and UI platforms.

## 2. When to Use
- Building major microservices, defining domain repositories, and establishing system boundaries.

## 3. When NOT to Use
- Writing simple, low-complexity visual components or temporary single-screen scripts.

## 4. Architecture
```
[ External Frameworks ] ---> [ Adapters / Repositories ] ---> [ Use Cases / Services ] ---> [ Pure Domain Entities ]
```

## 5. Step-by-Step Implementation
1. **Domain Layer**: Create pure, framework-free business models.
2. **Application Use Cases**: Define system actions and interfaces.
3. **Adapters**: Implement specific database or API gateways.
4. **Dependency Inversion**: Inject external dependencies from the outer rings inward.

## 6. Repository Standards
- Core domain files must not contain database imports or visual component structures.
- All communications across boundaries must use decoupled interface patterns.

## 7. Examples

### Interface decoupling for Match storage
```python
from abc import ABC, abstractmethod
from pydantic import BaseModel

class MatchDomainModel(BaseModel):
    id: int
    home_team: str
    away_team: str

class IMatchRepository(ABC):
    @abstractmethod
    def save(self, match: MatchDomainModel) -> None:
        pass

class CreateMatchUseCase:
    def __init__(self, repo: IMatchRepository) -> None:
        self.repo = repo

    def execute(self, match: MatchDomainModel) -> None:
        # Core business rule checking
        self.repo.save(match)
```

## 8. Best Practices
- Restrict logic to its specific architectural ring; never skip layers.
- Depend on interfaces, not implementation details, to maintain flexibility.

## 9. Anti-patterns
- **Leakage of Frameworks**: Importing SQLAlchemy, ORM utilities, or web frameworks directly into pure domain use cases.

## 10. Security Considerations
- Keep authentication and security filters isolated in outer adapter rings.

## 11. Performance Considerations
- Use lightweight translation layers (mappers) when passing objects across layer borders.

## 12. Testing Strategy
- Unit-test use cases in complete isolation using mock repository implementations.

## 13. Review Checklist
- [ ] Are domain entities fully decoupled from database adapters?
- [ ] Do use case classes access resources strictly via interfaces?

## 14. Common Mistakes
- Coupling domain rules directly to specific PostgreSQL schemas, preventing database-agnostic changes.

## 15. Future Improvements
- Implement automated module scanners to detect and flag ring-dependency violations.

## 16. Revision History
- **v1.0.0**: Defined repository clean architecture standards.

## 17. Related References
- Skills: [Backend](backend.md), [DDD](ddd.md)
