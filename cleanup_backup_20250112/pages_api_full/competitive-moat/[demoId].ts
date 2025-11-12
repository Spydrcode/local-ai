import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    const { data: demo, error } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    // Simple competitive moat analysis
    const strategy = {
      competitiveAdvantages: [
        "Established customer base",
        "Specialized expertise",
        "Local market knowledge",
      ],
      defensiveStrategies: [
        "Focus on customer retention",
        "Invest in quality improvements",
        "Build brand loyalty",
      ],
      marketPosition: "Well-positioned with room for growth",
    };

    return res.status(200).json(strategy);
  } catch (error) {
    console.error("Strategic analysis failed:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate strategic analysis" });
  }
}
