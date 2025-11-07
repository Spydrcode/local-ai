import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({ apiKey });

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || "0.75");
export const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || "1800");

export function validateOpenAIConfig(): void {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }
}
