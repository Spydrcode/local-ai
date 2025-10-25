/**
 * Economic Intelligence Agent
 *
 * Analyzes macro-economic trends, regulatory changes, and external factors
 * that impact business strategy and profitability predictions.
 *
 * Key Capabilities:
 * - Economic trend analysis (inflation, unemployment, consumer confidence)
 * - Industry-specific impact assessment
 * - Regulatory/policy change monitoring (SNAP, minimum wage, tax policy)
 * - Supply chain disruption forecasting
 * - Demand prediction modeling
 * - Scenario planning (best/worst/likely cases)
 */

import { createChatCompletion } from "../openai";

export interface EconomicContext {
  // Current Economic Indicators
  inflation: {
    rate: number;
    trend: "rising" | "falling" | "stable";
    impact: string;
  };
  unemployment: {
    rate: number;
    trend: "rising" | "falling" | "stable";
    impact: string;
  };
  consumerConfidence: {
    index: number;
    trend: "rising" | "falling" | "stable";
    impact: string;
  };
  interestRates: {
    current: number;
    trend: "rising" | "falling" | "stable";
    impact: string;
  };

  // Regulatory & Policy Environment
  regulatoryChanges: Array<{
    policy: string;
    status: "proposed" | "enacted" | "threatened";
    timeline: string;
    industryImpact: string;
    severity: "critical" | "major" | "moderate" | "minor";
  }>;

  // Supply Chain & Market Conditions
  supplyChainFactors: Array<{
    factor: string;
    status: "disrupted" | "recovering" | "stable";
    affectedIndustries: string[];
    expectedDuration: string;
  }>;

  // Consumer Behavior Shifts
  demandTrends: Array<{
    segment: string;
    trend: "increasing" | "decreasing" | "shifting";
    drivers: string[];
    affectedCategories: string[];
  }>;
}

export interface IndustryImpactAnalysis {
  industry: string;
  overallRisk: "critical" | "high" | "moderate" | "low";

  // Economic Factor Impacts
  economicImpacts: Array<{
    factor: string;
    impact: "positive" | "negative" | "neutral";
    magnitude: "high" | "medium" | "low";
    explanation: string;
    timeframe: "immediate" | "3-6 months" | "6-12 months" | "12+ months";
  }>;

  // Specific Threats & Opportunities
  threats: Array<{
    threat: string;
    probability: "high" | "medium" | "low";
    severity: "critical" | "major" | "moderate" | "minor";
    mitigation: string;
  }>;

  opportunities: Array<{
    opportunity: string;
    probability: "high" | "medium" | "low";
    potentialGain: string;
    actionRequired: string;
  }>;

  // Scenario Planning
  scenarios: {
    worstCase: {
      description: string;
      revenueImpact: string;
      survivalActions: string[];
      probability: string;
    };
    likelyCase: {
      description: string;
      revenueImpact: string;
      recommendedActions: string[];
      probability: string;
    };
    bestCase: {
      description: string;
      revenueImpact: string;
      growthActions: string[];
      probability: string;
    };
  };

  // Tactical Recommendations
  immediateActions: Array<{
    action: string;
    priority: "urgent" | "high" | "medium";
    expectedImpact: string;
    implementation: string;
  }>;

  hedgingStrategies: Array<{
    strategy: string;
    protectsAgainst: string;
    cost: string;
    benefit: string;
  }>;
}

export interface ProfitPredictionModel {
  businessName: string;
  industry: string;
  currentRevenue?: number;

  // Baseline Prediction (without macro factors)
  baselineForecast: {
    year1: { revenue: string; margin: string; confidence: string };
    year2: { revenue: string; margin: string; confidence: string };
    year3: { revenue: string; margin: string; confidence: string };
  };

  // Macro-Adjusted Prediction
  adjustedForecast: {
    year1: {
      revenue: string;
      margin: string;
      confidence: string;
      adjustment: string;
    };
    year2: {
      revenue: string;
      margin: string;
      confidence: string;
      adjustment: string;
    };
    year3: {
      revenue: string;
      margin: string;
      confidence: string;
      adjustment: string;
    };
  };

  // Key Assumptions
  assumptions: Array<{
    assumption: string;
    impact: "high" | "medium" | "low";
    confidence: "high" | "medium" | "low";
  }>;

  // Sensitivity Analysis
  sensitivities: Array<{
    variable: string;
    baseCase: string;
    optimistic: string;
    pessimistic: string;
    revenueImpact: string;
  }>;

  // Risk Factors
  riskFactors: Array<{
    risk: string;
    probability: "high" | "medium" | "low";
    impact: string;
    mitigation: string;
  }>;
}

/**
 * System prompt for Economic Intelligence analysis
 */
const ECONOMIC_INTELLIGENCE_PROMPT = `You are an elite economic analyst and strategic forecaster specializing in translating macro-economic trends into actionable business strategy.

**YOUR EXPERTISE**:
- Macro-economics and industry-specific impacts
- Regulatory policy analysis (federal, state, local)
- Supply chain dynamics and disruption modeling
- Consumer behavior and demand forecasting
- Scenario planning and risk mitigation
- Financial modeling and profit prediction

**CRITICAL REQUIREMENTS**:
1. **Be Specific to Current Date**: Reference actual current economic conditions (October 2025)
2. **Industry-Specific Analysis**: Tailor impacts to the ACTUAL business type being analyzed
3. **Actionable Intelligence**: Every insight must include specific actions the business can take
4. **Quantify When Possible**: Use percentages, dollar amounts, timeframes
5. **Scenario Realism**: Base best/worst/likely cases on actual economic data and trends

**CURRENT ECONOMIC CONTEXT** (October 2025 - UPDATE BASED ON ACTUAL CONDITIONS):
- Inflation: Monitor current CPI data
- Unemployment: Check current labor market stats
- Interest Rates: Reference current Fed policy
- Major Policy Changes: Government funding, SNAP benefits, minimum wage bills, tax policy
- Supply Chain: Current disruption status by industry
- Consumer Sentiment: Track confidence indexes

**ANALYSIS FRAMEWORK**:

For EVERY industry analyzed, consider:
1. **Direct Economic Impacts**: How does inflation/unemployment/interest rates affect THIS industry?
2. **Policy Impacts**: Which current/proposed policies directly impact THIS business type?
3. **Supply Chain**: What input costs or availability issues affect THIS industry?
4. **Demand Shifts**: How are consumer behaviors changing for THIS industry's products/services?
5. **Competitive Dynamics**: How do macro factors change competitive landscape for THIS industry?

**EXAMPLES OF INDUSTRY-SPECIFIC ANALYSIS**:

**Propane Delivery Service**:
- SNAP cuts → NEGATIVE: Low-income households reduce propane heating (5-8% demand drop in affected areas)
- Rising interest rates → NEGATIVE: Fewer new home builds = less new customer acquisition
- Winter weather severity → POSITIVE/NEGATIVE: Harsh winter increases demand but also emergency response costs
- Supply chain: Propane wholesale prices tied to crude oil (monitor futures)
- Mitigation: Offer payment plans, focus on commercial clients less affected by SNAP, hedge fuel costs

**Restaurant / Food Service**:
- SNAP cuts → CRITICAL: 15-25% revenue drop for casual dining in low-income areas (Supplemental Nutrition Assistance Program is primary grocery funding)
- Minimum wage increases → NEGATIVE: 8-12% labor cost increase
- Food inflation → NEGATIVE: Ingredient costs up 6-8%, menu price resistance from consumers
- Consumer confidence down → NEGATIVE: Discretionary dining spend drops 10-15%
- Mitigation: Shift to value menu items, reduce portions, optimize labor scheduling, consider ghost kitchen model

**Professional Services / B2B**:
- Rising interest rates → NEGATIVE: Corporate clients delay projects, slower decision cycles
- Corporate tax changes → VARIABLE: Depends on specific policy
- Economic uncertainty → NEGATIVE: Reduced consulting/professional service budgets
- Remote work trends → POSITIVE: More outsourcing of specialized services
- Mitigation: Offer retainer models for predictable revenue, focus on essential services, build recession-proof service lines

**SCENARIO PLANNING RULES**:

**Worst Case** (15-25% probability):
- Multiple negative factors compound
- Regulatory changes enacted in harshest form
- Consumer spending contracts sharply
- Supply chain disruptions worsen
- Actions focus on SURVIVAL: cash preservation, cost cutting, pivot to essential services

**Likely Case** (50-65% probability):
- Mixed economic signals
- Some regulatory changes enacted in moderate form
- Consumer spending stable but cautious
- Supply chain gradually normalizing
- Actions focus on ADAPTATION: selective investment, operational efficiency, customer retention

**Best Case** (15-25% probability):
- Economic headwinds ease
- Favorable policy outcomes
- Consumer confidence rebounds
- New opportunities emerge
- Actions focus on GROWTH: market expansion, new offerings, strategic investments

**OUTPUT REQUIREMENTS**:
- Every threat must include specific mitigation action
- Every opportunity must include concrete next steps
- Revenue impacts must include % or $ ranges
- Timeframes must be specific (Q1 2026, not "soon")
- Hedging strategies must include cost/benefit analysis`;

/**
 * Analyze current economic environment for a specific industry
 */
export async function analyzeEconomicEnvironment(
  industry: string,
  businessContext?: string
): Promise<IndustryImpactAnalysis> {
  const prompt = `Analyze the current economic environment (October 2025) and its impact on THIS SPECIFIC INDUSTRY.

**INDUSTRY TO ANALYZE**: ${industry}

${businessContext ? `**SPECIFIC BUSINESS CONTEXT**:\n${businessContext}\n` : ""}

**CURRENT ECONOMIC EVENTS** (October 2025):
Based on actual current conditions, analyze:
1. Federal government shutdown threat and SNAP benefit cuts
2. Current inflation rates and consumer price impacts
3. Interest rate environment and Fed policy
4. Labor market conditions (unemployment, wage pressures)
5. Supply chain status for this industry
6. Consumer confidence and spending patterns
7. Relevant regulatory/policy changes affecting this industry

**REQUIRED ANALYSIS**:
Provide comprehensive economic intelligence specifically tailored to ${industry}:

1. **Economic Factor Impacts**: For each major economic factor (inflation, rates, SNAP cuts, etc.), explain SPECIFIC impact on THIS industry with quantified estimates

2. **Threats**: Identify 3-5 specific threats from economic/policy environment, with probability, severity, and concrete mitigation strategies

3. **Opportunities**: Identify 2-4 opportunities created by current conditions, with probability, potential gain, and required actions

4. **Scenario Planning**: Create realistic best/worst/likely scenarios with:
   - Specific revenue impact estimates (%, $ ranges)
   - Detailed action lists for each scenario
   - Probability assessments

5. **Immediate Actions**: Prioritized list of actions to take NOW based on current environment

6. **Hedging Strategies**: Specific ways to protect against economic risks

Return as JSON matching IndustryImpactAnalysis interface.`;

  const response = await createChatCompletion({
    messages: [
      { role: "system", content: ECONOMIC_INTELLIGENCE_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 2500,
    jsonMode: true,
  });

  return JSON.parse(response);
}

/**
 * Generate profit predictions with macro-economic adjustments
 */
export async function predictProfitWithEconomicFactors(
  businessName: string,
  industry: string,
  businessContext: string,
  currentRevenue?: number
): Promise<ProfitPredictionModel> {
  const prompt = `Create a detailed profit prediction model for THIS SPECIFIC BUSINESS, accounting for current macro-economic environment.

**BUSINESS TO ANALYZE**:
Name: ${businessName}
Industry: ${industry}
${currentRevenue ? `Current Annual Revenue: $${currentRevenue.toLocaleString()}` : "Revenue: Unknown (estimate based on industry norms)"}

**BUSINESS CONTEXT**:
${businessContext}

**YOUR TASK**:
1. **Baseline Forecast**: Predict revenue/margins for Years 1-3 assuming stable economic conditions
2. **Macro-Adjusted Forecast**: Adjust predictions based on ACTUAL current economic environment (government shutdown threats, SNAP cuts, inflation, interest rates, etc.)
3. **Quantify Adjustments**: Show specific % or $ impact of each major economic factor
4. **Risk Analysis**: Identify key risks and their probability/impact
5. **Sensitivity Analysis**: Show how revenue changes if key variables change

**CRITICAL**: 
- Be specific to THIS industry (${industry}) - different industries react differently to same economic factors
- Use realistic numbers based on industry benchmarks
- Explain the LOGIC behind each adjustment
- Include confidence levels (high/medium/low) for predictions

Return as JSON matching ProfitPredictionModel interface.`;

  const response = await createChatCompletion({
    messages: [
      { role: "system", content: ECONOMIC_INTELLIGENCE_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.75,
    maxTokens: 2000,
    jsonMode: true,
  });

  return JSON.parse(response);
}

/**
 * Generate current economic context summary (can be cached/updated daily)
 */
export async function getCurrentEconomicContext(): Promise<EconomicContext> {
  const prompt = `Generate a comprehensive current economic context summary for October 2025.

**REQUIRED DATA**:
1. **Economic Indicators**: Current inflation, unemployment, consumer confidence, interest rates with trends
2. **Regulatory Changes**: Major policy changes affecting businesses (SNAP, minimum wage, government funding, tax policy)
3. **Supply Chain**: Current disruption status by major industry
4. **Consumer Trends**: Significant demand shifts or behavioral changes

**CRITICAL**: Use ACTUAL current data for October 2025. Reference real policies, real data points, real trends.

Return as JSON matching EconomicContext interface.`;

  const response = await createChatCompletion({
    messages: [
      { role: "system", content: ECONOMIC_INTELLIGENCE_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.6, // Lower temp for factual data
    maxTokens: 1500,
    jsonMode: true,
  });

  return JSON.parse(response);
}
