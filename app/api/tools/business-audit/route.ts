import { AgentRegistry } from "@/lib/agents/unified-agent-system";
import { WebScraperAgent } from "@/lib/agents/WebScraperAgent";
import {
  calculateOverallScore,
  createFinding,
  createToolOutput,
  type BusinessAuditInput,
} from "@/lib/tools/unified-tool-types";
import { NextResponse } from "next/server";

/**
 * Business Audit Tool
 *
 * Multi-agent orchestration for comprehensive business analysis
 * Agents: StrategicAnalysisAgent, CompetitiveIntelligenceAgent, MarketingContentAgent
 */

// Increase timeout for deep scraping and multi-agent analysis
export const maxDuration = 60; // 60 seconds

export async function POST(request: Request) {
  try {
    const input: BusinessAuditInput = await request.json();

    // Validate required fields
    if (!input.website_url) {
      return NextResponse.json(
        { error: "Missing required field: website_url" },
        { status: 400 }
      );
    }

    console.log("[Business Audit] Starting analysis for:", input.website_url);

    const depthLevel = input.depth_level || "quick"; // Default to quick for demo/free users
    const scraperAgent = new WebScraperAgent();

    // Define scraping strategy based on depth level
    let scrapePaths: string[];
    let extractors: any;

    if (depthLevel === "comprehensive") {
      // Full scrape for paid users - comprehensive analysis
      console.log("[Business Audit] Starting COMPREHENSIVE multi-page scrape...");
      scrapePaths = [
        "/", "/about", "/about-us", "/services", "/pricing",
        "/contact", "/locations", "/reviews", "/testimonials", "/why-choose-us",
      ];
      extractors = {
        business: true,
        competitors: true,
        seo: true,
        social: true,
        reviews: true,
        metaAds: true,
      };
    } else if (depthLevel === "standard") {
      // Standard scrape - moderate analysis
      console.log("[Business Audit] Starting STANDARD scrape...");
      scrapePaths = ["/", "/about", "/services", "/contact"];
      extractors = {
        business: true,
        competitors: true,
        seo: true,
      };
    } else {
      // Quick scrape for demo/free users - homepage only
      console.log("[Business Audit] Starting QUICK scrape (demo mode - homepage only)...");
      scrapePaths = ["/"]; // Only homepage for speed
      extractors = {
        business: true,
        seo: true,
      };
    }

    const intelligence = await scraperAgent.scrapeAndAnalyze({
      url: input.website_url,
      paths: scrapePaths,
      extractors,
    });

    console.log(
      "[Business Audit] Deep scrape complete. Intelligence gathered:",
      {
        name: intelligence.business?.name,
        type: intelligence.business?.type,
        services: intelligence.business?.services?.length,
        competitors: intelligence.competitors?.length || 0,
        reviews: intelligence.reviews?.totalReviews || 0,
        seoKeywords: intelligence.seo?.keywords?.length || 0,
        socialPlatforms: intelligence.social?.platforms?.length || 0,
      }
    );

    // Step 2: Strategic Analysis
    const strategicAgent = AgentRegistry.get("strategic-analysis");
    if (!strategicAgent) {
      throw new Error("Strategic analysis agent not found");
    }

    const strategicPrompt = `Analyze this business using Porter's Five Forces and strategic positioning frameworks:

Business: ${intelligence.business?.name || "Unknown"}
Type: ${intelligence.business?.type || "Unknown"}
Services: ${intelligence.business?.services?.join(", ") || "Unknown"}
Differentiators: ${intelligence.business?.differentiators?.join(", ") || "None identified"}
Location: ${intelligence.business?.location || "Unknown"}

Provide:
1. Competitive position assessment (score 0-100)
2. Strategic strengths (3-5 points)
3. Strategic weaknesses (3-5 points)
4. Strategic opportunities (3-5 points)
5. Immediate strategic priorities (3 actions)`;

    const strategicResponse = await strategicAgent.execute(strategicPrompt, {
      businessName: intelligence.business?.name,
      businessType: intelligence.business?.type,
      intelligence: JSON.stringify(intelligence),
    });

    // Step 3: Competitive Intelligence
    const competitiveAgent = AgentRegistry.get("competitive-intelligence");
    const competitiveResponse = competitiveAgent
      ? await competitiveAgent.execute(
          `Analyze competitive landscape for ${intelligence.business?.name}. 
          Industry: ${intelligence.business?.type}
          Location: ${intelligence.business?.location}
          
          Provide:
          1. Likely top 3 competitors
          2. Market positioning assessment
          3. Competitive advantages
          4. Competitive gaps to exploit
          5. Differentiation recommendations`,
          { intelligence: JSON.stringify(intelligence) }
        )
      : null;

    // Step 4: Marketing Content Analysis
    const marketingAgent = AgentRegistry.get("marketing-content");
    const marketingResponse = marketingAgent
      ? await marketingAgent.execute(
          `Analyze marketing effectiveness for ${intelligence.business?.name}.
          
          Current State:
          - Website Content Quality: Assess readability, clarity, persuasiveness
          - Brand Voice: ${intelligence.brandAnalysis?.voice || "Not identified"}
          - SEO Keywords: ${intelligence.seo?.keywords?.join(", ") || "None found"}
          - Messaging: ${intelligence.brandAnalysis?.messaging?.join(", ") || "Not analyzed"}
          
          Provide:
          1. Content quality score (0-100)
          2. Brand voice assessment
          3. Messaging effectiveness
          4. Content gaps
          5. Quick content wins`,
          { intelligence: JSON.stringify(intelligence) }
        )
      : null;

    // Step 5: Calculate scores
    const scoresData = {
      seo: intelligence.seo?.keywords?.length
        ? Math.min((intelligence.seo.keywords.length / 10) * 100, 100)
        : 30,
      content: intelligence.brandAnalysis?.voice ? 70 : 50,
      reputation: intelligence.reviews?.averageRating
        ? (intelligence.reviews.averageRating / 5) * 100
        : 50,
    };

    const scores = {
      ...scoresData,
      overall: calculateOverallScore(scoresData),
    };

    // Step 6: Build findings
    const findings = [];

    // SEO Finding
    if (scores.seo < 60) {
      findings.push(
        createFinding(
          "SEO Optimization Needed",
          `Only ${intelligence.seo?.keywords?.length || 0} keywords identified. Strong SEO requires 10+ targeted keywords.`,
          "high",
          [
            "Conduct keyword research for your industry",
            "Optimize meta descriptions and title tags",
            "Create SEO-focused blog content",
            "Build local SEO citations",
          ],
          { category: "seo", impact: "high" }
        )
      );
    }

    // Brand Voice Finding
    if (!intelligence.brandAnalysis?.voice) {
      findings.push(
        createFinding(
          "Brand Voice Not Defined",
          "No clear brand voice identified in website content. Consistent voice builds trust and recognition.",
          "medium",
          [
            "Define your brand personality (professional, friendly, authoritative, etc.)",
            "Create a brand voice guide",
            "Update website copy to match chosen voice",
            "Train team on brand communication",
          ],
          { category: "branding", impact: "medium" }
        )
      );
    }

    // Differentiation Finding
    if (
      !intelligence.business?.differentiators ||
      intelligence.business.differentiators.length < 2
    ) {
      findings.push(
        createFinding(
          "Weak Differentiation",
          "Unable to identify clear differentiators. Businesses need 2-3 unique selling points to stand out.",
          "critical",
          [
            "Identify what makes you different from competitors",
            "Highlight certifications, awards, or specializations",
            "Emphasize unique processes or methods",
            "Feature customer success stories",
          ],
          { category: "positioning", impact: "high" }
        )
      );
    }

    // Reviews Finding
    if (!intelligence.reviews || intelligence.reviews.totalReviews < 10) {
      findings.push(
        createFinding(
          "Insufficient Social Proof",
          `Only ${intelligence.reviews?.totalReviews || 0} reviews found. Businesses with 50+ reviews see 4x higher conversion.`,
          "high",
          [
            "Implement systematic review request process",
            "Follow up with satisfied customers",
            "Add review prompts to receipts/invoices",
            "Feature testimonials prominently on website",
          ],
          { category: "reputation", impact: "high" }
        )
      );
    }

    // Step 7: Generate next steps
    const nextSteps = [
      "Review strategic priorities and select top 2 to focus on",
      "Implement quick SEO wins (meta tags, keywords)",
      "Define and document brand voice guidelines",
      "Create review generation campaign",
      "Schedule monthly competitive analysis review",
    ];

    // Step 8: Build structured outputs
    const structuredOutputs = {
      business_profile: {
        name: intelligence.business?.name,
        type: intelligence.business?.type,
        location: intelligence.business?.location,
        services: intelligence.business?.services,
        differentiators: intelligence.business?.differentiators,
      },
      strategic_analysis: strategicResponse?.content || "Analysis pending",
      competitive_analysis: competitiveResponse?.content || "Analysis pending",
      marketing_analysis: marketingResponse?.content || "Analysis pending",
      intelligence_data: intelligence,
      depth_level: input.depth_level || "standard",
    };

    // Step 9: Create standardized output
    const output = createToolOutput(
      "business_audit",
      `Comprehensive analysis of ${intelligence.business?.name || "business"} reveals ${findings.length} key opportunities for improvement`,
      structuredOutputs,
      {
        scores,
        findings,
        nextSteps,
        agentsUsed: [
          "WebScraperAgent",
          "strategic-analysis",
          "competitive-intelligence",
          "marketing-content",
        ],
        ragEnhanced: false, // Could add RAG enhancement
        intelligenceUsed: true,
      }
    );

    console.log("[Business Audit] Analysis complete:", {
      overallScore: scores.overall,
      findingsCount: findings.length,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("[Business Audit] Error:", error);
    return NextResponse.json(
      {
        error: "Business audit failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
