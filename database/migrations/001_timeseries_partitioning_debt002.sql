-- database/migrations/001_timeseries_partitioning_debt002.sql
-- Migration Name: Timeseries Hypertable Partitioning for Odds Logs
-- Debt Reference: DEBT-002 (Missing timeseries partitioning in raw match logs)
-- Target Platform: PostgreSQL with TimescaleDB Extension
-- Owner: @db-lead
-- Status: DRAFT

-- 1. Enable TimescaleDB Extension if not already enabled in target cloud Postgres database
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 2. Rename existing simple odds_timeseries table if it exists for safe migration fallback
-- ALTER TABLE IF EXISTS odds_timeseries RENAME TO odds_timeseries_old;

-- 3. Create the new Partitioned/Hypertable Structure for Odds Timeseries
CREATE TABLE IF NOT EXISTS odds_timeseries (
    time TIMESTAMPTZ NOT NULL,
    odds_id VARCHAR(128) NOT NULL,
    fixture_id VARCHAR(128) NOT NULL,
    bookmaker VARCHAR(128) NOT NULL,
    home_win NUMERIC(6, 2) NOT NULL,
    draw NUMERIC(6, 2) NOT NULL,
    away_win NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (time, odds_id, fixture_id) -- In hypertables, primary key must include the partitioning time column
);

-- 4. Convert the table into a TimescaleDB Hypertable partitioned by 'time' in 1-day intervals
SELECT create_hypertable('odds_timeseries', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- 5. Establish Indexes for fast temporal and structural querying
CREATE INDEX IF NOT EXISTS idx_odds_fixture_time ON odds_timeseries (fixture_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_odds_bookmaker_time ON odds_timeseries (bookmaker, time DESC);

-- 6. Configure Compression Policy (Aggressive compression for historical rows > 7 days to manage disk space)
ALTER TABLE odds_timeseries SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'fixture_id, bookmaker',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('odds_timeseries', INTERVAL '7 days', if_not_exists => TRUE);

-- 7. Configure Data Retention Policy (Prune partition chunks older than 180 days to head off storage limits)
SELECT add_retention_policy('odds_timeseries', INTERVAL '180 days', if_not_exists => TRUE);

-- 8. Migration data copying block (Optional, run as single transaction block on live deploy)
-- BEGIN;
-- INSERT INTO odds_timeseries (time, odds_id, fixture_id, bookmaker, home_win, draw, away_win, created_at)
-- SELECT time, md5(fixture_id || bookmaker || time::text), fixture_id, bookmaker, home_win, draw, away_win, time
-- FROM odds_timeseries_old
-- ON CONFLICT DO NOTHING;
-- COMMIT;
