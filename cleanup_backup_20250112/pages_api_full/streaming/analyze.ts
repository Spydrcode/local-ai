import { NextApiRequest, NextApiResponse } from "next";
import { SSEStreamingAgent } from "../../../lib/streaming/StreamingAgent";

/**
 * Streaming analysis endpoint
 *
 * Usage:
 * GET /api/streaming/analyze?businessId=xxx&agentType=strategic
 *
 * Response: Server-Sent Events (SSE) stream with real-time progress
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessId, agentType } = req.query;

  if (!businessId || typeof businessId !== "string") {
    return res.status(400).json({ error: "businessId is required" });
  }

  if (
    !agentType ||
    !["strategic", "marketing", "competitive"].includes(agentType as string)
  ) {
    return res
      .status(400)
      .json({
        error:
          "Valid agentType is required (strategic, marketing, competitive)",
      });
  }

  try {
    await SSEStreamingAgent.streamToResponse(res, {
      businessId,
      agentType: agentType as any,
    });
  } catch (error) {
    console.error("Streaming error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Streaming failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
