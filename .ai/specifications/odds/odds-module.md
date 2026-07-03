# Odds Module Specification

## 1. Purpose
Tracks and parses real-time sports odds prices across multiple bookmaker APIs.

## 2. Architecture & Data Flow
\`\`\`mermaid
graph LR
    ScrapeWorker[Asynchronous Scraper] -->|Fetch Odds| API[API Gateway]
    API -->|Write Hypertable| Timescale[(TimescaleDB Hypertable)]
    API -->|Publish Live Event| Redis[(Redis Pub/Sub)]
\`\`\`

## 3. High-Frequency Timeseries Schema
\`\`\`sql
CREATE TABLE odds_timeseries (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    fixture_id UUID REFERENCES fixtures(fixture_id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL,
    home_win DECIMAL(5,2) NOT NULL,
    draw DECIMAL(5,2) NOT NULL,
    away_win DECIMAL(5,2) NOT NULL
);
SELECT create_hypertable('odds_timeseries', 'time');
\`\`\`
