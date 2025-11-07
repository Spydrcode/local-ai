/**
 * Central Agent Manager
 *
 * Manages all agents, orchestrators, and workflows in the system.
 * Follows ML engineering best practices:
 * - Centralized registry and lifecycle management
 * - Metrics and observability
 * - Error handling and circuit breaking
 * - Caching and optimization
 * - Resource pooling
 */

import { EventEmitter } from "events";
import {
  AgentConfig,
  AgentResponse,
  UnifiedAgent,
} from "../unified-agent-system";

export interface AgentMetrics {
  agentName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  lastExecutionTime: number;
  errorRate: number;
}

export interface ExecutionContext {
  requestId: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  traceId?: string;
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close circuit
  timeout: number; // Time in ms to wait before attempting again
}

export class CircuitBreaker {
  private failures: number = 0;
  private successes: number = 0;
  private state: "closed" | "open" | "half-open" = "closed";
  private nextAttempt: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "half-open";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === "half-open") {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = "closed";
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.successes = 0;

    if (this.failures >= this.config.failureThreshold) {
      this.state = "open";
      this.nextAttempt = Date.now() + this.config.timeout;
    }
  }

  getState(): string {
    return this.state;
  }
}

export class AgentManager extends EventEmitter {
  private static instance: AgentManager;
  private agents: Map<string, UnifiedAgent> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private cache: Map<string, { response: AgentResponse; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    super();
    this.initializeMonitoring();
  }

  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Register an agent with the manager
   */
  registerAgent(config: AgentConfig): void {
    const agent = new UnifiedAgent(config);
    this.agents.set(config.name, agent);

    // Initialize metrics
    this.metrics.set(config.name, {
      agentName: config.name,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      lastExecutionTime: 0,
      errorRate: 0,
    });

    // Initialize circuit breaker
    this.circuitBreakers.set(
      config.name,
      new CircuitBreaker({
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
      })
    );

    this.emit("agent:registered", { agentName: config.name });
  }

  /**
   * Execute an agent with full observability and error handling
   */
  async executeAgent(
    agentName: string,
    userMessage: string,
    context?: Record<string, any>,
    executionContext?: ExecutionContext
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    const requestId = executionContext?.requestId || this.generateRequestId();
    const startTime = Date.now();

    // Check cache
    const cacheKey = this.getCacheKey(agentName, userMessage, context);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.emit("agent:cache_hit", { agentName, requestId });
      return cached.response;
    }

    // Execute with circuit breaker
    const circuitBreaker = this.circuitBreakers.get(agentName)!;

    try {
      const response = await circuitBreaker.execute(async () => {
        this.emit("agent:execution_started", { agentName, requestId });
        const result = await agent.execute(userMessage, context);
        return result;
      });

      // Update metrics
      this.updateMetrics(agentName, Date.now() - startTime, true);

      // Cache response
      this.cache.set(cacheKey, { response, timestamp: Date.now() });

      this.emit("agent:execution_completed", {
        agentName,
        requestId,
        latency: Date.now() - startTime,
      });

      return response;
    } catch (error) {
      // Update metrics
      this.updateMetrics(agentName, Date.now() - startTime, false);

      this.emit("agent:execution_failed", {
        agentName,
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Execute multiple agents in parallel with optimization
   */
  async executeMultipleAgents(
    requests: Array<{
      agentName: string;
      userMessage: string;
      context?: Record<string, any>;
    }>,
    executionContext?: ExecutionContext
  ): Promise<Map<string, AgentResponse>> {
    const results = new Map<string, AgentResponse>();

    const promises = requests.map(
      async ({ agentName, userMessage, context }) => {
        try {
          const response = await this.executeAgent(
            agentName,
            userMessage,
            context,
            executionContext
          );
          results.set(agentName, response);
        } catch (error) {
          console.error(`Failed to execute agent ${agentName}:`, error);
          // Continue with other agents
        }
      }
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * Get agent metrics
   */
  getMetrics(agentName?: string): AgentMetrics | Map<string, AgentMetrics> {
    if (agentName) {
      const metrics = this.metrics.get(agentName);
      if (!metrics) {
        throw new Error(`No metrics found for agent '${agentName}'`);
      }
      return metrics;
    }
    return new Map(this.metrics);
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(agentName: string): string {
    const breaker = this.circuitBreakers.get(agentName);
    return breaker ? breaker.getState() : "unknown";
  }

  /**
   * Clear cache for specific agent or all agents
   */
  clearCache(agentName?: string): void {
    if (agentName) {
      // Clear cache for specific agent
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(`${agentName}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
    this.emit("cache:cleared", { agentName: agentName || "all" });
  }

  /**
   * Get system health status
   */
  getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy";
    agents: Array<{
      name: string;
      status: string;
      circuitBreakerState: string;
      errorRate: number;
    }>;
  } {
    const agentStatuses: Array<{
      name: string;
      status: string;
      circuitBreakerState: string;
      errorRate: number;
    }> = [];

    let openCircuits = 0;
    let highErrorRates = 0;

    this.agents.forEach((_, name) => {
      const metrics = this.metrics.get(name)!;
      const circuitState = this.getCircuitBreakerStatus(name);

      if (circuitState === "open") openCircuits++;
      if (metrics.errorRate > 0.5) highErrorRates++;

      agentStatuses.push({
        name,
        status:
          circuitState === "open"
            ? "unhealthy"
            : metrics.errorRate > 0.5
              ? "degraded"
              : "healthy",
        circuitBreakerState: circuitState,
        errorRate: metrics.errorRate,
      });
    });

    const overallStatus =
      openCircuits > 0 || highErrorRates > 2
        ? "unhealthy"
        : highErrorRates > 0
          ? "degraded"
          : "healthy";

    return {
      status: overallStatus,
      agents: agentStatuses,
    };
  }

  // Private helper methods

  private updateMetrics(
    agentName: string,
    latency: number,
    success: boolean
  ): void {
    const metrics = this.metrics.get(agentName)!;

    metrics.totalExecutions++;
    if (success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    // Update average latency (exponential moving average)
    metrics.averageLatency =
      metrics.averageLatency === 0
        ? latency
        : metrics.averageLatency * 0.9 + latency * 0.1;

    metrics.lastExecutionTime = Date.now();
    metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;

    // Note: For production, implement proper percentile tracking
    metrics.p95Latency = latency * 1.2; // Placeholder
    metrics.p99Latency = latency * 1.5; // Placeholder
  }

  private getCacheKey(
    agentName: string,
    userMessage: string,
    context?: Record<string, any>
  ): string {
    const contextHash = context
      ? JSON.stringify(Object.keys(context).sort())
      : "";
    return `${agentName}:${userMessage.substring(0, 100)}:${contextHash}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private initializeMonitoring(): void {
    // Log metrics every 5 minutes
    setInterval(
      () => {
        this.emit("metrics:snapshot", {
          timestamp: Date.now(),
          metrics: Array.from(this.metrics.values()),
        });
      },
      5 * 60 * 1000
    );

    // Clean up old cache entries every minute
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.cache.forEach((value, key) => {
        if (now - value.timestamp > this.CACHE_TTL) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => this.cache.delete(key));

      if (keysToDelete.length > 0) {
        this.emit("cache:cleanup", { entriesRemoved: keysToDelete.length });
      }
    }, 60 * 1000);
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();
