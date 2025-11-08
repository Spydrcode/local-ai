import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build context from website analysis
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create a referral request email for ${business_name}, a ${business_type} business.
${businessContext}
**Goal**: Get happy customers to refer friends/family

**Requirements**:
- Ask after a positive experience/completed service
- Make it easy to refer (one-click sharing)
- ${website_analysis ? 'Remind them why their friends would benefit (use differentiators)' : 'Explain the value their friends will get'}
- Optional: Include referral incentive for both parties
- Grateful, appreciative tone (not demanding)
- 120-150 words
- Clear call-to-action

**Best Practices**:
- Send 3-7 days after positive experience
- Make sharing effortless (pre-written message)
- Reward both referrer and referee
- Focus on value, not just discount
${website_analysis?.what_makes_you_different ? `\n- Highlight: ${website_analysis.what_makes_you_different[0]}` : ''}

**Psychology**:
- People refer when: (1) great experience (2) easy to do (3) makes them look good

Return ONLY valid JSON with:
{
  "subject": "Email subject line",
  "body": "Email body with [CUSTOMER NAME] placeholder",
  "shareable_message": "Pre-written message they can send to friends",
  "referral_incentive": "Suggested reward structure (e.g., Both get $20 off)",
  "cta_button_text": "Refer a Friend|Share the Love|etc",
  "timing_tip": "When to send this email for best results"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Referral request generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate referral request" },
      { status: 500 }
    );
  }
}
