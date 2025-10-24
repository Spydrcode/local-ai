import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  // Warn but do not throw, so the app can still boot in environments without keys.
  console.warn(
    "OPENAI_API_KEY is not set. OpenAI features will fail until configured."
  );
}

const client = new OpenAI({ apiKey });

export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function createEmbedding(
  input: string,
  model = "text-embedding-3-small"
): Promise<EmbeddingResult> {
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Set it in .env.local to enable embeddings."
    );
  }

  const response = await client.embeddings.create({
    model,
    input,
  });

  const embedding = response.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error("Failed to generate embedding from OpenAI response.");
  }

  return { embedding, model };
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export async function createChatCompletion({
  messages,
  model = "gpt-4.1-mini",
  temperature = 0.7,
  maxTokens = 800,
  jsonMode = false,
}: ChatCompletionOptions) {
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Set it in .env.local to enable chat."
    );
  }

  const response = await client.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response content from OpenAI.");
  }

  return content;
}

export async function summarizeText({
  text,
  prompt,
  model = "gpt-4.1-mini",
}: {
  text: string;
  prompt: string;
  model?: string;
}) {
  return createChatCompletion({
    model,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: text.slice(0, 6000) },
    ],
    temperature: 0.4,
    maxTokens: 500,
  });
}
