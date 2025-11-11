import { UnifiedAgent } from '../unified-agent-system';

export class OKRAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'OKRAgent',
      description: 'OKR (Objectives & Key Results) framework',
      temperature: 0.7,
      maxTokens: 3500,
      jsonMode: true,
      systemPrompt: `You are an expert in the OKR (Objectives & Key Results) framework.

Create quarterly OKRs that are:
- Objectives: Ambitious, qualitative goals
- Key Results: Measurable outcomes (3-5 per objective)

Follow Google's OKR best practices. Objectives inspire, Key Results are measurable.`,
    });
  }

  async analyze(input: { businessName: string; websiteUrl: string; industry: string; siteSummary?: string }): Promise<any> {
    const prompt = `Create quarterly OKRs for: ${input.businessName}

Industry: ${input.industry}

Return JSON:
{
  "companyOKRs": [
    {
      "objective": "Become the #1 choice for X in Y market",
      "keyResults": [
        {"kr": "Increase market share from 10% to 15%", "baseline": "10%", "target": "15%", "metric": "Market share"},
        {"kr": "Achieve NPS of 50+", "baseline": "35", "target": "50", "metric": "NPS"}
      ],
      "confidence": "70%"
    }
  ],
  "departmentOKRs": {
    "sales": [],
    "marketing": [],
    "product": [],
    "operations": []
  },
  "trackingCadence": {"weeklyCheckins": true, "monthlyReviews": true, "quarterlyGrading": true},
  "scoringGuidelines": "0.0-0.3 = We failed, 0.4-0.6 = Progress, 0.7-1.0 = Delivered"
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const okrAgent = new OKRAgent();
