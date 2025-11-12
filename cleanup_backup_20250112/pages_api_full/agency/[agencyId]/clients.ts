import { supabaseAdmin } from "@/server/supabaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { agencyId } = req.query;

  if (!agencyId || typeof agencyId !== "string") {
    return res.status(400).json({ error: "Invalid agency ID" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!supabaseAdmin) {
      console.error("Supabase admin client not initialized");
      return res.status(500).json({
        error: "Database configuration error",
        details: "Supabase client not available",
      });
    }

    const { data: clients, error } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch clients error:", error);
      return res.status(500).json({ error: "Failed to fetch clients" });
    }

    return res.status(200).json(clients || []);
  } catch (error) {
    console.error("Clients API error:", error);
    return res.status(500).json({
      error: "Failed to fetch clients",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
