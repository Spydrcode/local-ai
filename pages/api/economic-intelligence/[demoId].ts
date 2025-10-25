import type { NextApiRequest, NextApiResponse } from "next";
import {
  analyzeEconomicEnvironment,
  getCurrentEconomicContext,
  predictProfitWithEconomicFactors,
} from "../../../lib/agents/EconomicIntelligenceAgent";
import { supabaseAdmin } from "../../../server/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.body;

  if (!demoId) {
    return res.status(400).json({ error: "demoId required" });
  }

  try {
    console.log(`[Economic Intelligence] Starting analysis for demo ${demoId}`);

    // Fetch demo data
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

    // Extract industry from summary or infer from business context
    let industry = "General Business";
    const summary = demo.summary || "";

    // Industry extraction logic
    const industryPatterns = [
      {
        pattern: /propane|gas|fuel|energy/i,
        industry: "Propane/Energy Services",
      },
      {
        pattern: /restaurant|cafe|food|dining|bbq|catering/i,
        industry: "Food Service & Restaurants",
      },
      {
        pattern: /coffee|espresso|roast/i,
        industry: "Coffee/Specialty Beverage",
      },
      {
        pattern: /hvac|heating|cooling|air conditioning/i,
        industry: "HVAC Services",
      },
      {
        pattern: /plumb|electric|contractor/i,
        industry: "Home Services/Trades",
      },
      { pattern: /retail|store|shop/i, industry: "Retail" },
      {
        pattern: /consult|professional services|agency/i,
        industry: "Professional Services",
      },
      { pattern: /saas|software|tech/i, industry: "Technology/SaaS" },
      {
        pattern: /health|medical|dental|therapy/i,
        industry: "Healthcare Services",
      },
      { pattern: /legal|law|attorney/i, industry: "Legal Services" },
      { pattern: /real estate|property/i, industry: "Real Estate" },
      {
        pattern: /automotive|auto repair|mechanic/i,
        industry: "Automotive Services",
      },
      { pattern: /salon|spa|beauty/i, industry: "Personal Care Services" },
      { pattern: /fitness|gym|wellness/i, industry: "Fitness & Wellness" },
    ];

    for (const { pattern, industry: detectedIndustry } of industryPatterns) {
      if (pattern.test(summary)) {
        industry = detectedIndustry;
        break;
      }
    }

    console.log(`[Economic Intelligence] Detected industry: ${industry}`);

    // Run economic analyses in parallel
    const [economicContext, industryImpact, profitPrediction] =
      await Promise.all([
        getCurrentEconomicContext(),
        analyzeEconomicEnvironment(industry, summary),
        predictProfitWithEconomicFactors(
          demo.client_id || demo.id,
          industry,
          summary
        ),
      ]);

    const economicIntelligence = {
      demoId,
      industry,
      generatedAt: new Date().toISOString(),
      economicContext,
      industryImpact,
      profitPrediction,
    };

    // Save to database
    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        economic_intelligence: economicIntelligence,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("Failed to save economic intelligence:", updateError);
    }

    console.log(`[Economic Intelligence] Analysis complete for demo ${demoId}`);

    return res.status(200).json({
      success: true,
      data: economicIntelligence,
    });
  } catch (error) {
    console.error("Economic intelligence analysis failed:", error);
    return res.status(500).json({
      error: "Economic analysis failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
