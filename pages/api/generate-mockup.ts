import type { NextApiRequest, NextApiResponse } from "next";
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
    return res.status(400).json({ error: "demoId is required" });
  }

  try {
    // Fetch demo data
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: demo, error } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    // Return homepage blueprint if it exists
    if (demo.homepage_blueprint) {
      return res.status(200).json({
        success: true,
        mockup: demo.homepage_blueprint,
        redirectUrl: `/demo/${demoId}?tab=preview`,
      });
    }

    return res
      .status(404)
      .json({ error: "No homepage blueprint found. Generate a demo first." });
  } catch (error) {
    console.error("Generate mockup error:", error);
    return res.status(500).json({ error: "Failed to generate mockup" });
  }
}
