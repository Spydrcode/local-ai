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

    const prompt = `Identify automation opportunities for ${demo.business_name} in the ${demo.industry} industry.

Business Context: ${demo.business_description || demo.summary}

Analyze tasks that can be automated to save 10+ hours per week:

1. CUSTOMER COMMUNICATION
   - Email sequences and follow-ups
   - Appointment scheduling
   - Review requests
   - Social media posting

2. ADMINISTRATIVE TASKS
   - Invoice generation and sending
   - Payment processing and reminders
   - Data entry and record keeping
   - Report generation

3. MARKETING AUTOMATION
   - Lead nurturing sequences
   - Social media scheduling
   - Content distribution
   - Analytics tracking

4. OPERATIONAL PROCESSES
   - Inventory management
   - Order processing
   - Quality control checklists
   - Performance monitoring

For each opportunity, include:
- Time savings potential
- Implementation difficulty (Easy/Medium/Hard)
- Recommended tools/platforms
- ROI timeline

Return as JSON with structure:
{
  "customerCommunication": {
    "opportunities": ["opportunity1", "opportunity2"],
    "timeSavings": "X hours/week",
    "tools": ["tool1", "tool2"]
  },
  "administrative": {...},
  "marketing": {...},
  "operational": {...},
  "totalTimeSavings": "X hours/week",
  "priorityOrder": ["task1", "task2", "task3"]
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
      analysis = { error: "Failed to parse automation opportunities" };
    }

    const { error: updateError } = await supabase
      .from("demos")
      .update({
        automation_opportunities: analysis,
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
    console.error("Automation opportunities error:", error);
    return res.status(500).json({
      error: "Failed to generate automation opportunities",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}