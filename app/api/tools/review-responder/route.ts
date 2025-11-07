import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, review_text, review_rating } =
      await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional response to this review for ${business_name}, a ${business_type} business.

**Review**: ${review_text || "Great service and friendly staff!"}
**Rating**: ${review_rating || "5"} stars

**Requirements**:
- Thank the customer by name if mentioned
- Address specific points they mentioned
- Match the tone (enthusiastic for 5-star, empathetic for lower ratings)
- Invite them back or offer to make things right
- Professional yet personal
- 50-100 words

Return JSON with:
{
  "response": "The review response text",
  "tone_tips": "How to adjust this for your brand voice"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Review response generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate review response" },
      { status: 500 }
    );
  }
}
