import { supabaseAdmin } from "@/server/supabaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Service unavailable",
      details:
        "Database not configured. Agency features require Supabase setup.",
    });
  }

  const { agencyId } = req.query;

  if (!agencyId || typeof agencyId !== "string") {
    return res.status(400).json({ error: "Invalid agency ID" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data: teamMembers, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch team members error:", error);
      return res.status(500).json({ error: "Failed to fetch team members" });
    }

    return res.status(200).json(teamMembers || []);
  } catch (error) {
    console.error("Team API error:", error);
    return res.status(500).json({
      error: "Failed to fetch team members",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
