import { createClient } from "@supabase/supabase-js";
import { EventEmitter } from "events";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface StreamChunk {
  type: "partial" | "complete" | "error" | "progress" | "metadata";
  content: string;
  progress: number;
  metadata?: {
    agentName?: string;
    stage?: string;
    tokens?: number;
    estimatedTimeRemaining?: number;
  };
}

export interface StreamingOptions {
  businessId: string;
  agentType: "strategic" | "marketing" | "competitive";
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (result: string) => void;
  onError?: (error: Error) => void;
}

export class StreamingAgent extends EventEmitter {
  private abortController: AbortController | null = null;
  private isStreaming = false;
  private accumulatedContent = "";
  private startTime = 0;
  private tokenCount = 0;

  constructor() {
    super();
  }

  /**
   * Start streaming analysis with real-time progress
   */
  async analyzeWithStreaming(options: StreamingOptions): Promise<string> {
    this.abortController = new AbortController();
    this.isStreaming = true;
    this.accumulatedContent = "";
    this.startTime = Date.now();
    this.tokenCount = 0;

    try {
      // Get business context
      const context = await this.getBusinessContext(options.businessId);

      // Build prompt based on agent type
      const systemPrompt = this.getSystemPrompt(options.agentType);
      const userPrompt = this.buildUserPrompt(context, options.agentType);

      // Emit initial progress
      this.emitChunk(
        {
          type: "progress",
          content: "",
          progress: 0,
          metadata: {
            agentName: options.agentType,
            stage: "initializing",
          },
        },
        options
      );

      // Create streaming request
      const stream = await openai.chat.completions.create(
        {
          model: options.model || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 3000,
          stream: true,
        },
        {
          signal: this.abortController.signal,
        }
      );

      // Process stream
      let chunkIndex = 0;
      const estimatedTotalChunks = 100; // Approximate

      for await (const chunk of stream) {
        if (!this.isStreaming) break;

        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          this.accumulatedContent += delta;
          this.tokenCount += this.estimateTokens(delta);
          chunkIndex++;

          const progress = Math.min(
            95,
            (chunkIndex / estimatedTotalChunks) * 100
          );
          const elapsed = Date.now() - this.startTime;
          const estimatedTotal = (elapsed / progress) * 100;
          const estimatedTimeRemaining = estimatedTotal - elapsed;

          this.emitChunk(
            {
              type: "partial",
              content: delta,
              progress,
              metadata: {
                agentName: options.agentType,
                stage: "analyzing",
                tokens: this.tokenCount,
                estimatedTimeRemaining: Math.round(
                  estimatedTimeRemaining / 1000
                ),
              },
            },
            options
          );
        }
      }

      // Emit completion
      this.emitChunk(
        {
          type: "complete",
          content: this.accumulatedContent,
          progress: 100,
          metadata: {
            agentName: options.agentType,
            stage: "complete",
            tokens: this.tokenCount,
          },
        },
        options
      );

      // Store result
      await this.storeAnalysis(
        options.businessId,
        options.agentType,
        this.accumulatedContent
      );

      this.isStreaming = false;
      return this.accumulatedContent;
    } catch (error) {
      this.isStreaming = false;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.emitChunk(
        {
          type: "error",
          content: errorMessage,
          progress: 0,
        },
        options
      );

      throw error;
    }
  }

  /**
   * Cancel ongoing streaming
   */
  cancel(): void {
    if (this.abortController && this.isStreaming) {
      this.abortController.abort();
      this.isStreaming = false;
      this.emit("cancelled");
    }
  }

  /**
   * Get current streaming status
   */
  getStatus(): {
    isStreaming: boolean;
    progress: number;
    tokensProcessed: number;
    elapsedTime: number;
  } {
    return {
      isStreaming: this.isStreaming,
      progress: this.isStreaming
        ? Math.min(95, (this.tokenCount / 3000) * 100)
        : 100,
      tokensProcessed: this.tokenCount,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0,
    };
  }

  private emitChunk(chunk: StreamChunk, options: StreamingOptions): void {
    this.emit("chunk", chunk);
    if (options.onChunk) {
      options.onChunk(chunk);
    }
    if (chunk.type === "complete" && options.onComplete) {
      options.onComplete(chunk.content);
    }
    if (chunk.type === "error" && options.onError) {
      options.onError(new Error(chunk.content));
    }
  }

  private async getBusinessContext(businessId: string): Promise<any> {
    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .eq("id", businessId)
      .single();

    if (error)
      throw new Error(`Failed to fetch business context: ${error.message}`);
    return data;
  }

  private getSystemPrompt(agentType: string): string {
    const prompts = {
      strategic: `You are a strategic business consultant specializing in Porter's Five Forces and Blue Ocean Strategy. Provide detailed, actionable analysis with specific recommendations.`,
      marketing: `You are a marketing strategist with expertise in SEO, content marketing, and digital channels. Focus on practical, measurable marketing tactics.`,
      competitive: `You are a competitive intelligence analyst. Provide deep insights on competitors, market positioning, and differentiation opportunities.`,
    };
    return prompts[agentType as keyof typeof prompts] || prompts.strategic;
  }

  private buildUserPrompt(context: any, agentType: string): string {
    const baseInfo = `
Business: ${context.business_name || "Unknown"}
Website: ${context.site_url || "N/A"}
Industry: ${context.industry || "N/A"}
Description: ${context.site_content?.substring(0, 2000) || "No description available"}
    `;

    const agentSpecificPrompts = {
      strategic: `${baseInfo}

Analyze this business and provide:
1. Porter's Five Forces Analysis
2. Blue Ocean opportunities
3. Competitive positioning
4. Growth strategy recommendations
5. Action plan for next 90 days`,

      marketing: `${baseInfo}

Analyze this business and provide:
1. SEO opportunities and quick wins
2. Content strategy recommendations
3. Social media strategy
4. Marketing channel optimization
5. Customer acquisition tactics`,

      competitive: `${baseInfo}

Analyze this business and provide:
1. Key competitors and their strengths/weaknesses
2. Market positioning analysis
3. Differentiation opportunities
4. Competitive threats
5. Strategic recommendations`,
    };

    return (
      agentSpecificPrompts[agentType as keyof typeof agentSpecificPrompts] ||
      baseInfo
    );
  }

  private async storeAnalysis(
    businessId: string,
    agentType: string,
    content: string
  ): Promise<void> {
    const columnMap = {
      strategic: "strategic_analysis",
      marketing: "marketing_analysis",
      competitive: "competitive_analysis",
    };

    const column = columnMap[agentType as keyof typeof columnMap];
    if (!column) return;

    await supabase
      .from("demos")
      .update({ [column]: content, updated_at: new Date().toISOString() })
      .eq("id", businessId);
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Server-Sent Events (SSE) wrapper for Next.js API routes
 */
export class SSEStreamingAgent {
  static async streamToResponse(
    response: any,
    options: StreamingOptions
  ): Promise<void> {
    // Set SSE headers
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const agent = new StreamingAgent();

    agent.on("chunk", (chunk: StreamChunk) => {
      response.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    agent.on("cancelled", () => {
      response.write(`data: ${JSON.stringify({ type: "cancelled" })}\n\n`);
      response.end();
    });

    try {
      await agent.analyzeWithStreaming({
        ...options,
        onComplete: () => {
          response.end();
        },
        onError: (error) => {
          response.write(
            `data: ${JSON.stringify({
              type: "error",
              content: error.message,
            })}\n\n`
          );
          response.end();
        },
      });
    } catch (error) {
      response.write(
        `data: ${JSON.stringify({
          type: "error",
          content: error instanceof Error ? error.message : "Unknown error",
        })}\n\n`
      );
      response.end();
    }
  }
}
