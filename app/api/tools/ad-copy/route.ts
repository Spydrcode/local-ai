import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, ad_platform, ad_goal, website_analysis } =
      await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const platform = ad_platform || "Facebook";
    const goal = ad_goal || "drive traffic";

    // Build context from website analysis
    let businessContext = '';
    if (website_analysis) {
      const differentiators = website_analysis.what_makes_you_different?.slice(0, 2).join('\n- ') || '';
      const quickWin = website_analysis.quick_wins?.[0];

      businessContext = `
**BUSINESS INTELLIGENCE (Use this to create compelling, specific ad copy):**
${differentiators ? `\nWhat makes them different:\n- ${differentiators}` : ''}
${quickWin ? `\nKey selling point: ${quickWin.title}` : ''}
${website_analysis.exact_sub_niche ? `\nExact niche: ${website_analysis.exact_sub_niche}` : ''}
${website_analysis.location_context ? `\nLocation: ${website_analysis.location_context}` : ''}

**CRITICAL**: Feature their specific differentiators in the ad copy. Don't make generic ads - use their actual competitive advantages.
`;
    }

    const prompt = `Create ad copy for ${business_name}, a ${business_type} business.
${businessContext}
**Platform**: ${platform}
**Goal**: ${goal}

**Requirements**:
- Attention-grabbing headline ${website_analysis ? 'that highlights their specific differentiators' : ''}
- Clear value proposition specific to ${business_type}
- Strong call-to-action
- ${platform === "Google" ? "Concise (90 characters max)" : "Engaging and conversational"}
- ${website_analysis ? 'Reference their actual competitive advantages' : 'Mention specific benefits relevant to their industry'}

Return ONLY valid JSON with:
{
  "headline": "Main headline",
  "body": "Ad body text",
  "cta": "Call-to-action",
  "targeting_tips": "Audience targeting recommendations"
}`;

    const adCopy = await generateContent(prompt);

    return NextResponse.json(adCopy);
  } catch (error) {
    console.error("Ad copy generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate ad copy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
