import type { QuickWin } from "@/lib/types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuickWinsInput {
  businessName: string;
  subNiche: string;
  location: string;
  coreServices: string[];
  targetAudience: string;
  differentiators: string[];
}

export async function generateQuickWins(
  input: QuickWinsInput
): Promise<QuickWin[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are a local business growth consultant. Generate SPECIFIC, ACTIONABLE quick wins tailored to this exact business.

**CRITICAL**: 
- Reference their ACTUAL location, services, and differentiators
- Avoid generic advice that applies to any business
- Focus on their specific industry and competitive position
- Make actions concrete with exact steps and tools to use

Return valid JSON only.`,
      },
      {
        role: "user",
        content: `Generate 5 quick wins for this business:

Business: ${input.businessName}
Sub-Niche: ${input.subNiche}
Location: ${input.location}
Services: ${input.coreServices.join(", ")}
Target Audience: ${input.targetAudience}
Differentiators: ${input.differentiators.join(", ")}

Return JSON array of 5 objects, each with:
- id: string (qw-1, qw-2, etc.)
- title: string (specific action, not generic)
- why: string (why this matters for THIS business specifically)
- action: string (exact steps to take with specific tools/methods)
- estimated_impact: string (quantified potential result)
- difficulty: "easy" | "medium" | "advanced"
- category: "growth" | "visibility" | "time-saver" | "money-saver"

Make each quick win SPECIFIC to their location, industry, and differentiators. Reference their actual services and competitive advantages.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const parsed = JSON.parse(content);

  // Handle both array and object responses
  return Array.isArray(parsed)
    ? parsed
    : parsed.quick_wins || parsed.quickWins || [];
}
