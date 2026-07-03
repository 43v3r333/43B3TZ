import { AICostRecord, AIProviderType } from "./types";
import { createLogger } from "../core/logger";

const logger = createLogger("AICostTracker");

export class CostTracker {
  private records: AICostRecord[] = [];

  public recordCost(record: Omit<AICostRecord, "id" | "timestamp">): void {
    const fullRecord: AICostRecord = {
      id: `cost_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...record,
    };

    this.records.push(fullRecord);
    logger.info(`Tracked Cost: ${record.model} | Input: ${record.inputTokens} | Output: ${record.outputTokens} | Cost: $${record.costUsd.toFixed(6)}`);
  }

  public getSummary(): {
    totalCostUsd: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalQueries: number;
    byProvider: Record<AIProviderType, { cost: number; queries: number }>;
    byModel: Record<string, { cost: number; queries: number }>;
  } {
    let totalCostUsd = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const byProvider: Record<string, { cost: number; queries: number }> = {};
    const byModel: Record<string, { cost: number; queries: number }> = {};

    for (const r of this.records) {
      totalCostUsd += r.costUsd;
      totalInputTokens += r.inputTokens;
      totalOutputTokens += r.outputTokens;

      if (!byProvider[r.provider]) {
        byProvider[r.provider] = { cost: 0, queries: 0 };
      }
      byProvider[r.provider].cost += r.costUsd;
      byProvider[r.provider].queries += 1;

      if (!byModel[r.model]) {
        byModel[r.model] = { cost: 0, queries: 0 };
      }
      byModel[r.model].cost += r.costUsd;
      byModel[r.model].queries += 1;
    }

    return {
      totalCostUsd,
      totalInputTokens,
      totalOutputTokens,
      totalQueries: this.records.length,
      byProvider: byProvider as Record<AIProviderType, { cost: number; queries: number }>,
      byModel,
    };
  }

  public getRecordsByTrackingId(trackingId: string): AICostRecord[] {
    return this.records.filter(r => r.trackingId === trackingId);
  }

  public clear(): void {
    this.records = [];
  }
}

export const costTracker = new CostTracker();
