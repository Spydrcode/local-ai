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
    });

    const prompt = `Create Good/Better/Best service packages for ${business_name}, a ${business_type} business.
${businessContext}

**Package Strategy**:
- **Good**: Entry-level, core service only, attracts price shoppers
- **Better**: Mid-tier, includes extras, most popular (60-70% choose this)
- **Best**: Premium, everything included + VIP treatment, anchors pricing

**Requirements for Each Tier**:
- Clear name (not just "bronze/silver/gold")
- What's included (features)
- ${website_analysis ? 'Highlight differentiators in higher tiers' : 'Clear value progression'}
- Suggested price positioning (low/medium/high)
- Who it's for (customer type)

**Pricing Psychology**:
- Make "Better" the obvious value (slightly more than Good for much more value)
- "Best" should be 2-3x "Good" to make "Better" look reasonable
- Include one standout feature in "Best" that justifies the price

Return ONLY valid JSON with:
{
  "good_package": {"name": "", "price_suggestion": "", "includes": [], "best_for": ""},
  "better_package": {"name": "", "price_suggestion": "", "includes": [], "best_for": "", "most_popular": true},
  "best_package": {"name": "", "price_suggestion": "", "includes": [], "best_for": ""},
  "upsell_strategy": "How to move customers from Good to Better"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate service packages" }, { status: 500 });
  }
}
