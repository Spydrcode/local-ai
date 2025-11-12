import { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "../../lib/query-engine";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, demoId, context } = req.body;

    if (!query || !demoId) {
      return res.status(400).json({ error: "Query and demoId required" });
    }

    const result = await executeQuery({ query, demoId, context });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Query engine error:", error);
    return res.status(500).json({
      error: "Query execution failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
