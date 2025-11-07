import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, email_type } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Write a professional email for ${business_name}, a ${business_type} business.

**Email Purpose**: ${email_type || "Customer follow-up email"}

**Requirements**:
- Professional but friendly tone
- Specific to ${business_type} industry
- Include personalization spots for [CUSTOMER NAME]
- Clear call-to-action
- 150-200 words
- Subject line included

Return JSON with:
{
  "subject": "Email subject line",
  "body": "Email body with [CUSTOMER NAME] placeholder",
  "tips": "Quick tips for personalizing this email"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
