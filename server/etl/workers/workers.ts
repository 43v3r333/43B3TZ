import { etlPipelineOrchestrator } from "../pipeline/pipeline";
import { EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLQueueWorker");

export interface QueueTask {
  taskId: string;
  providerName: string;
  entityType: EntityType;
  rawPayload: any;
  queuedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export class QueueWorker {
  private queue: QueueTask[] = [];
  private activeCount = 0;
  private concurrencyLimit = 3;
  private taskHistory: QueueTask[] = [];
  private maxHistory = 500;

  /**
   * Enqueues a raw ingestion payload for background non-blocking execution
   */
  public enqueue(providerName: string, entityType: EntityType, rawPayload: any): string {
    const taskId = `task-${entityType}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const task: QueueTask = {
      taskId,
      providerName,
      entityType,
      rawPayload,
      queuedAt: new Date().toISOString(),
      status: "pending"
    };

    this.queue.push(task);
    this.taskHistory.push(task);
    if (this.taskHistory.length > this.maxHistory) {
      this.taskHistory.shift();
    }

    logger.debug(`Enqueued background ETL task`, { taskId, providerName, entityType });
    this.processNext();
    return taskId;
  }

  private async processNext() {
    if (this.activeCount >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift()!;
    task.status = "processing";
    this.activeCount++;

    logger.info(`Starting background ETL processing worker for task '${task.taskId}'`);

    try {
      const result = await etlPipelineOrchestrator.process(
        task.providerName,
        task.entityType,
        task.rawPayload,
        "background_worker"
      );

      if (result.success) {
        task.status = "completed";
      } else {
        task.status = "failed";
        task.error = result.errors?.join("; ") || "Unknown pipeline error";
      }
    } catch (err: any) {
      task.status = "failed";
      task.error = err.message;
    } finally {
      this.activeCount--;
      logger.info(`Finished background ETL task processing for task '${task.taskId}' with status: ${task.status}`);
      this.processNext(); // Loop to consume next item
    }
  }

  public setConcurrency(limit: number) {
    if (limit > 0) {
      this.concurrencyLimit = limit;
      logger.info(`Worker concurrency limit updated to: ${limit}`);
    }
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getWorkerStatus() {
    return {
      activeWorkers: this.activeCount,
      concurrencyLimit: this.concurrencyLimit,
      pendingTasks: this.queue.length,
      historyCount: this.taskHistory.length
    };
  }

  public getTaskHistory(): QueueTask[] {
    return [...this.taskHistory];
  }

  public clearTaskHistory() {
    this.taskHistory = [];
    logger.info("Worker task history cleared");
  }
}

export const etlQueueWorker = new QueueWorker();
