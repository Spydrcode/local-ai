/**
 * Agent Migration Guide
 *
 * Step-by-step guide to migrate existing agents to the unified system
 */

import {
  AgentConfig,
  AgentRegistry,
  UnifiedAgent,
} from "./unified-agent-system";

// ============================================================================
// MIGRATION PATTERN 1: Direct OpenAI Instantiation → Unified Agent
// ============================================================================

/**
 * BEFORE: Direct OpenAI client (❌ DON'T DO THIS)
 */
/*
import OpenAI from 'openai';

class OldAgent {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyze(input: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: input }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  }
}
*/

/**
 * AFTER: Unified Agent (✅ DO THIS)
 */
export class MigratedAgent extends UnifiedAgent {
  constructor() {
    super({
      name: "migrated-agent",
      description: "Example migrated agent using unified system",
      systemPrompt: "You are a helpful assistant",
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  async analyze(input: string) {
    const response = await this.execute(input);
    return response.content;
  }
}

// ============================================================================
// MIGRATION PATTERN 2: lib/openai.ts Functions → Unified Client
// ============================================================================

/**
 * BEFORE: Using createChatCompletion from lib/openai (⚠️ DEPRECATED)
 */
/*
import { createChatCompletion } from '@/lib/openai';

async function oldAnalyze(input: string) {
  const response = await createChatCompletion([
    { role: 'system', content: 'You are a strategic analyst' },
    { role: 'user', content: input }
  ], {
    temperature: 0.7,
    max_tokens: 2000
  });

  return response;
}
*/

/**
 * AFTER: Using unified client directly (✅ RECOMMENDED)
 */
import { createAICompletion as unifiedCompletion } from "../unified-ai-client";

export async function newAnalyze(input: string) {
  const response = await unifiedCompletion({
    messages: [
      { role: "system", content: "You are a strategic analyst" },
      { role: "user", content: input },
    ],
    temperature: 0.7,
    maxTokens: 2000,
  });

  return response;
}

// ============================================================================
// MIGRATION PATTERN 3: Complex Agent with Tools
// ============================================================================

/**
 * BEFORE: ReAct agent with manual tool handling
 */
/*
class OldReActAgent {
  async run(input: string) {
    let thought = '';
    let action = '';
    
    // Manual ReAct loop
    while (true) {
      const response = await this.openai.chat.completions.create({...});
      // Manual parsing of thought/action/observation
      // Complex tool execution logic
    }
  }
}
*/

/**
 * AFTER: Using UnifiedAgent with tools
 */
export const toolBasedAgent: AgentConfig = {
  name: "tool-based-agent",
  description: "Agent with tool capabilities",
  systemPrompt: `You are an intelligent agent with access to tools.
  
Use tools when you need to:
- Fetch external data
- Perform calculations
- Access databases

To use a tool, output:
<tool>
{
  "name": "tool_name",
  "parameters": {...}
}
</tool>`,
  temperature: 0.7,
  maxTokens: 2000,
  requiresTools: true,
  tools: [
    {
      name: "search_database",
      description: "Search the database for business information",
      parameters: {
        query: "string - The search query",
        limit: "number - Maximum results (optional, default 10)",
      },
      execute: async (params: { query: string; limit?: number }) => {
        // Tool implementation
        return { results: [] };
      },
    },
    {
      name: "calculate_metrics",
      description: "Calculate business metrics",
      parameters: {
        revenue: "number - Revenue amount",
        costs: "number - Total costs",
      },
      execute: async (params: { revenue: number; costs: number }) => {
        return {
          profit: params.revenue - params.costs,
          margin: ((params.revenue - params.costs) / params.revenue) * 100,
        };
      },
    },
  ],
};

// Register the tool-based agent
AgentRegistry.register(toolBasedAgent);

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

export const MIGRATION_CHECKLIST = {
  step1: {
    title: "Identify Current Pattern",
    checks: [
      "[ ] Agent uses `new OpenAI()` directly?",
      "[ ] Agent uses `createChatCompletion()` from lib/openai?",
      "[ ] Agent uses ReAct framework?",
      "[ ] Agent has custom tool handling?",
    ],
  },
  step2: {
    title: "Create Agent Config",
    checks: [
      "[ ] Define name (kebab-case)",
      "[ ] Write description (1-2 sentences)",
      "[ ] Write system prompt (specific, actionable)",
      "[ ] Set temperature (0.5-0.9)",
      "[ ] Set maxTokens (1000-3000)",
      "[ ] Identify if tools are needed",
    ],
  },
  step3: {
    title: "Define Tools (if needed)",
    checks: [
      "[ ] List all tools the agent needs",
      "[ ] Define clear tool descriptions",
      "[ ] Define parameter schemas",
      "[ ] Implement tool execute functions",
      "[ ] Test tool execution independently",
    ],
  },
  step4: {
    title: "Register Agent",
    checks: [
      "[ ] Call AgentRegistry.register(config)",
      "[ ] Verify registration with AgentRegistry.list()",
      "[ ] Run AgentRegistry.verify() to check config",
      "[ ] Test agent with AgentRegistry.get(name)",
    ],
  },
  step5: {
    title: "Update Callers",
    checks: [
      "[ ] Find all files importing old agent",
      "[ ] Replace with AgentRegistry.get()",
      "[ ] Update method calls to use execute()",
      "[ ] Remove old OpenAI imports",
      "[ ] Test end-to-end functionality",
    ],
  },
  step6: {
    title: "Test & Verify",
    checks: [
      "[ ] Test with OpenAI provider",
      "[ ] Test with Together.ai provider (cost savings!)",
      "[ ] Test with Ollama provider (local dev)",
      "[ ] Verify error handling",
      "[ ] Check token usage and costs",
    ],
  },
};

// ============================================================================
// AGENTS TO MIGRATE (Priority Order)
// ============================================================================

export const AGENTS_TO_MIGRATE = [
  // HIGH PRIORITY - New AI Improvement Systems
  {
    file: "lib/personalization/PersonalizationEngine.ts",
    pattern: "Direct OpenAI instantiation",
    priority: "HIGH",
    estimatedEffort: "30 minutes",
    costSavings: "90% (Together.ai)",
  },
  {
    file: "lib/planning/ActionPlanner.ts",
    pattern: "Direct OpenAI instantiation",
    priority: "HIGH",
    estimatedEffort: "30 minutes",
    costSavings: "90%",
  },
  {
    file: "lib/prediction/ROIPredictor.ts",
    pattern: "Direct OpenAI instantiation",
    priority: "HIGH",
    estimatedEffort: "30 minutes",
    costSavings: "90%",
  },
  {
    file: "lib/intelligence/CompetitiveIntelligence.ts",
    pattern: "Direct OpenAI instantiation + Playwright",
    priority: "HIGH",
    estimatedEffort: "45 minutes",
    costSavings: "90%",
  },

  // HIGH PRIORITY - Frequently Used Agents
  {
    file: "lib/agents/hbs/strategy/OsterwalderAgent.ts",
    pattern: "Direct OpenAI instantiation",
    priority: "HIGH",
    estimatedEffort: "20 minutes",
    costSavings: "90%",
  },
  {
    file: "lib/agents/strategic-analysis-agent.ts",
    pattern: "Uses createChatCompletion",
    priority: "HIGH",
    estimatedEffort: "15 minutes",
    costSavings: "90%",
  },

  // MEDIUM PRIORITY - Specialized Agents
  {
    file: "lib/agents/pricing-intelligence-agent.ts",
    pattern: "Unknown (needs audit)",
    priority: "MEDIUM",
    estimatedEffort: "20 minutes",
    costSavings: "90%",
  },
  {
    file: "lib/agents/react-revenue-detective.ts",
    pattern: "ReAct framework",
    priority: "MEDIUM",
    estimatedEffort: "30 minutes",
    costSavings: "90%",
  },
  {
    file: "lib/agents/react-economic-agent.ts",
    pattern: "ReAct framework",
    priority: "MEDIUM",
    estimatedEffort: "30 minutes",
    costSavings: "90%",
  },

  // LOW PRIORITY - Less Frequently Used
  {
    file: "lib/agents/porter-rag.ts",
    pattern: "Unknown (needs audit)",
    priority: "LOW",
    estimatedEffort: "20 minutes",
    costSavings: "90%",
  },
];

// ============================================================================
// API ROUTES TO MIGRATE
// ============================================================================

export const API_ROUTES_TO_MIGRATE = [
  "pages/api/analyze-site.ts",
  "pages/api/generate-demo.ts",
  "pages/api/strategic-insights.ts",
  "pages/api/content/blog.ts",
  "pages/api/content/social.ts",
  // Add more as discovered
];

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Automatically detect which pattern an agent uses
 */
export function detectAgentPattern(fileContent: string): string {
  if (fileContent.includes("new OpenAI(")) {
    return "DIRECT_OPENAI_INSTANTIATION";
  }
  if (fileContent.includes("createChatCompletion")) {
    return "LIB_OPENAI_FUNCTION";
  }
  if (fileContent.includes("extends ReActAgent")) {
    return "REACT_FRAMEWORK";
  }
  if (fileContent.includes("createAICompletion")) {
    return "ALREADY_UNIFIED";
  }
  return "UNKNOWN";
}

/**
 * Generate migration estimate
 */
export function estimateMigrationEffort(
  pattern: string,
  hasTools: boolean
): {
  estimatedMinutes: number;
  complexity: "LOW" | "MEDIUM" | "HIGH";
  notes: string[];
} {
  const base =
    {
      DIRECT_OPENAI_INSTANTIATION: 20,
      LIB_OPENAI_FUNCTION: 15,
      REACT_FRAMEWORK: 30,
      ALREADY_UNIFIED: 0,
      UNKNOWN: 30,
    }[pattern] || 30;

  const toolOverhead = hasTools ? 15 : 0;
  const total = base + toolOverhead;

  const complexity = total < 20 ? "LOW" : total < 35 ? "MEDIUM" : "HIGH";

  const notes: string[] = [];
  if (pattern === "DIRECT_OPENAI_INSTANTIATION") {
    notes.push("Remove OpenAI import and instantiation");
    notes.push("Replace with AgentRegistry or createAICompletion");
  }
  if (pattern === "REACT_FRAMEWORK") {
    notes.push("May need to preserve ReAct loop structure");
    notes.push("Consider using executeWithTools method");
  }
  if (hasTools) {
    notes.push("Define tool schemas and execute functions");
  }

  return {
    estimatedMinutes: total,
    complexity,
    notes,
  };
}

/**
 * Validate agent configuration
 */
export function validateAgentConfig(config: Partial<AgentConfig>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!config.name) errors.push("Missing name");
  if (!config.description) errors.push("Missing description");
  if (!config.systemPrompt) errors.push("Missing systemPrompt");

  // Validation rules
  if (config.systemPrompt && config.systemPrompt.length < 50) {
    warnings.push("System prompt is very short (< 50 chars)");
  }

  if (
    config.systemPrompt &&
    config.systemPrompt.toLowerCase().includes("you are a helpful assistant")
  ) {
    warnings.push(
      "Generic system prompt detected - consider making it more specific"
    );
  }

  if (config.requiresTools && (!config.tools || config.tools.length === 0)) {
    errors.push("requiresTools is true but no tools defined");
  }

  if (
    config.temperature &&
    (config.temperature < 0 || config.temperature > 2)
  ) {
    errors.push("Temperature must be between 0 and 2");
  }

  if (config.maxTokens && config.maxTokens > 4096) {
    warnings.push("maxTokens > 4096 may be expensive");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// EXAMPLE: Complete Migration
// ============================================================================

/**
 * Example: Migrate PersonalizationEngine to Unified System
 */

// BEFORE (from lib/personalization/PersonalizationEngine.ts):
/*
export class PersonalizationEngine {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async personalizeRecommendations(...) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [...],
      temperature: 0.7
    });
    ...
  }
}
*/

// AFTER: Register as unified agent
export const personalizationAgentConfig: AgentConfig = {
  name: "personalization-engine",
  description:
    "Personalizes recommendations based on user behavior, preferences, and engagement patterns",
  systemPrompt: `You are a personalization expert analyzing user behavior.

Given user interaction data, personalize recommendations by:
1. Analyzing engagement level (high/medium/low)
2. Identifying preferred content types
3. Detecting implementation patterns
4. Prioritizing actionable insights

Output personalized recommendations as JSON with:
- Adjusted priority scores
- Personalized messaging
- Timing recommendations
- Implementation difficulty adjustments

Be data-driven and specific.`,
  temperature: 0.7,
  maxTokens: 2000,
  jsonMode: true,
};

// Register it
AgentRegistry.register(personalizationAgentConfig);

// Usage:
/*
const agent = AgentRegistry.get('personalization-engine');
const response = await agent.execute(
  'Personalize recommendations for this user',
  {
    userId: 'user-123',
    engagementLevel: 'high',
    preferredTopics: ['marketing', 'revenue']
  }
);
*/
