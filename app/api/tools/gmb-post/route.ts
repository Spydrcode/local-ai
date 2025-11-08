import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, post_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const postType = post_type || "update";

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeQuickWins: true,
      includeLocation: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create a Google Business Profile post for ${business_name}, a ${business_type} business.
${businessContext}
**Post Type**: ${postType === "offer" ? "Special Offer/Promotion" : postType === "event" ? "Event Announcement" : "Business Update"}

**Requirements**:
- ${postType === "offer" ? "Highlight a specific offer or promotion" : postType === "event" ? "Announce an upcoming event" : "Share a business update or tip"}
- 100-300 words (Google's limit is 1,500 characters)
- ${website_analysis ? 'Feature their specific differentiators or specialties' : 'Focus on local relevance'}
- Include a clear call-to-action
- Engaging and conversational tone
- ${postType === "offer" ? 'Create urgency with dates/limited availability' : 'Provide value to local customers'}
${website_analysis?.location_context ? `- Mention their location: ${website_analysis.location_context}` : ''}

**Local SEO Tips**:
- Use location-based keywords naturally
- Mention specific service areas if applicable
- Include relevant local events or seasons

Return ONLY valid JSON with:
{
  "post_text": "The complete GMB post text",
  "cta_button": "Learn more|Book now|Call now|Sign up|Get offer",
  "image_suggestion": "What image to use with this post",
  "best_day_to_post": "Day and time recommendation",
  "local_seo_tips": "Quick tip for maximizing local search impact"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GMB post generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate GMB post" },
      { status: 500 }
    );
  }
}
