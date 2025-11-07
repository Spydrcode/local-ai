import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { NextResponse } from "next/server";

const FACEBOOK_PROMPT = `You are a professional social media manager creating a Facebook post for {{business_name}}, a {{business_type}} business targeting {{target_audience}}.

Write a professional, engaging Facebook post that:
- Starts with a hook that grabs attention
- Tells a story or shares valuable information
- Includes a clear call-to-action
- Uses conversational, friendly language
- Is 100-150 words long
- Includes 3-5 relevant hashtags

Return ONLY valid JSON in this exact format:
{
  "platform": "facebook",
  "caption": "The full post text with emojis",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "image_suggestion": "Specific description of what image to use",
  "best_time_to_post": "Day and time recommendation"
}`;

const INSTAGRAM_PROMPT = `You are a professional social media manager creating an Instagram post for {{business_name}}, a {{business_type}} business targeting {{target_audience}}.

Write a professional, engaging Instagram post that:
- Starts with an emoji and attention-grabbing first line
- Keeps the caption concise (80-120 words)
- Uses line breaks for readability
- Includes a call-to-action
- Uses 15-20 relevant hashtags (mix of popular and niche)

Return ONLY valid JSON in this exact format:
{
  "platform": "instagram",
  "caption": "The caption with emojis and line breaks (use \\n)",
  "hashtags": ["#hashtag1", "#hashtag2", ...15-20 hashtags],
  "image_suggestion": "Specific description of what image to use",
  "best_time_to_post": "Day and time recommendation"
}`;

export async function POST(request: Request) {
  try {
    const { business_name, business_type, target_audience, platform } =
      await request.json();

    if (!business_name || !business_type || !platform) {
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

    // Select prompt based on platform
    const promptTemplate =
      platform === "instagram" ? INSTAGRAM_PROMPT : FACEBOOK_PROMPT;

    const response = await agent.execute("Generate a social media post", {
      business_name,
      business_type,
      target_audience,
    });

    // Parse the response
    let post;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        post = JSON.parse(jsonMatch[0]);
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
            "Unable to generate social post. The AI response could not be parsed. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Social post generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate post" },
      { status: 500 }
    );
  }
}
