import { UnifiedAgent } from '../unified-agent-system';

export class BCGMatrixAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'BCGMatrixAgent',
      description: 'BCG Portfolio Matrix - Stars, Cash Cows, Question Marks, Dogs',
      temperature: 0.7,
      maxTokens: 3000,
      jsonMode: true,
      systemPrompt: `You are an expert in the BCG Growth-Share Matrix.

Categorize products/services into:
- Stars: High growth, high market share
- Cash Cows: Low growth, high market share
- Question Marks: High growth, low market share
- Dogs: Low growth, low market share

Provide investment/divestment recommendations.`,
    });
  }

  async analyze(input: { businessName: string; websiteUrl: string; industry: string; siteSummary?: string }): Promise<any> {
    const prompt = `BCG Matrix analysis for: ${input.businessName}

Industry: ${input.industry}

Return JSON:
{
  "stars": [{"product": "X", "marketShare": "25%", "growthRate": "30%", "recommendation": "Invest heavily", "investment": "$X"}],
  "cashCows": [],
  "questionMarks": [],
  "dogs": [],
  "portfolioStrategy": {"overall": "Strategy", "rebalancing": ["Actions"]},
  "investmentPriorities": [{"product": "X", "category": "Star", "investment": "$X", "expectedReturn": "Y%"}]
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const bcgMatrixAgent = new BCGMatrixAgent();
