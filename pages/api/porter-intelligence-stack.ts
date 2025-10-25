/**
 * Porter Intelligence Stack API Endpoint
 *
 * Runs all 9 specialized agents through the orchestrator
 * and returns comprehensive strategic analysis with synthesis
 */

import { NextApiRequest, NextApiResponse } from "next";
import {
  AgentContext,
  runPorterIntelligenceStack,
} from "../../lib/agents/orchestrator";
import { supabaseAdmin } from "../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.body;

  if (!demoId) {
    return res.status(400).json({ error: "demoId required" });
  }

  try {
    console.log(
      `[Porter Intelligence Stack] Starting analysis for demo ${demoId}`
    );

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Fetch demo data from Supabase
    const { data: demo, error: demoError } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("[Porter Intelligence Stack] Demo not found:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Build agent context
    const context: AgentContext = {
      demoId,
      businessName: demo.business_name || "Unknown Business",
      websiteUrl: demo.website_url,
      siteSummary: demo.site_summary,
      industry: demo.industry || undefined,
      // TODO: Add enrichedData from external APIs (Google Places, Yelp, etc.)
      enrichedData: undefined,
    };

    console.log(
      `[Porter Intelligence Stack] Running orchestrator for ${context.businessName}`
    );

    // Run the orchestrator (executes all 9 agents in parallel groups)
    const result = await runPorterIntelligenceStack(context);

    console.log(
      `[Porter Intelligence Stack] Completed in ${result.executionTime}ms`
    );
    console.log(
      `[Porter Intelligence Stack] Agents run: ${result.agents.length}`
    );
    console.log(
      `[Porter Intelligence Stack] Successful: ${result.agents.filter((a) => a.status === "success").length}`
    );
    console.log(
      `[Porter Intelligence Stack] Failed: ${result.agents.filter((a) => a.status === "error").length}`
    );

    // Update demo with porter analysis results
    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        porter_analysis: JSON.stringify(result),
        porter_synthesis: JSON.stringify(result.synthesis),
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error(
        "[Porter Intelligence Stack] Failed to save results:",
        updateError
      );
      // Don't fail the request - results are still returned
    }

    return res.status(200).json({
      success: true,
      demoId,
      result,
      message: `Porter Intelligence Stack completed in ${(result.executionTime / 1000).toFixed(2)}s`,
    });
  } catch (error) {
    console.error("[Porter Intelligence Stack] Error:", error);
    return res.status(500).json({
      error: "Failed to run Porter Intelligence Stack",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
