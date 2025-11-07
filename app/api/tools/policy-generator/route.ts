import { AgentRegistry } from "@/lib/agents/unified-agent-system";
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

    const agent = AgentRegistry.get("content-generator");

    if (!agent) {
      throw new Error("Content generator agent not found");
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
  "title": "${policyKind}",
  "policy_text": "Full policy with sections and formatting",
  "customization_notes": "How to customize this for your specific needs"
}`;

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
      policy_type: policyKind,
    });

    let policy;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        policy = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate policy. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Policy generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate policy" },
      { status: 500 }
    );
  }
}
