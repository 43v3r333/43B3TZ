# ⚡ Command Query Responsibility Segregation (CQRS)

## 1. Purpose
To decouple update operations (Commands) from read operations (Queries) to maximize system scalability and performance.

## 2. When to Use
- Designing highly scalable backends with complex audit trails and high-frequency real-time dashboards.

## 3. When NOT to Use
- Building simple CRUD modules where commands and queries use the same database structures.

## 4. Architecture
```
                           [ Ingress Layer ]
                             /           \
             [ Commands (Writes) ]     [ Queries (Reads) ]
                   |                           |
             [ Postgres DB ]             [ High-Speed Cache ]
```

## 5. Step-by-Step Implementation
1. **Separate Routes**: Define write endpoints completely apart from analytics endpoints.
2. **Command Handlers**: Create handlers to execute state changes and emit event structures.
3. **Query Handlers**: Query direct database views or read-only cache instances.

## 6. Repository Standards
- Commands must return execution status envelopes; they should never return large entity graphs.
- Queries must be strictly read-only and bypass database transaction lock configurations.

## 7. Examples

### CQRS API Routing Structure
```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/predictions", tags=["cqrs"])

# Command: Write model input
class CreatePredictionCommand(BaseModel):
    match_id: int
    predicted_home_goals: float

# Query: Read model input
class PredictionSummaryQuery(BaseModel):
    id: int
    match_id: int
    calibrated_prob: float

@router.post("/", status_code=201)
async def submit_prediction(command: CreatePredictionCommand):
    # Process Command mutation
    return {"status": "accepted"}

@router.get("/{prediction_id}", response_model=PredictionSummaryQuery)
async def get_prediction_summary(prediction_id: int):
    # Process Read query (fast read-replica fetch)
    return PredictionSummaryQuery(id=prediction_id, match_id=1, calibrated_prob=0.62)
```

## 8. Best Practices
- Use database read-replicas for Query handlers and primary databases for Command handlers.
- Design Read queries to match the visual needs of frontend views directly.

## 9. Anti-patterns
- **Transactional Querying**: Locking database tables during heavy read actions.

## 10. Security Considerations
- Apply permission checks on Command mutations while maintaining open access on public Queries.

## 11. Performance Considerations
- Cache query results in Redis with short TTL configurations to handle heavy user traffic.

## 12. Testing Strategy
- Unit-test commands by verifying database mutations, and test queries by checking returned data formats.

## 13. Review Checklist
- [ ] Are query handlers free of state mutation steps?
- [ ] Do Command endpoints return simple success status envelopes instead of large entity models?

## 14. Common Mistakes
- Merging read and write models into a single heavy class, which defeats CQRS optimization goals.

## 15. Future Improvements
- Move to event-driven event sourcing to keep write-command histories accurate.

## 16. Revision History
- **v1.0.0**: Outlined platform CQRS guidelines.

## 17. Related References
- Skills: [Backend](backend.md), [Database Rules](../rules/database-rules.md)
