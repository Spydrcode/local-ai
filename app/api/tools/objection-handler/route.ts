import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, objection_type, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const objection = objection_type || "price";
    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
    });

    const prompt = `Create responses to handle customer objections for ${business_name}, a ${business_type} business.
${businessContext}

**Common Objections to Address**:
1. "Your price is too high"
2. "I need to think about it"
3. "I'm comparing you with [competitor]"
4. "I don't have time right now"
5. "I can do this myself"

**Response Framework for Each**:
- Acknowledge the concern (don't dismiss it)
- Reframe it as an opportunity
- ${website_analysis ? 'Tie back to specific differentiators/value' : 'Show unique value'}
- Ask a clarifying question
- Provide a next step

**Requirements**:
- Respectful and consultative (not pushy)
- Focus on value, not just price
- Use their differentiators to justify premium positioning
- 2-3 sentences per objection

Return ONLY valid JSON with:
{
  "price_objection": "Response to 'too expensive'",
  "timing_objection": "Response to 'not right now'",
  "competitor_objection": "Response to comparison shopping",
  "diy_objection": "Response to 'I'll do it myself'",
  "thinking_objection": "Response to 'I need to think'",
  "closing_tips": "How to close after handling objections"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate objection handlers" }, { status: 500 });
  }
}
