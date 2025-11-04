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
    const inferBusinessName = (d: any) => {
      // Try client_id first (set by quick-analyze)
      if (d.client_id && d.client_id !== demoId && d.client_id !== 'unknown') {
        return d.client_id;
      }
      
      // Try key_items array
      if (d.key_items && Array.isArray(d.key_items) && d.key_items.length > 0) {
        return d.key_items[0];
      }
      
      // Try summary
      if (d.summary && d.summary.length > 10 && !d.summary.includes('pending')) {
        const match = d.summary.match(/^([A-Z][^.!?]{3,50})/);
        if (match) return match[1].trim();
      }
      
      // Extract from URL
      const url = d.site_url || d.website_url;
      if (url) {
        try {
          const u = new URL(url);
          const domain = u.hostname.replace('www.', '').split('.')[0];
          return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch (e) {}
      }
      
      return "Unknown Business";
    };

    const context: AgentContext = {
      demoId,
      businessName: inferBusinessName(demo),
      websiteUrl: demo.site_url || demo.website_url || '',
      siteSummary: demo.summary || demo.site_summary || '',
      industry: demo.industry || undefined,
      enrichedData: undefined,
    };

    console.log('[Porter Intelligence Stack] Context:', {
      businessName: context.businessName,
      websiteUrl: context.websiteUrl,
      hasSummary: !!context.siteSummary,
      demoData: { client_id: demo.client_id, key_items: demo.key_items, summary: demo.summary?.substring(0, 50) },
    });

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
    // Note: some deployments may be missing the porter_synthesis column (migration not applied).
    // To avoid write failures we only update porter_analysis (JSONB) which contains full results + synthesis.
    try {
      const { error: updateError } = await supabaseAdmin
        .from("demos")
        .update({
          porter_analysis: JSON.stringify(result),
        })
        .eq("id", demoId);

      if (updateError) {
        console.error(
          "[Porter Intelligence Stack] Failed to save results:",
          updateError
        );
      }
    } catch (e) {
      console.error("[Porter Intelligence Stack] Exception saving results:", e);
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
