import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      includeQuickWins: true,
    });

    const prompt = `Create a 3-email sales sequence for ${business_name}, a ${business_type} business, to convert leads into customers.
${businessContext}

**Email 1 - Value/Education** (Day 1):
- Introduce yourself and establish credibility
- ${website_analysis ? 'Reference a key differentiator' : 'Provide immediate value'}
- No hard sell, just helpful information
- Soft CTA to learn more

**Email 2 - Social Proof/Case Study** (Day 3):
- Share a success story or testimonial
- Show the transformation/results
- Address common objections
- Medium CTA (book consultation, free audit)

**Email 3 - Offer/Urgency** (Day 5):
- Direct offer with clear value proposition
- ${website_analysis ? 'Highlight all differentiators' : 'Strong unique value'}
- Create urgency (limited spots, deadline, bonus)
- Strong CTA (schedule call, sign up, purchase)

Return ONLY valid JSON with:
{
  "email_1": {"subject": "", "body": "", "cta": ""},
  "email_2": {"subject": "", "body": "", "cta": ""},
  "email_3": {"subject": "", "body": "", "cta": ""},
  "sequence_tips": "Best practices for this sequence"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate sales sequence" }, { status: 500 });
  }
}
