import { AgentRegistry } from "@/lib/agents/unified-agent-system";
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

    const agent = AgentRegistry.get("content-generator");

    if (!agent) {
      throw new Error("Content generator agent not found");
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

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
      email_type: email_type || "customer follow-up",
    });

    let emailData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate email. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(emailData);
  } catch (error) {
    console.error("Email generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}
