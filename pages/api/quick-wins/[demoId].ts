import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    // Get demo data
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const { business_name, website_url, industry, business_description } = demo;

    // Quick Wins Generator Agent
    const prompt = `You are a Quick Wins Action Agent specializing in immediate, high-impact moves for SMBs.

Business Context:
- Business: ${business_name}
- Industry: ${industry}
- Description: ${business_description}
- Website: ${website_url}

Generate actionable tasks that can be completed THIS WEEK with immediate business impact:

1. MONDAY'S REVENUE BOOSTER
   - 1 specific action to increase sales this week
   - Exact steps to implement (15-30 min max)
   - Expected impact and timeline

2. TUESDAY'S CUSTOMER MAGNET
   - 1 way to attract more customers this week
   - Simple marketing move that costs under $50
   - Where to do it and what to say exactly

3. WEDNESDAY'S EFFICIENCY WIN
   - 1 process to streamline that saves time/money
   - How to implement in 1 hour or less
   - Tools or methods to use

4. THURSDAY'S COMPETITIVE EDGE
   - 1 way to stand out from competitors immediately
   - Something competitors probably aren't doing
   - Easy to execute advantage

5. FRIDAY'S RELATIONSHIP BUILDER
   - 1 action to strengthen customer relationships
   - Personal touch that builds loyalty
   - Takes 30 minutes but creates lasting impact

6. WEEKEND PROJECT (Optional)
   - 1 bigger project for 2-3 hours that pays off next week
   - Content creation, system setup, or strategic prep
   - Sets up success for following week

Format as JSON with sections: monday_revenue, tuesday_customer, wednesday_efficiency, thursday_competitive, friday_relationship, weekend_project.
Each action should include: action, steps, time_required, expected_impact, cost_estimate.
Be ultra-specific and actionable. No vague advice - exact steps only.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1800,
    });

    const content = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(content || "{}");
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        monday_revenue: content?.split("MONDAY")[1]?.split("TUESDAY")[0] || "",
        tuesday_customer:
          content?.split("TUESDAY")[1]?.split("WEDNESDAY")[0] || "",
        wednesday_efficiency:
          content?.split("WEDNESDAY")[1]?.split("THURSDAY")[0] || "",
        thursday_competitive:
          content?.split("THURSDAY")[1]?.split("FRIDAY")[0] || "",
        friday_relationship:
          content?.split("FRIDAY")[1]?.split("WEEKEND")[0] || "",
        weekend_project: content?.split("WEEKEND")[1] || "",
      };
    }

    // Store in database
    const { error: updateError } = await supabase
      .from("demos")
      .update({
        quick_wins: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    // Store vectors for enhanced search (if Pinecone is enabled)
    try {
      const { storeAgentVectors } = await import("../../../lib/vector-utils");
      await storeAgentVectors(
        demoId,
        "quick-wins",
        { ...analysis, businessName: business_name, industry },
        {
          agentType: "marketing",
          category: "actionable",
          tier: "free",
          analysisType: "weekly_action_plan",
        }
      );
    } catch (vectorError) {
      console.error("Vector storage error (non-critical):", vectorError);
      // Continue execution - vector storage is supplementary
    }

    return res.status(200).json({
      success: true,
      data: analysis,
      metadata: {
        business_name,
        industry,
        generated_at: new Date().toISOString(),
        week_of: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.error("Quick wins analysis error:", error);
    return res.status(500).json({
      error: "Failed to generate quick wins action plan",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
