import { leanCanvasAgent } from "@/lib/agents/strategic-frameworks/LeanCanvasAgent";
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

    // Execute Lean Canvas Agent with RAG
    const result = await leanCanvasAgent.analyze({
      businessName: demo.business_name,
      websiteUrl: demo.website_url,
      industry: demo.industry || "general",
      siteSummary: demo.site_summary,
      stage: "mvp", // Could be extracted from demo metadata if available
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    if (demo.agency_id && demo.created_by_email) {
      await AgencyService.logActivity(
        demo.agency_id,
        demo.created_by_email,
        "analyzed_lean_canvas",
        demoId
      );
      await AgencyService.incrementReportUsage(demo.agency_id);
    }

    return res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    console.error("Lean Canvas error:", error);
    return res.status(500).json({
      error: "Failed to generate Lean Canvas",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
