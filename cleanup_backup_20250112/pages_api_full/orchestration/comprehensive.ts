import { NextApiRequest, NextApiResponse } from "next";
import { AgentOrchestrator } from "../../../lib/orchestration/AgentOrchestrator";

/**
 * Comprehensive analysis endpoint
 *
 * Runs all agents in parallel and synthesizes results
 *
 * POST /api/orchestration/comprehensive
 * Body: { businessId: string, useStreaming?: boolean }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessId, useStreaming } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: "businessId is required" });
  }

  try {
    const orchestrator = new AgentOrchestrator();

    const results = await orchestrator.runComprehensiveAnalysis(businessId, {
      useStreaming,
      onProgress: useStreaming
        ? (progress) => {
            // Could send progress updates via WebSocket or SSE
            console.log("Progress:", progress);
          }
        : undefined,
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Orchestration error:", error);
    res.status(500).json({
      error: "Analysis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get orchestrator status
 *
 * GET /api/orchestration/comprehensive/status
 */
export async function getStatus(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const orchestrator = new AgentOrchestrator();
    const statuses = orchestrator.getAgentStatuses();

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Status error:", error);
    res.status(500).json({
      error: "Failed to get status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
