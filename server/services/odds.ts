import { IMatchRepository, IOddsRepository } from "../repositories/types";
import { oddsCache } from "../core/cache";
import { eventBus } from "../core/eventBus";
import { createLogger } from "../core/logger";
import { matchRepository } from "../repositories/match";
import { oddsRepository } from "../repositories/odds";

const logger = createLogger("OddsService");

export class OddsService {
  constructor(
    private matchRepo: IMatchRepository,
    private oddsRepo: IOddsRepository
  ) {}

  public getAllFixtures() {
    return this.matchRepo.getAllFixtures();
  }

  public getFixtureById(id: string) {
    return this.matchRepo.getFixtureById(id);
  }

  public getFixturesWithOdds() {
    const cacheKey = "fixtures_with_odds";
    const cached = oddsCache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const fixtures = this.matchRepo.queryFixturesWithLatestOdds();
    oddsCache.set(cacheKey, fixtures, 30); // Cache for 30 seconds
    return fixtures;
  }

  public insertOdds(odds: any) {
    const record = this.oddsRepo.insertOdds(odds);
    eventBus.publish("OddsUpdated", record);
    oddsCache.invalidate("fixtures_with_odds");
    return record;
  }
}

export const oddsService = new OddsService(matchRepository, oddsRepository);
