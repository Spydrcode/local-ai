import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, page_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pageType = page_type || "homepage";

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeNiche: true,
      includeLocation: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create local SEO meta tags for ${business_name}, a ${business_type} business.
${businessContext}
**Page Type**: ${pageType}

**Requirements**:
- Title tag: 50-60 characters, include location and primary keyword
- Meta description: 150-160 characters, compelling with call-to-action
- ${website_analysis ? 'Feature their specific differentiators' : 'Highlight what makes them unique'}
- Include city/region for local SEO
- Focus on click-through rate optimization
- Use action words and benefits

**Local SEO Best Practices**:
- Include city/neighborhood name in title
- Mention specific services in description
- Use schema-friendly language
${website_analysis?.location_context ? `- Their location: ${website_analysis.location_context}` : ''}
${website_analysis?.exact_sub_niche ? `- Their specialty: ${website_analysis.exact_sub_niche}` : ''}

Return ONLY valid JSON with:
{
  "title_tag": "SEO-optimized title tag (50-60 chars)",
  "meta_description": "Compelling meta description (150-160 chars)",
  "h1_suggestion": "Suggested H1 heading for the page",
  "keywords": ["primary keyword", "secondary keyword", "location keyword"],
  "schema_type": "LocalBusiness|Restaurant|HomeAndConstructionBusiness|etc",
  "seo_tips": "Quick implementation tips for best results"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Local SEO meta generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate local SEO meta tags" },
      { status: 500 }
    );
  }
}
