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

    const { business_name, industry } = demo;

    const prompt = `Analyze the value chain for ${business_name} (${industry}) and identify where they make vs lose money.

Return JSON with:
{
  "primary_activities": {
    "inbound_logistics": "description",
    "operations": "description", 
    "outbound_logistics": "description",
    "marketing_sales": "description",
    "service": "description"
  },
  "cost_drivers": ["driver1", "driver2"],
  "profit_opportunities": ["opportunity1", "opportunity2"],
  "quick_wins": ["win1", "win2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    let analysis;

    try {
      analysis = JSON.parse(content || "{}");
    } catch {
      analysis = { error: "Failed to parse response" };
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    console.error("Value chain optimizer error:", err);
    return res.status(500).json({
      error: "Failed to generate value chain analysis",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
