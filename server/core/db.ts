import fs from "fs";
import path from "path";
import { createLogger, Logger } from "./logger";
import { config } from "./config";

const logger = createLogger("RelationalDB");

export interface DBUser {
  user_id: string;
  email: string;
  password_hash: string;
  role: "admin" | "trader";
  created_at: string;
}

export interface DBFixture {
  fixture_id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff: string;
  status: "scheduled" | "in_play" | "finished";
  home_score?: number;
  away_score?: number;
}

export interface DBOdds {
  time: string;
  fixture_id: string;
  bookmaker: string;
  home_win: number;
  draw: number;
  away_win: number;
}

export interface DBSlip {
  slip_id: string;
  user_id: string;
  fixture_id: string;
  selection: "home" | "draw" | "away";
  odds: number;
  stake: number;
  expected_value: number;
  status: "pending" | "won" | "lost";
  created_at: string;
}

export interface DBBankroll {
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string;
}

export interface Schema {
  users: DBUser[];
  fixtures: DBFixture[];
  odds_timeseries: DBOdds[];
  slips: DBSlip[];
  bankroll: DBBankroll[];
}

const defaultSchema: Schema = {
  users: [],
  fixtures: [
    {
      fixture_id: "fix-101",
      league: "English Premier League",
      home_team: "Arsenal",
      away_team: "Chelsea",
      kickoff: "2026-07-01T19:00:00Z",
      status: "scheduled"
    },
    {
      fixture_id: "fix-102",
      league: "English Premier League",
      home_team: "Manchester City",
      away_team: "Liverpool",
      kickoff: "2026-07-02T19:30:00Z",
      status: "scheduled"
    },
    {
      fixture_id: "fix-103",
      league: "South African Premier Division",
      home_team: "Mamelodi Sundowns",
      away_team: "Kaizer Chiefs",
      kickoff: "2026-07-03T18:00:00Z",
      status: "scheduled"
    }
  ],
  odds_timeseries: [
    {
      time: "2026-06-30T22:00:00Z",
      fixture_id: "fix-101",
      bookmaker: "Betway SA",
      home_win: 1.85,
      draw: 3.60,
      away_win: 4.20
    },
    {
      time: "2026-06-30T22:05:00Z",
      fixture_id: "fix-101",
      bookmaker: "Sportingbet",
      home_win: 1.87,
      draw: 3.55,
      away_win: 4.15
    },
    {
      time: "2026-06-30T22:00:00Z",
      fixture_id: "fix-102",
      bookmaker: "Betway SA",
      home_win: 2.10,
      draw: 3.40,
      away_win: 3.10
    }
  ],
  slips: [],
  bankroll: []
};

export class RelationalDB {
  private filePath: string;
  private data: Schema;

  constructor() {
    this.filePath = path.resolve(config.databasePath);
    this.data = { ...defaultSchema };
    this.initialize();
  }

  private initialize() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created database directory: "${dir}"`);
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.data = JSON.parse(raw);
        logger.info("Database loaded successfully from file-storage");
      } else {
        this.save();
        logger.info("New database file initialized with defaults");
      }
    } catch (err: any) {
      logger.error("Failed to initialize Relational Database. Falling back to memory-only.", { error: err.message });
    }
  }

  private save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath); // Atomic swap
    } catch (err: any) {
      logger.error("Failed to persist database disk write transaction", { error: err.message });
    }
  }

  // Generic access methods simulating a Relational repository
  public selectAll<K extends keyof Schema>(table: K): Schema[K] {
    return this.data[table];
  }

  public selectOne<K extends keyof Schema>(table: K, field: string, value: any): any | null {
    const list = this.data[table] as any[];
    return list.find(row => row[field] === value) || null;
  }

  public insert<K extends keyof Schema>(table: K, record: any): any {
    // Unique constraints check
    if (table === "users") {
      const existing = this.selectOne("users", "email", record.email);
      if (existing) {
        throw new Error(`Unique constraint violation: User with email "${record.email}" already exists`);
      }
    }

    const list = this.data[table] as any[];
    list.push(record);
    this.save();
    
    logger.debug(`INSERT transaction completed successfully on table: "${table}"`, { id: record[Object.keys(record)[0]] });
    return record;
  }

  public update<K extends keyof Schema>(table: K, primaryKeyField: string, keyValue: any, updates: Partial<any>): any {
    const list = this.data[table] as any[];
    const idx = list.findIndex(row => row[primaryKeyField] === keyValue);
    if (idx === -1) {
      throw new Error(`Record with ${primaryKeyField} = "${keyValue}" not found in table "${table}"`);
    }

    list[idx] = { ...list[idx], ...updates };
    this.save();
    
    logger.debug(`UPDATE transaction completed successfully on table: "${table}"`, { key: keyValue });
    return list[idx];
  }

  public delete<K extends keyof Schema>(table: K, primaryKeyField: string, keyValue: any): boolean {
    const list = this.data[table] as any[];
    const idx = list.findIndex(row => row[primaryKeyField] === keyValue);
    if (idx === -1) {
      return false;
    }

    list.splice(idx, 1);
    this.save();
    logger.debug(`DELETE transaction completed successfully on table: "${table}"`, { key: keyValue });
    return true;
  }

  // Helper for fast queries
  public queryFixturesWithLatestOdds(): any[] {
    const fixtures = this.data.fixtures;
    const odds = this.data.odds_timeseries;

    return fixtures.map(f => {
      // Find all odds for this fixture, sort by time descending
      const fixOdds = odds
        .filter(o => o.fixture_id === f.fixture_id)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      return {
        ...f,
        latest_odds: fixOdds[0] || null
      };
    });
  }

  public getStats(): Record<string, number> {
    return {
      users: this.data.users.length,
      fixtures: this.data.fixtures.length,
      odds_timeseries: this.data.odds_timeseries.length,
      slips: this.data.slips.length,
      bankroll: this.data.bankroll.length,
    };
  }
}

export const db = new RelationalDB();
