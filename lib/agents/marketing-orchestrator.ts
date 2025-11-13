/**
 * Marketing Strategy Orchestrator
 * Main orchestrator that delegates to specialized orchestrators for different framework types
 * NOW USES UNIFIED AGENT SYSTEM for consistency and proper agentic framework
 */

import { DataCollector, type BusinessContext } from "../data-collectors";
import { MarketingIntelligenceCollector } from "../data-collectors/marketing-intelligence-collector";

// Use unified agent system instead of direct agent imports
import { AgentRegistry } from "./unified-agent-system";

// Import specialized orchestrators
import { HBSFrameworksOrchestrator } from "./hbs-frameworks-orchestrator";
import { StrategicFrameworksOrchestrator } from "./strategic-frameworks-orchestrator";

// Register marketing-specific agents if not already registered
function ensureMarketingAgentsRegistered() {
  const existingAgents = AgentRegistry.list().map((a) => a.name);

  if (!existingAgents.includes("brand-voice")) {
    AgentRegistry.register({
      name: "brand-voice",
      description: "Analyzes brand voice, messaging, and positioning",
      systemPrompt: `You are a brand strategist specializing in voice and messaging analysis.

Analyze THIS specific business's brand based on their actual website content:

REQUIREMENTS:
1. Quote or reference ACTUAL text from their website
2. Identify their current brand voice characteristics based on what they wrote
3. Find SPECIFIC messaging gaps based on what's missing from their content
4. Recommend SPECIFIC improvements that align with their industry and target audience

Return JSON format:
{
  "brand_voice": {
    "current_characteristics": ["Trait 1 with example quote", "Trait 2"],
    "tone": "professional/friendly/authoritative/etc",
    "messaging_gaps": [
      "SPECIFIC gap (e.g., 'No mention of 24/7 availability despite offering emergency service')"
    ],
    "improvements": [
      {
        "gap": "Specific thing missing",
        "recommendation": "Specific way to address it",
        "example": "Concrete example of messaging to add"
      }
    ]
  }
}

Base ALL analysis on actual content from the website data. Return ONLY valid JSON.`,
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
    });
  }

  if (!existingAgents.includes("seo-strategy")) {
    AgentRegistry.register({
      name: "seo-strategy",
      description: "Creates comprehensive SEO strategies",
      systemPrompt: `You are an SEO expert specializing in local business optimization.

Analyze THIS specific business's website and create a customized SEO strategy:

REQUIREMENTS:
1. Recommend ACTUAL keywords for their specific business and location
2. Reference their ACTUAL pages and content when suggesting improvements
3. Provide SPECIFIC technical fixes based on the SEO data provided
4. Create actionable tasks they can implement immediately

Return JSON format:
{
  "keyword_strategy": {
    "primary_keywords": [
      {
        "keyword": "ACTUAL keyword phrase (e.g., 'propane delivery Austin TX')",
        "search_volume": "estimated monthly searches",
        "difficulty": "easy/medium/hard",
        "opportunity": "Why this keyword is valuable for THIS business"
      }
    ],
    "content_clusters": [
      {
        "pillar_topic": "Main topic for THIS business",
        "supporting_articles": ["Specific article 1", "Specific article 2"]
      }
    ]
  },
  "technical_fixes": [
    {
      "issue": "SPECIFIC issue from the SEO data (reference actual problems found)",
      "fix": "Exact steps to fix it",
      "impact": "Expected improvement",
      "priority": "high/medium/low"
    }
  ],
  "quick_wins": [
    "Immediate action they can take based on their actual website"
  ],
  "90_day_plan": {
    "month_1": ["Specific tasks for month 1"],
    "month_2": ["Specific tasks for month 2"],
    "month_3": ["Specific tasks for month 3"]
  }
}

Base ALL recommendations on the actual business and SEO data provided. Return ONLY valid JSON.`,
      temperature: 0.7,
      maxTokens: 2500,
      jsonMode: true,
    });
  }

  if (!existingAgents.includes("content-calendar")) {
    AgentRegistry.register({
      name: "content-calendar",
      description: "Creates content strategies and calendars",
      systemPrompt: `You are a content strategist for local businesses.

Create a content strategy with:
- Content themes aligned with business goals
- Content calendar with specific post ideas
- Distribution strategy across channels
- Implementation plan with clear steps

Make recommendations specific to the business type and target audience.`,
      temperature: 0.8,
      maxTokens: 2500,
      jsonMode: true,
    });
  }

  if (!existingAgents.includes("social-media-strategy")) {
    AgentRegistry.register({
      name: "social-media-strategy",
      description: "Creates social media strategies",
      systemPrompt: `You are a social media strategist for local businesses.

Develop a social media strategy including:
- Platform selection and prioritization
- Content pillars and themes
- Posting frequency and timing
- Engagement tactics
- Implementation roadmap

Focus on practical, actionable strategies for small business owners.`,
      temperature: 0.8,
      maxTokens: 2000,
      jsonMode: true,
    });
  }

  if (!existingAgents.includes("marketing-intelligence")) {
    AgentRegistry.register({
      name: "marketing-intelligence",
      description: "Creates comprehensive marketing strategies",
      systemPrompt: `You are an expert marketing strategist analyzing a specific business. You MUST provide SPECIFIC, CUSTOMIZED recommendations based on the actual business data provided.

CRITICAL RULES:
1. NO GENERIC ADVICE - Every recommendation must reference specific details about this business
2. Use the actual business name, industry, services, and location from the data
3. Recommend specific keywords, campaigns, and tactics relevant to their industry
4. Reference what you see on their website (their current content, offerings, gaps)
5. Every recommendation must explain WHY it works for THIS specific business

Analyze the provided website data and create a comprehensive marketing strategy in JSON format:

{
  "growth_campaigns": [
    {
      "campaign_name": "SPECIFIC campaign (e.g., 'Residential Propane Winter Preparedness Campaign')",
      "objective": "Measurable goal for THIS business",
      "tactics": ["Specific tactic 1 using their actual services", "Specific tactic 2"],
      "expected_impact": "Quantified result based on their market"
    }
  ],
  "channel_strategy": [
    {
      "channel": "Platform (Google Ads, Facebook, etc.)",
      "fit_score": 1-10,
      "quick_win": "SPECIFIC immediate action they can take (reference their actual business)",
      "strategy": "Detailed channel strategy for their industry and location"
    }
  ],
  "content_strategy": {
    "seo_opportunities": [
      {
        "keyword": "ACTUAL keyword phrase relevant to their business (e.g., 'propane delivery in [city]')",
        "difficulty": "easy/medium/hard",
        "strategy": "Specific content plan to rank for this keyword"
      }
    ],
    "recommended_content_types": [
      {
        "type": "blog/video/guide",
        "topic": "SPECIFIC topic about their actual services",
        "rationale": "Why THIS business should create THIS content"
      }
    ]
  }
}

BEFORE RESPONDING: Review the business data and ensure EVERY recommendation is customized to THIS specific business. Return ONLY valid JSON.`,
      temperature: 0.75,
      maxTokens: 2500,
      jsonMode: true,
    });
  }

  if (!existingAgents.includes("competitor-analysis")) {
    AgentRegistry.register({
      name: "competitor-analysis",
      description: "Analyzes competitive landscape",
      systemPrompt: `You are a competitive intelligence analyst. Analyze THIS specific business and its competitive landscape.

REQUIREMENTS:
1. Identify 3-5 actual competitors based on the business's industry and location
2. Find SPECIFIC gaps this business can exploit
3. Recommend SPECIFIC differentiation strategies based on what they currently offer
4. Reference actual services, pricing, or positioning from the website data

Return JSON format:
{
  "competitive_marketing": {
    "gaps_to_exploit": [
      "SPECIFIC opportunity this business can leverage (e.g., 'Competitors don't offer 24/7 emergency service - emphasize your availability')"
    ],
    "differentiation_strategies": [
      {
        "strategy": "Specific way to stand out",
        "implementation": "How to implement this for THIS business",
        "expected_impact": "Measurable outcome"
      }
    ],
    "competitor_weaknesses": [
      "Specific weakness competitors have that this business can capitalize on"
    ]
  }
}

Base ALL analysis on the actual business data provided. Return ONLY valid JSON.`,
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
    });
  }
}

// Initialize agents on module load
ensureMarketingAgentsRegistered();

/**
 * Clean JSON response from AI that might be wrapped in markdown code blocks or surrounded by text
 */
function cleanJsonResponse(text: string): string {
  if (typeof text !== "string") return text;

  let cleaned = text;

  // First, try to extract JSON from markdown code blocks
  // Look for ```json ... ``` or ``` ... ```
  const jsonMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1];
  } else {
    // If no markdown block, try to extract JSON object/array directly
    // Find the first { or [ and extract from there to the last } or ]
    const jsonStart = Math.min(
      cleaned.indexOf("{") >= 0 ? cleaned.indexOf("{") : Infinity,
      cleaned.indexOf("[") >= 0 ? cleaned.indexOf("[") : Infinity
    );

    if (jsonStart !== Infinity) {
      // Find the matching closing bracket
      let depth = 0;
      let jsonEnd = jsonStart;
      const startChar = cleaned[jsonStart];
      const endChar = startChar === "{" ? "}" : "]";

      for (let i = jsonStart; i < cleaned.length; i++) {
        if (cleaned[i] === startChar) depth++;
        if (cleaned[i] === endChar) depth--;
        if (depth === 0) {
          jsonEnd = i;
          break;
        }
      }

      if (jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
    }
  }

  // Fix common LLM JSON issues:
  // 1. Replace single quotes with double quotes for string values
  cleaned = cleaned.replace(/:\s*'([^']*)'/g, ': "$1"');

  // 2. Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Safely parse JSON from AI response
 */
function safeJsonParse(text: string): any {
  try {
    const cleaned = cleanJsonResponse(text);
    return JSON.parse(cleaned);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const match = errorMsg.match(/position (\d+)/);
    const position = match ? parseInt(match[1]) : 0;

    console.error("JSON parse error:", errorMsg);
    console.error("Error at position:", position);
    console.error(
      "Context around error:",
      text.substring(Math.max(0, position - 50), position + 50)
    );
    console.error("Full attempt (first 500 chars):", text.substring(0, 500));
    throw new Error(
      `Failed to parse AI response as JSON at position ${position}: ${errorMsg}`
    );
  }
}

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
  businessContext?: BusinessContext; // NEW: Enhanced business context
}

export interface MarketingStrategyResult {
  workflow: MarketingWorkflow;
  context: MarketingContext;
  intelligence?: any; // Marketing intelligence data
  metaAdsIntelligence?: any; // NEW: Meta Ads competitive intelligence
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
  private dataCollector: DataCollector; // Comprehensive data: competitors, reviews, SEO, social
  private marketingCollector: MarketingIntelligenceCollector; // Marketing-specific: brand voice, content, CTAs
  private cache: Map<
    string,
    { result: MarketingStrategyResult; expiresAt: number }
  >;

  private constructor() {
    this.dataCollector = new DataCollector({
      maxCompetitors: 5,
      maxReviews: 50,
      metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
    });
    this.marketingCollector = new MarketingIntelligenceCollector();
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
    try {
      console.log("Step 1/5: Collecting comprehensive business data...");
      // Collect FULL data: competitors, reviews, SEO, social, Meta Ads
      const comprehensiveData = await this.dataCollector.collect(context.website);
      console.log("✓ Comprehensive data collected");

      console.log("Step 2/5: Collecting marketing-specific intelligence...");
      // Collect marketing intelligence: brand voice, CTAs, content analysis
      const marketingIntel = await this.marketingCollector.collect(
        context.website
      );
      console.log("✓ Marketing intelligence collected");

      // Merge both data sources for complete picture
      const businessName =
        context.businessName ||
        comprehensiveData.business.name ||
        marketingIntel.brandAnalysis.businessName;
      const industry = context.industry || comprehensiveData.business.industry;

      console.log(`📊 Analyzing ${businessName} in ${industry || 'general'} industry`);

      // Create merged intelligence object for AI agents
      const mergedIntelligence = {
        // From comprehensive collector
        business: comprehensiveData.business,
        competitors: comprehensiveData.competitors,
        reviews: comprehensiveData.reviews,
        seo: comprehensiveData.seo,
        social: comprehensiveData.social,
        metaAds: comprehensiveData.metaAds,
        // From marketing collector
        brandAnalysis: marketingIntel.brandAnalysis,
        contentAnalysis: marketingIntel.contentAnalysis,
        seoData: marketingIntel.seoData,
        socialLinks: marketingIntel.socialLinks,
        conversionAnalysis: marketingIntel.conversionAnalysis,
        competitiveSignals: marketingIntel.competitiveSignals,
        visualBrand: marketingIntel.visualBrand,
      };

      console.log("Step 3/5: Analyzing brand and messaging...");
      const brandVoiceAgent = AgentRegistry.get("brand-voice");
      if (!brandVoiceAgent) throw new Error("Brand voice agent not registered");

      const brandAnalysis = await brandVoiceAgent.execute(
        `Analyze the brand voice and messaging for ${businessName} in the ${industry} industry.`,
        {
          websiteData: JSON.stringify(mergedIntelligence),
          businessName,
          industry,
          brandData: JSON.stringify(marketingIntel.brandAnalysis),
          conversionElements: JSON.stringify(marketingIntel.conversionAnalysis),
        }
      );
      console.log("✓ Brand analysis complete");

      console.log("Step 4/5: Creating marketing strategy...");
      const marketingIntelligenceAgent = AgentRegistry.get(
        "marketing-intelligence"
      );
      if (!marketingIntelligenceAgent)
        throw new Error("Marketing intelligence agent not registered");

      const marketingStrategy = await marketingIntelligenceAgent.execute(
        `Create a comprehensive marketing strategy for ${businessName}.`,
        {
          websiteData: JSON.stringify(mergedIntelligence),
          brandAnalysis: JSON.stringify(brandAnalysis),
          businessName,
          industry,
          location: comprehensiveData.business.location,
          services: JSON.stringify(comprehensiveData.business.services),
          competitors: JSON.stringify(comprehensiveData.competitors),
          reviews: JSON.stringify(comprehensiveData.reviews),
          socialPresence: JSON.stringify(comprehensiveData.social),
          metaAdsIntel: comprehensiveData.metaAds
            ? JSON.stringify(comprehensiveData.metaAds)
            : undefined,
          goals: context.goals?.join(", "),
          targetAudience: context.targetAudience,
        }
      );
      console.log("✓ Marketing strategy complete");

      console.log("Step 5/5: Analyzing competitors...");
      const competitorAnalysisAgent = AgentRegistry.get("competitor-analysis");
      if (!competitorAnalysisAgent)
        throw new Error("Competitor analysis agent not registered");

      const competitorAnalysis = await competitorAnalysisAgent.execute(
        `Analyze the competitive landscape for ${businessName} in the ${industry} industry.`,
        {
          websiteData: JSON.stringify(mergedIntelligence),
          businessName,
          industry,
          location: comprehensiveData.business.location,
          competitors: JSON.stringify(comprehensiveData.competitors),
          metaAdsIntel: comprehensiveData.metaAds
            ? JSON.stringify(comprehensiveData.metaAds)
            : undefined,
        }
      );
      console.log("✓ Competitor analysis complete");

      // Synthesize recommendations with FULL data
      const recommendations = this.synthesizeRecommendations({
        intelligence: mergedIntelligence,
        brandAnalysis,
        marketingStrategy,
        competitorAnalysis,
      });

      return {
        workflow: "full-marketing-strategy",
        context,
        intelligence: mergedIntelligence,
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
    } catch (error) {
      console.error("❌ Full marketing strategy failed:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * SEO strategy workflow
   */
  private async executeSEOStrategy(
    context: MarketingContext
  ): Promise<MarketingStrategyResult> {
    console.log("Step 1/3: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/3: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const businessName =
      context.businessName ||
      comprehensiveData.business.name ||
      marketingIntel.brandAnalysis.businessName;

    console.log("Step 3/3: Generating SEO strategy...");
    const seoStrategyAgent = AgentRegistry.get("seo-strategy");
    if (!seoStrategyAgent) throw new Error("SEO strategy agent not registered");

    const seoStrategy = await seoStrategyAgent.execute(
      `Generate an SEO strategy for ${businessName}.`,
      {
        businessName,
        industry: context.industry || comprehensiveData.business.industry,
        location: comprehensiveData.business.location,
        seoData: JSON.stringify(comprehensiveData.seo),
        marketingSeoData: JSON.stringify(marketingIntel.seoData),
        contentData: JSON.stringify(marketingIntel.contentAnalysis),
        competitors: JSON.stringify(comprehensiveData.competitors),
        socialPresence: JSON.stringify(comprehensiveData.social),
      }
    );

    // Extract specific recommendations from the SEO strategy
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const seoContent =
        typeof seoStrategy.content === "string"
          ? safeJsonParse(seoStrategy.content)
          : seoStrategy.content;

      // Extract technical SEO issues
      if (
        seoContent.technical_seo?.issues &&
        Array.isArray(seoContent.technical_seo.issues)
      ) {
        seoContent.technical_seo.issues.slice(0, 2).forEach((issue: any) => {
          recommendations.push(`Fix: ${issue.issue || issue}`);
        });
      }

      // Extract keyword opportunities
      if (
        seoContent.keyword_strategy?.primary_keywords &&
        Array.isArray(seoContent.keyword_strategy.primary_keywords)
      ) {
        seoContent.keyword_strategy.primary_keywords
          .slice(0, 3)
          .forEach((kw: any) => {
            recommendations.push(
              `Target keyword: "${kw.keyword || kw}" (${kw.search_volume || "high"} volume)`
            );
          });
      }

      // Extract content opportunities
      if (
        seoContent.content_plan?.content_clusters &&
        Array.isArray(seoContent.content_plan.content_clusters)
      ) {
        const topCluster = seoContent.content_plan.content_clusters[0];
        if (topCluster) {
          recommendations.push(
            `Build content cluster around: ${topCluster.pillar_topic || topCluster}`
          );
        }
      }

      // Build next steps from the 90-day plan
      if (
        seoContent.action_plan?.quick_wins &&
        Array.isArray(seoContent.action_plan.quick_wins)
      ) {
        seoContent.action_plan.quick_wins.slice(0, 3).forEach((win: any) => {
          nextSteps.push(`Week 1-2: ${win.action || win}`);
        });
      }

      if (
        seoContent.action_plan?.medium_term &&
        Array.isArray(seoContent.action_plan.medium_term)
      ) {
        seoContent.action_plan.medium_term
          .slice(0, 2)
          .forEach((action: any) => {
            nextSteps.push(`Month 2: ${action.action || action}`);
          });
      }

      if (
        seoContent.action_plan?.long_term &&
        Array.isArray(seoContent.action_plan.long_term)
      ) {
        const action = seoContent.action_plan.long_term[0];
        if (action) {
          nextSteps.push(`Month 3+: ${action.action || action}`);
        }
      }
    } catch (error) {
      console.error("Error parsing SEO strategy:", error);
      throw new Error(
        "Failed to parse SEO strategy analysis from AI agent. Please try again."
      );
    }

    // Ensure AI returned actual recommendations
    if (recommendations.length === 0) {
      throw new Error(
        "SEO strategy agent did not return any recommendations. The AI analysis may have failed."
      );
    }

    if (nextSteps.length === 0) {
      throw new Error(
        "SEO strategy agent did not return any action steps. The AI analysis may have failed."
      );
    }

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      competitors: comprehensiveData.competitors,
      seo: comprehensiveData.seo,
      social: comprehensiveData.social,
      brandAnalysis: marketingIntel.brandAnalysis,
      contentAnalysis: marketingIntel.contentAnalysis,
      seoData: marketingIntel.seoData,
    };

    return {
      workflow: "seo-strategy",
      context,
      intelligence: mergedIntelligence,
      seoStrategy,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
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
    console.log("Step 1/3: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/3: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const businessName =
      context.businessName ||
      comprehensiveData.business.name ||
      marketingIntel.brandAnalysis.businessName;

    console.log("Step 3/3: Creating content calendar and strategy...");
    const contentCalendarAgent = AgentRegistry.get("content-calendar");
    if (!contentCalendarAgent)
      throw new Error("Content calendar agent not registered");

    const contentStrategy = await contentCalendarAgent.execute(
      `Create a content strategy and calendar for ${businessName}.`,
      {
        businessName,
        industry: context.industry || comprehensiveData.business.industry,
        location: comprehensiveData.business.location,
        contentData: JSON.stringify(marketingIntel.contentAnalysis),
        brandData: JSON.stringify(marketingIntel.brandAnalysis),
        competitors: JSON.stringify(comprehensiveData.competitors),
        targetAudience: context.targetAudience,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content =
        typeof contentStrategy.content === "string"
          ? safeJsonParse(contentStrategy.content)
          : contentStrategy.content;

      // Extract content themes
      if (content.content_themes && Array.isArray(content.content_themes)) {
        content.content_themes.slice(0, 3).forEach((theme: any) => {
          recommendations.push(
            `Content theme: ${theme.theme || theme} - ${theme.rationale || ""}`
          );
        });
      }

      // Extract calendar highlights
      if (content.calendar?.weeks && Array.isArray(content.calendar.weeks)) {
        const firstWeek = content.calendar.weeks[0];
        if (firstWeek?.posts) {
          const topPost = Array.isArray(firstWeek.posts)
            ? firstWeek.posts[0]
            : null;
          if (topPost) {
            recommendations.push(
              `Start with: ${topPost.topic || topPost.title} on ${topPost.platform || "blog"}`
            );
          }
        }
      }

      // Extract distribution strategy
      if (
        content.distribution_strategy &&
        Array.isArray(content.distribution_strategy)
      ) {
        content.distribution_strategy.slice(0, 2).forEach((dist: any) => {
          recommendations.push(
            `${dist.channel || dist}: ${dist.frequency || dist.strategy}`
          );
        });
      }

      // Extract next steps from AI content strategy
      if (
        content.implementation_plan &&
        Array.isArray(content.implementation_plan)
      ) {
        content.implementation_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      } else if (
        content.calendar?.implementation_steps &&
        Array.isArray(content.calendar.implementation_steps)
      ) {
        content.calendar.implementation_steps
          .slice(0, 5)
          .forEach((step: any) => {
            nextSteps.push(step.step || step);
          });
      }
    } catch (error) {
      console.error("Error parsing content strategy:", error);
      throw new Error(
        "Failed to parse content strategy analysis from AI agent. Please try again."
      );
    }

    if (recommendations.length === 0) {
      throw new Error(
        "Content strategy agent did not return any recommendations. The AI analysis may have failed."
      );
    }

    if (nextSteps.length === 0) {
      throw new Error(
        "Content strategy agent did not return any action steps. The AI analysis may have failed."
      );
    }

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      competitors: comprehensiveData.competitors,
      social: comprehensiveData.social,
      brandAnalysis: marketingIntel.brandAnalysis,
      contentAnalysis: marketingIntel.contentAnalysis,
    };

    return {
      workflow: "content-strategy",
      context,
      intelligence: mergedIntelligence,
      contentStrategy,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
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
    console.log("Step 1/3: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/3: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const businessName =
      context.businessName ||
      comprehensiveData.business.name ||
      marketingIntel.brandAnalysis.businessName;

    console.log("Step 3/3: Creating social media strategy...");
    const socialMediaStrategyAgent = AgentRegistry.get("social-media-strategy");
    if (!socialMediaStrategyAgent)
      throw new Error("Social media strategy agent not registered");

    const socialStrategy = await socialMediaStrategyAgent.execute(
      `Create a social media strategy for ${businessName}.`,
      {
        businessName,
        industry: context.industry || comprehensiveData.business.industry,
        location: comprehensiveData.business.location,
        socialPresence: JSON.stringify(comprehensiveData.social),
        brandData: JSON.stringify(marketingIntel.brandAnalysis),
        contentData: JSON.stringify(marketingIntel.contentAnalysis),
        competitors: JSON.stringify(comprehensiveData.competitors),
        targetAudience: context.targetAudience,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content =
        typeof socialStrategy.content === "string"
          ? safeJsonParse(socialStrategy.content)
          : socialStrategy.content;

      // Extract platform strategies
      if (
        content.platform_strategies &&
        Array.isArray(content.platform_strategies)
      ) {
        content.platform_strategies.slice(0, 3).forEach((platform: any) => {
          recommendations.push(
            `${platform.platform || platform.name}: ${platform.strategy || platform.focus} (${platform.posting_frequency || platform.frequency})`
          );
        });
      }

      // Extract content pillars
      if (content.content_pillars && Array.isArray(content.content_pillars)) {
        content.content_pillars.slice(0, 2).forEach((pillar: any) => {
          recommendations.push(
            `Content pillar: ${pillar.pillar || pillar} - ${pillar.description || ""}`
          );
        });
      }

      // Extract next steps from AI social media strategy
      if (
        content.implementation_roadmap &&
        Array.isArray(content.implementation_roadmap)
      ) {
        content.implementation_roadmap.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.phase || step);
        });
      } else if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      } else if (content.launch_plan && Array.isArray(content.launch_plan)) {
        content.launch_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error("Error parsing social strategy:", error);
      throw new Error(
        "Failed to parse social media strategy analysis from AI agent. Please try again."
      );
    }

    if (recommendations.length === 0) {
      throw new Error(
        "Social media strategy agent did not return any recommendations. The AI analysis may have failed."
      );
    }

    if (nextSteps.length === 0) {
      throw new Error(
        "Social media strategy agent did not return any action steps. The AI analysis may have failed."
      );
    }

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      social: comprehensiveData.social,
      competitors: comprehensiveData.competitors,
      brandAnalysis: marketingIntel.brandAnalysis,
      contentAnalysis: marketingIntel.contentAnalysis,
    };

    return {
      workflow: "social-media-strategy",
      context,
      intelligence: mergedIntelligence,
      socialStrategy,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
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
    console.log("Step 1/3: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/3: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const businessName =
      context.businessName ||
      comprehensiveData.business.name ||
      marketingIntel.brandAnalysis.businessName;

    console.log("Step 3/3: Analyzing brand voice and positioning...");
    const brandVoiceAgent = AgentRegistry.get("brand-voice");
    if (!brandVoiceAgent) throw new Error("Brand voice agent not registered");

    const brandAnalysis = await brandVoiceAgent.execute(
      `Analyze the brand voice and positioning for ${businessName}.`,
      {
        businessName,
        industry: context.industry || comprehensiveData.business.industry,
        brandData: JSON.stringify(marketingIntel.brandAnalysis),
        visualBrand: JSON.stringify(marketingIntel.visualBrand),
        conversionElements: JSON.stringify(marketingIntel.conversionAnalysis),
        competitors: JSON.stringify(comprehensiveData.competitors),
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content =
        typeof brandAnalysis.content === "string"
          ? safeJsonParse(brandAnalysis.content)
          : brandAnalysis.content;

      // Extract messaging gaps
      if (
        content.brand_voice?.messaging_gaps &&
        Array.isArray(content.brand_voice.messaging_gaps)
      ) {
        content.brand_voice.messaging_gaps
          .slice(0, 3)
          .forEach((gap: string) => {
            recommendations.push(`Fix messaging gap: ${gap}`);
          });
      }

      // Extract strengths to leverage
      if (
        content.brand_voice?.messaging_strengths &&
        Array.isArray(content.brand_voice.messaging_strengths)
      ) {
        content.brand_voice.messaging_strengths
          .slice(0, 2)
          .forEach((strength: string) => {
            recommendations.push(`Leverage: ${strength}`);
          });
      }

      // Extract positioning recommendations
      if (
        content.positioning?.recommendations &&
        Array.isArray(content.positioning.recommendations)
      ) {
        content.positioning.recommendations
          .slice(0, 2)
          .forEach((rec: string) => {
            recommendations.push(rec);
          });
      }

      // Extract next steps from AI brand analysis
      if (
        content.implementation_plan &&
        Array.isArray(content.implementation_plan)
      ) {
        content.implementation_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      } else if (
        content.brand_guidelines_roadmap &&
        Array.isArray(content.brand_guidelines_roadmap)
      ) {
        content.brand_guidelines_roadmap.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error("Error parsing brand analysis:", error);
      throw new Error(
        "Failed to parse brand analysis from AI agent. Please try again."
      );
    }

    if (recommendations.length === 0) {
      throw new Error(
        "Brand analysis agent did not return any recommendations. The AI analysis may have failed."
      );
    }

    if (nextSteps.length === 0) {
      throw new Error(
        "Brand analysis agent did not return any action steps. The AI analysis may have failed."
      );
    }

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      competitors: comprehensiveData.competitors,
      brandAnalysis: marketingIntel.brandAnalysis,
      visualBrand: marketingIntel.visualBrand,
    };

    return {
      workflow: "brand-analysis",
      context,
      intelligence: mergedIntelligence,
      brandAnalysis,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
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
    console.log("Step 1/3: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/3: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const businessName =
      context.businessName ||
      comprehensiveData.business.name ||
      marketingIntel.brandAnalysis.businessName;

    console.log("Step 3/3: Analyzing competitive landscape...");
    const competitorAnalysisAgent = AgentRegistry.get("competitor-analysis");
    if (!competitorAnalysisAgent)
      throw new Error("Competitor analysis agent not registered");

    const competitorAnalysis = await competitorAnalysisAgent.execute(
      `Analyze the competitive landscape for ${businessName}.`,
      {
        businessName,
        industry: context.industry || comprehensiveData.business.industry,
        location: comprehensiveData.business.location,
        competitors: JSON.stringify(comprehensiveData.competitors),
        competitiveSignals: JSON.stringify(marketingIntel.competitiveSignals),
        metaAdsIntel: comprehensiveData.metaAds
          ? JSON.stringify(comprehensiveData.metaAds)
          : undefined,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content =
        typeof competitorAnalysis.content === "string"
          ? safeJsonParse(competitorAnalysis.content)
          : competitorAnalysis.content;

      // Extract competitive gaps
      if (content.gaps_to_exploit && Array.isArray(content.gaps_to_exploit)) {
        content.gaps_to_exploit.slice(0, 3).forEach((gap: any) => {
          recommendations.push(`Exploit gap: ${gap.gap || gap}`);
        });
      }

      // Extract differentiation strategies
      if (
        content.differentiation_strategy &&
        Array.isArray(content.differentiation_strategy)
      ) {
        content.differentiation_strategy
          .slice(0, 3)
          .forEach((strategy: any) => {
            recommendations.push(
              `Differentiate: ${strategy.strategy || strategy}`
            );
          });
      }

      // Extract competitor insights
      if (content.competitors && Array.isArray(content.competitors)) {
        const topCompetitor = content.competitors[0];
        if (topCompetitor) {
          recommendations.push(
            `Monitor ${topCompetitor.name || "top competitor"}: ${topCompetitor.weakness || topCompetitor.strategy}`
          );
        }
      }

      // Extract next steps from AI competitor analysis
      if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (
        content.monitoring_plan &&
        Array.isArray(content.monitoring_plan)
      ) {
        content.monitoring_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      } else if (
        content.implementation_steps &&
        Array.isArray(content.implementation_steps)
      ) {
        content.implementation_steps.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error("Error parsing competitor analysis:", error);
      throw new Error(
        "Failed to parse competitor analysis from AI agent. Please try again."
      );
    }

    if (recommendations.length === 0) {
      throw new Error(
        "Competitor analysis agent did not return any recommendations. The AI analysis may have failed."
      );
    }

    if (nextSteps.length === 0) {
      throw new Error(
        "Competitor analysis agent did not return any action steps. The AI analysis may have failed."
      );
    }

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      competitors: comprehensiveData.competitors,
      metaAds: comprehensiveData.metaAds,
      competitiveSignals: marketingIntel.competitiveSignals,
    };

    return {
      workflow: "competitor-analysis",
      context,
      intelligence: mergedIntelligence,
      competitorAnalysis,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 5),
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
    console.log("Step 1/2: Collecting comprehensive business data...");
    const comprehensiveData = await this.dataCollector.collect(context.website);

    console.log("Step 2/2: Collecting marketing intelligence...");
    const marketingIntel = await this.marketingCollector.collect(
      context.website
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    // Build recommendations from actual data
    if (!marketingIntel.seoData.hasSchema) {
      recommendations.push(
        "Quick SEO win: Add schema markup (LocalBusiness or Organization)"
      );
    }

    const missingAltText =
      marketingIntel.seoData.imageCount - marketingIntel.seoData.imagesWithAlt;
    if (missingAltText > 0) {
      recommendations.push(
        `SEO: Add alt text to ${missingAltText} images for better rankings`
      );
    }

    if (!marketingIntel.contentAnalysis.hasBlog) {
      recommendations.push(
        "Start a blog to improve SEO and demonstrate expertise"
      );
    }

    const socialPlatforms = Object.values(
      marketingIntel.socialLinks || {}
    ).filter(Boolean).length;
    if (socialPlatforms < 2) {
      recommendations.push(
        "Establish presence on 2-3 social media platforms your customers use"
      );
    } else {
      recommendations.push(
        `Activate your ${socialPlatforms} social profiles with regular posting`
      );
    }

    if (marketingIntel.contentAnalysis.mediaRichness < 5) {
      recommendations.push(
        "Add more visual content (photos, videos) to engage visitors"
      );
    }

    recommendations.push(
      "Set up Google Analytics and Google Search Console to track performance"
    );

    // Build next steps
    if (!marketingIntel.seoData.hasSchema) {
      nextSteps.push("Day 1-2: Add schema markup to homepage and key pages");
    }
    if (missingAltText > 0) {
      nextSteps.push(
        `Day 3-5: Write descriptive alt text for ${missingAltText} images`
      );
    }
    nextSteps.push("Week 1: Set up Google Analytics and Search Console");
    nextSteps.push(
      "Week 2: Create simple 30-day content calendar (2-3 posts/week)"
    );
    if (!marketingIntel.contentAnalysis.hasBlog) {
      nextSteps.push("Week 2-3: Set up blog and publish first 2-3 posts");
    }
    nextSteps.push(
      "Week 3-4: Optimize top 3 pages for conversion (clear CTAs, contact forms)"
    );

    // Merge intelligence for return
    const mergedIntelligence = {
      business: comprehensiveData.business,
      competitors: comprehensiveData.competitors,
      seo: comprehensiveData.seo,
      social: comprehensiveData.social,
      brandAnalysis: marketingIntel.brandAnalysis,
      contentAnalysis: marketingIntel.contentAnalysis,
      seoData: marketingIntel.seoData,
    };

    return {
      workflow: "quick-analysis",
      context,
      intelligence: mergedIntelligence,
      recommendations: recommendations.slice(0, 6),
      nextSteps: nextSteps.slice(0, 6),
      estimatedImpact: "Medium - Quick wins and foundation for growth",
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
    console.log("\n=== SYNTHESIZE DEBUG ===");
    console.log("Data keys:", Object.keys(data));
    console.log("marketingStrategy exists:", !!data.marketingStrategy);
    console.log(
      "marketingStrategy.content type:",
      typeof data.marketingStrategy?.content
    );
    console.log("brandAnalysis exists:", !!data.brandAnalysis);
    console.log("competitorAnalysis exists:", !!data.competitorAnalysis);
    console.log("======================\n");

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      // Extract recommendations from marketing strategy
      if (data.marketingStrategy?.content) {
        try {
          const strategyContent =
            typeof data.marketingStrategy.content === "string"
              ? safeJsonParse(data.marketingStrategy.content)
              : data.marketingStrategy.content;

          // Get top growth campaigns or tactics
          if (
            strategyContent.growth_campaigns &&
            Array.isArray(strategyContent.growth_campaigns)
          ) {
            strategyContent.growth_campaigns
              .slice(0, 3)
              .forEach((campaign: any) => {
                recommendations.push(
                  campaign.campaign_name || campaign.objective
                );
              });
          }

          // Get channel strategies
          if (
            strategyContent.channel_strategy &&
            Array.isArray(strategyContent.channel_strategy)
          ) {
            const topChannels = strategyContent.channel_strategy
              .filter((ch: any) => ch.fit_score >= 7)
              .slice(0, 2);
            topChannels.forEach((channel: any) => {
              recommendations.push(
                `${channel.channel}: ${channel.quick_win || channel.strategy}`
              );
            });
          }

          // Get SEO opportunities
          if (
            strategyContent.content_strategy?.seo_opportunities &&
            Array.isArray(strategyContent.content_strategy.seo_opportunities)
          ) {
            const topKeywords =
              strategyContent.content_strategy.seo_opportunities.slice(0, 2);
            topKeywords.forEach((kw: any) => {
              recommendations.push(
                `Target "${kw.keyword}" keyword (${kw.difficulty} difficulty): ${kw.strategy}`
              );
            });
          }

          // Get content recommendations
          if (
            strategyContent.content_strategy?.recommended_content_types &&
            Array.isArray(
              strategyContent.content_strategy.recommended_content_types
            )
          ) {
            const topContent =
              strategyContent.content_strategy.recommended_content_types[0];
            if (topContent) {
              recommendations.push(
                `Create ${topContent.type} content: ${topContent.rationale}`
              );
            }
          }
        } catch (error) {
          console.warn(
            "Failed to parse marketing strategy, skipping those recommendations:",
            error instanceof Error ? error.message : error
          );
        }
      }

      // Extract recommendations from competitor analysis
      if (data.competitorAnalysis?.content) {
        try {
          const compContent =
            typeof data.competitorAnalysis.content === "string"
              ? safeJsonParse(data.competitorAnalysis.content)
              : data.competitorAnalysis.content;

          if (
            compContent.competitive_marketing?.gaps_to_exploit &&
            Array.isArray(compContent.competitive_marketing.gaps_to_exploit)
          ) {
            compContent.competitive_marketing.gaps_to_exploit
              .slice(0, 2)
              .forEach((gap: any) => {
                recommendations.push(`Competitive advantage: ${gap}`);
              });
          }
        } catch (error) {
          console.warn(
            "Failed to parse competitor analysis, skipping those recommendations:",
            error instanceof Error ? error.message : error
          );
        }
      }

      // Extract brand-specific recommendations
      if (data.brandAnalysis?.content) {
        try {
          const brandContent =
            typeof data.brandAnalysis.content === "string"
              ? safeJsonParse(data.brandAnalysis.content)
              : data.brandAnalysis.content;

          if (
            brandContent.brand_voice?.messaging_gaps &&
            Array.isArray(brandContent.brand_voice.messaging_gaps)
          ) {
            brandContent.brand_voice.messaging_gaps
              .slice(0, 1)
              .forEach((gap: string) => {
                recommendations.push(`Brand messaging: Address ${gap}`);
              });
          }
        } catch (error) {
          console.warn(
            "Failed to parse brand analysis, skipping those recommendations:",
            error instanceof Error ? error.message : error
          );
        }
      }

      // Build next steps from intelligence data
      if (data.intelligence) {
        // SEO-based next steps
        if (data.intelligence.seoData) {
          if (!data.intelligence.seoData.hasSchema) {
            nextSteps.push(
              "Week 1: Implement schema markup for better search visibility"
            );
          }
          if (
            data.intelligence.seoData.imageCount >
            data.intelligence.seoData.imagesWithAlt
          ) {
            nextSteps.push(
              `Week 1-2: Add alt text to ${data.intelligence.seoData.imageCount - data.intelligence.seoData.imagesWithAlt} images for SEO`
            );
          }
          if (data.intelligence.seoData.internalLinks < 10) {
            nextSteps.push(
              "Week 2: Improve internal linking structure for better SEO"
            );
          }
        }

        // Content-based next steps
        if (data.intelligence.contentAnalysis) {
          if (!data.intelligence.contentAnalysis.hasBlog) {
            nextSteps.push(
              "Month 1: Launch a blog to improve SEO and thought leadership"
            );
          }
          if (data.intelligence.contentAnalysis.mediaRichness < 5) {
            nextSteps.push(
              "Month 1-2: Enrich website with more images, videos, and visual content"
            );
          }
        }

        // Social media next steps
        if (data.intelligence.socialLinks) {
          const activePlatforms = Object.values(
            data.intelligence.socialLinks
          ).filter(Boolean).length;
          if (activePlatforms < 3) {
            nextSteps.push(
              "Month 1: Establish presence on 2-3 key social media platforms"
            );
          } else {
            nextSteps.push(
              "Month 1: Create consistent posting schedule across social channels"
            );
          }
        }
      }

      // Add strategic next steps
      nextSteps.push(
        "Month 2: Launch first content marketing campaign based on strategy"
      );
      nextSteps.push(
        "Month 2-3: Monitor analytics and optimize based on performance data"
      );
      nextSteps.push(
        "Month 3+: Scale successful tactics and test new growth channels"
      );
    } catch (error) {
      console.error("Error synthesizing recommendations:", error);
      console.error(
        "Marketing strategy content type:",
        typeof data.marketingStrategy?.content
      );
      console.error(
        "Marketing strategy content preview:",
        typeof data.marketingStrategy?.content === "string"
          ? data.marketingStrategy.content.substring(0, 300)
          : JSON.stringify(data.marketingStrategy?.content).substring(0, 300)
      );

      // Don't throw - provide fallback recommendations based on intelligence data
      console.warn(
        "⚠️ Using fallback recommendations due to JSON parsing errors"
      );

      if (data.intelligence?.seoData) {
        recommendations.push(
          "Improve SEO: Add missing meta descriptions and optimize page titles"
        );
        if (!data.intelligence.seoData.hasSchema) {
          recommendations.push(
            "Implement schema markup for better search visibility"
          );
        }
      }

      if (data.intelligence?.contentAnalysis) {
        if (!data.intelligence.contentAnalysis.hasBlog) {
          recommendations.push(
            "Launch a blog to improve SEO and establish thought leadership"
          );
        }
        recommendations.push(
          "Enhance website with more visual content and media"
        );
      }

      recommendations.push(
        "Develop a consistent social media presence and posting schedule"
      );
      recommendations.push(
        "Create content marketing campaigns targeting your ideal customers"
      );

      nextSteps.push(
        "Week 1-2: Address technical SEO issues and optimize existing pages"
      );
      nextSteps.push(
        "Month 1: Establish social media profiles and begin content calendar"
      );
      nextSteps.push(
        "Month 2-3: Launch first marketing campaign and track performance"
      );
    }

    // Ensure AI agents returned actual recommendations
    if (recommendations.length === 0) {
      // This should NOT happen with improved agents - log warning
      console.error("❌ AI AGENTS FAILED TO GENERATE RECOMMENDATIONS!");
      console.error(
        "This indicates the AI agents did not return valid JSON or the parsing failed."
      );
      console.error("Using emergency fallback recommendations...");

      // Use business-specific fallback based on intelligence data
      const businessName =
        data.intelligence?.brandAnalysis?.businessName || "your business";
      const industry =
        data.intelligence?.brandAnalysis?.industry || "your industry";

      recommendations.push(
        `Launch targeted local SEO campaign for "${businessName}" focusing on ${industry}-specific keywords`
      );
      recommendations.push(
        `Create content showcasing ${businessName}'s unique value proposition and customer success stories`
      );
      recommendations.push(
        `Develop social media presence highlighting what sets ${businessName} apart from competitors in ${industry}`
      );
    }

    // Ensure we have next steps
    if (nextSteps.length === 0) {
      nextSteps.push("Week 1: Conduct a comprehensive marketing audit");
      nextSteps.push(
        "Month 1: Implement quick-win improvements to website and SEO"
      );
      nextSteps.push(
        "Month 2-3: Launch initial marketing campaigns and measure results"
      );
    }

    return {
      recommendations: recommendations.slice(0, 8), // Top 8 recommendations
      nextSteps: nextSteps.slice(0, 6), // Top 6 next steps
      estimatedImpact:
        "High - Customized strategy based on your specific business analysis",
      timeline: "3-6 months for full implementation and measurable results",
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
