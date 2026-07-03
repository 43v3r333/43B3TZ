import { Type } from "@google/genai";

export type AIProviderType =
  | "google"
  | "openai"
  | "anthropic"
  | "nvidia"
  | "ollama"
  | "openrouter";

export interface AIFoundationModel {
  modelId: string;
  name: string;
  provider: AIProviderType;
  maxTokens: number;
  contextWindow: number;
  costPerInputToken: number; // USD per million tokens
  costPerOutputToken: number; // USD per million tokens
  latencyMs: number;
  isActive: boolean;
}

export interface AIPrompt {
  id: string;
  version: string;
  author: string;
  purpose: string;
  template: string;
  evaluationScore: number; // [0, 100]
  lastModified: string;
  isActive: boolean;
  experimentGroup?: "A" | "B";
}

export type AIMemoryType =
  | "conversation"
  | "prediction"
  | "research"
  | "model"
  | "feedback";

export interface AIMemoryRecord {
  id: string;
  type: AIMemoryType;
  content: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
  vectorSnapshot?: number[]; // Snapshot of embedding values for future vector search
}

export interface AICostRecord {
  id: string;
  timestamp: string;
  provider: AIProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  trackingId?: string; // correlation ID / prediction ID
}

export interface AICacheRecord {
  key: string;
  value: string;
  provider: AIProviderType;
  model: string;
  cachedAt: string;
  expiresAt: string;
}

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: Type;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any> | any;
}

export interface AIInferenceConfig {
  modelId?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  trackingId?: string;
  stream?: boolean;
}

export interface AIInferenceResponse {
  text: string;
  provider: AIProviderType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  cached: boolean;
}
