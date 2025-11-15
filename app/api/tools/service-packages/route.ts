import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { WebScraperAgent } from "@/lib/agents/WebScraperAgent";
import {
  calculateOverallScore,
  createFinding,
  createToolOutput,
  type PackageDesignerInput,
} from "@/lib/tools/unified-tool-types";
import { NextResponse } from "next/server";

/**
 * Service Package & Offer Designer Tool
 *
 * Multi-agent orchestration for Good/Better/Best package creation
 * Agents: WebScraperAgent, StrategicAnalysisAgent, RevenueIntelligenceAgent
 */

// Increase timeout for scraping and multi-agent analysis
export const maxDuration = 60; // 60 seconds

export async function POST(request: Request) {
  try {
    const input: PackageDesignerInput = await request.json();

    // Validate required fields
    if (!input.business_name || !input.business_type) {
      return NextResponse.json(
        { error: "Missing required fields: business_name, business_type" },
        { status: 400 }
      );
    }

    console.log(
      "[Service Packages] Starting package design for:",
      input.business_name
    );

    // Step 1: Get intelligence (use provided or scrape if URL available)
    let intelligence = input.intelligence;

    if (!intelligence && input.website_url) {
      // Use quick scrape for demo mode (homepage only) to avoid timeouts
      console.log("[Service Packages] Quick scraping for service intelligence (demo mode)...");
      const scraperAgent = new WebScraperAgent();
      intelligence = await scraperAgent.scrapeAndAnalyze({
        url: input.website_url,
        paths: ["/"], // Only homepage for speed - upgradeable to ["/", "/services", "/pricing", "/packages"] for paid
        extractors: {
          business: true,
          seo: true,
        },
      });
    }

    // Step 2: Strategic Analysis for Package Design
    const strategicAgent = AgentRegistry.get("strategic-analysis");
    if (!strategicAgent) {
      throw new Error("Strategic analysis agent not found");
    }

    const packagePrompt = `Design Good/Better/Best service packages for ${input.business_name}, a ${input.business_type} business.

Business Context:
- Services: ${intelligence?.business?.services?.join(", ") || input.current_services?.join(", ") || "Unknown"}
- Differentiators: ${intelligence?.business?.differentiators?.join(", ") || "None identified"}
- Target Market: ${input.target_market || intelligence?.business?.location || "General"}
- Current Offerings: ${input.current_services?.length || intelligence?.business?.services?.length || 0} services

**Package Strategy Framework**:

**GOOD Package (Entry-Level)**:
- Core service only, no extras
- Attracts price-conscious customers
- Gateway to relationship
- Should be profitable but basic
- 20-30% of customers typically choose this

**BETTER Package (Most Popular)**:
- Mid-tier with valuable extras
- Best value perception (slightly more $ for much more value)
- 60-70% of customers choose this (design for this!)
- Includes differentiators
- Clear upgrade path from GOOD

**BEST Package (Premium)**:
- Everything included + VIP treatment
- 2-3x price of GOOD package
- Anchors pricing (makes BETTER look reasonable)
- 10-20% of high-value customers
- Must include exclusive features

**Requirements**:
1. Creative tier names (not bronze/silver/gold)
2. Clear feature lists for each tier
3. Pricing psychology (make BETTER the obvious choice)
4. Customer personas for each tier
5. Upsell strategy from GOOD to BETTER

${
  intelligence?.business?.differentiators?.length
    ? `
**CRITICAL**: Feature these differentiators in higher tiers:
${intelligence.business.differentiators.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n")}
`
    : ""
}

Return comprehensive package design in JSON format with:
- good_package: {name, price_suggestion, includes[], best_for, why_customers_choose}
- better_package: {name, price_suggestion, includes[], best_for, value_proposition, most_popular: true}
- best_package: {name, price_suggestion, includes[], best_for, exclusive_features[]}
- upsell_strategy: How to move customers from GOOD to BETTER
- pricing_psychology: Why BETTER will be most popular
- implementation_tips: How to present packages`;

    const packageResponse = await strategicAgent.execute(packagePrompt, {
      businessName: input.business_name,
      businessType: input.business_type,
      intelligence: JSON.stringify(intelligence),
    });

    // Step 3: Revenue Intelligence for pricing validation
    const revenueAgent = AgentRegistry.get("revenue-intelligence");
    const revenueResponse = revenueAgent
      ? await revenueAgent.execute(
          `Validate package pricing strategy for ${input.business_name}.
          
          Industry: ${input.business_type}
          Market: ${input.target_market || "General"}
          
          Analyze:
          1. Optimal price spread (GOOD vs BETTER vs BEST)
          2. Value ladder progression
          3. Profit margin optimization
          4. Customer lifetime value by tier
          5. Upsell conversion expectations`,
          { intelligence: JSON.stringify(intelligence) }
        )
      : null;

    // Step 4: Calculate scores
    const hasServices =
      (intelligence?.business?.services?.length ||
        input.current_services?.length ||
        0) >= 3;
    const hasDifferentiators =
      (intelligence?.business?.differentiators?.length || 0) >= 2;

    const scoresData = {
      package_design: hasServices ? 85 : 60,
      value_differentiation: hasDifferentiators ? 90 : 50,
      revenue_potential: hasServices && hasDifferentiators ? 85 : 55,
    };

    const scores = {
      ...scoresData,
      overall: calculateOverallScore(scoresData),
    };

    // Step 5: Build findings
    const findings = [];

    if (!hasServices) {
      findings.push(
        createFinding(
          "Limited Service Offerings",
          "Less than 3 services identified. More offerings enable better package variety.",
          "medium",
          [
            "Audit all services you could offer",
            "Identify complementary services to bundle",
            "Consider seasonal or specialized offerings",
            "Survey customers for desired add-ons",
          ],
          { category: "offerings", impact: "medium" }
        )
      );
    }

    if (!hasDifferentiators) {
      findings.push(
        createFinding(
          "Weak Package Differentiation",
          "Without clear differentiators, packages will compete on features/price only.",
          "high",
          [
            "Identify unique service elements",
            "Develop proprietary processes",
            "Add personalized touches to premium tiers",
            "Create exclusive benefits for BEST package",
          ],
          { category: "differentiation", impact: "high" }
        )
      );
    }

    if (hasServices && hasDifferentiators) {
      findings.push(
        createFinding(
          "Strong Package Foundation",
          "Multiple services + differentiators = excellent package potential",
          "low",
          [
            "Feature differentiators prominently in BETTER/BEST",
            "Bundle complementary services strategically",
            "Price BETTER for maximum perceived value",
            "Add VIP elements to BEST package",
          ],
          { category: "opportunity", impact: "high" }
        )
      );
    }

    // Step 6: Generate next steps
    const nextSteps = [
      "Review package designs and select tier names",
      "Validate pricing with test group of customers",
      "Create sales materials highlighting BETTER package",
      "Train team on package presentation",
      "Implement upsell strategy in sales process",
      "Track conversion rates by package tier",
    ];

    // Step 7: Build structured outputs
    let packageDesign;
    try {
      packageDesign = JSON.parse(packageResponse.content);
    } catch {
      packageDesign = { raw_analysis: packageResponse.content };
    }

    const structuredOutputs = {
      good_package: packageDesign.good_package || {
        name: "Essential",
        price_suggestion: "Entry-level pricing",
        includes: ["Core service"],
        best_for: "Price-conscious customers",
      },
      better_package: packageDesign.better_package || {
        name: "Professional",
        price_suggestion: "Mid-tier pricing",
        includes: ["Core service", "Extras"],
        best_for: "Most customers",
        most_popular: true,
      },
      best_package: packageDesign.best_package || {
        name: "Premium",
        price_suggestion: "Top-tier pricing",
        includes: ["Everything", "VIP treatment"],
        best_for: "High-value customers",
      },
      upsell_strategy: packageDesign.upsell_strategy || "Analysis pending",
      pricing_psychology:
        packageDesign.pricing_psychology ||
        "Design BETTER for best value perception",
      implementation_tips:
        packageDesign.implementation_tips ||
        "Present all three options side-by-side",
      revenue_analysis:
        revenueResponse?.content || "Revenue optimization pending",
      intelligence_summary: {
        services_identified: intelligence?.business?.services?.length || 0,
        differentiators: intelligence?.business?.differentiators || [],
      },
    };

    // Step 8: Create standardized output
    const output = createToolOutput(
      "service_packages",
      `Package design for ${input.business_name}: ${scores.overall >= 70 ? "Strong foundation for tiered offerings" : "Need more service variety and differentiation"}`,
      structuredOutputs,
      {
        scores,
        findings,
        nextSteps,
        agentsUsed: ["strategic-analysis", "revenue-intelligence"],
        ragEnhanced: false,
        intelligenceUsed: !!intelligence,
      }
    );

    console.log("[Service Packages] Package design complete:", {
      overallScore: scores.overall,
      findingsCount: findings.length,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("[Service Packages] Error:", error);
    return NextResponse.json(
      {
        error: "Service package design failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
