import { newsletterAgent } from "@/lib/agents/ContentMarketingAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      newsletter_topic,
      newsletter_type,
      generate_variations,
      intelligence,
    } = await request.json();

    if (!business_name || !business_type || !newsletter_topic) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: business_name, business_type, newsletter_topic",
        },
        { status: 400 }
      );
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      newsletterTopic: newsletter_topic,
      newsletterType: newsletter_type as
        | "educational"
        | "update"
        | "promotional"
        | "curated"
        | "story"
        | undefined,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations = await newsletterAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message:
          "Generated newsletters in different styles. Choose what fits your audience!",
      });
    }

    // Generate single newsletter
    const result = await newsletterAgent.generateNewsletter(params);

    return NextResponse.json({
      ...result,
      tip: "Want different newsletter styles? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("Newsletter generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate newsletter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
