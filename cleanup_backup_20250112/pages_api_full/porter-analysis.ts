import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../lib/openai";
import {
  COMPETITIVE_POSITIONING_PROMPT,
  PORTER_5_FORCES_PROMPT,
  VALUE_CHAIN_PROMPT,
} from "../../lib/porter-analysis";
import { supabaseAdmin } from "../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId, analysisType = "all" } = req.body;

  if (!demoId) {
    return res.status(400).json({ error: "demoId is required" });
  }

  try {
    // Fetch demo data
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

    const businessContext = `
Business Summary: ${demo.summary || "No summary available"}

Key Services/Products: ${(demo.key_items || []).join(", ")}

Website: ${demo.site_url || "Unknown"}

Existing Insights: ${demo.insights || "None"}

Location/Market: Extract from summary if available
`;

    const results: any = {};

    // Porter's 5 Forces Analysis
    if (analysisType === "all" || analysisType === "forces") {
      const forcesResponse = await createChatCompletion({
        messages: [
          { role: "system", content: PORTER_5_FORCES_PROMPT },
          {
            role: "user",
            content: `Analyze this business using Porter's Five Forces:\n\n${businessContext}\n\nProvide detailed analysis of all 5 forces with specific, actionable insights.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      results.fiveForces = forcesResponse;
    }

    // Value Chain Analysis
    if (analysisType === "all" || analysisType === "valuechain") {
      const valueChainResponse = await createChatCompletion({
        messages: [
          { role: "system", content: VALUE_CHAIN_PROMPT },
          {
            role: "user",
            content: `Analyze this business's value chain:\n\n${businessContext}\n\nIdentify competitive advantages and improvement opportunities in both primary and support activities.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      results.valueChain = valueChainResponse;
    }

    // Competitive Positioning
    if (analysisType === "all" || analysisType === "positioning") {
      const positioningResponse = await createChatCompletion({
        messages: [
          { role: "system", content: COMPETITIVE_POSITIONING_PROMPT },
          {
            role: "user",
            content: `Analyze competitive positioning:\n\n${businessContext}\n\nRecommend optimal strategic positioning using Porter's Generic Strategies framework.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      });

      results.positioning = positioningResponse;
    }

    // Store strategic analysis
    if (supabaseAdmin && analysisType === "all") {
      await supabaseAdmin
        .from("demos")
        .update({
          strategic_analysis: results,
          updated_at: new Date().toISOString(),
        })
        .eq("id", demoId);
    }

    return res.status(200).json({
      success: true,
      demoId,
      analysisType,
      ...results,
    });
  } catch (error) {
    console.error("Porter analysis error:", error);
    return res.status(500).json({
      error: "Strategic analysis failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
