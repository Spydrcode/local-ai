import { AgentRegistry } from "@/lib/agents/unified-agent-system";
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

    const agent = AgentRegistry.get("content-generator");

    if (!agent) {
      throw new Error("Content generator agent not found");
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
- Visual suggestions for each part
- Music/sound suggestions

Return JSON with:
{
  "hook": "First 3 seconds to grab attention",
  "script": "Full script with timing and visual cues",
  "cta": "Call-to-action",
  "filming_tips": "How to film this for best results",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Make it authentic and specific to ${business_type} businesses.`;

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
      video_type: videoKind,
    });

    let videoScript;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoScript = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate video script. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(videoScript);
  } catch (error) {
    console.error("Video script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video script" },
      { status: 500 }
    );
  }
}
