/**
 * ReAct Economic Intelligence Agent
 * Uses reasoning-action loops to gather and analyze economic data
 */

import { ReActAgent, Tool } from './react-framework';
import { getCurrentEconomicData, analyzeIndustryEconomicImpact } from '../tools/economic-data';
import { createChatCompletion } from '../openai';

// Economic data gathering tools
const economicTools: Tool[] = [
  {
    name: 'get_economic_indicators',
    description: 'Get current economic indicators (inflation, unemployment, interest rates, consumer confidence)',
    execute: async () => await getCurrentEconomicData()
  },
  {
    name: 'analyze_industry_impact', 
    description: 'Analyze how economic factors impact a specific industry. Input: {industry: string, context: string}',
    execute: async (input: {industry: string, context: string}) => 
      await analyzeIndustryEconomicImpact(input.industry, input.context)
  },
  {
    name: 'research_regulatory_changes',
    description: 'Research current regulatory and policy changes affecting businesses',
    execute: async () => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: 'List current major regulatory/policy changes affecting US businesses in 2024-2025 (SNAP, minimum wage, tax policy, etc.)'
        }],
        temperature: 0.3,
        maxTokens: 800,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'validate_economic_data',
    description: 'Cross-validate economic data for accuracy. Input: {data: any, source: string}',
    execute: async (input: {data: any, source: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user', 
          content: `Validate this economic data from ${input.source}: ${JSON.stringify(input.data)}. Check for accuracy and flag any inconsistencies.`
        }],
        temperature: 0.2,
        maxTokens: 500,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  }
];

export class ReActEconomicAgent extends ReActAgent {
  constructor() {
    super(economicTools, 6); // Allow more iterations for complex analysis
  }

  async analyzeEconomicEnvironment(industry: string, businessContext: string) {
    const prompt = `Analyze the current economic environment and its impact on ${industry} business.

Business Context: ${businessContext}

Your task:
1. Gather current economic indicators
2. Research relevant regulatory changes  
3. Analyze industry-specific impacts
4. Validate your findings
5. Provide comprehensive economic intelligence with profit predictions

Be thorough - use multiple tools to cross-validate data and ensure accuracy.`;

    const systemPrompt = `You are an expert economic analyst. Use the available tools to gather comprehensive economic intelligence.

Think step by step:
- What economic data do I need?
- How do current conditions affect this specific industry?
- What regulatory changes are relevant?
- How can I validate my findings?
- What are the profit implications?

Always validate critical data points and cross-reference sources.`;

    return await this.solve(prompt, systemPrompt);
  }
}

// Market Forces ReAct Agent
const marketTools: Tool[] = [
  {
    name: 'research_competitors',
    description: 'Research competitors in a specific industry and location. Input: {industry: string, location: string}',
    execute: async (input: {industry: string, location: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Research competitors for ${input.industry} business in ${input.location}. Provide company names, market position, and key differentiators.`
        }],
        temperature: 0.4,
        maxTokens: 1000,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'analyze_market_trends',
    description: 'Analyze current market trends for an industry. Input: {industry: string}',
    execute: async (input: {industry: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Analyze current market trends, demand drivers, and growth patterns for ${input.industry} industry.`
        }],
        temperature: 0.5,
        maxTokens: 800,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  },
  {
    name: 'validate_competitor_data',
    description: 'Validate competitor information for accuracy. Input: {competitors: any[], industry: string}',
    execute: async (input: {competitors: any[], industry: string}) => {
      const response = await createChatCompletion({
        messages: [{
          role: 'user',
          content: `Validate this competitor data for ${input.industry}: ${JSON.stringify(input.competitors)}. Check for accuracy and completeness.`
        }],
        temperature: 0.2,
        maxTokens: 600,
        jsonMode: true
      });
      return JSON.parse(response);
    }
  }
];

export class ReActMarketForcesAgent extends ReActAgent {
  constructor() {
    super(marketTools, 5);
  }

  async analyzeMarketForces(industry: string, location: string, businessContext: string) {
    const prompt = `Analyze competitive landscape and market dynamics for ${industry} business in ${location}.

Business Context: ${businessContext}

Your task:
1. Research direct competitors in the area
2. Analyze market trends affecting this industry
3. Validate competitor information
4. Identify market opportunities and threats
5. Provide actionable competitive intelligence

Focus on accuracy - validate your findings before drawing conclusions.`;

    const systemPrompt = `You are a competitive intelligence analyst. Use tools to gather comprehensive market data.

Think systematically:
- Who are the real competitors?
- What market trends are affecting this industry?
- How accurate is my competitor data?
- What opportunities exist in this market?

Always cross-validate competitor information and market data.`;

    return await this.solve(prompt, systemPrompt);
  }
}