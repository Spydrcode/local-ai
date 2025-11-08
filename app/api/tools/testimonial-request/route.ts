import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      maxDifferentiators: 2,
    });

    const prompt = `Create a testimonial request email for ${business_name}, a ${business_type} business.
${businessContext}

**Goal**: Get customers to leave a Google/Yelp review or provide a testimonial

**Requirements**:
- Ask at the right moment (after successful delivery/completion)
- Make it easy (one-click review links)
- ${website_analysis ? 'Guide them to mention specific differentiators' : 'Provide guiding questions'}
- Show appreciation
- 80-120 words
- Optional: Small incentive for leaving review

**Psychology**:
- People are most willing to review right after a great experience
- Make it effortless (direct links, not "search for us")
- Give them a framework (what to mention)

${website_analysis?.what_makes_you_different?.[0] ? `\nGuide them to mention: ${website_analysis.what_makes_you_different[0]}` : ''}

Return ONLY valid JSON with:
{
  "subject": "Email subject",
  "body": "Email body with [CUSTOMER NAME]",
  "review_questions": ["What problem did we solve?", "What stood out about our service?"],
  "thank_you_note": "What to say after they leave a review",
  "timing": "When to send (e.g., 2 days after service completion)"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate testimonial request" }, { status: 500 });
  }
}
