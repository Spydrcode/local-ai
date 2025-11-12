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

    // Customer Magnet Content Agent
    const prompt = `You are a Customer Magnet Content Agent specializing in social media that drives local business growth.

Business Context:
- Business: ${business_name}
- Industry: ${industry}
- Description: ${business_description}
- Website: ${website_url}

Create 7 social media posts designed to attract new customers. Each post should have a specific psychological trigger:

1. SOCIAL PROOF POST (Monday)
   - Highlight customer success story or testimonial
   - Platform: Facebook/Instagram
   - Include call-to-action that drives bookings/sales

2. BEHIND-THE-SCENES POST (Tuesday)
   - Show the work/craft/process that builds trust
   - Platform: Instagram Stories/TikTok
   - Humanize the business and build connection

3. VALUE-ADD EDUCATIONAL POST (Wednesday)
   - Share useful tip related to your industry
   - Platform: LinkedIn/Facebook
   - Position as expert while helping audience

4. LOCAL COMMUNITY POST (Thursday)
   - Connect with local events, news, or community
   - Platform: Facebook/Instagram
   - Build local relevance and visibility

5. PROBLEM-SOLUTION POST (Friday)
   - Address common customer pain point you solve
   - Platform: Instagram/TikTok
   - Show before/after or problem/solution format

6. URGENCY/SCARCITY POST (Saturday)
   - Limited-time offer or seasonal relevance
   - Platform: Facebook/Instagram
   - Drive immediate action with time sensitivity

7. USER-GENERATED CONTENT ENCOURAGEMENT (Sunday)
   - Ask customers to share their experience
   - Platform: Instagram/Facebook
   - Build community and generate more social proof

For each post, include:
- Platform recommendation
- Caption with hashtags
- Visual description
- Expected engagement type
- Call-to-action
- Best posting time

Format as JSON with sections: social_proof, behind_scenes, educational, local_community, problem_solution, urgency_offer, user_generated.
Focus on posts that convert viewers into customers, not just engagement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(content || "{}");
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        social_proof:
          content?.split("SOCIAL PROOF")[1]?.split("BEHIND-THE-SCENES")[0] ||
          "",
        behind_scenes:
          content?.split("BEHIND-THE-SCENES")[1]?.split("VALUE-ADD")[0] || "",
        educational:
          content?.split("VALUE-ADD")[1]?.split("LOCAL COMMUNITY")[0] || "",
        local_community:
          content?.split("LOCAL COMMUNITY")[1]?.split("PROBLEM-SOLUTION")[0] ||
          "",
        problem_solution:
          content?.split("PROBLEM-SOLUTION")[1]?.split("URGENCY")[0] || "",
        urgency_offer:
          content?.split("URGENCY")[1]?.split("USER-GENERATED")[0] || "",
        user_generated: content?.split("USER-GENERATED")[1] || "",
      };
    }

    // Store in database
    const { error: updateError } = await supabase
      .from("demos")
      .update({
        customer_magnet_posts: analysis,
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
        content_type: "weekly_social_media_calendar",
      },
    });
  } catch (error) {
    console.error("Customer magnet posts error:", error);
    return res.status(500).json({
      error: "Failed to generate customer magnet posts",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
