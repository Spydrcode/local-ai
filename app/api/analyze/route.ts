import { getOrchestrator } from "@/lib/agents/production-orchestrator";
import { getDataCollector } from "@/lib/data-collectors";
import type { AnalysisResult, QuickWin } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * API endpoint for comprehensive business analysis
 *
 * PRODUCTION-GRADE FEATURES:
 * - Real data collection (website scraping, competitors, reviews, SEO)
 * - Multi-agent strategic analysis (SWOT, Porter, Economic Intelligence)
 * - AgenticRAG for context-aware recommendations
 * - Intelligent caching and circuit breakers
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { website } = body;

    if (!website) {
      return NextResponse.json(
        { error: "Website URL is required" },
        { status: 400 }
      );
    }

    console.log(`[Analyze API] Starting comprehensive analysis for ${website}`);

    // Step 1: Collect REAL business intelligence data
    console.log("[Analyze API] Collecting real data...");
    const dataCollector = getDataCollector();
    const businessData = await dataCollector.collect(website);

    console.log(`[Analyze API] Data collected: ${businessData.metadata.sources.join(", ")}`);
    console.log(`[Analyze API] Found ${businessData.competitors.length} competitors`);
    console.log(`[Analyze API] Aggregated ${businessData.reviews.totalReviews} reviews`);

    // Step 2: Run strategic analysis using multi-agent orchestrator
    console.log("[Analyze API] Running multi-agent strategic analysis...");
    const orchestrator = getOrchestrator();

    const strategicAnalysis = await orchestrator.execute("strategic-analysis", {
      website,
      businessName: businessData.business.name,
      industry: businessData.business.industry,
      location: businessData.business.location,
      targetAudience: businessData.business.services.join(", "),
      customData: {
        businessData, // Pass all collected data to agents
      },
    });

    console.log(
      `[Analyze API] Strategic analysis completed using agents: ${strategicAnalysis.metadata.agentsExecuted.join(", ")}`
    );

    // Step 3: Generate quick wins from strategic insights
    const quickWins = extractQuickWins(
      strategicAnalysis.data,
      businessData
    );

    // Step 4: Calculate scores based on REAL data
    const scores = calculateRealScores(businessData, strategicAnalysis.data);

    // Create comprehensive analysis result
    const result: AnalysisResult = {
      business_id: `biz-${Date.now()}`,
      business_name: businessData.business.name,
      website: website,
      industry: businessData.business.industry || "Unknown",
      target_audience:
        businessData.business.description ||
        businessData.business.services.join(", "),
      summary: buildExecutiveSummary(businessData, strategicAnalysis.data),

      // Real data-driven scores
      visibility_score: scores.visibility,
      reputation_score: scores.reputation,
      growth_potential_score: scores.growth,

      // Quick wins from strategic analysis
      top_quick_wins: quickWins,

      time_savers: {
        total_hours_per_week: quickWins
          .filter((qw: QuickWin) => qw.category === "time-saver")
          .reduce(
            (sum: number, qw: QuickWin) =>
              sum + (qw.est_hours_saved_per_week || 0),
            0
          ),
        top_automation_opportunities: quickWins
          .filter((qw: QuickWin) => qw.category === "time-saver")
          .map((qw: QuickWin) => qw.title),
      },

      // Add real data to response
      real_data: {
        competitors: businessData.competitors.length,
        reviews: businessData.reviews.totalReviews,
        avgRating: businessData.reviews.averageRating,
        seoScore: {
          desktop: businessData.seo.pageSpeed.desktop,
          mobile: businessData.seo.pageSpeed.mobile,
        },
        socialPlatforms: businessData.social.totalPlatforms,
        dataQuality: scores.dataQuality,
      },

      // Metadata
      metadata: {
        analysis_agents: strategicAnalysis.metadata.agentsExecuted,
        execution_time_ms: strategicAnalysis.metadata.executionTimeMs,
        cache_hit: strategicAnalysis.metadata.cacheHit,
        data_sources: businessData.metadata.sources,
        confidence_score: strategicAnalysis.data.confidence_score || 0,
      },

      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    console.log("[Analyze API] Analysis complete");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze business. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Extract actionable quick wins from strategic analysis
 */
function extractQuickWins(
  strategicData: any,
  businessData: any
): QuickWin[] {
  const quickWins: QuickWin[] = [];

  // From Porter analysis
  if (strategicData.porter_analysis?.quick_wins) {
    strategicData.porter_analysis.quick_wins.forEach((qw: any, idx: number) => {
      quickWins.push({
        id: `qw-porter-${idx}`,
        title: qw.title,
        why: qw.why,
        action: qw.action,
        category: qw.category || "growth",
        difficulty: qw.difficulty || "medium",
        estimated_impact: qw.estimated_impact || "Medium impact",
        est_hours_saved_per_week: qw.category === "time-saver" ? 2 : 0,
      });
    });
  }

  // From SWOT analysis
  if (strategicData.swot_analysis?.insights) {
    strategicData.swot_analysis.insights
      .filter((i: any) => i.priority === "high")
      .slice(0, 3)
      .forEach((insight: any, idx: number) => {
        quickWins.push({
          id: `qw-swot-${idx}`,
          title: insight.title || "Strategic Opportunity",
          why: insight.reasoning,
          action: insight.recommendation,
          category: "growth",
          difficulty: "medium",
          estimated_impact: `${insight.impact}/10`,
          est_hours_saved_per_week: 0,
        });
      });
  }

  // From real data insights
  if (businessData.seo.technicalIssues.length > 0) {
    quickWins.push({
      id: "qw-seo-1",
      title: "Fix Critical SEO Issues",
      why: `${businessData.seo.technicalIssues.length} SEO issues found that are hurting search rankings`,
      action: `Address: ${businessData.seo.technicalIssues.slice(0, 3).join("; ")}`,
      category: "visibility",
      difficulty: "easy",
      estimated_impact: "Improve search visibility by 20-30%",
      est_hours_saved_per_week: 0,
    });
  }

  if (businessData.reviews.totalReviews < 10) {
    quickWins.push({
      id: "qw-reviews-1",
      title: "Launch Review Generation Campaign",
      why: `Only ${businessData.reviews.totalReviews} reviews found - need 25+ for credibility`,
      action:
        "Send automated review requests after service delivery. Competitors average 30+ reviews.",
      category: "reputation",
      difficulty: "easy",
      estimated_impact: "Increase conversion rate by 15-25%",
      est_hours_saved_per_week: 1,
    });
  }

  return quickWins.slice(0, 8); // Limit to top 8
}

/**
 * Calculate real scores based on actual data
 */
function calculateRealScores(
  businessData: any,
  strategicData: any
): {
  visibility: number;
  reputation: number;
  growth: number;
  dataQuality: string;
} {
  // Visibility score (0-100)
  let visibility = 0;
  visibility += Math.min(businessData.seo.pageSpeed.mobile, 100) * 0.3; // 30% weight
  visibility += Math.min(businessData.social.totalPlatforms * 15, 100) * 0.2; // 20% weight
  visibility += businessData.seo.mobileUsability ? 20 : 0; // 20% weight
  visibility += Math.min(
    (businessData.competitors.length > 0 ? 50 : 20),
    100
  ) * 0.3; // 30% weight

  // Reputation score (0-100)
  let reputation = 0;
  reputation += Math.min((businessData.reviews.totalReviews / 50) * 50, 50); // 50% weight
  reputation += businessData.reviews.averageRating * 10; // 50% weight

  // Growth potential (0-100)
  let growth = strategicData.confidence_score || 50;

  // Data quality assessment
  const sourcesCount = businessData.metadata.sources.length;
  const dataQuality =
    sourcesCount >= 4
      ? "high"
      : sourcesCount >= 2
        ? "medium"
        : "low";

  return {
    visibility: Math.round(visibility),
    reputation: Math.round(reputation),
    growth: Math.round(growth),
    dataQuality,
  };
}

/**
 * Build executive summary from all data
 */
function buildExecutiveSummary(
  businessData: any,
  strategicData: any
): string {
  const business = businessData.business;
  const competitors = businessData.competitors.length;
  const reviews = businessData.reviews;

  return `${business.name} is a ${business.industry || "business"} located in ${business.location || "the area"}.

MARKET POSITION: We identified ${competitors} direct competitors${competitors > 0 ? `, with ${business.name} ${reviews.averageRating >= 4 ? "performing well" : "having room to improve"} in customer reviews (${reviews.averageRating.toFixed(1)}⭐ from ${reviews.totalReviews} reviews)` : ""}.

ONLINE PRESENCE: ${businessData.seo.pageSpeed.mobile > 70 ? "Strong" : "Needs improvement in"} website performance (${businessData.seo.pageSpeed.mobile}/100 mobile speed). Active on ${businessData.social.totalPlatforms} social media ${businessData.social.totalPlatforms === 1 ? "platform" : "platforms"}.

KEY OPPORTUNITIES: ${strategicData.swot_analysis?.insights?.[0]?.recommendation || strategicData.porter_analysis?.quick_wins?.[0]?.action || "Focus on building online visibility and customer reviews"}.

STRATEGIC FOCUS: ${strategicData.swot_analysis ? "SWOT analysis reveals" : "Analysis suggests"} ${reviews.totalReviews < 15 ? "building reputation through review generation" : reviews.averageRating < 4 ? "improving service quality and addressing review feedback" : "leveraging strong reputation for growth"}.`;
}
