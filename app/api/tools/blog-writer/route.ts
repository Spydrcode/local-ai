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

    if (!business_name || !business_type || !blog_topic) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: business_name, business_type, blog_topic",
        },
        { status: 400 }
      );
    }

    const params = {
      businessName: business_name,
      businessType: business_type,
      topic: blog_topic,
      keywords: keywords || [],
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
