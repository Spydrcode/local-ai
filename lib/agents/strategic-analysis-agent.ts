/**
 * Strategic Analysis Agent for Small Business
 * Comprehensive strategic framework analysis with tools and structured outputs
 */

import { createChatCompletion } from "../openai";

export interface PricingAnalysis {
  currentPosition: 'premium' | 'competitive' | 'value' | 'discount';
  pricingPower: {
    score: number; // 1-10
    enablers: string[];
    constraints: string[];
  };
  competitiveLandscape: {
    averagePrice: string;
    priceRange: string;
    differentiators: string[];
  };
  recommendations: {
    immediate: string[];
    strategic: string[];
    premiumOpportunities: string[];
  };
}

export interface CompetitiveAnalysis {
  competitivePosition: 'leader' | 'challenger' | 'follower' | 'niche';
  moatStrength: number; // 1-10
  advantages: string[];
  vulnerabilities: string[];
  threats: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface ValueChainAnalysis {
  primaryActivities: {
    [key: string]: {
      description: string;
      costDriver: string;
      valueDriver: string;
      competitiveAdvantage: boolean;
      improvementOpportunity: string;
    };
  };
  supportActivities: {
    [key: string]: {
      description: string;
      improvementOpportunity: string;
      priority: 'high' | 'medium' | 'low';
    };
  };
  quickWins: string[];
  strategicInitiatives: string[];
}

export class StrategicAnalysisAgent {
  
  async analyzePricingPower(
    businessName: string,
    industry: string,
    businessContext: string
  ): Promise<PricingAnalysis> {
    const prompt = `Analyze pricing power for ${businessName} in ${industry}.

Business Context: ${businessContext}

Provide comprehensive pricing analysis:

1. CURRENT PRICING POSITION
   - Assess if they're premium, competitive, value, or discount positioned
   - Rate their pricing power (1-10 scale)

2. PRICING ENABLERS & CONSTRAINTS
   - What allows them to charge more (quality, brand, service, etc.)
   - What limits their pricing (competition, commoditization, etc.)

3. COMPETITIVE LANDSCAPE
   - Typical pricing in their market
   - How they compare to competitors
   - Key differentiators that justify pricing

4. ACTIONABLE RECOMMENDATIONS
   - 3 immediate pricing tests they can run
   - 2 strategic pricing moves for long-term
   - 1 premium offering opportunity

Be specific to their actual business and industry.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are a pricing strategy expert for small businesses. Provide actionable, specific analysis."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true
    });

    return JSON.parse(response);
  }

  async analyzeCompetitiveMoat(
    businessName: string,
    industry: string,
    businessContext: string
  ): Promise<CompetitiveAnalysis> {
    const prompt = `Analyze competitive positioning for ${businessName} in ${industry}.

Business Context: ${businessContext}

Provide competitive moat analysis:

1. COMPETITIVE POSITION
   - Are they a leader, challenger, follower, or niche player?
   - Rate their moat strength (1-10)

2. COMPETITIVE ADVANTAGES
   - What makes customers choose them over competitors
   - Sustainable vs temporary advantages
   - Barriers to entry they've created

3. VULNERABILITIES & THREATS
   - Where competitors could attack them
   - Market changes that threaten their position
   - Internal weaknesses to address

4. OPPORTUNITIES & RECOMMENDATIONS
   - Gaps in the market they could exploit
   - Ways to strengthen their moat
   - Specific actions to take this quarter

Focus on actionable insights for a small business.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are a competitive strategy expert. Analyze like a business consultant."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true
    });

    return JSON.parse(response);
  }

  async analyzeValueChain(
    businessName: string,
    industry: string,
    businessContext: string
  ): Promise<ValueChainAnalysis> {
    const prompt = `Map the value chain for ${businessName} in ${industry}.

Business Context: ${businessContext}

Analyze their value chain:

1. PRIMARY ACTIVITIES
   For each activity (inbound logistics, operations, outbound logistics, marketing/sales, service):
   - What they actually do
   - Main cost driver
   - Main value driver  
   - Whether it creates competitive advantage
   - Improvement opportunity

2. SUPPORT ACTIVITIES
   For each (infrastructure, HR, technology, procurement):
   - Current state description
   - Improvement opportunity
   - Priority level (high/medium/low)

3. OPTIMIZATION OPPORTUNITIES
   - 3 quick wins (low effort, high impact)
   - 2 strategic initiatives (higher effort, transformational)

Be specific to their actual business operations.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are a value chain optimization expert. Focus on practical improvements."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1800,
      jsonMode: true
    });

    return JSON.parse(response);
  }

  async generateQuickWins(
    businessName: string,
    industry: string,
    businessContext: string
  ): Promise<{
    quickWins: Array<{
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      timeline: string;
      expectedROI: string;
    }>;
    thisWeekActions: string[];
  }> {
    const prompt = `Generate quick wins for ${businessName} in ${industry}.

Business Context: ${businessContext}

Identify immediate opportunities:

1. QUICK WINS (High Impact, Low Effort)
   - 5 specific actions they can take in next 30 days
   - For each: title, description, impact level, effort level, timeline, expected ROI

2. THIS WEEK ACTIONS
   - 3 specific things they can do this week
   - Must be actionable and concrete

Focus on revenue-generating and cost-saving opportunities that require minimal investment.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: "You are a business optimization consultant. Focus on immediate, actionable wins."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      maxTokens: 1200,
      jsonMode: true
    });

    return JSON.parse(response);
  }
}