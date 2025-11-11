/**
 * HBS Marketing Frameworks Orchestrator
 * Coordinates Harvard Business School marketing framework agents
 */

import { MarketingIntelligenceCollector } from "../data-collectors/marketing-intelligence-collector";
import { createAICompletion } from "../unified-ai-client";

// Import HBS framework agents
import {
  aiPersonalizationAgent,
  competitivePositioningAgent,
  consumerJourneyAgent,
  disruptiveMarketingAgent,
  jobsToBeDoneAgent,
  marketingMixModelingAgent,
} from "./hbs-marketing-frameworks";

export type HBSWorkflow =
  | "jobs-to-be-done-analysis"
  | "customer-journey-mapping"
  | "positioning-strategy"
  | "innovation-strategy"
  | "ml-optimization-strategy"
  | "comprehensive-hbs-analysis"; // Run all HBS frameworks

export interface HBSContext {
  website: string;
  businessName?: string;
  industry?: string;
  goals?: string[];
  targetAudience?: string;
  currentChallenges?: string[];
}

export interface HBSAnalysisResult {
  workflow: HBSWorkflow;
  context: HBSContext;
  intelligence?: any;

  // Framework-specific results
  jobsAnalysis?: any;
  customerJourney?: any;
  positioningStrategy?: any;
  innovationStrategy?: any;
  mlOptimization?: any;

  // Synthesized insights (for comprehensive analysis)
  synthesis?: {
    executiveSummary: string;
    keyInsights: string[];
    strategicRecommendations: string[];
    implementationRoadmap: string[];
  };

  recommendations: string[];
  nextSteps: string[];
  estimatedImpact: string;
  timeline: string;
  executedAt: string;
  executionTime: number;
}

export class HBSFrameworksOrchestrator {
  private static instance: HBSFrameworksOrchestrator;
  private dataCollector: MarketingIntelligenceCollector;
  private cache: Map<string, { result: HBSAnalysisResult; expiresAt: number }>;

  private constructor() {
    this.dataCollector = new MarketingIntelligenceCollector();
    this.cache = new Map();
  }

  static getInstance(): HBSFrameworksOrchestrator {
    if (!HBSFrameworksOrchestrator.instance) {
      HBSFrameworksOrchestrator.instance = new HBSFrameworksOrchestrator();
    }
    return HBSFrameworksOrchestrator.instance;
  }

  /**
   * Execute an HBS framework workflow
   */
  async execute(
    workflow: HBSWorkflow,
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    const startTime = Date.now();

    console.log(
      `\n🎓 Executing HBS Framework: ${workflow} for ${context.website}`
    );

    // Check cache
    const cacheKey = `${workflow}:${context.website}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log("✓ Returning cached result");
      return cached.result;
    }

    let result: HBSAnalysisResult;

    switch (workflow) {
      case "jobs-to-be-done-analysis":
        result = await this.executeJobsToBeDone(context);
        break;

      case "customer-journey-mapping":
        result = await this.executeCustomerJourneyMapping(context);
        break;

      case "positioning-strategy":
        result = await this.executePositioningStrategy(context);
        break;

      case "innovation-strategy":
        result = await this.executeInnovationStrategy(context);
        break;

      case "ml-optimization-strategy":
        result = await this.executeMLOptimizationStrategy(context);
        break;

      case "comprehensive-hbs-analysis":
        result = await this.executeComprehensiveAnalysis(context);
        break;

      default:
        throw new Error(`Unknown HBS workflow: ${workflow}`);
    }

    result.executionTime = Date.now() - startTime;

    // Cache result for 5 minutes
    this.cache.set(cacheKey, {
      result,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return result;
  }

  /**
   * Jobs-to-be-Done Analysis - Understand customer needs
   */
  private async executeJobsToBeDone(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing jobs-to-be-done...");
    const jobsAnalysis = await jobsToBeDoneAgent.execute(
      `Analyze jobs-to-be-done for customers of ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        targetAudience: context.targetAudience,
      }
    );

    return {
      workflow: "jobs-to-be-done-analysis",
      context,
      intelligence,
      jobsAnalysis,
      recommendations: [
        "Identify the core 'job' customers hire your product/service to do",
        "Map functional, emotional, and social jobs customers need done",
        "Find underserved jobs competitors are missing",
        "Design solutions around jobs, not just product features",
        "Measure success by how well you help customers get jobs done",
      ],
      nextSteps: [
        "Interview customers about their underlying jobs and goals",
        "Map out current solutions customers use (including workarounds)",
        "Identify pain points in how jobs currently get done",
        "Redesign offerings to better complete critical jobs",
        "Test job-focused messaging with target customers",
      ],
      estimatedImpact: "High - Better product-market fit and messaging",
      timeline: "30-60 days for initial insights and messaging",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Customer Journey Mapping (HBS methodology)
   */
  private async executeCustomerJourneyMapping(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Mapping customer journey...");
    const customerJourney = await consumerJourneyAgent.execute(
      `Map customer journey for ${context.businessName || intelligence.brandAnalysis.businessName} using HBS methodology.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        businessName:
          context.businessName || intelligence.brandAnalysis.businessName,
      }
    );

    return {
      workflow: "customer-journey-mapping",
      context,
      intelligence,
      customerJourney,
      recommendations: [
        "Map all touchpoints across awareness, consideration, purchase, and advocacy",
        "Identify friction points in the journey",
        "Create journey-specific content for each stage",
        "Implement cross-channel tracking and attribution",
      ],
      nextSteps: [
        "Document current customer journey with all touchpoints",
        "Survey customers about their journey experience",
        "Create stage-specific content and offers",
        "Set up analytics to track journey progression",
      ],
      estimatedImpact:
        "Journey optimization can reduce customer acquisition cost by 15-30%",
      timeline: "45 days for mapping and implementation",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Competitive Positioning Strategy (HBS approach)
   */
  private async executePositioningStrategy(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Developing positioning strategy...");
    const positioningStrategy = await competitivePositioningAgent.execute(
      `Develop positioning strategy for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        targetAudience: context.targetAudience,
      }
    );

    return {
      workflow: "positioning-strategy",
      context,
      intelligence,
      positioningStrategy,
      recommendations: [
        "Define clear target segment with specific needs",
        "Articulate unique frame of reference (category you compete in)",
        "Identify points of parity (table stakes) vs points of difference (unique value)",
        "Craft positioning statement that guides all marketing",
        "Test positioning with customers and refine based on feedback",
      ],
      nextSteps: [
        "Workshop positioning statement with leadership team",
        "Test positioning concepts with target customers",
        "Align all messaging and creative around positioning",
        "Train sales team on positioning and value prop",
        "Monitor competitor positioning shifts",
      ],
      estimatedImpact:
        "Medium-High - Clearer differentiation and higher conversion",
      timeline: "30-45 days for positioning development",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Innovation Strategy (Disruptive Marketing approach)
   */
  private async executeInnovationStrategy(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing innovation opportunities...");
    const innovationStrategy = await disruptiveMarketingAgent.execute(
      `Identify innovation and disruption opportunities for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        challenges: context.currentChallenges?.join(", "),
      }
    );

    return {
      workflow: "innovation-strategy",
      context,
      intelligence,
      innovationStrategy,
      recommendations: [
        "Look for low-end disruption opportunities (simpler, cheaper solutions)",
        "Explore new market disruption (serve non-consumers)",
        "Identify sustaining innovations for current customers",
        "Test small before betting big on innovation",
        "Build business model around innovation, not just product",
      ],
      nextSteps: [
        "Map jobs-to-be-done that current solutions overshoot",
        "Identify non-consumers who can't access current solutions",
        "Prototype minimum viable disruption",
        "Test with early adopters and iterate",
        "Build separate business unit if disruptive innovation",
      ],
      estimatedImpact:
        "Very High - Can unlock new markets or defend against disruption",
      timeline: "3-6 months for initial innovation experiments",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * ML Optimization Strategy - AI/ML implementation
   */
  private async executeMLOptimizationStrategy(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing AI/ML opportunities...");
    const aiStrategy = await aiPersonalizationAgent.execute(
      `Identify AI/ML personalization opportunities for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        goals: context.goals?.join(", "),
      }
    );

    console.log("Developing marketing mix model...");
    const mixModeling = await marketingMixModelingAgent.execute(
      `Create marketing mix model and budget optimization for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        currentChallenges: context.currentChallenges?.join(", "),
      }
    );

    return {
      workflow: "ml-optimization-strategy",
      context,
      intelligence,
      mlOptimization: {
        aiPersonalization: aiStrategy,
        mixModeling: mixModeling,
      },
      recommendations: [
        "Implement AI-powered customer segmentation and personalization",
        "Build marketing mix model to optimize channel allocation",
        "Use predictive analytics for campaign performance",
        "Automate bidding and budget optimization with ML",
        "Set up real-time personalization engine",
      ],
      nextSteps: [
        "Collect historical marketing data (6-12 months)",
        "Build customer segmentation model",
        "Implement marketing mix model with attribution",
        "Launch personalization engine",
        "Continuously optimize based on ML insights",
      ],
      estimatedImpact:
        "ML optimization can improve marketing efficiency by 30-60% and ROAS by 2-3x",
      timeline: "60 days for setup, ongoing optimization thereafter",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Comprehensive HBS Analysis - Run all HBS frameworks and synthesize
   */
  private async executeComprehensiveAnalysis(
    context: HBSContext
  ): Promise<HBSAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Running all HBS frameworks...");

    // Run all frameworks in parallel
    const [jobs, journey, positioning, innovation, mlOpt] = await Promise.all([
      this.executeJobsToBeDone(context),
      this.executeCustomerJourneyMapping(context),
      this.executePositioningStrategy(context),
      this.executeInnovationStrategy(context),
      this.executeMLOptimizationStrategy(context),
    ]);

    // Synthesize cross-framework insights using AI
    console.log("Synthesizing HBS framework insights...");
    const synthesisPrompt = `You are a Harvard Business School marketing professor synthesizing insights from 5 HBS frameworks.

Business: ${context.businessName || intelligence.brandAnalysis.businessName}
Industry: ${context.industry || "Not specified"}

Framework Results:
1. Jobs-to-be-Done: ${JSON.stringify(jobs.jobsAnalysis)}
2. Customer Journey: ${JSON.stringify(journey.customerJourney)}
3. Positioning Strategy: ${JSON.stringify(positioning.positioningStrategy)}
4. Innovation Strategy: ${JSON.stringify(innovation.innovationStrategy)}
5. ML Optimization: ${JSON.stringify(mlOpt.mlOptimization)}

Provide a synthesis in JSON format:
{
  "executiveSummary": "2-3 paragraph summary of key strategic insights",
  "keyInsights": ["Top 5 insights across all frameworks"],
  "strategicRecommendations": ["Top 5 strategic recommendations"],
  "implementationRoadmap": ["5 phases for implementing these strategies"]
}`;

    const synthesisResponse = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a Harvard Business School marketing professor expert in synthesizing academic frameworks into actionable strategy.",
        },
        {
          role: "user",
          content: synthesisPrompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
    });

    let synthesis;
    try {
      synthesis = JSON.parse(synthesisResponse);
    } catch (e) {
      synthesis = {
        executiveSummary: synthesisResponse,
        keyInsights: [],
        strategicRecommendations: [],
        implementationRoadmap: [],
      };
    }

    return {
      workflow: "comprehensive-hbs-analysis",
      context,
      intelligence,
      jobsAnalysis: jobs.jobsAnalysis,
      customerJourney: journey.customerJourney,
      positioningStrategy: positioning.positioningStrategy,
      innovationStrategy: innovation.innovationStrategy,
      mlOptimization: mlOpt.mlOptimization,
      synthesis,
      recommendations: [
        "Apply HBS frameworks systematically across your marketing",
        "Focus on jobs-to-be-done to drive product-market fit",
        "Optimize customer journey based on data and insights",
        "Use positioning to differentiate in crowded markets",
        "Leverage ML/AI for personalization and optimization",
      ],
      nextSteps: [
        "Present comprehensive HBS analysis to leadership",
        "Prioritize top 3 HBS framework initiatives",
        "Assign cross-functional teams to each initiative",
        "Set up quarterly reviews of HBS framework implementation",
        "Measure impact using framework-specific KPIs",
      ],
      estimatedImpact:
        "Very High - Academic rigor meets practical implementation for sustainable competitive advantage",
      timeline: "3-6 months for comprehensive implementation",
      executedAt: new Date().toISOString(),
      executionTime: 0,
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
