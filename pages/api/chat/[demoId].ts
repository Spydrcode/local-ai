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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId } = req.query;
    const { message, conversationHistory } = req.body;

    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`💬 AI Chat request for demo ${demoId}`);

    // Fetch demo data and analysis
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("Error fetching demo:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Build context from demo data
    const contextParts = [
      `Business: ${demo.business_name || "Unknown"}`,
      `Website: ${demo.website_url || "N/A"}`,
      `Summary: ${demo.summary || "No summary available"}`,
    ];

    if (demo.profit_insights && demo.profit_insights.length > 0) {
      const insights = demo.profit_insights
        .map((insight: any) => `${insight.title}: ${insight.actionItem}`)
        .join("\n");
      contextParts.push(`\nStrategic Insights:\n${insights}`);
    }

    const businessContext = contextParts.join("\n");

    // Build conversation messages
    const messages: any[] = [
      {
        role: "system",
        content: `You are a strategic business advisor AI assistant helping with the analysis for "${demo.business_name || "this business"}". You have deep knowledge of their strategic analysis, action items, and business context.

Business Context:
${businessContext}

Your role:
- Answer questions about the strategic analysis
- Provide guidance on implementing action items
- Prioritize recommendations based on ROI and difficulty
- Explain competitive threats and opportunities
- Suggest next steps for business growth

Be concise, actionable, and specific. Reference the business context when relevant. If asked about something not in the analysis, say so clearly and offer to help with what you do know.`,
      },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    console.log(`✅ AI Chat response generated`);

    return res.status(200).json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return res.status(500).json({
      error: "Failed to get chat response",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
