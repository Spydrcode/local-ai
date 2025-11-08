import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, email_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build context from website analysis
    let businessContext = '';
    if (website_analysis) {
      const differentiators = website_analysis.what_makes_you_different?.slice(0, 2).join('\n- ') || '';
      const strengths = website_analysis.your_strengths?.slice(0, 2).join('\n- ') || '';

      businessContext = `
**BUSINESS CONTEXT (Use this to personalize the email):**
${differentiators ? `\nWhat makes them different:\n- ${differentiators}` : ''}
${strengths ? `\nKey strengths to mention:\n- ${strengths}` : ''}
${website_analysis.exact_sub_niche ? `\nTheir niche: ${website_analysis.exact_sub_niche}` : ''}

**IMPORTANT**: Reference their specific differentiators or strengths naturally in the email to show why customers should choose them.
`;
    }

    const prompt = `Write a professional email for ${business_name}, a ${business_type} business.
${businessContext}
**Email Purpose**: ${email_type || "Customer follow-up email"}

**Requirements**:
- Professional but friendly tone
- Specific to ${business_type} industry
- ${website_analysis ? 'Subtly mention their unique differentiators or strengths' : 'Provide value'}
- Include personalization spots for [CUSTOMER NAME]
- Clear call-to-action
- 150-200 words
- Subject line included

Return JSON with:
{
  "subject": "Email subject line",
  "body": "Email body with [CUSTOMER NAME] placeholder",
  "tips": "Quick tips for personalizing this email"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
