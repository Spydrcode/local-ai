import { NextResponse } from "next/server";
import { executeToolAgent, validateToolRequest } from "@/lib/agents/tool-agent-helper";

/**
 * Blog Writer API Route
 * NOW USES UNIFIED AGENT SYSTEM for consistency and proper agentic framework
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Blog writer request:", {
      business_name: body.business_name,
      business_type: body.business_type,
      topic: body.topic,
      has_website_analysis: !!body.website_analysis,
    });

    // Validate request
    validateToolRequest(body);

    // Execute using unified agent system
    const result = await executeToolAgent('blog-writer', body);

    return NextResponse.json(result);
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
