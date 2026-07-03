# Backend Subsystem Contract

## 1. Metadata
* **Purpose**: Enforces architectural layering, dependency injection patterns, DTO boundary rules, and transactional boundaries.
* **Version**: `v1.0.0`
* **Owner**: `Backend Architect` & `FastAPI Engineer`
* **Compatibility Policy**: Services must use clean interfaces. Underlying structural changes must not affect external controller endpoint models.
* **Breaking-Change Policy**: Changing class constructor parameters or method signatures of shared interfaces requires coordination across service boundaries and a minor version increment.
* **Migration Strategy**: Use standard Dependency Injection frameworks to swap concrete service implementations seamlessly.

---

## 2. Layered Architecture Specifications

### 2.1 Module Boundary Rules
The backend enforces Clean Architecture layering:
```
[ Controllers / Ingress Routes ] (HTTP/WSS/CLI)
               │
               ▼
[ Application Layer / Services ] (Use Cases, Validation, Business Rules)
               │
               ▼
[ Infrastructure / Adapters ] (Repositories, Databases, Scrapers)
```

### 2.2 Standard Repository Interface Specification
Defines how persistence layers must declare methods to isolate database operations.

```typescript
export interface IFixtureRepository {
  getById(id: string): Promise<Fixture | null>;
  list(league?: string, limit?: number, offset?: number): Promise<Fixture[]>;
  save(fixture: Fixture): Promise<void>;
  updateStatus(id: string, status: "scheduled" | "in_play" | "finished"): Promise<void>;
}
```

---

## 3. Validation Rules
1. **Controllers Isolated**: Controllers are strictly forbidden from directly importing database connection contexts or executing SQL queries; they must delegate to Application Services.
2. **DTO Isolation**: Database entities must never be returned directly to the client; all database entities must be converted to Data Transfer Objects (DTOs) first.
3. **Transaction Scope**: Transactions must be initiated inside Application Use Cases, ensuring write operations succeed or fail atomically.

---

## 4. Examples

### Typical Layered FastAPI Service Code
```python
# Application Service Layer
class FixtureService:
    def __init__(self, repo: IFixtureRepository):
        self._repo = repo

    async def get_active_fixtures(self, league: str) -> List[FixtureDTO]:
        fixtures = await self._repo.list(league=league, status="scheduled")
        return [FixtureDTO.from_entity(f) for f in fixtures]
```
