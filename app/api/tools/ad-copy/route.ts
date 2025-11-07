import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, ad_platform, ad_goal } =
      await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const platform = ad_platform || "Facebook";
    const goal = ad_goal || "drive traffic";

    const prompt = `Create ad copy for ${business_name}, a ${business_type} business.

**Platform**: ${platform}
**Goal**: ${goal}

**Requirements**:
- Attention-grabbing headline
- Clear value proposition specific to ${business_type}
- Strong call-to-action
- ${platform === "Google" ? "Concise (90 characters max)" : "Engaging and conversational"}
- Mention specific benefits relevant to their industry

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
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}