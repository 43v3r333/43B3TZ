import { AIFoundationModel, AIPrompt, AITool } from "./types";
import { createLogger } from "../core/logger";

const logger = createLogger("AIRegistry");

// 1. MODEL REGISTRY (Foundation Models)
export class ModelRegistry {
  private models: Map<string, AIFoundationModel> = new Map();

  constructor() {
    this.bootstrapModels();
  }

  public registerModel(model: AIFoundationModel): void {
    this.models.set(model.modelId, model);
    logger.info(`Foundation model registered: ${model.modelId} (${model.name})`);
  }

  public getModel(modelId: string): AIFoundationModel | undefined {
    return this.models.get(modelId);
  }

  public getActiveModels(): AIFoundationModel[] {
    return Array.from(this.models.values()).filter(m => m.isActive);
  }

  private bootstrapModels(): void {
    const baselines: AIFoundationModel[] = [
      {
        modelId: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
        provider: "google",
        maxTokens: 8192,
        contextWindow: 1048576,
        costPerInputToken: 0.075, // $0.075 per M
        costPerOutputToken: 0.3,  // $0.30 per M
        latencyMs: 380,
        isActive: true,
      },
      {
        modelId: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        provider: "google",
        maxTokens: 4096,
        contextWindow: 1048576,
        costPerInputToken: 0.0375,
        costPerOutputToken: 0.15,
        latencyMs: 250,
        isActive: true,
      },
      {
        modelId: "gpt-4o-mini",
        name: "GPT-4o Mini",
        provider: "openai",
        maxTokens: 16384,
        contextWindow: 128000,
        costPerInputToken: 0.15,
        costPerOutputToken: 0.6,
        latencyMs: 450,
        isActive: true,
      },
      {
        modelId: "claude-3-5-haiku-latest",
        name: "Claude 3.5 Haiku",
        provider: "anthropic",
        maxTokens: 8192,
        contextWindow: 200000,
        costPerInputToken: 0.8,
        costPerOutputToken: 4.0,
        latencyMs: 580,
        isActive: true,
      },
      {
        modelId: "nvidia/llama-3.1-nemotron-70b-instruct",
        name: "Nvidia NIM Llama 3.1",
        provider: "nvidia",
        maxTokens: 4096,
        contextWindow: 131072,
        costPerInputToken: 0.07,
        costPerOutputToken: 0.28,
        latencyMs: 400,
        isActive: true,
      },
      {
        modelId: "llama3",
        name: "Local Ollama Llama 3",
        provider: "ollama",
        maxTokens: 4096,
        contextWindow: 8192,
        costPerInputToken: 0,
        costPerOutputToken: 0,
        latencyMs: 200,
        isActive: true,
      },
    ];

    for (const m of baselines) {
      this.registerModel(m);
    }
  }
}

// 2. PROMPT REGISTRY (With Immutability, Versioning, and A/B Testing)
export class PromptRegistry {
  private prompts: Map<string, AIPrompt[]> = new Map(); // id -> array of versions

  constructor() {
    this.bootstrapPrompts();
  }

  /**
   * Registers a prompt version. Must never overwrite existing prompt version.
   */
  public registerPrompt(prompt: AIPrompt): void {
    const existingVersions = this.prompts.get(prompt.id) || [];
    const isDup = existingVersions.some(p => p.version === prompt.version);

    if (isDup) {
      throw new Error(`PromptRegistry Error: Cannot overwrite version ${prompt.version} of prompt ID "${prompt.id}". Prompt changes must be appended under a new version.`);
    }

    // Deactivate previous active prompts of the same ID if registering an active one
    if (prompt.isActive) {
      existingVersions.forEach(p => {
        if (!prompt.experimentGroup || p.experimentGroup === prompt.experimentGroup) {
          p.isActive = false;
        }
      });
    }

    existingVersions.push(prompt);
    this.prompts.set(prompt.id, existingVersions);
    logger.info(`Registered prompt: ${prompt.id} v${prompt.version} [Group: ${prompt.experimentGroup || "Standard"}]`);
  }

  public getPrompt(id: string, version?: string): AIPrompt | undefined {
    const versions = this.prompts.get(id);
    if (!versions || versions.length === 0) return undefined;

    if (version) {
      return versions.find(p => p.version === version);
    }

    // Fallback: Return the latest active prompt for this ID
    return versions.find(p => p.isActive) || versions[versions.length - 1];
  }

  /**
   * Supports A/B testing by selecting between group A or B based on a seed (e.g. user ID or random)
   */
  public getABPrompt(id: string, seed: string): AIPrompt | undefined {
    const versions = this.prompts.get(id);
    if (!versions) return undefined;

    const groupA = versions.filter(p => p.experimentGroup === "A" && p.isActive);
    const groupB = versions.filter(p => p.experimentGroup === "B" && p.isActive);

    if (groupA.length === 0 || groupB.length === 0) {
      // No active A/B test, fall back to standard
      return this.getPrompt(id);
    }

    // Deterministic selection based on seed hashing
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const group = Math.abs(hash) % 2 === 0 ? "A" : "B";
    logger.info(`Served A/B prompt group ${group} for seed "${seed}" on prompt "${id}"`);

    const selectedList = group === "A" ? groupA : groupB;
    return selectedList[selectedList.length - 1];
  }

  public getAllVersions(id: string): AIPrompt[] {
    return this.prompts.get(id) || [];
  }

  private bootstrapPrompts(): void {
    // Prediction explanation prompt v1.0
    this.registerPrompt({
      id: "explainable_prediction",
      version: "1.0.0",
      author: "sports_intel_ai",
      purpose: "Explain match outcome prediction drivers with deep sporting domain context",
      template: `Explain the prediction for {fixtureName} ({marketType}).
Confidence drivers: {confidenceDrivers}
Key metrics snapshot: {metricsSnapshot}
Historical evidence: {historyContext}
Highlight the exact tactical reasons, ELO ratings, expectations, and referee patterns.`,
      evaluationScore: 92.5,
      lastModified: new Date().toISOString(),
      isActive: true,
    });

    // Prediction explanation prompt v1.1 (A/B Test - Group A)
    this.registerPrompt({
      id: "explainable_prediction",
      version: "1.1.0-A",
      author: "chief_data_scientist",
      purpose: "Deep technical, statistical explanation structure (Group A)",
      template: `[TECHNICAL STUDY] Analyze prediction of {fixtureName} for {marketType}.
Statistical drivers: {confidenceDrivers}
Model parameters & SNAP value: {metricsSnapshot}
Historical drift evaluation: {historyContext}
Calibrate reasoning using strict probability theory and ELO differences.`,
      evaluationScore: 94.0,
      lastModified: new Date().toISOString(),
      isActive: true,
      experimentGroup: "A",
    });

    // Prediction explanation prompt v1.1 (A/B Test - Group B)
    this.registerPrompt({
      id: "explainable_prediction",
      version: "1.1.0-B",
      author: "sports_journalist_ai",
      purpose: "Narrative, fan-friendly tactical explanation structure (Group B)",
      template: `[SPORTING DRAMA] Break down the predicted outcome of {fixtureName} for {marketType}.
Tactical drivers: {confidenceDrivers}
Team form & momentum: {metricsSnapshot}
Matchup history context: {historyContext}
Narrate why this match matters, injuries, weather influence, and referee characteristics.`,
      evaluationScore: 93.2,
      lastModified: new Date().toISOString(),
      isActive: true,
      experimentGroup: "B",
    });
  }
}

// 3. TOOL REGISTRY (Native AI Tools binding)
export class ToolRegistry {
  private tools: Map<string, AITool> = new Map();

  public registerTool(tool: AITool): void {
    this.tools.set(tool.name, tool);
    logger.info(`AI tool bound to registry: ${tool.name} - ${tool.description}`);
  }

  public getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  public getTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`ToolRegistry Error: Tool "${name}" does not exist.`);
    }
    logger.info(`Executing tool "${name}" with args:`, args);
    return await tool.handler(args);
  }
}

export const modelRegistry = new ModelRegistry();
export const promptRegistry = new PromptRegistry();
export const toolRegistry = new ToolRegistry();
