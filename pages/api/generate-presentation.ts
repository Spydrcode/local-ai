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

    // Redirect to present mode
    return res.status(200).json({
      success: true,
      redirectUrl: `/demo/${demoId}?mode=present`,
    });
  } catch (error) {
    console.error("Generate presentation error:", error);
    return res.status(500).json({ error: "Failed to generate presentation" });
  }
}
