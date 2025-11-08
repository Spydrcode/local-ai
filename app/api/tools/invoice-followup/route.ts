import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, days_overdue, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const daysOverdue = days_overdue || "7";

    const prompt = `Create invoice follow-up emails for ${business_name}, a ${business_type} business.

**Scenario**: Invoice ${daysOverdue} days overdue

**Follow-Up Sequence**:
1. **Friendly Reminder** (3-5 days): Maybe they forgot
2. **Second Notice** (7-10 days): Polite but firm
3. **Final Notice** (15+ days): Serious consequences

**Tone Progression**:
- Start friendly and assuming good intent
- Gradually become more formal
- Always professional, never hostile

**Include**:
- Invoice number and amount
- Original due date
- Payment methods
- Late fees (if applicable)
- Contact for questions

Return ONLY valid JSON with:
{
  "first_reminder": {"subject": "", "body": ""},
  "second_notice": {"subject": "", "body": ""},
  "final_notice": {"subject": "", "body": ""},
  "payment_plan_offer": "How to offer payment plans",
  "collection_trigger": "When to escalate to collections"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate invoice follow-up" }, { status: 500 });
  }
}
