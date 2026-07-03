# Fixtures Module Specification

## 1. Purpose
The Fixtures Module manages the lifecycle, storage, and retrieval of sporting match fixtures across all tracked sports leagues.

## 2. Business Goals
- Retain an absolute, indexed list of scheduled, in-play, and settled sport fixtures.
- Expose low-latency search boundaries for other systems (predictions, odds parser).

## 3. Database Schema
\`\`\`sql
CREATE TABLE fixtures (
    fixture_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league VARCHAR(100) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    kickoff TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_play', 'finished'))
);
CREATE INDEX idx_fixtures_kickoff_league ON fixtures(kickoff, league);
\`\`\`

## 4. API Endpoint (\`GET /api/v1/fixtures\`)
- **Query Params**: `league`, `status`, `limit` (max 100).
- **Response**: Array of structured fixtures with date formats in ISO 8601.
