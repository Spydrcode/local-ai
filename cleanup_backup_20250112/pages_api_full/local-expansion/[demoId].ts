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
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const { business_name, industry, business_description } = demo;

    const prompt = `You are a Blue Ocean Four Actions Framework Agent for THIS SPECIFIC BUSINESS.

Business: ${business_name}
Industry: ${industry}
Website: ${demo.website_url}
Description: ${business_description || demo.site_summary}

Apply the Four Actions Framework to break from competition:

1. ELIMINATE
   What factors that ${industry} businesses compete on should be ELIMINATED?
   - Industry standards that add cost but customers don't value
   - Features/services everyone offers but nobody really wants
   - Competitive factors that are taken for granted
   List 3-5 specific things THIS BUSINESS should stop doing/offering

2. REDUCE
   What should be REDUCED well below industry standard?
   - Over-delivered features that customers don't pay for
   - Costly elements that provide diminishing returns
   - Areas where "good enough" beats "excellent"
   List 3-5 specific things to scale back

3. RAISE
   What should be RAISED well above industry standard?
   - Factors where THIS BUSINESS can excel
   - Elements customers will pay premium for
   - Differentiators that create loyalty
   List 3-5 specific things to amplify

4. CREATE
   What should be CREATED that the industry has never offered?
   - New value factors based on THIS BUSINESS's unique strengths
   - Unmet customer needs in ${industry}
   - Innovations that make competition irrelevant
   List 3-5 new offerings/approaches

5. IMPLEMENTATION ROADMAP
   Phase 1 (0-3 months): Quick wins from eliminate/reduce
   Phase 2 (3-6 months): Build raise capabilities
   Phase 3 (6-12 months): Launch create innovations

Return JSON:
{
  "eliminate": [{"factor": "...", "rationale": "...", "cost_savings": "..."}],
  "reduce": [{"factor": "...", "new_level": "...", "benefit": "..."}],
  "raise": [{"factor": "...", "target_level": "...", "investment": "..."}],
  "create": [{"innovation": "...", "value_proposition": "...", "feasibility": "..."}],
  "implementation": {"phase1": [], "phase2": [], "phase3": []}
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
      analysis = {
        geographic_expansion: {},
        service_expansion: {},
        partnerships: [],
        expansion_roadmap: { phase1: [], phase2: [], phase3: [] },
      };
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
  } catch (err) {
    console.error("Local expansion analysis error:", err);
    return res.status(500).json({
      error: "Failed to generate local expansion analysis",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
