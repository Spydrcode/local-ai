import { AgentRegistry } from "@/lib/agents/unified-agent-system";
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

    const agent = AgentRegistry.get("content-generator");

    if (!agent) {
      throw new Error("Content generator agent not found");
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

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
    });

    let faqData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        faqData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate FAQ. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(faqData);
  } catch (error) {
    console.error("FAQ generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate FAQ" },
      { status: 500 }
    );
  }
}
