import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { analyzeSite } from "../../lib/agents/siteAnalysis";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Generate demo ID
    const demoId = Math.random().toString(36).substring(2, 15);

    // Analyze site
    const analysis = await analyzeSite(url);

    // Create demo record with analysis
    const { data, error } = await supabase
      .from("demos")
      .insert({
        id: demoId,
        client_id: analysis.businessName,
        summary: analysis.summary,
        site_url: url,
        key_items: analysis.coreServices,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error details:", error);
      return res.status(500).json({
        error:
          "Database error: " +
          (error.message || error.details || "Unknown error"),
      });
    }

    res.json({ demoId, businessName: analysis.businessName });
  } catch (error) {
    console.error("Quick analyze error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
}
