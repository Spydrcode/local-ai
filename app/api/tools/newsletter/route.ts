import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Create a monthly newsletter for ${business_name}, a ${business_type} business.

**Requirements**:
- Engaging subject line
- Personal greeting
- 3-4 content sections:
  * Company update or news
  * Industry tip or insight specific to ${business_type}
  * Special offer or promotion
  * Customer spotlight or success story
- Clear call-to-action
- Sign-off
- 300-400 words total

Return JSON with:
{
  "subject": "Email subject line",
  "newsletter_content": "Full newsletter with sections, formatted with line breaks and headers"
}

Make it personal, valuable, and specific to ${business_type} industry.`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Newsletter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate newsletter" },
      { status: 500 }
    );
  }
}
