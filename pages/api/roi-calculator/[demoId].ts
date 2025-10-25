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

    // Fetch demo data
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
    const insights = demo.insights || {};
    const profitInsights = insights.profit_iq || "";

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

    // Generate ROI projections using AI
    const roiProjections = await generateROIProjections(
      businessName,
      summary,
      keyItems,
      profitInsights
    );

    return res.status(200).json(roiProjections);
  } catch (error) {
    console.error("ROI calculation error:", error);
    return res.status(500).json({ error: "ROI calculation failed" });
  }
}

async function generateROIProjections(
  businessName: string,
  summary: string,
  keyItems: string[],
  profitInsights: string
) {
  const prompt = `Generate realistic ROI financial projections for ${businessName}.

BUSINESS CONTEXT:
${summary.slice(0, 200)}

KEY OFFERINGS:
${keyItems.slice(0, 5).join(", ")}

STRATEGIC INSIGHTS:
${profitInsights.slice(0, 500)}

Create detailed financial projections showing ROI from implementing the strategic recommendations.

JSON format:
{
  "initialInvestment": {
    "total": 5000-15000,
    "breakdown": [
      {"item": "Website improvements", "cost": 2000-4000},
      {"item": "Marketing campaigns", "cost": 1500-3000},
      {"item": "Tools/Software", "cost": 500-1500},
      {"item": "Training/Consulting", "cost": 1000-2500}
    ]
  },
  "projectedRevenue": {
    "month3": {"revenue": 2000-5000, "description": "Early gains from quick wins"},
    "month6": {"revenue": 5000-12000, "description": "Momentum building with marketing"},
    "month12": {"revenue": 15000-35000, "description": "Full strategy implementation"}
  },
  "metrics": {
    "breakEvenMonths": 3-6,
    "roi3Month": "20-40%",
    "roi6Month": "80-150%",
    "roi12Month": "200-400%",
    "projectedAnnualGrowth": "25-45%"
  },
  "keyDrivers": [
    "Improved conversion rate increasing sales by X%",
    "Enhanced online presence attracting Y new customers monthly",
    "Operational efficiency reducing costs by Z%"
  ]
}

Base projections on their SPECIFIC business type and market. Be realistic but optimistic.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a financial analyst specializing in small business ROI projections. Generate realistic, achievable financial forecasts based on strategic improvements.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 800,
    jsonMode: true,
  });

  return JSON.parse(response);
}
