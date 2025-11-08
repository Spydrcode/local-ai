import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, service_focus, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const serviceFocus = service_focus || "main service";

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeQuickWins: true,
      includeStrengths: true,
      maxDifferentiators: 3,
    });

    const prompt = `Create high-converting landing page copy for ${business_name}'s ${serviceFocus}.
${businessContext}
**Service/Product**: ${serviceFocus}
**Business Type**: ${business_type}

**Landing Page Structure**:

**Above the Fold**:
- Compelling headline (promise + benefit)
- Subheadline (clarify who it's for)
- ${website_analysis ? 'Feature their #1 differentiator' : 'Clear unique value proposition'}
- Strong CTA button

**The Problem**:
- 2-3 pain points the customer faces
- Make them feel understood

**The Solution**:
- How your service solves each pain point
- ${website_analysis ? 'Reference specific differentiators' : 'Unique approach or method'}

**Social Proof**:
- Testimonial quotes (placeholders)
- Trust indicators (years in business, customers served, etc.)

**How It Works**:
- Simple 3-4 step process
- Remove friction and uncertainty

**Final CTA**:
- Urgent, benefit-driven
- Address last objections

**Requirements**:
- 600-800 words total
- Conversational, persuasive tone
- ${website_analysis ? 'Weave in their differentiators naturally' : 'Focus on benefits, not features'}
- Multiple CTAs throughout
- Scannable (bullets, short paragraphs)

Return ONLY valid JSON with:
{
  "headline": "Main headline",
  "subheadline": "Supporting subheadline",
  "problem_section": "The pain points (markdown)",
  "solution_section": "How you solve it (markdown)",
  "how_it_works": ["Step 1", "Step 2", "Step 3"],
  "cta_primary": "Main CTA button text",
  "cta_secondary": "Secondary CTA text",
  "trust_indicators": ["25 years in business", "500+ happy customers"],
  "conversion_tips": "Quick tips to increase conversions"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Landing page generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate landing page" },
      { status: 500 }
    );
  }
}
