/**
 * Agent Manager
 * Centralized coordination and management of all AI agents
 * Works alongside MarketingOrchestrator for comprehensive agent orchestration
 */

import { AgentRegistry, UnifiedAgent } from './unified-agent-system'

// Import all agents to ensure registration
import './marketing-agents'
import './hbs-marketing-frameworks'

export interface AgentGroup {
  name: string
  description: string
  agents: string[]
  category: 'marketing' | 'strategy' | 'framework' | 'utility'
}

export interface AgentExecutionPlan {
  agentName: string
  prompt: string
  context?: Record<string, any>
  dependencies?: string[] // Agent names this depends on
  priority: number // 1 = highest
}

export interface AgentExecutionResult {
  agentName: string
  success: boolean
  result?: any
  error?: string
  executionTime: number
}

export class AgentManager {
  private static instance: AgentManager

  private constructor() {
    console.log('AgentManager initialized')
  }

  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager()
    }
    return AgentManager.instance
  }

  /**
   * Get all registered agents organized by group
   */
  getAgentGroups(): AgentGroup[] {
    return [
      {
        name: 'Marketing Core',
        description: 'Core marketing strategy and execution agents',
        agents: [
          'marketing-intelligence',
          'seo-strategy',
          'content-calendar',
          'brand-voice',
          'competitor-analysis',
          'social-media-strategy',
          'email-marketing',
          'marketing-chat'
        ],
        category: 'marketing'
      },
      {
        name: 'HBS Strategy Frameworks',
        description: 'Harvard Business School strategic frameworks',
        agents: [
          'jobs-to-be-done',
          'marketing-myopia',
          'competitive-positioning',
          'discovery-driven-marketing',
          'disruptive-marketing',
          'different-marketing',
          'consumer-journey'
        ],
        category: 'framework'
      },
      {
        name: 'ML-Optimized Marketing',
        description: 'Modern machine learning marketing strategies',
        agents: [
          'ai-personalization',
          'marketing-mix-modeling'
        ],
        category: 'strategy'
      }
    ]
  }

  /**
   * Get all available agent names
   */
  getAllAgentNames(): string[] {
    return this.getAgentGroups().flatMap(group => group.agents)
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): UnifiedAgent | null {
    return AgentRegistry.get(name)
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agentName: string,
    prompt: string,
    context?: Record<string, any>
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now()

    try {
      const agent = this.getAgent(agentName)

      if (!agent) {
        return {
          agentName,
          success: false,
          error: `Agent '${agentName}' not found`,
          executionTime: Date.now() - startTime
        }
      }

      const result = await agent.execute(prompt, context)

      return {
        agentName,
        success: true,
        result,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        agentName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Execute multiple agents in sequence
   */
  async executeSequential(
    plans: AgentExecutionPlan[]
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = []

    // Sort by priority (1 = highest)
    const sortedPlans = plans.sort((a, b) => a.priority - b.priority)

    for (const plan of sortedPlans) {
      // Check dependencies
      if (plan.dependencies && plan.dependencies.length > 0) {
        const dependenciesMet = plan.dependencies.every(dep =>
          results.some(r => r.agentName === dep && r.success)
        )

        if (!dependenciesMet) {
          results.push({
            agentName: plan.agentName,
            success: false,
            error: 'Dependencies not met',
            executionTime: 0
          })
          continue
        }
      }

      // Execute agent
      const result = await this.executeAgent(
        plan.agentName,
        plan.prompt,
        plan.context
      )

      results.push(result)
    }

    return results
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    plans: AgentExecutionPlan[]
  ): Promise<AgentExecutionResult[]> {
    const promises = plans.map(plan =>
      this.executeAgent(plan.agentName, plan.prompt, plan.context)
    )

    return Promise.all(promises)
  }

  /**
   * Execute agents with smart dependency resolution
   */
  async executeWithDependencies(
    plans: AgentExecutionPlan[]
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = []
    const completed = new Set<string>()
    const pending = [...plans]

    while (pending.length > 0) {
      // Find agents with no dependencies or all dependencies completed
      const ready = pending.filter(plan => {
        if (!plan.dependencies || plan.dependencies.length === 0) {
          return true
        }
        return plan.dependencies.every(dep => completed.has(dep))
      })

      if (ready.length === 0) {
        // Circular dependency or missing dependency
        const remaining = pending.map(p => p.agentName).join(', ')
        throw new Error(`Circular or missing dependencies for: ${remaining}`)
      }

      // Execute ready agents in parallel
      const batchResults = await this.executeParallel(ready)
      results.push(...batchResults)

      // Mark completed
      batchResults.forEach(result => {
        if (result.success) {
          completed.add(result.agentName)
        }
      })

      // Remove from pending
      pending.splice(0, pending.length, ...pending.filter(p => !ready.includes(p)))
    }

    return results
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    totalAgents: number
    byCategory: Record<string, number>
    byGroup: Record<string, number>
    registeredAgents: string[]
  } {
    const groups = this.getAgentGroups()
    const allAgents = this.getAllAgentNames()

    const byCategory: Record<string, number> = {}
    const byGroup: Record<string, number> = {}

    groups.forEach(group => {
      byCategory[group.category] = (byCategory[group.category] || 0) + group.agents.length
      byGroup[group.name] = group.agents.length
    })

    return {
      totalAgents: allAgents.length,
      byCategory,
      byGroup,
      registeredAgents: allAgents
    }
  }

  /**
   * Validate that all expected agents are registered
   */
  validateAgents(): {
    valid: string[]
    missing: string[]
    total: number
  } {
    const expectedAgents = this.getAllAgentNames()
    const valid: string[] = []
    const missing: string[] = []

    expectedAgents.forEach(name => {
      const agent = this.getAgent(name)
      if (agent) {
        valid.push(name)
      } else {
        missing.push(name)
      }
    })

    return {
      valid,
      missing,
      total: expectedAgents.length
    }
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance()

// Log initialization
const stats = agentManager.getStats()
console.log(`Registered ${stats.totalAgents} agents with AgentManager`)
