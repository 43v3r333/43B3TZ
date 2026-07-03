# 🐍 Enterprise Python Standards

## 1. Purpose
To ensure clean, structured, type-safe, and highly performant Python development.

## 2. When to Use
- Writing any Python service, machine learning script, Celery worker task, or DB model.

## 3. When NOT to Use
- Developing client-side user experience scripts (handled strictly via React).

## 4. Architecture
Python modules inside our system must strictly utilize layered separation of concerns:
```
[ Pydantic DTO Validation ] -> [ Service / Use Case ] -> [ Repository (SQLAlchemy) ]
```

## 5. Step-by-Step Implementation
1. **Type Annotation**: Always write precise types for function parameters and returned results.
2. **DTO Verification**: Declare input and output objects using Pydantic BaseModel configurations.
3. **Exception Strategy**: Create explicit custom domain exceptions subclassing custom system errors.

## 6. Repository Standards
- Code formatting is enforced strictly via `Ruff` and `Black`.
- All functions must have docstrings specifying parameters, output types, and exception profiles.

## 7. Examples

### Clean Type-Safe Service
```python
from typing import Dict, Any, List
from pydantic import BaseModel, Field

class CalibrationInput(BaseModel):
    raw_probabilities: List[float] = Field(..., min_items=1)
    overround: float = Field(..., gt=1.0)

class CalibratedOutput(BaseModel):
    normalized_probabilities: List[float]

class CalibratorService:
    """Mathematical utility service to remove overround and normalize probabilities."""

    def calibrate(self, data: CalibrationInput) -> CalibratedOutput:
        total = sum(data.raw_probabilities)
        if total == 0:
            raise ValueError("Raw probabilities sum cannot be zero.")
        normalized = [p / total for p in data.raw_probabilities]
        return CalibratedOutput(normalized_probabilities=normalized)
```

## 8. Best Practices
- Prefer composition over deep inheritance.
- Always utilize context managers (`with` statements) for file handles or database transactions.

## 9. Anti-patterns
- **Implicit any (`Any` abuse)**: Declaring major variables as unstructured dicts instead of typed Pydantic models.

## 10. Security Considerations
- Never execute dynamic command lines using raw input variables via subprocess interfaces.

## 11. Performance Considerations
- Use list comprehensions over nested `for` loops for faster execution.
- Minimize object instantiation inside high-frequency timeseries processing loops.

## 12. Testing Strategy
- Unit-test mathematical services with `pytest` parameterization matrices.

## 13. Review Checklist
- [ ] Are type-hints fully populated?
- [ ] Are Pydantic objects utilized to filter incoming API JSON structures?

## 14. Common Mistakes
- Mutating default parameters inside class or function headers (e.g. `def do_work(arg=[])`).

## 15. Future Improvements
- Implement Cython or Rust integrations for performance-critical sports analytical loops.

## 16. Revision History
- **v1.0.0**: Defined strict typing standards aligned with Python 3.11+.

## 17. Related References
- Skills: [FastAPI](fastapi.md), [SQLAlchemy](sqlalchemy.md)
- Rules: [Coding Rules](../rules/coding-rules.md)
