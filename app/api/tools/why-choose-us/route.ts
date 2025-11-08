import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext, getCompetitorInsights } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build context from website analysis - THIS IS THE PERFECT USE CASE!
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      includeOpportunities: true,
      maxDifferentiators: 5,
      maxStrengths: 4,
    });

    const competitorInsights = getCompetitorInsights(website_analysis);

    const prompt = `Create a compelling "Why Choose Us" page for ${business_name}, a ${business_type} business.
${businessContext}
${competitorInsights}

**CRITICAL**: This page should directly address why customers should choose ${business_name} over competitors. Use their ACTUAL differentiators from the analysis.

**Page Structure**:

**Hero Section**:
- Headline: What makes ${business_name} different
- Subheadline: Who you serve and why you're uniquely qualified

**Your Differentiators** (Use their analysis!):
${website_analysis?.what_makes_you_different ? '- Feature each differentiator with explanation and benefit\n' : '- 3-5 key differentiators\n'}
${website_analysis?.your_strengths ? '- Incorporate strengths as supporting evidence\n' : ''}

**How We Compare**:
- NOT a direct competitor table (unprofessional)
- Instead: "Unlike typical [industry] businesses that [pain point], we [differentiator]"
- Address 3-4 common customer frustrations with competitors

**Our Promise**:
- What customers can expect
- Guarantees or commitments that set you apart

**Social Proof**:
- Customer success stories that validate differentiators
- Metrics/stats if available

**Requirements**:
- 500-700 words
- Confident but not arrogant tone
- Focus on customer benefits, not just features
- ${website_analysis ? 'Reference their SPECIFIC differentiators by name' : 'Clear, unique value propositions'}
- Conversational and authentic

Return ONLY valid JSON with:
{
  "headline": "Main headline for the page",
  "subheadline": "Supporting subheadline",
  "differentiator_sections": [
    {
      "title": "Differentiator name",
      "description": "Why this matters to customers",
      "benefit": "The outcome they get"
    }
  ],
  "comparison_section": "How we're different (markdown)",
  "promise_statement": "Our commitment to customers",
  "cta": "Primary call-to-action",
  "seo_keywords": ["keyword1", "keyword2"]
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Why Choose Us page generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate Why Choose Us page" },
      { status: 500 }
    );
  }
}
