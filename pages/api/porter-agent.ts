/**
 * Single Porter Agent API Endpoint
 *
 * Runs a specific agent individually instead of the full stack
 */

import { NextApiRequest, NextApiResponse } from "next";
import {
  AgentContext,
  runSinglePorterAgent,
} from "../../lib/agents/orchestrator";
import { supabaseAdmin } from "../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId, agentName } = req.body;

  if (!demoId || !agentName) {
    return res.status(400).json({ error: "demoId and agentName required" });
  }

  // Validate agent name
  const validAgents = [
    "strategy-architect",
    "value-chain",
    "market-forces",
    "differentiation-designer",
    "profit-pool",
    "operational-effectiveness-optimizer",
    "local-strategy",
    "executive-advisor",
    "shared-value",
  ];

  if (!validAgents.includes(agentName)) {
    return res.status(400).json({
      error: "Invalid agent name",
      validAgents,
    });
  }

  try {
    console.log(`[Porter Agent] Running ${agentName} for demo ${demoId}`);

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
      console.error("[Porter Agent] Demo not found:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Build agent context
    const context: AgentContext = {
      demoId,
      businessName: demo.business_name || "Unknown Business",
      websiteUrl: demo.website_url,
      siteSummary: demo.site_summary,
      industry: demo.industry || undefined,
      enrichedData: undefined,
    };

    console.log(
      `[Porter Agent] Executing ${agentName} for ${context.businessName}`
    );

    // Run the single agent
    const result = await runSinglePorterAgent(context, agentName);

    console.log(
      `[Porter Agent] ${agentName} completed in ${result.executionTime}ms`
    );

    // Update demo with agent result (merge with existing porter_analysis if present)
    let existingAnalysis = null;
    try {
      existingAnalysis = demo.porter_analysis
        ? JSON.parse(demo.porter_analysis)
        : null;
    } catch (e) {
      console.error("[Porter Agent] Failed to parse existing analysis:", e);
    }

    // Update or add this agent's result
    if (existingAnalysis && existingAnalysis.agents) {
      // Find and update existing agent result, or add new one
      const agentIndex = existingAnalysis.agents.findIndex(
        (a: any) => a.agentName === agentName
      );
      if (agentIndex >= 0) {
        existingAnalysis.agents[agentIndex] = result;
      } else {
        existingAnalysis.agents.push(result);
      }
      existingAnalysis.timestamp = new Date().toISOString();
    } else {
      // Create new partial analysis
      existingAnalysis = {
        demoId,
        agents: [result],
        synthesis: null, // No synthesis for single agents
        executionTime: result.executionTime,
        timestamp: new Date().toISOString(),
        partial: true,
      };
    }

    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        porter_analysis: JSON.stringify(existingAnalysis),
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("[Porter Agent] Failed to save result:", updateError);
      // Don't fail the request - result is still returned
    }

    return res.status(200).json({
      success: true,
      demoId,
      agentName,
      result,
      message: `${agentName} completed in ${(result.executionTime! / 1000).toFixed(2)}s`,
    });
  } catch (error) {
    console.error("[Porter Agent] Error:", error);
    return res.status(500).json({
      error: "Failed to run agent",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
