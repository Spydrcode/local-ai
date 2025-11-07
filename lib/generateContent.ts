/**
 * Simplified content generation helper
 * Fixes the "couldn't generate" errors in tool APIs
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContent(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert content creator. Always return valid JSON only.",
      },
      { role: "user", content: prompt },
    ],
    temperature: options.temperature || 0.8,
    max_tokens: options.maxTokens || 2000,
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response);
}
