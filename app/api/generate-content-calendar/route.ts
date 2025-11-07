import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { NextResponse } from "next/server";

const CONTENT_CALENDAR_PROMPT = `You are a professional social media strategist creating a 30-day content calendar for {{business_name}}, a {{business_type}} business targeting {{target_audience}}.

Create a balanced mix of content types:
- Educational posts (tips, how-tos)
- Promotional posts (special offers, products/services)
- Engaging posts (questions, polls, fun facts)
- Behind-the-scenes posts (team, process)
- Customer-focused posts (testimonials, spotlight)

For each week, create:
- 2 Facebook posts
- 2 Instagram posts

Mix platforms and content types throughout the month for variety.

Return ONLY valid JSON in this exact format:
{
  "week_1": [
    {
      "platform": "facebook|instagram",
      "caption": "Post text with emojis",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "image_suggestion": "What image to use",
      "best_time_to_post": "Day and time"
    }
  ],
  "week_2": [...],
  "week_3": [...],
  "week_4": [...]
}

Make each post unique, valuable, and specific to their business type.`;

export async function POST(request: Request) {
  try {
    const { business_name, business_type, target_audience } =
      await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the content generator agent
    const agent = AgentRegistry.get("content-generator");

    if (!agent) {
      throw new Error("Content generator agent not found");
    }

    const response = await agent.execute("Generate a 30-day content calendar", {
      business_name,
      business_type,
      target_audience: target_audience || "local community",
    });

    // Parse the response
    let calendar;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        calendar = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response content:", response.content);
      // Return error instead of fallback template
      return NextResponse.json(
        {
          error:
            "Unable to generate content calendar. The AI response could not be parsed. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Content calendar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content calendar" },
      { status: 500 }
    );
  }
}
