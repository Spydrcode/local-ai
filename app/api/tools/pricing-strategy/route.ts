import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext, getCompetitorInsights } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, current_pricing, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      includeThreats: true,
    });
    const competitorInsights = getCompetitorInsights(website_analysis);

    const prompt = `Create a pricing strategy guide for ${business_name}, a ${business_type} business.
${businessContext}
${competitorInsights}

**Current Situation**: ${current_pricing || "Unsure if prices are competitive"}

**Pricing Strategy Analysis**:
1. **Value-Based Pricing**: Price based on value delivered, not costs
2. **Competitive Positioning**: ${website_analysis ? 'Use differentiators to justify premium pricing' : 'Where do you fit in the market?'}
3. **Psychological Pricing**: Charm pricing ($99 vs $100), anchoring, etc.
4. **Package Strategy**: Good/Better/Best tiers

**Questions to Address**:
- Should you raise prices? (most small businesses undercharge)
- How to communicate price increases to existing customers
- When to offer discounts (and when not to)
- How to justify premium pricing using differentiators

**Based on Their Analysis**:
${website_analysis?.what_makes_you_different?.[0] ? `- Their #1 differentiator: ${website_analysis.what_makes_you_different[0]}` : ''}
${website_analysis?.threats_to_watch?.[0] ? `- Price pressure from: ${website_analysis.threats_to_watch[0]}` : ''}

Return ONLY valid JSON with:
{
  "pricing_recommendation": "Should they raise/lower/maintain prices and why",
  "premium_justification": "How to justify higher prices using differentiators",
  "price_increase_script": "How to announce price increases",
  "discount_policy": "When to discount and when not to",
  "competitive_positioning": "Budget|Mid-range|Premium and why",
  "value_communication": "How to communicate value vs competitors"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate pricing strategy" }, { status: 500 });
  }
}
