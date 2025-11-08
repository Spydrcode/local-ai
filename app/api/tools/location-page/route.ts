import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, location, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const targetLocation = location || "your service area";

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      maxDifferentiators: 3,
      maxStrengths: 2,
    });

    const prompt = `Create an SEO-optimized location/service area page for ${business_name}, a ${business_type} business serving ${targetLocation}.
${businessContext}
**Target Location**: ${targetLocation}

**Requirements**:
- 400-600 words optimized for "[service] in [location]" searches
- ${website_analysis ? 'Highlight their specific differentiators for this area' : 'Explain why they\'re the best choice in this location'}
- Include H2 headings for structure
- Mention specific neighborhoods/landmarks if applicable
- Include testimonials section placeholder
- Add clear call-to-action
- Natural keyword integration (avoid stuffing)

**Page Sections**:
1. Hero/Intro: Why they serve this area, years of experience
2. Services: What they offer in this location
3. Local Expertise: Why they understand this area's needs
4. Why Choose Us: Their differentiators specific to this market
5. CTA: Book consultation/get quote

**Local SEO Elements**:
- City/neighborhood names
- Local landmarks or areas served
- Distance/service radius if applicable
${website_analysis?.location_context ? `- Company location: ${website_analysis.location_context}` : ''}

Return ONLY valid JSON with:
{
  "page_title": "SEO title for [Service] in [Location]",
  "content": "Full page content with markdown headings",
  "meta_description": "160-character SEO description",
  "cta_text": "Primary call-to-action text",
  "structured_data_tips": "What schema markup to add",
  "internal_linking_suggestions": "What pages to link to/from"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Location page generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate location page" },
      { status: 500 }
    );
  }
}
