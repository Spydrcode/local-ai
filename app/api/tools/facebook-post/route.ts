import { facebookMarketingAgent } from "@/lib/agents/SocialMediaAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      post_topic,
      tone,
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
      tone: tone as
        | "friendly"
        | "professional"
        | "fun"
        | "educational"
        | undefined,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations =
        await facebookMarketingAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message: "Generated multiple post variations. Choose your favorite!",
      });
    }

    // Generate single post
    const result = await facebookMarketingAgent.generatePost(params);

    return NextResponse.json({
      ...result,
      tip: "Want different versions? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("Facebook post generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Facebook post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
