import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type } = await request.json();

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

    const prompt = `Create a monthly newsletter for ${business_name}, a ${business_type} business.

**Requirements**:
- Engaging subject line
- Personal greeting
- 3-4 content sections:
  * Company update or news
  * Industry tip or insight specific to ${business_type}
  * Special offer or promotion
  * Customer spotlight or success story
- Clear call-to-action
- Sign-off
- 300-400 words total

Return JSON with:
{
  "subject": "Email subject line",
  "preview_text": "Preview text (50 chars)",
  "newsletter_content": "Full newsletter with sections",
  "design_tips": "Layout and design recommendations"
}

Make it personal, valuable, and specific to ${business_type} industry.`;

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
    });

    let newsletter;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsletter = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate newsletter. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Newsletter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
