import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, partner_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
      includeLocation: true,
    });

    const prompt = `Create a partnership proposal for ${business_name}, a ${business_type} business, to pitch to ${partner_type || "complementary local businesses"}.
${businessContext}

**Partnership Value Proposition**:
- Why partnering with you benefits them
- Mutual customer base overlap
- ${website_analysis ? 'How your differentiators add value to their customers' : 'Unique value you bring'}
- Low effort, high reward for both parties

**Proposal Structure**:
1. Introduction: Who you are, what you do
2. The Opportunity: Why this partnership makes sense
3. Benefits for Them: What they gain (referrals, revenue share, etc.)
4. How It Works: Simple 3-step process
5. Next Steps: Easy way to get started

**Partnership Ideas**:
- Cross-promotion (feature each other)
- Referral program (commission on referrals)
- Bundled services (package deal)
- Event co-hosting
- Shared marketing costs

Return ONLY valid JSON with:
{
  "email_pitch": "Partnership proposal email",
  "one_pager": "Brief PDF/handout summary",
  "value_proposition": "One sentence: why partner with you",
  "partnership_tiers": ["Referral only", "Co-marketing", "Revenue share"],
  "success_metrics": "How to measure partnership success"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate partnership pitch" }, { status: 500 });
  }
}
