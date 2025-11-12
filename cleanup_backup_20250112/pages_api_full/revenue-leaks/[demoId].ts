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
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const demoId = req.method === "POST" ? req.body.demoId : req.query.demoId;

  if (!demoId) {
    return res.status(400).json({ error: "demoId required" });
  }

  try {
    const { data: demo, error } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const businessType = demo.client_id || "Business";
    const businessContext = demo.summary || "";
    const estimatedRevenue = 250000;

    // Simple revenue leaks analysis
    const revenueLeaksAnalysis = {
      demoId,
      businessType,
      investigation: {
        leaks: [
          "Unclear pricing",
          "Missing call-to-actions",
          "Poor mobile experience",
        ],
        recommendations: [
          "Simplify pricing display",
          "Add prominent contact forms",
          "Optimize for mobile",
        ],
        potentialRevenue: "15-25% increase with improvements",
      },
      generatedAt: new Date().toISOString(),
      success: true,
    };

    const { error: updateError } = await supabase
      .from("demos")
      .update({ revenue_leaks: revenueLeaksAnalysis })
      .eq("id", demoId);

    if (updateError) {
      console.error("Failed to save revenue leaks analysis:", updateError);
    }

    return res.status(200).json({
      success: true,
      data: revenueLeaksAnalysis,
    });
  } catch (error) {
    console.error("Revenue leaks detection failed:", error);
    return res.status(500).json({
      error: "Revenue leaks analysis failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
