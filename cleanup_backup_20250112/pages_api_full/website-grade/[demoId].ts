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

    const prompt = `Analyze the website and digital presence for ${businessName} and provide a detailed, SPECIFIC assessment.

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item: string, i: number) => `${i + 1}. ${item}`).join("\n")}

Based on this SPECIFIC business, their industry, and their unique offerings:

1. Estimate a realistic website grade (score out of 100)
2. Provide 5 SPECIFIC improvements tailored to THIS business (not generic web advice)
3. Calculate realistic ROI projection based on THEIR market and offerings

Return JSON format:
{
  "score": 60-90,
  "improvements": [
    "Specific improvement #1 using their actual products/services",
    "Specific improvement #2 mentioning their actual business type",
    "Specific improvement #3 addressing their unique market",
    "Specific improvement #4 based on their offerings",
    "Specific improvement #5 tailored to their industry"
  ],
  "roiProjection": "Detailed ROI projection mentioning specific improvements and realistic timeframe for THIS business type"
}

CRITICAL: Every improvement and ROI projection must reference their ACTUAL business name, products, services, or industry. NO GENERIC ADVICE.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a web performance analyst. Provide highly specific, business-tailored grades and actionable improvements. Never give generic advice - always reference the actual business, their products, and their market.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 800,
      jsonMode: true,
    });

    const websiteGrade = JSON.parse(response);

    return res.status(200).json(websiteGrade);
  } catch (error) {
    console.error("Website grade generation error:", error);
    return res.status(500).json({ error: "Failed to generate website grade" });
  }
}
