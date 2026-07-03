import fs from "fs";
import path from "path";
import { EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLDeadLetterQueue");

export interface DLQEntry {
  dlqId: string;
  providerName: string;
  entityType: EntityType;
  rawPayload: any;
  errors: string[];
  checksum: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedReason?: string;
}

export class DeadLetterQueue {
  private filePath: string;
  private queue: DLQEntry[] = [];

  constructor() {
    this.filePath = path.resolve("./data/etl_dlq.json");
    this.initialize();
  }

  private initialize() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.queue = JSON.parse(raw);
        logger.info(`ETL Dead-Letter Queue loaded: ${this.queue.length} entries`);
      } else {
        this.save();
        logger.info("ETL DLQ storage initialized empty");
      }
    } catch (err: any) {
      logger.error("Failed to initialize ETL DLQ file. Falling back to memory-only.", { error: err.message });
    }
  }

  private save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.queue, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err: any) {
      logger.error("Failed to persist ETL DLQ state write", { error: err.message });
    }
  }

  /**
   * Pushes a failed or broken raw payload into the DLQ with diagnostic error traces.
   */
  public add(
    providerName: string,
    entityType: EntityType,
    rawPayload: any,
    errors: string[],
    checksum: string
  ): DLQEntry {
    const entry: DLQEntry = {
      dlqId: `dlq-${entityType}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      providerName,
      entityType,
      rawPayload,
      errors,
      checksum,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.queue.push(entry);
    
    // Prune entries if queue exceeds 1000 items to avoid infinite disk consumption
    if (this.queue.length > 1000) {
      this.queue.shift();
    }

    this.save();
    logger.warn(`Payload failed ETL pipeline; routed to Dead-Letter Queue`, {
      dlqId: entry.dlqId,
      providerName,
      entityType,
      errorCount: errors.length
    });

    return entry;
  }

  /**
   * Marks a dead letter record as resolved following manual troubleshooting/override.
   */
  public resolve(dlqId: string, reason: string): boolean {
    const idx = this.queue.findIndex(item => item.dlqId === dlqId);
    if (idx === -1) return false;

    this.queue[idx] = {
      ...this.queue[idx],
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedReason: reason
    };

    this.save();
    logger.info(`DLQ Entry '${dlqId}' resolved manually`, { reason });
    return true;
  }

  /**
   * Removes a record from the DLQ entirely
   */
  public delete(dlqId: string): boolean {
    const originalLen = this.queue.length;
    this.queue = this.queue.filter(item => item.dlqId !== dlqId);
    if (this.queue.length !== originalLen) {
      this.save();
      logger.info(`DLQ Entry '${dlqId}' deleted`);
      return true;
    }
    return false;
  }

  /**
   * Retrieves all items inside DLQ
   */
  public getQueue(): DLQEntry[] {
    return [...this.queue];
  }

  /**
   * Empties the entire dead letter queue
   */
  public clearQueue() {
    this.queue = [];
    this.save();
    logger.info("DLQ completely truncated");
  }
}

export const etlDeadLetterQueue = new DeadLetterQueue();
