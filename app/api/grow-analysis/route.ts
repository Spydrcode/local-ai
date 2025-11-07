import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { website, business_name, industry } = await request.json();

    if (!website || !business_name) {
      return NextResponse.json(
        { error: "Website and business name are required" },
        { status: 400 }
      );
    }

    // Get the strategic analysis agent (already registered in unified-agent-system)
    const agent = AgentRegistry.get("strategic-analysis");

    if (!agent) {
      throw new Error("Strategic analysis agent not found");
    }

    // Porter's 5 Forces analysis disguised as relatable questions
    const porterPrompt = `You are analyzing ${business_name} (${website}) in the ${industry} industry.

**CRITICAL INSTRUCTIONS**:
1. First, identify the EXACT business sub-niche (e.g., "Texas BBQ catering with competition-grade meats" NOT just "restaurant")
2. Analyze what makes THIS specific business DIFFERENT from typical competitors
3. Reference their ACTUAL location, services, and competitive position
4. Avoid ALL generic business advice - be hyper-specific to their industry and market

**MANDATORY ANALYSIS**:

STEP 1 - Visit ${website} and extract:
- Exact business classification and sub-niche
- Specific products/services they offer (by name)
- Their location and service area
- What makes them unique (credentials, methods, specializations)
- Their target customer segments

STEP 2 - Competitive Analysis (Porter's 5 Forces in plain English):
- Customer switching costs: How easy is it for customers to leave for competitors?
- New competitor threats: What barriers prevent new competitors from entering?
- Supplier power: How dependent are they on specific suppliers?
- Customer bargaining power: How price-sensitive are their customers?
- Substitute products: What alternatives do customers have?

STEP 3 - SWOT Analysis (in plain language):
- Strengths: What are they doing RIGHT based on their actual offerings?
- Opportunities: What's the #1 missed opportunity for THIS type of business in their market?
- Threats: What external challenges should they monitor?
- Quick Wins: Concrete actions they can take THIS WEEK specific to their business model

Return this EXACT JSON format:
{
  "business_name": "${business_name}",
  "website": "${website}",
  "exact_sub_niche": "SPECIFIC sub-niche classification (e.g., '24/7 emergency propane delivery service in Phoenix East Valley' NOT 'propane company')",
  "location_context": "Their actual service area and geographic advantages/challenges",
  "what_makes_you_different": [
    "List 3-5 SPECIFIC competitive advantages referencing their ACTUAL services, credentials, or methods",
    "Example: 'Only 24/7 emergency delivery in East Valley with 4hr average response time'",
    "Example: 'Competition-grade BBQ (3x state champion) with corporate catering focus'",
    "NOT generic things like 'great customer service' or 'quality products'"
  ],
  "why_customers_choose_competitors": [
    {
      "question": "Can customers easily switch to competitors?",
      "insight": "Specific analysis for THIS business type in their location (reference actual competitors if possible)",
      "action": "Concrete action using their actual services/offerings (e.g., 'Create loyalty program for your LP tank exchange customers with 10th fill free')"
    },
    {
      "question": "Are new competitors entering your market?",
      "insight": "Analysis specific to ${industry} industry barriers in their location",
      "action": "Specific defensive action (e.g., 'Lock in corporate catering clients with annual contracts for quarterly events')"
    },
    {
      "question": "How much power do your suppliers have?",
      "insight": "Supplier analysis specific to ${industry} industry",
      "action": "Specific action to improve supplier position"
    },
    {
      "question": "How much power do your customers have?",
      "insight": "Customer bargaining power in ${industry} for their target segments",
      "action": "Specific value-add beyond price (reference their actual differentiators)"
    },
    {
      "question": "What alternatives do customers have?",
      "insight": "Substitute products/services specific to their offerings",
      "action": "Differentiation strategy using their actual unique features"
    }
  ],
  "your_strengths": [
    "4-6 SPECIFIC strengths based on their actual offerings",
    "Reference real services, credentials, years in business, geographic coverage",
    "Example: '4 retail locations for tank exchange vs delivery-only competitors'",
    "Example: '14-hour smoking process creates competition-grade brisket with smoke rings'"
  ],
  "opportunities": [
    "4-6 SPECIFIC growth opportunities for THIS business type in their market",
    "Reference what successful competitors in their category emphasize",
    "Include specific metrics where possible (e.g., 'BBQ caterers see 40-60% revenue from online advance orders')",
    "Example: 'Add online ordering for your signature catering packages - capture game day and corporate event bookings'"
  ],
  "threats_to_watch": [
    "3-5 external challenges specific to ${industry} in their location",
    "Reference actual market trends, regulatory changes, or competitive moves",
    "Example: 'Big chains like [competitor] expanding into Phoenix East Valley'",
    "Example: 'Rising propane costs putting pressure on delivery margins'"
  ],
  "quick_wins": [
    {
      "title": "SPECIFIC action using their actual services (e.g., 'Feature your LP tank exchange pricing ($25) prominently')",
      "why": "Why THIS matters for their specific business and competitive position",
      "action": "Exact steps referencing their actual website, services, or market position",
      "difficulty": "easy|medium|advanced",
      "estimated_impact": "Quantified potential result specific to their industry"
    }
  ]
}

**EXAMPLES OF GOOD vs BAD**:

❌ BAD (Generic):
- "Improve online presence"
- "Great customer service"
- "Competitive pricing"
- "Build brand awareness"

✅ GOOD (Specific to actual business):
- "Feature your 24/7 emergency propane delivery with 4hr avg response time - competitors take 24-48hrs"
- "Showcase your 3x state BBQ championship wins on catering packages to justify premium pricing"
- "Add Yelp ordering integration for your signature pulled pork platters - competitors with online ordering see 35% higher tickets"
- "Promote your 4 retail tank exchange locations vs delivery-only competitors - convenience wins for grill users"

Analyze THEIR actual business. Show them you understand THEIR specific market position.`;

    const response = await agent.execute(porterPrompt);

    // Parse the response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response content:", response.content);
      // Return error instead of fallback template
      return NextResponse.json(
        {
          error:
            "Unable to analyze business. The AI response could not be parsed. Please try again.",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Grow analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze business" },
      { status: 500 }
    );
  }
}
