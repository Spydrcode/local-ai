import { videoScriptAgent } from "@/lib/agents/ContentMarketingAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      video_topic,
      video_type,
      target_length,
      generate_variations,
      intelligence,
    } = await request.json();

    if (!business_name || !business_type || !video_topic) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: business_name, business_type, video_topic",
        },
        { status: 400 }
      );
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      videoTopic: video_topic,
      videoType: video_type as
        | "explainer"
        | "promotional"
        | "testimonial"
        | "educational"
        | "behind-the-scenes"
        | undefined,
      targetLength: target_length || 60,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations = await videoScriptAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message:
          "Generated video scripts in different styles. Choose what fits your video type!",
      });
    }

    // Generate single video script
    const result = await videoScriptAgent.generateScript(params);

    return NextResponse.json({
      ...result,
      tip: "Want different video approaches? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("Video script generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate video script",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
