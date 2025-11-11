import { UnifiedAgent } from '../unified-agent-system';

export class PositioningMapAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'PositioningMapAgent',
      description: 'Competitive positioning map analysis',
      temperature: 0.7,
      maxTokens: 3000,
      jsonMode: true,
      systemPrompt: `You are an expert in competitive positioning analysis.

Create 2x2 positioning maps showing market gaps and competitive landscape.
Identify white space opportunities and repositioning strategies.`,
    });
  }

  async analyze(input: { businessName: string; websiteUrl: string; industry: string; siteSummary?: string }): Promise<any> {
    const prompt = `Competitive positioning map for: ${input.businessName}

Industry: ${input.industry}

Return JSON:
{
  "primaryMap": {"xAxis": "Price", "yAxis": "Quality", "competitors": [{"name": "X", "x": 7, "y": 8}], "yourPosition": {"x": 5, "y": 6}},
  "alternativeMaps": [],
  "marketGaps": [{"gap": "High quality, low price", "opportunity": "Blue ocean", "difficulty": "high"}],
  "repositioningStrategies": [{"strategy": "Move to premium", "rationale": "Why", "investment": "$X", "timeframe": "12mo"}]
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const positioningMapAgent = new PositioningMapAgent();
