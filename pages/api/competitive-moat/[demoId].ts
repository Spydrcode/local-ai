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

    // Competitive Moat Analysis Agent (Porter's Five Forces Simplified)
    const prompt = `You are a Competitive Moat Intelligence Agent specializing in Porter's Five Forces for SMBs.

Business Context:
- Business: ${business_name}
- Industry: ${industry}
- Description: ${business_description}
- Website: ${website_url}

Analyze why customers choose this business over competitors using Porter's Framework (simplified for SMB):

1. CUSTOMER SWITCHING DIFFICULTY (Buyer Power)
   - How easy is it for customers to switch to competitors?
   - What keeps customers loyal to ${business_name}?
   - Your customer retention advantages vs competitors

2. SUPPLIER RELATIONSHIP POWER (Supplier Power)
   - How easy is it for you to switch suppliers/vendors?
   - Do you have supplier advantages competitors don't?
   - Your cost structure advantages

3. NEW COMPETITOR BARRIERS (Threat of New Entrants)
   - How hard is it for new businesses to compete with you?
   - What advantages do you have that new competitors can't easily copy?
   - Your experience/expertise moat

4. SUBSTITUTE THREATS (Threat of Substitutes)
   - What alternatives do customers have instead of using you?
   - How are you better than DIY solutions or other approaches?
   - Your unique value that can't be substituted

5. COMPETITIVE INTENSITY (Rivalry)
   - How fierce is competition in your local market?
   - What makes you stand out from direct competitors?
   - Your competitive advantages that are hard to copy

6. THIS WEEK'S MOAT-BUILDING ACTIONS
   - 3 ways to make it harder for customers to leave
   - 2 barriers to strengthen against new competitors
   - 1 unique advantage to amplify immediately

Format as JSON with sections: customer_switching, supplier_power, entry_barriers, substitute_threats, competitive_intensity, moat_building_actions.
Use plain English, avoid academic jargon. Focus on practical defensive strategies.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1800,
    });

    const content = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(content || "{}");
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        customer_switching:
          content?.split("CUSTOMER SWITCHING")[1]?.split("SUPPLIER")[0] || "",
        supplier_power:
          content?.split("SUPPLIER")[1]?.split("NEW COMPETITOR")[0] || "",
        entry_barriers:
          content?.split("NEW COMPETITOR")[1]?.split("SUBSTITUTE")[0] || "",
        substitute_threats:
          content?.split("SUBSTITUTE")[1]?.split("COMPETITIVE INTENSITY")[0] ||
          "",
        competitive_intensity:
          content?.split("COMPETITIVE INTENSITY")[1]?.split("ACTION")[0] || "",
        moat_building_actions: content?.split("ACTION")[1] || "",
      };
    }

    // Store in database
    const { error: updateError } = await supabase
      .from("demos")
      .update({
        competitive_moat: analysis,
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
        "competitive-moat",
        { ...analysis, businessName: business_name, industry },
        {
          agentType: "porter",
          category: "strategic",
          tier: "pro",
          analysisType: "competitive_moat_analysis",
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
      },
    });
  } catch (error) {
    console.error("Competitive moat analysis error:", error);
    return res.status(500).json({
      error: "Failed to generate competitive moat analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
