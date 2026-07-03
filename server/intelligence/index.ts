export * from "./types";
export * from "./storage/storage";
export * from "./events/events";
export * from "./elo/elo";
export * from "./xg/xg";
export * from "./form/form";
export * from "./fatigue/fatigue";
export * from "./weather/weather";
export * from "./referees/referees";
export * from "./market/market";
export * from "./quality/quality";
export * from "./spi/spi";
export * from "./teams/teams";
export * from "./players/players";
export * from "./workers/workers";
export * from "./scheduler/scheduler";

import { sportsIntelligenceScheduler } from "./scheduler/scheduler";
import { intelligenceWorker } from "./workers/workers";
import { createLogger } from "../core/logger";

const logger = createLogger("SportsIntelligencePlatform");

export async function bootstrapSportsIntelligence() {
  logger.info("Initializing Sports Intelligence Platform...");
  
  // 1. Run initial historical compilation replay from available curated ETL data
  try {
    const initReplay = await intelligenceWorker.performHistoricalReplay();
    logger.info("Bootstrap compilation successful.", { stats: initReplay.stats });
  } catch (err: any) {
    logger.error("Failed to compile initial Sports Intelligence replay", { error: err.message });
  }

  // 2. Schedule continuous background compilation (every 60 seconds)
  sportsIntelligenceScheduler.registerJob("ContinuousIntelligenceRecalculation", 60 * 1000);
  
  logger.info("Sports Intelligence Platform online and executing continuous background loops.");
}
