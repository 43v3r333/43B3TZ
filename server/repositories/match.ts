import { IMatchRepository } from "./types";
import { DBFixture, db } from "../core/db";

export class MatchRepository implements IMatchRepository {
  public getAllFixtures(): DBFixture[] {
    return db.selectAll("fixtures");
  }

  public getFixtureById(id: string): DBFixture | null {
    return db.selectOne("fixtures", "fixture_id", id);
  }

  public insertFixture(fixture: DBFixture): DBFixture {
    return db.insert("fixtures", fixture);
  }

  public updateFixture(id: string, updates: Partial<DBFixture>): DBFixture {
    return db.update("fixtures", "fixture_id", id, updates);
  }

  public deleteFixture(id: string): boolean {
    return db.delete("fixtures", "fixture_id", id);
  }

  public queryFixturesWithLatestOdds(): any[] {
    return db.queryFixturesWithLatestOdds();
  }
}

export const matchRepository = new MatchRepository();
