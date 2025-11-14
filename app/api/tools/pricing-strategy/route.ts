import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { WebScraperAgent } from "@/lib/agents/WebScraperAgent";
import {
  calculateOverallScore,
  createFinding,
  createToolOutput,
  type PricingToolInput,
} from "@/lib/tools/unified-tool-types";
import { NextResponse } from "next/server";

/**
 * Pricing Strategy Analyzer Tool
 *
 * Multi-agent orchestration for data-driven pricing optimization
 * Agents: WebScraperAgent, PricingIntelligenceAgent, CompetitiveIntelligenceAgent
 */

export async function POST(request: Request) {
  try {
    const input: PricingToolInput = await request.json();

    // Validate required fields
    if (!input.website_url && !input.intelligence) {
      return NextResponse.json(
        { error: "Missing required field: website_url or intelligence data" },
        { status: 400 }
      );
    }

    console.log(
      "[Pricing Strategy] Starting analysis for:",
      input.business_name
    );

    // Step 1: Get intelligence (use provided or scrape)
    let intelligence = input.intelligence;

    if (!intelligence && input.website_url) {
      console.log(
        "[Pricing Strategy] Deep scraping for pricing intelligence..."
      );
      const scraperAgent = new WebScraperAgent();
      intelligence = await scraperAgent.scrapeAndAnalyze({
        url: input.website_url,
        paths: ["/", "/pricing", "/services", "/about"],
        extractors: {
          business: true,
          competitors: true,
          seo: true,
        },
      });
    }

    // Step 2: Pricing Intelligence Analysis
    const pricingAgent = AgentRegistry.get("pricing-intelligence");
    if (!pricingAgent) {
      throw new Error("Pricing intelligence agent not found");
    }

    const pricingPrompt = `Analyze pricing strategy for ${input.business_name}, a ${input.business_type} business.

Current Situation:
- Services: ${intelligence?.business?.services?.join(", ") || "Unknown"}
- Differentiators: ${intelligence?.business?.differentiators?.join(", ") || "None identified"}
- Location: ${intelligence?.business?.location || "Unknown"}
- Current Pricing: ${input.current_pricing || "Unknown"}

Provide comprehensive pricing strategy:
1. **Value-Based Pricing Assessment**: Should they price based on value delivered (score 0-100)
2. **Competitive Positioning**: Budget/Mid-range/Premium - where do they fit and why
3. **Price Optimization**: Specific recommendation (raise/lower/maintain) with percentage
4. **Premium Justification**: How to justify higher prices using their differentiators
5. **Price Communication**: Script for announcing price changes to customers
6. **Discount Policy**: When to discount and when not to
7. **Psychological Pricing**: Charm pricing, anchoring strategies
8. **Package Strategy**: Good/Better/Best tier recommendations

Return detailed analysis in JSON format.`;

    const pricingResponse = await pricingAgent.execute(pricingPrompt, {
      businessName: input.business_name,
      businessType: input.business_type,
      intelligence: JSON.stringify(intelligence),
    });

    // Step 3: Competitive Intelligence for pricing
    const competitiveAgent = AgentRegistry.get("competitive-intelligence");
    const competitiveResponse = competitiveAgent
      ? await competitiveAgent.execute(
          `Analyze competitive pricing landscape for ${input.business_name}.
          
          Industry: ${input.business_type}
          Location: ${intelligence?.business?.location}
          Competitors: ${intelligence?.competitors?.map((c: any) => c.name).join(", ") || "Unknown"}
          
          Provide:
          1. Market price range (low, average, high)
          2. Competitor pricing strategies
          3. Price positioning opportunities
          4. Premium pricing feasibility
          5. Price-sensitive vs value-focused customers`,
          { intelligence: JSON.stringify(intelligence) }
        )
      : null;

    // Step 4: Calculate scores
    const hasDifferentiators =
      intelligence?.business?.differentiators?.length >= 2;
    const hasCompetitorData = intelligence?.competitors?.length > 0;

    const scoresData = {
      value_positioning: hasDifferentiators ? 85 : 50,
      competitive_intelligence: hasCompetitorData ? 80 : 40,
      pricing_confidence: hasDifferentiators && hasCompetitorData ? 90 : 60,
    };

    const scores = {
      ...scoresData,
      overall: calculateOverallScore(scoresData),
    };

    // Step 5: Build findings
    const findings = [];

    if (!hasDifferentiators) {
      findings.push(
        createFinding(
          "Weak Value Differentiation",
          "Without clear differentiators, you'll compete on price. Need 2-3 unique selling points to justify premium pricing.",
          "critical",
          [
            "Identify what makes your service unique",
            "Document certifications or specialized expertise",
            "Develop proprietary processes or methods",
            "Build brand reputation through reviews/testimonials",
          ],
          { category: "positioning", impact: "high" }
        )
      );
    }

    if (!hasCompetitorData) {
      findings.push(
        createFinding(
          "Missing Competitive Pricing Data",
          "No competitor data available. Understanding market rates is crucial for strategic pricing.",
          "high",
          [
            "Research competitor pricing (call for quotes)",
            "Analyze competitor service packages",
            "Identify price leaders vs value leaders",
            "Monitor competitor promotions",
          ],
          { category: "research", impact: "high" }
        )
      );
    }

    if (hasDifferentiators) {
      findings.push(
        createFinding(
          "Premium Pricing Opportunity",
          `${intelligence.business.differentiators.length} differentiators identified. Strong position for premium pricing.`,
          "medium",
          [
            "Emphasize unique value in marketing",
            "Create premium service tier",
            "Develop value-based pricing packages",
            "Train team on value communication",
          ],
          { category: "opportunity", impact: "high" }
        )
      );
    }

    // Step 6: Generate next steps
    const nextSteps = [
      "Review pricing recommendation and select target position",
      "Research competitor pricing for validation",
      "Prepare price communication script for customers",
      "Implement Good/Better/Best package structure",
      "Test new pricing with next 10 customers",
      "Monitor conversion rates after pricing changes",
    ];

    // Step 7: Build structured outputs
    let pricingAnalysis;
    try {
      pricingAnalysis = JSON.parse(pricingResponse.content);
    } catch {
      pricingAnalysis = { raw_analysis: pricingResponse.content };
    }

    const structuredOutputs = {
      pricing_recommendation:
        pricingAnalysis.pricing_recommendation ||
        pricingAnalysis.price_optimization ||
        "Analysis pending",
      competitive_positioning:
        pricingAnalysis.competitive_positioning || "Analysis pending",
      premium_justification:
        pricingAnalysis.premium_justification || "Analysis pending",
      price_communication:
        pricingAnalysis.price_communication ||
        pricingAnalysis.price_increase_script ||
        "Analysis pending",
      discount_policy: pricingAnalysis.discount_policy || "Analysis pending",
      value_based_score:
        pricingAnalysis.value_based_pricing_assessment ||
        scores.value_positioning,
      competitive_analysis:
        competitiveResponse?.content || "Competitive intelligence pending",
      intelligence_summary: {
        business_name: intelligence?.business?.name,
        differentiators: intelligence?.business?.differentiators,
        competitors_found: intelligence?.competitors?.length || 0,
        location: intelligence?.business?.location,
      },
    };

    // Step 8: Create standardized output
    const output = createToolOutput(
      "pricing_strategy",
      `Pricing analysis for ${input.business_name}: ${scores.overall >= 70 ? "Strong position for premium pricing" : "Needs differentiation work before raising prices"}`,
      structuredOutputs,
      {
        scores,
        findings,
        nextSteps,
        agentsUsed: ["pricing-intelligence", "competitive-intelligence"],
        ragEnhanced: false,
        intelligenceUsed: true,
      }
    );

    console.log("[Pricing Strategy] Analysis complete:", {
      overallScore: scores.overall,
      findingsCount: findings.length,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("[Pricing Strategy] Error:", error);
    return NextResponse.json(
      {
        error: "Pricing strategy analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
