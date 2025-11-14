/**
 * Intelligent Agent Router
 *
 * Analyzes requests and automatically:
 * 1. Selects optimal agent(s) for the task
 * 2. Determines execution strategy (parallel vs sequential)
 * 3. Manages multi-agent collaboration
 * 4. Handles fallbacks and error recovery
 *
 * This transforms static agent selection into dynamic, intelligent orchestration.
 */

import { AgentRegistry, type AgentResponse } from "../unified-agent-system";
import { createChatCompletion } from "../../openai";

export interface AgentTask {
  type: string; // "analysis", "content", "strategy", etc.
  description: string;
  priority: "high" | "medium" | "low";
  estimatedDuration: number; // seconds
  dependencies?: string[]; // Task IDs this depends on
}

export interface AgentPlan {
  primaryAgent: string;
  supportingAgents: string[];
  tasks: AgentTask[];
  executionStrategy: "sequential" | "parallel" | "hybrid";
  estimatedTotalDuration: number;
  confidence: number; // 0-1, how confident in this plan
}

export interface RoutingContext {
  toolId: string;
  input: Record<string, any>;
  intelligence?: any;
  userPreferences?: {
    speed?: "fast" | "balanced" | "thorough";
    depth?: "quick" | "standard" | "comprehensive";
  };
}

export interface ExecutionResult {
  plan: AgentPlan;
  results: Map<string, AgentResponse>;
  executionTime: number;
  errors?: Array<{ agent: string; error: string }>;
}

export class AgentRouter {
  /**
   * Analyze request and create optimal execution plan
   */
  async createPlan(context: RoutingContext): Promise<AgentPlan> {
    console.log(`[AgentRouter] Creating plan for tool: ${context.toolId}`);

    try {
      // Use LLM to analyze intent and requirements
      const analysis = await this.analyzeIntent(context);

      // Select agents based on analysis
      const agents = this.selectAgents(analysis, context);

      // Decompose into tasks
      const tasks = this.decomposeTasks(analysis, agents, context);

      // Determine execution strategy
      const strategy = this.determineStrategy(tasks, context);

      // Calculate estimates
      const estimatedDuration = this.estimateDuration(tasks, strategy);

      const plan: AgentPlan = {
        primaryAgent: agents.primary,
        supportingAgents: agents.supporting,
        tasks,
        executionStrategy: strategy,
        estimatedTotalDuration: estimatedDuration,
        confidence: analysis.confidence,
      };

      console.log(
        `[AgentRouter] Plan created: ${plan.tasks.length} tasks, ${plan.executionStrategy} execution, ~${plan.estimatedTotalDuration}s`
      );

      return plan;
    } catch (error) {
      console.error("[AgentRouter] Error creating plan:", error);
      // Fallback to simple plan
      return this.createFallbackPlan(context);
    }
  }

  /**
   * Execute a plan and return results
   */
  async executePlan(
    plan: AgentPlan,
    context: RoutingContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResponse>();
    const errors: Array<{ agent: string; error: string }> = [];

    console.log(`[AgentRouter] Executing plan with ${plan.tasks.length} tasks`);

    try {
      if (plan.executionStrategy === "parallel") {
        // Execute all independent tasks in parallel
        await this.executeParallel(plan, context, results, errors);
      } else if (plan.executionStrategy === "sequential") {
        // Execute tasks one by one
        await this.executeSequential(plan, context, results, errors);
      } else {
        // Hybrid: some parallel, some sequential based on dependencies
        await this.executeHybrid(plan, context, results, errors);
      }
    } catch (error) {
      console.error("[AgentRouter] Error executing plan:", error);
      errors.push({
        agent: "router",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    const executionTime = Date.now() - startTime;

    console.log(
      `[AgentRouter] Execution complete: ${results.size} results, ${errors.length} errors, ${executionTime}ms`
    );

    return {
      plan,
      results,
      executionTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Route and execute in one call (convenience method)
   */
  async routeAndExecute(context: RoutingContext): Promise<ExecutionResult> {
    const plan = await this.createPlan(context);
    return this.executePlan(plan, context);
  }

  // ============================================================================
  // Intent Analysis
  // ============================================================================

  private async analyzeIntent(context: RoutingContext): Promise<{
    intent: string;
    complexity: "simple" | "moderate" | "complex";
    requiredCapabilities: string[];
    confidence: number;
  }> {
    const prompt = `Analyze this AI tool request and identify the intent and requirements.

Tool ID: ${context.toolId}
Input: ${JSON.stringify(context.input, null, 2)}

Determine:
1. Primary intent (what is the user trying to accomplish?)
2. Complexity level (simple/moderate/complex)
3. Required capabilities (list of agent capabilities needed)
4. Your confidence in this analysis (0-1)

Return JSON:
{
  "intent": "brief description",
  "complexity": "simple|moderate|complex",
  "requiredCapabilities": ["capability1", "capability2"],
  "confidence": 0.95
}`;

    try {
      const response = await createChatCompletion({
        messages: [
          {
            role: "system",
            content: "You are an AI task planning expert.",
          },
          { role: "user", content: prompt },
        ],
        model: "gpt-4o-mini",
        temperature: 0.2,
        maxTokens: 300,
        jsonMode: true,
      });

      return JSON.parse(response);
    } catch (error) {
      console.error("[AgentRouter] Error analyzing intent:", error);
      // Fallback analysis
      return {
        intent: `Execute ${context.toolId}`,
        complexity: "moderate",
        requiredCapabilities: [context.toolId],
        confidence: 0.5,
      };
    }
  }

  // ============================================================================
  // Agent Selection
  // ============================================================================

  private selectAgents(
    analysis: { requiredCapabilities: string[]; complexity: string },
    context: RoutingContext
  ): { primary: string; supporting: string[] } {
    // Map tool IDs to primary agents
    const toolAgentMap: Record<string, string> = {
      business_audit: "strategic-analysis",
      pricing_strategy: "pricing-intelligence",
      service_packages: "strategic-analysis",
      social_content: "marketing-content",
      blog_seo_writer: "marketing-content",
      email_hub: "marketing-content",
    };

    const primary =
      toolAgentMap[context.toolId] || "strategic-analysis";

    // Select supporting agents based on complexity and capabilities
    const supporting: string[] = [];

    if (analysis.complexity === "complex") {
      // For complex tasks, add supporting agents
      if (context.toolId === "business_audit") {
        supporting.push("competitive-intelligence");
        supporting.push("marketing-content");
      } else if (context.toolId === "pricing_strategy") {
        supporting.push("competitive-intelligence");
        supporting.push("revenue-intelligence");
      } else if (context.toolId === "service_packages") {
        supporting.push("revenue-intelligence");
      }
    }

    return { primary, supporting };
  }

  // ============================================================================
  // Task Decomposition
  // ============================================================================

  private decomposeTasks(
    analysis: any,
    agents: { primary: string; supporting: string[] },
    context: RoutingContext
  ): AgentTask[] {
    const tasks: AgentTask[] = [];

    // Primary task (always required)
    tasks.push({
      type: "primary",
      description: `Execute ${context.toolId} with ${agents.primary}`,
      priority: "high",
      estimatedDuration: 8, // seconds
    });

    // Supporting tasks
    agents.supporting.forEach((agent) => {
      tasks.push({
        type: "supporting",
        description: `Execute ${agent} analysis`,
        priority: "medium",
        estimatedDuration: 6,
        dependencies: [], // Can run in parallel with primary
      });
    });

    // Synthesis task (if multiple agents)
    if (agents.supporting.length > 0) {
      tasks.push({
        type: "synthesis",
        description: "Synthesize results from all agents",
        priority: "high",
        estimatedDuration: 3,
        dependencies: tasks.map((t) => t.description), // Depends on all previous tasks
      });
    }

    return tasks;
  }

  // ============================================================================
  // Execution Strategy
  // ============================================================================

  private determineStrategy(
    tasks: AgentTask[],
    context: RoutingContext
  ): "sequential" | "parallel" | "hybrid" {
    // Check user preference
    const speed = context.userPreferences?.speed || "balanced";

    if (speed === "fast") {
      // Favor parallel execution
      return tasks.length > 1 ? "parallel" : "sequential";
    }

    // Check for dependencies
    const hasDependencies = tasks.some(
      (task) => task.dependencies && task.dependencies.length > 0
    );

    if (hasDependencies) {
      // Some tasks depend on others - use hybrid
      return "hybrid";
    }

    // If multiple independent tasks - parallel
    if (tasks.length > 2) {
      return "parallel";
    }

    return "sequential";
  }

  private estimateDuration(
    tasks: AgentTask[],
    strategy: "sequential" | "parallel" | "hybrid"
  ): number {
    if (strategy === "sequential") {
      // Sum all task durations
      return tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    } else if (strategy === "parallel") {
      // Max duration (all run at once)
      return Math.max(...tasks.map((task) => task.estimatedDuration));
    } else {
      // Hybrid: estimate based on dependency graph
      // Simplified: average of sequential and parallel
      const sequential = tasks.reduce(
        (sum, task) => sum + task.estimatedDuration,
        0
      );
      const parallel = Math.max(...tasks.map((task) => task.estimatedDuration));
      return (sequential + parallel) / 2;
    }
  }

  // ============================================================================
  // Execution Strategies
  // ============================================================================

  private async executeParallel(
    plan: AgentPlan,
    context: RoutingContext,
    results: Map<string, AgentResponse>,
    errors: Array<{ agent: string; error: string }>
  ): Promise<void> {
    const agents = [plan.primaryAgent, ...plan.supportingAgents];

    const promises = agents.map(async (agentName) => {
      try {
        const agent = AgentRegistry.get(agentName);
        if (!agent) {
          throw new Error(`Agent ${agentName} not found`);
        }

        const prompt = this.buildPromptForAgent(agentName, context);
        const result = await agent.execute(prompt, {
          intelligence: JSON.stringify(context.intelligence),
        });

        results.set(agentName, result);
      } catch (error) {
        console.error(`[AgentRouter] Error executing ${agentName}:`, error);
        errors.push({
          agent: agentName,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    await Promise.all(promises);
  }

  private async executeSequential(
    plan: AgentPlan,
    context: RoutingContext,
    results: Map<string, AgentResponse>,
    errors: Array<{ agent: string; error: string }>
  ): Promise<void> {
    const agents = [plan.primaryAgent, ...plan.supportingAgents];

    for (const agentName of agents) {
      try {
        const agent = AgentRegistry.get(agentName);
        if (!agent) {
          throw new Error(`Agent ${agentName} not found`);
        }

        const prompt = this.buildPromptForAgent(agentName, context);

        // Include results from previous agents as context
        const previousResults = Array.from(results.values())
          .map((r) => r.content)
          .join("\n\n");

        const result = await agent.execute(prompt, {
          intelligence: JSON.stringify(context.intelligence),
          previousAnalysis: previousResults,
        });

        results.set(agentName, result);
      } catch (error) {
        console.error(`[AgentRouter] Error executing ${agentName}:`, error);
        errors.push({
          agent: agentName,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async executeHybrid(
    plan: AgentPlan,
    context: RoutingContext,
    results: Map<string, AgentResponse>,
    errors: Array<{ agent: string; error: string }>
  ): Promise<void> {
    // Group tasks by dependency levels
    const levels = this.groupTasksByDependencies(plan.tasks);

    // Execute each level (parallel within level, sequential between levels)
    for (const level of levels) {
      const promises = level.map(async (task) => {
        // Determine which agent to use for this task
        const agentName =
          task.type === "primary"
            ? plan.primaryAgent
            : plan.supportingAgents[0] || plan.primaryAgent;

        try {
          const agent = AgentRegistry.get(agentName);
          if (!agent) {
            throw new Error(`Agent ${agentName} not found`);
          }

          const prompt = this.buildPromptForTask(task, context);
          const result = await agent.execute(prompt, {
            intelligence: JSON.stringify(context.intelligence),
          });

          results.set(`${agentName}_${task.type}`, result);
        } catch (error) {
          console.error(
            `[AgentRouter] Error executing task ${task.description}:`,
            error
          );
          errors.push({
            agent: agentName,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      await Promise.all(promises);
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private groupTasksByDependencies(tasks: AgentTask[]): AgentTask[][] {
    const levels: AgentTask[][] = [];
    const completed = new Set<string>();

    while (completed.size < tasks.length) {
      const currentLevel = tasks.filter((task) => {
        // Task is ready if all dependencies are completed
        const ready =
          !task.dependencies ||
          task.dependencies.every((dep) => completed.has(dep));
        return ready && !completed.has(task.description);
      });

      if (currentLevel.length === 0) {
        // Circular dependency or error - add remaining tasks
        const remaining = tasks.filter(
          (task) => !completed.has(task.description)
        );
        if (remaining.length > 0) {
          levels.push(remaining);
          remaining.forEach((task) => completed.add(task.description));
        }
        break;
      }

      levels.push(currentLevel);
      currentLevel.forEach((task) => completed.add(task.description));
    }

    return levels;
  }

  private buildPromptForAgent(
    agentName: string,
    context: RoutingContext
  ): string {
    // Build agent-specific prompt based on tool and agent
    const prompts: Record<string, string> = {
      "strategic-analysis": `Analyze the business strategy for ${context.input.business_name || "this business"}.

Input: ${JSON.stringify(context.input, null, 2)}

Provide strategic assessment, competitive positioning, and actionable recommendations.`,

      "competitive-intelligence": `Analyze the competitive landscape for ${context.input.business_name || "this business"}.

Input: ${JSON.stringify(context.input, null, 2)}

Identify competitors, market gaps, and differentiation opportunities.`,

      "pricing-intelligence": `Analyze pricing strategy for ${context.input.business_name || "this business"}.

Input: ${JSON.stringify(context.input, null, 2)}

Provide pricing recommendations, competitive positioning, and justification strategies.`,

      "revenue-intelligence": `Analyze revenue opportunities for ${context.input.business_name || "this business"}.

Input: ${JSON.stringify(context.input, null, 2)}

Identify revenue streams, monetization opportunities, and growth levers.`,

      "marketing-content": `Generate marketing content for ${context.input.business_name || "this business"}.

Input: ${JSON.stringify(context.input, null, 2)}

Create engaging, business-specific content optimized for the target platform.`,
    };

    return (
      prompts[agentName] ||
      `Execute task for ${context.toolId}: ${JSON.stringify(context.input, null, 2)}`
    );
  }

  private buildPromptForTask(task: AgentTask, context: RoutingContext): string {
    return `${task.description}

Context: ${JSON.stringify(context.input, null, 2)}

Priority: ${task.priority}

Provide ${task.type} analysis.`;
  }

  private createFallbackPlan(context: RoutingContext): AgentPlan {
    return {
      primaryAgent: "strategic-analysis",
      supportingAgents: [],
      tasks: [
        {
          type: "primary",
          description: `Execute ${context.toolId}`,
          priority: "high",
          estimatedDuration: 10,
        },
      ],
      executionStrategy: "sequential",
      estimatedTotalDuration: 10,
      confidence: 0.5,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultRouterInstance: AgentRouter | null = null;

export function getAgentRouter(): AgentRouter {
  if (!defaultRouterInstance) {
    defaultRouterInstance = new AgentRouter();
  }
  return defaultRouterInstance;
}
