import { supabaseAdmin } from "@/server/supabaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Early check for Supabase availability
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

  if (req.method === "GET") {
    try {
      const { data: agency, error } = await supabaseAdmin
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .single();

      if (error || !agency) {
        return res.status(404).json({ error: "Agency not found" });
      }

      return res.status(200).json(agency);
    } catch (error) {
      console.error("Get agency error:", error);
      return res.status(500).json({
        error: "Failed to fetch agency",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      const {
        name,
        logo_url,
        primary_color,
        secondary_color,
        footer_text,
        website_url,
      } = req.body;

      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = name;
      if (logo_url !== undefined) updates.logo_url = logo_url;
      if (primary_color !== undefined) updates.primary_color = primary_color;
      if (secondary_color !== undefined)
        updates.secondary_color = secondary_color;
      if (footer_text !== undefined) updates.footer_text = footer_text;
      if (website_url !== undefined) updates.website_url = website_url;

      const { data, error } = await supabaseAdmin
        .from("agencies")
        .update(updates)
        .eq("id", agencyId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: "Failed to update agency" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Update agency error:", error);
      return res.status(500).json({
        error: "Failed to update agency",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
