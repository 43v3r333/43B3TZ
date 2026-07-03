# 🌐 RESTful API Design & Versioning Standards

## 1. Purpose
To establish consistent, scalable, and secure API patterns across all platform services.

## 2. When to Use
- Exposing microservice endpoints, designing payloads, and routing requests to the Gateway.

## 3. When NOT to Use
- Designing database schemas or local component utility helper functions.

## 4. Architecture
```
[ React Client ] ---> [ HTTP/S /api/v1/... ] ---> [ API Gateway / Router ] ---> [ Core DTOs ]
```

## 5. Step-by-Step Implementation
1. **Define Route Hierarchy**: Follow plural resource nouns (e.g., `/api/v1/matches`).
2. **Standardize Responses**: Return unified JSON objects with pagination and success envelopes.
3. **HTTP Status Codes**: Use appropriate status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error).

## 6. Repository Standards
- Version all endpoints with an explicit `/v1/` prefix.
- Enforce strict JSON schema validation for all inbound body payloads.

## 7. Examples

### Standard REST API Path Configuration
```python
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/matches", tags=["matches"])

class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str

@router.get("/{match_id}", response_model=MatchResponse, status_code=status.HTTP_200_OK)
async def get_match_detail(match_id: int):
    # Retrieve match implementation
    return MatchResponse(id=match_id, home_team="Team A", away_team="Team B")
```

## 8. Best Practices
- Keep endpoints stateless; rely on JWT tokens or session headers for authorization checks.
- Support filters, sorting, and pagination on all collection resources.

## 9. Anti-patterns
- **RPC over REST**: Designing actions in endpoints instead of resource paths (e.g. `/api/v1/runPrediction` instead of POST `/api/v1/predictions`).

## 10. Security Considerations
- Require HTTPS at all times and implement rate-limiting headers.

## 11. Performance Considerations
- Support gzip compression on large payload returns.

## 12. Testing Strategy
- Run automated schema contract tests using Schemathesis or pytest.

## 13. Review Checklist
- [ ] Do resource routes utilize pluralized nouns?
- [ ] Are all error payloads compliant with standard RFC-7807 problem details?

## 14. Common Mistakes
- Exposing internal database keys directly without DTO translation layers.

## 15. Future Improvements
- Implement GraphQL support for complex data analytics dashboards.

## 16. Revision History
- **v1.0.0**: Defined platform REST API rules.

## 17. Related References
- Skills: [Backend](backend.md)
