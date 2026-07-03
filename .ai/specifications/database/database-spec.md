# Database Specifications & Data Dictionary

## 1. Data Dictionary

### Table: \`users\`
Relational table storing user profiles and credential signatures.
- **user_id** (UUID, PK): Auto-generated unique identifier.
- **email** (VARCHAR, Unique, Indexed): User email address.
- **password_hash** (VARCHAR): Argon2id password hash.
- **created_at** (TIMESTAMP): Creation timestamp.

### Table: \`fixtures\`
Relational table tracking soccer fixtures.
- **fixture_id** (UUID, PK): Auto-generated unique identifier.
- **league** (VARCHAR, Indexed): League name.
- **home_team** (VARCHAR): Home team name.
- **away_team** (VARCHAR): Away team name.
- **kickoff** (TIMESTAMP, Indexed): Scheduled kickoff.
- **status** (VARCHAR): Scheduled, in_play, or finished.

### Table: \`odds_timeseries\`
TimescaleDB hypertable for high-frequency price tracking.
- **time** (TIMESTAMP, PK): Price snapshot time.
- **fixture_id** (UUID, FK): Reference to fixtures.
- **bookmaker** (VARCHAR): Bookmaker name.
- **home_win** (DECIMAL): Home win odds.
- **draw** (DECIMAL): Draw odds.
- **away_win** (DECIMAL): Away win odds.

---

## 2. Data Archiving & Retention Policy
- High-frequency \`odds_timeseries\` records older than 90 days are compressed using TimescaleDB compression policies to minimize storage CPU overheads.
- Detailed slip histories are preserved indefinitely for compliance and auditing.
