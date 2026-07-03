import { GoogleGenAI } from "@google/genai";
import { AIProviderType, AIInferenceConfig, AIInferenceResponse, AIFoundationModel } from "./types";
import { createLogger } from "../core/logger";
import { modelRegistry } from "./registry";
import { responseCache } from "./cache";
import { costTracker } from "./cost";

const logger = createLogger("AIProviderPlatform");

export interface IAIProvider {
  readonly providerType: AIProviderType;
  generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse>;
}

// 1. GOOGLE PROVIDER (GEMINI SDK)
export class GoogleProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "google";
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      logger.warn("GEMINI_API_KEY is not defined. GoogleProvider initialized in degraded mode.");
    }
  }

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "gemini-3.5-flash";

    if (!this.ai) {
      throw new Error("GoogleProvider Error: GEMINI_API_KEY environment variable is required.");
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          temperature: config?.temperature,
          topK: config?.topK,
          topP: config?.topP,
          systemInstruction: config?.systemInstruction,
          maxOutputTokens: config?.maxOutputTokens,
        },
      });

      const text = response.text || "";
      const latencyMs = Date.now() - startTime;

      // Estimate tokens
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      // Fetch rates
      const modelMeta = modelRegistry.getModel(modelId);
      const costPerIn = modelMeta?.costPerInputToken || 0.075;
      const costPerOut = modelMeta?.costPerOutputToken || 0.3;
      const costUsd = ((inputTokens * costPerIn) + (outputTokens * costPerOut)) / 1000000;

      return {
        text,
        provider: "google",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`GoogleProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// 2. OPENAI PROVIDER
export class OpenAIProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "openai";

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "gpt-4o-mini";
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAIProvider Error: OPENAI_API_KEY environment variable is required.");
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(config?.systemInstruction ? [{ role: "system", content: config.systemInstruction }] : []),
            { role: "user", content: prompt },
          ],
          temperature: config?.temperature,
          max_tokens: config?.maxOutputTokens,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      const outputTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

      const modelMeta = modelRegistry.getModel(modelId);
      const costPerIn = modelMeta?.costPerInputToken || 0.15;
      const costPerOut = modelMeta?.costPerOutputToken || 0.6;
      const costUsd = ((inputTokens * costPerIn) + (outputTokens * costPerOut)) / 1000000;

      return {
        text,
        provider: "openai",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`OpenAIProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// 3. ANTHROPIC PROVIDER
export class AnthropicProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "anthropic";

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "claude-3-5-haiku-latest";
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("AnthropicProvider Error: ANTHROPIC_API_KEY environment variable is required.");
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          system: config?.systemInstruction,
          temperature: config?.temperature,
          max_tokens: config?.maxOutputTokens || 1024,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Anthropic API responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.input_tokens || Math.ceil(prompt.length / 4);
      const outputTokens = data.usage?.output_tokens || Math.ceil(text.length / 4);

      const modelMeta = modelRegistry.getModel(modelId);
      const costPerIn = modelMeta?.costPerInputToken || 0.8;
      const costPerOut = modelMeta?.costPerOutputToken || 4.0;
      const costUsd = ((inputTokens * costPerIn) + (outputTokens * costPerOut)) / 1000000;

      return {
        text,
        provider: "anthropic",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`AnthropicProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// 4. NVIDIA PROVIDER
export class NvidiaProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "nvidia";

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "nvidia/llama-3.1-nemotron-70b-instruct";
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      throw new Error("NvidiaProvider Error: NVIDIA_API_KEY environment variable is required.");
    }

    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(config?.systemInstruction ? [{ role: "system", content: config.systemInstruction }] : []),
            { role: "user", content: prompt },
          ],
          temperature: config?.temperature,
          max_tokens: config?.maxOutputTokens,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Nvidia API responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      const outputTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

      const modelMeta = modelRegistry.getModel(modelId);
      const costPerIn = modelMeta?.costPerInputToken || 0.07;
      const costPerOut = modelMeta?.costPerOutputToken || 0.28;
      const costUsd = ((inputTokens * costPerIn) + (outputTokens * costPerOut)) / 1000000;

      return {
        text,
        provider: "nvidia",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`NvidiaProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// 5. OLLAMA PROVIDER (LOCAL INFERENCE)
export class OllamaProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "ollama";

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "llama3";
    const host = process.env.OLLAMA_HOST || "http://localhost:11434";

    try {
      const res = await fetch(`${host}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          prompt,
          system: config?.systemInstruction,
          options: {
            temperature: config?.temperature,
            num_predict: config?.maxOutputTokens,
          },
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`Ollama responded with status ${res.status}`);
      }

      const data = await res.json();
      const text = data.response || "";
      const latencyMs = Date.now() - startTime;

      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(text.length / 4);

      // Ollama local usage is $0.00 cost
      return {
        text,
        provider: "ollama",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd: 0,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`OllamaProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// 6. OPENROUTER PROVIDER
export class OpenRouterProvider implements IAIProvider {
  public readonly providerType: AIProviderType = "openrouter";

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const startTime = Date.now();
    const modelId = config?.modelId || "meta-llama/llama-3-70b-instruct:free";
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenRouterProvider Error: OPENROUTER_API_KEY environment variable is required.");
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "43B3TZ Platform",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            ...(config?.systemInstruction ? [{ role: "system", content: config.systemInstruction }] : []),
            { role: "user", content: prompt },
          ],
          temperature: config?.temperature,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenRouter responded with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
      const outputTokens = data.usage?.completion_tokens || Math.ceil(text.length / 4);

      const modelMeta = modelRegistry.getModel(modelId);
      const costPerIn = modelMeta?.costPerInputToken || 0.1;
      const costPerOut = modelMeta?.costPerOutputToken || 0.4;
      const costUsd = ((inputTokens * costPerIn) + (outputTokens * costPerOut)) / 1000000;

      return {
        text,
        provider: "openrouter",
        model: modelId,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        cached: false,
      };
    } catch (err: any) {
      logger.error(`OpenRouterProvider generation failed on model ${modelId}:`, err);
      throw err;
    }
  }
}

// CENTRAL PROVIDER MANAGER
export class ProviderManager {
  private providers: Map<AIProviderType, IAIProvider> = new Map();

  constructor() {
    this.providers.set("google", new GoogleProvider());
    this.providers.set("openai", new OpenAIProvider());
    this.providers.set("anthropic", new AnthropicProvider());
    this.providers.set("nvidia", new NvidiaProvider());
    this.providers.set("ollama", new OllamaProvider());
    this.providers.set("openrouter", new OpenRouterProvider());
  }

  public registerProvider(provider: IAIProvider) {
    this.providers.set(provider.providerType, provider);
  }

  public async generateContent(prompt: string, config?: AIInferenceConfig): Promise<AIInferenceResponse> {
    const modelId = config?.modelId || "gemini-3.5-flash";
    const modelMeta = modelRegistry.getModel(modelId);
    const providerType = modelMeta?.provider || "google";

    // 1. Check response cache first
    const cacheKey = `ai_cache_${providerType}_${modelId}_${prompt}`;
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse) {
      logger.info(`AI Cache Hit for model ${modelId}`);
      return {
        ...cachedResponse,
        cached: true,
      };
    }

    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`AIProviderPlatform Error: Unsupported provider ${providerType}`);
    }

    logger.info(`Routing prompt to ${providerType} (${modelId})`);
    
    // 2. Run inference
    const response = await provider.generateContent(prompt, config);

    // 3. Set to cache
    responseCache.set(cacheKey, response, 600); // 10 minute cache

    // 4. Track consumption cost
    costTracker.recordCost({
      provider: response.provider,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      costUsd: response.costUsd,
      trackingId: config?.trackingId,
    });

    return response;
  }
}

export const providerManager = new ProviderManager();
