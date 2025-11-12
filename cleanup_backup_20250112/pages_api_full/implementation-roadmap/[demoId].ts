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

interface RoadmapItem {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedCost: string;
  expectedOutcome: string;
  dependencies: string[];
  kpis: string[];
}

interface MonthlyRoadmap {
  month: string;
  focus: string;
  items: RoadmapItem[];
  keyMilestones: string[];
}

async function generateImplementationRoadmap(
  businessName: string,
  summary: string,
  profitInsights: any[],
  competitorAnalysis?: any,
  conversionAnalysis?: any
): Promise<MonthlyRoadmap[]> {
  const insightsText = profitInsights
    .map(
      (insight) =>
        `${insight.title}: ${insight.description} | Action: ${insight.actionItem}`
    )
    .join("\n");

  const prompt = `You are a strategic business consultant creating a detailed 30/60/90-day implementation roadmap for ${businessName}.

Business Overview: ${summary.slice(0, 200)}

Strategic Insights & Action Items:
${insightsText}

Generate a comprehensive 90-day implementation roadmap with THREE monthly phases. For EACH month, provide:

1. **Month Focus**: Overall strategic theme for that 30-day period
2. **Action Items**: 3-5 specific initiatives prioritized by ROI and feasibility
3. **Key Milestones**: Measurable outcomes expected by month-end

For each action item, include:
- Title: Clear, actionable name
- Description: 2-3 sentences on what to do and why
- Priority: High/Medium/Low (based on revenue impact)
- Difficulty: Easy/Medium/Hard (implementation complexity)
- Estimated Cost: Dollar range or "Low/Medium/High investment"
- Expected Outcome: Specific, measurable result
- Dependencies: What must happen first (or "None")
- KPIs: 2-3 metrics to track success

**Month 1 (Days 1-30)**: Focus on quick wins and foundation-building. Prioritize low-difficulty, high-impact actions that generate momentum and early results.

**Month 2 (Days 31-60)**: Build on Month 1 success. Implement medium-difficulty initiatives that require the groundwork from Month 1.

**Month 3 (Days 61-90)**: Execute strategic, high-impact projects. Tackle harder initiatives that deliver significant competitive advantage.

Return ONLY valid JSON matching this structure:
[
  {
    "month": "Month 1 (Days 1-30)",
    "focus": "Quick Wins & Foundation",
    "items": [
      {
        "title": "Action title",
        "description": "What to do and why",
        "priority": "High",
        "difficulty": "Easy",
        "estimatedCost": "$500-$1,000",
        "expectedOutcome": "Measurable result",
        "dependencies": ["Previous action" or "None"],
        "kpis": ["KPI 1", "KPI 2"]
      }
    ],
    "keyMilestones": ["Milestone 1", "Milestone 2"]
  }
]`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert strategic business consultant specializing in actionable implementation roadmaps. You prioritize initiatives by ROI potential and create realistic timelines with clear dependencies and KPIs.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
    max_tokens: 2000,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const parsed = JSON.parse(content);

  // Handle both array and object with roadmap property
  return Array.isArray(parsed) ? parsed : parsed.roadmap || [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId } = req.query;

    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    console.log(`🗺️ Generating implementation roadmap for demo ${demoId}...`);

    // Fetch demo data
    const { data: demo, error } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      console.error("Error fetching demo:", error);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Generate roadmap using AI
    const roadmap = await generateImplementationRoadmap(
      demo.business_name || "this business",
      demo.summary || "",
      demo.profit_insights || [],
      demo.competitor_analysis,
      demo.conversion_analysis
    );

    console.log(
      `✅ Implementation roadmap generated with ${roadmap.length} phases`
    );

    return res.status(200).json({ roadmap });
  } catch (error) {
    console.error("Error generating implementation roadmap:", error);
    return res.status(500).json({
      error: "Failed to generate implementation roadmap",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
