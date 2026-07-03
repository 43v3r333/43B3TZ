import { createLogger } from "../../core/logger";
import { intelligenceWorker } from "../workers/workers";

const logger = createLogger("SportsIntelligenceScheduler");

export interface ScheduledIntelJob {
  name: string;
  intervalMs: number;
  active: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  successCount: number;
  errorCount: number;
}

export class SportsIntelligenceScheduler {
  private jobs: Map<string, ScheduledIntelJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Registers a recurring Sports Intelligence recalculation task.
   */
  public registerJob(name: string, intervalMs: number) {
    this.unregisterJob(name);

    const job: ScheduledIntelJob = {
      name,
      intervalMs,
      active: false,
      successCount: 0,
      errorCount: 0
    };

    this.jobs.set(name, job);
    this.startJob(name);
    logger.info(`Scheduled Intelligence task registered: '${name}' running every ${intervalMs}ms`);
  }

  public unregisterJob(name: string) {
    this.stopJob(name);
    this.jobs.delete(name);
  }

  private startJob(name: string) {
    const job = this.jobs.get(name);
    if (!job) return;

    job.active = true;
    job.nextRunAt = new Date(Date.now() + job.intervalMs).toISOString();

    const runLoop = async () => {
      if (!job.active) return;

      job.lastRunAt = new Date().toISOString();
      try {
        logger.info(`Executing Scheduled Intelligence compilation: '${name}'`);
        // Trigger worker replay to recalculate state from latest ETL data
        await intelligenceWorker.performHistoricalReplay();
        job.successCount++;
      } catch (err: any) {
        job.errorCount++;
        logger.error(`Error in Intelligence task '${name}'`, { error: err.message });
      }

      job.nextRunAt = new Date(Date.now() + job.intervalMs).toISOString();
      this.timers.set(name, setTimeout(runLoop, job.intervalMs));
    };

    this.timers.set(name, setTimeout(runLoop, job.intervalMs));
  }

  private stopJob(name: string) {
    const timer = this.timers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(name);
    }
    const job = this.jobs.get(name);
    if (job) {
      job.active = false;
    }
  }

  public stopAll() {
    for (const name of this.jobs.keys()) {
      this.stopJob(name);
    }
    logger.info("All Scheduled Intelligence tasks suspended.");
  }

  public getJobs(): ScheduledIntelJob[] {
    return Array.from(this.jobs.values());
  }
}

export const sportsIntelligenceScheduler = new SportsIntelligenceScheduler();
