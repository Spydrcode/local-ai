import { pestelAgent } from "@/lib/agents/strategic-frameworks/PESTELAgent";
import { AgencyService } from "@/lib/services/agency-service";
import { supabaseAdmin } from "@/server/supabaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId } = req.query;
    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    const { data: demo, error: demoError } = await supabaseAdmin!
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    if (demo.agency_id) {
      const canCreate = await AgencyService.canCreateReport(demo.agency_id);
      if (!canCreate) {
        return res.status(429).json({ error: "Monthly report limit reached" });
      }
    }

    // Execute PESTEL Agent with RAG
    const result = await pestelAgent.analyze({
      businessName: demo.business_name,
      websiteUrl: demo.website_url,
      industry: demo.industry || "general",
      location: demo.location || "US",
      siteSummary: demo.site_summary,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    if (demo.agency_id && demo.created_by_email) {
      await AgencyService.logActivity(
        demo.agency_id,
        demo.created_by_email,
        "analyzed_pestel",
        demoId
      );
      await AgencyService.incrementReportUsage(demo.agency_id);
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error("PESTEL analysis error:", error);
    return res.status(500).json({
      error: "Failed to generate PESTEL analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
