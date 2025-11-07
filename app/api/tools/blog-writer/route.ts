import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { business_name, business_type, topic } = await request.json();

    if (!business_name || !business_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const blogTopic = topic || `Common questions about ${business_type}`;

    const prompt = `Write an SEO-optimized blog post for ${business_name}, a ${business_type} business.

**Topic**: ${blogTopic}

**Requirements**:
- 500-700 words
- Specific to ${business_type} industry with expert insights
- H2 and H3 headings for structure
- Actionable tips readers can use
- Natural keyword integration
- Conversational but authoritative tone
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
          content: "You are an expert content writer. Always return valid JSON only.",
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
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}