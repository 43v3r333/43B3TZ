# ⚡ FastAPI Development Standards

## 1. Purpose
This guide defines standard development practices for FastAPI web services in our sports analytics ecosystem.

## 2. When to Use
- Creating REST APIs, WebSocket pipelines, and exposing statistical modeling gateways.

## 3. When NOT to Use
- Writing standalone command-line scrapers or standalone training models.

## 4. Architecture
FastAPI handles web ingress, route parsing, and parameters validation before routing requests into pure domains:
```
[ API Request ] -> [ FastAPI Router ] -> [ Depend Injection ] -> [ Business Service ]
```

## 5. Step-by-Step Implementation
1. **Initialize Router**: Define an `APIRouter` with clean prefixes.
2. **Setup Dependencies**: Create factories for services using FastAPI `Depends`.
3. **Route Handlers**: Use `async def` for I/O operations and write clear output DTO models.

## 6. Repository Standards
- Always validate incoming paths using Pydantic.
- Provide descriptive annotations in Pydantic models to auto-document the Swagger interface.

## 7. Examples

### Standard FastAPI Endpoint with Structured Error Responses
```python
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

class BetSlipPayload(BaseModel):
    match_id: int = Field(..., description="ID of match")
    stake: float = Field(..., gt=0, description="Betting stake amount")

class BetSlipResponse(BaseModel):
    slip_id: int
    is_processed: bool

router = APIRouter(prefix="/slips", tags=["slips"])

@router.post("/", response_model=BetSlipResponse, status_code=status.HTTP_201_CREATED)
async def create_slip(payload: BetSlipPayload):
    try:
        # Business logic operation
        return BetSlipResponse(slip_id=101, is_processed=True)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process bet slip: {str(err)}"
        )
```

## 8. Best Practices
- Inject configuration classes globally using a cached singleton pattern.
- Limit endpoint complexity by moving logic entirely into pure service classes.

## 9. Anti-patterns
- Returning raw SQLAlchemy models directly over HTTP without Pydantic translation.

## 10. Security Considerations
- Secure endpoints with standard JWT authorization middleware configurations.

## 11. Performance Considerations
- Use `async def` only for handlers executing genuine asynchronous operations (e.g. database, network calls).

## 12. Testing Strategy
- Leverage FastAPI `TestClient` and `pytest-asyncio` for endpoint validation.

## 13. Review Checklist
- [ ] Do Pydantic models enforce valid bounds on numerical fields?
- [ ] Are HTTP exception statuses compliant with REST guidelines?

## 14. Common Mistakes
- Omitting dependency caching rules during complex validation dependency cascades.

## 15. Future Improvements
- Move API documentation directly into compiled static sites behind high-speed CDN caches.

## 16. Revision History
- **v1.0.0**: Outlined high-performance endpoint structures.

## 17. Related References
- Skills: [Backend](backend.md), [Python](python.md)
- Rules: [API Rules](../rules/api-rules.md)
