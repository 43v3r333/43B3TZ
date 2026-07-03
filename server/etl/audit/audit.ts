import fs from "fs";
import path from "path";
import { AuditRecord, EntityType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("ETLAuditLogger");

export class AuditLogger {
  private filePath: string;
  private records: AuditRecord[] = [];

  constructor() {
    this.filePath = path.resolve("./data/etl_audit.json");
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
        this.records = JSON.parse(raw);
        logger.info(`ETL Audit logs loaded: ${this.records.length} items`);
      } else {
        this.save();
        logger.info("ETL Audit log file initialized with 0 items");
      }
    } catch (err: any) {
      logger.error("Failed to initialize ETL Audit file. Falling back to memory-only.", { error: err.message });
    }
  }

  private save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.records, null, 2), "utf-8");
      fs.renameSync(tempPath, this.filePath);
    } catch (err: any) {
      logger.error("Failed to persist ETL Audit write", { error: err.message });
    }
  }

  /**
   * Records an audit log entry for a transaction pipeline execution
   */
  public log(record: Omit<AuditRecord, "auditId" | "timestamp">): AuditRecord {
    const fullRecord: AuditRecord = {
      auditId: `audit-${record.entityType}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      ...record
    };

    this.records.push(fullRecord);
    
    // Prune logs if they exceed 5000 items to avoid infinite storage bloat
    if (this.records.length > 5000) {
      this.records.shift();
    }

    this.save();
    logger.info(`ETL Audit logged successfully`, { auditId: fullRecord.auditId, entityType: record.entityType, success: true });
    return fullRecord;
  }

  /**
   * Retrieves all registered audit records
   */
  public getLogs(): AuditRecord[] {
    return [...this.records];
  }

  /**
   * Filter logs by criteria
   */
  public filterLogs(filters: {
    providerName?: string;
    entityType?: EntityType;
    operator?: string;
    pipelineVersion?: string;
  }): AuditRecord[] {
    return this.records.filter(r => {
      if (filters.providerName && r.providerName !== filters.providerName) return false;
      if (filters.entityType && r.entityType !== filters.entityType) return false;
      if (filters.operator && r.operator !== filters.operator) return false;
      if (filters.pipelineVersion && r.pipelineVersion !== filters.pipelineVersion) return false;
      return true;
    });
  }

  /**
   * Clears audit trails
   */
  public clearLogs() {
    this.records = [];
    this.save();
    logger.info("Audit logs truncated successfully");
  }
}

export const etlAuditLogger = new AuditLogger();
