import { GoogleGenAI } from "@google/genai";
import { createLogger } from "../core/logger";

const logger = createLogger("AIEmbeddingService");

export class EmbeddingService {
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
   * Generates a dense vector embedding (typically 768 or 1536 dimensions) for a piece of text.
   */
  public async embed(text: string): Promise<number[]> {
    if (!this.ai) {
      logger.info("GEMINI_API_KEY is not defined. Falling back to simulated deterministic vector embeddings.");
      return this.generateSimulatedEmbedding(text);
    }

    try {
      const response = await this.ai.models.embedContent({
        model: "gemini-embedding-2-preview",
        contents: text,
      });

      const values = response.embeddings?.[0]?.values;
      if (!values) {
        throw new Error("No embedding values returned from Gemini API");
      }

      return values;
    } catch (err) {
      logger.error("Gemini embedContent failed, falling back to simulated vector.", err);
      return this.generateSimulatedEmbedding(text);
    }
  }

  /**
   * Calculates cosine similarity between two vector embeddings.
   */
  public calculateCosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) {
      throw new Error("Vectors must have the same length for cosine similarity calculation.");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      normA += v1[i] * v1[i];
      normB += v2[i] * v2[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fallback deterministic embedding generator (768 dimensions) to ensure offline & unit testing capability.
   */
  private generateSimulatedEmbedding(text: string): number[] {
    const dim = 768;
    const vec = new Array(dim).fill(0);
    
    // Hash-based deterministic values
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < dim; i++) {
      // Deterministic pseudo-random generation based on text hash and index
      const val = Math.sin(hash + i) * Math.cos(hash - i);
      vec[i] = val;
    }

    // Normalize vector
    let sumSq = 0;
    for (let i = 0; i < dim; i++) sumSq += vec[i] * vec[i];
    const norm = Math.sqrt(sumSq);

    if (norm > 0) {
      for (let i = 0; i < dim; i++) vec[i] /= norm;
    }

    return vec;
  }
}

export const embeddingService = new EmbeddingService();
