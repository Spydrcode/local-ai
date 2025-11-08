import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, review_summary, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reviewContext = review_summary || "customer had a negative experience";

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: false,
      includeStrengths: true,
      maxStrengths: 2,
    });

    const prompt = `Create a professional response to a negative review for ${business_name}, a ${business_type} business.
${businessContext}

**Review Context**: ${reviewContext}

**Response Requirements**:
- Empathetic and sincere (not defensive)
- Acknowledge their experience without admitting fault unnecessarily
- Take responsibility where appropriate
- Offer to make it right (specific solution if possible)
- Keep it professional (other customers are reading)
- 100-150 words
- Include contact info to continue offline

**Framework**:
1. Thank them for feedback
2. Acknowledge their frustration
3. Explain what happened (briefly, no excuses)
4. Explain how you'll prevent this in future
5. Offer to make it right
6. Invite them to contact you directly

**Tone**:
- Professional but warm
- Concerned, not corporate
- Solution-oriented

**CRITICAL**: Never argue, make excuses, or blame the customer. Focus on resolution.

Return ONLY valid JSON with:
{
  "response": "Complete review response",
  "alternative_version": "Slightly different approach",
  "follow_up_email": "Email to send if they contact you",
  "prevention_tip": "Internal note on how to prevent this issue",
  "when_to_escalate": "Red flags that need manager/owner involvement"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Negative review response generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate negative review response" },
      { status: 500 }
    );
  }
}
