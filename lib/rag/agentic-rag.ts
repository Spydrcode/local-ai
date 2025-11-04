/**
 * Agentic RAG System
 * Intelligent control of retrieval and generation processes
 */

import { createChatCompletion } from "../openai";
import { generateEmbedding } from "../vector-utils";
import { VectorRepository } from "../repositories/vector-repository";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RAGQuery {
  query: string;
  demoId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface RetrievalDecision {
  shouldRetrieve: boolean;
  retrievalStrategy: "vector" | "database" | "hybrid" | "none";
  targetSources: string[];
  reasoning: string;
}

export interface RetrievedContext {
  source: string;
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

export interface RAGResponse {
  answer: string;
  sources: RetrievedContext[];
  confidence: number;
  retrievalDecision: RetrievalDecision;
}

/**
 * Agentic RAG Controller
 * Decides when and how to retrieve information
 */
export class AgenticRAG {
  private vectorRepo: VectorRepository;

  constructor() {
    this.vectorRepo = new VectorRepository(
      (process.env.VECTOR_PROVIDER as "supabase" | "pinecone") || "supabase"
    );
  }

  /**
   * Main entry point - intelligently routes query through RAG pipeline
   */
  async query(params: RAGQuery): Promise<RAGResponse> {
    const decision = await this.decideRetrievalStrategy(params);
    const context = await this.retrieveContext(params, decision);
    const response = await this.generateResponse(params, context, decision);

    return {
      answer: response.answer,
      sources: context,
      confidence: response.confidence,
      retrievalDecision: decision,
    };
  }

  /**
   * Agent decides optimal retrieval strategy
   */
  private async decideRetrievalStrategy(
    params: RAGQuery
  ): Promise<RetrievalDecision> {
    const prompt = `Analyze this query and decide retrieval strategy.

Query: "${params.query}"

Sources: vector (strategic analysis), database (business details), porter (frameworks)

Return JSON:
{
  "shouldRetrieve": boolean,
  "retrievalStrategy": "vector" | "database" | "hybrid" | "none",
  "targetSources": ["source1"],
  "reasoning": "brief explanation"
}`;

    try {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      return JSON.parse(response);
    } catch (error) {
      return {
        shouldRetrieve: true,
        retrievalStrategy: "hybrid",
        targetSources: ["database", "vector"],
        reasoning: "Fallback to hybrid retrieval",
      };
    }
  }

  /**
   * Retrieve context based on strategy
   */
  private async retrieveContext(
    params: RAGQuery,
    decision: RetrievalDecision
  ): Promise<RetrievedContext[]> {
    if (!decision.shouldRetrieve) return [];

    const contexts: RetrievedContext[] = [];

    if (
      decision.retrievalStrategy === "database" ||
      decision.retrievalStrategy === "hybrid"
    ) {
      const dbContext = await this.retrieveFromDatabase(params.demoId);
      contexts.push(...dbContext);
    }

    if (
      decision.retrievalStrategy === "vector" ||
      decision.retrievalStrategy === "hybrid"
    ) {
      const vectorContext = await this.retrieveFromVector(
        params.demoId,
        params.query
      );
      contexts.push(...vectorContext);
    }

    return this.rankContexts(contexts, params.query).slice(0, 5);
  }

  /**
   * Retrieve from structured database
   */
  private async retrieveFromDatabase(
    demoId: string
  ): Promise<RetrievedContext[]> {
    const { data: demo } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (!demo) return [];

    const contexts: RetrievedContext[] = [];

    if (demo.summary) {
      contexts.push({
        source: "business_summary",
        content: demo.summary,
        relevance: 0.9,
        metadata: { type: "summary" },
      });
    }

    if (demo.profit_insights?.length > 0) {
      contexts.push({
        source: "profit_insights",
        content: demo.profit_insights
          .map((i: any) => `${i.title}: ${i.actionItem}`)
          .join("\n"),
        relevance: 0.85,
        metadata: { type: "insights", count: demo.profit_insights.length },
      });
    }

    if (demo.porter_analysis) {
      contexts.push({
        source: "porter_analysis",
        content: JSON.stringify(demo.porter_analysis, null, 2),
        relevance: 0.95,
        metadata: { type: "strategic_analysis" },
      });
    }

    return contexts;
  }

  /**
   * Retrieve from vector database
   */
  private async retrieveFromVector(
    demoId: string,
    query: string
  ): Promise<RetrievedContext[]> {
    try {
      const [porterResults, competitorResults, quickWinResults] =
        await Promise.all([
          this.vectorRepo.searchPorterForces({ demoId, query }).catch(() => []),
          this.vectorRepo.searchCompetitor({ demoId, query, topK: 5, analysisType: 'competitor', includeDirectCompetitors: true }).catch(() => []),
          this.vectorRepo.searchQuickWins({ demoId }).catch(() => []),
        ]);

      const contexts: RetrievedContext[] = [];

      porterResults.forEach((result: any) => {
        contexts.push({
          source: "porter_forces_vector",
          content: result.content || result.metadata?.content || "",
          relevance: result.score || 0.7,
          metadata: result.metadata,
        });
      });

      competitorResults.forEach((result: any) => {
        contexts.push({
          source: "competitor_vector",
          content: result.content || result.metadata?.content || "",
          relevance: result.score || 0.7,
          metadata: result.metadata,
        });
      });

      quickWinResults.forEach((result: any) => {
        contexts.push({
          source: "quick_wins_vector",
          content: result.content || result.metadata?.content || "",
          relevance: result.score || 0.7,
          metadata: result.metadata,
        });
      });

      return contexts;
    } catch (error) {
      console.error("Vector retrieval error:", error);
      return [];
    }
  }

  /**
   * Rank contexts by relevance to query
   */
  private rankContexts(
    contexts: RetrievedContext[],
    query: string
  ): RetrievedContext[] {
    const queryLower = query.toLowerCase();
    const queryWords = new Set(queryLower.split(/\s+/));

    return contexts
      .map((ctx) => {
        const contentLower = ctx.content.toLowerCase();
        const contentWords = contentLower.split(/\s+/);

        let matches = 0;
        for (const word of contentWords) {
          if (queryWords.has(word) && word.length > 3) {
            matches++;
          }
        }

        const keywordScore = matches / Math.max(queryWords.size, 1);
        const finalRelevance = ctx.relevance * 0.7 + keywordScore * 0.3;

        return { ...ctx, relevance: finalRelevance };
      })
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Generate response with retrieved context
   */
  private async generateResponse(
    params: RAGQuery,
    contexts: RetrievedContext[],
    decision: RetrievalDecision
  ): Promise<{ answer: string; confidence: number }> {
    const contextText = contexts
      .map(
        (ctx, i) =>
          `[Source ${i + 1}: ${ctx.source}]\n${ctx.content}\n(Relevance: ${ctx.relevance.toFixed(2)})`
      )
      .join("\n\n");

    const messages: any[] = [
      {
        role: "system",
        content: `You are a strategic business advisor AI. Answer questions using the retrieved context below.

RETRIEVED CONTEXT:
${contextText || "No specific context retrieved - use general knowledge"}

INSTRUCTIONS:
- Prioritize information from high-relevance sources
- Cite sources when making specific claims
- If context is insufficient, acknowledge limitations
- Be concise and actionable
- Focus on strategic insights, not generic advice`,
      },
    ];

    if (params.conversationHistory) {
      messages.push(...params.conversationHistory);
    }

    messages.push({ role: "user", content: params.query });

    const response = await createChatCompletion({
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const avgRelevance =
      contexts.reduce((sum, ctx) => sum + ctx.relevance, 0) /
      Math.max(contexts.length, 1);
    const confidence = contexts.length > 0 ? avgRelevance : 0.5;

    return {
      answer: response,
      confidence,
    };
  }
}

export async function queryAgenticRAG(
  query: string,
  demoId: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<RAGResponse> {
  const rag = new AgenticRAG();
  return rag.query({ query, demoId, conversationHistory });
}
