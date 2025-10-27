/**
 * Business Model Canvas API Endpoint
 *
 * Executes OsterwalderAgent to generate 9-block Business Model Canvas
 */

import type {
  AgentOutput,
  BusinessContext,
} from "@/lib/agents/hbs/core/HBSAgent";
import type { BusinessModelCanvas } from "@/lib/agents/hbs/strategy/OsterwalderAgent";
import { OsterwalderAgent } from "@/lib/agents/hbs/strategy/OsterwalderAgent";
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
    console.log(
      `[Business Model Canvas API] Starting analysis for demo ${demoId}`
    );

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
      console.error("[Business Model Canvas API] Demo not found:", demoError);
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

    // Add previous analyses if available
    const previousAnalyses: any = {};

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

    // Initialize and run Osterwalder agent
    const agent = new OsterwalderAgent();

    const output: AgentOutput<BusinessModelCanvas> =
      await agent.analyze(context);

    console.log(
      `[Business Model Canvas API] Analysis completed in ${output.execution_time_ms}ms`
    );
    console.log(
      `[Business Model Canvas API] Confidence: ${output.confidence_score}`
    );
    console.log(
      `[Business Model Canvas API] Canvas coherence: ${output.analysis.canvas_coherence_score}`
    );

    // Store in database
    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        business_model_canvas: output,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("[Business Model Canvas API] Failed to save:", updateError);
      return res.status(500).json({
        error: "Failed to save Business Model Canvas",
        details: updateError.message,
      });
    }

    console.log(`[Business Model Canvas API] Saved to database`);

    // Store vectors in Pinecone/Supabase for similarity search
    try {
      const { storeBusinessModelVectors } = await import("@/lib/vector-hbs");
      await storeBusinessModelVectors(demoId, output);
      console.log(`[Business Model Canvas API] Vectors stored successfully`);
    } catch (vectorError) {
      console.error(
        "[Business Model Canvas API] Failed to store vectors:",
        vectorError
      );
      // Don't fail the entire request if vector storage fails
    }

    // Return analysis
    return res.status(200).json({
      success: true,
      demoId,
      canvas: output.analysis,
      insights: output.insights,
      recommendations: output.recommendations,
      confidence_score: output.confidence_score,
      execution_time_ms: output.execution_time_ms,
    });
  } catch (error) {
    console.error("[Business Model Canvas API] Error:", error);

    return res.status(500).json({
      error: "Failed to generate Business Model Canvas",
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
