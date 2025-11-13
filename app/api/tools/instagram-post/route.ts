import { instagramMarketingAgent } from "@/lib/agents/SocialMediaAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      post_topic,
      caption_length,
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
      captionLength: caption_length as
        | "micro"
        | "short"
        | "medium"
        | "long"
        | undefined,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations =
        await instagramMarketingAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message:
          "Generated captions in different styles. Pick your favorite! ✨",
      });
    }

    // Generate single post
    const result = await instagramMarketingAgent.generatePost(params);

    return NextResponse.json({
      ...result,
      tip: "Want different caption styles? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("Instagram post generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Instagram post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
