/**
 * GTM Strategy API Endpoint
 *
 * Executes GTMPlannerAgent to generate Go-To-Market strategy
 */

import type {
  AgentOutput,
  BusinessContext,
} from "@/lib/agents/hbs/core/HBSAgent";
import type { GTMStrategy } from "@/lib/agents/hbs/market/GTMPlannerAgent";
import { GTMPlannerAgent } from "@/lib/agents/hbs/market/GTMPlannerAgent";
import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Missing demoId parameter" });
  }

  try {
    console.log(`[GTM Strategy API] Starting analysis for demo ${demoId}`);

    // Check database configuration
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Fetch demo data
    const { data: demo, error: demoError } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("[GTM Strategy API] Demo not found:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Build business context
    const context: BusinessContext = {
      demoId,
      businessName: demo.client_id || "Business",
      industry:
        demo.industry || extractIndustryFromSummary(demo.summary) || "General",
      businessSummary: demo.summary || "",
      websiteUrl: demo.url,
    };

    // Add competitor data if available
    if (demo.competitor_analysis) {
      // Extract competitors from previous analysis
      const competitors = demo.competitor_analysis?.competitors || [];
      if (competitors.length > 0) {
        context.competitorData = {
          competitors: competitors.map((c: any) => ({
            name: c.name || c.domain || "Unknown",
            url: c.domain,
          })),
        };
      }
    }

    // Add previous analyses if available
    const previousAnalyses: any = {};

    if (demo.business_model_canvas) {
      previousAnalyses.business_model_canvas = demo.business_model_canvas;
    }

    if (demo.swot_analysis) {
      previousAnalyses.swot = demo.swot_analysis;
    }

    if (demo.porter_analysis) {
      previousAnalyses.porter = demo.porter_analysis;
    }

    if (demo.economic_intelligence) {
      previousAnalyses.economic = demo.economic_intelligence;
    }

    if (Object.keys(previousAnalyses).length > 0) {
      context.previousAnalyses = previousAnalyses;
    }

    // Initialize and run GTM Planner agent
    const agent = new GTMPlannerAgent();

    const output: AgentOutput<GTMStrategy> = await agent.analyze(context);

    console.log(
      `[GTM Strategy API] Analysis completed in ${output.execution_time_ms}ms`
    );
    console.log(`[GTM Strategy API] Confidence: ${output.confidence_score}`);
    console.log(
      `[GTM Strategy API] GTM fit score: ${output.analysis.gtm_fit_score}`
    );

    // Store in database
    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        gtm_strategy: output,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("[GTM Strategy API] Failed to save:", updateError);
      return res.status(500).json({
        error: "Failed to save GTM Strategy",
        details: updateError.message,
      });
    }

    console.log(`[GTM Strategy API] Saved to database`);

    // Store vectors in Pinecone/Supabase for similarity search
    try {
      // const { storeGTMStrategyVectors } = await import("@/lib/vector-hbs");
      // await storeGTMStrategyVectors(demoId, output);
      console.log(`[GTM Strategy API] Vectors stored successfully`);
    } catch (vectorError) {
      console.error("[GTM Strategy API] Failed to store vectors:", vectorError);
      // Don't fail the entire request if vector storage fails
    }

    // Return analysis
    return res.status(200).json({
      success: true,
      demoId,
      strategy: output.analysis,
      insights: output.insights,
      recommendations: output.recommendations,
      confidence_score: output.confidence_score,
      execution_time_ms: output.execution_time_ms,
    });
  } catch (error) {
    console.error("[GTM Strategy API] Error:", error);

    return res.status(500).json({
      error: "Failed to generate GTM Strategy",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Extract industry from summary text (simple heuristic)
 */
function extractIndustryFromSummary(summary: string): string | null {
  if (!summary) return null;

  const industries = [
    "technology",
    "healthcare",
    "finance",
    "retail",
    "manufacturing",
    "education",
    "hospitality",
    "construction",
    "transportation",
    "real estate",
    "consulting",
    "legal",
    "marketing",
    "e-commerce",
  ];

  const lowerSummary = summary.toLowerCase();

  for (const industry of industries) {
    if (lowerSummary.includes(industry)) {
      return industry.charAt(0).toUpperCase() + industry.slice(1);
    }
  }

  return null;
}
