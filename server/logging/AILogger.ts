import { createLogger } from "./Logger";
import { metricsCollector } from "./Metrics";

const logger = createLogger("AIOperation", "AILogger");

export interface AIModelCallDetails {
  provider: "Google" | "OpenAI" | "Anthropic" | "NVIDIA" | "Ollama" | "OpenRouter";
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
  durationMs: number;
  success: boolean;
  requestId?: string;
  error?: string;
  retries?: number;
}

export class AILogger {
  /**
   * Logs a completed AI Provider API Call with token and performance metrics.
   */
  public static logAiCall(details: AIModelCallDetails): void {
    metricsCollector.incrementAiCalls();
    metricsCollector.recordAiLatency(details.durationMs);

    const level = details.success ? "info" : "error";
    
    logger[level](`AI Provider Call to [${details.provider}:${details.model}] - ${details.success ? "SUCCESS" : "FAILURE"}`, {
      provider: details.provider,
      model: details.model,
      duration: details.durationMs,
      requestId: details.requestId,
      operation: "AICall",
      metadata: {
        promptTokens: details.promptTokens,
        completionTokens: details.completionTokens,
        estimatedCost: details.estimatedCost,
        retries: details.retries,
        error: details.error,
      }
    });
  }
}
