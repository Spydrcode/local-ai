/**
 * Strategic Frameworks Orchestrator
 * Coordinates strategic framework agents (Blue Ocean, Ansoff, BCG, Positioning, Journey, OKR)
 */

import { MarketingIntelligenceCollector } from "../data-collectors/marketing-intelligence-collector";
import { createAICompletion } from "../unified-ai-client";

// Import strategic framework agents
import {
  ansoffMatrixAgent,
  bcgMatrixAgent,
  blueOceanAgent,
  customerJourneyAgent,
  okrAgent,
  positioningMapAgent,
} from "./strategic-framework-agents";

export type StrategicWorkflow =
  | "blue-ocean-strategy"
  | "ansoff-matrix"
  | "bcg-matrix"
  | "positioning-map"
  | "customer-journey-map"
  | "okr-framework"
  | "comprehensive-strategic-analysis"; // Run all 6 frameworks

export interface StrategicContext {
  website: string;
  businessName?: string;
  industry?: string;
  goals?: string[];
  targetAudience?: string;
  currentChallenges?: string[];
  competitors?: string[];
}

export interface StrategicAnalysisResult {
  workflow: StrategicWorkflow;
  context: StrategicContext;
  intelligence?: any;

  // Framework-specific results
  blueOceanStrategy?: any;
  ansoffMatrix?: any;
  bcgMatrix?: any;
  positioningMap?: any;
  customerJourneyMap?: any;
  okrFramework?: any;

  // Synthesized insights (for comprehensive analysis)
  synthesis?: {
    executiveSummary: string;
    strategicPriorities: string[];
    strategicInitiatives: string[];
    crossFrameworkInsights: string[];
  };

  recommendations: string[];
  nextSteps: string[];
  estimatedImpact: string;
  timeline: string;
  executedAt: string;
  executionTime: number;
}

export class StrategicFrameworksOrchestrator {
  private static instance: StrategicFrameworksOrchestrator;
  private dataCollector: MarketingIntelligenceCollector;
  private cache: Map<
    string,
    { result: StrategicAnalysisResult; expiresAt: number }
  >;

  private constructor() {
    this.dataCollector = new MarketingIntelligenceCollector();
    this.cache = new Map();
  }

  static getInstance(): StrategicFrameworksOrchestrator {
    if (!StrategicFrameworksOrchestrator.instance) {
      StrategicFrameworksOrchestrator.instance =
        new StrategicFrameworksOrchestrator();
    }
    return StrategicFrameworksOrchestrator.instance;
  }

  /**
   * Execute a strategic framework workflow
   */
  async execute(
    workflow: StrategicWorkflow,
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    const startTime = Date.now();

    console.log(
      `\n🎯 Executing Strategic Framework: ${workflow} for ${context.website}`
    );

    // Check cache
    const cacheKey = `${workflow}:${context.website}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log("✓ Returning cached result");
      return cached.result;
    }

    let result: StrategicAnalysisResult;

    switch (workflow) {
      case "blue-ocean-strategy":
        result = await this.executeBlueOceanStrategy(context);
        break;

      case "ansoff-matrix":
        result = await this.executeAnsoffMatrix(context);
        break;

      case "bcg-matrix":
        result = await this.executeBCGMatrix(context);
        break;

      case "positioning-map":
        result = await this.executePositioningMap(context);
        break;

      case "customer-journey-map":
        result = await this.executeCustomerJourneyMap(context);
        break;

      case "okr-framework":
        result = await this.executeOKRFramework(context);
        break;

      case "comprehensive-strategic-analysis":
        result = await this.executeComprehensiveAnalysis(context);
        break;

      default:
        throw new Error(`Unknown strategic workflow: ${workflow}`);
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
   * Blue Ocean Strategy - Find uncontested market space
   */
  private async executeBlueOceanStrategy(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing Blue Ocean opportunities...");
    const strategy = await blueOceanAgent.execute(
      `Create Blue Ocean Strategy analysis for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        industry: context.industry,
        competitors: intelligence.competitiveSignals,
      }
    );

    // Extract recommendations from AI agent response
    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof strategy.content === 'string' ? JSON.parse(strategy.content) : strategy.content;

      // Extract Four Actions Framework recommendations
      if (content.four_actions) {
        if (content.four_actions.eliminate) recommendations.push(`Eliminate: ${Array.isArray(content.four_actions.eliminate) ? content.four_actions.eliminate[0] : content.four_actions.eliminate}`);
        if (content.four_actions.reduce) recommendations.push(`Reduce: ${Array.isArray(content.four_actions.reduce) ? content.four_actions.reduce[0] : content.four_actions.reduce}`);
        if (content.four_actions.raise) recommendations.push(`Raise: ${Array.isArray(content.four_actions.raise) ? content.four_actions.raise[0] : content.four_actions.raise}`);
        if (content.four_actions.create) recommendations.push(`Create: ${Array.isArray(content.four_actions.create) ? content.four_actions.create[0] : content.four_actions.create}`);
      }

      if (content.value_proposition) recommendations.push(`Value Proposition: ${content.value_proposition}`);
      if (content.implementation_steps && Array.isArray(content.implementation_steps)) {
        content.implementation_steps.slice(0, 5).forEach((step: any) => nextSteps.push(step.step || step));
      }
    } catch (error) {
      console.error('Error parsing Blue Ocean strategy:', error);
      throw new Error('Failed to parse Blue Ocean strategy analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('Blue Ocean strategy agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('Blue Ocean strategy agent did not return action steps.');

    return {
      workflow: "blue-ocean-strategy",
      context,
      intelligence,
      blueOceanStrategy: strategy,
      recommendations,
      nextSteps,
      estimatedImpact: "High - Uncontested market space creation",
      timeline: "3-6 months to execute repositioning",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Ansoff Matrix - Growth strategy across 4 dimensions
   */
  private async executeAnsoffMatrix(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing growth opportunities...");
    const matrix = await ansoffMatrixAgent.execute(
      `Analyze growth opportunities using Ansoff Matrix for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        currentMarkets: context.targetAudience || "General market",
        currentProducts: intelligence.brandAnalysis.keyMessages.join(", "),
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof matrix.content === 'string' ? JSON.parse(matrix.content) : matrix.content;

      if (content.market_penetration) recommendations.push(`Market Penetration: ${content.market_penetration.strategy || content.market_penetration}`);
      if (content.market_development) recommendations.push(`Market Development: ${content.market_development.strategy || content.market_development}`);
      if (content.product_development) recommendations.push(`Product Development: ${content.product_development.strategy || content.product_development}`);
      if (content.diversification) recommendations.push(`Diversification: ${content.diversification.strategy || content.diversification}`);

      if (content.recommended_approach && Array.isArray(content.recommended_approach)) {
        content.recommended_approach.slice(0, 5).forEach((step: any) => nextSteps.push(step.action || step));
      }
    } catch (error) {
      console.error('Error parsing Ansoff Matrix:', error);
      throw new Error('Failed to parse Ansoff Matrix analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('Ansoff Matrix agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('Ansoff Matrix agent did not return action steps.');

    return {
      workflow: "ansoff-matrix",
      context,
      intelligence,
      ansoffMatrix: matrix,
      recommendations,
      nextSteps,
      estimatedImpact: "Medium-High - Systematic growth across multiple dimensions",
      timeline: "6-12 months for phased execution",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * BCG Matrix - Portfolio optimization
   */
  private async executeBCGMatrix(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Analyzing product portfolio...");
    const portfolio = await bcgMatrixAgent.execute(
      `Analyze product/service portfolio using BCG Matrix for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        products: intelligence.brandAnalysis.keyMessages.join(", "),
        industry: context.industry,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof portfolio.content === 'string' ? JSON.parse(portfolio.content) : portfolio.content;

      if (content.stars && Array.isArray(content.stars)) content.stars.slice(0, 2).forEach((item: any) => recommendations.push(`Star: ${item.product || item} - ${item.strategy || 'invest for growth'}`));
      if (content.cash_cows && Array.isArray(content.cash_cows)) content.cash_cows.slice(0, 2).forEach((item: any) => recommendations.push(`Cash Cow: ${item.product || item} - ${item.strategy || 'harvest profits'}`));
      if (content.question_marks && Array.isArray(content.question_marks)) recommendations.push(`Question Mark: ${content.question_marks[0]?.product || content.question_marks[0]} - ${content.question_marks[0]?.strategy || 'invest or divest'}`);
      if (content.dogs && Array.isArray(content.dogs)) recommendations.push(`Dog: ${content.dogs[0]?.product || content.dogs[0]} - ${content.dogs[0]?.strategy || 'divest'}`);

      if (content.portfolio_recommendations && Array.isArray(content.portfolio_recommendations)) {
        content.portfolio_recommendations.slice(0, 5).forEach((rec: any) => nextSteps.push(rec.action || rec));
      }
    } catch (error) {
      console.error('Error parsing BCG Matrix:', error);
      throw new Error('Failed to parse BCG Matrix analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('BCG Matrix agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('BCG Matrix agent did not return action steps.');

    return {
      workflow: "bcg-matrix",
      context,
      intelligence,
      bcgMatrix: portfolio,
      recommendations,
      nextSteps,
      estimatedImpact: "Medium - Better resource allocation and focus",
      timeline: "1-3 months for portfolio analysis and decisions",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Positioning Map - Visualize competitive position
   */
  private async executePositioningMap(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Creating positioning map...");
    const map = await positioningMapAgent.execute(
      `Create competitive positioning map for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        competitors: intelligence.competitiveSignals,
        industry: context.industry,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof map.content === 'string' ? JSON.parse(map.content) : map.content;

      if (content.current_position) recommendations.push(`Current Position: ${content.current_position}`);
      if (content.target_position) recommendations.push(`Target Position: ${content.target_position}`);
      if (content.white_space_opportunities && Array.isArray(content.white_space_opportunities)) {
        content.white_space_opportunities.slice(0, 3).forEach((opp: any) => recommendations.push(`Opportunity: ${opp.description || opp}`));
      }

      if (content.repositioning_steps && Array.isArray(content.repositioning_steps)) {
        content.repositioning_steps.slice(0, 5).forEach((step: any) => nextSteps.push(step.action || step));
      }
    } catch (error) {
      console.error('Error parsing Positioning Map:', error);
      throw new Error('Failed to parse Positioning Map analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('Positioning Map agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('Positioning Map agent did not return action steps.');

    return {
      workflow: "positioning-map",
      context,
      intelligence,
      positioningMap: map,
      recommendations,
      nextSteps,
      estimatedImpact: "Medium-High - Clear differentiation and positioning",
      timeline: "2-4 months for repositioning",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Customer Journey Map - End-to-end experience optimization
   */
  private async executeCustomerJourneyMap(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Mapping customer journey...");
    const journey = await customerJourneyAgent.execute(
      `Map complete customer journey for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        targetAudience: context.targetAudience || "General customers",
        businessType: context.industry,
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof journey.content === 'string' ? JSON.parse(journey.content) : journey.content;

      if (content.pain_points && Array.isArray(content.pain_points)) {
        content.pain_points.slice(0, 4).forEach((pain: any) => {
          recommendations.push(`Fix: ${pain.stage || 'Stage'} - ${pain.description || pain}`);
        });
      }

      if (content.opportunities && Array.isArray(content.opportunities)) {
        content.opportunities.slice(0, 2).forEach((opp: any) => {
          recommendations.push(`Opportunity: ${opp.description || opp}`);
        });
      }

      if (content.action_plan && Array.isArray(content.action_plan)) {
        content.action_plan.slice(0, 5).forEach((action: any) => nextSteps.push(action.action || action));
      }
    } catch (error) {
      console.error('Error parsing Customer Journey Map:', error);
      throw new Error('Failed to parse Customer Journey Map analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('Customer Journey Map agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('Customer Journey Map agent did not return action steps.');

    return {
      workflow: "customer-journey-map",
      context,
      intelligence,
      customerJourneyMap: journey,
      recommendations,
      nextSteps,
      estimatedImpact: "High - Better conversion and retention rates",
      timeline: "1-3 months for initial improvements",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * OKR Framework - Objectives and Key Results for execution
   */
  private async executeOKRFramework(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Creating OKRs...");
    const okrs = await okrAgent.execute(
      `Create quarterly OKRs for ${context.businessName || intelligence.brandAnalysis.businessName}.`,
      {
        websiteData: JSON.stringify(intelligence),
        goals: context.goals?.join(", "),
        challenges: context.currentChallenges?.join(", "),
      }
    );

    const recommendations: string[] = [];
    const nextSteps: string[] = [];

    try {
      const content = typeof okrs.content === 'string' ? JSON.parse(okrs.content) : okrs.content;

      if (content.objectives && Array.isArray(content.objectives)) {
        content.objectives.slice(0, 5).forEach((obj: any) => {
          recommendations.push(`Objective: ${obj.objective || obj}`);
          if (obj.key_results && Array.isArray(obj.key_results)) {
            obj.key_results.slice(0, 2).forEach((kr: any) => {
              recommendations.push(`  KR: ${kr.key_result || kr}`);
            });
          }
        });
      }

      if (content.implementation_plan && Array.isArray(content.implementation_plan)) {
        content.implementation_plan.slice(0, 5).forEach((step: any) => nextSteps.push(step.action || step));
      }
    } catch (error) {
      console.error('Error parsing OKR Framework:', error);
      throw new Error('Failed to parse OKR Framework analysis from AI agent.');
    }

    if (recommendations.length === 0) throw new Error('OKR Framework agent did not return recommendations.');
    if (nextSteps.length === 0) throw new Error('OKR Framework agent did not return action steps.');

    return {
      workflow: "okr-framework",
      context,
      intelligence,
      okrFramework: okrs,
      recommendations: recommendations.slice(0, 10),
      nextSteps,
      estimatedImpact: "High - Clear goals and accountability",
      timeline: "1 quarter (3 months)",
      executedAt: new Date().toISOString(),
      executionTime: 0,
    };
  }

  /**
   * Comprehensive Strategic Analysis - Run all 6 frameworks and synthesize
   */
  private async executeComprehensiveAnalysis(
    context: StrategicContext
  ): Promise<StrategicAnalysisResult> {
    console.log("Collecting marketing intelligence...");
    const intelligence = await this.dataCollector.collect(context.website);

    console.log("Running all 6 strategic frameworks...");

    // Run all frameworks in parallel
    const [blueOcean, ansoff, bcg, positioning, journey, okr] =
      await Promise.all([
        this.executeBlueOceanStrategy(context),
        this.executeAnsoffMatrix(context),
        this.executeBCGMatrix(context),
        this.executePositioningMap(context),
        this.executeCustomerJourneyMap(context),
        this.executeOKRFramework(context),
      ]);

    // Synthesize cross-framework insights using AI
    console.log("Synthesizing cross-framework insights...");
    const synthesisPrompt = `You are a strategic advisor synthesizing insights from 6 strategic frameworks.

Business: ${context.businessName || intelligence.brandAnalysis.businessName}
Industry: ${context.industry || "Not specified"}

Framework Results:
1. Blue Ocean Strategy: ${JSON.stringify(blueOcean.blueOceanStrategy)}
2. Ansoff Matrix: ${JSON.stringify(ansoff.ansoffMatrix)}
3. BCG Matrix: ${JSON.stringify(bcg.bcgMatrix)}
4. Positioning Map: ${JSON.stringify(positioning.positioningMap)}
5. Customer Journey: ${JSON.stringify(journey.customerJourneyMap)}
6. OKR Framework: ${JSON.stringify(okr.okrFramework)}

Provide a synthesis in JSON format:
{
  "executiveSummary": "2-3 paragraph strategic summary",
  "strategicPriorities": ["Top 5 strategic priorities"],
  "strategicInitiatives": ["Top 5 initiatives to execute"],
  "crossFrameworkInsights": ["5 insights that emerged across multiple frameworks"]
}`;

    const synthesisResponse = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a strategic business advisor expert in synthesizing insights from multiple frameworks.",
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
      throw new Error('Failed to parse comprehensive strategic synthesis from AI.');
    }

    // Extract recommendations from synthesis
    const recommendations: string[] = synthesis.strategicPriorities || [];
    const nextSteps: string[] = synthesis.strategicInitiatives || [];

    if (recommendations.length === 0) throw new Error('Comprehensive strategic analysis did not return strategic priorities.');
    if (nextSteps.length === 0) throw new Error('Comprehensive strategic analysis did not return strategic initiatives.');

    return {
      workflow: "comprehensive-strategic-analysis",
      context,
      intelligence,
      blueOceanStrategy: blueOcean.blueOceanStrategy,
      ansoffMatrix: ansoff.ansoffMatrix,
      bcgMatrix: bcg.bcgMatrix,
      positioningMap: positioning.positioningMap,
      customerJourneyMap: journey.customerJourneyMap,
      okrFramework: okr.okrFramework,
      synthesis,
      recommendations,
      nextSteps,
      estimatedImpact: "Very High - Complete strategic clarity and alignment",
      timeline: "3-6 months for comprehensive execution",
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
