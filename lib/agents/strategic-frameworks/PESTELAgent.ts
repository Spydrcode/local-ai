/**
 * PESTEL Analysis Agent
 *
 * Analyzes external macro-environmental factors (Political, Economic, Social, Technological, Environmental, Legal)
 * Integrates with knowledge base for current trends and industry-specific factors
 */

import { VectorRepository } from "../../repositories/vector-repository";
import { AgentConfig, UnifiedAgent } from "../unified-agent-system";

export interface PESTELInput {
  businessName: string;
  websiteUrl: string;
  industry: string;
  location?: string;
  siteSummary?: string;
}

export interface PESTELOutput {
  executiveSummary: {
    overallThreatLevel: string;
    keyOpportunities: string[];
    criticalThreats: string[];
    strategicImplications: string;
  };
  political: any;
  economic: any;
  social: any;
  technological: any;
  environmental: any;
  legal: any;
  priorityMatrix: any[];
  scenarioPlanning: any;
  actionPlan: any;
  monitoringDashboard: any[];
}

export class PESTELAgent extends UnifiedAgent {
  private vectorRepo: VectorRepository;

  constructor() {
    const config: AgentConfig = {
      name: "PESTELAgent",
      description:
        "Analyzes external macro-environmental factors across 6 dimensions",
      temperature: 0.7,
      maxTokens: 4000,
      jsonMode: true,
      systemPrompt: `You are a strategic planning expert specializing in PESTEL analysis.

Your role is to:
1. Analyze Political, Economic, Social, Technological, Environmental, and Legal factors
2. Score impact (1-10) and likelihood (high/medium/low) for each factor
3. Classify factors as threats or opportunities
4. Provide scenario planning (best/likely/worst case)
5. Create monitoring dashboard with key indicators

Focus on:
- SPECIFIC factors relevant to the business and industry
- CURRENT and EMERGING trends (use provided knowledge base)
- ACTIONABLE insights with clear response strategies
- QUANTIFIED impact assessments where possible`,
    };
    super(config);
    this.vectorRepo = new VectorRepository();
  }

  async analyze(
    input: PESTELInput
  ): Promise<{
    success: boolean;
    data?: PESTELOutput;
    error?: string;
    metadata: any;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Retrieve current external environment knowledge
      const ragContext = await this.retrieveKnowledge(
        input.industry,
        input.location
      );

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

  private async retrieveKnowledge(
    industry: string,
    location?: string
  ): Promise<string> {
    try {
      // Query vector database for:
      // 1. Current economic/political trends
      // 2. Industry-specific regulatory changes
      // 3. Emerging technological disruptions
      // 4. Regional/geographic factors

      const queries = [
        `${industry} industry PESTEL factors current trends`,
        location ? `${location} regional economic political trends` : "",
        `${industry} regulatory changes legal compliance`,
      ].filter(Boolean);

      const results = await Promise.all(
        queries.map((query) =>
          this.vectorRepo.search({
            query,
            topK: 3,
            filters: {
              type: "pestel_knowledge",
            },
          })
        )
      );

      const allResults = results.flat();
      if (allResults.length === 0) {
        return "";
      }

      return allResults
        .map((r, i) => `[${i + 1}] ${r.content || JSON.stringify(r.metadata)}`)
        .join("\n\n");
    } catch (error) {
      console.error("RAG retrieval failed:", error);
      return "";
    }
  }

  private buildPrompt(input: PESTELInput, ragContext: string): string {
    return `Perform a comprehensive PESTEL Analysis for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Location: ${input.location || "Not specified"}
- Website: ${input.websiteUrl}
${input.siteSummary ? `- Summary: ${input.siteSummary}` : ""}

${ragContext ? `\nCurrent External Environment Intelligence:\n${ragContext}\n` : ""}

Analyze external macro-environmental factors. Return valid JSON with this structure:

{
  "executiveSummary": {
    "overallThreatLevel": "medium/high/low",
    "keyOpportunities": ["Top 3 opportunities"],
    "criticalThreats": ["Top 3 threats"],
    "strategicImplications": "2-3 sentences"
  },
  "political": {
    "factors": [
      {
        "factor": "Specific political factor",
        "impact": "How it affects business",
        "likelihood": "high/medium/low",
        "timeframe": "immediate/6-12 months/1-3 years",
        "threatOrOpportunity": "threat",
        "impactScore": 7,
        "responseStrategy": "How to respond",
        "monitoringIndicators": ["What to watch"]
      }
    ],
    "overallImpact": "Assessment",
    "recommendations": []
  },
  "economic": { "factors": [], "overallImpact": "", "recommendations": [] },
  "social": { "factors": [], "overallImpact": "", "recommendations": [] },
  "technological": { "factors": [], "overallImpact": "", "recommendations": [] },
  "environmental": { "factors": [], "overallImpact": "", "recommendations": [] },
  "legal": { "factors": [], "overallImpact": "", "recommendations": [] },
  "priorityMatrix": [
    {
      "factor": "Most critical factor",
      "category": "Political/Economic/etc",
      "impactScore": 9,
      "likelihood": "high",
      "urgency": "immediate",
      "action": "Required response",
      "owner": "Who handles this",
      "deadline": "When to act"
    }
  ],
  "scenarioPlanning": {
    "bestCase": {
      "scenario": "Most favorable conditions",
      "probability": "30%",
      "keyDrivers": [],
      "businessImpact": "Positive outcomes",
      "strategicResponse": "How to capitalize"
    },
    "likelyCase": { "scenario": "", "probability": "50%", "keyDrivers": [], "businessImpact": "", "strategicResponse": "" },
    "worstCase": { "scenario": "", "probability": "20%", "keyDrivers": [], "businessImpact": "", "strategicResponse": "" }
  },
  "actionPlan": {
    "immediate": [],
    "shortTerm": [],
    "longTerm": []
  },
  "monitoringDashboard": [
    {
      "indicator": "Metric to track",
      "category": "Political/Economic/etc",
      "currentValue": "Baseline",
      "threshold": "Alert level",
      "frequency": "Weekly/Monthly",
      "source": "Where to get data"
    }
  ]
}

Focus on factors SPECIFIC to ${input.industry} in ${input.location || "current market"}. Use provided intelligence for current trends. Impact scores 1-10.`;
  }

  private validateOutput(data: any): PESTELOutput {
    if (!data.executiveSummary || !data.political) {
      throw new Error("Invalid PESTEL output structure");
    }
    return data as PESTELOutput;
  }
}

// Export singleton instance
export const pestelAgent = new PESTELAgent();
