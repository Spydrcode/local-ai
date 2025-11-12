import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../../lib/openai";
import { supabaseAdmin } from "../../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: demo, error } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const summary = demo.summary || "";
    const keyItems = demo.key_items || [];
    const websiteUrl = demo.site_url || "";

    // Extract business name
    let businessName = "Business";
    if (summary) {
      const summaryMatch = summary.match(
        /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
      );
      if (summaryMatch) {
        businessName = summaryMatch[1].trim();
      }
    }
    if (businessName === "Business" && websiteUrl) {
      const urlMatch = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
      if (urlMatch) {
        businessName = urlMatch[1]
          .split(/[-_]/)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    const prompt = `Generate 4-6 platform-specific social media posts for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Create engaging, platform-optimized posts for Facebook, Instagram, LinkedIn, and Twitter/X.

Return JSON:
[
  {
    "platform": "Facebook",
    "content": "Engaging post content with specific products/services mentioned",
    "emojis": "🎯💼"
  },
  {
    "platform": "Instagram",
    "content": "Visual-focused content highlighting their offerings",
    "emojis": "✨📸"
  }
]

CRITICAL: Each post must:
- Mention their actual business name, products, or services
- Be platform-appropriate (Facebook: conversational, Instagram: visual, LinkedIn: professional, Twitter: concise)
- Include relevant emojis
- Showcase their unique value proposition`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a social media strategist. Create engaging, platform-specific posts that showcase the business's unique offerings. Never create generic social media content.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 800,
      jsonMode: true,
    });

    const posts = JSON.parse(response);

    return res.status(200).json({
      posts: Array.isArray(posts) ? posts : posts.posts || [],
    });
  } catch (error) {
    console.error("Social media analysis error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate social media posts" });
  }
}
