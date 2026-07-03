export interface AIConfig {
  geminiApiKey?: string;
  defaultModel: string;
}

const geminiApiKey = process.env.GEMINI_API_KEY;
const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const aiConfig: AIConfig = {
  geminiApiKey,
  defaultModel,
};
