import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, policy_type } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const policyKind = policy_type || "Return Policy";

    const prompt = `Create a ${policyKind} for ${business_name}, a ${business_type} business.

**Policy Type**: ${policyKind}

**Requirements**:
- Clear and easy to understand
- Specific to ${business_type} industry standards
- Legally sound but customer-friendly tone
- Cover key scenarios relevant to their business
- Include timeframes and conditions
- Contact information placeholders

Common policy types: Return Policy, Refund Policy, Privacy Policy, Terms of Service, Cancellation Policy

Return JSON with:
{
  "policy_title": "${policyKind}",
  "policy_text": "Full policy formatted with sections and line breaks",
  "legal_disclaimer": "Important note about consulting a lawyer for specific legal needs"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Policy generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate policy" },
      { status: 500 }
    );
  }
}
