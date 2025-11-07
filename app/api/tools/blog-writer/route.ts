import { agentSystem } from "@/lib/agents/core/AgentSystem";
import { NextResponse } from "next/server";

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

Return JSON with:
{
  "title": "SEO-optimized blog title",
  "content": "Full blog post with markdown headings",
  "meta_description": "160-character SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    // Use the new AgentSystem with caching, circuit breaker, and metrics
    const response = await agentSystem.executeAgent(
      "content-generator",
      prompt,
      {
        business_name,
        business_type,
        topic: blogTopic,
      }
    );

    let blogPost;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        blogPost = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return NextResponse.json(
        {
          error: "Unable to generate blog post. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...blogPost,
      _metadata: {
        executionTime: response.metadata.executionTime,
        provider: response.metadata.provider,
      },
    });
  } catch (error) {
    console.error("Blog post generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
