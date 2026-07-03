# 🧠 Domain-Driven Design (DDD) Standards

## 1. Purpose
To design software models that closely reflect the real-world business domain and rules.

## 2. When to Use
- Designing complex sports betting platforms, portfolio engines, and value systems.

## 3. When NOT to Use
- Developing simple, generic layout utilities, forms, or basic CRUD microservices.

## 4. Architecture
```
[ Bounded Contexts ] ---> [ Aggregates / Boundaries ] ---> [ Entities & Value Objects ]
```

## 5. Step-by-Step Implementation
1. **Identify Contexts**: Define clear system boundaries (e.g., Predictions, Bankroll, Analytics).
2. **Create Entities**: Design domain models with stable, unique identities.
3. **Value Objects**: Implement immutable values without distinct identity states.
4. **Aggregate Roots**: Route all external access through designated parent entity gates.

## 6. Repository Standards
- Domain files must use the language of the business domain (Ubiquitous Language).
- State changes on entities must be initiated via explicit domain methods, not generic setters.

## 7. Examples

### Value Object and Entity in Python
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    """Value object representing currency value."""
    amount: float
    currency: str = "ZAR"

class AccountEntity:
    """Entity representation of a user's wallet account."""
    def __init__(self, account_id: str, balance: Money) -> None:
        self.id = account_id
        self._balance = balance

    def deposit(self, amount: Money) -> None:
        if amount.amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self._balance = Money(self._balance.amount + amount.amount)
        
    @property
    def current_balance(self) -> Money:
        return self._balance
```

## 8. Best Practices
- Keep domain entities clean and free of database imports and external API integrations.
- Always validate business constraints at the boundary of aggregate models.

## 9. Anti-patterns
- **Anemic Domain Models**: Design of domain objects with simple fields and zero business behavior.

## 10. Security Considerations
- Keep validation rules strictly enforced inside domain entities to prevent unauthorized states.

## 11. Performance Considerations
- Keep aggregate boundaries small to prevent transaction lock issues in database tables.

## 12. Testing Strategy
- Write pure unit tests to verify domain behaviors under different business states.

## 13. Review Checklist
- [ ] Are aggregate boundaries clearly defined?
- [ ] Do domain entities protect their internal state from outside modification?

## 14. Common Mistakes
- Leaking infrastructure frameworks or SQLAlchemy definitions into domain model classes.

## 15. Future Improvements
- Move context mappings to central event streams to handle multi-context communications easily.

## 16. Revision History
- **v1.0.0**: Defined platform Domain-Driven Design standards.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [Backend](backend.md)
