/**
 * Tool Registry and Abstraction Layer
 *
 * Provides centralized management of tools that agents can use.
 * Implements ML best practices:
 * - Tool versioning and validation
 * - Rate limiting and quotas
 * - Result caching
 * - Error handling and fallbacks
 * - Metrics and observability
 */

export interface Tool {
  name: string;
  description: string;
  version: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<ToolResult>;
  rateLimit?: {
    maxCallsPerMinute: number;
    maxCallsPerHour: number;
  };
  cacheable?: boolean;
  cacheTTL?: number; // in milliseconds
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: any;
  validation?: (value: any) => boolean;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    cached: boolean;
    version: string;
  };
}

export interface ToolMetrics {
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageLatency: number;
  cacheHitRate: number;
  rateLimitHits: number;
}

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, Tool> = new Map();
  private metrics: Map<string, ToolMetrics> = new Map();
  private cache: Map<string, { result: ToolResult; timestamp: number }> =
    new Map();
  private rateLimitCounters: Map<string, { minute: number[]; hour: number[] }> =
    new Map();

  private constructor() {
    this.initializeDefaultTools();
    this.startMonitoring();
  }

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Register a tool
   */
  registerTool(tool: Tool): void {
    // Validate tool
    if (!tool.name || !tool.description || !tool.execute) {
      throw new Error("Invalid tool configuration");
    }

    this.tools.set(tool.name, tool);

    // Initialize metrics
    this.metrics.set(tool.name, {
      toolName: tool.name,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageLatency: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
    });

    // Initialize rate limit counters
    this.rateLimitCounters.set(tool.name, { minute: [], hour: [] });
  }

  /**
   * Execute a tool with full observability
   */
  async executeTool(
    toolName: string,
    params: Record<string, any>
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
      };
    }

    const startTime = Date.now();

    // Check rate limits
    if (!this.checkRateLimit(toolName)) {
      this.updateMetrics(toolName, 0, false, false, true);
      return {
        success: false,
        error: "Rate limit exceeded",
        metadata: {
          executionTime: 0,
          cached: false,
          version: tool.version,
        },
      };
    }

    // Validate parameters
    const validation = this.validateParameters(tool, params);
    if (!validation.valid) {
      return {
        success: false,
        error: `Parameter validation failed: ${validation.error}`,
      };
    }

    // Check cache
    if (tool.cacheable) {
      const cacheKey = this.getCacheKey(toolName, params);
      const cached = this.cache.get(cacheKey);
      const cacheTTL = tool.cacheTTL || 5 * 60 * 1000; // Default 5 minutes

      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        this.updateMetrics(toolName, 0, true, true, false);
        return {
          ...cached.result,
          metadata: {
            executionTime: cached.result.metadata?.executionTime || 0,
            cached: true,
            version: tool.version,
          },
        };
      }
    }

    // Execute tool
    try {
      const result = await tool.execute(params);
      const executionTime = Date.now() - startTime;

      // Cache result if cacheable
      if (tool.cacheable && result.success) {
        const cacheKey = this.getCacheKey(toolName, params);
        this.cache.set(cacheKey, {
          result: {
            ...result,
            metadata: {
              executionTime,
              cached: false,
              version: tool.version,
            },
          },
          timestamp: Date.now(),
        });
      }

      this.updateMetrics(toolName, executionTime, result.success, false, false);

      return {
        ...result,
        metadata: {
          executionTime,
          cached: false,
          version: tool.version,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(toolName, executionTime, false, false, false);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          executionTime,
          cached: false,
          version: tool.version,
        },
      };
    }
  }

  /**
   * Get tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * List all tools
   */
  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool metrics
   */
  getMetrics(toolName?: string): ToolMetrics | Map<string, ToolMetrics> {
    if (toolName) {
      const metrics = this.metrics.get(toolName);
      if (!metrics) {
        throw new Error(`No metrics found for tool '${toolName}'`);
      }
      return metrics;
    }
    return new Map(this.metrics);
  }

  /**
   * Clear cache for specific tool or all tools
   */
  clearCache(toolName?: string): void {
    if (toolName) {
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (key.startsWith(`${toolName}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // Private helper methods

  private validateParameters(
    tool: Tool,
    params: Record<string, any>
  ): { valid: boolean; error?: string } {
    for (const param of tool.parameters) {
      const value = params[param.name];

      // Check required parameters
      if (param.required && value === undefined) {
        return {
          valid: false,
          error: `Missing required parameter: ${param.name}`,
        };
      }

      // Skip validation if parameter not provided and not required
      if (value === undefined) {
        continue;
      }

      // Type validation
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (actualType !== param.type) {
        return {
          valid: false,
          error: `Parameter '${param.name}' expected type ${param.type}, got ${actualType}`,
        };
      }

      // Custom validation
      if (param.validation && !param.validation(value)) {
        return {
          valid: false,
          error: `Parameter '${param.name}' failed validation`,
        };
      }
    }

    return { valid: true };
  }

  private checkRateLimit(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool?.rateLimit) {
      return true;
    }

    const counters = this.rateLimitCounters.get(toolName)!;
    const now = Date.now();

    // Clean up old entries
    counters.minute = counters.minute.filter((t) => now - t < 60000);
    counters.hour = counters.hour.filter((t) => now - t < 3600000);

    // Check limits
    if (
      counters.minute.length >= tool.rateLimit.maxCallsPerMinute ||
      counters.hour.length >= tool.rateLimit.maxCallsPerHour
    ) {
      return false;
    }

    // Update counters
    counters.minute.push(now);
    counters.hour.push(now);

    return true;
  }

  private updateMetrics(
    toolName: string,
    latency: number,
    success: boolean,
    cached: boolean,
    rateLimitHit: boolean
  ): void {
    const metrics = this.metrics.get(toolName)!;

    metrics.totalCalls++;
    if (success) {
      metrics.successfulCalls++;
    } else {
      metrics.failedCalls++;
    }

    if (rateLimitHit) {
      metrics.rateLimitHits++;
    }

    // Update average latency (exponential moving average)
    if (latency > 0) {
      metrics.averageLatency =
        metrics.averageLatency === 0
          ? latency
          : metrics.averageLatency * 0.9 + latency * 0.1;
    }

    // Update cache hit rate
    const cacheHits = cached ? 1 : 0;
    metrics.cacheHitRate =
      (metrics.cacheHitRate * (metrics.totalCalls - 1) + cacheHits) /
      metrics.totalCalls;
  }

  private getCacheKey(toolName: string, params: Record<string, any>): string {
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    return `${toolName}:${paramString}`;
  }

  private startMonitoring(): void {
    // Clean up old cache entries every minute
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      this.cache.forEach((value, key) => {
        const toolName = key.split(":")[0];
        const tool = this.tools.get(toolName);
        const cacheTTL = tool?.cacheTTL || 5 * 60 * 1000;

        if (now - value.timestamp > cacheTTL) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => this.cache.delete(key));
    }, 60 * 1000);
  }

  private initializeDefaultTools(): void {
    // Web Scraping Tool
    this.registerTool({
      name: "web_scraper",
      description: "Scrapes content from a web page",
      version: "1.0.0",
      parameters: [
        {
          name: "url",
          type: "string",
          description: "URL to scrape",
          required: true,
          validation: (value) => {
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          },
        },
        {
          name: "selector",
          type: "string",
          description: "CSS selector for content extraction",
          required: false,
        },
      ],
      execute: async (params) => {
        try {
          const response = await fetch(params.url);
          const html = await response.text();

          return {
            success: true,
            data: {
              url: params.url,
              html: html.substring(0, 10000), // Limit size
              statusCode: response.status,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
      cacheable: true,
      cacheTTL: 15 * 60 * 1000, // 15 minutes
      rateLimit: {
        maxCallsPerMinute: 10,
        maxCallsPerHour: 100,
      },
    });

    // Search Tool
    this.registerTool({
      name: "web_search",
      description: "Searches the web for information",
      version: "1.0.0",
      parameters: [
        {
          name: "query",
          type: "string",
          description: "Search query",
          required: true,
        },
        {
          name: "maxResults",
          type: "number",
          description: "Maximum number of results",
          required: false,
          default: 10,
        },
      ],
      execute: async (params) => {
        // Placeholder - integrate with actual search API
        return {
          success: true,
          data: {
            query: params.query,
            results: [],
            message: "Search API integration pending",
          },
        };
      },
      cacheable: true,
      cacheTTL: 30 * 60 * 1000, // 30 minutes
      rateLimit: {
        maxCallsPerMinute: 5,
        maxCallsPerHour: 50,
      },
    });

    // Calculator Tool
    this.registerTool({
      name: "calculator",
      description: "Performs mathematical calculations",
      version: "1.0.0",
      parameters: [
        {
          name: "expression",
          type: "string",
          description: "Mathematical expression to evaluate",
          required: true,
        },
      ],
      execute: async (params) => {
        try {
          // Simple eval replacement for basic math
          const result = Function(
            '"use strict"; return (' + params.expression + ")"
          )();
          return {
            success: true,
            data: {
              expression: params.expression,
              result,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: "Invalid mathematical expression",
          };
        }
      },
      cacheable: true,
      cacheTTL: 60 * 60 * 1000, // 1 hour
    });
  }
}

// Export singleton instance
export const toolRegistry = ToolRegistry.getInstance();
