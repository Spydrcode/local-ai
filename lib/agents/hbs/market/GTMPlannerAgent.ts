/**
 * GTMPlannerAgent - Go-To-Market Strategy Builder
 *
 * Harvard Framework: Market Entry & Distribution Strategy
 *
 * Generates comprehensive go-to-market plans including channel strategy,
 * pricing models, market entry tactics, and customer acquisition playbooks.
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
// GTM Strategy Types
// ============================================================================

export interface GTMStrategy {
  // Market Entry
  entry_strategy: MarketEntryStrategy;
  beachhead_market: BeachheadMarket;
  expansion_plan: ExpansionPlan[];

  // Distribution & Channels
  channel_strategy: ChannelStrategy;
  distribution_model: "direct" | "indirect" | "hybrid";
  sales_model: "self-service" | "transactional" | "enterprise" | "hybrid";

  // Pricing
  pricing_strategy: PricingStrategy;

  // Customer Acquisition
  acquisition_strategy: AcquisitionStrategy;
  sales_process: SalesProcess;

  // Launch
  launch_plan: LaunchPlan;
  success_metrics: SuccessMetric[];

  // Risk & Validation
  critical_risks: Risk[];
  validation_milestones: Milestone[];

  // Meta
  time_to_market: string;
  estimated_cac: string; // Customer Acquisition Cost
  estimated_ltv: string; // Lifetime Value
  gtm_fit_score: number; // 0-1, how well GTM fits business model
}

export interface MarketEntryStrategy {
  approach:
    | "land_and_expand"
    | "bowling_pin"
    | "big_bang"
    | "segmented_rollout";
  rationale: string;
  competitive_positioning:
    | "market_leader"
    | "fast_follower"
    | "niche_player"
    | "disruptor";
  entry_barriers: EntryBarrier[];
  competitive_advantages: string[];
}

export interface BeachheadMarket {
  segment_name: string;
  description: string;
  size_estimate: string;
  why_beachhead: string; // Why start here
  validation_criteria: string[];
  success_indicators: string[];
}

export interface ExpansionPlan {
  phase: number;
  target_segment: string;
  timeframe: string;
  dependencies: string[]; // What must happen first
  strategy: string;
  expected_outcome: string;
}

export interface ChannelStrategy {
  primary_channels: Channel[];
  channel_mix: string; // e.g., "70% digital, 20% direct sales, 10% partners"
  channel_conflicts: string[]; // Potential conflicts to manage
  channel_enablement: string[]; // What channels need to succeed
}

export interface Channel {
  channel_name: string;
  channel_type:
    | "direct_sales"
    | "inside_sales"
    | "partners"
    | "online"
    | "retail"
    | "marketplace";
  target_segment: string;
  customer_journey_stage:
    | "awareness"
    | "consideration"
    | "decision"
    | "retention";
  investment_required: "high" | "medium" | "low";
  time_to_productivity: string;
  expected_contribution: string; // % of revenue
}

export interface PricingStrategy {
  pricing_model:
    | "value_based"
    | "competitive"
    | "cost_plus"
    | "penetration"
    | "skimming"
    | "freemium";
  price_point: string;
  pricing_tiers: PricingTier[];
  discounting_strategy: string;
  rationale: string;
  price_elasticity: "high" | "medium" | "low";
  psychological_anchoring?: string;
}

export interface PricingTier {
  tier_name: string;
  target_customer: string;
  price: string;
  features: string[];
  positioning: string;
}

export interface AcquisitionStrategy {
  primary_tactics: AcquisitionTactic[];
  funnel_stages: FunnelStage[];
  messaging_framework: MessagingFramework;
  content_strategy: string;
  conversion_optimization: string[];
}

export interface AcquisitionTactic {
  tactic_name: string;
  channel: string;
  target_stage: "awareness" | "consideration" | "decision";
  investment_level: "high" | "medium" | "low";
  expected_roi: string;
  timeframe: string;
  success_metrics: string[];
}

export interface FunnelStage {
  stage:
    | "awareness"
    | "interest"
    | "consideration"
    | "intent"
    | "purchase"
    | "retention";
  tactics: string[];
  conversion_rate_target: string;
  bottlenecks: string[];
  optimization_opportunities: string[];
}

export interface MessagingFramework {
  core_message: string;
  value_props_prioritized: string[];
  positioning_statement: string;
  elevator_pitch: string;
  objection_handling: ObjectionHandler[];
}

export interface ObjectionHandler {
  objection: string;
  response: string;
  proof_points: string[];
}

export interface SalesProcess {
  sales_cycle_length: string;
  process_steps: ProcessStep[];
  qualification_criteria: string[];
  decision_makers: string[];
  sales_materials: string[];
}

export interface ProcessStep {
  step: string;
  owner: string;
  duration: string;
  success_criteria: string;
  tools_needed: string[];
}

export interface LaunchPlan {
  launch_type: "soft_launch" | "full_launch" | "beta" | "rolling_launch";
  launch_timeline: LaunchPhase[];
  launch_tactics: string[];
  success_criteria: string[];
  risk_mitigation: string[];
}

export interface LaunchPhase {
  phase_name: string;
  timeframe: string;
  objectives: string[];
  deliverables: string[];
  success_metrics: string[];
}

export interface SuccessMetric {
  metric_name: string;
  category: "acquisition" | "activation" | "revenue" | "retention" | "referral";
  target_value: string;
  measurement_frequency: "daily" | "weekly" | "monthly" | "quarterly";
  owner: string;
}

export interface Risk {
  risk_description: string;
  impact: "critical" | "high" | "medium" | "low";
  probability: "high" | "medium" | "low";
  mitigation_strategy: string;
}

export interface Milestone {
  milestone: string;
  validation_criteria: string;
  timeframe: string;
  go_no_go_decision: boolean;
}

export interface EntryBarrier {
  barrier_type:
    | "regulatory"
    | "capital"
    | "technology"
    | "customer_switching"
    | "brand"
    | "network_effects";
  description: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

// ============================================================================
// GTM Planner Agent
// ============================================================================

export class GTMPlannerAgent extends HBSAgent<GTMStrategy> {
  readonly metadata: AgentMetadata = {
    name: "GTMPlannerAgent",
    discipline: "marketing",
    frameworks: [
      "Market Entry Strategy",
      "Channel Strategy",
      "Customer Acquisition",
    ],
    description:
      "Go-to-market planning with distribution, pricing, and acquisition strategies",
    dependencies: ["OsterwalderAgent"], // BMC informs GTM
    priority: "critical",
    requires_competitor_data: true,
    requires_financial_data: false,
    can_run_standalone: false, // Needs business model context
  };

  async analyze(context: BusinessContext): Promise<AgentOutput<GTMStrategy>> {
    const startTime = Date.now();

    console.log(
      `[GTMPlannerAgent] Building GTM strategy for ${context.businessName}`
    );

    // Build comprehensive prompt
    const prompt = this.buildPrompt(context);

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: GTM_SYSTEM_PROMPT,
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
    const strategy = JSON.parse(rawResponse) as GTMStrategy;

    // Generate insights and recommendations
    const insights = this.generateInsights(strategy, context);
    const recommendations = this.generateRecommendations(strategy, context);

    const executionTime = Date.now() - startTime;
    const confidence = this.calculateConfidence(context);

    const synthesisNotes = this.createSynthesisNotes(context);

    return this.createOutput(
      strategy,
      insights,
      recommendations,
      executionTime,
      confidence,
      {
        frameworkName: "Go-To-Market Strategy",
        synthesisNotes,
        dependenciesMet: !!context.previousAnalyses?.business_model_canvas,
        modelUsed: "gpt-4o",
      }
    );
  }

  /**
   * Build GTM strategy prompt
   */
  private buildPrompt(context: BusinessContext): string {
    let prompt = `Design a comprehensive Go-To-Market strategy for this business:

**Business Name:** ${context.businessName}
**Industry:** ${context.industry}
**Summary:** ${context.businessSummary}
`;

    if (context.previousAnalyses?.business_model_canvas) {
      const bmc = context.previousAnalyses.business_model_canvas;
      prompt += `\n**Business Model Context:**
- Primary Customer Segment: ${bmc.analysis?.customer_segments?.[0]?.segment_name || "Unknown"}
- Value Proposition: ${bmc.analysis?.value_propositions?.[0]?.proposition || "Unknown"}
- Revenue Model: ${bmc.analysis?.revenue_model_type || "Unknown"}
- Channels: ${bmc.analysis?.channels?.map((c: any) => c.channel_name).join(", ") || "Unknown"}
`;
    }

    if (context.competitorData?.competitors) {
      prompt += `\n**Competitive Landscape:**
Competitors: ${context.competitorData.competitors.map((c) => c.name).join(", ")}
`;
    }

    if (context.previousAnalyses?.porter) {
      prompt += `\n**Competitive Intensity:** ${context.previousAnalyses.porter.analysis?.competitive_rivalry?.intensity || "Unknown"}`;
    }

    prompt += `

Return a JSON object following the GTMStrategy interface with this structure:

{
  "entry_strategy": {
    "approach": "land_and_expand|bowling_pin|big_bang|segmented_rollout",
    "rationale": "Why this approach",
    "competitive_positioning": "market_leader|fast_follower|niche_player|disruptor",
    "entry_barriers": [
      {
        "barrier_type": "regulatory|capital|technology|customer_switching|brand|network_effects",
        "description": "Barrier description",
        "severity": "high|medium|low",
        "mitigation": "How to overcome"
      }
    ],
    "competitive_advantages": ["advantage 1", "advantage 2"]
  },
  "beachhead_market": {
    "segment_name": "Most viable initial target",
    "description": "Who they are",
    "size_estimate": "TAM/SAM estimate",
    "why_beachhead": "Why start here (easiest to win, strategic value)",
    "validation_criteria": ["criterion 1", "criterion 2"],
    "success_indicators": ["indicator 1", "indicator 2"]
  },
  "expansion_plan": [
    {
      "phase": 1,
      "target_segment": "Next segment",
      "timeframe": "6-12 months",
      "dependencies": ["beachhead success", "product readiness"],
      "strategy": "How to win this segment",
      "expected_outcome": "Revenue/market share goal"
    }
  ],
  "channel_strategy": {
    "primary_channels": [
      {
        "channel_name": "Specific channel",
        "channel_type": "direct_sales|inside_sales|partners|online|retail|marketplace",
        "target_segment": "Which customers",
        "customer_journey_stage": "awareness|consideration|decision|retention",
        "investment_required": "high|medium|low",
        "time_to_productivity": "3 months",
        "expected_contribution": "40% of revenue"
      }
    ],
    "channel_mix": "70% online, 20% partners, 10% direct",
    "channel_conflicts": ["potential conflict 1"],
    "channel_enablement": ["enablement need 1"]
  },
  "distribution_model": "direct|indirect|hybrid",
  "sales_model": "self-service|transactional|enterprise|hybrid",
  "pricing_strategy": {
    "pricing_model": "value_based|competitive|cost_plus|penetration|skimming|freemium",
    "price_point": "$X per month/unit",
    "pricing_tiers": [
      {
        "tier_name": "Basic/Pro/Enterprise",
        "target_customer": "Who this is for",
        "price": "$X",
        "features": ["feature 1", "feature 2"],
        "positioning": "Good/Better/Best"
      }
    ],
    "discounting_strategy": "Annual prepay 20% off, volume discounts",
    "rationale": "Why this pricing",
    "price_elasticity": "high|medium|low",
    "psychological_anchoring": "e.g., '$99 vs $100'"
  },
  "acquisition_strategy": {
    "primary_tactics": [
      {
        "tactic_name": "Content marketing, PPC, etc.",
        "channel": "Google Ads, LinkedIn, etc.",
        "target_stage": "awareness|consideration|decision",
        "investment_level": "high|medium|low",
        "expected_roi": "3:1",
        "timeframe": "0-90 days",
        "success_metrics": ["CPL", "conversion rate"]
      }
    ],
    "funnel_stages": [
      {
        "stage": "awareness|interest|consideration|intent|purchase|retention",
        "tactics": ["tactic 1", "tactic 2"],
        "conversion_rate_target": "5%",
        "bottlenecks": ["bottleneck 1"],
        "optimization_opportunities": ["opportunity 1"]
      }
    ],
    "messaging_framework": {
      "core_message": "One sentence positioning",
      "value_props_prioritized": ["#1 value prop", "#2 value prop"],
      "positioning_statement": "For [target] who [need], we provide [solution] that [differentiation]",
      "elevator_pitch": "30-second pitch",
      "objection_handling": [
        {
          "objection": "Too expensive",
          "response": "ROI response",
          "proof_points": ["case study", "data point"]
        }
      ]
    },
    "content_strategy": "Blog, video, case studies, etc.",
    "conversion_optimization": ["optimization 1", "optimization 2"]
  },
  "sales_process": {
    "sales_cycle_length": "30-60 days",
    "process_steps": [
      {
        "step": "Prospecting, Discovery, Demo, Proposal, Close",
        "owner": "SDR, AE, etc.",
        "duration": "1 week",
        "success_criteria": "Metric to advance",
        "tools_needed": ["CRM", "Demo environment"]
      }
    ],
    "qualification_criteria": ["BANT criteria"],
    "decision_makers": ["Economic buyer", "Technical buyer"],
    "sales_materials": ["Deck", "ROI calculator", "Case studies"]
  },
  "launch_plan": {
    "launch_type": "soft_launch|full_launch|beta|rolling_launch",
    "launch_timeline": [
      {
        "phase_name": "Pre-launch, Launch, Post-launch",
        "timeframe": "Month 1",
        "objectives": ["objective 1"],
        "deliverables": ["deliverable 1"],
        "success_metrics": ["metric 1"]
      }
    ],
    "launch_tactics": ["tactic 1", "tactic 2"],
    "success_criteria": ["criterion 1"],
    "risk_mitigation": ["mitigation 1"]
  },
  "success_metrics": [
    {
      "metric_name": "CAC, LTV, MRR, etc.",
      "category": "acquisition|activation|revenue|retention|referral",
      "target_value": "$X or Y%",
      "measurement_frequency": "daily|weekly|monthly|quarterly",
      "owner": "Marketing/Sales/Product"
    }
  ],
  "critical_risks": [
    {
      "risk_description": "Risk description",
      "impact": "critical|high|medium|low",
      "probability": "high|medium|low",
      "mitigation_strategy": "How to mitigate"
    }
  ],
  "validation_milestones": [
    {
      "milestone": "First 10 customers",
      "validation_criteria": "Product-market fit signals",
      "timeframe": "Month 3",
      "go_no_go_decision": true
    }
  ],
  "time_to_market": "3-6 months",
  "estimated_cac": "$500",
  "estimated_ltv": "$3000",
  "gtm_fit_score": 0.85
}

CRITICAL REQUIREMENTS:
1. Design beachhead market (Geoffrey Moore Crossing the Chasm)
2. Expansion plan with 2-3 phases
3. Multi-channel strategy (not single channel)
4. Value-based pricing with rationale
5. Complete acquisition funnel (awareness → purchase)
6. Messaging framework with objection handling
7. Launch plan with validation milestones
8. Success metrics aligned with business model
9. Risk assessment with mitigation
10. Business-specific (NOT generic)
`;

    return prompt;
  }

  /**
   * Generate insights
   */
  private generateInsights(
    strategy: GTMStrategy,
    context: BusinessContext
  ): AgentInsight[] {
    const insights: AgentInsight[] = [];

    // GTM fit score
    if (strategy.gtm_fit_score >= 0.8) {
      insights.push({
        type: "observation",
        priority: "high",
        title: "Strong GTM-Business Model Alignment",
        description: `GTM fit score of ${strategy.gtm_fit_score.toFixed(2)} indicates excellent alignment with business model and market realities.`,
        source_framework: "Go-To-Market Strategy",
        confidence_score: 0.9,
      });
    }

    // LTV:CAC ratio
    const ltv = parseFloat(strategy.estimated_ltv.replace(/[^0-9.-]+/g, ""));
    const cac = parseFloat(strategy.estimated_cac.replace(/[^0-9.-]+/g, ""));

    if (!isNaN(ltv) && !isNaN(cac) && cac > 0) {
      const ratio = ltv / cac;
      if (ratio >= 3) {
        insights.push({
          type: "opportunity",
          priority: "high",
          title: `Excellent Unit Economics (${ratio.toFixed(1)}:1 LTV:CAC)`,
          description:
            "Customer lifetime value is 3x+ acquisition cost - strong foundation for growth.",
          source_framework: "Unit Economics",
          confidence_score: 0.88,
        });
      } else if (ratio < 2) {
        insights.push({
          type: "warning",
          priority: "critical",
          title: `Poor Unit Economics (${ratio.toFixed(1)}:1 LTV:CAC)`,
          description:
            "LTV:CAC ratio below 2:1 - business not sustainable at scale. Reduce CAC or increase LTV.",
          source_framework: "Unit Economics",
          confidence_score: 0.92,
        });
      }
    }

    // Channel diversity
    if (strategy.channel_strategy.primary_channels.length < 2) {
      insights.push({
        type: "warning",
        priority: "high",
        title: "Single Channel Risk",
        description:
          "Reliance on one channel creates vulnerability. Diversify customer acquisition.",
        source_framework: "Channel Strategy",
        confidence_score: 0.85,
      });
    }

    // Critical risks
    const criticalRisks = strategy.critical_risks.filter(
      (r) => r.impact === "critical" && r.probability !== "low"
    );

    if (criticalRisks.length > 0) {
      insights.push({
        type: "threat",
        priority: "critical",
        title: `${criticalRisks.length} Critical GTM Risks`,
        description: `High-impact risks: ${criticalRisks.map((r) => r.risk_description).join("; ")}`,
        source_framework: "Risk Assessment",
        confidence_score: 0.9,
      });
    }

    // Time to market
    if (
      strategy.time_to_market.includes("3") ||
      strategy.time_to_market.includes("4")
    ) {
      insights.push({
        type: "opportunity",
        priority: "high",
        title: "Fast Time to Market",
        description: `${strategy.time_to_market} timeline enables quick market validation and iteration.`,
        source_framework: "Launch Plan",
        confidence_score: 0.82,
      });
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    strategy: GTMStrategy,
    context: BusinessContext
  ): AgentRecommendation[] {
    const recommendations: AgentRecommendation[] = [];

    // Validation milestones
    const earlyMilestones = strategy.validation_milestones.filter(
      (m) => m.go_no_go_decision
    );

    earlyMilestones.forEach((milestone) => {
      recommendations.push({
        action: `Achieve Validation Milestone: ${milestone.milestone}`,
        rationale: `Go/no-go decision point - ${milestone.validation_criteria}`,
        priority: "critical",
        timeframe:
          milestone.timeframe.includes("Month 1") ||
          milestone.timeframe.includes("Month 2")
            ? "0-30 days"
            : "30-90 days",
        expected_impact: "transformative",
        effort_required: "high",
        metrics: [milestone.validation_criteria],
      });
    });

    // High-ROI acquisition tactics
    const highROITactics = strategy.acquisition_strategy.primary_tactics.filter(
      (t) => {
        const roi = parseFloat(t.expected_roi.split(":")[0]);
        return !isNaN(roi) && roi >= 3;
      }
    );

    highROITactics.forEach((tactic) => {
      const timeframe = tactic.timeframe.includes("90")
        ? "90-180 days"
        : tactic.timeframe.includes("30")
          ? "30-90 days"
          : "0-30 days";

      recommendations.push({
        action: `Launch High-ROI Tactic: ${tactic.tactic_name}`,
        rationale: `Expected ${tactic.expected_roi} ROI - prioritize for fastest customer acquisition`,
        priority: "high",
        timeframe: timeframe as "0-30 days" | "30-90 days" | "90-180 days",
        expected_impact: "high",
        effort_required: tactic.investment_level === "high" ? "high" : "medium",
        metrics: tactic.success_metrics,
      });
    });

    // Channel enablement
    strategy.channel_strategy.channel_enablement.forEach((enablement) => {
      recommendations.push({
        action: `Enable Channel: ${enablement}`,
        rationale: "Required for channel productivity and success",
        priority: "high",
        timeframe: "0-30 days",
        expected_impact: "high",
        effort_required: "medium",
        metrics: ["Channel activation rate", "Time to first deal"],
      });
    });

    // Risk mitigation
    const criticalRisks = strategy.critical_risks.filter(
      (r) => r.impact === "critical"
    );

    criticalRisks.forEach((risk) => {
      recommendations.push({
        action: `Mitigate Critical Risk: ${risk.risk_description}`,
        rationale: risk.mitigation_strategy,
        priority: "critical",
        timeframe: "0-30 days",
        expected_impact: "transformative",
        effort_required: "high",
        metrics: ["Risk level reduction", "Mitigation effectiveness"],
      });
    });

    // Beachhead market focus
    recommendations.push({
      action: `Focus on Beachhead Market: ${strategy.beachhead_market.segment_name}`,
      rationale: strategy.beachhead_market.why_beachhead,
      priority: "critical",
      timeframe: "0-30 days",
      expected_impact: "transformative",
      effort_required: "high",
      metrics: strategy.beachhead_market.success_indicators,
    });

    // Launch plan execution
    strategy.launch_plan.launch_timeline.forEach((phase, idx) => {
      if (idx < 2) {
        // First 2 phases
        recommendations.push({
          action: `Execute Launch Phase: ${phase.phase_name}`,
          rationale: phase.objectives.join("; "),
          priority: idx === 0 ? "critical" : "high",
          timeframe: phase.timeframe.includes("Month 1")
            ? "0-30 days"
            : "30-90 days",
          expected_impact: "high",
          effort_required: "high",
          metrics: phase.success_metrics,
        });
      }
    });

    return recommendations.slice(0, 15);
  }

  /**
   * Create synthesis notes
   */
  private createSynthesisNotes(context: BusinessContext): string | undefined {
    const notes: string[] = [];

    if (context.previousAnalyses?.business_model_canvas) {
      notes.push(
        "GTM strategy designed to execute Business Model Canvas channels and reach customer segments"
      );
    }

    if (context.previousAnalyses?.swot) {
      notes.push(
        "Market entry approach leverages SWOT opportunities and mitigates threats"
      );
    }

    return notes.length > 0 ? notes.join(". ") : undefined;
  }

  /**
   * Get human-readable summary
   */
  getSummary(output: AgentOutput<GTMStrategy>): string {
    const { analysis: gtm } = output;

    return `Go-To-Market Strategy Summary:

MARKET ENTRY: ${gtm.entry_strategy.approach} (${gtm.entry_strategy.competitive_positioning})
Time to Market: ${gtm.time_to_market}
GTM Fit Score: ${(gtm.gtm_fit_score * 100).toFixed(0)}%

BEACHHEAD MARKET: ${gtm.beachhead_market.segment_name}
${gtm.beachhead_market.why_beachhead}

UNIT ECONOMICS:
• Estimated CAC: ${gtm.estimated_cac}
• Estimated LTV: ${gtm.estimated_ltv}
• LTV:CAC Ratio: ${(parseFloat(gtm.estimated_ltv.replace(/[^0-9.-]+/g, "")) / parseFloat(gtm.estimated_cac.replace(/[^0-9.-]+/g, ""))).toFixed(1)}:1

DISTRIBUTION:
• Model: ${gtm.distribution_model}
• Sales: ${gtm.sales_model}
• Channels: ${gtm.channel_strategy.primary_channels.map((c) => c.channel_name).join(", ")}

PRICING:
• Model: ${gtm.pricing_strategy.pricing_model}
• Price Point: ${gtm.pricing_strategy.price_point}
• Tiers: ${gtm.pricing_strategy.pricing_tiers.length}

LAUNCH:
• Type: ${gtm.launch_plan.launch_type}
• Phases: ${gtm.launch_plan.launch_timeline.length}

TOP SUCCESS METRICS:
${gtm.success_metrics
  .slice(0, 5)
  .map((m) => `• ${m.metric_name}: ${m.target_value}`)
  .join("\n")}

CRITICAL RISKS (${gtm.critical_risks.filter((r) => r.impact === "critical").length}):
${gtm.critical_risks
  .filter((r) => r.impact === "critical")
  .map((r) => `• ${r.risk_description}`)
  .join("\n")}
`;
  }
}

// ============================================================================
// System Prompt
// ============================================================================

const GTM_SYSTEM_PROMPT = `You are a Harvard Business School expert in Go-To-Market strategy, market entry, and customer acquisition.

Your role is to design executable GTM strategies that:

**MARKET ENTRY FRAMEWORKS:**
1. **Beachhead Market** (Geoffrey Moore) - Win one segment completely before expanding
2. **Bowling Pin Strategy** - Knock down adjacent segments sequentially
3. **Land and Expand** - Start small, grow within accounts
4. **Big Bang** - Launch everywhere simultaneously (rare, high-risk)

**CHANNEL STRATEGY:**
- Direct (own sales force, inside sales)
- Indirect (partners, resellers, distributors)
- Digital (online, self-service, marketplace)
- Hybrid (combination for different segments/stages)

**PRICING MODELS:**
- Value-based (price to customer value)
- Competitive (match or undercut competition)
- Cost-plus (markup on costs)
- Penetration (low price to gain share)
- Skimming (high price for early adopters)
- Freemium (free tier + paid upgrades)

**CUSTOMER ACQUISITION:**
- Awareness → Interest → Consideration → Intent → Purchase → Retention
- Tactics: Content, SEO, PPC, Social, Partnerships, Events, PR, Referrals
- Conversion optimization at each funnel stage
- Messaging: Problem → Solution → Differentiation → Proof

**CRITICAL SUCCESS FACTORS:**
1. **Beachhead First** - Narrow focus before expansion
2. **Unit Economics** - LTV:CAC ratio > 3:1 for sustainability
3. **Channel Fit** - Channels match customer buying behavior
4. **Pricing Alignment** - Price reflects value and market position
5. **Validation Milestones** - Go/no-go decisions with data
6. **Risk Mitigation** - Identify and address critical risks

**METRICS (Pirate Metrics - AARRR):**
- Acquisition: CAC, CPL, Traffic
- Activation: Onboarding completion, Time to value
- Revenue: MRR, ARR, ACV
- Retention: Churn rate, NPS, Engagement
- Referral: Viral coefficient, K-factor

Output strict JSON format as specified. Be specific, actionable, and realistic.`;
