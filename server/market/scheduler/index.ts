import { MarketSimulationWorker } from "../workers";
import { createLogger } from "../../core/logger";

const logger = createLogger("MarketScheduler");

export class MarketScheduler {
  private static isRunning = false;

  public static bootstrap(): void {
    if (this.isRunning) return;

    logger.info("Bootstrapping Market Intelligence Scheduler & Engine worker loops...");
    MarketSimulationWorker.start();
    this.isRunning = true;
    logger.info("Market Intelligence Platform successfully scheduled.");
  }

  public static shutdown(): void {
    if (!this.isRunning) return;

    logger.info("Shutting down Market Intelligence scheduler...");
    MarketSimulationWorker.stop();
    this.isRunning = false;
  }
}
