import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Prevent caching to ensure fresh data on new analyses
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const { demoId } = req.query;

  try {
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

    const websiteUrl = demo.site_url || "https://example.com";
    const summary = demo.summary || "";
    const keyItems = demo.key_items || [];

    // Extract business name - prioritize client_id (set by quick-analyze)
    let businessName = "Business";

    // First check client_id (most reliable for quick-analyze demos)
    if (demo.client_id && demo.client_id !== "unknown") {
      businessName = demo.client_id;
    } else if (
      summary &&
      summary !== "Analysis pending - use on-demand tools to generate insights"
    ) {
      // Try extracting from summary if it's not the generic placeholder
      const summaryMatch = summary.match(
        /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
      );
      if (summaryMatch) {
        businessName = summaryMatch[1].trim();
      }
    }

    // Fallback to URL extraction
    if (businessName === "Business" && websiteUrl) {
      const urlMatch = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
      if (urlMatch) {
        businessName = urlMatch[1]
          .split(/[-_]/)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    return res.status(200).json({
      demoId,
      businessName,
      websiteUrl,
      siteSummary: summary,
      keyItems,
    });
  } catch (error) {
    console.error("Failed to fetch demo data:", error);
    return res.status(500).json({ error: "Failed to fetch demo data" });
  }
}
