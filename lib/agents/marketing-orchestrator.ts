/**
 * Marketing Strategy Orchestrator
 * Main orchestrator that delegates to specialized orchestrators for different framework types
 */

import { MarketingIntelligenceCollector } from "../data-collectors/marketing-intelligence-collector";

// Import agent instances directly (for marketing workflows only)
import {
  brandVoiceAgent,
  competitorAnalysisAgent,
  contentCalendarAgent,
  marketingIntelligenceAgent,
  seoStrategyAgent,
  socialMediaStrategyAgent,
} from "./marketing-agents";

// Import specialized orchestrators
import { HBSFrameworksOrchestrator } from "./hbs-frameworks-orchestrator";
import { StrategicFrameworksOrchestrator } from "./strategic-frameworks-orchestrator";

export type MarketingWorkflow =
  | "full-marketing-strategy"
  | "seo-strategy"
  | "content-strategy"
  | "social-media-strategy"
  | "brand-analysis"
  | "competitor-analysis"
  | "quick-analysis"
  // HBS Framework Workflows
  | "jobs-to-be-done-analysis"
  | "customer-journey-mapping"
  | "positioning-strategy"
  | "innovation-strategy"
  | "comprehensive-hbs-analysis"
  | "ml-optimization-strategy"
  // Strategic Framework Workflows
  | "blue-ocean-strategy"
  | "ansoff-matrix"
  | "bcg-matrix"
  | "positioning-map"
  | "customer-journey-map"
  | "okr-framework"
  | "comprehensive-strategic-analysis";

export interface MarketingContext {
  website: string;
  businessName?: string;
  industry?: string;
  goals?: string[];
  targetAudience?: string;
  currentChallenges?: string[];
}

export interface MarketingStrategyResult {
  workflow: MarketingWorkflow;
  context: MarketingContext;
  intelligence?: any; // Marketing intelligence data
  brandAnalysis?: any;
  marketingStrategy?: any;
  seoStrategy?: any;
  contentStrategy?: any;
  socialStrategy?: any;
  competitorAnalysis?: any;
  // HBS Framework Results
  jobsAnalysis?: any;
  customerJourney?: any;
  positioningStrategy?: any;
  innovationStrategy?: any;
  mlOptimization?: any;
  hbsFrameworks?: any;
  recommendations: string[];
  nextSteps: string[];
  estimatedImpact: string;
  timeline: string;
  executedAt: string;
  executionTime: number;
}

export class MarketingOrchestrator {
  private static instance: MarketingOrchestrator;
  private dataCollector: MarketingIntelligenceCollector;
  private cache: Map<
    string,
    { result: MarketingStrategyResult; expiresAt: number }
  >;

  private constructor() {
    this.dataCollector = new MarketingIntelligenceCollector();
    this.cache = new Map();
  }

  static getInstance(): MarketingOrchestrator {
    if (!MarketingOrchestrator.instance) {
      MarketingOrchestrator.instance = new MarketingOrchestrator();
    }
    return MarketingOrchestrator.instance;
  }

  /**
   * Execute a marketing workflow
   */
  async execute(
    workflow: MarketingWorkflow,
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    const startTime = Date.now();

    console.log(`\n🎯 Executing ${workflow} for ${context.website}`);

    // Check cache
    const cacheKey = `${workflow}:${context.website}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log("✓ Returning cached result");
      return cached.result;
    }

    let result: MarketingStrategyResult;

    switch (workflow) {
      case "full-marketing-strategy":
        result = await this.executeFullMarketingStrategy(context);
        break;

      case "seo-strategy":
        result = await this.executeSEOStrategy(context);
        break;

      case "content-strategy":
        result = await this.executeContentStrategy(context);
        break;

      case "social-media-strategy":
        result = await this.executeSocialMediaStrategy(context);
        break;

      case "brand-analysis":
        result = await this.executeBrandAnalysis(context);
        break;

      case "competitor-analysis":
        result = await this.executeCompetitorAnalysis(context);
        break;

      case "quick-analysis":
        result = await this.executeQuickAnalysis(context);
        break;

      // HBS Framework Workflows - Delegate to HBS Orchestrator
      case "jobs-to-be-done-analysis":
      case "customer-journey-mapping":
      case "positioning-strategy":
      case "innovation-strategy":
      case "comprehensive-hbs-analysis":
      case "ml-optimization-strategy": {
        const hbsOrchestrator = HBSFrameworksOrchestrator.getInstance();
        const hbsResult = await hbsOrchestrator.execute(
          workflow as any,
          context
        );
        // Convert HBS result to Marketing result format
        result = {
          workflow,
          context,
          intelligence: hbsResult.intelligence,
          jobsAnalysis: hbsResult.jobsAnalysis,
          customerJourney: hbsResult.customerJourney,
          positioningStrategy: hbsResult.positioningStrategy,
          innovationStrategy: hbsResult.innovationStrategy,
          mlOptimization: hbsResult.mlOptimization,
          hbsFrameworks: hbsResult.synthesis,
          recommendations: hbsResult.recommendations,
          nextSteps: hbsResult.nextSteps,
          estimatedImpact: hbsResult.estimatedImpact,
          timeline: hbsResult.timeline,
          executedAt: hbsResult.executedAt,
          executionTime: hbsResult.executionTime,
        };
        break;
      }

      // Strategic Framework Workflows - Delegate to Strategic Orchestrator
      case "blue-ocean-strategy":
      case "ansoff-matrix":
      case "bcg-matrix":
      case "positioning-map":
      case "customer-journey-map":
      case "okr-framework":
      case "comprehensive-strategic-analysis": {
        const strategicOrchestrator =
          StrategicFrameworksOrchestrator.getInstance();
        const strategicResult = await strategicOrchestrator.execute(
          workflow as any,
          context
        );
        // Convert Strategic result to Marketing result format
        result = {
          workflow,
          context,
          intelligence: strategicResult.intelligence,
          brandAnalysis: strategicResult.blueOceanStrategy,
          marketingStrategy:
            strategicResult.ansoffMatrix || strategicResult.bcgMatrix,
          seoStrategy: strategicResult.positioningMap,
          contentStrategy: strategicResult.customerJourneyMap,
          socialStrategy: strategicResult.okrFramework,
          recommendations: strategicResult.recommendations,
          nextSteps: strategicResult.nextSteps,
          estimatedImpact: strategicResult.estimatedImpact,
          timeline: strategicResult.timeline,
          executedAt: strategicResult.executedAt,
          executionTime: strategicResult.executionTime,
        };
        break;
      }

      default:
        throw new Error(`Unknown workflow: ${workflow}`);
    }

    result.executionTime = Date.now() - startTime;
    console.log(`✓ Completed in ${result.executionTime}ms`);

    // Cache for 5 minutes
    this.cache.set(cacheKey, {
      result,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return result;
  }

  /**
   * Full marketing strategy - comprehensive analysis and recommendations
   */
  private async executeFullMarketingStrategy(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/4: Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/4: Analyzing brand and messaging...");
    const brandAnalysis = await brandVoiceAgent.execute(
      `Analyze the brand voice and messaging for ${context.businessName || intelligence.brandAnalysis.businessName} in the ${context.industry || "general"} industry.`,
      {
        websiteData: JSON.stringify(intelligence),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
      }
    );

    console.log("Step 3/4: Creating marketing strategy...");
    const marketingStrategy = await marketingIntelligenceAgent.execute(
      `Create a comprehensive marketing strategy for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        brandAnalysis: JSON.stringify(brandAnalysis),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
        goals: context.goals?.join(", "),
        targetAudience: context.targetAudience,
      }
    );

    console.log("Step 4/4: Analyzing competitors...");
    const competitorAnalysis = await competitorAnalysisAgent.execute(
      `Analyze the competitive landscape for ${context.businessName || intelligence.brandAnalysis.businessName} in the ${context.industry || "general"} industry.`,
      {
        websiteData: JSON.stringify(intelligence),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
      }
    );

    // Synthesize recommendations
    const recommendations = this.synthesizeRecommendations({
      intelligence,
      brandAnalysis,
      marketingStrategy,
      competitorAnalysis,
    });

    return {
      workflow: "full-marketing-strategy",
      context,
      intelligence,
      brandAnalysis,
      marketingStrategy,
      competitorAnalysis,
      recommendations: recommendations.recommendations,
      nextSteps: recommendations.nextSteps,
      estimatedImpact: recommendations.estimatedImpact,
      timeline: recommendations.timeline,
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * SEO strategy workflow
   */
  private async executeSEOStrategy(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/2: Collecting website SEO data...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Generating SEO strategy...");
    const seoStrategy = await seoStrategyAgent.execute(
      `Generate an SEO strategy for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        seoData: JSON.stringify(intelligence.seoData),
        contentData: JSON.stringify(intelligence.contentAnalysis),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
      }
    );

    return {
      workflow: "seo-strategy",
      context,
      intelligence,
      seoStrategy,
      recommendations: [
        "Implement technical SEO fixes identified",
        "Create content targeting recommended keywords",
        "Build backlinks from suggested sources",
        "Optimize existing pages per recommendations",
      ],
      nextSteps: [
        "Fix critical technical SEO issues (Week 1)",
        "Optimize top 5 pages (Week 2-3)",
        "Create new SEO content (Week 4+)",
        "Build local citations and backlinks (ongoing)",
      ],
      estimatedImpact: "High - Improved search rankings and organic traffic",
      timeline: "3-6 months for significant results",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Content strategy workflow
   */
  private async executeContentStrategy(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/2: Collecting website content data...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Creating content calendar and strategy...");
    const contentStrategy = await contentCalendarAgent.execute(
      `Create a content strategy and calendar for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        contentData: JSON.stringify(intelligence.contentAnalysis),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
        targetAudience: context.targetAudience,
      }
    );

    return {
      workflow: "content-strategy",
      context,
      intelligence,
      contentStrategy,
      recommendations: [
        "Follow the content calendar for consistent publishing",
        "Create content for each buyer journey stage",
        "Repurpose top-performing content across channels",
        "Track engagement metrics and adjust strategy",
      ],
      nextSteps: [
        "Set up content creation workflow and tools",
        "Create content briefs for first month",
        "Produce and schedule initial content batch",
        "Monitor performance and iterate",
      ],
      estimatedImpact: "Medium-High - Improved engagement and lead generation",
      timeline: "2-4 months for content library buildup",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Social media strategy workflow
   */
  private async executeSocialMediaStrategy(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/2: Analyzing social media presence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Creating social media strategy...");
    const socialStrategy = await socialMediaStrategyAgent.execute(
      `Create a social media strategy for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
        targetAudience: context.targetAudience,
      }
    );

    return {
      workflow: "social-media-strategy",
      context,
      intelligence,
      socialStrategy,
      recommendations: [
        "Focus on platforms where your audience is most active",
        "Create platform-specific content strategies",
        "Establish consistent posting schedule",
        "Engage with followers and build community",
      ],
      nextSteps: [
        "Set up and optimize key social profiles",
        "Create content calendar for each platform",
        "Launch initial content campaigns",
        "Monitor engagement and adjust tactics",
      ],
      estimatedImpact: "Medium - Increased brand awareness and engagement",
      timeline: "1-3 months to establish presence",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Brand analysis workflow
   */
  private async executeBrandAnalysis(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/2: Collecting brand data...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Analyzing brand voice and positioning...");
    const brandAnalysis = await brandVoiceAgent.execute(
      `Analyze the brand voice and positioning for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
      }
    );

    return {
      workflow: "brand-analysis",
      context,
      intelligence,
      brandAnalysis,
      recommendations: [
        "Strengthen brand voice consistency across all channels",
        "Develop clear brand positioning statements",
        "Create brand guidelines for team members",
        "Audit all customer touchpoints for brand alignment",
      ],
      nextSteps: [
        "Document brand voice and tone guidelines",
        "Create brand assets (logos, colors, fonts)",
        "Train team on brand standards",
        "Update all marketing materials for consistency",
      ],
      estimatedImpact: "High - Stronger brand recognition and trust",
      timeline: "1-2 months for initial brand alignment",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Competitor analysis workflow
   */
  private async executeCompetitorAnalysis(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/2: Collecting competitive intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Analyzing competitive landscape...");
    const competitorAnalysis = await competitorAnalysisAgent.execute(
      `Analyze the competitive landscape for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
        industry: context.industry,
        competitors: intelligence.competitiveSignals,
      }
    );

    return {
      workflow: "competitor-analysis",
      context,
      intelligence,
      competitorAnalysis,
      recommendations: [
        "Differentiate on identified competitor weaknesses",
        "Monitor competitor campaigns and messaging",
        "Leverage gaps in competitor content strategies",
        "Position against key competitors in messaging",
      ],
      nextSteps: [
        "Set up competitor monitoring tools",
        "Create competitive differentiation messaging",
        "Identify content gaps to exploit",
        "Track competitor moves monthly",
      ],
      estimatedImpact: "Medium-High - Better competitive positioning",
      timeline: "Ongoing competitive intelligence",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Quick analysis workflow - lightweight overview
   */
  private async executeQuickAnalysis(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Performing quick marketing analysis...");
    const intelligence = await this.dataCollector.collect(context.website);

    return {
      workflow: "quick-analysis",
      context,
      intelligence,
      recommendations: [
        "Focus on high-impact, low-effort marketing wins",
        "Improve website SEO basics (title tags, meta descriptions)",
        "Create consistent content publishing schedule",
        "Engage on social media where audience is active",
      ],
      nextSteps: [
        "Fix critical SEO issues identified",
        "Set up basic analytics tracking",
        "Create 30-day content calendar",
        "Optimize top 3 pages for conversion",
      ],
      estimatedImpact: "Medium - Quick wins and foundation",
      timeline: "1-2 weeks for initial improvements",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Synthesize recommendations from multiple analyses
   */
  private synthesizeRecommendations(data: {
    intelligence: any;
    brandAnalysis: any;
    marketingStrategy: any;
    competitorAnalysis: any;
  }): {
    recommendations: string[];
    nextSteps: string[];
    estimatedImpact: string;
    timeline: string;
  } {
    return {
      recommendations: [
        "Develop a clear brand voice and messaging framework",
        "Implement SEO improvements for organic growth",
        "Create content strategy aligned with buyer journey",
        "Establish social media presence on key platforms",
        "Monitor and learn from competitor strategies",
        "Set up analytics to track key performance metrics",
      ],
      nextSteps: [
        "Week 1-2: Fix critical SEO issues and set up analytics",
        "Week 3-4: Develop brand guidelines and messaging",
        "Month 2: Launch content strategy and social media",
        "Month 3+: Optimize based on data and scale efforts",
      ],
      estimatedImpact:
        "High - Comprehensive marketing foundation for sustained growth",
      timeline: "3-6 months for full implementation and initial results",
    };
  }

  /**
   * Clear cache for a specific website or all
   */
  clearCache(website?: string) {
    if (website) {
      const keys = Array.from(this.cache.keys()).filter((key) =>
        key.includes(website)
      );
      keys.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}
