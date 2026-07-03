import { eloEngine } from "../intelligence/elo/elo";
import { expectedGoalsEngine } from "../intelligence/xg/xg";
import { formEngine } from "../intelligence/form/form";
import { fatigueEngine } from "../intelligence/fatigue/fatigue";
import { weatherEngine } from "../intelligence/weather/weather";
import { refereeEngine } from "../intelligence/referees/referees";
import { marketIntelligenceEngine } from "../intelligence/market/market";
import { spiEngine } from "../intelligence/spi/spi";
import { qualityEngine } from "../intelligence/quality/quality";
import { teamIntelligenceEngine } from "../intelligence/teams/teams";
import { playerIntelligenceEngine } from "../intelligence/players/players";
import { intelligenceStorage } from "../intelligence/storage/storage";
import { intelligenceWorker } from "../intelligence/workers/workers";
import { intelligenceEventBus } from "../intelligence/events/events";
import { IntelligenceEventType } from "../intelligence/types";
import { etlStorage } from "../etl/storage/storage";
import { createLogger } from "../core/logger";

const logger = createLogger("IntelligenceTestSuite");

let iTestCount = 0;
let iFailCount = 0;

function iAssert(condition: boolean, name: string) {
  iTestCount++;
  if (condition) {
    logger.info(`✅ [INTEL-TEST] PASS: ${name}`);
  } else {
    iFailCount++;
    logger.error(`❌ [INTEL-TEST] FAIL: ${name}`);
  }
}

export async function runIntelligenceTestSuite() {
  logger.info("Initializing Sports Intelligence Platform Test Suite...");

  // Seed default dummy data in etlStorage to make sure Replay works
  etlStorage.clearAll();

  // Save raw/curated teams
  etlStorage.saveCurated("team", "team-1", {
    curatedId: "team-1",
    entityType: "team",
    data: { teamId: "team-1", name: "Arsenal", shortName: "ARS", code: "ARS", country: "England" },
    enrichment: {},
    qualityScore: 95,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  etlStorage.saveCurated("team", "team-2", {
    curatedId: "team-2",
    entityType: "team",
    data: { teamId: "team-2", name: "Chelsea", shortName: "CHE", code: "CHE", country: "England" },
    enrichment: {},
    qualityScore: 92,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Save players
  etlStorage.saveCurated("player", "player-1", {
    curatedId: "player-1",
    entityType: "player",
    data: { playerId: "player-1", name: "Bukayo Saka", position: "A", injured: false },
    enrichment: {},
    qualityScore: 98,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Save fixture
  etlStorage.saveCurated("fixture", "fix-1", {
    curatedId: "fix-1",
    entityType: "fixture",
    data: {
      fixtureId: "fix-1",
      competition: { competitionId: "comp-1", name: "Premier League", country: "England", type: "league", active: true },
      season: "2026",
      homeTeam: { teamId: "team-1", name: "Arsenal" },
      awayTeam: { teamId: "team-2", name: "Chelsea" },
      kickoff: "2026-07-01T20:00:00Z",
      status: "finished",
      homeScore: 3,
      awayScore: 1
    },
    enrichment: {},
    qualityScore: 96,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Save stats
  etlStorage.saveCurated("statistics", "stats-1", {
    curatedId: "stats-1",
    entityType: "statistics",
    data: {
      fixtureId: "fix-1",
      possessionHome: 58,
      possessionAway: 42,
      shotsOnGoalHome: 7,
      shotsOnGoalAway: 3,
      shotsOffGoalHome: 6,
      shotsOffGoalAway: 5,
      foulsHome: 11,
      foulsAway: 14,
      cornersHome: 5,
      cornersAway: 3
    },
    enrichment: {},
    qualityScore: 90,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Save weather
  etlStorage.saveCurated("weather", "we-1", {
    curatedId: "we-1",
    entityType: "weather",
    data: {
      fixtureId: "fix-1",
      temperatureCelcius: 14,
      humidityPercent: 78,
      windSpeedKph: 15,
      condition: "rainy"
    },
    enrichment: {},
    qualityScore: 85,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Save odds
  etlStorage.saveCurated("odds", "odds-1", {
    curatedId: "odds-1",
    entityType: "odds",
    data: {
      oddsId: "odds-1",
      fixtureId: "fix-1",
      providerName: "Bet365",
      timestamp: "2026-07-01T10:00:00Z",
      markets: [
        {
          marketId: "m1",
          name: "1X2",
          outcomes: [
            { name: "Home", odds: 1.85 },
            { name: "Draw", odds: 3.4 },
            { name: "Away", odds: 4.2 }
          ]
        }
      ]
    },
    enrichment: {},
    qualityScore: 94,
    version: 1,
    updatedAt: new Date().toISOString(),
    ingestionChain: ["Sportradar"]
  });

  // Reset/Clear Intelligence Storage
  intelligenceStorage.clearAll();

  // --- 1. ELO ENGINE TESTS ---
  const initialElo = eloEngine.getOrInitRating("team-1");
  iAssert(initialElo.rating === 1500, "Elo Engine seeds new teams with 1500 baseline");

  const eloResult = eloEngine.updateRatings("fix-1", "team-1", "team-2", 3, 1, 1.0);
  const homeNewElo = eloEngine.getOrInitRating("team-1");
  const awayNewElo = eloEngine.getOrInitRating("team-2");
  iAssert(homeNewElo.rating > 1500, "Elo rating increases for match winner");
  iAssert(awayNewElo.rating < 1500, "Elo rating decreases for match loser");
  iAssert(homeNewElo.history.length === 2, "Elo history snapshotted on updates");

  // Season Reset
  eloEngine.performSeasonReset(["team-1", "team-2"], 0.33);
  const resetElo = eloEngine.getOrInitRating("team-1");
  iAssert(resetElo.rating < homeNewElo.rating, "Season reset reverts ratings back toward the mean");

  // Promotion/Relegation handling
  eloEngine.handlePromotionRelegation(["team-promoted"], ["team-relegated"]);
  iAssert(eloEngine.getOrInitRating("team-promoted").rating === 1420, "Promoted team Elo aligned correctly");
  iAssert(eloEngine.getOrInitRating("team-relegated").rating === 1380, "Relegated team Elo aligned correctly");

  // --- 2. EXPECTED GOALS ENGINE TESTS ---
  const xgMetrics = expectedGoalsEngine.calculateMatchXg("fix-1", {
    shotsOnGoalHome: 7,
    shotsOnGoalAway: 3,
    shotsOffGoalHome: 6,
    shotsOffGoalAway: 5,
    homeScore: 3,
    awayScore: 1
  });
  iAssert(xgMetrics.xGHome > 0, "xG calculated for home team with shots");
  iAssert(xgMetrics.xGAway > 0, "xG calculated for away team with shots");
  iAssert(xgMetrics.expectedPointsHome > xgMetrics.expectedPointsAway, "Expected points favors higher xG generator");
  iAssert(xgMetrics.finishingEfficiencyHome > 1.0, "Finishing efficiency correctly calculated (actual goals / xG)");

  // --- 3. FORM ENGINE TESTS ---
  const formMetrics = formEngine.processNewMatch("team-1", "W", true, "team-2", "comp-1");
  iAssert(formMetrics.last5[0] === "W", "Form Engine adds latest outcome to chronological run list");
  iAssert(formMetrics.weightedForm > 50, "Winning team weighted form exceeds baseline of 50");
  iAssert(formMetrics.momentum > 50, "Recent victory yields upward trend momentum");

  // --- 4. FATIGUE ENGINE TESTS ---
  const fatigueHistory = [
    { kickoff: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), isAway: true, distanceKm: 800, timeZoneDiff: 1 }
  ];
  const fatigueMetrics = fatigueEngine.calculateFatigue("player-1", fatigueHistory);
  iAssert(fatigueMetrics.daysRest === 3, "Fatigue Engine calculates correct rest days");
  iAssert(fatigueMetrics.recoveryScore < 100, "Heavy travel and short rest penalizes player recovery score");

  // --- 5. WEATHER ENGINE TESTS ---
  const weatherNormalized = weatherEngine.normalizeWeather("fix-1", {
    temperatureCelcius: 4,
    humidityPercent: 88,
    windSpeedKph: 28,
    condition: "heavy rain"
  });
  iAssert(weatherNormalized.rain === true, "Weather engine identifies rainy conditions accurately");
  iAssert(weatherNormalized.pitchCondition === "poor" || weatherNormalized.pitchCondition === "waterlogged", "Pitch condition forecast adjusted by heavy rain and wind");
  iAssert(weatherNormalized.historicalWeatherImpact < 1.0, "Inclement weather reduces performance tactical index");

  // --- 6. REFEREE ENGINE TESTS ---
  const refereeMetrics = refereeEngine.processMatchStats("ref-1", "Michael Oliver", [
    { cardsYellowHome: 2, cardsYellowAway: 3, cardsRedHome: 0, cardsRedAway: 0, penaltiesHome: 0, penaltiesAway: 1, foulsHome: 12, foulsAway: 10, stoppageTime: 5 },
    { cardsYellowHome: 1, cardsYellowAway: 4, cardsRedHome: 1, cardsRedAway: 0, penaltiesHome: 1, penaltiesAway: 0, foulsHome: 9, foulsAway: 15, stoppageTime: 6 }
  ]);
  iAssert(refereeMetrics.cardsYellow === 5, "Average yellow cards calculated accurately");
  iAssert(refereeMetrics.historicalTendencies.strictnessScore > 50, "Strictness score reflects high card counts");

  // --- 7. MARKET INTELLIGENCE TESTS ---
  const marketMetrics = marketIntelligenceEngine.analyzeMarket("fix-1", [
    { timestamp: "2026-07-01T10:00:00Z", home: 1.95, draw: 3.4, away: 4.1 },
    { timestamp: "2026-07-01T19:00:00Z", home: 1.72, draw: 3.5, away: 4.8 }
  ]);
  iAssert(marketMetrics.openingOdds.home === 1.95, "Opening odds indexed perfectly");
  iAssert(marketMetrics.closingOdds.home === 1.72, "Closing odds indexed perfectly");
  iAssert(marketMetrics.oddsMovement.home === "down", "Downwards odds movement identified correctly");
  iAssert(marketMetrics.overround > 0, "Overround margin calculated successfully");
  iAssert(marketMetrics.closingLineValue > 0, "Closing Line Value (CLV) is positive for descending odds");

  // --- 8. SPI ENGINE TESTS ---
  const spiMetrics = spiEngine.calculateSpi("team-1");
  iAssert(spiMetrics.offenseRating > 0 && spiMetrics.defenseRating > 0, "SPI offense/defense ratings computed");
  iAssert(spiMetrics.spiScore > 0, "Overall Soccer Power Index computed");

  // --- 9. QUALITY ENGINE TESTS ---
  const qualityMetrics = qualityEngine.calculateQuality("team-1", 5, 12, 15, new Date().toISOString(), 0.05);
  iAssert(qualityMetrics.freshness > 95, "Freshly updated indicators score near 100 freshness index");
  iAssert(qualityMetrics.confidence > 70, "Aggregated confidence meets reliability parameters");

  // --- 10. HISTORICAL REPLAY TESTS ---
  // Trigger full deterministic replay of etlStorage dummy records
  const replayResult = await intelligenceWorker.performHistoricalReplay();
  iAssert(replayResult.success === true, "Full historical replay executes without error");
  iAssert(replayResult.stats.teams > 0, "Replay successfully populates team models from curated storage");
  iAssert(replayResult.stats.players > 0, "Replay successfully populates player models from curated storage");

  // Test point-in-time snapshot recovery
  const teamSnap = intelligenceStorage.getSnapshotAtTime("team-1", "team", new Date().toISOString());
  iAssert(teamSnap !== undefined, "Storage retrieves point-in-time historical snapshots correctly");
  iAssert(teamSnap?.version === 1, "Snapshot retrieves exact historical entity version");

  // --- 11. EVENT BUS TESTS ---
  let eventFired: any = false;
  intelligenceEventBus.subscribe(IntelligenceEventType.RatingUpdated, (evt) => {
    eventFired = true;
  });
  intelligenceEventBus.publish(IntelligenceEventType.RatingUpdated, "team-1", { rating: 1515 });
  iAssert(eventFired === true, "Intelligence Event Bus successfully broadcasts metrics publications");

  logger.info(`================================================================`);
  logger.info(`  INTELLIGENCE TESTS COMPLETED: Passed ${iTestCount - iFailCount}/${iTestCount} assertions`);
  logger.info(`================================================================`);

  if (iFailCount > 0) {
    throw new Error(`Sports Intelligence Platform test suite failed with ${iFailCount} assertions failing.`);
  }
}
