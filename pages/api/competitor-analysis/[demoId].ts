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

    const prompt = `Competitive analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Based on their SPECIFIC business type, location, and offerings, identify:
1. 3-5 realistic direct competitors (actual companies if possible, or realistic examples)
2. Market opportunities specific to THEIR niche

Return JSON:
{
  "competitors": [
    {
      "name": "Actual or realistic competitor name",
      "url": "domain.com (if known) or 'example.com'",
      "strengths": ["Specific strength relevant to this market", "Another strength"],
      "weaknesses": ["Specific weakness they can exploit", "Another weakness"]
    }
  ],
  "opportunities": [
    "Specific market opportunity for THIS business",
    "Another opportunity mentioning their products/services",
    "Opportunity based on their unique position"
  ]
}

CRITICAL: Reference their actual business type, products, or location in every competitor and opportunity.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a competitive intelligence analyst. Generate realistic, industry-specific competitor analysis using the actual business details provided.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 800,
      jsonMode: true,
    });

    const competitorAnalysis = JSON.parse(response);

    return res.status(200).json(competitorAnalysis);
  } catch (error) {
    console.error("Competitor analysis error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate competitor analysis" });
  }
}
