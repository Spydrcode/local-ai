import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, video_type } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const videoKind = video_type || "Behind-the-scenes";

    const prompt = `Create a video script for ${business_name}, a ${business_type} business.

**Video Type**: ${videoKind} (TikTok/Reels/YouTube Shorts format)
**Length**: 30-60 seconds

**Requirements**:
- Hook in first 3 seconds
- Specific to ${business_type} industry
- Show personality and authenticity
- Clear value or entertainment
- Call-to-action at end
- Include visual suggestions and timing cues

Return JSON with:
{
  "script": "Full script with timing and visual cues formatted as a complete video script",
  "platform_tips": "How to optimize this for TikTok, Reels, and YouTube Shorts"
}

Make it authentic and specific to ${business_type} businesses.`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Video script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video script" },
      { status: 500 }
    );
  }
}
