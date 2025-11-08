import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, days_since_purchase, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const daysSince = days_since_purchase || "90";

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeQuickWins: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create a win-back email for ${business_name}, a ${business_type} business, targeting customers who haven't purchased in ${daysSince} days.
${businessContext}
**Goal**: Re-engage inactive customers and bring them back

**Requirements**:
- Warm, friendly tone (not pushy or guilt-tripping)
- Acknowledge their absence without being needy
- ${website_analysis ? 'Remind them of specific benefits/differentiators' : 'Highlight what they\'re missing'}
- Include an incentive or special offer if appropriate
- Make it easy to return (one-click link/call)
- 150-200 words
- Subject line that gets opened

**Psychology**:
- Use "we miss you" approach, not "why did you leave?"
- Focus on value they're missing out on
- Create mild FOMO (new products, improvements, etc.)
- Personal touch with [CUSTOMER NAME] placeholder

Return ONLY valid JSON with:
{
  "subject": "Email subject line",
  "preview_text": "Preview text that appears after subject",
  "body": "Email body with [CUSTOMER NAME] placeholder",
  "offer_suggestion": "Suggested incentive to include (discount, free shipping, etc.)",
  "timing_tip": "Best time to send this email",
  "followup_strategy": "What to do if they don't respond"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Win-back email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate win-back email" },
      { status: 500 }
    );
  }
}
