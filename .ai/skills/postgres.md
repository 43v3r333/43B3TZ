# 🗄️ PostgreSQL Database Performance Standards

## 1. Purpose
To outline architectural and operational standards for PostgreSQL data models, indices, and partitioned timeseries storage.

## 2. When to Use
- Managing structural tables, historical matches, portfolio histories, and high-frequency timeseries odds.

## 3. When NOT to Use
- Storing temporary fast session credentials (always routed to Redis).

## 4. Architecture
Our storage layout maps transaction logs to relational tables, while streaming odds target TimescaleDB hypertables:
```
                           [ Ingress Layer ]
                             /           \
             [ Relational Data ]       [ Timeseries Odds ]
                   |                           |
             [ standard PG ]             [ TimescaleDB ]
```

## 5. Step-by-Step Implementation
1. **Design Tables**: Set standard types, tracking creation and update times in UTC.
2. **Apply Indexes**: Choose standard indices (B-Tree) for lookups or partial indexes for specialized queries.
3. **Partition Timeseries**: Configure hypertable segment schedules for large high-frequency tables.

## 6. Repository Standards
- Relational tables use lowercase plural snake_case naming keys.
- Every relational table must include an auto-incrementing integer key named `id`.

## 7. Examples

### Creating standard table and TimescaleDB Hypertable
```sql
-- Create core matches table with optimal lookup indices
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at) WHERE is_deleted IS FALSE;

-- Create timeseries odds table partitioned by date
CREATE TABLE historical_odds (
    id SERIAL,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL,
    odds_home NUMERIC(5,2) NOT NULL,
    odds_draw NUMERIC(5,2) NOT NULL,
    odds_away NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id, recorded_at)
);

-- Convert to high-performance TimescaleDB hypertable
SELECT create_hypertable('historical_odds', 'recorded_at', chunk_time_interval => INTERVAL '7 days');
```

## 8. Best Practices
- Never use `SELECT *`. Always query exact required columns.
- Keep table constraints strictly validated at the database engine level (e.g., `CHECK (odds_home > 1.0)`).

## 9. Anti-patterns
- **Soft Delete Index Pollution**: Querying active records without an index that filters out deleted rows.

## 10. Security Considerations
- Limit database connection privileges; API connections should not possess DDL (schema-altering) capabilities.

## 11. Performance Considerations
- Configure foreign key targets with corresponding indexes to speed up cascading deletion lookups.

## 12. Testing Strategy
- Validate DB schema migrations using pytest and isolated test database instances.

## 13. Review Checklist
- [ ] Are numerical types sized properly (e.g. `NUMERIC` for precise finance formulas)?
- [ ] Are correct indexes applied for standard filter queries?

## 14. Common Mistakes
- Storing timestamps without explicit timezone references (`TIMESTAMP` instead of `TIMESTAMP WITH TIME ZONE`).

## 15. Future Improvements
- Automate TimescaleDB continuous aggregations to pre-calculate hourly match volume analytics.

## 16. Revision History
- **v1.0.0**: Defined base PostgreSQL and TimescaleDB configurations.

## 17. Related References
- Skills: [SQLAlchemy](sqlalchemy.md)
- Rules: [Database Rules](../rules/database-rules.md)
