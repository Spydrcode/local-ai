/**
 * HBSAgent - Base interface for Harvard Business Intelligence agents
 *
 * All HBS agents implement this interface for consistency, orchestration,
 * and cross-agent synthesis capabilities.
 */

// Types will be defined when agents are integrated
type PorterAnalysis = any; // TODO: Import from PorterIntelligenceAgent
type EconomicIntelligence = any; // TODO: Import from EconomicIntelligenceAgent

// ============================================================================
// Core Types
// ============================================================================

/**
 * Business disciplines mapped to HBS curriculum
 */
export type HBSDiscipline =
  | "strategy" // Competitive positioning, business models
  | "innovation" // Disruptive innovation, blue ocean
  | "execution" // Performance management, operations
  | "finance" // Valuation, unit economics
  | "organization" // Structure, leadership
  | "marketing"; // Go-to-market, distribution

/**
 * Agent priority for orchestration
 */
export type AgentPriority = "critical" | "high" | "medium" | "low";

/**
 * Insight categorization
 */
export type InsightType =
  | "opportunity" // Growth potential
  | "threat" // Risk or vulnerability
  | "recommendation" // Specific action
  | "observation" // Neutral finding
  | "warning"; // Urgent concern

/**
 * Business context for agent analysis
 */
export interface BusinessContext {
  // Core business data
  demoId: string;
  businessName: string;
  industry: string;
  businessSummary: string;
  websiteUrl?: string;

  // Market context
  competitorData?: {
    competitors: Array<{ name: string; url?: string }>;
    marketSize?: string;
    growthRate?: string;
  };

  // Financial context
  financialData?: {
    revenue?: number;
    employees?: number;
    fundingStage?: string;
  };

  // Previous analyses for cross-agent synthesis
  previousAnalyses?: {
    porter?: PorterAnalysis;
    economic?: EconomicIntelligence;
    swot?: any;
    businessModel?: any;
    gtm?: any;
    [key: string]: any;
  };

  // Additional context
  userGoals?: string[];
  timeHorizon?: "90-day" | "1-year" | "3-year" | "5-year";
}

/**
 * Structured insight output
 */
export interface AgentInsight {
  type: InsightType;
  priority: AgentPriority;
  title: string;
  description: string;
  supporting_data?: Record<string, any>;
  confidence_score?: number; // 0-1
  source_framework?: string; // e.g., "Five Forces", "SWOT"
  related_insights?: string[]; // IDs of related insights from other agents
}

/**
 * Actionable recommendation
 */
export interface AgentRecommendation {
  action: string;
  rationale: string;
  priority: AgentPriority;
  timeframe:
    | "0-30 days"
    | "30-90 days"
    | "90-180 days"
    | "6-12 months"
    | "1+ years";
  expected_impact: "transformative" | "high" | "moderate" | "low";
  effort_required: "high" | "medium" | "low";
  dependencies?: string[]; // Other recommendations that should happen first
  metrics?: string[]; // How to measure success
}

/**
 * Agent execution output
 */
export interface AgentOutput<T = any> {
  agent_name: string;
  agent_discipline: HBSDiscipline;
  execution_time_ms: number;
  confidence_score: number; // Overall confidence in analysis (0-1)

  // Core analysis result (agent-specific structure)
  analysis: T;

  // Standardized insights and recommendations
  insights: AgentInsight[];
  recommendations: AgentRecommendation[];

  // Framework-specific data
  framework_name?: string;
  framework_version?: string;

  // Cross-agent synthesis data
  synthesis_notes?: string; // How this analysis relates to others
  dependencies_met?: boolean; // Whether required previous analyses exist

  // Metadata
  timestamp: string;
  model_used?: string;
}

/**
 * Agent metadata for orchestration
 */
export interface AgentMetadata {
  name: string;
  discipline: HBSDiscipline;
  frameworks: string[];
  description: string;

  // Orchestration
  dependencies?: string[]; // Names of agents that should run first
  priority: AgentPriority;

  // Capabilities
  requires_competitor_data?: boolean;
  requires_financial_data?: boolean;
  can_run_standalone?: boolean;
}

// ============================================================================
// Base Agent Interface
// ============================================================================

/**
 * Base interface all HBS agents must implement
 */
export interface IHBSAgent<TOutput = any> {
  /**
   * Agent metadata for orchestration and UI
   */
  readonly metadata: AgentMetadata;

  /**
   * Main analysis function
   * @param context Business context including previous analyses
   * @returns Structured agent output with insights and recommendations
   */
  analyze(context: BusinessContext): Promise<AgentOutput<TOutput>>;

  /**
   * Validate output structure and quality
   * @param output Agent output to validate
   * @returns True if valid, false otherwise
   */
  validate(output: AgentOutput<TOutput>): boolean;

  /**
   * Extract top N recommendations prioritized
   * @param output Agent output
   * @param topN Number of recommendations to return
   * @returns Prioritized recommendations
   */
  getTopRecommendations(
    output: AgentOutput<TOutput>,
    topN?: number
  ): AgentRecommendation[];

  /**
   * Get insights filtered by type and priority
   * @param output Agent output
   * @param filters Optional filters
   * @returns Filtered insights
   */
  getInsights(
    output: AgentOutput<TOutput>,
    filters?: {
      types?: InsightType[];
      minPriority?: AgentPriority;
    }
  ): AgentInsight[];

  /**
   * Check if agent can run with given context
   * @param context Business context
   * @returns True if all dependencies met
   */
  canRun(context: BusinessContext): boolean;

  /**
   * Get human-readable summary of analysis
   * @param output Agent output
   * @returns Plain text summary
   */
  getSummary(output: AgentOutput<TOutput>): string;
}

// ============================================================================
// Abstract Base Class
// ============================================================================

/**
 * Abstract base class providing common HBS agent functionality
 */
export abstract class HBSAgent<TOutput = any> implements IHBSAgent<TOutput> {
  abstract readonly metadata: AgentMetadata;

  /**
   * Subclasses implement the actual analysis logic
   */
  abstract analyze(context: BusinessContext): Promise<AgentOutput<TOutput>>;

  /**
   * Subclasses can override validation logic
   */
  validate(output: AgentOutput<TOutput>): boolean {
    // Basic structural validation
    if (!output.agent_name || !output.agent_discipline) {
      return false;
    }

    if (!output.analysis || typeof output.analysis !== "object") {
      return false;
    }

    if (
      !Array.isArray(output.insights) ||
      !Array.isArray(output.recommendations)
    ) {
      return false;
    }

    // Check confidence score
    if (output.confidence_score < 0 || output.confidence_score > 1) {
      return false;
    }

    return true;
  }

  /**
   * Get top N recommendations sorted by priority and impact
   */
  getTopRecommendations(
    output: AgentOutput<TOutput>,
    topN: number = 5
  ): AgentRecommendation[] {
    const priorityOrder: Record<AgentPriority, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const impactOrder: Record<string, number> = {
      transformative: 4,
      high: 3,
      moderate: 2,
      low: 1,
    };

    return output.recommendations
      .sort((a, b) => {
        // Sort by priority first
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Then by impact
        return impactOrder[b.expected_impact] - impactOrder[a.expected_impact];
      })
      .slice(0, topN);
  }

  /**
   * Get insights filtered by type and priority
   */
  getInsights(
    output: AgentOutput<TOutput>,
    filters?: {
      types?: InsightType[];
      minPriority?: AgentPriority;
    }
  ): AgentInsight[] {
    let insights = output.insights;

    // Filter by type
    if (filters?.types && filters.types.length > 0) {
      insights = insights.filter((i) => filters.types!.includes(i.type));
    }

    // Filter by priority
    if (filters?.minPriority) {
      const priorityOrder: Record<AgentPriority, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };

      const minLevel = priorityOrder[filters.minPriority];
      insights = insights.filter((i) => priorityOrder[i.priority] >= minLevel);
    }

    return insights;
  }

  /**
   * Check if agent can run with given context
   */
  canRun(context: BusinessContext): boolean {
    // Check required competitor data
    if (this.metadata.requires_competitor_data && !context.competitorData) {
      return false;
    }

    // Check required financial data
    if (this.metadata.requires_financial_data && !context.financialData) {
      return false;
    }

    // Check dependencies
    if (this.metadata.dependencies && context.previousAnalyses) {
      for (const dep of this.metadata.dependencies) {
        if (!context.previousAnalyses[dep]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get human-readable summary
   * Subclasses should override for framework-specific summaries
   */
  getSummary(output: AgentOutput<TOutput>): string {
    const topRecs = this.getTopRecommendations(output, 3);
    const criticalInsights = this.getInsights(output, {
      minPriority: "high",
    });

    let summary = `${this.metadata.name} Analysis Summary:\n\n`;

    if (criticalInsights.length > 0) {
      summary += `Key Insights (${criticalInsights.length}):\n`;
      criticalInsights.slice(0, 5).forEach((insight, i) => {
        summary += `${i + 1}. [${insight.type.toUpperCase()}] ${insight.title}\n`;
      });
      summary += "\n";
    }

    if (topRecs.length > 0) {
      summary += `Top Recommendations:\n`;
      topRecs.forEach((rec, i) => {
        summary += `${i + 1}. ${rec.action} (${rec.priority} priority, ${rec.timeframe})\n`;
      });
    }

    return summary;
  }

  /**
   * Helper: Create standardized output structure
   */
  protected createOutput<T>(
    analysis: T,
    insights: AgentInsight[],
    recommendations: AgentRecommendation[],
    executionTimeMs: number,
    confidenceScore: number = 0.85,
    options?: {
      synthesisNotes?: string;
      dependenciesMet?: boolean;
      frameworkName?: string;
      modelUsed?: string;
    }
  ): AgentOutput<T> {
    return {
      agent_name: this.metadata.name,
      agent_discipline: this.metadata.discipline,
      execution_time_ms: executionTimeMs,
      confidence_score: confidenceScore,
      analysis,
      insights,
      recommendations,
      framework_name: options?.frameworkName,
      synthesis_notes: options?.synthesisNotes,
      dependencies_met: options?.dependenciesMet ?? true,
      timestamp: new Date().toISOString(),
      model_used: options?.modelUsed ?? "gpt-4o",
    };
  }

  /**
   * Helper: Calculate confidence score based on data availability
   */
  protected calculateConfidence(context: BusinessContext): number {
    let confidence = 0.6; // Base confidence

    // Increase confidence with more data
    if (context.businessSummary?.length > 200) confidence += 0.1;
    if (
      context.competitorData?.competitors &&
      context.competitorData.competitors.length > 0
    )
      confidence += 0.1;
    if (context.financialData) confidence += 0.1;
    if (context.previousAnalyses?.porter) confidence += 0.05;
    if (context.previousAnalyses?.economic) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Priority comparison utility
 */
export function isPriorityHigherOrEqual(
  priority: AgentPriority,
  threshold: AgentPriority
): boolean {
  const order: Record<AgentPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return order[priority] >= order[threshold];
}

/**
 * Merge insights from multiple agents, removing duplicates
 */
export function mergeInsights(insightArrays: AgentInsight[][]): AgentInsight[] {
  const allInsights = insightArrays.flat();

  // Simple deduplication by title similarity
  const unique: AgentInsight[] = [];
  for (const insight of allInsights) {
    const isDuplicate = unique.some(
      (u) => u.title.toLowerCase() === insight.title.toLowerCase()
    );
    if (!isDuplicate) {
      unique.push(insight);
    }
  }

  return unique;
}

/**
 * Cross-reference recommendations from multiple agents
 */
export function crossReferenceRecommendations(
  recommendations: AgentRecommendation[]
): AgentRecommendation[] {
  // Group similar recommendations and increase priority
  const grouped = new Map<string, AgentRecommendation[]>();

  for (const rec of recommendations) {
    const key = rec.action.toLowerCase().slice(0, 50);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(rec);
  }

  // If multiple agents recommend the same thing, boost priority
  const enhanced: AgentRecommendation[] = [];
  for (const [_, recs] of grouped) {
    const primary = recs[0];
    if (recs.length > 1 && primary.priority !== "critical") {
      primary.priority = "high"; // Boost if multiple agents agree
      primary.rationale += ` (Confirmed by ${recs.length} analyses)`;
    }
    enhanced.push(primary);
  }

  return enhanced;
}
