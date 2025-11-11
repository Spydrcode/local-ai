import { UnifiedAgent, AgentConfig } from '../unified-agent-system';

export class AnsoffMatrixAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'AnsoffMatrixAgent',
      description: 'Analyzes growth strategies using Ansoff Matrix',
      temperature: 0.7,
      maxTokens: 3000,
      jsonMode: true,
      systemPrompt: `You are an expert in the Ansoff Growth Matrix framework.

Analyze growth opportunities across 4 quadrants:
1. Market Penetration (existing products, existing markets)
2. Product Development (new products, existing markets)
3. Market Development (existing products, new markets)
4. Diversification (new products, new markets)

Provide ROI estimates and risk assessment for each strategy.`,
    });
  }

  async analyze(input: { businessName: string; websiteUrl: string; industry: string; siteSummary?: string }): Promise<any> {
    const prompt = `Analyze growth strategies for: ${input.businessName}

Industry: ${input.industry}
Website: ${input.websiteUrl}

Return JSON with Ansoff Matrix analysis:
{
  "marketPenetration": {
    "strategies": [{"strategy": "Specific tactic", "roiEstimate": "15%", "timeframe": "6mo", "investment": "$X", "riskLevel": "low"}],
    "recommendedFocus": "high"
  },
  "productDevelopment": {"strategies": [], "recommendedFocus": "medium"},
  "marketDevelopment": {"strategies": [], "recommendedFocus": "medium"},
  "diversification": {"strategies": [], "recommendedFocus": "low"},
  "prioritizedRoadmap": [{"quarter": "Q1", "strategy": "X", "quadrant": "Market Penetration", "expectedROI": "15%"}],
  "riskAssessment": {"overall": "medium", "factors": ["Risk factors"]}
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const ansoffMatrixAgent = new AnsoffMatrixAgent();
