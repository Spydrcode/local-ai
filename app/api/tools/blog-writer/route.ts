import { blogWriterAgent } from "@/lib/agents/ContentMarketingAgents";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      blog_topic,
      keywords,
      tone,
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
    let finalTopic = blog_topic;
    let finalKeywords = keywords || [];

    if (!blog_topic && intelligence) {
      // Agent uses intelligence to generate contextual topic
      const topicSuggestions = [];

      // From differentiators
      if (intelligence.business?.differentiators?.length > 0) {
        topicSuggestions.push(
          `What Makes ${business_name} Different: ${intelligence.business.differentiators[0]}`
        );
      }

      // From services
      if (intelligence.business?.services?.length > 0) {
        topicSuggestions.push(
          `Expert Guide to ${intelligence.business.services[0]} in ${intelligence.business.location || "Your Area"}`
        );
      }

      // From SEO keywords
      if (intelligence.seo?.keywords?.length > 0) {
        topicSuggestions.push(
          `${intelligence.seo.keywords[0]}: Everything You Need to Know`
        );
      }

      // Fallback
      if (topicSuggestions.length === 0) {
        topicSuggestions.push(
          `Why Choose ${business_name} for ${business_type}`,
          `The Ultimate Guide to ${business_type} Services`
        );
      }

      finalTopic = topicSuggestions[0];
      finalKeywords = intelligence.seo?.keywords?.slice(0, 5) || [];

      console.log(
        `[Blog Writer Agent] Generated contextual topic: ${finalTopic}`
      );
      console.log(`[Blog Writer Agent] Extracted keywords:`, finalKeywords);
    } else if (!blog_topic) {
      finalTopic = `Why Choose ${business_name} for ${business_type}`;
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      topic: finalTopic,
      keywords: finalKeywords,
      tone: tone as
        | "educational"
        | "authoritative"
        | "conversational"
        | "inspirational"
        | undefined,
      intelligence,
    };

    // Generate variations if requested
    if (generate_variations) {
      const variations = await blogWriterAgent.generateVariations(params);
      return NextResponse.json({
        primary: variations[0],
        variations: variations.slice(1),
        message:
          "Generated blog posts in different tones. Choose what matches your brand!",
      });
    }

    // Generate single blog post
    const result = await blogWriterAgent.generateBlogPost(params);

    return NextResponse.json({
      ...result,
      tip: "Want different writing styles? Add 'generate_variations: true' to your request!",
    });
  } catch (error) {
    console.error("Blog post generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
