/**
 * OsterwalderAgent - Business Model Canvas Generator
 *
 * Harvard Framework: Business Model Canvas (Osterwalder & Pigneur)
 *
 * Generates a complete 9-block Business Model Canvas with value proposition
 * design and revenue model recommendations for small businesses.
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
// Business Model Canvas Types
// ============================================================================

export interface BusinessModelCanvas {
  // Right Side: VALUE (Customer-facing)
  customer_segments: CustomerSegment[];
  value_propositions: ValueProposition[];
  channels: Channel[];
  customer_relationships: CustomerRelationship[];
  revenue_streams: RevenueStream[];

  // Left Side: EFFICIENCY (Operations)
  key_resources: KeyResource[];
  key_activities: KeyActivity[];
  key_partnerships: KeyPartnership[];
  cost_structure: CostStructure;

  // Meta
  canvas_coherence_score: number; // How well the 9 blocks fit together (0-1)
  revenue_model_type:
    | "subscription"
    | "transaction"
    | "freemium"
    | "licensing"
    | "advertising"
    | "hybrid";
  scalability_assessment: "high" | "medium" | "low";
  sustainability_rating: "high" | "medium" | "low";
  critical_assumptions: string[];
}

export interface CustomerSegment {
  segment_name: string;
  description: string;
  size_estimate: string;
  characteristics: string[];
  pain_points: string[];
  priority: "primary" | "secondary" | "niche";
}

export interface ValueProposition {
  proposition: string;
  target_segment: string;
  jobs_to_be_done: string[]; // What customer wants to accomplish
  pain_relievers: string[]; // How you solve their problems
  gain_creators: string[]; // Benefits you provide
  differentiation: string; // What makes this unique
  quantified_value?: string; // e.g., "Save 10 hours/week"
}

export interface Channel {
  channel_type: "direct" | "indirect" | "digital" | "physical" | "hybrid";
  channel_name: string;
  phase: "awareness" | "evaluation" | "purchase" | "delivery" | "after-sale";
  description: string;
  cost_efficiency: "high" | "medium" | "low";
  reach: "high" | "medium" | "low";
}

export interface CustomerRelationship {
  relationship_type:
    | "personal"
    | "automated"
    | "self-service"
    | "community"
    | "co-creation";
  description: string;
  target_segment: string;
  acquisition_focus?: boolean;
  retention_focus?: boolean;
  upsell_focus?: boolean;
}

export interface RevenueStream {
  stream_name: string;
  type:
    | "asset_sale"
    | "usage_fee"
    | "subscription"
    | "lending"
    | "licensing"
    | "brokerage"
    | "advertising";
  pricing_mechanism:
    | "fixed"
    | "dynamic"
    | "freemium"
    | "tiered"
    | "usage_based";
  target_segment: string;
  revenue_potential: "high" | "medium" | "low";
  timeframe: "immediate" | "short-term" | "long-term";
  estimated_percentage?: number; // % of total revenue
}

export interface KeyResource {
  resource_type: "physical" | "intellectual" | "human" | "financial";
  resource_name: string;
  description: string;
  criticality: "critical" | "important" | "nice-to-have";
  current_status: "have" | "need" | "developing";
}

export interface KeyActivity {
  activity_name: string;
  category: "production" | "problem_solving" | "platform_network";
  description: string;
  supports: string[]; // Which value propositions this enables
  priority: "critical" | "high" | "medium" | "low";
}

export interface KeyPartnership {
  partner_type:
    | "supplier"
    | "strategic_alliance"
    | "joint_venture"
    | "coopetition";
  partner_description: string;
  motivation: "optimization" | "risk_reduction" | "resource_acquisition";
  value_provided: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface CostStructure {
  cost_driven: boolean; // vs. value-driven
  major_costs: MajorCost[];
  fixed_vs_variable: "mostly_fixed" | "balanced" | "mostly_variable";
  economies_of_scale: "high" | "medium" | "low";
  economies_of_scope: "high" | "medium" | "low";
}

export interface MajorCost {
  cost_category: string;
  description: string;
  type: "fixed" | "variable";
  estimated_percentage?: number; // % of total costs
  optimization_opportunity?: string;
}

// ============================================================================
// Osterwalder Agent
// ============================================================================

export class OsterwalderAgent extends HBSAgent<BusinessModelCanvas> {
  readonly metadata: AgentMetadata = {
    name: "OsterwalderAgent",
    discipline: "strategy",
    frameworks: ["Business Model Canvas", "Value Proposition Canvas"],
    description:
      "Business model design using Osterwalder's 9-block canvas and value proposition framework",
    dependencies: ["SWOTAgent"], // SWOT opportunities inform value propositions
    priority: "critical",
    requires_competitor_data: false,
    requires_financial_data: false,
    can_run_standalone: true,
  };

  async analyze(
    context: BusinessContext
  ): Promise<AgentOutput<BusinessModelCanvas>> {
    const startTime = Date.now();

    console.log(
      `[OsterwalderAgent] Designing business model for ${context.businessName}`
    );

    // Build comprehensive prompt
    const prompt = this.buildPrompt(context);

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: OSTERWALDER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.75,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0].message.content || "{}";
    const canvas = JSON.parse(rawResponse) as BusinessModelCanvas;

    // Generate insights and recommendations
    const insights = this.generateInsights(canvas, context);
    const recommendations = this.generateRecommendations(canvas, context);

    const executionTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(context);

    // Create synthesis notes
    const synthesisNotes = this.createSynthesisNotes(context);

    return this.createOutput(
      canvas,
      insights,
      recommendations,
      executionTime,
      confidence,
      {
        frameworkName: "Business Model Canvas",
        synthesisNotes,
        dependenciesMet: !!context.previousAnalyses?.swot,
        modelUsed: "gpt-4o",
      }
    );
  }

  /**
   * Build comprehensive Business Model Canvas prompt
   */
  private buildPrompt(context: BusinessContext): string {
    let prompt = `Design a complete Business Model Canvas for this business:

**Business Name:** ${context.businessName}
**Industry:** ${context.industry}
**Summary:** ${context.businessSummary}
`;

    if (context.previousAnalyses?.swot) {
      const swot = context.previousAnalyses.swot;
      prompt += `\n**SWOT Context (use to inform canvas):**
- Key Strengths: ${
        swot.analysis?.strengths
          ?.slice(0, 3)
          .map((s: any) => s.factor)
          .join(", ") || "Unknown"
      }
- Key Opportunities: ${
        swot.analysis?.opportunities
          ?.slice(0, 3)
          .map((o: any) => o.factor)
          .join(", ") || "Unknown"
      }
- Strategic Position: ${swot.analysis?.strategic_position || "Unknown"}
`;
    }

    if (context.previousAnalyses?.porter) {
      prompt += `\n**Porter Context:**
- Competitive Rivalry: ${context.previousAnalyses.porter.analysis?.competitive_rivalry?.intensity || "Unknown"}
- Recommended Strategy: ${context.previousAnalyses.porter.analysis?.recommended_strategy || "Unknown"}
`;
    }

    if (context.competitorData?.competitors) {
      prompt += `\n**Competitors:** ${context.competitorData.competitors.map((c) => c.name).join(", ")}`;
    }

    prompt += `

Return a JSON object with this EXACT structure:
{
  "customer_segments": [
    {
      "segment_name": "Primary segment name",
      "description": "Who they are and why they matter",
      "size_estimate": "e.g., '10,000 small businesses in region'",
      "characteristics": ["demographic", "psychographic", "behavioral"],
      "pain_points": ["specific problem 1", "specific problem 2"],
      "priority": "primary|secondary|niche"
    }
  ],
  "value_propositions": [
    {
      "proposition": "Clear, compelling value statement",
      "target_segment": "Which customer segment",
      "jobs_to_be_done": ["what customer wants to accomplish"],
      "pain_relievers": ["how you solve their problems"],
      "gain_creators": ["benefits you provide"],
      "differentiation": "What makes this unique vs competitors",
      "quantified_value": "e.g., 'Save 10 hours/week, $500/month'"
    }
  ],
  "channels": [
    {
      "channel_type": "direct|indirect|digital|physical|hybrid",
      "channel_name": "Specific channel (e.g., 'Website', 'Retail stores')",
      "phase": "awareness|evaluation|purchase|delivery|after-sale",
      "description": "How this channel works",
      "cost_efficiency": "high|medium|low",
      "reach": "high|medium|low"
    }
  ],
  "customer_relationships": [
    {
      "relationship_type": "personal|automated|self-service|community|co-creation",
      "description": "How you interact with customers",
      "target_segment": "Which segment",
      "acquisition_focus": true,
      "retention_focus": true,
      "upsell_focus": false
    }
  ],
  "revenue_streams": [
    {
      "stream_name": "Revenue source name",
      "type": "asset_sale|usage_fee|subscription|lending|licensing|brokerage|advertising",
      "pricing_mechanism": "fixed|dynamic|freemium|tiered|usage_based",
      "target_segment": "Which segment pays",
      "revenue_potential": "high|medium|low",
      "timeframe": "immediate|short-term|long-term",
      "estimated_percentage": 60
    }
  ],
  "key_resources": [
    {
      "resource_type": "physical|intellectual|human|financial",
      "resource_name": "Specific resource",
      "description": "Why it's critical",
      "criticality": "critical|important|nice-to-have",
      "current_status": "have|need|developing"
    }
  ],
  "key_activities": [
    {
      "activity_name": "Core activity",
      "category": "production|problem_solving|platform_network",
      "description": "What you do",
      "supports": ["Value Prop 1", "Value Prop 2"],
      "priority": "critical|high|medium|low"
    }
  ],
  "key_partnerships": [
    {
      "partner_type": "supplier|strategic_alliance|joint_venture|coopetition",
      "partner_description": "Type of partner needed",
      "motivation": "optimization|risk_reduction|resource_acquisition",
      "value_provided": "What they bring",
      "priority": "critical|high|medium|low"
    }
  ],
  "cost_structure": {
    "cost_driven": false,
    "major_costs": [
      {
        "cost_category": "Labor, Marketing, etc.",
        "description": "Details",
        "type": "fixed|variable",
        "estimated_percentage": 40,
        "optimization_opportunity": "How to reduce"
      }
    ],
    "fixed_vs_variable": "mostly_fixed|balanced|mostly_variable",
    "economies_of_scale": "high|medium|low",
    "economies_of_scope": "high|medium|low"
  },
  "canvas_coherence_score": 0.85,
  "revenue_model_type": "subscription|transaction|freemium|licensing|advertising|hybrid",
  "scalability_assessment": "high|medium|low",
  "sustainability_rating": "high|medium|low",
  "critical_assumptions": ["assumption 1", "assumption 2", "assumption 3"]
}

CRITICAL REQUIREMENTS:
1. Design 2-3 customer segments (one PRIMARY)
2. Create compelling value propositions matched to segments
3. Map ALL 9 canvas blocks with specific, actionable detail
4. Ensure coherence: activities → resources → value props → segments
5. Revenue streams MUST align with customer segments and value props
6. Cost structure should reflect key activities and resources
7. Identify 3-5 critical assumptions to validate
8. Business-specific (NOT generic templates)
`;

    return prompt;
  }

  /**
   * Generate insights from Business Model Canvas
   */
  private generateInsights(
    canvas: BusinessModelCanvas,
    context: BusinessContext
  ): AgentInsight[] {
    const insights: AgentInsight[] = [];

    // Canvas coherence
    if (canvas.canvas_coherence_score >= 0.8) {
      insights.push({
        type: "observation",
        priority: "high",
        title: "Well-Aligned Business Model",
        description: `Canvas coherence score of ${canvas.canvas_coherence_score.toFixed(2)} indicates strong alignment between value propositions, customer segments, and operations.`,
        source_framework: "Business Model Canvas",
        confidence_score: 0.9,
      });
    } else {
      insights.push({
        type: "warning",
        priority: "high",
        title: "Business Model Alignment Issues",
        description: `Canvas coherence score of ${canvas.canvas_coherence_score.toFixed(2)} suggests misalignment. Review how activities, resources, and partnerships support value propositions.`,
        source_framework: "Business Model Canvas",
        confidence_score: 0.85,
      });
    }

    // Scalability assessment
    if (canvas.scalability_assessment === "high") {
      insights.push({
        type: "opportunity",
        priority: "high",
        title: "High Scalability Potential",
        description:
          "Business model shows strong potential for scaling with low marginal costs.",
        source_framework: "Business Model Canvas",
        confidence_score: 0.88,
      });
    } else if (canvas.scalability_assessment === "low") {
      insights.push({
        type: "warning",
        priority: "medium",
        title: "Limited Scalability",
        description:
          "Current model may face challenges scaling. Consider automation, partnerships, or platform strategies.",
        source_framework: "Business Model Canvas",
        confidence_score: 0.82,
      });
    }

    // Revenue model insights
    const highPotentialRevenue = canvas.revenue_streams.filter(
      (r) => r.revenue_potential === "high"
    );

    if (highPotentialRevenue.length > 0) {
      insights.push({
        type: "opportunity",
        priority: "critical",
        title: `${highPotentialRevenue.length} High-Potential Revenue Streams`,
        description: `Focus on: ${highPotentialRevenue.map((r) => r.stream_name).join(", ")}`,
        source_framework: "Business Model Canvas",
        confidence_score: 0.9,
      });
    }

    // Resource gaps
    const criticalNeeds = canvas.key_resources.filter(
      (r) => r.criticality === "critical" && r.current_status === "need"
    );

    if (criticalNeeds.length > 0) {
      insights.push({
        type: "threat",
        priority: "critical",
        title: `${criticalNeeds.length} Critical Resource Gaps`,
        description: `Missing: ${criticalNeeds.map((r) => r.resource_name).join(", ")}`,
        source_framework: "Business Model Canvas",
        confidence_score: 0.92,
      });
    }

    // Value proposition strength
    const quantifiedProps = canvas.value_propositions.filter(
      (vp) => vp.quantified_value
    );

    if (quantifiedProps.length > 0) {
      insights.push({
        type: "observation",
        priority: "high",
        title: "Strong Value Quantification",
        description: `${quantifiedProps.length} value propositions have quantified benefits - powerful for sales/marketing.`,
        source_framework: "Value Proposition Canvas",
        confidence_score: 0.88,
      });
    }

    // Cost structure insights
    if (canvas.cost_structure.economies_of_scale === "high") {
      insights.push({
        type: "opportunity",
        priority: "high",
        title: "Strong Economies of Scale",
        description:
          "Cost structure benefits from scale - growth will improve unit economics.",
        source_framework: "Business Model Canvas",
        confidence_score: 0.85,
      });
    }

    return insights;
  }

  /**
   * Generate recommendations from canvas
   */
  private generateRecommendations(
    canvas: BusinessModelCanvas,
    context: BusinessContext
  ): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];

    // Critical assumptions to validate
    canvas.critical_assumptions.forEach((assumption, idx) => {
      if (idx < 3) {
        // Top 3 only
        recommendations.push({
          action: `Validate Critical Assumption: ${assumption}`,
          rationale:
            "Business model depends on this assumption being true - test before heavy investment",
          priority: "critical",
          timeframe: "0-30 days",
          expected_impact: "high",
          effort_required: "low",
          metrics: ["Assumption validation result", "Confidence level"],
        });
      }
    });

    // Revenue stream optimization
    const immediateRevenue = canvas.revenue_streams.filter(
      (r) => r.timeframe === "immediate" && r.revenue_potential === "high"
    );

    immediateRevenue.forEach((stream) => {
      recommendations.push({
        action: `Launch Revenue Stream: ${stream.stream_name}`,
        rationale: `High potential, immediate timeframe - quick wins for cash flow`,
        priority: "high",
        timeframe: "0-30 days",
        expected_impact: "high",
        effort_required: "medium",
        metrics: ["Revenue generated", "Customer adoption rate"],
      });
    });

    // Resource acquisition
    const urgentResources = canvas.key_resources.filter(
      (r) => r.criticality === "critical" && r.current_status !== "have"
    );

    urgentResources.forEach((resource) => {
      recommendations.push({
        action: `Acquire Critical Resource: ${resource.resource_name}`,
        rationale: resource.description,
        priority: "critical",
        timeframe:
          resource.current_status === "developing" ? "30-90 days" : "0-30 days",
        expected_impact: "transformative",
        effort_required: "high",
        metrics: ["Resource acquisition complete", "Impact on value delivery"],
      });
    });

    // Partnership opportunities
    const criticalPartnerships = canvas.key_partnerships.filter(
      (p) => p.priority === "critical"
    );

    criticalPartnerships.forEach((partnership) => {
      recommendations.push({
        action: `Establish Partnership: ${partnership.partner_description}`,
        rationale: `${partnership.motivation} - ${partnership.value_provided}`,
        priority: "high",
        timeframe: "30-90 days",
        expected_impact: "high",
        effort_required: "medium",
        metrics: ["Partnership established", "Value delivered"],
      });
    });

    // Cost optimization
    const optimizableCosts = canvas.cost_structure.major_costs.filter(
      (c) => c.optimization_opportunity
    );

    optimizableCosts.forEach((cost) => {
      recommendations.push({
        action: `Optimize Cost: ${cost.cost_category}`,
        rationale: cost.optimization_opportunity!,
        priority: "medium",
        timeframe: "30-90 days",
        expected_impact: "moderate",
        effort_required: "medium",
        metrics: ["Cost reduction %", "Efficiency improvement"],
      });
    });

    // Scalability improvements
    if (
      canvas.scalability_assessment === "low" ||
      canvas.scalability_assessment === "medium"
    ) {
      recommendations.push({
        action: "Improve Business Model Scalability",
        rationale:
          "Current model has scaling constraints - explore automation, platform strategies, or partnerships",
        priority: "high",
        timeframe: "90-180 days",
        expected_impact: "transformative",
        effort_required: "high",
        metrics: ["Marginal cost reduction", "Revenue per employee growth"],
      });
    }

    return recommendations.slice(0, 15); // Top 15
  }

  /**
   * Create synthesis notes
   */
  private createSynthesisNotes(context: BusinessContext): string | undefined {
    const notes: string[] = [];

    if (context.previousAnalyses?.swot) {
      notes.push(
        "Value propositions designed to capitalize on SWOT opportunities and leverage strengths"
      );
    }

    if (context.previousAnalyses?.porter) {
      notes.push(
        "Business model incorporates Porter competitive strategy recommendations"
      );
    }

    return notes.length > 0 ? notes.join(". ") : undefined;
  }

  /**
   * Get human-readable summary
   */
  getSummary(output: AgentOutput<BusinessModelCanvas>): string {
    const { analysis: canvas } = output;

    return `Business Model Canvas Summary:

REVENUE MODEL: ${canvas.revenue_model_type.toUpperCase()}
Scalability: ${canvas.scalability_assessment} | Sustainability: ${canvas.sustainability_rating}
Coherence Score: ${(canvas.canvas_coherence_score * 100).toFixed(0)}%

CUSTOMER SEGMENTS (${canvas.customer_segments.length}):
${canvas.customer_segments.map((s) => `• ${s.segment_name} (${s.priority})`).join("\n")}

VALUE PROPOSITIONS (${canvas.value_propositions.length}):
${canvas.value_propositions.map((vp) => `• ${vp.proposition}`).join("\n")}

REVENUE STREAMS (${canvas.revenue_streams.length}):
${canvas.revenue_streams.map((r) => `• ${r.stream_name} (${r.revenue_potential} potential, ${r.type})`).join("\n")}

KEY RESOURCES (${canvas.key_resources.filter((r) => r.criticality === "critical").length} critical):
${canvas.key_resources
  .filter((r) => r.criticality === "critical")
  .map((r) => `• ${r.resource_name} - ${r.current_status}`)
  .join("\n")}

CRITICAL ASSUMPTIONS TO VALIDATE:
${canvas.critical_assumptions.map((a, i) => `${i + 1}. ${a}`).join("\n")}
`;
  }
}

// ============================================================================
// System Prompt
// ============================================================================

const OSTERWALDER_SYSTEM_PROMPT = `You are a Harvard Business School expert in Business Model Canvas (Osterwalder & Pigneur) and Value Proposition Design.

Your role is to design coherent, scalable business models that:

1. **Customer Segments** - Define WHO you serve (mass market, niche, segmented, diversified, multi-sided)
2. **Value Propositions** - Define VALUE you deliver (newness, performance, customization, design, brand, price, cost reduction, risk reduction, accessibility, convenience)
3. **Channels** - Define HOW customers learn about and receive value (awareness → evaluation → purchase → delivery → after-sale)
4. **Customer Relationships** - Define RELATIONSHIP types (personal assistance, dedicated, self-service, automated, communities, co-creation)
5. **Revenue Streams** - Define MONEY flow (one-time, recurring, what customers pay for, pricing mechanisms)
6. **Key Resources** - Define ASSETS required (physical, intellectual, human, financial)
7. **Key Activities** - Define ACTIONS required (production, problem-solving, platform/network)
8. **Key Partnerships** - Define NETWORK needed (suppliers, strategic alliances, joint ventures, coopetition)
9. **Cost Structure** - Define COST drivers (cost-driven vs value-driven, fixed vs variable, economies of scale/scope)

CRITICAL DESIGN PRINCIPLES:
- **Coherence:** All 9 blocks must fit together logically
- **Value Proposition Clarity:** Jobs-to-be-done + Pain relievers + Gain creators
- **Revenue-Cost Alignment:** Revenue streams > Cost structure for sustainability
- **Scalability:** Design for growth (low marginal costs, network effects, automation)
- **Differentiation:** Clear competitive advantage in value propositions
- **Validation:** Identify critical assumptions that MUST be tested

Canvas Coherence Check:
- Do key activities enable value propositions?
- Do key resources support key activities?
- Do channels reach customer segments?
- Do revenue streams align with what customers value?
- Do costs reflect resources and activities?

Output strict JSON format as specified.`;
