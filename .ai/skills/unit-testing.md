# 🧪 Pure Unit Testing Standards

## 1. Purpose
To ensure isolated routines, business functions, and calculations operate perfectly.

## 2. When to Use
- Testing mathematical functions, portfolio allocations, and specific state transitions.

## 3. When NOT to Use
- Verifying database transactions, routing connections, or user browser flows.

## 4. Architecture
```
[ Pure Logic Block ] <--- [ Mock Dependencies / Inputs ] <--- [ Assert Outputs Match ]
```

## 5. Step-by-Step Implementation
1. **Isolate Logic**: Ensure the function has no side effects or external queries.
2. **Setup Test Cases**: Build distinct inputs covering bounds and edge scenarios.
3. **Execute Assertions**: Compare returned metrics with mathematically expected values.

## 6. Repository Standards
- Target a minimum of 90% unit test coverage for all core analytical calculation modules.
- Ensure unit tests execute fast and run in-memory with zero network actions.

## 7. Examples

### Python Math Calculation Test Case
```python
import pytest

def calculate_kelly_fraction(odds: float, probability: float) -> float:
    if odds <= 1.0 or probability <= 0.0:
        return 0.0
    return ((probability * odds) - 1.0) / (odds - 1.0)

def test_calculate_kelly_fraction_win_edge():
    # odds = 2.0 (Even), prob = 0.60 (60%) -> Kelly = (1.2 - 1)/1 = 0.20
    fraction = calculate_kelly_fraction(2.0, 0.60)
    assert fraction == pytest.approx(0.20)

def test_calculate_kelly_fraction_no_edge():
    fraction = calculate_kelly_fraction(2.0, 0.40)
    assert fraction <= 0.0
```

## 8. Best Practices
- Standardize on Triple-A: Arrange, Act, Assert.
- Keep test names descriptive, outlining exact behavior expectations (e.g. `test_should_return_zero_when_negative`).

## 9. Anti-patterns
- **Mocking Extensively**: Over-mocking standard helper classes, creating tests that assert nothing about real operations.

## 10. Security Considerations
- Validate that input validation rules throw standard exceptions on hostile boundaries.

## 11. Performance Considerations
- Ensure tests execute in milliseconds to keep developers running them frequently.

## 12. Testing Strategy
- Run unit test suites locally on every file save and on all code branches pre-commit.

## 13. Review Checklist
- [ ] Are all edge parameters and empty state bounds verified?
- [ ] Does the test run completely in-memory without external database calls?

## 14. Common Mistakes
- Adding database database dependencies to unit tests, turning them into slow integration tests.

## 15. Future Improvements
- Set up mutation testing to evaluate the real quality of test assertions.

## 16. Revision History
- **v1.0.0**: Outlined platform unit testing rules.

## 17. Related References
- Skills: [Testing](testing.md), [Integration Testing](integration-testing.md)
