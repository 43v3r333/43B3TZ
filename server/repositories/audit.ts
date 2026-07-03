import { IAuditRepository, IAuditRecord } from "./types";

export class AuditRepository implements IAuditRepository {
  private logs: IAuditRecord[] = [];

  public log(record: Omit<IAuditRecord, "id" | "timestamp">): IAuditRecord {
    const fullRecord: IAuditRecord = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      ...record
    };
    this.logs.push(fullRecord);
    return fullRecord;
  }

  public getLogs(filters?: { actorId?: string; action?: string }): IAuditRecord[] {
    let result = this.logs;
    if (filters?.actorId) {
      result = result.filter(l => l.actorId === filters.actorId);
    }
    if (filters?.action) {
      result = result.filter(l => l.action === filters.action);
    }
    return result;
  }
}

export const auditRepository = new AuditRepository();
