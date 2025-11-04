import { createChatCompletion } from "../openai";

export interface EconomicIndicators {
  inflation: { rate: number; trend: string; impact: string };
  unemployment: { rate: number; trend: string; impact: string };
  interestRates: { current: number; trend: string; impact: string };
  consumerConfidence: { index: number; trend: string; impact: string };
}

export interface IndustryEconomicImpact {
  industry: string;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  economicFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    magnitude: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  revenueForecasts: {
    year1: { baseline: string; adjusted: string; impact: string };
    year2: { baseline: string; adjusted: string; impact: string };
    year3: { baseline: string; adjusted: string; impact: string };
  };
}

export async function getCurrentEconomicData(): Promise<EconomicIndicators> {
  const response = await createChatCompletion({
    messages: [{
      role: "user",
      content: `Provide current economic indicators for December 2024:
      - Inflation rate and trend
      - Unemployment rate and trend  
      - Interest rates and Fed policy direction
      - Consumer confidence index and trend
      
      Return as JSON with specific numbers and explanations.`
    }],
    temperature: 0.3,
    maxTokens: 800,
    jsonMode: true
  });

  return JSON.parse(response);
}

export async function analyzeIndustryEconomicImpact(
  industry: string, 
  businessContext: string
): Promise<IndustryEconomicImpact> {
  const response = await createChatCompletion({
    messages: [{
      role: "user", 
      content: `Analyze economic impact on ${industry} business:

      Business Context: ${businessContext}

      Provide:
      1. Overall economic risk level
      2. Impact of current economic factors (inflation, rates, etc.)
      3. 3-year revenue forecasts with economic adjustments
      4. Specific recommendations for this industry

      Return detailed JSON analysis.`
    }],
    temperature: 0.7,
    maxTokens: 1500,
    jsonMode: true
  });

  return JSON.parse(response);
}