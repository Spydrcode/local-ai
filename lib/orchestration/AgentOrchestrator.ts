import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { StreamChunk, StreamingAgent } from "../streaming/StreamingAgent";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AgentResult {
  agentType: "strategic" | "marketing" | "competitive";
  analysis: string;
  keyInsights: string[];
  recommendations: Recommendation[];
  confidence: number;
  executionTime: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  estimatedROI: number;
  timeframe: string;
}

export interface SynthesizedInsights {
  executiveSummary: string;
  crossFunctionalOpportunities: string[];
  contradictions: Array<{
    issue: string;
    agents: string[];
    resolution: string;
  }>;
  reinforcingPatterns: Array<{
    pattern: string;
    supportingAgents: string[];
    actionable: string;
  }>;
  prioritizedRecommendations: Recommendation[];
  strategicThemes: string[];
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    lowRisk: string[];
  };
  quickWins: Recommendation[];
  longTermInitiatives: Recommendation[];
}

export class AgentOrchestrator {
  private agents: Map<string, StreamingAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    ["strategic", "marketing", "competitive"].forEach((type) => {
      this.agents.set(type, new StreamingAgent());
    });
  }

  /**
   * Run all agents in parallel and synthesize results
   */
  async runComprehensiveAnalysis(
    businessId: string,
    options?: {
      useStreaming?: boolean;
      onProgress?: (progress: {
        agent: string;
        stage: string;
        percentage: number;
      }) => void;
    }
  ): Promise<{
    individual: Record<string, AgentResult>;
    synthesis: SynthesizedInsights;
  }> {
    const startTime = Date.now();

    try {
      // Run all agents in parallel
      const agentPromises = ["strategic", "marketing", "competitive"].map(
        async (agentType) => {
          const agent = this.agents.get(agentType)!;
          const agentStartTime = Date.now();

          const analysis = await agent.analyzeWithStreaming({
            businessId,
            agentType: agentType as any,
            onChunk: options?.useStreaming
              ? (chunk: StreamChunk) => {
                  if (options.onProgress && chunk.progress) {
                    options.onProgress({
                      agent: agentType,
                      stage: chunk.metadata?.stage || "processing",
                      percentage: chunk.progress,
                    });
                  }
                }
              : undefined,
          });

          // Extract structured data from analysis
          const structured = await this.extractStructuredData(
            analysis,
            agentType
          );

          const result: AgentResult = {
            agentType: agentType as any,
            analysis,
            keyInsights: structured.insights,
            recommendations: structured.recommendations,
            confidence: structured.confidence,
            executionTime: Date.now() - agentStartTime,
          };

          return { type: agentType, result };
        }
      );

      // Wait for all agents to complete
      const results = await Promise.all(agentPromises);

      // Create results map
      const individualResults: Record<string, AgentResult> = {};
      results.forEach(({ type, result }) => {
        individualResults[type] = result;
      });

      // Synthesize cross-agent insights
      const synthesis = await this.synthesizeInsights(
        individualResults,
        businessId
      );

      // Store comprehensive analysis
      await this.storeComprehensiveAnalysis(businessId, {
        individual: individualResults,
        synthesis,
        totalExecutionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      return {
        individual: individualResults,
        synthesis,
      };
    } catch (error) {
      console.error("Orchestrator error:", error);
      throw new Error(
        `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Synthesize insights across all agents
   */
  private async synthesizeInsights(
    results: Record<string, AgentResult>,
    businessId: string
  ): Promise<SynthesizedInsights> {
    // Prepare synthesis prompt
    const synthesisPrompt = this.buildSynthesisPrompt(results);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a synthesis AI that combines insights from multiple specialized business analysts. Your goal is to:
1. Identify contradictions and resolve them
2. Find reinforcing patterns across analyses
3. Prioritize recommendations based on combined insights
4. Create a cohesive strategic narrative
5. Identify cross-functional opportunities

Respond with valid JSON only.`,
        },
        {
          role: "user",
          content: synthesisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const synthesisData = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Combine and prioritize recommendations
    const allRecommendations = Object.values(results).flatMap(
      (r) => r.recommendations
    );
    const prioritized = await this.prioritizeRecommendations(
      allRecommendations,
      synthesisData
    );

    // Categorize by timeframe
    const quickWins = prioritized
      .filter(
        (r) =>
          r.effort === "low" && (r.impact === "high" || r.impact === "medium")
      )
      .slice(0, 5);

    const longTermInitiatives = prioritized
      .filter((r) => r.effort === "high" && r.impact === "high")
      .slice(0, 3);

    return {
      executiveSummary: synthesisData.executiveSummary || "",
      crossFunctionalOpportunities:
        synthesisData.crossFunctionalOpportunities || [],
      contradictions: synthesisData.contradictions || [],
      reinforcingPatterns: synthesisData.reinforcingPatterns || [],
      prioritizedRecommendations: prioritized,
      strategicThemes: synthesisData.strategicThemes || [],
      riskAssessment: synthesisData.riskAssessment || {
        highRisk: [],
        mediumRisk: [],
        lowRisk: [],
      },
      quickWins,
      longTermInitiatives,
    };
  }

  private buildSynthesisPrompt(results: Record<string, AgentResult>): string {
    return `
Analyze these three business analyses and synthesize a comprehensive strategic view:

STRATEGIC ANALYSIS:
${results.strategic?.analysis || "N/A"}

MARKETING ANALYSIS:
${results.marketing?.analysis || "N/A"}

COMPETITIVE ANALYSIS:
${results.competitive?.analysis || "N/A"}

Provide a synthesis in the following JSON structure:
{
  "executiveSummary": "3-4 sentence overview of the business situation and top opportunities",
  "crossFunctionalOpportunities": ["opportunities that span multiple domains"],
  "contradictions": [
    {
      "issue": "What contradicts between analyses",
      "agents": ["which agents disagree"],
      "resolution": "how to resolve this contradiction"
    }
  ],
  "reinforcingPatterns": [
    {
      "pattern": "Patterns that multiple agents identified",
      "supportingAgents": ["strategic", "marketing"],
      "actionable": "What action this suggests"
    }
  ],
  "strategicThemes": ["major themes across all analyses"],
  "riskAssessment": {
    "highRisk": ["high-risk factors"],
    "mediumRisk": ["medium-risk factors"],
    "lowRisk": ["low-risk factors"]
  }
}
    `.trim();
  }

  private async extractStructuredData(
    analysis: string,
    agentType: string
  ): Promise<{
    insights: string[];
    recommendations: Recommendation[];
    confidence: number;
  }> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract key insights and recommendations from this ${agentType} analysis. Return valid JSON only.`,
        },
        {
          role: "user",
          content: `Analysis:\n${analysis}\n\nExtract:\n{
  "insights": ["key insight 1", "key insight 2", ...],
  "recommendations": [
    {
      "id": "unique-id",
      "title": "title",
      "description": "description",
      "category": "${agentType}",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "estimatedROI": number (0-100),
      "timeframe": "1 week|1 month|3 months|6 months|1 year"
    }
  ],
  "confidence": number (0-100)
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return JSON.parse(
      completion.choices[0].message.content ||
        '{"insights":[],"recommendations":[],"confidence":0}'
    );
  }

  private async prioritizeRecommendations(
    recommendations: Recommendation[],
    synthesisData: any
  ): Promise<Recommendation[]> {
    // Calculate priority scores
    const scored = recommendations.map((rec) => {
      const effortScore =
        rec.effort === "low" ? 3 : rec.effort === "medium" ? 2 : 1;
      const impactScore =
        rec.impact === "high" ? 3 : rec.impact === "medium" ? 2 : 1;
      const priorityScore =
        rec.priority === "high" ? 3 : rec.priority === "medium" ? 2 : 1;

      const combinedScore =
        impactScore * 2 + effortScore + priorityScore + rec.estimatedROI / 20;

      return {
        ...rec,
        priorityScore: combinedScore,
      };
    });

    // Sort by priority score
    return scored
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map(({ priorityScore, ...rec }) => rec);
  }

  private async storeComprehensiveAnalysis(
    businessId: string,
    analysisData: any
  ): Promise<void> {
    await supabase.from("comprehensive_analyses").upsert(
      {
        business_id: businessId,
        individual_results: analysisData.individual,
        synthesis: analysisData.synthesis,
        execution_time_ms: analysisData.totalExecutionTime,
        created_at: analysisData.timestamp,
        updated_at: analysisData.timestamp,
      },
      {
        onConflict: "business_id",
      }
    );
  }

  /**
   * Get agent status
   */
  getAgentStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};
    this.agents.forEach((agent, type) => {
      statuses[type] = agent.getStatus();
    });
    return statuses;
  }

  /**
   * Cancel all running agents
   */
  cancelAll(): void {
    this.agents.forEach((agent) => agent.cancel());
  }
}
