# 🧪 Integration Testing Standards

## 1. Purpose
To establish guidelines for verifying collaborations across multiple system modules, databases, and APIs.

## 2. When to Use
- Testing repository database operations, API route responses, and multi-service event orchestration flows.

## 3. When NOT to Use
- Testing simple isolated algorithms or state transformations (prefer pure unit tests).

## 4. Architecture
```
[ API Router Client ] ---> [ Concrete Service ] ---> [ Test Database Instance (Postgres/Redis) ]
```

## 5. Step-by-Step Implementation
1. **Prepare DB Test State**: Setup database transactions that roll back automatically after test runs.
2. **Mock External APIs**: Mock only external, third-party internet APIs using adapters or VCR recorders.
3. **Run Requests**: Utilize the framework's test client (`TestClient` or similar) to call endpoints.
4. **Assert Side Effects**: Query the test database directly to verify expected state changes.

## 6. Repository Standards
- Integration tests must run in isolated environments without affecting production database schemas.
- Ensure all test resources (connections, threads) are cleaned up correctly after completion.

## 7. Examples

### FastAPI Route Integration Test
```python
import pytest
from fastapi.testclient import TestClient

def test_create_prediction_integration(client: TestClient):
    # Call endpoint concrete router
    response = client.post(
        "/api/v1/predictions/",
        json={"match_id": 42, "predicted_home_goals": 2.5}
    )
    assert response.status_code == 201
    assert response.json()["status"] == "accepted"
```

## 8. Best Practices
- Automatically seed minimal required tables before executing integration suites.
- Use explicit transactional rollbacks to maintain test database hygiene.

## 9. Anti-patterns
- **Shared Mutable State**: Letting test runs modify identical static records, causing random test failures.

## 10. Security Considerations
- Ensure test suites do not connect to production databases or expose active environment secrets.

## 11. Performance Considerations
- Run database-bound integration test suites in parallel with connection pool boundaries.

## 12. Testing Strategy
- Run automated integration tests on every pull request within the CI/CD pipeline.

## 13. Review Checklist
- [ ] Are all database test cases wrapped in a transactional rollback block?
- [ ] Are external internet dependencies properly mocked?

## 14. Common Mistakes
- Leaving orphaned connections active in test databases, causing pool starvation issues.

## 15. Future Improvements
- Implement automated test-containers setup inside CI configurations.

## 16. Revision History
- **v1.0.0**: Defined system integration testing practices.

## 17. Related References
- Skills: [Testing](testing.md), [Unit Testing](unit-testing.md)
