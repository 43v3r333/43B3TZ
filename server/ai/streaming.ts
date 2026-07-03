import { GoogleGenAI } from "@google/genai";
import { AIInferenceConfig } from "./types";
import { createLogger } from "../core/logger";

const logger = createLogger("AIStreamingManager");

export class StreamingManager {
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
    }
  }

  /**
   * Streams generation chunks directly using Server-Sent Events (SSE) formatting
   */
  public async streamGoogleContent(
    prompt: string,
    config: AIInferenceConfig,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<string> {
    const modelId = config?.modelId || "gemini-3.5-flash";

    if (!this.ai) {
      // Simulate streaming in offline/degraded mode
      logger.info("Streaming in simulated degraded mode.");
      return await this.simulateStream(prompt, onChunk, onComplete);
    }

    try {
      const responseStream = await this.ai.models.generateContentStream({
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

      let fullText = "";
      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        if (text) {
          fullText += text;
          onChunk(text);
        }
      }

      onComplete(fullText);
      return fullText;
    } catch (err) {
      logger.error(`Google stream generation failed on model ${modelId}:`, err);
      throw err;
    }
  }

  /**
   * Helper to write formatted SSE events to an Express response object
   */
  public writeSSEHeader(res: any): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
  }

  /**
   * Helper to write a clean chunk event to client
   */
  public writeSSEChunk(res: any, data: any): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Helper to close an SSE stream cleanly
   */
  public writeSSEEnd(res: any): void {
    res.write("data: [DONE]\n\n");
    res.end();
  }

  /**
   * Offline mock streaming for local simulation or fallback
   */
  private async simulateStream(
    prompt: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<string> {
    const simulatedResponse = `[Simulated Intelligence Stream] Here is an explainable prediction analysis for the requested query.\n\nConfidence indicators suggest strong momentum for the Home team due to: \n- Form rating differential: +0.24\n- ELO differential: +112\n- Market drift favorability.\n\nRisk assessment remains within green limits (Kelly optimized stake: 4.2%).`;
    const chunks = simulatedResponse.split(" ");
    let fullText = "";

    for (const chunk of chunks) {
      await new Promise(resolve => setTimeout(resolve, 30));
      const chunkText = chunk + " ";
      fullText += chunkText;
      onChunk(chunkText);
    }

    onComplete(fullText);
    return fullText;
  }
}

export const streamingManager = new StreamingManager();
