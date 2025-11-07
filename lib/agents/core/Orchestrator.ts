/**
 * Advanced Orchestration Patterns
 *
 * Implements ML engineering best practices for multi-agent workflows:
 * - Pipeline: Sequential processing with transforms
 * - Fan-out/Fan-in: Parallel execution with aggregation
 * - Conditional: Decision trees based on results
 * - Retry with exponential backoff
 * - Workflow templates for common patterns
 */

import { AgentResponse } from "../unified-agent-system";
import { AgentManager } from "./AgentManager";

export interface WorkflowStep {
  agentName: string;
  userMessage: string;
  context?: Record<string, any>;
  retryConfig?: RetryConfig;
  transform?: (response: AgentResponse) => Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ConditionalStep {
  condition: (results: Map<string, AgentResponse>) => boolean;
  thenSteps: WorkflowStep[];
  elseSteps?: WorkflowStep[];
}

export interface WorkflowResult {
  success: boolean;
  results: Map<string, AgentResponse>;
  errors: Array<{ step: string; error: string }>;
  executionTime: number;
  metadata: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    retries: number;
  };
}

export class Orchestrator {
  private manager: AgentManager;
  private readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  constructor() {
    this.manager = AgentManager.getInstance();
  }

  /**
   * Pipeline Pattern: Sequential execution with transforms
   * Each step's output becomes the next step's context
   */
  async executePipeline(steps: WorkflowStep[]): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResponse>();
    const errors: Array<{ step: string; error: string }> = [];
    let accumulatedContext: Record<string, any> = {};
    let retryCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepName = `step_${i}_${step.agentName}`;

      try {
        // Merge step context with accumulated context
        const context = { ...accumulatedContext, ...step.context };

        // Execute with retry
        const response = await this.executeWithRetry(
          step.agentName,
          step.userMessage,
          context,
          step.retryConfig || this.DEFAULT_RETRY_CONFIG
        );

        results.set(stepName, response);

        // Transform and accumulate for next step
        if (step.transform) {
          accumulatedContext = {
            ...accumulatedContext,
            ...step.transform(response),
          };
        } else {
          accumulatedContext = {
            ...accumulatedContext,
            [`${step.agentName}_result`]: response.content,
          };
        }
      } catch (error) {
        errors.push({
          step: stepName,
          error: error instanceof Error ? error.message : String(error),
        });
        // Pipeline breaks on error
        break;
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      executionTime: Date.now() - startTime,
      metadata: {
        totalSteps: steps.length,
        successfulSteps: results.size,
        failedSteps: errors.length,
        retries: retryCount,
      },
    };
  }

  /**
   * Fan-out/Fan-in Pattern: Parallel execution with aggregation
   */
  async executeFanOut(
    steps: WorkflowStep[],
    aggregator?: (results: Map<string, AgentResponse>) => Record<string, any>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const results = new Map<string, AgentResponse>();
    const errors: Array<{ step: string; error: string }> = [];

    // Execute all steps in parallel
    const promises = steps.map(async (step, index) => {
      const stepName = `parallel_${index}_${step.agentName}`;
      try {
        const response = await this.executeWithRetry(
          step.agentName,
          step.userMessage,
          step.context,
          step.retryConfig || this.DEFAULT_RETRY_CONFIG
        );
        return { stepName, response, error: null };
      } catch (error) {
        return {
          stepName,
          response: null,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const settled = await Promise.all(promises);

    // Collect results and errors
    settled.forEach(({ stepName, response, error }) => {
      if (response) {
        results.set(stepName, response);
      } else if (error) {
        errors.push({ step: stepName, error });
      }
    });

    // Optional aggregation step
    if (aggregator && results.size > 0) {
      const aggregatedContext = aggregator(results);
      // Store aggregated result
      results.set("aggregated", {
        content: JSON.stringify(aggregatedContext),
        metadata: {
          provider: "aggregator",
          executionTime: 0,
        },
      });
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      executionTime: Date.now() - startTime,
      metadata: {
        totalSteps: steps.length,
        successfulSteps: results.size,
        failedSteps: errors.length,
        retries: 0, // TODO: Track retries in parallel execution
      },
    };
  }

  /**
   * Conditional Pattern: Decision tree based on results
   */
  async executeConditional(
    initialSteps: WorkflowStep[],
    conditionalSteps: ConditionalStep[]
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    let results = new Map<string, AgentResponse>();
    const errors: Array<{ step: string; error: string }> = [];

    // Execute initial steps
    const initialResult = await this.executePipeline(initialSteps);
    results = new Map([...results, ...initialResult.results]);
    errors.push(...initialResult.errors);

    // Evaluate conditions and execute branches
    for (const conditionalStep of conditionalSteps) {
      const conditionMet = conditionalStep.condition(results);
      const branchSteps = conditionMet
        ? conditionalStep.thenSteps
        : conditionalStep.elseSteps || [];

      if (branchSteps.length > 0) {
        const branchResult = await this.executePipeline(branchSteps);
        results = new Map([...results, ...branchResult.results]);
        errors.push(...branchResult.errors);
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      executionTime: Date.now() - startTime,
      metadata: {
        totalSteps: initialSteps.length + conditionalSteps.length,
        successfulSteps: results.size,
        failedSteps: errors.length,
        retries: 0,
      },
    };
  }

  /**
   * Retry with exponential backoff
   */
  private async executeWithRetry(
    agentName: string,
    userMessage: string,
    context?: Record<string, any>,
    retryConfig: RetryConfig = this.DEFAULT_RETRY_CONFIG
  ): Promise<AgentResponse> {
    let lastError: Error | null = null;
    let delay = retryConfig.initialDelay;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await this.manager.executeAgent(agentName, userMessage, context);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        // Wait before retry with exponential backoff
        await this.sleep(Math.min(delay, retryConfig.maxDelay));
        delay *= retryConfig.backoffMultiplier;

        console.warn(
          `Retry attempt ${attempt}/${retryConfig.maxAttempts} for ${agentName} after ${delay}ms`
        );
      }
    }

    throw lastError || new Error("Unknown error during retry");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Workflow Templates: Common patterns for business use cases
   */

  /**
   * Website Analysis Workflow
   * 1. Analyze site (parallel: scraping + AI analysis)
   * 2. Generate insights (parallel: SWOT + competitive + quick wins)
   * 3. Aggregate recommendations
   */
  async executeWebsiteAnalysisWorkflow(url: string): Promise<WorkflowResult> {
    // Phase 1: Site Analysis
    const analysisSteps: WorkflowStep[] = [
      {
        agentName: "site-scraper",
        userMessage: `Scrape and extract content from ${url}`,
        context: { url },
      },
    ];

    const analysisResult = await this.executePipeline(analysisSteps);

    if (!analysisResult.success) {
      return analysisResult;
    }

    // Phase 2: Parallel Insights Generation
    const insightSteps: WorkflowStep[] = [
      {
        agentName: "strategic-analysis",
        userMessage: "Perform Porter's 5 Forces and SWOT analysis",
        context: {
          businessInfo: analysisResult.results.get("step_0_site-scraper")
            ?.content,
        },
      },
      {
        agentName: "competitive-intelligence",
        userMessage: "Analyze competitive landscape",
        context: {
          businessInfo: analysisResult.results.get("step_0_site-scraper")
            ?.content,
        },
      },
      {
        agentName: "quick-wins",
        userMessage: "Generate actionable quick wins",
        context: {
          businessInfo: analysisResult.results.get("step_0_site-scraper")
            ?.content,
        },
      },
    ];

    const insightsResult = await this.executeFanOut(insightSteps, (results) => {
      // Aggregate all insights
      const strategic = results.get("parallel_0_strategic-analysis")?.content;
      const competitive = results.get(
        "parallel_1_competitive-intelligence"
      )?.content;
      const quickWins = results.get("parallel_2_quick-wins")?.content;

      return {
        strategic,
        competitive,
        quickWins,
        summary: `Complete analysis ready with ${results.size} insight dimensions`,
      };
    });

    return {
      success: analysisResult.success && insightsResult.success,
      results: new Map([...analysisResult.results, ...insightsResult.results]),
      errors: [...analysisResult.errors, ...insightsResult.errors],
      executionTime:
        analysisResult.executionTime + insightsResult.executionTime,
      metadata: {
        totalSteps:
          analysisResult.metadata.totalSteps +
          insightsResult.metadata.totalSteps,
        successfulSteps:
          analysisResult.metadata.successfulSteps +
          insightsResult.metadata.successfulSteps,
        failedSteps:
          analysisResult.metadata.failedSteps +
          insightsResult.metadata.failedSteps,
        retries: 0,
      },
    };
  }

  /**
   * Content Generation Workflow
   * 1. Analyze business context
   * 2. Generate platform-specific content (parallel)
   * 3. Optimize for SEO and engagement
   */
  async executeContentGenerationWorkflow(
    businessInfo: string,
    platforms: string[]
  ): Promise<WorkflowResult> {
    // Phase 1: Context Analysis
    const contextStep: WorkflowStep = {
      agentName: "marketing-content",
      userMessage: "Analyze business voice and brand guidelines",
      context: { businessInfo },
      transform: (response) => ({
        brandVoice: response.content,
      }),
    };

    const contextResult = await this.executePipeline([contextStep]);

    if (!contextResult.success) {
      return contextResult;
    }

    // Phase 2: Parallel Content Generation
    const contentSteps: WorkflowStep[] = platforms.map((platform) => ({
      agentName: "marketing-content",
      userMessage: `Generate ${platform} post`,
      context: {
        businessInfo,
        platform,
        brandVoice: contextResult.results.get("step_0_marketing-content")
          ?.content,
      },
    }));

    const contentResult = await this.executeFanOut(contentSteps, (results) => {
      const posts: Record<string, string> = {};
      results.forEach((response, key) => {
        const platform = key.split("_").pop() || "";
        posts[platform] = response.content;
      });
      return posts;
    });

    return {
      success: contextResult.success && contentResult.success,
      results: new Map([...contextResult.results, ...contentResult.results]),
      errors: [...contextResult.errors, ...contentResult.errors],
      executionTime: contextResult.executionTime + contentResult.executionTime,
      metadata: {
        totalSteps:
          contextResult.metadata.totalSteps + contentResult.metadata.totalSteps,
        successfulSteps:
          contextResult.metadata.successfulSteps +
          contentResult.metadata.successfulSteps,
        failedSteps:
          contextResult.metadata.failedSteps +
          contentResult.metadata.failedSteps,
        retries: 0,
      },
    };
  }
}

// Export singleton instance
export const orchestrator = new Orchestrator();
