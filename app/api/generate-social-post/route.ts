import {
  augmentWithMarketingContext,
  retrieveMarketingContext,
} from "@/lib/agents/marketing-rag";
import {
  enrichWithContext,
  getContextForPrompt,
} from "@/lib/context/context-helper";
import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

const buildPrompt = (
  platform: "facebook" | "instagram",
  params: {
    business_name: string;
    business_type: string;
    target_audience: string;
    website_analysis?: any;
  }
) => {
  const { business_name, business_type, target_audience, website_analysis } =
    params;

  // Build context from website analysis if available
  let businessContext = "";
  if (website_analysis) {
    const differentiators =
      website_analysis.what_makes_you_different?.slice(0, 3).join("\n- ") || "";
    const strengths =
      website_analysis.your_strengths?.slice(0, 3).join("\n- ") || "";
    const quickWin = website_analysis.quick_wins?.[0];

    businessContext = `
BUSINESS INTELLIGENCE (Use this to make content specific and authentic):
${differentiators ? `\nWhat makes them different:\n- ${differentiators}` : ""}
${strengths ? `\nKey strengths:\n- ${strengths}` : ""}
${quickWin ? `\nCurrent focus: ${quickWin.title} - ${quickWin.why}` : ""}
${website_analysis.exact_sub_niche ? `\nExact niche: ${website_analysis.exact_sub_niche}` : ""}
${website_analysis.location_context ? `\nLocation: ${website_analysis.location_context}` : ""}

IMPORTANT: Reference these specific differentiators in your post to make it authentic and unique to their business. Don't make generic posts - use their actual competitive advantages.
`;
  }

  if (platform === "facebook") {
    return `You are a professional social media manager creating a Facebook post for ${business_name}, a ${business_type} business targeting ${target_audience}.
${businessContext}
Write a professional, engaging Facebook post that:
- Starts with a hook that grabs attention
- ${website_analysis ? "Highlights one of their specific differentiators or strengths" : "Tells a story or shares valuable information"}
- Includes a clear call-to-action
- Uses conversational, friendly language
- Is 100-150 words long
- Includes 3-5 relevant hashtags

Return ONLY valid JSON in this exact format:
{
  "platform": "facebook",
  "caption": "The full post text with emojis",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "image_suggestion": "Specific description of what image to use",
  "best_time_to_post": "Day and time recommendation"
}`;
  } else {
    return `You are a professional social media manager creating an Instagram post for ${business_name}, a ${business_type} business targeting ${target_audience}.
${businessContext}
Write a professional, engaging Instagram post that:
- Starts with an emoji and attention-grabbing first line
- ${website_analysis ? "Showcases one of their specific differentiators or competitive advantages" : "Shares valuable content"}
- Keeps the caption concise (80-120 words)
- Uses line breaks for readability
- Includes a call-to-action
- Uses 15-20 relevant hashtags (mix of popular and niche)

Return ONLY valid JSON in this exact format:
{
  "platform": "instagram",
  "caption": "The caption with emojis and line breaks (use \\n)",
  "hashtags": ["#hashtag1", "#hashtag2", ...15-20 hashtags],
  "image_suggestion": "Specific description of what image to use",
  "best_time_to_post": "Day and time recommendation"
}`;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Enrich request with stored business context
    const enriched = enrichWithContext({
      website: body.website,
      businessName: body.business_name,
      industry: body.business_type,
      ...body,
    });

    const platform = body.platform;

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Use enriched data with fallbacks
    const business_name = enriched.businessName;
    const business_type = enriched.industry || body.business_type || "business";
    const target_audience =
      enriched.targetAudience || body.target_audience || "local community";

    // Get stored context summary for AI
    const storedContext = getContextForPrompt(enriched.website);

    // Build enhanced website_analysis from stored context + provided data
    const website_analysis =
      body.website_analysis ||
      (storedContext
        ? {
            what_makes_you_different: enriched.keyMessages,
            brand_voice: enriched.brandVoice,
            brand_tone: enriched.brandTone,
            context_summary: storedContext,
          }
        : null);

    // Retrieve marketing framework knowledge from vectors
    const marketingContext = `${business_name} in ${business_type} creating ${platform} posts for ${target_audience}`;
    const marketingKnowledge = await retrieveMarketingContext(
      marketingContext,
      "social"
    );

    // Build the prompt with website analysis context
    const prompt = buildPrompt(platform, {
      business_name,
      business_type,
      target_audience,
      website_analysis,
    });

    // Augment prompt with marketing framework knowledge
    const augmentedPrompt = augmentWithMarketingContext(
      prompt,
      marketingKnowledge
    );

    const post = await generateContent(augmentedPrompt);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Social post generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate post" },
      { status: 500 }
    );
  }
}
