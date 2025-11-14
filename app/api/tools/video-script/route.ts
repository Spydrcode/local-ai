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

    if (!business_name || !business_type) {
      return NextResponse.json(
        {
          error: "Missing required fields: business_name, business_type",
        },
        { status: 400 }
      );
    }

    // Let the agent intelligently generate topic from business intelligence
    let finalTopic = video_topic;

    if (!video_topic && intelligence) {
      const topicSuggestions = [];

      // From customer testimonials/reviews
      if (intelligence.reviews?.summary) {
        topicSuggestions.push(`Real ${business_name} Customer Results`);
      }

      // From differentiators
      if (intelligence.business?.differentiators?.length > 0) {
        topicSuggestions.push(
          `${intelligence.business.differentiators[0]} - ${business_name}`
        );
      }

      // From services
      if (intelligence.business?.services?.length > 0) {
        topicSuggestions.push(
          `Behind the Scenes: ${intelligence.business.services[0]} at ${business_name}`
        );
      }

      // Fallback
      if (topicSuggestions.length === 0) {
        topicSuggestions.push(
          `Meet ${business_name} - Your ${business_type} Experts`,
          `Why Customers Choose ${business_name}`
        );
      }

      finalTopic = topicSuggestions[0];
      console.log(
        `[Video Script Agent] Generated contextual topic: ${finalTopic}`
      );
    } else if (!video_topic) {
      finalTopic = `Why Choose ${business_name} for ${business_type}`;
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      videoTopic: finalTopic,
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
