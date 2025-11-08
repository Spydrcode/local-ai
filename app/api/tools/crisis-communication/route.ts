import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, crisis_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Create crisis communication messaging for ${business_name}, a ${business_type} business.

**Crisis Type**: ${crisis_type || "unexpected business disruption"}

**Crisis Communication Principles**:
1. Transparency (be honest about what happened)
2. Speed (communicate quickly before rumors spread)
3. Empathy (acknowledge impact on customers)
4. Action plan (what you're doing about it)
5. Updates (commitment to ongoing communication)

**Channels to Address**:
- Email to customers
- Social media post
- Website banner/announcement
- Phone script for team

**Requirements**:
- Clear, direct language (no jargon)
- Factual without speculation
- Reassuring without minimizing
- Include timeline for resolution

Return ONLY valid JSON with:
{
  "email_announcement": "Email to send customers",
  "social_media_post": "Facebook/Instagram announcement",
  "website_banner": "Text for homepage alert",
  "customer_service_script": "What team should say when asked",
  "update_schedule": "When and how to provide updates",
  "do_not_say": ["Phrases to avoid"]
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate crisis communication" }, { status: 500 });
  }
}
