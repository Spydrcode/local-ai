import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, job_role } = await request.json();

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

    const role = job_role || "Team member";

    const prompt = `Create a job description for ${business_name}, a ${business_type} business.

**Position**: ${role}

**Requirements**:
- Clear job title and summary
- Key responsibilities (5-7 bullet points)
- Required skills and qualifications
- What makes this job attractive
- Company culture mentions specific to ${business_type}
- Salary range if appropriate
- Benefits and perks
- How to apply

Make it specific to the ${business_type} industry and appealing to quality candidates.

Return JSON with:
{
  "title": "Job title",
  "description": "Full job description with sections",
  "key_qualifications": ["qual1", "qual2", "qual3"],
  "posting_tips": "Where and how to post this for best results"
}`;

    const response = await agent.execute(prompt, {
      business_name,
      business_type,
      job_role: role,
    });

    let jobDesc;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jobDesc = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate job description. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(jobDesc);
  } catch (error) {
    console.error("Job description generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
