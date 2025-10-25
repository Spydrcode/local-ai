/**
 * HBSOrchestrator - Multi-agent coordination and synthesis
 *
 * Manages execution of multiple HBS agents, handles dependencies,
 * and synthesizes cross-agent insights.
 */

import type {
  AgentInsight,
  AgentOutput,
  AgentRecommendation,
  BusinessContext,
  HBSDiscipline,
  IHBSAgent,
} from "./HBSAgent";
import { crossReferenceRecommendations, mergeInsights } from "./HBSAgent";

// ============================================================================
// Orchestration Types
// ============================================================================

/**
 * Analysis scope for orchestrator
 */
export type AnalysisScope =
  | "strategy" // Strategy agents only (Porter, SWOT, BMC)
  | "full" // All available agents
  | "custom" // User-selected agents
  | "quick"; // Fast essential analysis

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  scope: AnalysisScope;
  selectedAgents?: string[]; // For 'custom' scope
  parallelExecution?: boolean; // Run independent agents in parallel
  timeoutMs?: number; // Max execution time per agent
  minConfidence?: number; // Skip agents below this confidence
}

/**
 * Execution plan for agent run
 */
interface ExecutionPlan {
  stages: AgentStage[];
  totalAgents: number;
  estimatedTimeMs: number;
}

/**
 * Stage of agent execution (for dependency management)
 */
interface AgentStage {
  stageNumber: number;
  agents: IHBSAgent[];
  dependencies: string[]; // Agents from previous stages
}

/**
 * Synthesized strategic analysis
 */
export interface StrategicSynthesis {
  // Summary
  executive_summary: string;
  confidence_score: number;

  // Cross-agent insights
  unified_insights: {
    opportunities: AgentInsight[];
    threats: AgentInsight[];
    strengths: AgentInsight[];
    weaknesses: AgentInsight[];
  };

  // Prioritized action plan
  action_plan: {
    immediate: AgentRecommendation[]; // 0-30 days
    short_term: AgentRecommendation[]; // 30-90 days
    medium_term: AgentRecommendation[]; // 90-180 days
    long_term: AgentRecommendation[]; // 6+ months
  };

  // Strategic themes
  themes: Array<{
    theme: string;
    description: string;
    supporting_agents: string[];
    priority: "critical" | "high" | "medium" | "low";
  }>;

  // Metrics to track
  success_metrics: Array<{
    metric: string;
    category: "financial" | "operational" | "market" | "customer";
    target?: string;
    timeframe?: string;
  }>;

  // Individual agent outputs
  agent_outputs: Record<string, AgentOutput>;

  // Metadata
  agents_executed: string[];
  total_execution_time_ms: number;
  timestamp: string;
}

// ============================================================================
// Orchestrator Class
// ============================================================================

export class HBSOrchestrator {
  private agents: Map<string, IHBSAgent> = new Map();

  constructor() {
    // Agents registered during initialization
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: IHBSAgent): void {
    this.agents.set(agent.metadata.name, agent);
    console.log(`[HBSOrchestrator] Registered agent: ${agent.metadata.name}`);
  }

  /**
   * Get all registered agents
   */
  getAgents(): IHBSAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): IHBSAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get agents by discipline
   */
  getAgentsByDiscipline(discipline: HBSDiscipline): IHBSAgent[] {
    return this.getAgents().filter((a) => a.metadata.discipline === discipline);
  }

  /**
   * Create execution plan based on dependencies
   */
  private createExecutionPlan(
    selectedAgents: IHBSAgent[],
    config: OrchestratorConfig
  ): ExecutionPlan {
    const stages: AgentStage[] = [];
    const processed = new Set<string>();
    let stageNumber = 0;

    // Group agents by dependencies
    while (processed.size < selectedAgents.length) {
      const currentStage: IHBSAgent[] = [];
      const currentDeps: string[] = [];

      for (const agent of selectedAgents) {
        if (processed.has(agent.metadata.name)) continue;

        // Check if all dependencies are met
        const deps = agent.metadata.dependencies || [];
        const depsMetInPrevious = deps.every((d) => processed.has(d));

        if (deps.length === 0 || depsMetInPrevious) {
          currentStage.push(agent);
          currentDeps.push(...deps);
          processed.add(agent.metadata.name);
        }
      }

      if (currentStage.length === 0) {
        // Circular dependency or unmet dependency
        console.warn(
          "[HBSOrchestrator] Cannot resolve dependencies for remaining agents"
        );
        break;
      }

      stages.push({
        stageNumber: stageNumber++,
        agents: currentStage,
        dependencies: [...new Set(currentDeps)],
      });
    }

    return {
      stages,
      totalAgents: processed.size,
      estimatedTimeMs: stages.length * 10000, // Rough estimate
    };
  }

  /**
   * Run strategy analysis (Porter, SWOT, BMC, GTM)
   */
  async runStrategyAnalysis(
    context: BusinessContext,
    config?: Partial<OrchestratorConfig>
  ): Promise<StrategicSynthesis> {
    const fullConfig: OrchestratorConfig = {
      scope: "strategy",
      parallelExecution: true,
      timeoutMs: 30000,
      ...config,
    };

    // Select strategy agents
    const strategyAgents = this.getAgentsByDiscipline("strategy");

    return this.executeAnalysis(context, strategyAgents, fullConfig);
  }

  /**
   * Run full HBS analysis (all 12 agents)
   */
  async runFullAnalysis(
    context: BusinessContext,
    config?: Partial<OrchestratorConfig>
  ): Promise<StrategicSynthesis> {
    const fullConfig: OrchestratorConfig = {
      scope: "full",
      parallelExecution: true,
      timeoutMs: 30000,
      ...config,
    };

    const allAgents = this.getAgents();

    return this.executeAnalysis(context, allAgents, fullConfig);
  }

  /**
   * Run custom agent selection
   */
  async runCustomAnalysis(
    context: BusinessContext,
    agentNames: string[],
    config?: Partial<OrchestratorConfig>
  ): Promise<StrategicSynthesis> {
    const fullConfig: OrchestratorConfig = {
      scope: "custom",
      selectedAgents: agentNames,
      parallelExecution: true,
      ...config,
    };

    const selectedAgents = agentNames
      .map((name) => this.agents.get(name))
      .filter((a): a is IHBSAgent => a !== undefined);

    return this.executeAnalysis(context, selectedAgents, fullConfig);
  }

  /**
   * Core execution logic
   */
  private async executeAnalysis(
    context: BusinessContext,
    agents: IHBSAgent[],
    config: OrchestratorConfig
  ): Promise<StrategicSynthesis> {
    const startTime = Date.now();
    const outputs: Record<string, AgentOutput> = {};

    // Create execution plan
    const plan = this.createExecutionPlan(agents, config);

    console.log(
      `[HBSOrchestrator] Execution plan: ${plan.stages.length} stages, ${plan.totalAgents} agents`
    );

    // Execute stages sequentially (agents within stage run in parallel if config allows)
    for (const stage of plan.stages) {
      console.log(
        `[HBSOrchestrator] Executing stage ${stage.stageNumber} (${stage.agents.length} agents)`
      );

      // Update context with previous outputs
      const enrichedContext: BusinessContext = {
        ...context,
        previousAnalyses: {
          ...context.previousAnalyses,
          ...outputs,
        },
      };

      // Run agents in this stage
      if (config.parallelExecution && stage.agents.length > 1) {
        // Parallel execution
        const results = await Promise.allSettled(
          stage.agents.map((agent) =>
            this.runAgent(agent, enrichedContext, config)
          )
        );

        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const agent = stage.agents[idx];
            outputs[agent.metadata.name] = result.value;
          } else {
            console.error(
              `[HBSOrchestrator] Agent ${stage.agents[idx].metadata.name} failed:`,
              result.reason
            );
          }
        });
      } else {
        // Sequential execution
        for (const agent of stage.agents) {
          try {
            const output = await this.runAgent(agent, enrichedContext, config);
            outputs[agent.metadata.name] = output;
          } catch (error) {
            console.error(
              `[HBSOrchestrator] Agent ${agent.metadata.name} failed:`,
              error
            );
          }
        }
      }
    }

    const totalExecutionTime = Date.now() - startTime;

    // Synthesize results
    const synthesis = this.synthesizeResults(outputs, totalExecutionTime);

    console.log(
      `[HBSOrchestrator] Analysis complete in ${totalExecutionTime}ms`
    );

    return synthesis;
  }

  /**
   * Run individual agent with timeout and validation
   */
  private async runAgent(
    agent: IHBSAgent,
    context: BusinessContext,
    config: OrchestratorConfig
  ): Promise<AgentOutput> {
    // Check if agent can run
    if (!agent.canRun(context)) {
      throw new Error(
        `Agent ${agent.metadata.name} cannot run - dependencies not met`
      );
    }

    // Execute with timeout
    const timeoutMs = config.timeoutMs || 30000;
    const output = await Promise.race([
      agent.analyze(context),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Agent execution timeout")),
          timeoutMs
        )
      ),
    ]);

    // Validate output
    if (!agent.validate(output)) {
      throw new Error(`Agent ${agent.metadata.name} produced invalid output`);
    }

    // Check confidence threshold
    if (
      config.minConfidence &&
      output.confidence_score < config.minConfidence
    ) {
      console.warn(
        `[HBSOrchestrator] Agent ${agent.metadata.name} confidence (${output.confidence_score}) below threshold`
      );
    }

    return output;
  }

  /**
   * Synthesize outputs from multiple agents
   */
  private synthesizeResults(
    outputs: Record<string, AgentOutput>,
    executionTimeMs: number
  ): StrategicSynthesis {
    const allInsights = Object.values(outputs).map((o) => o.insights);
    const allRecommendations = Object.values(outputs).flatMap(
      (o) => o.recommendations
    );

    // Merge and categorize insights
    const mergedInsights = mergeInsights(allInsights);
    const categorized = {
      opportunities: mergedInsights.filter((i) => i.type === "opportunity"),
      threats: mergedInsights.filter(
        (i) => i.type === "threat" || i.type === "warning"
      ),
      strengths: mergedInsights.filter(
        (i) => i.type === "observation" && i.priority === "high"
      ),
      weaknesses: mergedInsights.filter(
        (i) => i.type === "observation" && i.priority === "medium"
      ),
    };

    // Cross-reference and prioritize recommendations
    const crossReferenced = crossReferenceRecommendations(allRecommendations);
    const actionPlan = {
      immediate: crossReferenced.filter((r) => r.timeframe === "0-30 days"),
      short_term: crossReferenced.filter((r) => r.timeframe === "30-90 days"),
      medium_term: crossReferenced.filter((r) => r.timeframe === "90-180 days"),
      long_term: crossReferenced.filter(
        (r) => r.timeframe === "6-12 months" || r.timeframe === "1+ years"
      ),
    };

    // Identify strategic themes
    const themes = this.identifyThemes(outputs);

    // Extract success metrics
    const metrics = this.extractMetrics(allRecommendations);

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      outputs,
      categorized,
      themes
    );

    // Calculate overall confidence
    const avgConfidence =
      Object.values(outputs).reduce((sum, o) => sum + o.confidence_score, 0) /
      Object.values(outputs).length;

    return {
      executive_summary: executiveSummary,
      confidence_score: avgConfidence,
      unified_insights: categorized,
      action_plan: actionPlan,
      themes,
      success_metrics: metrics,
      agent_outputs: outputs,
      agents_executed: Object.keys(outputs),
      total_execution_time_ms: executionTimeMs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Identify cross-cutting strategic themes
   */
  private identifyThemes(outputs: Record<string, AgentOutput>): Array<{
    theme: string;
    description: string;
    supporting_agents: string[];
    priority: "critical" | "high" | "medium" | "low";
  }> {
    // Simple theme detection based on common keywords in insights
    const themeKeywords: Record<string, string[]> = {
      "Digital Transformation": [
        "digital",
        "online",
        "technology",
        "automation",
      ],
      "Market Expansion": ["market", "expansion", "growth", "new customers"],
      "Operational Efficiency": ["efficiency", "cost", "process", "lean"],
      "Customer Experience": [
        "customer",
        "experience",
        "satisfaction",
        "retention",
      ],
      Innovation: [
        "innovation",
        "new product",
        "differentiation",
        "disruption",
      ],
    };

    const themes: Array<{
      theme: string;
      description: string;
      supporting_agents: string[];
      priority: "critical" | "high" | "medium" | "low";
    }> = [];

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const supportingAgents: string[] = [];
      let mentions = 0;

      for (const [agentName, output] of Object.entries(outputs)) {
        const text = JSON.stringify(output.insights).toLowerCase();
        const hasKeyword = keywords.some((kw) => text.includes(kw));
        if (hasKeyword) {
          supportingAgents.push(agentName);
          mentions++;
        }
      }

      if (mentions >= 2) {
        themes.push({
          theme,
          description: `Multiple analyses suggest focusing on ${theme.toLowerCase()}`,
          supporting_agents: supportingAgents,
          priority: mentions >= 3 ? "high" : "medium",
        });
      }
    }

    return themes;
  }

  /**
   * Extract success metrics from recommendations
   */
  private extractMetrics(recommendations: AgentRecommendation[]): Array<{
    metric: string;
    category: "financial" | "operational" | "market" | "customer";
    target?: string;
    timeframe?: string;
  }> {
    const metrics: Set<string> = new Set();

    for (const rec of recommendations) {
      if (rec.metrics) {
        rec.metrics.forEach((m) => metrics.add(m));
      }
    }

    return Array.from(metrics).map((metric) => ({
      metric,
      category: this.categorizeMetric(metric),
      timeframe: "90 days",
    }));
  }

  /**
   * Categorize a metric
   */
  private categorizeMetric(
    metric: string
  ): "financial" | "operational" | "market" | "customer" {
    const lower = metric.toLowerCase();
    if (
      lower.includes("revenue") ||
      lower.includes("profit") ||
      lower.includes("cost")
    ) {
      return "financial";
    }
    if (
      lower.includes("customer") ||
      lower.includes("satisfaction") ||
      lower.includes("retention")
    ) {
      return "customer";
    }
    if (
      lower.includes("market") ||
      lower.includes("share") ||
      lower.includes("growth")
    ) {
      return "market";
    }
    return "operational";
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    outputs: Record<string, AgentOutput>,
    insights: StrategicSynthesis["unified_insights"],
    themes: StrategicSynthesis["themes"]
  ): string {
    const agentCount = Object.keys(outputs).length;
    const oppCount = insights.opportunities.length;
    const threatCount = insights.threats.length;

    let summary = `Strategic analysis completed using ${agentCount} specialized frameworks. `;

    if (oppCount > 0) {
      summary += `Identified ${oppCount} growth opportunities `;
    }

    if (threatCount > 0) {
      summary += `and ${threatCount} areas requiring attention. `;
    }

    if (themes.length > 0) {
      summary += `Key strategic themes: ${themes.map((t) => t.theme).join(", ")}. `;
    }

    summary += `Confidence: ${Math.round((outputs[Object.keys(outputs)[0]]?.confidence_score || 0.8) * 100)}%.`;

    return summary;
  }
}

/**
 * Global orchestrator instance
 */
export const globalOrchestrator = new HBSOrchestrator();
