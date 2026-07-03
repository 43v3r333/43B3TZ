# 🗄️ Repository Design Pattern Standards

## 1. Purpose
To decouple business services from database operations, creating clean domain boundaries.

## 2. When to Use
- Managing database queries, CRUD actions, and ORM mapping logic across systems.

## 3. When NOT to Use
- Querying stateless third-party APIs directly, or developing purely client-side visual states.

## 4. Architecture
```
[ Core Service Use Case ] ---> [ Interface Repository ] ---> [ Concrete SQL Database Adapter ]
```

## 5. Step-by-Step Implementation
1. **Define Abstract Interface**: Establish clear methods for reading and writing domain models.
2. **Implement ORM Storage Adapter**: Code concrete queries using SQLAlchemy, Prisma, etc.
3. **Bind Dependency Injection**: Bind concrete implementations to interfaces inside startup routers.

## 6. Repository Standards
- Use cases must never access database sessions directly; they must interact strictly via repository interfaces.
- Repository actions must return domain model entities, never raw ORM row structures.

## 7. Examples

### SQLAlchemy 2.0 Repository Class
```python
from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.orm import Session

# Interface
class IUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[dict]:
        pass

# Concrete
class SQLUserRepository(IUserRepository):
    def __init__(self, db_session: Session) -> None:
        self.session = db_session

    def get_by_id(self, user_id: int) -> Optional[dict]:
        # Implementation of SQLAlchemy fetch query
        row = self.session.execute("SELECT id, name FROM users WHERE id = :id", {"id": user_id}).fetchone()
        return {"id": row.id, "name": row.name} if row else None
```

## 8. Best Practices
- Keep repositories simple and focused entirely on data access; do not place business logic here.
- Standardize on clean parameter inputs instead of exposing direct ORM session operations.

## 9. Anti-patterns
- **Leaky Sessions**: Returning database cursor pools or transaction boundaries to outer application layers.

## 10. Security Considerations
- Parameterize all inputs inside queries to prevent SQL Injection vulnerabilities.

## 11. Performance Considerations
- Load data relations selectively; use eager loading only where specifically required.

## 12. Testing Strategy
- Mock repository interfaces to unit test business services without connecting to real database instances.

## 13. Review Checklist
- [ ] Is the data store access encapsulated behind an abstract interface?
- [ ] Are queries properly parameterized to defend against injection attacks?

## 14. Common Mistakes
- Writing heavy business calculations and domain rules inside database query files.

## 15. Future Improvements
- Implement generic repository bases to minimize repetitive boilerplate CRUD structures.

## 16. Revision History
- **v1.0.0**: Formulated repository design standards.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [SQLAlchemy](sqlalchemy.md)
