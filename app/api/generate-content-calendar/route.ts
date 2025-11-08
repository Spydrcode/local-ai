import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

const buildCalendarPrompt = (params: {
  business_name: string;
  business_type: string;
  target_audience: string;
  website_analysis?: any;
}) => {
  const { business_name, business_type, target_audience, website_analysis } = params;

  // Build context from website analysis if available
  let businessContext = '';
  if (website_analysis) {
    const differentiators = website_analysis.what_makes_you_different?.join('\n- ') || '';
    const strengths = website_analysis.your_strengths?.join('\n- ') || '';
    const opportunities = website_analysis.opportunities?.slice(0, 3).join('\n- ') || '';
    const quickWins = website_analysis.quick_wins?.slice(0, 3).map((w: any) => `${w.title}: ${w.why}`).join('\n- ') || '';

    businessContext = `
BUSINESS INTELLIGENCE (Use this to create authentic, specific content):
${differentiators ? `\nWhat makes them different:\n- ${differentiators}` : ''}
${strengths ? `\nKey strengths:\n- ${strengths}` : ''}
${opportunities ? `\nGrowth opportunities to highlight:\n- ${opportunities}` : ''}
${quickWins ? `\nQuick wins to promote:\n- ${quickWins}` : ''}
${website_analysis.exact_sub_niche ? `\nExact niche: ${website_analysis.exact_sub_niche}` : ''}
${website_analysis.location_context ? `\nLocation: ${website_analysis.location_context}` : ''}

CONTENT STRATEGY:
- Feature their specific differentiators and competitive advantages in promotional posts
- Turn their quick wins into educational content (show expertise)
- Use their strengths to build credibility
- Address opportunities as valuable tips for their audience
- Make every post specific to THEIR business, not generic industry advice
`;
  }

  return `You are a professional social media strategist creating a 30-day content calendar for ${business_name}, a ${business_type} business targeting ${target_audience}.
${businessContext}
Create a balanced mix of content types:
- Educational posts (tips, how-tos) ${website_analysis ? '- use their quick wins and opportunities' : ''}
- Promotional posts (special offers, products/services) ${website_analysis ? '- highlight their differentiators' : ''}
- Engaging posts (questions, polls, fun facts)
- Behind-the-scenes posts (team, process) ${website_analysis ? '- showcase their strengths' : ''}
- Customer-focused posts (testimonials, spotlight)

For each week, create:
- 2 Facebook posts
- 2 Instagram posts

Mix platforms and content types throughout the month for variety.

Return ONLY valid JSON in this exact format:
{
  "week_1": [
    {
      "platform": "facebook|instagram",
      "caption": "Post text with emojis",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "image_suggestion": "What image to use",
      "best_time_to_post": "Day and time"
    }
  ],
  "week_2": [...],
  "week_3": [...],
  "week_4": [...]
}

${website_analysis ? 'CRITICAL: Reference their actual differentiators, strengths, and opportunities in the posts. Make content specific to THEIR business.' : 'Make each post unique, valuable, and specific to their business type.'}`;
};

export async function POST(request: Request) {
  try {
    const { business_name, business_type, target_audience, website_analysis } =
      await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build the prompt with website analysis context
    const prompt = buildCalendarPrompt({
      business_name,
      business_type,
      target_audience: target_audience || "local community",
      website_analysis,
    });

    const calendar = await generateContent(prompt);
    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Content calendar generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content calendar" },
      { status: 500 }
    );
  }
}
