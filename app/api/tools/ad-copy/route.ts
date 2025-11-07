import { AgentRegistry } from "@/lib/agents/unified-agent-system";
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

    const agent = AgentRegistry.get("marketing-content");

    if (!agent) {
      throw new Error("Marketing content agent not found");
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

Return JSON with:
{
  "headline": "Main headline",
  "body": "Ad body text",
  "cta": "Call-to-action",
  "targeting_tips": "Audience targeting recommendations"
}`;

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
      ad_platform: platform,
      ad_goal: goal,
    });

    let adCopy;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        adCopy = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate ad copy. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(adCopy);
  } catch (error) {
    console.error("Ad copy generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate ad copy" },
      { status: 500 }
    );
  }
}
