import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, event_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeLocation: true,
    });

    const prompt = `Create a sponsorship pitch for ${business_name}, a ${business_type} business, targeting ${event_type || "local events, sports teams, or community organizations"}.
${businessContext}

**Sponsorship Goals**:
- Brand awareness in local community
- Association with positive events/teams
- Reach target customers
- Build community goodwill

**Pitch Structure**:
1. Who You Are: Brief intro + why you care about the community
2. Why This Event: Why you're interested in sponsoring
3. What You Offer: Sponsorship tiers and what you'll provide
4. What You Need: What exposure/benefits you're seeking
5. Next Steps: Simple way to move forward

**Sponsorship Tiers**:
- Title Sponsor ($$$): Name on everything
- Gold Sponsor ($$): Logo prominent placement
- Silver Sponsor ($): Logo on materials
- In-Kind Sponsor: Donate products/services

Return ONLY valid JSON with:
{
  "pitch_email": "Initial outreach email",
  "sponsor_tiers": [{"level": "Gold", "investment": "$500-1000", "benefits": ["Logo on jerseys", "Social media shoutouts"]}],
  "value_proposition": "Why sponsor with you vs cash-only sponsors",
  "follow_up_strategy": "How to follow up if no response",
  "roi_tracking": "How to measure sponsorship success"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate sponsorship pitch" }, { status: 500 });
  }
}
