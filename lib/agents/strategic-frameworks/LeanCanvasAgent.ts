/**
 * Lean Canvas Agent
 *
 * Creates 1-page business plan using Lean Canvas framework (Ash Maurya)
 * Integrates with knowledge base for startup best practices and validation strategies
 */

import { VectorRepository } from "../../repositories/vector-repository";
import { AgentConfig, UnifiedAgent } from "../unified-agent-system";

export interface LeanCanvasInput {
  businessName: string;
  websiteUrl: string;
  industry: string;
  siteSummary?: string;
  stage?: "idea" | "mvp" | "growth" | "scale";
}

export interface LeanCanvasOutput {
  problem: any;
  customerSegments: any;
  uniqueValueProposition: any;
  solution: any;
  channels: any;
  revenueStreams: any;
  costStructure: any;
  keyMetrics: any;
  unfairAdvantage: any;
  riskAnalysis: any;
  traction: any;
  nextSteps: any;
}

export class LeanCanvasAgent extends UnifiedAgent {
  private vectorRepo: VectorRepository;

  constructor() {
    const config: AgentConfig = {
      name: "LeanCanvasAgent",
      description:
        "1-page business plan focused on rapid iteration and validation",
      temperature: 0.7,
      maxTokens: 4000,
      jsonMode: true,
      systemPrompt: `You are a lean startup expert specializing in the Lean Canvas framework (Ash Maurya).

Your role is to:
1. Map the business onto 1-page Lean Canvas
2. Identify riskiest assumptions to test
3. Recommend validation experiments
4. Define key metrics (CAC, LTV, activation, retention)
5. Provide 90-day action plan for rapid iteration

Focus on:
- PROBLEM-SOLUTION FIT first
- TESTABLE assumptions with validation methods
- ACTIONABLE next steps
- REALISTIC resource estimates`,
    };
    super(config);
    this.vectorRepo = new VectorRepository();
  }

  async analyze(
    input: LeanCanvasInput
  ): Promise<{
    success: boolean;
    data?: LeanCanvasOutput;
    error?: string;
    metadata: any;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Retrieve lean startup best practices
      const ragContext = await this.retrieveKnowledge(
        input.industry,
        input.stage
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
    stage?: string
  ): Promise<string> {
    try {
      // Query vector database for:
      // 1. Lean startup validation strategies
      // 2. Industry-specific customer discovery insights
      // 3. Common startup pitfalls and solutions

      const queries = [
        `lean canvas ${industry} startup validation strategies`,
        stage ? `${stage} stage startup best practices metrics` : "",
        `${industry} customer discovery unfair advantages`,
      ].filter(Boolean);

      const results = await Promise.all(
        queries.map((query) =>
          this.vectorRepo.search({
            query,
            topK: 3,
            filters: {
              type: "lean_canvas_knowledge",
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

  private buildPrompt(input: LeanCanvasInput, ragContext: string): string {
    return `Create a Lean Canvas for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Website: ${input.websiteUrl}
- Stage: ${input.stage || "Not specified"}
${input.siteSummary ? `- Summary: ${input.siteSummary}` : ""}

${ragContext ? `\nLean Startup Best Practices:\n${ragContext}\n` : ""}

Create 1-page business plan. Return valid JSON:

{
  "problem": {
    "topProblems": [
      {
        "problem": "Customer problem",
        "severity": "critical/high/medium",
        "frequency": "How often",
        "currentAlternatives": [],
        "costOfProblem": "$X/year per customer"
      }
    ],
    "existingAlternatives": []
  },
  "customerSegments": {
    "earlyAdopters": {
      "description": "First customers",
      "characteristics": [],
      "size": "Market size",
      "reachability": "How to find",
      "whyTheyBuyFirst": "What makes them early adopters"
    },
    "targetSegments": []
  },
  "uniqueValueProposition": {
    "highConcept": "X for Y",
    "elevator": "30-second pitch",
    "uniqueness": "Differentiation",
    "compellingMessage": "Why care NOW",
    "clarity": {
      "isClear": true,
      "improvements": []
    }
  },
  "solution": {
    "topFeatures": [
      {
        "feature": "Key feature",
        "problemSolved": "Which problem",
        "isMinimumViableProduct": true,
        "developmentEffort": "2 weeks",
        "impact": "Customer benefit"
      }
    ],
    "mvpScope": {
      "included": [],
      "excluded": [],
      "timeToMVP": "3 months",
      "mvpCost": "$50,000"
    }
  },
  "channels": {
    "pathToCustomers": [],
    "freeChannels": [],
    "paidChannels": []
  },
  "revenueStreams": {
    "model": "Subscription/etc",
    "pricing": {
      "amount": "$X",
      "rationale": "Why this price",
      "willingnessToPay": "Estimated",
      "competitorPricing": "$Y"
    },
    "streams": [],
    "lifetimeValue": {
      "estimated": "$X",
      "calculation": "How calculated",
      "assumptions": []
    }
  },
  "costStructure": {
    "fixedCosts": [],
    "variableCosts": [],
    "burnRate": "$X/month",
    "runway": "Y months"
  },
  "keyMetrics": {
    "metricsThatMatter": [],
    "acquisitionMetrics": {
      "CAC": "$X",
      "LTV": "$Y",
      "ratio": "LTV:CAC ratio",
      "paybackPeriod": "Z months"
    },
    "activationMetrics": [],
    "retentionMetrics": [],
    "revenueMetrics": []
  },
  "unfairAdvantage": {
    "advantages": [],
    "developingAdvantages": [],
    "note": "What competitors can't easily copy"
  },
  "riskAnalysis": {
    "biggestRisks": [
      {
        "risk": "What could kill business",
        "likelihood": "high/medium/low",
        "impact": "critical/high/medium",
        "mitigation": "How to reduce",
        "testingStrategy": "How to validate"
      }
    ],
    "assumptionsTesting": []
  },
  "traction": {
    "currentTraction": [],
    "milestones": []
  },
  "nextSteps": {
    "immediate": [],
    "month1": [],
    "month2": [],
    "month3": []
  }
}

Focus on ${input.businessName} at ${input.stage || "current"} stage. Be realistic about risks and traction.`;
  }

  private validateOutput(data: any): LeanCanvasOutput {
    if (!data.problem || !data.uniqueValueProposition) {
      throw new Error("Invalid Lean Canvas output structure");
    }
    return data as LeanCanvasOutput;
  }
}

// Export singleton instance
export const leanCanvasAgent = new LeanCanvasAgent();
