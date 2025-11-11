/**
 * Business Model Canvas Agent
 *
 * Maps business model across 9 building blocks (Osterwalder framework)
 * Integrates with knowledge base for industry patterns and optimization strategies
 */

import { VectorRepository } from "../../repositories/vector-repository";
import { AgentConfig, UnifiedAgent } from "../unified-agent-system";

export interface BusinessModelCanvasInput {
  businessName: string;
  websiteUrl: string;
  industry: string;
  siteSummary?: string;
  revenueModel?: string;
}

export interface BusinessModelCanvasOutput {
  customerSegments: any;
  valuePropositions: any;
  channels: any;
  customerRelationships: any;
  revenueStreams: any;
  keyResources: any;
  keyActivities: any;
  keyPartnerships: any;
  costStructure: any;
  financialProjections: any;
  strategicRecommendations: any;
}

export class BusinessModelCanvasAgent extends UnifiedAgent {
  private vectorRepo: VectorRepository;

  constructor() {
    const config: AgentConfig = {
      name: "BusinessModelCanvasAgent",
      description: "Maps complete business model across 9 building blocks",
      temperature: 0.7,
      maxTokens: 4500,
      jsonMode: true,
      systemPrompt: `You are a business model innovation expert specializing in the Business Model Canvas framework (Alexander Osterwalder).

Your role is to:
1. Map all 9 building blocks comprehensively
2. Identify strengths and weaknesses in each block
3. Spot optimization opportunities across the model
4. Recommend revenue diversification strategies
5. Identify cost reduction opportunities

Focus on:
- SPECIFIC analysis of actual business model
- INTERCONNECTIONS between blocks (how they reinforce or conflict)
- OPTIMIZATION opportunities with estimated impact
- REALISTIC financial projections`,
    };
    super(config);
    this.vectorRepo = new VectorRepository();
  }

  async analyze(
    input: BusinessModelCanvasInput
  ): Promise<{
    success: boolean;
    data?: BusinessModelCanvasOutput;
    error?: string;
    metadata: any;
  }> {
    const startTime = Date.now();

    try {
      // Step 1: Retrieve business model patterns and best practices
      const ragContext = await this.retrieveKnowledge(
        input.industry,
        input.revenueModel
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
    revenueModel?: string
  ): Promise<string> {
    try {
      // Query vector database for:
      // 1. Successful business models in the industry
      // 2. Common optimization patterns
      // 3. Revenue diversification strategies

      const queries = [
        `${industry} business model canvas patterns successful examples`,
        revenueModel
          ? `${revenueModel} revenue model optimization strategies`
          : "",
        `${industry} cost structure optimization`,
      ].filter(Boolean);

      const results = await Promise.all(
        queries.map((query) =>
          this.vectorRepo.search({
            query,
            topK: 3,
            filters: {
              type: "business_model_knowledge",
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

  private buildPrompt(
    input: BusinessModelCanvasInput,
    ragContext: string
  ): string {
    return `Create a comprehensive Business Model Canvas for ${input.businessName}.

Business Context:
- Industry: ${input.industry}
- Website: ${input.websiteUrl}
${input.siteSummary ? `- Summary: ${input.siteSummary}` : ""}
${input.revenueModel ? `- Revenue Model: ${input.revenueModel}` : ""}

${ragContext ? `\nIndustry Business Model Patterns:\n${ragContext}\n` : ""}

Map all 9 building blocks. Return valid JSON:

{
  "customerSegments": {
    "segments": [
      {
        "name": "Primary segment",
        "description": "Who they are",
        "size": "Market size",
        "characteristics": [],
        "needsAndPains": [],
        "willingnessToPay": "high/medium/low",
        "acquisitionCost": "$X CAC",
        "lifetimeValue": "$Y LTV"
      }
    ],
    "prioritySegment": "Focus segment",
    "segmentGaps": []
  },
  "valuePropositions": {
    "primary": {
      "headline": "Core value",
      "benefits": [],
      "differentiation": "Unique aspects",
      "proof": []
    },
    "secondary": [],
    "improvements": []
  },
  "channels": {
    "awarenessChannels": [],
    "evaluationChannels": [],
    "purchaseChannels": [],
    "deliveryChannels": [],
    "afterSalesChannels": [],
    "channelStrategy": "",
    "gaps": []
  },
  "customerRelationships": {
    "relationships": [],
    "automationOpportunities": [],
    "personalizationOpportunities": []
  },
  "revenueStreams": {
    "streams": [
      {
        "name": "Revenue source",
        "type": "Subscription/One-time/etc",
        "customerSegment": "Who pays",
        "pricingMechanism": "How priced",
        "currentRevenue": "$X/month",
        "potentialRevenue": "$Y/month",
        "margins": "Gross margin %",
        "growthOpportunity": "How to increase"
      }
    ],
    "revenueConcentration": "% from top stream",
    "diversificationOpportunities": []
  },
  "keyResources": {
    "physical": [],
    "intellectual": [],
    "human": [],
    "financial": [],
    "gaps": [],
    "priorities": []
  },
  "keyActivities": {
    "activities": [],
    "productionActivities": [],
    "problemSolvingActivities": [],
    "platformNetworkActivities": []
  },
  "keyPartnerships": {
    "partners": [],
    "missingPartnerships": [],
    "optimizationOpportunities": []
  },
  "costStructure": {
    "costs": [
      {
        "category": "Cost type",
        "type": "Fixed/Variable",
        "amount": "$X/month",
        "percentOfTotal": "Y%",
        "flexibility": "Can reduce?",
        "optimizationPotential": "Save $Z"
      }
    ],
    "costDrivers": [],
    "fixedVsVariable": "",
    "economiesOfScale": [],
    "reductionOpportunities": []
  },
  "financialProjections": {
    "currentState": {
      "monthlyRevenue": "$X",
      "monthlyCosts": "$Y",
      "monthlyProfit": "$Z",
      "profitMargin": "A%",
      "breakEven": "Yes/No"
    },
    "optimizedState": {
      "monthlyRevenue": "$X",
      "monthlyCosts": "$Y",
      "monthlyProfit": "$Z",
      "profitMargin": "A%",
      "timeToAchieve": "6-12 months"
    }
  },
  "strategicRecommendations": {
    "strengthens": [],
    "fixes": [],
    "innovations": [],
    "priorities": []
  }
}

Be specific to ${input.businessName}. Provide realistic numbers and concrete recommendations.`;
  }

  private validateOutput(data: any): BusinessModelCanvasOutput {
    if (!data.customerSegments || !data.valuePropositions) {
      throw new Error("Invalid Business Model Canvas output structure");
    }
    return data as BusinessModelCanvasOutput;
  }
}

// Export singleton instance
export const businessModelCanvasAgent = new BusinessModelCanvasAgent();
