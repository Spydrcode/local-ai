import { generateContent } from "@/lib/generateContent";
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

    const role = job_role || "Team member";

    const prompt = `Create a job description for ${business_name}, a ${business_type} business.

**Position**: ${role}

**Requirements**:
- Clear job title and summary
- Key responsibilities (5-7 bullet points)
- Required skills and qualifications
- What makes this job attractive
- Company culture mentions specific to ${business_type}
- Benefits and perks
- How to apply

Make it specific to the ${business_type} industry and appealing to quality candidates.

Return JSON with:
{
  "description": "Full job description formatted with clear sections and line breaks",
  "posting_tips": "Where and how to post this for best results"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Job description generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
