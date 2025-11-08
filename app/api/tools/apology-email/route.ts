import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, issue_description, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Create a sincere apology email for ${business_name}, a ${business_type} business.

**Issue**: ${issue_description || "service failure or mistake"}

**Apology Framework**:
1. Acknowledge the specific problem (no generic apologies)
2. Take responsibility (no excuses or blame-shifting)
3. Explain what happened (briefly, factually)
4. State how you'll prevent it in future
5. Offer concrete remedy/compensation
6. Rebuild trust with next steps

**Requirements**:
- Genuine and heartfelt (not corporate)
- Specific to their situation
- Action-oriented (what you'll do)
- 150-200 words
- Include: [CUSTOMER NAME] placeholder

**Tone**:
- Humble, not defensive
- Empathetic and understanding
- Solution-focused

Return ONLY valid JSON with:
{
  "subject": "Sincere subject line",
  "body": "Apology email with [CUSTOMER NAME]",
  "compensation_suggestion": "What to offer (refund, discount, free service)",
  "follow_up_action": "Next steps to rebuild trust",
  "internal_note": "How to prevent this issue internally"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate apology email" }, { status: 500 });
  }
}
