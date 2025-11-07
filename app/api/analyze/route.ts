import { generateQuickWins } from "@/lib/agents/quickWinsAgent";
import { analyzeSite } from "@/lib/agents/siteAnalysis";
import type { AnalysisResult, QuickWin } from "@/lib/types";
import { NextResponse } from "next/server";

/**
 * API endpoint for initial business analysis from website
 * Performs site scraping and AI analysis, then returns structured data
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

    // Analyze the website using the existing site analysis agent
    const siteAnalysis = await analyzeSite(website);

    // Generate AI-powered quick wins based on the actual business
    const quickWins = await generateQuickWins({
      businessName: siteAnalysis.businessName,
      subNiche: siteAnalysis.subNiche,
      location: siteAnalysis.location,
      coreServices: siteAnalysis.coreServices,
      targetAudience: siteAnalysis.targetAudience,
      differentiators: siteAnalysis.differentiators,
    });

    // Create analysis result with the REAL AI-generated data
    const result: AnalysisResult = {
      business_id: `biz-${Date.now()}`,
      business_name: siteAnalysis.businessName,
      website: website,
      industry: siteAnalysis.subNiche,
      target_audience: siteAnalysis.targetAudience,
      summary: siteAnalysis.summary,
      top_quick_wins: quickWins,
      // Scores are optional - remove hardcoded values
      visibility_score: undefined,
      reputation_score: undefined,
      growth_potential_score: undefined,
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
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze business. Please try again." },
      { status: 500 }
    );
  }
}
