# Security Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates cryptographic guidelines, CORS whitelist models, TLS settings, encryption parameters, and security headers.
* **Version**: `v1.0.0`
* **Owner**: `Security Engineer` & `Compliance Reviewer`
* **Compatibility Policy**: Security protocols cannot be downgraded. We strictly support backward compatibility in client tokens unless a security vulnerability necessitates immediate session invalidation.
* **Breaking-Change Policy**: Changing token encryption methods or rotating root verification certificates requires complete session re-authentication.
* **Migration Strategy**: Gradual re-hashing of user passwords during next login events when hashing configurations are updated.

---

## 2. Cryptographic & CORS Standards

### 2.1 Password Hashing Configuration
Passwords must be hashed using Argon2id with strict parameters:
```json
{
  "algorithm": "argon2id",
  "parameters": {
    "memory_cost": 65536,
    "time_cost": 3,
    "parallelism": 4,
    "hash_length": 32,
    "salt_length": 16
  }
}
```

### 2.2 Token Signature Standard
JWTs are issued and validated strictly using asymmetric RS256 algorithms.

```json
{
  "token_type": "JWT",
  "signature_algorithm": "RS256",
  "expiration_minutes": 15,
  "refresh_token_expiration_days": 30
}
```

---

## 3. Validation Rules
1. **No Wildcard CORS**: Cross-Origin Resource Sharing (CORS) configurations must specify explicit origin matches, strictly prohibiting wide wildcard patterns `*` on authenticated endpoints.
2. **TLS Standard**: All external HTTPS routes must enforce TLS 1.3 or higher, rejecting legacy SSL/TLS versions.
3. **Secret Vaulting**: API keys, credentials, and database passwords must never be stored inside source files or container definitions; they must be retrieved strictly from Secret Managers at runtime.

---

## 4. Examples

### Safe CORS Configuration Matrix
```typescript
export const CORS_WHITELIST = [
  "https://platform.internal",
  "https://dashboard.platform.internal",
  "http://localhost:3000" // Allowed strictly in development
];
```
