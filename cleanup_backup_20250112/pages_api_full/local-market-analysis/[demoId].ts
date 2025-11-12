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

    // Local Market Intelligence Agent
    const prompt = `You are a Local Market Intelligence Agent specializing in SMB competitive positioning.

Business Context:
- Business: ${business_name}
- Industry: ${industry}
- Description: ${business_description}
- Website: ${website_url}

Analyze this business's local market position using these frameworks:

1. LOCAL COMPETITIVE LANDSCAPE (Porter's Simplified)
   - Who are your 3 main local competitors?
   - What makes you different from each one?
   - Which competitor poses the biggest threat and why?

2. MARKET POSITIONING ANALYSIS
   - What's your current position in the local market?
   - Are you seen as premium, value, or somewhere in between?
   - What do customers say about you vs competitors?

3. LOCAL MARKET OPPORTUNITIES
   - What gaps exist in your local market?
   - Which competitor weaknesses can you exploit?
   - What local trends favor your business type?

4. THIS WEEK'S ACTION PLAN
   - 3 specific moves to strengthen your local position
   - 1 competitive weakness to exploit immediately
   - 1 way to differentiate further from competitors

Format as JSON with sections: competitive_landscape, market_position, local_opportunities, action_plan.
Use plain English, avoid jargon. Focus on actionable insights for small business owners.`;

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
      // Fallback if JSON parsing fails
      analysis = {
        competitive_landscape:
          content
            ?.split("COMPETITIVE LANDSCAPE")[1]
            ?.split("MARKET POSITIONING")[0] || "",
        market_position:
          content
            ?.split("MARKET POSITIONING")[1]
            ?.split("LOCAL OPPORTUNITIES")[0] || "",
        local_opportunities:
          content?.split("LOCAL OPPORTUNITIES")[1]?.split("ACTION PLAN")[0] ||
          "",
        action_plan: content?.split("ACTION PLAN")[1] || "",
      };
    }

    // Store in database
    const { error: updateError } = await supabase
      .from("demos")
      .update({
        local_market_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("Database update error:", updateError);
    }

    return res.status(200).json({
      success: true,
      data: analysis,
      metadata: {
        business_name,
        industry,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Local market analysis error:", error);
    return res.status(500).json({
      error: "Failed to generate local market analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
