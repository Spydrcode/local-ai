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

    const prompt = `Design a simple, effective loyalty program for ${business_name}, a ${business_type} business.
${businessContext}
**Goal**: Increase repeat purchases and customer lifetime value

**Requirements**:
- Simple to understand and implement (no complex point systems)
- Tailored to ${business_type} industry
- ${website_analysis ? 'Leverages their unique differentiators' : 'Fits their business model'}
- Easy to track (punch card, visit-based, or dollar-based)
- Compelling rewards that customers actually want
- Clear communication of benefits

**Program Types to Consider**:
- Punch card (buy 10, get 1 free)
- Tiered rewards (bronze/silver/gold)
- Spend-based ($100 spent = $10 credit)
- Visit-based (5th visit free)
- VIP early access to new products/services

${website_analysis?.exact_sub_niche ? `\nFor their niche (${website_analysis.exact_sub_niche}), what loyalty structure makes most sense?` : ''}

Return ONLY valid JSON with:
{
  "program_name": "Catchy name for the loyalty program",
  "program_type": "Punch card|Tiered|Spend-based|Visit-based",
  "how_it_works": "Simple 2-3 sentence explanation",
  "reward_tiers": [
    {"level": "Bronze/First tier", "requirement": "5 visits", "reward": "10% off next purchase"},
    {"level": "Silver/Second tier", "requirement": "10 visits", "reward": "Free item + 15% off"}
  ],
  "communication_script": "How to explain it to customers",
  "sign_up_incentive": "What to offer for joining",
  "implementation_tips": "How to launch and track it (apps, tools, manual methods)"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Loyalty program generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate loyalty program" },
      { status: 500 }
    );
  }
}
