/**
 * Blue Ocean Strategy Agent
 *
 * Four Actions Framework and value innovation analysis
 */

import { UnifiedAgent, AgentConfig } from '../unified-agent-system';

export class BlueOceanAgent extends UnifiedAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'BlueOceanAgent',
      description: 'Analyzes businesses using Blue Ocean Strategy framework',
      temperature: 0.7,
      maxTokens: 3500,
      jsonMode: true,
      systemPrompt: `You are a Blue Ocean Strategy expert trained on W. Chan Kim and Renée Mauborgne's framework.

Your role is to:
1. Identify red ocean competitive factors
2. Apply the Four Actions Framework (Eliminate, Reduce, Raise, Create)
3. Discover blue ocean opportunities
4. Provide actionable implementation roadmap

Focus on value innovation: simultaneous pursuit of differentiation AND low cost.`,
    };
    super(config);
  }

  async analyze(input: {
    businessName: string;
    websiteUrl: string;
    industry: string;
    siteSummary?: string;
  }): Promise<any> {
    const prompt = `Analyze ${input.businessName} using Blue Ocean Strategy.

Business: ${input.businessName}
Industry: ${input.industry}
Website: ${input.websiteUrl}
${input.siteSummary ? `Summary: ${input.siteSummary}` : ''}

Perform Blue Ocean analysis. Return JSON:

{
  "currentMarket": {
    "redOceanFactors": ["Factors causing competition"],
    "keyCompetitors": ["Competitors"],
    "industryPainPoints": ["Pain points"]
  },
  "fourActionsFramework": {
    "eliminate": [{"factor": "Factor", "reason": "Why", "expectedImpact": "Impact"}],
    "reduce": [{"factor": "Factor", "reason": "Why", "expectedImpact": "Impact"}],
    "raise": [{"factor": "Factor", "reason": "Why", "expectedImpact": "Impact"}],
    "create": [{"factor": "Factor", "reason": "Why", "expectedImpact": "Impact"}]
  },
  "blueOceanStrategy": {
    "valueInnovation": "Core innovation",
    "targetNonCustomers": ["New customer groups"],
    "differentiationAndLowCost": "How to achieve both",
    "strategicMoves": ["Actions"]
  },
  "implementationRoadmap": [
    {"phase": "Phase", "actions": ["Actions"], "expectedOutcome": "Outcome", "investment": "$X", "risks": ["Risks"]}
  ],
  "valueInnovationOpportunities": [
    {"opportunity": "Opportunity", "blueOceanPotential": "high", "requiredActions": ["Actions"], "timeToMarket": "6mo", "estimatedImpact": "Impact"}
  ]
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const blueOceanAgent = new BlueOceanAgent();
