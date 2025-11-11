/**
 * Digital Maturity Assessment Agent
 *
 * Evaluates digital transformation readiness across 8 dimensions
 * Integrates with knowledge base for industry benchmarks and case studies
 */

import { VectorRepository } from "../../repositories/vector-repository";
import { AgentConfig, UnifiedAgent } from "../unified-agent-system";

export interface DigitalMaturityInput {
  businessName: string;
  websiteUrl: string;
  industry: string;
  siteSummary?: string;
  currentTech?: string[];
}

export interface DigitalMaturityOutput {
  overallMaturityScore: number;
  maturityLevel: string;
  maturityLevels: Record<string, string>;
  dimensions: Array<{
    dimension: string;
    currentScore: number;
    targetScore: number;
    assessment: string;
    strengths: string[];
    gaps: string[];
    recommendations: Array<{
      action: string;
      impact: string;
      effort: string;
      priority: string;
      timeline: string;
    }>;
    industryBenchmark: number;
    competitiveGap: string;
  }>;
  roadmap: {
    phase1: any;
    phase2: any;
    phase3: any;
  };
  competitiveContext: any;
  investmentJustification: any;
  keyMetrics: any[];
}

export class DigitalMaturityAgent extends UnifiedAgent {
  private vectorRepo: VectorRepository;

  constructor() {
    const config: AgentConfig = {
      name: "DigitalMaturityAgent",
      description:
        "Assesses digital maturity across 8 dimensions with industry benchmarking",
      temperature: 0.7,
      maxTokens: 4000,
      jsonMode: true,
      systemPrompt: `You are a digital transformation expert specializing in maturity assessments.

Your role is to:
1. Evaluate digital capabilities across 8 dimensions (Strategy, CX, Data, Technology, Marketing, Operations, Culture, Innovation)
2. Score each dimension on 1-5 scale
3. Compare against industry benchmarks
4. Provide phased transformation roadmap
5. Calculate ROI and investment justification

Focus on:
- SPECIFIC assessments based on actual business capabilities
- ACTIONABLE recommendations with clear priorities
- REALISTIC timelines and budgets
- MEASURABLE outcomes and KPIs`,
    };
    super(config);
    this.vectorRepo = new VectorRepository();
  }

  async analyze(
    input: DigitalMaturityInput
  ): Promise<{
    success: boolean;
    data?: DigitalMaturityOutput;
    error?: string;
    metadata: any;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Retrieve relevant knowledge from RAG
      const ragContext = await this.retrieveKnowledge(input.industry);

      // Step 2: Build comprehensive prompt
      const prompt = this.buildPrompt(input, ragContext);

      // Step 3: Generate analysis
      const response = await super.execute(prompt);
      const analysis = JSON.parse(response.content);

      // Step 4: Validate and return
      const validated = this.validateOutput(analysis);

      return {
        success: true,
        data: validated,
        metadata: {
          executionTime: Date.now() - startTime,
          ragContextUsed: ragContext.length > 0,
          provider: response.metadata.provider,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private async retrieveKnowledge(industry: string): Promise<string> {
    try {
      // Query vector database for:
      // 1. Industry-specific digital maturity benchmarks
      // 2. Successful transformation case studies
      // 3. Technology stack recommendations

      const results = await this.vectorRepo.search({
        query: `digital maturity assessment ${industry} benchmarks best practices`,
        topK: 5,
        filters: {
          type: "digital_maturity_knowledge",
        },
      });

      if (results.length === 0) {
        return "";
      }

      return results
        .map((r, i) => `[${i + 1}] ${r.content || JSON.stringify(r.metadata)}`)
        .join("\n\n");
    } catch (error) {
      console.error("RAG retrieval failed:", error);
      return ""; // Graceful fallback to AI's built-in knowledge
    }
  }

  private buildPrompt(input: DigitalMaturityInput, ragContext: string): string {
    return `Perform a comprehensive Digital Maturity Assessment for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Website: ${input.websiteUrl}
${input.siteSummary ? `- Summary: ${input.siteSummary}` : ""}
${input.currentTech ? `- Current Technology: ${input.currentTech.join(", ")}` : ""}

${ragContext ? `\nRelevant Industry Knowledge:\n${ragContext}\n` : ""}

Assess digital maturity across 8 dimensions. Return valid JSON matching this structure:

{
  "overallMaturityScore": 2.8,
  "maturityLevel": "Developing",
  "maturityLevels": {
    "1": "Initial - Ad-hoc, reactive digital presence",
    "2": "Developing - Some digital capabilities, inconsistent",
    "3": "Defined - Established processes, growing sophistication",
    "4": "Managed - Data-driven, integrated digital operations",
    "5": "Optimizing - Industry-leading, continuous innovation"
  },
  "dimensions": [
    {
      "dimension": "Digital Strategy & Leadership",
      "currentScore": 2,
      "targetScore": 4,
      "assessment": "Detailed evaluation of current state",
      "strengths": ["What's working well"],
      "gaps": ["What's missing or weak"],
      "recommendations": [
        {
          "action": "Specific improvement",
          "impact": "Expected outcome",
          "effort": "low/medium/high",
          "priority": "critical/high/medium/low",
          "timeline": "3-6 months"
        }
      ],
      "industryBenchmark": 3.2,
      "competitiveGap": "Behind industry average"
    }
  ],
  "roadmap": {
    "phase1": {
      "name": "Quick Wins (0-3 months)",
      "focus": "High-impact, low-effort improvements",
      "initiatives": [],
      "totalInvestment": "$15,000",
      "expectedMaturityGain": 0.5
    },
    "phase2": {
      "name": "Foundation Building (3-9 months)",
      "focus": "Core capabilities",
      "initiatives": [],
      "totalInvestment": "$50,000",
      "expectedMaturityGain": 0.8
    },
    "phase3": {
      "name": "Advanced Capabilities (9-18 months)",
      "focus": "Innovation and optimization",
      "initiatives": [],
      "totalInvestment": "$100,000",
      "expectedMaturityGain": 1.0
    }
  },
  "competitiveContext": {
    "industryAverageMaturity": 3.1,
    "topPerformersMaturity": 4.2,
    "yourPosition": "Below average",
    "urgencyLevel": "high",
    "consequencesOfInaction": []
  },
  "investmentJustification": {
    "totalInvestmentRequired": "$165,000 over 18 months",
    "expectedReturns": [],
    "roi": "165% over 2 years",
    "breakEvenPoint": "14 months"
  },
  "keyMetrics": []
}

Be specific to ${input.industry} industry. Provide realistic scores and actionable recommendations.`;
  }

  private validateOutput(data: any): DigitalMaturityOutput {
    // Basic validation - could add Zod schema
    if (!data.overallMaturityScore || !data.dimensions) {
      throw new Error("Invalid output structure");
    }
    return data as DigitalMaturityOutput;
  }
}

// Export singleton instance
export const digitalMaturityAgent = new DigitalMaturityAgent();
