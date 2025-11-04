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

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Demo ID is required" });
  }

  try {
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    // Simple quick wins generation without agent dependency
    const quickWins = [
      "Optimize website loading speed",
      "Add customer testimonials to homepage",
      "Improve call-to-action buttons",
      "Set up Google My Business profile",
      "Create weekly social media content",
    ];

    const { error: updateError } = await supabase
      .from("demos")
      .update({ quick_wins: quickWins })
      .eq("id", demoId);

    if (updateError) {
      console.error("Failed to save quick wins:", updateError);
    }

    return res.status(200).json({
      success: true,
      data: quickWins,
    });
  } catch (err) {
    console.error("Quick wins analysis error:", err);
    return res.status(500).json({
      error: "Failed to generate quick wins analysis",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
