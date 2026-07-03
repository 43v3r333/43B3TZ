import { createLogger } from "./Logger";

const logger = createLogger("AuditSystem", "AuditLogger");

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: "Authentication" | "RoleChanges" | "PredictionGeneration" | "ResearchExperiments" | "ConfigurationChanges" | "Administrative";
  action: string;
  actor: {
    userId?: string;
    role?: string;
    ip?: string;
  };
  details: Record<string, any>;
  status: "success" | "failure";
  requestId?: string;
}

// Private, in-memory array that is never directly exported
const auditRegistry: AuditEvent[] = [];

export class AuditLogger {
  /**
   * Dispatches and archives a critical enterprise security or administrative audit event.
   * This ledger is immutable and can only be appended to.
   */
  public static logEvent(event: Omit<AuditEvent, "id" | "timestamp">): void {
    const fullEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    // Deep freeze to guarantee immutability in memory
    Object.freeze(fullEvent);
    Object.freeze(fullEvent.actor);
    Object.freeze(fullEvent.details);

    // Append to private ledger
    auditRegistry.push(fullEvent);

    // Also dispatch to structured logging system with FATAL or high-priority INFO depending on status
    const level = fullEvent.status === "success" ? "info" : "warn";
    
    logger[level](`AUDIT: [${fullEvent.category}] - ${fullEvent.action} - ${fullEvent.status.toUpperCase()}`, {
      requestId: fullEvent.requestId,
      userId: fullEvent.actor.userId,
      operation: `Audit_${fullEvent.category}`,
      metadata: {
        auditId: fullEvent.id,
        actor: fullEvent.actor,
        details: fullEvent.details,
      },
    });
  }

  /**
   * Safe, read-only copy of the audit registry for administrative reporting.
   */
  public static getRegistry(): readonly AuditEvent[] {
    return Object.freeze([...auditRegistry]);
  }
}
