import { createLogger } from "../../core/logger";

const logger = createLogger("ETLJobScheduler");

export interface ScheduledJob {
  name: string;
  intervalMs: number;
  active: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  errorCount: number;
  successCount: number;
}

export class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Registers a recurring ETL processing job with polling intervals
   */
  public registerJob(name: string, intervalMs: number, callback: () => Promise<void>) {
    // If job exists, clear previous timer
    this.unregisterJob(name);

    const job: ScheduledJob = {
      name,
      intervalMs,
      active: false,
      errorCount: 0,
      successCount: 0
    };

    this.jobs.set(name, job);
    this.startJob(name, callback);
    logger.info(`Scheduled job registered successfully: '${name}' running every ${intervalMs}ms`);
  }

  public unregisterJob(name: string) {
    this.stopJob(name);
    this.jobs.delete(name);
  }

  private startJob(name: string, callback: () => Promise<void>) {
    const job = this.jobs.get(name);
    if (!job) return;

    job.active = true;
    job.nextRunAt = new Date(Date.now() + job.intervalMs).toISOString();

    const loop = async () => {
      if (!job.active) return;
      
      job.lastRunAt = new Date().toISOString();
      try {
        logger.debug(`Executing scheduled background ETL job '${name}'`);
        await callback();
        job.successCount++;
      } catch (err: any) {
        job.errorCount++;
        logger.error(`Error executing scheduled job '${name}'`, { error: err.message });
      }

      job.nextRunAt = new Date(Date.now() + job.intervalMs).toISOString();
      this.timers.set(name, setTimeout(loop, job.intervalMs));
    };

    this.timers.set(name, setTimeout(loop, job.intervalMs));
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
    logger.info("All ETL background scheduled jobs suspended.");
  }

  public getJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }
}

export const etlJobScheduler = new JobScheduler();
