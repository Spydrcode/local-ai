/**
 * ReAct Revenue Leaks Detective Agent
 * Uses reasoning-action loops to investigate revenue loss patterns
 */

import { ReActAgent, Tool } from './react-framework';
import { createChatCompletion } from '../openai';

const revenueTools: Tool[] = [
  {
    name: 'analyze_conversion_funnel',
    description: 'Analyze conversion funnel for drop-off points. Input: {businessType: string, customerJourney: string}',
    execute: async (input: {businessType: string, customerJourney: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Analyze conversion funnel for ${input.businessType}. Customer journey: ${input.customerJourney}. Identify typical drop-off points and conversion rates.`
        }],
        temperature: 0.4,
        maxTokens: 800,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'investigate_pricing_leaks',
    description: 'Investigate pricing-related revenue leaks. Input: {industry: string, services: string[]}',
    execute: async (input: {industry: string, services: string[]}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Investigate pricing leaks for ${input.industry} offering: ${input.services.join(', ')}. Find underpriced services and missed upsell opportunities.`
        }],
        temperature: 0.5,
        maxTokens: 700,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'analyze_customer_churn',
    description: 'Analyze customer retention and churn patterns. Input: {businessModel: string, industry: string}',
    execute: async (input: {businessModel: string, industry: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Analyze customer churn patterns for ${input.businessModel} in ${input.industry}. Identify retention issues and revenue impact.`
        }],
        temperature: 0.4,
        maxTokens: 600,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'calculate_leak_impact',
    description: 'Calculate financial impact of identified revenue leaks. Input: {leaks: any[], annualRevenue: number}',
    execute: async (input: {leaks: any[], annualRevenue: number}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Calculate financial impact of these revenue leaks: ${JSON.stringify(input.leaks)}. Annual revenue: $${input.annualRevenue}. Provide $ amounts and percentages.`
        }],
        temperature: 0.3,
        maxTokens: 500,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  }
];

export class ReActRevenueDetective extends ReActAgent {
  constructor() {
    super(revenueTools, 5);
  }

  async detectRevenueLeaks(businessType: string, businessContext: string, estimatedRevenue?: number) {
    const prompt = `Investigate revenue leaks for this ${businessType} business.

Business Context: ${businessContext}
${estimatedRevenue ? `Estimated Annual Revenue: $${estimatedRevenue}` : ''}

Your investigation:
1. Analyze the conversion funnel for drop-off points
2. Investigate pricing-related revenue leaks
3. Analyze customer churn and retention issues
4. Calculate the financial impact of identified leaks
5. Prioritize fixes by impact and effort

Be thorough - investigate multiple angles and quantify the revenue impact.`;

    const systemPrompt = `You are a revenue optimization detective. Use systematic investigation to find where money is being lost.

Investigation approach:
- Where do customers drop off in the sales process?
- Are services underpriced compared to value delivered?
- Why do customers leave or not return?
- What's the financial impact of each leak?
- Which fixes would have the biggest impact?

Think like a detective - gather evidence before drawing conclusions.`;

    return await this.solve(prompt, systemPrompt);
  }
}