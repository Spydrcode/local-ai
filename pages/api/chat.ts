import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createChatCompletion } from "../../lib/openai";
import { CHATBOT_SYSTEM_PROMPT } from "../../lib/prompts";
import { embedText, similaritySearch } from "../../lib/vector";
import { getDemoFromCache } from "../../server/demoCache";
import { throttle } from "../../server/rateLimiter";
import { supabaseAdmin } from "../../server/supabaseAdmin";
import type { GeneratedDemo } from "../../types/demo";

const requestSchema = z.object({
  demoId: z.string(),
  message: z.string().min(2),
  sessionId: z.string().optional(),
});

interface ChatResponseBody {
  reply: string;
  sources: Array<{ id: string; score: number }>;
}

async function loadDemo(demoId: string) {
  const cached = getDemoFromCache(demoId);
  if (cached) {
    return cached;
  }

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("demos")
      .select(
        "id, client_id, summary, key_items, chatbot_config, insights, social_posts, homepage_blueprint, blog_post, site_url"
      )
      .eq("id", demoId)
      .maybeSingle();

    if (error) {
      console.warn("Demo fetch error", error.message);
    }

    if (data) {
      const normalized: GeneratedDemo = {
        id: data.id as string,
        clientId: (data.client_id as string) ?? "unknown-client",
        url: (data.site_url as string) ?? undefined,
        summary: (data.summary as string) ?? "",
        keyItems: Array.isArray(data.key_items)
          ? (data.key_items as string[])
          : [],
        chatbotConfig:
          (data.chatbot_config as GeneratedDemo["chatbotConfig"]) ?? {
            persona: "LocalIQ assistant",
            faq: [],
          },
        insights: (data.insights as GeneratedDemo["insights"]) ?? {
          profitIq: "",
          actions: [],
        },
        socialPosts: (data.social_posts as GeneratedDemo["socialPosts"]) ?? [],
        homepage: (data.homepage_blueprint as GeneratedDemo["homepage"]) ?? {
          hero: {
            headline: "Custom homepage concept",
            subheadline: "",
            ctaLabel: "",
            backgroundIdea: "",
          },
          sections: [],
          style: {
            primaryColor: "#0f172a",
            secondaryColor: "#1e293b",
            accentColor: "#34d399",
            tone: "Local",
          },
        },
        blogPost: (data.blog_post as GeneratedDemo["blogPost"]) ?? {
          title: "",
          excerpt: "",
          outline: [],
          body: "",
          suggestedTags: [],
        },
        createdAt: new Date().toISOString(),
      };

      return normalized;
    }
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponseBody | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(`${req.socket.remoteAddress ?? "anonymous"}:chat`);
  } catch (throttleError) {
    return res.status(429).json({ error: "Too many requests" });
  }

  const parseResult = requestSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { demoId, message } = parseResult.data;

  const demo = await loadDemo(demoId);
  if (!demo) {
    return res.status(404).json({ error: "Demo not found" });
  }

  try {
    const { embedding } = await embedText(message);
    const embeddingArray = Array.isArray(embedding)
      ? Array.isArray(embedding[0])
        ? embedding[0]
        : embedding
      : [embedding as number];
    const matches = await similaritySearch({
      demoId: demoId,
      queryEmbedding: embeddingArray as number[],
      topK: 3,
    });

    const contextBlock = matches
      .map((match) => `Chunk ${match.id}: ${match.content}`)
      .join("\n\n");

    const systemPrompt = `${CHATBOT_SYSTEM_PROMPT}\nBusiness URL: ${demo.url ?? "unknown"}\nBrand voice: ${demo.chatbotConfig.persona ?? "Helpful local expert"}\nContext:\n${contextBlock || demo.summary}`;

    const reply = await createChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      maxTokens: 700,
    });

    return res.status(200).json({
      reply,
      sources: matches.map((match) => ({ id: match.id, score: match.score })),
    });
  } catch (error) {
    console.error("Chat handler failed", error);
    return res.status(500).json({ error: "Chat generation failed" });
  }
}
