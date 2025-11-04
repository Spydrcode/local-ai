import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../../lib/query-engine";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId } = req.query;
    const { message, conversationHistory } = req.body;

    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`💬 AI Chat request for demo ${demoId}`);

    // Use QueryEngine for intelligent routing
    const result = await executeQuery({
      query: message,
      demoId,
    });

    console.log(`✅ AI Chat response generated (intent: ${result.plan.intent}, cached: ${result.cached})`);

    return res.status(200).json({
      reply: result.answer,
      timestamp: new Date().toISOString(),
      sources: result.sources,
      plan: result.plan,
      executionTime: result.executionTime,
      cached: result.cached,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return res.status(500).json({
      error: "Failed to get chat response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
