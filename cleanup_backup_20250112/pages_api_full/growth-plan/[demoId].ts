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

    const prompt = `Create a 90-day growth plan for ${demo.business_name} in the ${demo.industry} industry.

Business Context: ${demo.business_description || demo.summary}

Create a detailed 90-day plan with:
1. Month 1 (Days 1-30): Foundation & Quick Wins
2. Month 2 (Days 31-60): Growth Acceleration 
3. Month 3 (Days 61-90): Scale & Optimize

For each month include:
- 3-5 specific action items
- Expected revenue impact
- Resource requirements
- Success metrics
- Potential obstacles

Return as JSON with structure:
{
  "month1": {
    "focus": "Foundation & Quick Wins",
    "actions": ["action1", "action2"],
    "revenueImpact": "10-15% increase",
    "metrics": ["metric1", "metric2"]
  },
  "month2": {...},
  "month3": {...},
  "totalProjectedGrowth": "25% revenue increase"
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
      analysis = { error: "Failed to parse growth plan" };
    }

    const { error: updateError } = await supabase
      .from("demos")
      .update({
        growth_plan: analysis,
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
    console.error("Growth plan error:", error);
    return res.status(500).json({
      error: "Failed to generate growth plan",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}