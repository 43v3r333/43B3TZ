import { createLogger } from "./logger";

const logger = createLogger("JobQueue");

export type JobType =
  | "prediction_generation"
  | "feature_engineering"
  | "ai_inference"
  | "model_evaluation"
  | "replay_processing"
  | "experiment_execution";

export interface Job<T = any, R = any> {
  id: string;
  type: JobType;
  payload: T;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: R;
  error?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type JobHandler<T = any, R = any> = (job: Job<T, R>) => Promise<R>;

export class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private processing: boolean = false;

  public registerHandler<T = any, R = any>(type: JobType, handler: JobHandler<T, R>): void {
    this.handlers.set(type, handler);
    logger.info(`Registered background worker handler for job type: "${type}"`);
  }

  public async enqueue<T = any, R = any>(type: JobType, payload: T, options?: { maxAttempts?: number }): Promise<Job<T, R>> {
    const job: Job<T, R> = {
      id: `job-${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      payload,
      status: "pending",
      progress: 0,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(job.id, job);
    logger.info(`Enqueued new task in asynchronous worker queue: "${job.id}" [${type}]`);
    
    // Trigger processing asynchronously
    setImmediate(() => this.processNext());

    return job;
  }

  public getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  public getJobsByType(type: JobType): Job[] {
    return Array.from(this.jobs.values()).filter(j => j.type === type);
  }

  public clear(): void {
    this.jobs.clear();
    logger.info("Job queue cache cleared");
  }

  private async processNext(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const pendingJob = Array.from(this.jobs.values()).find(j => j.status === "pending");
      if (!pendingJob) {
        this.processing = false;
        return;
      }

      const handler = this.handlers.get(pendingJob.type);
      if (!handler) {
        pendingJob.status = "failed";
        pendingJob.error = `No handler registered for job type ${pendingJob.type}`;
        logger.error(`Job execution failed: ${pendingJob.error} for Job ID: ${pendingJob.id}`);
        this.processing = false;
        setImmediate(() => this.processNext());
        return;
      }

      pendingJob.status = "processing";
      pendingJob.startedAt = new Date().toISOString();
      pendingJob.attempts++;
      logger.info(`Started processing background job: "${pendingJob.id}" (Attempt: ${pendingJob.attempts})`);

      try {
        const result = await handler(pendingJob);
        pendingJob.status = "completed";
        pendingJob.progress = 100;
        pendingJob.result = result;
        pendingJob.completedAt = new Date().toISOString();
        logger.info(`Successfully finished processing background job: "${pendingJob.id}"`);
      } catch (err: any) {
        logger.error(`Background job execution error: ${err.message} in Job: ${pendingJob.id}`);
        pendingJob.error = err.message;
        if (pendingJob.attempts < pendingJob.maxAttempts) {
          pendingJob.status = "pending"; // Re-queue
          logger.warn(`Job "${pendingJob.id}" scheduled for automatic retry`);
        } else {
          pendingJob.status = "failed";
          pendingJob.completedAt = new Date().toISOString();
        }
      }
    } finally {
      this.processing = false;
      // Check for more jobs
      setImmediate(() => this.processNext());
    }
  }
}

export const jobQueue = new JobQueue();
