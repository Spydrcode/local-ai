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

    const prompt = `Create an FAQ page for ${business_name}, a ${business_type} business.

**Requirements**:
- 8-12 common questions customers ask about ${business_type}
- Clear, concise answers
- Specific to their industry
- Cover: pricing, process, booking/ordering, timelines, what to expect
- Friendly, helpful tone
- Include calls-to-action where appropriate

Return JSON with:
{
  "faqs": [
    {
      "question": "Question text",
      "answer": "Answer text with specifics for ${business_type}"
    }
  ],
  "implementation_tips": "How to add this to your website"
}

Make each answer 2-4 sentences and specific to the ${business_type} industry.`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("FAQ generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate FAQ" },
      { status: 500 }
    );
  }
}
