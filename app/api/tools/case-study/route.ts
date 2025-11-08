import { generateContent } from "@/lib/generateContent";
import { buildBusinessContext } from "@/lib/build-business-context";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, customer_result, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const businessContext = buildBusinessContext(website_analysis, {
      includeDifferentiators: true,
      includeStrengths: true,
    });

    const prompt = `Create a case study outline for ${business_name}, a ${business_type} business.
${businessContext}

**Customer Success**: ${customer_result || "achieved significant results"}

**Case Study Structure** (Before-After-Bridge):
1. **The Customer**: Who they are, industry, size
2. **The Challenge**: Specific problem they faced
3. **Why They Chose Us**: ${website_analysis ? 'Reference specific differentiators' : 'Why us over competitors'}
4. **The Solution**: What we did (3-4 key actions)
5. **The Results**: Quantifiable outcomes (%, $, time saved)
6. **The Quote**: Testimonial that validates differentiators

**Requirements**:
- 300-400 words
- Specific numbers and metrics
- Highlight process that showcases differentiators
- Professional but storytelling tone
- Include a call-to-action

Return ONLY valid JSON with:
{
  "title": "Case study title",
  "customer_profile": "Who they are",
  "challenge": "The problem",
  "solution": "What we did (markdown)",
  "results": ["50% increase in X", "Saved $10K annually"],
  "testimonial_quote": "What the customer said",
  "cta": "Want similar results? Contact us"
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate case study" }, { status: 500 });
  }
}
