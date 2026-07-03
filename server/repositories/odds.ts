import { IOddsRepository } from "./types";
import { DBOdds, db } from "../core/db";

export class OddsRepository implements IOddsRepository {
  public getAllOdds(): DBOdds[] {
    return db.selectAll("odds_timeseries");
  }

  public insertOdds(odds: DBOdds): DBOdds {
    return db.insert("odds_timeseries", odds);
  }

  public getOddsForFixture(fixtureId: string): DBOdds[] {
    return db.selectAll("odds_timeseries")
      .filter(o => o.fixture_id === fixtureId)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }
}

export const oddsRepository = new OddsRepository();
