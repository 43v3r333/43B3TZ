# 🛡️ System Security Specifications

This manual outlines the threat models, encryption standards, and secure coding practices for our platform.

---

## 🛡️ Core Threat Models & Mitigations

### 1. SQL Injection Risks
* **Threat**: Unsanitized query vectors exposing sensitive database rows.
* **Mitigation**: All database queries must proceed through SQLAlchemy's ORM or parameterized compiler models. Hand-written inline raw SQL is strictly forbidden.

### 2. Over-exposure Bankroll Risks
* **Threat**: Aggressive mathematical allocations causing severe portfolio drawdowns.
* **Mitigation**: The system enforces Fractional Kelly Criterion multipliers and limits single stakes to under 5.0% of the total portfolio capital.

---

## 🔒 Authentication & Data Protection

- **OAuth2 JWT Token Authorization**: Endpoints allowing slips logging or portfolio edits are secured behind cryptographically signed JSON Web Token filters.
- **Secure Cryptographic Hashing**: User passwords are encrypted using **Argon2id** hashing before persistence.
- **HTTPS Enforcement**: API servers are configured to reject plain text HTTP traffic, redirecting all incoming requests to secure HTTPS.
