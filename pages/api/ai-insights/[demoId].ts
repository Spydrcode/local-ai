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

    const prompt = `Generate 5-7 AI-powered business insights for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Provide specific, actionable insights that cover:
1. Market positioning opportunities
2. Growth potential areas
3. Competitive advantages to leverage
4. Customer experience improvements
5. Digital marketing opportunities
6. Operational efficiency suggestions
7. Revenue optimization strategies

Return JSON array of insights (strings):
[
  "Specific insight #1 mentioning their business/products",
  "Actionable insight #2 with specific recommendations",
  "Market insight #3 based on their industry",
  "Growth insight #4 tailored to their offerings",
  "Strategic insight #5 with measurable outcomes"
]

CRITICAL: Each insight must be SPECIFIC to their actual business, products, services, or market. NO generic business advice.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a business intelligence analyst. Generate highly specific, actionable insights tailored to the actual business. Reference their products, services, and market in every insight.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 800,
      jsonMode: true,
    });

    const insights = JSON.parse(response);

    return res.status(200).json({
      insights: Array.isArray(insights) ? insights : insights.insights || [],
    });
  } catch (error) {
    console.error("AI insights generation error:", error);
    return res.status(500).json({ error: "Failed to generate AI insights" });
  }
}
