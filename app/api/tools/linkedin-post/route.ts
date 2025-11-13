import { linkedInMarketingAgent } from "@/lib/agents/SocialMediaAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      post_topic,
      content_type,
      generate_variations,
      intelligence,
    } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      topic: post_topic,
      contentType: content_type as
        | "thought-leadership"
        | "storytelling"
        | "inspirational"
        | "educational"
        | undefined,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations =
        await linkedInMarketingAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message:
          "Generated posts in different content styles. Choose what fits best!",
      });
    }

    // Generate single post
    const result = await linkedInMarketingAgent.generatePost(params);

    return NextResponse.json({
      ...result,
      tip: "Want different content approaches? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("LinkedIn post generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate LinkedIn post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
