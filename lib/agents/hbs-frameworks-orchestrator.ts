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

    // Extract recommendations from AI agent response
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof jobsAnalysis.content === 'string'
        ? JSON.parse(jobsAnalysis.content)
        : jobsAnalysis.content;

      // Extract functional, emotional, and social jobs
      if (content.functional_jobs && Array.isArray(content.functional_jobs)) {
        content.functional_jobs.slice(0, 2).forEach((job: any) => {
          recommendations.push(`Functional Job: ${job.job || job}`);
        });
      }

      if (content.emotional_jobs && Array.isArray(content.emotional_jobs)) {
        content.emotional_jobs.slice(0, 2).forEach((job: any) => {
          recommendations.push(`Emotional Job: ${job.job || job}`);
        });
      }

      if (content.social_jobs && Array.isArray(content.social_jobs)) {
        content.social_jobs.slice(0, 1).forEach((job: any) => {
          recommendations.push(`Social Job: ${job.job || job}`);
        });
      }

      // Extract underserved jobs as opportunities
      if (content.underserved_jobs && Array.isArray(content.underserved_jobs)) {
        content.underserved_jobs.slice(0, 2).forEach((job: any) => {
          recommendations.push(`Opportunity: ${job.opportunity || job}`);
        });
      }

      // Extract action plan as next steps
      if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (content.implementation_steps && Array.isArray(content.implementation_steps)) {
        content.implementation_steps.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error('Error parsing Jobs-to-be-Done analysis:', error);
      throw new Error('Failed to parse Jobs-to-be-Done analysis from AI agent.');
    }

    if (recommendations.length === 0) {
      throw new Error('Jobs-to-be-Done agent did not return any job recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('Jobs-to-be-Done agent did not return action steps.');
    }

    return {
      workflow: "jobs-to-be-done-analysis",
      context,
      intelligence,
      jobsAnalysis,
      recommendations,
      nextSteps,
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

    // Extract recommendations from AI agent response
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof customerJourney.content === 'string'
        ? JSON.parse(customerJourney.content)
        : customerJourney.content;

      // Extract touchpoints across stages
      const stages = ['awareness', 'consideration', 'purchase', 'retention', 'advocacy'];

      stages.forEach(stage => {
        if (content[stage] && content[stage].touchpoints) {
          const touchpoint = Array.isArray(content[stage].touchpoints)
            ? content[stage].touchpoints[0]
            : content[stage].touchpoints;
          if (touchpoint) {
            recommendations.push(`${stage.charAt(0).toUpperCase() + stage.slice(1)}: ${touchpoint.channel || touchpoint}`);
          }
        }
      });

      // Extract pain points and opportunities
      if (content.pain_points && Array.isArray(content.pain_points)) {
        content.pain_points.slice(0, 2).forEach((pain: any) => {
          recommendations.push(`Address: ${pain.pain || pain.issue || pain}`);
        });
      }

      if (content.opportunities && Array.isArray(content.opportunities)) {
        content.opportunities.slice(0, 2).forEach((opp: any) => {
          recommendations.push(`Opportunity: ${opp.opportunity || opp}`);
        });
      }

      // Extract action plan
      if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (content.implementation_roadmap && Array.isArray(content.implementation_roadmap)) {
        content.implementation_roadmap.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error('Error parsing Customer Journey analysis:', error);
      throw new Error('Failed to parse Customer Journey analysis from AI agent.');
    }

    if (recommendations.length === 0) {
      throw new Error('Customer Journey agent did not return any recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('Customer Journey agent did not return action steps.');
    }

    return {
      workflow: "customer-journey-mapping",
      context,
      intelligence,
      customerJourney,
      recommendations,
      nextSteps,
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

    // Extract recommendations from AI agent response
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof positioningStrategy.content === 'string'
        ? JSON.parse(positioningStrategy.content)
        : positioningStrategy.content;

      // Extract target segment
      if (content.target_segment) {
        const segment = typeof content.target_segment === 'string'
          ? content.target_segment
          : content.target_segment.description || JSON.stringify(content.target_segment);
        recommendations.push(`Target Segment: ${segment}`);
      }

      // Extract frame of reference (category)
      if (content.frame_of_reference || content.category) {
        recommendations.push(`Category: ${content.frame_of_reference || content.category}`);
      }

      // Extract points of difference
      if (content.points_of_difference && Array.isArray(content.points_of_difference)) {
        content.points_of_difference.slice(0, 2).forEach((pod: any) => {
          recommendations.push(`Point of Difference: ${pod.point || pod}`);
        });
      }

      // Extract points of parity
      if (content.points_of_parity && Array.isArray(content.points_of_parity)) {
        const pop = content.points_of_parity[0];
        recommendations.push(`Point of Parity: ${pop.point || pop}`);
      }

      // Extract positioning statement
      if (content.positioning_statement) {
        recommendations.push(`Positioning: ${content.positioning_statement}`);
      }

      // Extract implementation steps
      if (content.implementation_steps && Array.isArray(content.implementation_steps)) {
        content.implementation_steps.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.action || step);
        });
      } else if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error('Error parsing Positioning Strategy:', error);
      throw new Error('Failed to parse Positioning Strategy from AI agent.');
    }

    if (recommendations.length === 0) {
      throw new Error('Positioning Strategy agent did not return any recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('Positioning Strategy agent did not return action steps.');
    }

    return {
      workflow: "positioning-strategy",
      context,
      intelligence,
      positioningStrategy,
      recommendations,
      nextSteps,
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

    // Extract recommendations from AI agent response
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof innovationStrategy.content === 'string'
        ? JSON.parse(innovationStrategy.content)
        : innovationStrategy.content;

      // Extract low-end disruption opportunities
      if (content.low_end_disruption && Array.isArray(content.low_end_disruption)) {
        content.low_end_disruption.slice(0, 2).forEach((opp: any) => {
          recommendations.push(`Low-End: ${opp.opportunity || opp}`);
        });
      }

      // Extract new market disruption opportunities
      if (content.new_market_disruption && Array.isArray(content.new_market_disruption)) {
        content.new_market_disruption.slice(0, 2).forEach((opp: any) => {
          recommendations.push(`New Market: ${opp.opportunity || opp}`);
        });
      }

      // Extract sustaining innovations
      if (content.sustaining_innovations && Array.isArray(content.sustaining_innovations)) {
        content.sustaining_innovations.slice(0, 2).forEach((innovation: any) => {
          recommendations.push(`Sustaining: ${innovation.innovation || innovation}`);
        });
      }

      // Extract disruptive opportunities (fallback if above structure not present)
      if (recommendations.length < 3 && content.opportunities && Array.isArray(content.opportunities)) {
        content.opportunities.slice(0, 3).forEach((opp: any) => {
          recommendations.push(opp.opportunity || opp);
        });
      }

      // Extract implementation roadmap
      if (content.implementation_roadmap && Array.isArray(content.implementation_roadmap)) {
        content.implementation_roadmap.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step.phase || step);
        });
      } else if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }
    } catch (error) {
      console.error('Error parsing Innovation Strategy:', error);
      throw new Error('Failed to parse Innovation Strategy from AI agent.');
    }

    if (recommendations.length === 0) {
      throw new Error('Innovation Strategy agent did not return any recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('Innovation Strategy agent did not return action steps.');
    }

    return {
      workflow: "innovation-strategy",
      context,
      intelligence,
      innovationStrategy,
      recommendations,
      nextSteps,
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

    // Extract recommendations from both AI agent responses
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      // Parse AI Personalization strategy
      const aiContent = typeof aiStrategy.content === 'string'
        ? JSON.parse(aiStrategy.content)
        : aiStrategy.content;

      // Extract personalization opportunities
      if (aiContent.personalization_opportunities && Array.isArray(aiContent.personalization_opportunities)) {
        aiContent.personalization_opportunities.slice(0, 2).forEach((opp: any) => {
          recommendations.push(`AI Personalization: ${opp.opportunity || opp}`);
        });
      }

      // Extract segmentation strategy
      if (aiContent.segmentation_strategy) {
        const segment = typeof aiContent.segmentation_strategy === 'string'
          ? aiContent.segmentation_strategy
          : aiContent.segmentation_strategy.approach || JSON.stringify(aiContent.segmentation_strategy).slice(0, 100);
        recommendations.push(`Segmentation: ${segment}`);
      }

      // Parse Marketing Mix Modeling strategy
      const mixContent = typeof mixModeling.content === 'string'
        ? JSON.parse(mixModeling.content)
        : mixModeling.content;

      // Extract channel optimization recommendations
      if (mixContent.channel_optimization && Array.isArray(mixContent.channel_optimization)) {
        mixContent.channel_optimization.slice(0, 2).forEach((channel: any) => {
          recommendations.push(`Channel: ${channel.channel || channel} - ${channel.recommendation || ''}`);
        });
      }

      // Extract budget allocation recommendations
      if (mixContent.budget_allocation) {
        const allocation = typeof mixContent.budget_allocation === 'string'
          ? mixContent.budget_allocation
          : `Optimize budget across ${Object.keys(mixContent.budget_allocation).length} channels`;
        recommendations.push(`Budget: ${allocation}`);
      }

      // Extract implementation steps (prioritize from AI strategy)
      if (aiContent.implementation_steps && Array.isArray(aiContent.implementation_steps)) {
        aiContent.implementation_steps.slice(0, 3).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }

      if (mixContent.implementation_steps && Array.isArray(mixContent.implementation_steps)) {
        mixContent.implementation_steps.slice(0, 2).forEach((step: any) => {
          nextSteps.push(step.step || step);
        });
      }

      // Fallback to action plans if implementation steps not found
      if (nextSteps.length === 0) {
        if (aiContent.action_plan && Array.isArray(aiContent.action_plan)) {
          aiContent.action_plan.slice(0, 5).forEach((step: any) => {
            nextSteps.push(step.step || step);
          });
        }
      }
    } catch (error) {
      console.error('Error parsing ML Optimization Strategy:', error);
      throw new Error('Failed to parse ML Optimization Strategy from AI agents.');
    }

    if (recommendations.length === 0) {
      throw new Error('ML Optimization agents did not return any recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('ML Optimization agents did not return action steps.');
    }

    return {
      workflow: "ml-optimization-strategy",
      context,
      intelligence,
      mlOptimization: {
        aiPersonalization: aiStrategy,
        mixModeling: mixModeling,
      },
      recommendations,
      nextSteps,
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
      throw new Error('Failed to parse comprehensive HBS synthesis from AI.');
    }

    // Extract recommendations from synthesis instead of hardcoded values
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    if (synthesis.strategicRecommendations && Array.isArray(synthesis.strategicRecommendations)) {
      synthesis.strategicRecommendations.forEach((rec: string) => {
        recommendations.push(rec);
      });
    }

    if (synthesis.implementationRoadmap && Array.isArray(synthesis.implementationRoadmap)) {
      synthesis.implementationRoadmap.forEach((step: string) => {
        nextSteps.push(step);
      });
    }

    if (recommendations.length === 0) {
      throw new Error('Comprehensive HBS synthesis did not return strategic recommendations.');
    }

    if (nextSteps.length === 0) {
      throw new Error('Comprehensive HBS synthesis did not return implementation roadmap.');
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
      recommendations,
      nextSteps,
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
