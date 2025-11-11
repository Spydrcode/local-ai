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

    return {
      workflow: "blue-ocean-strategy",
      context,
      intelligence,
      blueOceanStrategy: strategy,
      recommendations: [
        "Identify and eliminate costly industry factors customers don't value",
        "Reduce over-delivered factors below industry standard",
        "Raise underserved factors to create differentiation",
        "Create new value factors competitors don't offer",
        "Position in uncontested market space",
      ],
      nextSteps: [
        "Analyze current competitive factors in your industry",
        "Identify customer pain points competitors ignore",
        "Design value curve that breaks cost-differentiation tradeoff",
        "Test blue ocean positioning with target segments",
        "Launch repositioning campaign",
      ],
      estimatedImpact: "High - Can unlock 30-50% new market demand",
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

    return {
      workflow: "ansoff-matrix",
      context,
      intelligence,
      ansoffMatrix: matrix,
      recommendations: [
        "Market Penetration: Increase share in current markets (lowest risk)",
        "Market Development: Expand to new geographic or demographic markets",
        "Product Development: Create new offerings for existing customers",
        "Diversification: Enter new markets with new products (highest risk)",
      ],
      nextSteps: [
        "Prioritize growth quadrants based on resources and risk tolerance",
        "Start with market penetration quick wins",
        "Research adjacent markets for expansion",
        "Gather customer feedback for product development",
        "Evaluate diversification only after mastering core business",
      ],
      estimatedImpact:
        "Medium-High - Systematic growth across multiple dimensions",
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

    return {
      workflow: "bcg-matrix",
      context,
      intelligence,
      bcgMatrix: portfolio,
      recommendations: [
        "Stars: Invest aggressively to maintain market leadership",
        "Cash Cows: Harvest profits while maintaining position",
        "Question Marks: Selectively invest or divest",
        "Dogs: Divest or minimize investment",
        "Rebalance portfolio for optimal cash flow",
      ],
      nextSteps: [
        "Categorize all products/services into BCG quadrants",
        "Allocate marketing budget based on portfolio strategy",
        "Invest in stars to secure future cash cows",
        "Make tough decisions on dogs and question marks",
        "Monitor market growth rates for portfolio shifts",
      ],
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

    return {
      workflow: "positioning-map",
      context,
      intelligence,
      positioningMap: map,
      recommendations: [
        "Identify key dimensions customers use to evaluate options",
        "Plot your position vs competitors on 2D map",
        "Find white space opportunities (underserved positions)",
        "Reposition toward more defensible market space",
        "Communicate positioning consistently across all channels",
      ],
      nextSteps: [
        "Survey customers on key evaluation criteria",
        "Research competitor positioning and messaging",
        "Identify gaps in competitive landscape",
        "Design repositioning strategy",
        "Execute positioning campaign",
      ],
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

    return {
      workflow: "customer-journey-map",
      context,
      intelligence,
      customerJourneyMap: journey,
      recommendations: [
        "Map all customer touchpoints from awareness to advocacy",
        "Identify pain points and friction at each stage",
        "Prioritize fixes by business impact",
        "Create moments of delight to build loyalty",
        "Measure and optimize key journey metrics",
      ],
      nextSteps: [
        "Interview customers about their experience",
        "Track customer behavior across touchpoints",
        "Fix critical pain points first",
        "Test improvements and measure impact",
        "Continuously optimize based on data",
      ],
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

    return {
      workflow: "okr-framework",
      context,
      intelligence,
      okrFramework: okrs,
      recommendations: [
        "Set 3-5 ambitious but achievable quarterly objectives",
        "Define 3-5 measurable key results per objective",
        "Ensure OKRs align across company and teams",
        "Review progress weekly or biweekly",
        "Celebrate 0.7+ scores as success (stretch goals)",
      ],
      nextSteps: [
        "Finalize quarterly OKRs with leadership team",
        "Communicate OKRs company-wide",
        "Set up tracking dashboards",
        "Schedule regular check-ins",
        "Adjust OKRs if circumstances change significantly",
      ],
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
      synthesis = {
        executiveSummary: synthesisResponse,
        strategicPriorities: [],
        strategicInitiatives: [],
        crossFrameworkInsights: [],
      };
    }

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
      recommendations: [
        "Review all 6 frameworks to understand full strategic picture",
        "Focus on cross-framework insights for highest-impact actions",
        "Prioritize initiatives based on resource constraints",
        "Align team around strategic priorities",
        "Track OKRs to measure progress on strategic initiatives",
      ],
      nextSteps: [
        "Present synthesized strategy to leadership team",
        "Choose top 3 strategic priorities for next quarter",
        "Assign owners to each strategic initiative",
        "Set up monthly strategic review meetings",
        "Adjust strategy based on market feedback",
      ],
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
