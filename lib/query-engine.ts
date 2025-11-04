/**
 * Query Engine - Unified interface for all business intelligence queries
 * Routes queries to appropriate agents, tools, and RAG systems
 */

import { createChatCompletion } from "./openai";
import { AgenticRAG } from "./rag/agentic-rag";
import { AgentOrchestrator } from "./agents/orchestrator";
import { getMarketData } from "./tools/marketResearch";
import { benchmarkOperations } from "./tools/operationalBenchmark";
import { getLocalMarketIntel } from "./tools/localMarketIntel";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface QueryRequest {
  query: string;
  demoId: string;
  context?: {
    businessName?: string;
    industry?: string;
    location?: string;
  };
}

export interface QueryPlan {
  intent: "chat" | "analysis" | "strategic" | "content" | "data";
  agents: string[];
  tools: string[];
  useRAG: boolean;
  reasoning: string;
}

export interface QueryResult {
  answer: string;
  sources: Array<{ type: string; data: any }>;
  plan: QueryPlan;
  executionTime: number;
  cached: boolean;
}

export class QueryEngine {
  private rag: AgenticRAG;
  private cache: Map<string, { result: QueryResult; timestamp: number }>;
  private cacheTTL = 3600000; // 1 hour

  constructor() {
    this.rag = new AgenticRAG();
    this.cache = new Map();
  }

  async query(request: QueryRequest): Promise<QueryResult> {
    const startTime = Date.now();
    const cacheKey = `${request.demoId}:${request.query}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { ...cached.result, cached: true };
    }

    // Plan query execution
    const plan = await this.planQuery(request);

    // Execute query based on plan
    const result = await this.executeQuery(request, plan);

    const queryResult: QueryResult = {
      ...result,
      plan,
      executionTime: Date.now() - startTime,
      cached: false,
    };

    // Cache result
    this.cache.set(cacheKey, { result: queryResult, timestamp: Date.now() });

    return queryResult;
  }

  private async planQuery(request: QueryRequest): Promise<QueryPlan> {
    const prompt = `Analyze this business query and create an execution plan.

Query: "${request.query}"
Business Context: ${JSON.stringify(request.context || {})}

Classify intent:
- "chat": Conversational question about existing analysis
- "analysis": Request for new strategic analysis
- "strategic": Porter/SWOT/competitive analysis
- "content": Social media, website, marketing content
- "data": Market research, benchmarks, local intel

Return JSON:
{
  "intent": "chat" | "analysis" | "strategic" | "content" | "data",
  "agents": ["agent names to use"],
  "tools": ["tool names to use"],
  "useRAG": boolean,
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
        intent: "chat",
        agents: [],
        tools: [],
        useRAG: true,
        reasoning: "Fallback to RAG-based chat",
      };
    }
  }

  private async executeQuery(
    request: QueryRequest,
    plan: QueryPlan
  ): Promise<{ answer: string; sources: Array<{ type: string; data: any }> }> {
    const sources: Array<{ type: string; data: any }> = [];

    switch (plan.intent) {
      case "chat":
        return this.executeChat(request, sources);

      case "strategic":
        return this.executeStrategic(request, plan, sources);

      case "data":
        return this.executeData(request, plan, sources);

      case "analysis":
        return this.executeAnalysis(request, plan, sources);

      default:
        return this.executeChat(request, sources);
    }
  }

  private async executeChat(
    request: QueryRequest,
    sources: Array<{ type: string; data: any }>
  ) {
    const ragResult = await this.rag.query({
      query: request.query,
      demoId: request.demoId,
    });

    sources.push({
      type: "rag",
      data: {
        sources: ragResult.sources,
        confidence: ragResult.confidence,
        strategy: ragResult.retrievalDecision.retrievalStrategy,
      },
    });

    return { answer: ragResult.answer, sources };
  }

  private async executeStrategic(
    request: QueryRequest,
    plan: QueryPlan,
    sources: Array<{ type: string; data: any }>
  ) {
    const { data: demo } = await supabase
      .from("demos")
      .select("*")
      .eq("id", request.demoId)
      .single();

    if (!demo) {
      return { answer: "Business not found", sources };
    }

    const orchestrator = new AgentOrchestrator({
      demoId: request.demoId,
      businessName: demo.client_id || request.context?.businessName || "Business",
      websiteUrl: demo.site_url,
      siteSummary: demo.summary,
      industry: request.context?.industry,
    });

    // Run specific agents based on plan
    const agentResults = await Promise.all(
      plan.agents.map((agent) => orchestrator.runSingleAgent(agent))
    );

    sources.push({
      type: "agents",
      data: agentResults,
    });

    // Synthesize results
    const synthesis = await this.synthesizeResults(request.query, agentResults);

    return { answer: synthesis, sources };
  }

  private async executeData(
    request: QueryRequest,
    plan: QueryPlan,
    sources: Array<{ type: string; data: any }>
  ) {
    const results = await Promise.all(
      plan.tools.map(async (tool) => {
        switch (tool) {
          case "marketResearch":
            return {
              tool,
              data: await getMarketData(
                request.context?.industry || "business",
                request.context?.location,
                request.demoId
              ),
            };
          case "operationalBenchmark":
            return {
              tool,
              data: await benchmarkOperations(
                request.context?.industry || "business",
                request.demoId
              ),
            };
          case "localMarketIntel":
            return {
              tool,
              data: await getLocalMarketIntel(
                request.context?.location || "local area",
                request.context?.industry || "business",
                request.demoId
              ),
            };
          default:
            return { tool, data: null };
        }
      })
    );

    sources.push({ type: "tools", data: results });

    const synthesis = await this.synthesizeResults(request.query, results);

    return { answer: synthesis, sources };
  }

  private async executeAnalysis(
    request: QueryRequest,
    plan: QueryPlan,
    sources: Array<{ type: string; data: any }>
  ) {
    // Combine RAG + agents for comprehensive analysis
    const [ragResult, agentResults] = await Promise.all([
      this.rag.query({ query: request.query, demoId: request.demoId }),
      this.executeStrategic(request, plan, []),
    ]);

    sources.push(
      { type: "rag", data: ragResult },
      ...agentResults.sources
    );

    const combined = `${ragResult.answer}\n\n${agentResults.answer}`;

    return { answer: combined, sources };
  }

  private async synthesizeResults(query: string, results: any[]): Promise<string> {
    const prompt = `Synthesize these results into a clear answer for the query.

Query: "${query}"

Results:
${JSON.stringify(results, null, 2)}

Provide a concise, actionable answer that directly addresses the query.`;

    return createChatCompletion({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 800,
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export async function executeQuery(request: QueryRequest): Promise<QueryResult> {
  const engine = new QueryEngine();
  return engine.query(request);
}
