import { generateContent } from "@/lib/generateContent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { business_name, business_type, testimonial_text, website_analysis } = await request.json();
    if (!business_name || !business_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `Turn a customer testimonial into a shareable social media post for ${business_name}, a ${business_type} business.

**Original Testimonial**: ${testimonial_text || "[Customer testimonial]"}

**Requirements**:
- Create visually appealing post copy (Instagram & Facebook)
- Pull out the most compelling quote
- Add context about the customer's transformation
- Include relevant hashtags
- Suggest image/graphic layout
- Tag customer if appropriate

**Post Elements**:
- Eye-catching opening line
- The testimonial quote (formatted beautifully)
- Brief customer story/context
- Call-to-action for others
- 3-5 relevant hashtags

Return ONLY valid JSON with:
{
  "instagram_version": "Post copy for Instagram",
  "facebook_version": "Post copy for Facebook",
  "quote_highlight": "The best quote to feature",
  "image_suggestion": "What visual to create",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "caption_alternatives": ["Alt version 1", "Alt version 2"]
}`;

    const result = await generateContent(prompt);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate social testimonial" }, { status: 500 });
  }
}
