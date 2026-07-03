# Comprehensive Security Specifications

## 1. Authentication and Identity Control
All user authentication loops strictly utilize the Argon2id hashing algorithm for passwords, preventing brute force or dictionary attacks.

### Token Signatures and Refresh
JWT tokens are signed asynchronously using RS256 private keys on the server. The secret parameters are never committed to repository.
- **Access Token Life**: Exactly 15 minutes.
- **Storage Gate**: Stored strictly in HttpOnly, SameSite=Strict cookies.

## 2. CORS Whitelist Policy
\`\`\`typescript
export const CORS_WHITELIST = [
  "https://platform.internal",
  "http://localhost:3000" // Dev context only
];
\`\`\`
