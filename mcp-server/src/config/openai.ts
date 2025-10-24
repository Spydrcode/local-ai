import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

/**
 * OpenAI client configuration for all agents
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default model settings (can be overridden per agent)
 */
export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const DEFAULT_TEMPERATURE = parseFloat(
  process.env.OPENAI_TEMPERATURE || "0.75"
);
export const DEFAULT_MAX_TOKENS = parseInt(
  process.env.OPENAI_MAX_TOKENS || "1800"
);

/**
 * Validate that OpenAI is properly configured
 */
export function validateOpenAIConfig(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set in environment variables. Please check your .env file."
    );
  }
}
