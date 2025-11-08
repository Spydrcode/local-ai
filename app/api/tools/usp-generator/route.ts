import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
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

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeNiche: true,
      maxDifferentiators: 3,
    });

    const prompt = `Create a powerful Unique Selling Proposition (USP) for ${business_name}, a ${business_type} business.
${businessContext}

**USP Requirements**:
- One sentence that captures what makes them uniquely valuable
- ${website_analysis ? 'Based on their #1 differentiator' : 'Clear competitive advantage'}
- Who they serve + What they do + Why they're different
- Memorable and repeatable
- Avoid clichés like "best quality" or "great service"

**USP Formula Options**:
1. "We help [target customer] [achieve goal] through [unique method/differentiator]"
2. "The only [business type] that [unique differentiator]"
3. "[Benefit] for [target customer], guaranteed by [proof point]"

${website_analysis?.what_makes_you_different?.[0] ? `\nTheir #1 differentiator: ${website_analysis.what_makes_you_different[0]}` : ''}

Return ONLY valid JSON with:
{
  "usp_primary": "Main USP (one powerful sentence)",
  "usp_variations": ["Variation 1", "Variation 2", "Variation 3"],
  "tagline_suggestion": "Shorter tagline version",
  "elevator_pitch": "30-second pitch using the USP",
  "where_to_use": "Homepage headline, email signatures, business cards, etc."
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("USP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate USP" },
      { status: 500 }
    );
  }
}
