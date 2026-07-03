# 🛡️ Secure Software Engineering Standards

## 1. Purpose
To guarantee secure coding practices, protecting the platform against data leaks, injection attacks, and authorization breaches.

## 2. When to Use
- Implementing user login flows, encrypting sensitive fields, managing environment settings, or writing security rules.

## 3. When NOT to Use
- Writing standalone visual formatting styles with zero system interactions.

## 4. Architecture
We use a layered defense model, validating and securing data at every boundary:
```
[ Client Browser ] -> [ HTTPS / CORS Gateway ] -> [ JWT Auth Middleware ] -> [ Parameterized DB Query ]
```

## 5. Step-by-Step Implementation
1. **Validate Ingress**: Require HTTPS, set secure CORS policies, and sanitize inputs.
2. **Enforce Authorization**: Guard routes with JWT verification middleware.
3. **Secure Storage**: Use strong hashing (Argon2id) for passwords and encrypt private values in Postgres.
4. **Hide Secrets**: Store credentials strictly in environment files on the server side.

## 6. Repository Standards
- Direct execution of raw SQL strings is strictly banned. Use SQLAlchemy parameterized query models.
- All endpoints are closed and require authentication unless explicitly whitelisted.

## 7. Examples

### Secure Password Sizer and JWT Validator
```python
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
from passlib.context import CryptContext

# Set up strong Argon2id hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class SecurityManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256") -> None:
        self.secret_key = secret_key
        self.algorithm = algorithm

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return pwd_context.verify(password, hashed_password)

    def generate_token(self, payload: Dict[str, Any], expires_delta: int = 15) -> str:
        data = payload.copy()
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
        data.update({"exp": expire})
        return jwt.encode(data, self.secret_key, algorithm=self.algorithm)

    def decode_token(self, token: str) -> Dict[str, Any]:
        try:
            return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.PyJWTError:
            raise ValueError("Invalid authentication token")
```

## 8. Best Practices
- Never commit private API credentials or keys into git repositories. Use `.env.example` to document variables.
- Set secure HTTP-only cookies to handle user refresh token exchanges.

## 9. Anti-patterns
- **Client-Side Storage of Keys**: Initializing third-party APIs or gateways on the frontend, exposing secrets in the browser.

## 10. Security Considerations
- Limit login attempt rates to block brute-force password guessing.

## 11. Performance Considerations
- Cache JWT verification results in Redis (with short TTLs) for high-frequency WebSocket handlers.

## 12. Testing Strategy
- Write explicit penetration tests verifying that unauthenticated requests are blocked at API gates.

## 13. Review Checklist
- [ ] Are all database queries parameterized?
- [ ] Do password hashing operations use high-entropy configurations?

## 14. Common Mistakes
- Utilizing vulnerable, outdated cryptography algorithms (like MD5 or SHA1) for secure system hashing.

## 15. Future Improvements
- Integrate hardware security modules (HSM) to handle encryption key rotations.

## 16. Revision History
- **v1.0.0**: Outlined modern secure development practices.

## 17. Related References
- Skills: [Backend](backend.md), [FastAPI](fastapi.md)
- Rules: [Security Rules](../rules/security-rules.md)
