import { UnifiedAgent } from '../unified-agent-system';

export class CustomerJourneyAgent extends UnifiedAgent {
  constructor() {
    super({
      name: 'CustomerJourneyAgent',
      description: 'Customer journey mapping from awareness to advocacy',
      temperature: 0.7,
      maxTokens: 3500,
      jsonMode: true,
      systemPrompt: `You are an expert in customer journey mapping and CX optimization.

Map the customer journey across all touchpoints:
- Awareness
- Consideration
- Purchase
- Retention
- Advocacy

Identify pain points, drop-off points, and optimization opportunities.`,
    });
  }

  async analyze(input: { businessName: string; websiteUrl: string; industry: string; siteSummary?: string }): Promise<any> {
    const prompt = `Customer journey map for: ${input.businessName}

Industry: ${input.industry}

Return JSON:
{
  "awarenessStage": {"touchpoints": [{"touchpoint": "Google Search", "effectiveness": "medium", "painPoints": ["Hard to find"]}], "conversionRate": "10%"},
  "considerationStage": {"touchpoints": [], "conversionRate": "30%"},
  "purchaseStage": {"touchpoints": [], "conversionRate": "60%"},
  "retentionStage": {"touchpoints": [], "churnRate": "5%"},
  "advocacyStage": {"touchpoints": [], "npsScore": 45},
  "criticalDropOffPoints": [{"stage": "Consideration", "dropOff": "70%", "reasons": ["Price shock"], "fixes": ["Show ROI calculator"]}],
  "quickWins": [{"optimization": "Add live chat", "stage": "Purchase", "expectedLift": "15%", "effort": "low", "cost": "$500/mo"}]
}`;

    const response = await super.execute(prompt);
    return JSON.parse(response.content);
  }
}

export const customerJourneyAgent = new CustomerJourneyAgent();
