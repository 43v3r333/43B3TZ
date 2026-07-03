# Database Subsystem Contract

## 1. Metadata
* **Purpose**: Governs relational and timeseries database structures, indexing guidelines, migrations, and partition constraints.
* **Version**: `v1.0.0`
* **Owner**: `Database Architect` & `PostgreSQL Engineer`
* **Compatibility Policy**: All database schema migrations must be strictly forward-compatible. Dropping columns or changing types of existing fields in a single release is prohibited.
* **Breaking-Change Policy**: Schema modifications that interrupt running queries require dual-column writing strategies and an official deprecation period before cleanup.
* **Migration Strategy**: Version-controlled migrations managed through Drizzle/SQLAlchemy. Migration tasks run as single-transaction operations on deployment gates.

---

## 2. Table Schemas & Partition Governance

### 2.1 Core Relational Structure: Fixtures (`fixtures`)
Stores basic metadata for sports fixtures.

```sql
CREATE TABLE fixtures (
    fixture_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league VARCHAR(100) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    kickoff TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_play', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 High-Frequency Timeseries: Odds History (`odds_timeseries`)
A TimescaleDB hypertable tracking odd adjustments.

```sql
CREATE TABLE odds_timeseries (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    fixture_id UUID REFERENCES fixtures(fixture_id) ON DELETE CASCADE,
    bookmaker VARCHAR(50) NOT NULL,
    home_win DECIMAL(5,2) NOT NULL,
    draw DECIMAL(5,2) NOT NULL,
    away_win DECIMAL(5,2) NOT NULL
);

-- Hypertable Definition
SELECT create_hypertable('odds_timeseries', 'time');
```

---

## 3. Validation Rules
1. **Precision Checking**: All odd inputs and profit margins must be stored using high-precision decimal numbers, never standard floating-point types.
2. **Foreign Key Locking**: Every record referencing a fixture must declare cascade deletion properties to prevent orphaned indices.
3. **Partition Intervals**: Hypertables are partitioned strictly into 7-day increments to optimize query scanning windows.

---

## 4. Examples

### Typical Safe Migration Script (Drizzle / SQL)
```sql
-- Migration: Add market active flag without locking active table
ALTER TABLE fixtures ADD COLUMN is_active_market BOOLEAN DEFAULT TRUE NOT NULL;
```

### Migration Rollback Standard
```sql
-- Rollback Migration: Safely remove column
ALTER TABLE fixtures DROP COLUMN is_active_market;
```
