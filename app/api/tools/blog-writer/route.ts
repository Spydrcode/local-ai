import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { business_name, business_type, topic, website_analysis } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const blogTopic = topic || `Common questions about ${business_type}`;

    // Build context from website analysis
    let businessContext = '';
    if (website_analysis) {
      const differentiators = website_analysis.what_makes_you_different?.slice(0, 3).join('\n- ') || '';
      const strengths = website_analysis.your_strengths?.slice(0, 3).join('\n- ') || '';
      const opportunities = website_analysis.opportunities?.slice(0, 2).join('\n- ') || '';

      businessContext = `
**BUSINESS EXPERTISE (Use this to demonstrate their unique knowledge):**
${differentiators ? `\nWhat makes them different:\n- ${differentiators}` : ''}
${strengths ? `\nTheir expertise areas:\n- ${strengths}` : ''}
${opportunities ? `\nTopics they can speak authoritatively on:\n- ${opportunities}` : ''}
${website_analysis.exact_sub_niche ? `\nTheir niche: ${website_analysis.exact_sub_niche}` : ''}

**IMPORTANT**: Write from the perspective of THEIR specific expertise. Reference their differentiators naturally to establish authority. Make this blog uniquely theirs, not generic industry content.
`;
    }

    const prompt = `Write an SEO-optimized blog post for ${business_name}, a ${business_type} business.
${businessContext}
**Topic**: ${blogTopic}

**Requirements**:
- 500-700 words
- ${website_analysis ? 'Demonstrate their specific expertise and differentiators' : 'Specific to ' + business_type + ' industry with expert insights'}
- H2 and H3 headings for structure
- Actionable tips readers can use
- Natural keyword integration
- Conversational but authoritative tone
- ${website_analysis ? 'Subtly reference their unique strengths or approach' : 'Show industry expertise'}
- Include call-to-action at end

Return ONLY valid JSON with:
{
  "title": "SEO-optimized blog title",
  "content": "Full blog post with markdown headings",
  "meta_description": "160-character SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content writer. Always return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const blogPost = JSON.parse(response);

    return NextResponse.json({
      ...blogPost,
      _metadata: {
        model: "gpt-4o-mini",
        business_name,
        business_type,
      },
    });
  } catch (error) {
    console.error("Blog post generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
