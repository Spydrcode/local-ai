/**
 * Pricing Intelligence Agent
 * Researches actual market prices and costs for specific products/services
 */

import { createChatCompletion } from "../openai";

export interface PricingIntelligence {
  product: string;
  currentMarketData: {
    wholesaleCost: string;
    retailPrice: string;
    margin: string;
    lastUpdated: string;
  };
  competitorPricing: Array<{
    competitor: string;
    price: string;
    service: string;
  }>;
  costAnalysis: {
    directCosts: Array<{ item: string; cost: string }>;
    operatingCosts: Array<{ item: string; cost: string }>;
    totalCostPerUnit: string;
    breakEvenPrice: string;
  };
  pricingRecommendations: {
    currentPrice: string;
    recommendedPrice: string;
    priceIncrease: string;
    justification: string[];
  };
}

export class PricingIntelligenceAgent {
  
  async analyzePropanePricing(businessContext: string, location: string): Promise<PricingIntelligence> {
    const prompt = `Research current propane pricing for a propane delivery business.

Business Context: ${businessContext}
Location: ${location}

Provide REAL pricing intelligence for December 2024:

1. CURRENT MARKET DATA
   - Wholesale propane cost per gallon (current market rate)
   - Typical retail delivery price per gallon
   - Industry standard margin percentage
   
2. COMPETITOR PRICING RESEARCH
   - Major competitors (AmeriGas, Suburban Propane, Ferrellgas)
   - Local independent dealers
   - Their current delivery prices and service fees

3. COST BREAKDOWN ANALYSIS
   - Direct costs: propane wholesale, delivery fuel, driver wages
   - Operating costs: truck maintenance, insurance, licensing
   - Calculate total cost per gallon delivered
   - Break-even price point

4. PRICING RECOMMENDATIONS
   - Current market price they should charge
   - Recommended price increase if underpriced
   - Justification for premium pricing (emergency service, local presence, etc.)

Use current 2024 propane market data and real competitor pricing.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are a propane industry pricing analyst with access to current market data. Provide specific, actionable pricing intelligence with real numbers."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true
    });

    return JSON.parse(response);
  }

  async analyzeServicePricing(
    serviceType: string,
    businessContext: string,
    location: string
  ): Promise<PricingIntelligence> {
    const prompt = `Research current pricing for ${serviceType} services.

Business Context: ${businessContext}
Location: ${location}

Provide pricing intelligence:

1. CURRENT MARKET RATES
   - Industry standard pricing for ${serviceType}
   - Regional variations for ${location}
   - Seasonal pricing patterns

2. COMPETITOR ANALYSIS
   - Major competitors in ${location}
   - Their current service rates
   - Value-added services and pricing

3. COST STRUCTURE
   - Labor costs (wages, benefits, training)
   - Equipment and material costs
   - Overhead allocation per service call
   - Total cost per service

4. PRICING STRATEGY
   - Market-rate pricing recommendation
   - Premium pricing opportunities
   - Bundle pricing options

Focus on actionable pricing data for ${serviceType} in ${location}.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: `You are a ${serviceType} industry pricing expert. Provide current market pricing data and competitive analysis.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true
    });

    return JSON.parse(response);
  }

  async detectBusinessType(businessContext: string): Promise<string> {
    const businessTypes = [
      'propane delivery',
      'hvac services', 
      'plumbing services',
      'electrical services',
      'restaurant/food service',
      'retail store',
      'professional services',
      'automotive services',
      'landscaping services',
      'cleaning services'
    ];

    for (const type of businessTypes) {
      if (businessContext.toLowerCase().includes(type.split(' ')[0])) {
        return type;
      }
    }

    return 'general services';
  }
}