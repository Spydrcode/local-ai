import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext, getCompetitorInsights } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeNiche: true,
      includeLocation: true,
    });
    const competitorInsights = getCompetitorInsights(website_analysis);

    const prompt = `Create a positioning statement for ${business_name}, a ${business_type} business - what to say when customers ask "Why not [competitor]?"
${businessContext}
${competitorInsights}

**Positioning Framework**:
"For [target customer] who [need/problem], ${business_name} is the [category] that [key differentiator]. Unlike [competitors], we [unique approach]."

**Requirements**:
- Based on their ACTUAL differentiators from analysis
- Conversational, not corporate jargon
- Memorable and repeatable by team members
- 2-3 sentences max
- Focus on customer benefit, not just features

${website_analysis?.what_makes_you_different?.[0] ? `\nKey differentiator to feature: ${website_analysis.what_makes_you_different[0]}` : ''}

Return ONLY valid JSON with:
{
  "positioning_statement": "Main positioning statement",
  "elevator_pitch": "15-second version",
  "vs_competitor": "What to say when compared to competitors",
  "internal_mantra": "Simple statement for team alignment",
  "use_cases": ["Sales calls", "Networking events", "Website homepage"]
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate positioning statement" }, { status: 500 });
  }
}
