import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Demo ID is required" });
  }

  try {
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const prompt = `Analyze profit optimization opportunities for ${demo.business_name} in the ${demo.industry} industry.

Business Context: ${demo.business_description || demo.summary}

Identify specific ways to increase margins without raising prices:

1. COST REDUCTION OPPORTUNITIES
   - Operational inefficiencies to eliminate
   - Supplier negotiations potential
   - Technology automation savings

2. REVENUE OPTIMIZATION
   - Upselling opportunities
   - Cross-selling potential
   - Service bundling options

3. PROCESS IMPROVEMENTS
   - Workflow optimizations
   - Time-saving measures
   - Quality improvements that reduce costs

4. PRICING STRATEGY REFINEMENTS
   - Value-based pricing opportunities
   - Premium service tiers
   - Subscription or recurring revenue models

Return as JSON with structure:
{
  "costReduction": {
    "opportunities": ["opportunity1", "opportunity2"],
    "potentialSavings": "$X,XXX annually"
  },
  "revenueOptimization": {...},
  "processImprovements": {...},
  "pricingStrategy": {...},
  "totalProfitIncrease": "X% margin improvement"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(content || "{}");
    } catch {
      analysis = { error: "Failed to parse profit optimization" };
    }

    const { error: updateError } = await supabase
      .from("demos")
      .update({
        profit_optimizer: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Profit optimizer error:", error);
    return res.status(500).json({
      error: "Failed to generate profit optimization",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}