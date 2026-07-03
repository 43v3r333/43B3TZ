# OpenAPI Subsystem Specifications

## 1. REST Endpoints

### 1.1 Ingress Login (\`POST /api/v1/auth/login\`)
- **Payload**:
  \`\`\`json
  {
    "email": "user@domain.com",
    "password": "SecurePassword"
  }
  \`\`\`
- **Response (HTTP 200)**:
  - Sets HttpOnly secure cookie containing the RS256 JWT access token.
  - Returns user metadata parameters.

### 1.2 Fetch Active Value Bets (\`GET /api/v1/value-bets\`)
- **Headers**: Authorization Cookie.
- **Query Params**: \`min_edge\`, \`limit\` (max 100).
- **Response**: Array of active fixtures presenting positive Expected Value edge with associated Kelly stake recommendations.

---

## 2. WebSocket Feeds

### 2.1 Live Edge Feed (\`WSS /api/v1/feed/live\`)
- **Description**: Real-time bi-directional streaming of market odds shifts and freshly calculated Kelly stakes.
