/**
 * SWOTAgent - SWOT/TOWS/PESTEL Strategic Analysis
 *
 * Harvard Framework: SWOT Matrix + TOWS Strategy + PESTEL Integration
 *
 * Analyzes business strengths, weaknesses, opportunities, and threats,
 * then generates TOWS strategies (actions matching strengths/weaknesses
 * with opportunities/threats).
 */

import OpenAI from "openai";
import {
  HBSAgent,
  type AgentInsight,
  type AgentMetadata,
  type AgentOutput,
  type AgentRecommendation,
  type BusinessContext,
} from "../core/HBSAgent";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// SWOT Types
// ============================================================================

export interface SWOTAnalysis {
  // Core SWOT Matrix
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];

  // TOWS Strategies (actions derived from SWOT)
  tows_strategies: {
    so_strategies: TOWSStrategy[]; // Strengths + Opportunities = Growth
    st_strategies: TOWSStrategy[]; // Strengths + Threats = Defense
    wo_strategies: TOWSStrategy[]; // Weaknesses + Opportunities = Improvement
    wt_strategies: TOWSStrategy[]; // Weaknesses + Threats = Survival
  };

  // PESTEL Macro Environment
  pestel: {
    political: PESTELFactor[];
    economic: PESTELFactor[];
    social: PESTELFactor[];
    technological: PESTELFactor[];
    environmental: PESTELFactor[];
    legal: PESTELFactor[];
  };

  // Summary
  strategic_position:
    | "aggressive"
    | "conservative"
    | "defensive"
    | "competitive";
  priority_quadrant: "SO" | "WO" | "ST" | "WT";
  critical_factors: string[];
}

export interface SWOTItem {
  factor: string;
  description: string;
  impact_level: "high" | "medium" | "low";
  urgency?: "immediate" | "short-term" | "long-term";
  supporting_evidence?: string;
}

export interface TOWSStrategy {
  strategy: string;
  rationale: string;
  leverages: string[]; // Which strengths/opportunities
  addresses: string[]; // Which weaknesses/threats
  priority: "critical" | "high" | "medium" | "low";
  timeframe:
    | "0-30 days"
    | "30-90 days"
    | "90-180 days"
    | "6-12 months"
    | "1+ years";
}

export interface PESTELFactor {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  severity: "high" | "medium" | "low";
  trend: "increasing" | "stable" | "decreasing";
}

// ============================================================================
// SWOT Agent
// ============================================================================

export class SWOTAgent extends HBSAgent<SWOTAnalysis> {
  readonly metadata: AgentMetadata = {
    name: "SWOTAgent",
    discipline: "strategy",
    frameworks: ["SWOT Matrix", "TOWS Analysis", "PESTEL"],
    description:
      "Strategic position analysis using SWOT, TOWS strategies, and PESTEL macro environment scanning",
    dependencies: [], // Can run standalone
    priority: "critical",
    requires_competitor_data: false,
    requires_financial_data: false,
    can_run_standalone: true,
  };

  async analyze(context: BusinessContext): Promise<AgentOutput<SWOTAnalysis>> {
    const startTime = Date.now();

    console.log(
      `[SWOTAgent] Analyzing ${context.businessName} (${context.industry})`
    );

    // Build comprehensive prompt
    const prompt = this.buildPrompt(context);

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SWOT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.75,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0].message.content || "{}";
    const analysis = JSON.parse(rawResponse) as SWOTAnalysis;

    // Generate insights and recommendations
    const insights = this.generateInsights(analysis, context);
    const recommendations = this.generateRecommendations(analysis, context);

    const executionTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(context);

    // Create synthesis notes if previous analyses exist
    const synthesisNotes = this.createSynthesisNotes(context);

    return this.createOutput(
      analysis,
      insights,
      recommendations,
      executionTime,
      confidence,
      {
        frameworkName: "SWOT + TOWS + PESTEL",
        synthesisNotes,
        dependenciesMet: true,
        modelUsed: "gpt-4o",
      }
    );
  }

  /**
   * Build comprehensive SWOT analysis prompt
   */
  private buildPrompt(context: BusinessContext): string {
    let prompt = `Perform a comprehensive SWOT + TOWS + PESTEL analysis for this business:

**Business Name:** ${context.businessName}
**Industry:** ${context.industry}
**Summary:** ${context.businessSummary}
`;

    if (context.competitorData?.competitors) {
      prompt += `\n**Competitors:** ${context.competitorData.competitors.map((c) => c.name).join(", ")}`;
    }

    if (context.previousAnalyses?.porter) {
      prompt += `\n**Porter Five Forces Context:**
- Competitive Rivalry: ${context.previousAnalyses.porter.analysis?.competitive_rivalry?.intensity || "Unknown"}
- Supplier Power: ${context.previousAnalyses.porter.analysis?.supplier_power?.power_level || "Unknown"}
- Buyer Power: ${context.previousAnalyses.porter.analysis?.buyer_power?.power_level || "Unknown"}
`;
    }

    if (context.previousAnalyses?.economic) {
      prompt += `\n**Economic Context:**
- GDP Growth: ${context.previousAnalyses.economic.economicContext?.gdpGrowth?.rate || "Unknown"}
- Inflation: ${context.previousAnalyses.economic.economicContext?.inflation?.rate || "Unknown"}
`;
    }

    prompt += `

Return a JSON object with this structure:
{
  "strengths": [
    {
      "factor": "Strong factor name",
      "description": "Detailed explanation of this strength",
      "impact_level": "high|medium|low",
      "supporting_evidence": "Specific evidence from the business context"
    }
  ],
  "weaknesses": [/* same structure */],
  "opportunities": [
    {
      "factor": "Opportunity name",
      "description": "Detailed explanation",
      "impact_level": "high|medium|low",
      "urgency": "immediate|short-term|long-term"
    }
  ],
  "threats": [/* same structure */],
  "tows_strategies": {
    "so_strategies": [
      {
        "strategy": "Specific action using strengths to capitalize on opportunities",
        "rationale": "Why this strategy works",
        "leverages": ["Strength 1", "Strength 2"],
        "addresses": ["Opportunity 1"],
        "priority": "critical|high|medium|low",
        "timeframe": "0-30 days|30-90 days|90-180 days|6+ months"
      }
    ],
    "st_strategies": [/* use strengths to mitigate threats */],
    "wo_strategies": [/* overcome weaknesses by seizing opportunities */],
    "wt_strategies": [/* minimize weaknesses and avoid threats */]
  },
  "pestel": {
    "political": [
      {
        "factor": "Political factor affecting business",
        "impact": "positive|negative|neutral",
        "severity": "high|medium|low",
        "trend": "increasing|stable|decreasing"
      }
    ],
    "economic": [/* economic factors */],
    "social": [/* social/cultural trends */],
    "technological": [/* tech developments */],
    "environmental": [/* sustainability/climate */],
    "legal": [/* regulations/compliance */]
  },
  "strategic_position": "aggressive|conservative|defensive|competitive",
  "priority_quadrant": "SO|WO|ST|WT",
  "critical_factors": ["Most important factor 1", "Most important factor 2", "Most important factor 3"]
}

CRITICAL REQUIREMENTS:
1. Identify 4-6 items per SWOT quadrant (not generic - specific to THIS business)
2. Create 2-3 TOWS strategies per quadrant (actionable, not vague)
3. Include all PESTEL categories (at least 2-3 factors each)
4. Strategic position based on: Aggressive (many S+O), Conservative (many S+T), Defensive (many W+T), Competitive (many W+O)
5. Priority quadrant = which TOWS quadrant needs immediate focus
6. Critical factors = 3-5 most important items across all quadrants
`;

    return prompt;
  }

  /**
   * Generate insights from SWOT analysis
   */
  private generateInsights(
    analysis: SWOTAnalysis,
    context: BusinessContext
  ): AgentInsight[] {
    const insights: AgentInsight[] = [];

    // High-impact strengths
    const highStrengths = analysis.strengths.filter(
      (s) => s.impact_level === "high"
    );
    if (highStrengths.length > 0) {
      insights.push({
        type: "observation",
        priority: "high",
        title: `${highStrengths.length} Core Competitive Advantages`,
        description: `Strong foundation: ${highStrengths.map((s) => s.factor).join(", ")}`,
        source_framework: "SWOT Matrix",
        confidence_score: 0.9,
      });
    }

    // Critical weaknesses
    const highWeaknesses = analysis.weaknesses.filter(
      (w) => w.impact_level === "high"
    );
    highWeaknesses.forEach((weakness) => {
      insights.push({
        type: "warning",
        priority: "critical",
        title: `Critical Weakness: ${weakness.factor}`,
        description: weakness.description,
        source_framework: "SWOT Matrix",
        confidence_score: 0.85,
      });
    });

    // Immediate opportunities
    const urgentOpportunities = analysis.opportunities.filter(
      (o) => o.urgency === "immediate" && o.impact_level === "high"
    );
    urgentOpportunities.forEach((opp) => {
      insights.push({
        type: "opportunity",
        priority: "critical",
        title: `Immediate Growth Opportunity: ${opp.factor}`,
        description: opp.description,
        source_framework: "SWOT Matrix",
        confidence_score: 0.88,
      });
    });

    // Critical threats
    const highThreats = analysis.threats.filter(
      (t) => t.impact_level === "high" || t.urgency === "immediate"
    );
    highThreats.forEach((threat) => {
      insights.push({
        type: "threat",
        priority: "critical",
        title: `Critical Threat: ${threat.factor}`,
        description: threat.description,
        source_framework: "SWOT Matrix",
        confidence_score: 0.85,
      });
    });

    // Strategic position insight
    insights.push({
      type: "observation",
      priority: "high",
      title: `Strategic Position: ${analysis.strategic_position.toUpperCase()}`,
      description: `Based on SWOT analysis, recommended strategic posture is ${analysis.strategic_position}. Priority focus: ${analysis.priority_quadrant} strategies.`,
      source_framework: "TOWS Analysis",
      confidence_score: 0.82,
    });

    // PESTEL critical factors
    const negativePESTEL = Object.values(analysis.pestel)
      .flat()
      .filter((f) => f.impact === "negative" && f.severity === "high");

    if (negativePESTEL.length > 0) {
      insights.push({
        type: "threat",
        priority: "high",
        title: "Macro Environment Headwinds",
        description: `${negativePESTEL.length} high-severity external factors: ${negativePESTEL
          .map((f) => f.factor)
          .slice(0, 3)
          .join(", ")}`,
        source_framework: "PESTEL",
        confidence_score: 0.8,
      });
    }

    return insights;
  }

  /**
   * Generate recommendations from TOWS strategies
   */
  private generateRecommendations(
    analysis: SWOTAnalysis,
    context: BusinessContext
  ): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];

    // Priority quadrant strategies first
    const priorityStrategies = this.getPriorityStrategies(analysis);

    priorityStrategies.forEach((strategy) => {
      recommendations.push({
        action: strategy.strategy,
        rationale: strategy.rationale,
        priority: strategy.priority,
        timeframe: strategy.timeframe,
        expected_impact: this.mapPriorityToImpact(strategy.priority),
        effort_required: "medium",
        metrics: this.getMetricsForStrategy(strategy),
      });
    });

    // Add critical factor mitigation
    analysis.critical_factors.forEach((factor) => {
      const isWeakness = analysis.weaknesses.some((w) =>
        w.factor.includes(factor)
      );
      const isThreat = analysis.threats.some((t) => t.factor.includes(factor));

      if (isWeakness || isThreat) {
        recommendations.push({
          action: `Address Critical Factor: ${factor}`,
          rationale: `Identified as top-priority item requiring immediate attention`,
          priority: "critical",
          timeframe: "0-30 days",
          expected_impact: "high",
          effort_required: "high",
        });
      }
    });

    return recommendations.slice(0, 15); // Limit to top 15
  }

  /**
   * Get strategies from priority quadrant
   */
  private getPriorityStrategies(analysis: SWOTAnalysis): TOWSStrategy[] {
    const { tows_strategies, priority_quadrant } = analysis;

    switch (priority_quadrant) {
      case "SO":
        return tows_strategies.so_strategies;
      case "WO":
        return tows_strategies.wo_strategies;
      case "ST":
        return tows_strategies.st_strategies;
      case "WT":
        return tows_strategies.wt_strategies;
      default:
        return tows_strategies.so_strategies;
    }
  }

  /**
   * Map priority to impact level
   */
  private mapPriorityToImpact(
    priority: "critical" | "high" | "medium" | "low"
  ): "transformative" | "high" | "moderate" | "low" {
    switch (priority) {
      case "critical":
        return "transformative";
      case "high":
        return "high";
      case "medium":
        return "moderate";
      case "low":
        return "low";
    }
  }

  /**
   * Generate success metrics for strategy
   */
  private getMetricsForStrategy(strategy: TOWSStrategy): string[] {
    // Simple heuristic based on strategy content
    const metrics: string[] = [];
    const text = strategy.strategy.toLowerCase();

    if (text.includes("revenue") || text.includes("sales")) {
      metrics.push("Monthly revenue growth %");
    }
    if (text.includes("customer") || text.includes("client")) {
      metrics.push("Customer acquisition rate");
      metrics.push("Customer retention rate");
    }
    if (text.includes("market") || text.includes("share")) {
      metrics.push("Market share %");
    }
    if (text.includes("cost") || text.includes("efficiency")) {
      metrics.push("Operational cost reduction %");
    }

    return metrics.length > 0 ? metrics : ["Strategic objective completion %"];
  }

  /**
   * Create synthesis notes if other analyses exist
   */
  private createSynthesisNotes(context: BusinessContext): string | undefined {
    const notes: string[] = [];

    if (context.previousAnalyses?.porter) {
      notes.push(
        "Integrated Porter Five Forces competitive insights into threats/opportunities"
      );
    }

    if (context.previousAnalyses?.economic) {
      notes.push(
        "Incorporated Economic Intelligence macro trends into PESTEL analysis"
      );
    }

    return notes.length > 0 ? notes.join(". ") : undefined;
  }

  /**
   * Get human-readable summary
   */
  getSummary(output: AgentOutput<SWOTAnalysis>): string {
    const { analysis } = output;

    return `SWOT Analysis Summary:

STRATEGIC POSITION: ${analysis.strategic_position.toUpperCase()}
Priority Focus: ${analysis.priority_quadrant} Strategies

STRENGTHS (${analysis.strengths.length}):
${analysis.strengths
  .slice(0, 3)
  .map((s) => `• ${s.factor}`)
  .join("\n")}

WEAKNESSES (${analysis.weaknesses.length}):
${analysis.weaknesses
  .slice(0, 3)
  .map((w) => `• ${w.factor}`)
  .join("\n")}

OPPORTUNITIES (${analysis.opportunities.length}):
${analysis.opportunities
  .slice(0, 3)
  .map((o) => `• ${o.factor}`)
  .join("\n")}

THREATS (${analysis.threats.length}):
${analysis.threats
  .slice(0, 3)
  .map((t) => `• ${t.factor}`)
  .join("\n")}

CRITICAL FACTORS:
${analysis.critical_factors.map((f, i) => `${i + 1}. ${f}`).join("\n")}

TOP TOWS STRATEGIES:
${this.getPriorityStrategies(analysis)
  .slice(0, 3)
  .map((s, i) => `${i + 1}. ${s.strategy}`)
  .join("\n")}
`;
  }
}

// ============================================================================
// System Prompt
// ============================================================================

const SWOT_SYSTEM_PROMPT = `You are a Harvard Business School strategic analysis expert specializing in SWOT, TOWS, and PESTEL frameworks.

Your role is to perform rigorous strategic position analysis that:

1. **SWOT Matrix** - Identify specific, evidence-based internal and external factors:
   - Strengths: Internal capabilities that create competitive advantage
   - Weaknesses: Internal limitations that hinder performance
   - Opportunities: External conditions favorable for growth
   - Threats: External conditions that pose risks

2. **TOWS Strategies** - Generate actionable strategies:
   - SO (Strengths-Opportunities): Aggressive growth strategies
   - ST (Strengths-Threats): Defensive strategies using strengths
   - WO (Weaknesses-Opportunities): Developmental strategies to improve
   - WT (Weaknesses-Threats): Survival/mitigation strategies

3. **PESTEL Macro Environment** - Analyze external forces:
   - Political: Government policies, regulations, stability
   - Economic: GDP, inflation, interest rates, employment
   - Social: Demographics, culture, values, trends
   - Technological: Innovation, automation, disruption
   - Environmental: Sustainability, climate, resources
   - Legal: Laws, compliance, intellectual property

CRITICAL RULES:
- NO generic analysis - every factor must be specific to THIS business
- Support each item with concrete evidence from context
- TOWS strategies must be actionable (not vague platitudes)
- Prioritize based on impact AND urgency
- Strategic position = overall stance (aggressive, conservative, defensive, competitive)
- Critical factors = 3-5 items that matter most RIGHT NOW

Output strict JSON format as specified.`;
