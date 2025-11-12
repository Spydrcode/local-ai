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

    // Customer Sentiment Intelligence Agent
    const prompt = `You are a Customer Voice Intelligence Agent specializing in sentiment analysis for SMBs.

Business Context:
- Business: ${business_name}
- Industry: ${industry}
- Description: ${business_description}
- Website: ${website_url}

Analyze what customers are likely saying about this business online:

1. REVIEW SENTIMENT ANALYSIS
   - What themes appear in positive reviews for ${industry} businesses?
   - Common complaints customers have about ${industry} businesses
   - What customers probably love most about ${business_name}
   - What customers probably complain about most

2. SOCIAL MEDIA SENTIMENT
   - How customers likely talk about ${business_name} on social media
   - What hashtags or topics are associated with your business type
   - Sentiment trends in your industry (positive/negative/neutral)

3. REPUTATION STRENGTHS & WEAKNESSES
   - Your likely reputation strengths based on business type
   - Potential reputation vulnerabilities to monitor
   - How your reputation compares to typical ${industry} businesses

4. THIS WEEK'S ACTION PLAN
   - 3 ways to encourage more positive reviews
   - 2 common complaints to proactively address
   - 1 reputation-building strategy to implement immediately

Format as JSON with sections: review_sentiment, social_sentiment, reputation_analysis, action_plan.
Use plain English and focus on actionable insights for reputation management.`;

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
        review_sentiment:
          content?.split("REVIEW SENTIMENT")[1]?.split("SOCIAL MEDIA")[0] || "",
        social_sentiment:
          content?.split("SOCIAL MEDIA")[1]?.split("REPUTATION")[0] || "",
        reputation_analysis:
          content?.split("REPUTATION")[1]?.split("ACTION PLAN")[0] || "",
        action_plan: content?.split("ACTION PLAN")[1] || "",
      };
    }

    // Store in database
    const { error: updateError } = await supabase
      .from("demos")
      .update({
        customer_sentiment: analysis,
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
    console.error("Customer sentiment analysis error:", error);
    return res.status(500).json({
      error: "Failed to generate customer sentiment analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
