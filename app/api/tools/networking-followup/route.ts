import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, meeting_context, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create networking follow-up emails for ${business_name}, a ${business_type} business.
${businessContext}

**Context**: ${meeting_context || "Met at networking event"}

**Follow-Up Goals**:
- Remind them who you are
- Reference specific conversation points
- Provide value (don't just ask for business)
- Suggest next step (coffee, call, referral)

**Templates Needed**:
1. **Same Day Follow-Up**: Send within 24 hours of meeting
2. **Partnership Exploration**: For potential partners
3. **Referral Request**: For people who can refer customers
4. **Stay in Touch**: For general contacts

**Requirements**:
- Personal (reference specific conversation)
- Valuable (offer something helpful)
- Clear next step (meeting, call, connect on LinkedIn)
- Brief (3-4 sentences max)

Return ONLY valid JSON with:
{
  "same_day_followup": {"subject": "", "body": ""},
  "partnership_exploration": {"subject": "", "body": ""},
  "referral_request": {"subject": "", "body": ""},
  "stay_in_touch": {"subject": "", "body": ""},
  "linkedin_connection_note": "Personal message when connecting",
  "followup_timeline": "When to send each type"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate networking follow-up" }, { status: 500 });
  }
}
