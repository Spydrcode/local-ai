/**
 * Intelligent Content Generation API
 *
 * PRODUCTION-GRADE REPLACEMENT for simple generateContent() wrapper
 *
 * This demonstrates the new architecture:
 * 1. Retrieves business context via AgenticRAG
 * 2. Uses ProductionOrchestrator with content-generation workflow
 * 3. Multi-agent pipeline (personalization + marketing + optimization)
 * 4. Context-aware, specific to the business (not generic templates)
 *
 * Use this as a template for upgrading the 35 content tool routes.
 */

import { getOrchestrator } from "@/lib/agents/production-orchestrator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      business_name,
      business_type,
      target_audience,
      content_type, // "social_post" | "blog" | "email" | "ad_copy" etc.
      platform, // "facebook" | "instagram" | "linkedin" etc.
      topic,
      website_analysis, // From previous analyze API call
      demoId, // For RAG context retrieval
    } = await request.json();

    if (!business_name || !content_type) {
      return NextResponse.json(
        { error: "Missing required fields: business_name, content_type" },
        { status: 400 }
      );
    }

    console.log(
      `[Intelligent Content] Generating ${content_type} for ${business_name}`
    );

    // Use production orchestrator with content-generation workflow
    const orchestrator = getOrchestrator();

    const result = await orchestrator.execute("content-generation", {
      businessName: business_name,
      industry: business_type,
      targetAudience: target_audience || "local community",
      demoId, // RAG will retrieve business intelligence
      customData: {
        content_type,
        platform,
        topic,
        website_analysis, // Pass any prior analysis data
        requirements: {
          // Specific requirements based on content type
          tone:
            content_type === "ad_copy"
              ? "persuasive"
              : content_type === "blog"
                ? "informative"
                : "engaging",
          length:
            content_type === "social_post"
              ? "short"
              : content_type === "blog"
                ? "long"
                : "medium",
          include_cta: true,
          use_brand_voice: true,
        },
      },
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Content generation failed",
          details: result.errors?.join(", "),
        },
        { status: 500 }
      );
    }

    // Format response based on content type
    const formattedContent = formatContentByType(
      result.data.content,
      content_type,
      platform
    );

    return NextResponse.json({
      success: true,
      content: formattedContent,
      metadata: {
        agents_used: result.metadata.agentsExecuted,
        execution_time_ms: result.metadata.executionTimeMs,
        cache_hit: result.metadata.cacheHit,
        business_context_used: !!result.data.business_context,
        strategy_applied: !!result.data.strategy,
      },
    });
  } catch (error) {
    console.error("Intelligent content generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate content",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Format content based on type and platform
 */
function formatContentByType(
  content: any,
  contentType: string,
  platform?: string
): any {
  // If content is already structured, return it
  if (content && typeof content === "object" && content.caption) {
    return content;
  }

  // Default formatting
  switch (contentType) {
    case "social_post":
      return {
        platform: platform || "facebook",
        caption: content?.text || content || "",
        hashtags: content?.hashtags || [],
        image_suggestion: content?.image_suggestion || "Brand imagery",
        best_time_to_post: content?.best_time_to_post || "Weekday 9am-11am",
      };

    case "blog":
      return {
        title: content?.title || "Blog Post",
        introduction: content?.introduction || "",
        body: content?.body || content || "",
        conclusion: content?.conclusion || "",
        seo_keywords: content?.seo_keywords || [],
        meta_description: content?.meta_description || "",
      };

    case "email":
      return {
        subject_line: content?.subject_line || "Email Subject",
        preview_text: content?.preview_text || "",
        body: content?.body || content || "",
        cta_text: content?.cta_text || "Learn More",
        cta_url: content?.cta_url || "",
      };

    case "ad_copy":
      return {
        headline: content?.headline || "Ad Headline",
        body: content?.body || content || "",
        cta: content?.cta || "Learn More",
        variations: content?.variations || [],
      };

    default:
      return content;
  }
}
