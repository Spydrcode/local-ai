import { customerJourneyAgent } from "@/lib/agents/strategic-frameworks/CustomerJourneyAgent";
import { AgencyService } from "@/lib/services/agency-service";
import { supabaseAdmin } from "@/server/supabaseAdmin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const { demoId } = req.query;
    if (!demoId || typeof demoId !== "string")
      return res.status(400).json({ error: "Invalid demo ID" });
    const { data: demo, error: demoError } = await supabaseAdmin!
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();
    if (demoError || !demo)
      return res.status(404).json({ error: "Demo not found" });
    if (
      demo.agency_id &&
      !(await AgencyService.canCreateReport(demo.agency_id))
    )
      return res.status(429).json({ error: "Limit reached" });
    const result = await customerJourneyAgent.analyze({
      businessName: demo.business_name,
      websiteUrl: demo.website_url,
      industry: demo.industry || "general",
      siteSummary: demo.site_summary,
    });
    if (demo.agency_id && demo.created_by_email) {
      await AgencyService.logActivity(
        demo.agency_id,
        demo.created_by_email,
        "analyzed_customer_journey",
        demoId
      );
      await AgencyService.incrementReportUsage(demo.agency_id);
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: "Failed to generate Customer Journey",
        details: error instanceof Error ? error.message : "Unknown error",
      });
  }
}
