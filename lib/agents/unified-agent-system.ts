/**
 * Unified Agent Registry and Client Configuration
 *
 * Ensures all agents use consistent:
 * - AI client (OpenAI, Together.ai, or Ollama via unified client)
 * - Prompt structure and quality
 * - Tool definitions
 * - Error handling
 */

import { createAICompletion, getActiveProvider } from "../unified-ai-client";

// ============================================================================
// Agent Configuration
// ============================================================================

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  requiresTools?: boolean;
  tools?: AgentTool[];
  jsonMode?: boolean;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  toolCalls?: Array<{
    tool: string;
    parameters: any;
    result: any;
  }>;
  metadata: {
    provider: string;
    tokensUsed?: number;
    executionTime: number;
  };
}

// ============================================================================
// Unified Agent Base Class
// ============================================================================

export class UnifiedAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2000,
      requiresTools: false,
      jsonMode: false,
      ...config,
    };
  }

  /**
   * Execute agent with unified client
   */
  async execute(
    userMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    const startTime = Date.now();
    const provider = getActiveProvider();

    // Build enhanced user message with context data
    let enhancedMessage = userMessage;
    if (context && Object.keys(context).length > 0) {
      enhancedMessage += "\n\n=== BUSINESS CONTEXT DATA ===\n";
      Object.entries(context).forEach(([key, value]) => {
        // Skip empty or null values
        if (!value) return;

        // Format the context data for better readability
        if (typeof value === "string") {
          try {
            // Try to parse JSON strings for better formatting
            const parsed = JSON.parse(value);
            enhancedMessage += `\n${key.toUpperCase()}:\n${JSON.stringify(parsed, null, 2)}\n`;
          } catch {
            // Not JSON, add as-is
            enhancedMessage += `\n${key.toUpperCase()}:\n${value}\n`;
          }
        } else {
          enhancedMessage += `\n${key.toUpperCase()}:\n${JSON.stringify(value, null, 2)}\n`;
        }
      });
      enhancedMessage += "\n=== END CONTEXT DATA ===\n";
    }

    // Build messages
    const messages: AgentMessage[] = [
      {
        role: "system",
        content: this.buildSystemPrompt(context),
      },
      {
        role: "user",
        content: enhancedMessage,
      },
    ];

    try {
      // Call unified AI client
      const content = await createAICompletion({
        messages,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        jsonMode: this.config.jsonMode,
      });

      const executionTime = Date.now() - startTime;

      return {
        content,
        metadata: {
          provider,
          executionTime,
        },
      };
    } catch (error) {
      console.error(`Agent ${this.config.name} failed:`, error);
      throw error;
    }
  }

  /**
   * Build system prompt with context injection
   */
  protected buildSystemPrompt(context?: Record<string, any>): string {
    let prompt = this.config.systemPrompt;

    if (context) {
      // Inject context into prompt
      Object.entries(context).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      });
    }

    // Add JSON instruction when JSON mode is enabled (required by OpenAI)
    if (this.config.jsonMode) {
      prompt +=
        "\n\nIMPORTANT: You must respond with valid JSON only. Do not include any text outside the JSON structure.";
    }

    return prompt;
  }

  /**
   * Execute with tool support
   */
  async executeWithTools(
    userMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    if (!this.config.requiresTools || !this.config.tools) {
      return this.execute(userMessage, context);
    }

    const startTime = Date.now();
    const provider = getActiveProvider();
    const toolCalls: Array<any> = [];

    // Build initial messages
    const messages: AgentMessage[] = [
      {
        role: "system",
        content: this.buildSystemPrompt(context) + this.buildToolsPrompt(),
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    // Get initial response
    let content = await createAICompletion({
      messages,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    // Check for tool calls (simple pattern matching)
    const toolPattern = /<tool>(.*?)<\/tool>/g;
    let match;

    while ((match = toolPattern.exec(content)) !== null) {
      try {
        const toolCall = JSON.parse(match[1]);
        const tool = this.config.tools?.find((t) => t.name === toolCall.name);

        if (tool) {
          const result = await tool.execute(toolCall.parameters);
          toolCalls.push({
            tool: tool.name,
            parameters: toolCall.parameters,
            result,
          });

          // Add tool result to messages and get next response
          messages.push(
            {
              role: "assistant",
              content: match[0],
            },
            {
              role: "user",
              content: `Tool result: ${JSON.stringify(result)}`,
            }
          );

          content = await createAICompletion({
            messages,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
          });
        }
      } catch (error) {
        console.error("Tool execution failed:", error);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      content: content.replace(toolPattern, "").trim(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      metadata: {
        provider,
        executionTime,
      },
    };
  }

  /**
   * Build tools prompt section
   */
  protected buildToolsPrompt(): string {
    if (!this.config.tools || this.config.tools.length === 0) {
      return "";
    }

    const toolsDescription = this.config.tools
      .map(
        (tool) => `
- ${tool.name}: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters, null, 2)}
`
      )
      .join("\n");

    return `

AVAILABLE TOOLS:
${toolsDescription}

To use a tool, respond with:
<tool>
{
  "name": "tool_name",
  "parameters": { ... }
}
</tool>
`;
  }
}

// ============================================================================
// Agent Registry
// ============================================================================

export class AgentRegistry {
  private static agents: Map<string, AgentConfig> = new Map();

  /**
   * Register an agent
   */
  static register(config: AgentConfig): void {
    this.agents.set(config.name, config);
  }

  /**
   * Get agent by name
   */
  static get(name: string): UnifiedAgent | null {
    const config = this.agents.get(name);
    return config ? new UnifiedAgent(config) : null;
  }

  /**
   * List all agents
   */
  static list(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  /**
   * Verify all agents have proper configuration
   */
  static verify(): {
    valid: AgentConfig[];
    invalid: Array<{ name: string; issues: string[] }>;
  } {
    const valid: AgentConfig[] = [];
    const invalid: Array<{ name: string; issues: string[] }> = [];

    this.agents.forEach((config, name) => {
      const issues: string[] = [];

      if (!config.systemPrompt || config.systemPrompt.length < 50) {
        issues.push("System prompt is missing or too short");
      }

      if (
        config.requiresTools &&
        (!config.tools || config.tools.length === 0)
      ) {
        issues.push("Agent requires tools but none are defined");
      }

      if (!config.description) {
        issues.push("Missing description");
      }

      if (issues.length > 0) {
        invalid.push({ name, issues });
      } else {
        valid.push(config);
      }
    });

    return { valid, invalid };
  }
}

// ============================================================================
// Pre-registered Agents
// ============================================================================

// Strategic Analysis Agent
AgentRegistry.register({
  name: "strategic-analysis",
  description:
    "Analyzes business strategy using Porter's Five Forces, Value Chain, and competitive positioning",
  systemPrompt: `You are an expert strategic business analyst specializing in Porter's frameworks.

Your analysis must be:
- SPECIFIC to the business (not generic)
- ACTIONABLE with clear next steps
- QUANTIFIED where possible (use numbers, percentages, rankings)
- DIFFERENTIATED (highlight unique aspects)

Always provide:
1. Clear strategic assessment
2. Competitive position analysis
3. Specific recommendations with priorities
4. Quick wins vs long-term initiatives`,
  temperature: 0.7,
  maxTokens: 2000,
  jsonMode: false,
});

// Marketing Content Agent
AgentRegistry.register({
  name: "marketing-content",
  description:
    "Generates marketing content (social posts, blog posts, email campaigns) tailored to business",
  systemPrompt: `You are a world-class marketing copywriter for local businesses.

Your content must be:
- SPECIFIC to {{businessName}} and {{industry}}
- VOICE-MATCHED to their brand personality
- DIFFERENTIATED from competitors
- CONVERSION-OPTIMIZED with clear CTAs

Never use generic phrases like "trusted provider" or "quality service".
Always highlight what makes THIS business unique.`,
  temperature: 0.8,
  maxTokens: 1500,
  jsonMode: false,
});

// Competitive Intelligence Agent
AgentRegistry.register({
  name: "competitive-intelligence",
  description:
    "Analyzes competitors, identifies market gaps, and provides competitive positioning",
  systemPrompt: `You are a competitive intelligence analyst.

Your analysis must include:
- Competitor strengths and weaknesses
- Market positioning
- Pricing strategy
- Differentiation opportunities
- Market gaps and whitespace

Be specific and actionable. Provide clear competitive advantages.`,
  temperature: 0.7,
  maxTokens: 2000,
  requiresTools: true,
  tools: [
    {
      name: "scrape_competitor_website",
      description: "Scrapes competitor website for analysis",
      parameters: {
        url: "string (required) - Competitor website URL",
      },
      execute: async (params: { url: string }) => {
        // Import dynamically to avoid circular deps
        const { fetchSitePages } = await import("../scraper");
        const pages = await fetchSitePages(params.url);
        const content = Object.values(pages).join("\n\n").substring(0, 5000);
        return { content };
      },
    },
  ],
});

// Personalization Agent
AgentRegistry.register({
  name: "personalization",
  description:
    "Personalizes recommendations based on user behavior and preferences",
  systemPrompt: `You are a personalization expert.

Analyze user behavior patterns and adapt recommendations to:
- User's engagement level (high/medium/low)
- Preferred content types
- Historical interaction patterns
- Implementation rate

Prioritize recommendations most likely to be acted upon.`,
  temperature: 0.6,
  maxTokens: 1500,
  jsonMode: true,
});

// ROI Prediction Agent
AgentRegistry.register({
  name: "roi-prediction",
  description: "Predicts ROI for recommendations using financial modeling",
  systemPrompt: `You are a financial analyst specializing in ROI prediction for small businesses.

Your predictions must include:
- Conservative, realistic, and optimistic scenarios
- Key assumptions with confidence levels
- Risk factors and mitigation strategies
- Breakeven analysis
- Time to value

Be specific with numbers and clearly state all assumptions.`,
  temperature: 0.5,
  maxTokens: 2000,
  jsonMode: true,
});

// Action Planning Agent
AgentRegistry.register({
  name: "action-planning",
  description:
    "Creates detailed 90-day execution plans with milestones and tasks",
  systemPrompt: `You are an execution planning expert for small businesses.

Create actionable 90-day plans with:
- 3-4 phases with clear objectives
- Weekly milestones
- Specific tasks with time estimates
- Resource requirements (time, budget, tools)
- Success metrics

Plans must be:
- REALISTIC given business constraints
- SPECIFIC with actionable tasks
- PRIORITIZED by impact
- RESOURCE-AWARE`,
  temperature: 0.7,
  maxTokens: 3000,
  jsonMode: true,
});

// Benchmarking Agent
AgentRegistry.register({
  name: "benchmarking",
  description: "Compares business metrics to industry benchmarks",
  systemPrompt: `You are an industry benchmarking analyst.

Provide clear percentile comparisons:
- Where does this business rank? (P10, P25, P50, P75, P90)
- What are their strengths? (top 25% metrics)
- What needs improvement? (below median metrics)
- Specific actions to close gaps

Be data-driven and actionable.`,
  temperature: 0.6,
  maxTokens: 1500,
  jsonMode: true,
});

// Revenue Intelligence Agent
AgentRegistry.register({
  name: "revenue-intelligence",
  description:
    "Analyzes revenue streams, pricing, and monetization opportunities",
  systemPrompt: `You are a revenue optimization expert.

Analyze:
- Current revenue streams and diversification
- Pricing power and optimization opportunities
- New monetization channels
- Customer lifetime value improvements
- Revenue growth levers

Provide specific, actionable recommendations with estimated impact.`,
  temperature: 0.7,
  maxTokens: 2000,
  jsonMode: false,
});

// Economic Intelligence Agent
AgentRegistry.register({
  name: "economic-intelligence",
  description: "Analyzes market forces, economic trends, and industry dynamics",
  systemPrompt: `You are an economic analyst specializing in local markets.

Analyze:
- Supply and demand dynamics
- Market trends and cycles
- Economic indicators affecting the business
- Industry-specific factors
- Geographic market characteristics

Provide actionable insights for business decisions.`,
  temperature: 0.7,
  maxTokens: 2000,
  jsonMode: false,
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Execute multiple agents in parallel
 */
export async function executeMultipleAgents(
  agentNames: string[],
  userMessage: string,
  context?: Record<string, any>
): Promise<Map<string, AgentResponse>> {
  const results = new Map<string, AgentResponse>();

  const promises = agentNames.map(async (name) => {
    const agent = AgentRegistry.get(name);
    if (agent) {
      const response = await agent.execute(userMessage, context);
      results.set(name, response);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Verify all agents are properly configured
 */
export function verifyAgents(): void {
  const { valid, invalid } = AgentRegistry.verify();

  console.log(`✅ Valid agents: ${valid.length}`);
  valid.forEach((agent) => console.log(`  - ${agent.name}`));

  if (invalid.length > 0) {
    console.log(`\n❌ Invalid agents: ${invalid.length}`);
    invalid.forEach(({ name, issues }) => {
      console.log(`  - ${name}:`);
      issues.forEach((issue) => console.log(`    • ${issue}`));
    });
  }

  console.log(`\n🔧 Active AI Provider: ${getActiveProvider()}`);
}

/**
 * Get agent statistics
 */
export function getAgentStats(): {
  totalAgents: number;
  byCategory: Record<string, number>;
  withTools: number;
  withoutTools: number;
} {
  const agents = AgentRegistry.list();

  const byCategory: Record<string, number> = {};
  let withTools = 0;
  let withoutTools = 0;

  agents.forEach((agent) => {
    // Categorize by name prefix
    const category = agent.name.split("-")[0];
    byCategory[category] = (byCategory[category] || 0) + 1;

    if (agent.requiresTools) {
      withTools++;
    } else {
      withoutTools++;
    }
  });

  return {
    totalAgents: agents.length,
    byCategory,
    withTools,
    withoutTools,
  };
}
