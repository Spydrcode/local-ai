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

    const prompt = `Conversion optimization analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Analyze THEIR specific customer journey and provide tailored recommendations:

1. Map their typical customer path (from discovery to conversion)
2. Identify 4-6 specific optimization opportunities
3. Project realistic conversion improvements

Return JSON:
{
  "currentPath": [
    "Step 1: How customers discover THIS business",
    "Step 2: Initial engagement (specific to their offerings)",
    "Step 3: Consideration phase actions",
    "Step 4: Conversion point for their business"
  ],
  "recommendations": [
    "Specific recommendation #1 using their actual products/services",
    "Recommendation #2 mentioning their business type/market",
    "Recommendation #3 tailored to their customer journey",
    "Recommendation #4 based on their offerings"
  ],
  "projectedImprovement": "Realistic percentage increase (20-40%) with SPECIFIC outcome mentioning their business/products"
}

CRITICAL: Reference their actual business, products, services, or market in every recommendation.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a conversion rate optimization specialist. Provide highly specific, actionable recommendations tailored to the actual business. Never give generic CRO advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 700,
      jsonMode: true,
    });

    const conversionAnalysis = JSON.parse(response);

    return res.status(200).json(conversionAnalysis);
  } catch (error) {
    console.error("Conversion analysis error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate conversion analysis" });
  }
}
