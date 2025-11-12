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

    const prompt = `Brand voice and messaging analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Based on THEIR specific business type, market position, and offerings, define:
1. Ideal brand tone (how they should sound)
2. Brand voice (their unique personality)
3. 3-5 key messaging pillars

Return JSON:
{
  "tone": "Specific tone description mentioning their industry/market",
  "voice": "Unique voice description referencing their position",
  "messaging": [
    "Key message #1 featuring their actual products/services",
    "Key message #2 about their unique value",
    "Key message #3 addressing their target market"
  ]
}

CRITICAL: Every element must be specific to THIS business - reference their actual offerings, market, or differentiators.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a brand strategist. Create highly specific brand voice and messaging tailored to the actual business details provided. Never give generic brand advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 600,
      jsonMode: true,
    });

    const brandAnalysis = JSON.parse(response);

    return res.status(200).json(brandAnalysis);
  } catch (error) {
    console.error("Brand analysis error:", error);
    return res.status(500).json({ error: "Failed to generate brand analysis" });
  }
}
