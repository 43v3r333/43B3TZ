# 🧪 Testing & Quality Standards

## 1. Purpose
To define the overall testing standards, coverage metrics, and verification methods across backend and frontend code.

## 2. When to Use
- Writing unit tests, integration paths, E2E user flows, or automated validation suites.

## 3. When NOT to Use
- Writing rapid, interactive Jupyter notebooks for research.

## 4. Architecture
Our testing model validates logic across isolated units, integration paths, and full user interfaces:
```
           [ Playwright E2E ] -> (User Interface & Full App Flow)
                   |
         [ Pytest Integration ] -> (Service Layers & Real Postgres DB)
                   |
           [ Pytest Unit ] -> (Pure Functions, Math & Logic)
```

## 5. Step-by-Step Implementation
1. **Initialize Suite**: Set up configuration schemas in `pytest.ini` and `vitest.config.ts`.
2. **Write Unit Tests**: Focus tests on core algorithms, using mocked components to ensure isolation.
3. **Write Integration Tests**: Verify database relationships and transaction flows inside rollbacked sessions.
4. **Write E2E Tests**: Write Playwright workflows to test critical UI routes and user actions.

## 6. Repository Standards
- We enforce a minimum 90% statement coverage on backend modules.
- Financial and sports math functions (like Kelly Sizing) require 100% statement coverage.

## 7. Examples

### High-Fidelity Math Unit Test with Pytest Parameterization
```python
import pytest

def calculate_implied_probability(odds: float) -> float:
    if odds <= 1.0:
        raise ValueError("Odds must be greater than 1.0")
    return 1.0 / odds

@pytest.mark.parametrize("odds,expected", [
    (2.0, 0.50),
    (4.0, 0.25),
    (1.25, 0.80),
])
def test_implied_probability_calculation(odds: float, expected: float) -> None:
    assert calculate_implied_probability(odds) == pytest.approx(expected)

def test_invalid_odds_raises_error() -> None:
    with pytest.raises(ValueError, match="Odds must be greater than 1.0"):
        calculate_implied_probability(0.8)
```

## 8. Best Practices
- Keep tests completely deterministic; always seed random number generators inside testing scripts.
- Isolate test runs from external APIs by mock-routing outbound requests.

## 9. Anti-patterns
- **Test Pollution**: Writing integration tests that mutate production database tables.

## 10. Security Considerations
- Secure credentials; tests must not utilize or leak real production credentials or API keys.

## 11. Performance Considerations
- Run unit tests concurrently using pytest-xdist to accelerate CI pipeline steps.

## 12. Testing Strategy
- Execute unit and integration tests automatically on code commit steps.

## 13. Review Checklist
- [ ] Does backend test coverage meet the mandatory 90% threshold?
- [ ] Are all mock models isolated from external web resources?

## 14. Common Mistakes
- Skipping assertions and simply executing code to fake test coverage metrics.

## 15. Future Improvements
- Implement automated mutation testing to evaluate the quality of our verification assertions.

## 16. Revision History
- **v1.0.0**: Established unified testing standards.

## 17. Related References
- Skills: [Unit Testing](unit-testing.md), [Integration Testing](integration-testing.md), [Playwright](playwright.md)
- Rules: [Testing Rules](../rules/testing-rules.md)
