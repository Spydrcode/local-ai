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

    // Simple SWOT analysis
    const swot = {
      strengths: [
        "Established presence",
        "Quality service",
        "Local reputation",
      ],
      weaknesses: ["Limited online presence", "Outdated systems", "Small team"],
      opportunities: [
        "Digital transformation",
        "Market expansion",
        "New services",
      ],
      threats: [
        "Increased competition",
        "Economic uncertainty",
        "Technology changes",
      ],
    };

    return res.status(200).json(swot);
  } catch (error) {
    console.error("SWOT generation failed:", error);
    return res.status(500).json({ error: "Failed to generate SWOT analysis" });
  }
}
