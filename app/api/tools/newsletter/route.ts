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

    if (!business_name || !business_type) {
      return NextResponse.json(
        {
          error: "Missing required fields: business_name, business_type",
        },
        { status: 400 }
      );
    }

    // Let the agent intelligently generate topic from business intelligence
    let finalTopic = newsletter_topic;

    if (!newsletter_topic && intelligence) {
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      const topicSuggestions = [];

      // From recent updates or promotions
      if (intelligence.business?.services?.length > 0) {
        topicSuggestions.push(
          `${currentMonth} Spotlight: ${intelligence.business.services[0]} Updates`
        );
      }

      // From location/seasonal
      if (intelligence.business?.location) {
        topicSuggestions.push(
          `${currentMonth} ${business_type} Tips for ${intelligence.business.location}`
        );
      }

      // From content analysis
      if (intelligence.contentAnalysis?.mainTopics?.length > 0) {
        topicSuggestions.push(
          `${currentMonth} Update: ${intelligence.contentAnalysis.mainTopics[0]}`
        );
      }

      // Fallback
      if (topicSuggestions.length === 0) {
        topicSuggestions.push(
          `${currentMonth} Newsletter from ${business_name}`,
          `Your ${currentMonth} ${business_type} Update`
        );
      }

      finalTopic = topicSuggestions[0];
      console.log(
        `[Newsletter Agent] Generated contextual topic: ${finalTopic}`
      );
    } else if (!newsletter_topic) {
      const currentMonth = new Date().toLocaleString("default", {
        month: "long",
      });
      finalTopic = `${currentMonth} Newsletter from ${business_name}`;
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
