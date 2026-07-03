# 🗄️ SQLAlchemy 2.0 Mapping & Query Standards

## 1. Purpose
To define the standard setup for database models, relationships, and queries using SQLAlchemy 2.0.

## 2. When to Use
- Accessing or modifying PostgreSQL data inside backend modules.

## 3. When NOT to Use
- Writing real-time websocket scrapers with no database interactions.

## 4. Architecture
SQLAlchemy serves as the Object-Relational Mapper (ORM), abstracting transactional database engines behind clean repositories:
```
[ Repository Layer ] -> [ SQLAlchemy Session ] -> [ Parameterized SQL ] -> [ Postgres DB ]
```

## 5. Step-by-Step Implementation
1. **Define Declarative Base**: Inherit models from SQLAlchemy's `DeclarativeBase`.
2. **Setup Columns**: Use modern Mapped types (`Mapped[int]`, `Mapped[str]`).
3. **Execute Sessions**: Run commands inside transactional contexts using `async_sessionmaker`.

## 6. Repository Standards
- All migrations must be performed through Alembic revisions.
- Absolutely zero raw SQL queries inside repositories without proper parameterization.

## 7. Examples

### Declarative Model and Async Repository
```python
from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

class Base(DeclarativeBase):
    pass

class MatchEntity(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    home_team: Mapped[str] = mapped_column(String(100), nullable=False)
    away_team: Mapped[str] = mapped_column(String(100), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

class MatchRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, match_id: int) -> MatchEntity | None:
        query = select(MatchEntity).where(MatchEntity.id == match_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
```

## 8. Best Practices
- Leverage modern Mapped types explicitly for robust IDE autocomplete and mypy type checks.
- Handle relationship loading strategies carefully (prefer `selectinload` for nested async relational sets).

## 9. Anti-patterns
- **N+1 Querying**: Querying a list of entities and subsequently loading matching foreign key rows one-by-one in a loop.

## 10. Security Considerations
- Parameterize all search predicates strictly to avoid SQL injection vulnerability gates.

## 11. Performance Considerations
- Limit returned result arrays using explicit pagination bounds.
- Use read-only sessions (`select`) without flushing state modifications when checking calculations.

## 12. Testing Strategy
- Test repository methods using local transactional rollbacks in pytest fixture definitions.

## 13. Review Checklist
- [ ] Are cascading rules properly configured for deleted parent keys?
- [ ] Do foreign keys map to explicitly indexed database keys?

## 14. Common Mistakes
- Utilizing async session operations without prefixing query expressions with `await`.

## 15. Future Improvements
- Migrate to automated read/write connection-splitting across active multi-region replicas.

## 16. Revision History
- **v1.0.0**: Outlined standard async SQLAlchemy mapping patterns.

## 17. Related References
- Skills: [PostgreSQL](postgres.md), [Backend](backend.md)
- Rules: [Database Rules](../rules/database-rules.md)
