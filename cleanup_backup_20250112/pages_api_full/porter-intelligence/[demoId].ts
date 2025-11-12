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

    // Simple porter intelligence analysis
    const strategy = {
      competitiveForces: {
        rivalry: "Moderate competition in market",
        buyerPower: "Customers have some negotiating power",
        supplierPower: "Limited supplier dependencies",
        barriers: "Low barriers to entry",
      },
      recommendations: [
        "Differentiate through service quality",
        "Build customer loyalty programs",
        "Focus on niche markets",
      ],
    };

    return res.status(200).json(strategy);
  } catch (error) {
    console.error("Porter intelligence failed:", error);
    return res.status(500).json({ error: "Failed to generate analysis" });
  }
}
