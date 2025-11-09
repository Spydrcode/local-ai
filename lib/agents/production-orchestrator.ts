/**
 * Production-Grade Agent Orchestrator
 *
 * Replaces simple generateContent() wrapper with intelligent multi-agent workflows.
 * Routes requests to appropriate agent pipelines based on task type and complexity.
 */

import { AgentManager } from "./core/AgentManager";
import { Orchestrator } from "./core/Orchestrator";
import { AgentRegistry } from "./unified-agent-system";
import { HBSOrchestrator } from "./hbs/core/HBSOrchestrator";
import { SWOTAgent } from "./hbs/strategy/SWOTAgent";
import { AgenticRAG } from "../rag/agentic-rag";
import type { AgentConfig } from "./unified-agent-system";

// ============================================================================
// Type Definitions
// ============================================================================

export type WorkflowType =
  | "strategic-analysis"      // Full business analysis (SWOT + Porter + Economic)
  | "content-generation"      // Content creation with business context
  | "competitor-intelligence" // Competitive analysis and positioning
  | "quick-analysis"          // Fast single-agent execution
  | "custom-pipeline";        // User-defined agent sequence

export interface WorkflowContext {
  website?: string;
  businessName?: string;
  industry?: string;
  location?: string;
  targetAudience?: string;
  customData?: Record<string, any>;
  demoId?: string; // For RAG context retrieval
}

export interface WorkflowResult {
  success: boolean;
  data: any;
  metadata: {
    workflowType: WorkflowType;
    agentsExecuted: string[];
    executionTimeMs: number;
    cacheHit: boolean;
    tokensUsed?: number;
    cost?: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface OrchestratorOptions {
  enableCaching?: boolean;
  cacheStrategyTTL?: number; // seconds
  enableMetrics?: boolean;
  maxRetries?: number;
  timeout?: number; // ms
}

// ============================================================================
// Production Orchestrator
// ============================================================================

export class ProductionOrchestrator {
  private agentManager: AgentManager;
  private coreOrchestrator: Orchestrator;
  private hbsOrchestrator: HBSOrchestrator;
  private agenticRAG: AgenticRAG;
  private cache: Map<string, { result: any; timestamp: number }>;
  private options: Required<OrchestratorOptions>;

  constructor(options: OrchestratorOptions = {}) {
    this.agentManager = AgentManager.getInstance();
    this.coreOrchestrator = new Orchestrator();
    this.hbsOrchestrator = new HBSOrchestrator();
    this.agenticRAG = new AgenticRAG();

    this.cache = new Map();
    this.options = {
      enableCaching: options.enableCaching ?? true,
      cacheStrategyTTL: options.cacheStrategyTTL ?? 300, // 5 minutes default
      enableMetrics: options.enableMetrics ?? true,
      maxRetries: options.maxRetries ?? 2,
      timeout: options.timeout ?? 60000, // 60s default
    };
  }

  /**
   * Main execution method - routes to appropriate workflow
   */
  async execute(
    workflowType: WorkflowType,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.options.enableCaching) {
        const cached = this.checkCache(workflowType, context);
        if (cached) {
          return {
            success: true,
            data: cached,
            metadata: {
              workflowType,
              agentsExecuted: [],
              executionTimeMs: Date.now() - startTime,
              cacheHit: true,
            },
          };
        }
      }

      // Route to appropriate workflow
      let result: any;
      let agentsExecuted: string[] = [];

      switch (workflowType) {
        case "strategic-analysis":
          ({ result, agentsExecuted } = await this.executeStrategicAnalysis(
            context
          ));
          break;

        case "content-generation":
          ({ result, agentsExecuted } = await this.executeContentGeneration(
            context
          ));
          break;

        case "competitor-intelligence":
          ({
            result,
            agentsExecuted,
          } = await this.executeCompetitorIntelligence(context));
          break;

        case "quick-analysis":
          ({ result, agentsExecuted } = await this.executeQuickAnalysis(
            context
          ));
          break;

        default:
          throw new Error(`Unknown workflow type: ${workflowType}`);
      }

      // Cache the result
      if (this.options.enableCaching) {
        this.setCache(workflowType, context, result);
      }

      return {
        success: true,
        data: result,
        metadata: {
          workflowType,
          agentsExecuted,
          executionTimeMs: Date.now() - startTime,
          cacheHit: false,
        },
      };
    } catch (error) {
      console.error(`Workflow execution error (${workflowType}):`, error);
      return {
        success: false,
        data: null,
        metadata: {
          workflowType,
          agentsExecuted: [],
          executionTimeMs: Date.now() - startTime,
          cacheHit: false,
        },
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  // ==========================================================================
  // Workflow Implementations
  // ==========================================================================

  /**
   * Strategic Analysis Workflow
   *
   * Multi-agent pipeline:
   * 1. Gather context via AgenticRAG
   * 2. Run HBS SWOT analysis
   * 3. Run Porter's 5 Forces analysis
   * 4. Run economic/market intelligence
   * 5. Synthesize and validate results
   */
  private async executeStrategicAnalysis(
    context: WorkflowContext
  ): Promise<{ result: any; agentsExecuted: string[] }> {
    const agentsExecuted: string[] = [];

    // Step 1: Gather business context via RAG
    let ragContext = null;
    if (context.demoId) {
      try {
        ragContext = await this.agenticRAG.query({
          query: `strategic analysis for ${context.businessName || context.website}`,
          demoId: context.demoId,
        });
      } catch (error) {
        console.warn("RAG context retrieval failed:", error);
      }
    }

    // Step 2: Run HBS SWOT Agent (high-quality framework analysis)
    const swotAgent = new SWOTAgent();
    let swotAnalysis = null;

    try {
      swotAnalysis = await swotAgent.analyze({
        demoId: context.demoId || "temp",
        businessName: context.businessName || "Unknown",
        industry: context.industry || "Unknown",
        businessSummary: ragContext?.answer || "Analyzing new business",
        websiteUrl: context.website,
      });
      agentsExecuted.push("swot-agent");
    } catch (error) {
      console.error("SWOT analysis failed:", error);
    }

    // Step 3: Run Strategic Analysis Agent (Porter + market forces)
    const strategicAgent = AgentRegistry.get("strategic-analysis");
    let porterAnalysis = null;

    if (strategicAgent && context.website) {
      try {
        const porterPrompt = this.buildPorterPrompt(context, ragContext);
        const response = await strategicAgent.execute(porterPrompt);

        // Parse JSON from response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            porterAnalysis = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            // Fix control characters in JSON strings
            let cleaned = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/"([^"]*)"/g, (match, str) => {
                return '"' + str
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t')
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
              });
            porterAnalysis = JSON.parse(cleaned);
          }
          agentsExecuted.push("strategic-analysis");
        }
      } catch (error) {
        console.error("Porter analysis failed:", error);
      }
    }

    // Step 4: Run Economic Intelligence Agent
    const economicAgent = AgentRegistry.get("economic-intelligence");
    let economicIntel = null;

    if (economicAgent && context.industry) {
      try {
        const economicPrompt = `Analyze economic factors affecting ${context.businessName} in the ${context.industry} industry.

Location: ${context.location || "Unknown"}
Target Market: ${context.targetAudience || "Unknown"}

Provide:
1. Industry growth trends and forecasts
2. Economic headwinds and tailwinds
3. Regulatory environment
4. Technology disruption risks
5. Market size and opportunity

Return valid JSON only.`;

        const response = await economicAgent.execute(economicPrompt);
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            economicIntel = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            let cleaned = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/"([^"]*)"/g, (match, str) => {
                return '"' + str
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t')
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
              });
            economicIntel = JSON.parse(cleaned);
          }
          agentsExecuted.push("economic-intelligence");
        }
      } catch (error) {
        console.error("Economic intelligence failed:", error);
      }
    }

    // Step 5: Synthesize results using HBS Orchestrator
    const synthesisInput = {
      swot: swotAnalysis,
      porter: porterAnalysis,
      economic: economicIntel,
      rag_context: ragContext,
    };

    // Return comprehensive analysis
    return {
      result: {
        business_name: context.businessName,
        website: context.website,
        industry: context.industry,
        swot_analysis: swotAnalysis,
        porter_analysis: porterAnalysis,
        economic_intelligence: economicIntel,
        synthesis: synthesisInput,
        confidence_score: this.calculateConfidenceScore(synthesisInput),
        recommendations: this.extractRecommendations(synthesisInput),
      },
      agentsExecuted,
    };
  }

  /**
   * Content Generation Workflow
   *
   * Context-aware content creation:
   * 1. Retrieve business intelligence via RAG
   * 2. Get brand voice and positioning
   * 3. Generate content with specialized agents
   * 4. Optimize for platform and audience
   */
  private async executeContentGeneration(
    context: WorkflowContext
  ): Promise<{ result: any; agentsExecuted: string[] }> {
    const agentsExecuted: string[] = [];

    // Step 1: Retrieve business context
    let businessContext = null;
    if (context.demoId) {
      try {
        businessContext = await this.agenticRAG.query({
          query: `business profile and brand voice for ${context.businessName}`,
          demoId: context.demoId,
        });
      } catch (error) {
        console.warn("Business context retrieval failed:", error);
      }
    }

    // Step 2: Run personalization agent to tailor content
    const personalizationAgent = AgentRegistry.get("personalization");
    let contentStrategy = null;

    if (personalizationAgent) {
      try {
        const strategyPrompt = `Create a content strategy for ${context.businessName}.

Business Context: ${businessContext?.answer || "No prior context"}
Industry: ${context.industry || "Unknown"}
Target Audience: ${context.targetAudience || "Unknown"}
Custom Requirements: ${JSON.stringify(context.customData || {})}

Provide:
1. Key messaging pillars
2. Content themes and topics
3. Tone and voice guidelines
4. Content distribution strategy

Return valid JSON only.`;

        const response = await personalizationAgent.execute(strategyPrompt);
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            contentStrategy = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            let cleaned = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/"([^"]*)"/g, (match, str) => {
                return '"' + str
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t')
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
              });
            contentStrategy = JSON.parse(cleaned);
          }
          agentsExecuted.push("personalization");
        }
      } catch (error) {
        console.error("Content strategy failed:", error);
      }
    }

    // Step 3: Generate actual content using marketing-content agent
    const contentAgent = AgentRegistry.get("marketing-content");
    let generatedContent = null;

    if (contentAgent) {
      try {
        const contentPrompt = `Generate marketing content for ${context.businessName}.

Content Strategy: ${JSON.stringify(contentStrategy || {})}
Business Context: ${businessContext?.answer || "No context"}
Specific Request: ${JSON.stringify(context.customData || {})}

Create content that:
- Aligns with the brand voice and messaging pillars
- Targets the specified audience
- Includes specific differentiators and value props
- Is platform-optimized and actionable

Return valid JSON with the content and metadata.`;

        const response = await contentAgent.execute(contentPrompt);
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            generatedContent = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            let cleaned = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/"([^"]*)"/g, (match, str) => {
                return '"' + str
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t')
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
              });
            generatedContent = JSON.parse(cleaned);
          }
          agentsExecuted.push("marketing-content");
        }
      } catch (error) {
        console.error("Content generation failed:", error);
      }
    }

    return {
      result: {
        content: generatedContent,
        strategy: contentStrategy,
        business_context: businessContext,
        metadata: {
          business_name: context.businessName,
          industry: context.industry,
          target_audience: context.targetAudience,
        },
      },
      agentsExecuted,
    };
  }

  /**
   * Competitor Intelligence Workflow
   *
   * Deep competitive analysis:
   * 1. Identify competitors
   * 2. Analyze competitive positioning
   * 3. Find differentiation opportunities
   * 4. Generate competitive strategy
   */
  private async executeCompetitorIntelligence(
    context: WorkflowContext
  ): Promise<{ result: any; agentsExecuted: string[] }> {
    const agentsExecuted: string[] = [];

    // Run competitive-intelligence agent
    const competitorAgent = AgentRegistry.get("competitive-intelligence");
    let analysis = null;

    if (competitorAgent) {
      try {
        const prompt = `Analyze the competitive landscape for ${context.businessName}.

Website: ${context.website || "Unknown"}
Industry: ${context.industry || "Unknown"}
Location: ${context.location || "Unknown"}

Provide:
1. Key competitors (top 5-10)
2. Competitive positioning matrix
3. Market share estimates
4. Differentiation opportunities
5. Competitive threats and advantages

Return valid JSON only.`;

        const response = await competitorAgent.execute(prompt);
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
            let cleaned = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/"([^"]*)"/g, (match, str) => {
                return '"' + str
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t')
                  .replace(/[\x00-\x1F\x7F-\x9F]/g, '') + '"';
              });
            analysis = JSON.parse(cleaned);
          }
          agentsExecuted.push("competitive-intelligence");
        }
      } catch (error) {
        console.error("Competitor analysis failed:", error);
      }
    }

    return {
      result: analysis,
      agentsExecuted,
    };
  }

  /**
   * Quick Analysis Workflow
   *
   * Single-agent execution for simple tasks
   */
  private async executeQuickAnalysis(
    context: WorkflowContext
  ): Promise<{ result: any; agentsExecuted: string[] }> {
    // Determine which agent to use based on context
    const agentId = (context.customData?.agentId as string) || "strategic-analysis";
    const agent = AgentRegistry.get(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const prompt = (context.customData?.prompt as string) || JSON.stringify(context);
    const response = await agent.execute(prompt);

    return {
      result: response,
      agentsExecuted: [agentId],
    };
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private buildPorterPrompt(
    context: WorkflowContext,
    ragContext: any
  ): string {
    return `Analyze ${context.businessName || context.website} using Porter's 5 Forces framework.

Website: ${context.website}
Industry: ${context.industry || "Unknown"}
Location: ${context.location || "Unknown"}

${ragContext ? `Previous Analysis:\n${ragContext.answer}\n` : ""}

Provide detailed Porter's 5 Forces analysis:
1. Competitive Rivalry
2. Threat of New Entrants
3. Bargaining Power of Suppliers
4. Bargaining Power of Buyers
5. Threat of Substitutes

For each force, provide:
- Current state assessment
- Key factors and trends
- Strategic implications
- Actionable recommendations

Return valid JSON only.`;
  }

  private calculateConfidenceScore(synthesis: any): number {
    let score = 0;
    let factors = 0;

    if (synthesis.swot) {
      score += 30;
      factors++;
    }
    if (synthesis.porter) {
      score += 30;
      factors++;
    }
    if (synthesis.economic) {
      score += 20;
      factors++;
    }
    if (synthesis.rag_context) {
      score += 20;
      factors++;
    }

    return factors > 0 ? score : 0;
  }

  private extractRecommendations(synthesis: any): string[] {
    const recommendations: string[] = [];

    // Extract from SWOT
    if (synthesis.swot?.insights) {
      recommendations.push(
        ...synthesis.swot.insights
          .filter((i: any) => i.priority === "high")
          .map((i: any) => i.recommendation)
      );
    }

    // Extract from Porter
    if (synthesis.porter?.quick_wins) {
      recommendations.push(
        ...synthesis.porter.quick_wins
          .slice(0, 3)
          .map((qw: any) => qw.action)
      );
    }

    return recommendations;
  }

  // ==========================================================================
  // Caching
  // ==========================================================================

  private checkCache(
    workflowType: WorkflowType,
    context: WorkflowContext
  ): any | null {
    const key = this.getCacheKey(workflowType, context);
    const cached = this.cache.get(key);

    if (!cached) return null;

    const age = (Date.now() - cached.timestamp) / 1000;
    if (age > this.options.cacheStrategyTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  private setCache(
    workflowType: WorkflowType,
    context: WorkflowContext,
    result: any
  ): void {
    const key = this.getCacheKey(workflowType, context);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  private getCacheKey(
    workflowType: WorkflowType,
    context: WorkflowContext
  ): string {
    return `${workflowType}:${context.website || context.businessName || "unknown"}`;
  }

  /**
   * Get orchestrator health status
   */
  async getHealth(): Promise<any> {
    return {
      status: "healthy",
      agentsRegistered: this.agentManager["agents"]?.size || 0,
      cacheSize: this.cache.size,
      uptime: process.uptime(),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let orchestratorInstance: ProductionOrchestrator | null = null;

export function getOrchestrator(
  options?: OrchestratorOptions
): ProductionOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new ProductionOrchestrator(options);
  }
  return orchestratorInstance;
}
