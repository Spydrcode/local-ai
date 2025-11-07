/**
 * Enterprise Agent System Integration
 *
 * Provides a unified interface to the complete agentic framework:
 * - AgentManager for centralized agent lifecycle
 * - Orchestrator for complex workflows
 * - ToolRegistry for tool management
 * - Pre-configured agents and workflows
 *
 * Usage:
 * ```typescript
 * import { agentSystem } from '@/lib/agents/core/AgentSystem';
 *
 * // Execute single agent
 * const result = await agentSystem.executeAgent('marketing-content', prompt, context);
 *
 * // Execute workflow
 * const analysis = await agentSystem.executeWorkflow('website-analysis', { url });
 *
 * // Get system health
 * const health = agentSystem.getHealthStatus();
 * ```
 */

import { AgentRegistry } from "../unified-agent-system";
import { AgentManager, agentManager } from "./AgentManager";
import { Orchestrator, orchestrator, WorkflowResult } from "./Orchestrator";
import { ToolRegistry, toolRegistry } from "./ToolRegistry";

export interface WorkflowDefinition {
  name: string;
  description: string;
  execute: (params: Record<string, any>) => Promise<WorkflowResult>;
}

export class AgentSystem {
  private static instance: AgentSystem;
  private manager: AgentManager;
  private orchestrator: Orchestrator;
  private toolRegistry: ToolRegistry;
  private workflows: Map<string, WorkflowDefinition> = new Map();

  private constructor() {
    this.manager = agentManager;
    this.orchestrator = orchestrator;
    this.toolRegistry = toolRegistry;
    this.initializeSystem();
  }

  static getInstance(): AgentSystem {
    if (!AgentSystem.instance) {
      AgentSystem.instance = new AgentSystem();
    }
    return AgentSystem.instance;
  }

  /**
   * Initialize the complete agent system
   */
  private initializeSystem(): void {
    // Register all agents from the existing AgentRegistry
    this.registerExistingAgents();

    // Register workflow templates
    this.registerWorkflows();

    // Set up monitoring
    this.setupMonitoring();
  }

  /**
   * Register existing agents with the new manager
   */
  private registerExistingAgents(): void {
    try {
      const agents = AgentRegistry.list();
      agents.forEach((config) => {
        this.manager.registerAgent(config);
      });
      console.log(`Registered ${agents.length} agents with AgentManager`);
    } catch (error) {
      console.error("Error registering existing agents:", error);
    }
  }

  /**
   * Register workflow templates
   */
  private registerWorkflows(): void {
    // Website Analysis Workflow
    this.workflows.set("website-analysis", {
      name: "website-analysis",
      description:
        "Complete website analysis with insights and recommendations",
      execute: async (params: Record<string, any>) => {
        return this.orchestrator.executeWebsiteAnalysisWorkflow(
          params.url as string
        );
      },
    });

    // Content Generation Workflow
    this.workflows.set("content-generation", {
      name: "content-generation",
      description: "Generate platform-specific content",
      execute: async (params: Record<string, any>) => {
        return this.orchestrator.executeContentGenerationWorkflow(
          params.businessInfo as string,
          params.platforms as string[]
        );
      },
    });

    // Business Analysis Workflow (Porter's 5 Forces + SWOT + Quick Wins)
    this.workflows.set("business-analysis", {
      name: "business-analysis",
      description: "Comprehensive business analysis with strategic insights",
      execute: async (params: Record<string, any>) => {
        return this.orchestrator.executeFanOut(
          [
            {
              agentName: "strategic-analysis",
              userMessage: "Perform comprehensive strategic analysis",
              context: { businessInfo: params.businessInfo },
            },
            {
              agentName: "competitive-intelligence",
              userMessage: "Analyze competitive landscape",
              context: { businessInfo: params.businessInfo },
            },
            {
              agentName: "revenue-intelligence",
              userMessage: "Identify revenue opportunities",
              context: { businessInfo: params.businessInfo },
            },
          ],
          (results) => {
            return {
              strategic: results.get("parallel_0_strategic-analysis")?.content,
              competitive: results.get("parallel_1_competitive-intelligence")
                ?.content,
              revenue: results.get("parallel_2_revenue-intelligence")?.content,
            };
          }
        );
      },
    });
  }

  /**
   * Set up monitoring and event handlers
   */
  private setupMonitoring(): void {
    this.manager.on("agent:execution_failed", (event) => {
      console.error(`Agent execution failed:`, event);
    });

    this.manager.on("metrics:snapshot", (event) => {
      console.log(
        `Metrics snapshot at ${new Date(event.timestamp).toISOString()}`
      );
      // In production, send to monitoring service (DataDog, New Relic, etc.)
    });

    this.manager.on("cache:cleared", (event) => {
      console.log(`Cache cleared for: ${event.agentName}`);
    });
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agentName: string,
    userMessage: string,
    context?: Record<string, any>
  ) {
    return this.manager.executeAgent(agentName, userMessage, context);
  }

  /**
   * Execute a predefined workflow
   */
  async executeWorkflow(
    workflowName: string,
    params: Record<string, any>
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }
    return workflow.execute(params);
  }

  /**
   * Get available workflows
   */
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    return this.manager.getHealthStatus();
  }

  /**
   * Get agent metrics
   */
  getAgentMetrics(agentName?: string) {
    return this.manager.getMetrics(agentName);
  }

  /**
   * Get tool metrics
   */
  getToolMetrics(toolName?: string) {
    return this.toolRegistry.getMetrics(toolName);
  }

  /**
   * Clear cache
   */
  clearCache(agentName?: string): void {
    this.manager.clearCache(agentName);
    this.toolRegistry.clearCache(agentName);
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    const health = this.getHealthStatus();
    const agentMetrics = this.getAgentMetrics() as Map<string, any>;
    const toolMetrics = this.getToolMetrics() as Map<string, any>;

    return {
      health,
      summary: {
        totalAgents: agentMetrics.size,
        totalTools: toolMetrics.size,
        totalWorkflows: this.workflows.size,
        healthyAgents: health.agents.filter((a) => a.status === "healthy")
          .length,
        degradedAgents: health.agents.filter((a) => a.status === "degraded")
          .length,
        unhealthyAgents: health.agents.filter((a) => a.status === "unhealthy")
          .length,
      },
      agents: Array.from(agentMetrics.values()),
      tools: Array.from(toolMetrics.values()),
      workflows: this.listWorkflows().map((w) => ({
        name: w.name,
        description: w.description,
      })),
    };
  }
}

// Export singleton instance
export const agentSystem = AgentSystem.getInstance();

// Export individual components for direct access
export { agentManager, orchestrator, toolRegistry };
