# Authentication Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates user login pathways, OAuth2 integrations, token lifetimes, and stateless cookie specifications.
* **Version**: `v1.0.0`
* **Owner**: `Security Architect` & `API Ingress Reviewer`
* **Compatibility Policy**: Decoded token claims must support optional extensions. Adding a new scope should not break existing microservice parsing layers.
* **Breaking-Change Policy**: Modifying primary claims keys or restricting access scopes globally triggers an immediate authentication session clearance.
* **Migration Strategy**: Rollout new signing keys alongside old verification keys to support active sessions during validation upgrades.

---

## 2. Authentication Payload & Claims Schema

### 2.1 Schema: Decoded Access Token Claims
Represents the standard claims payload contained inside an active session token.

```json
{
  "type": "object",
  "required": ["sub", "email", "roles", "permissions", "iat", "exp"],
  "properties": {
    "sub": { "type": "string", "format": "uuid", "description": "Unique user account ID" },
    "email": { "type": "string", "format": "email" },
    "roles": {
      "type": "array",
      "items": { "type": "string", "enum": ["Admin", "Trader", "Analyst", "Reader"] }
    },
    "permissions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "iat": { "type": "integer", "description": "Issued at epoch timestamp" },
    "exp": { "type": "integer", "description": "Expiration epoch timestamp" }
  }
}
```

---

## 3. Validation Rules
1. **Short-lived Access**: JWT access tokens must expire exactly `15 minutes` after issue, forcing client applications to execute silent background updates via secure refresh pathways.
2. **HttpOnly Cookies**: Web client sessions must be persisted strictly inside `HttpOnly`, `SameSite=Strict`, `Secure` cookies to eliminate XSS token extractions.
3. **Login Throttling**: Authenticated logins must be throttled using sliding-window rate limiters capped at a maximum of `5 attempts per minute per IP`.

---

## 4. Examples

### Typical JWT Payload Example
```json
{
  "sub": "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
  "email": "trader@platform.internal",
  "roles": ["Trader"],
  "permissions": ["read:predictions", "write:slips", "write:bankroll"],
  "iat": 1782806400,
  "exp": 1782807300
}
```
