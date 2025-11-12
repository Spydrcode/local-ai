/**
 * Business Context Types
 * First-party data collected directly from business owners
 * Critical for accurate strategic framework analysis
 */

import { z } from "zod";

// ============================================================================
// BUSINESS CONTEXT SCHEMA
// ============================================================================

export const businessContextSchema = z.object({
  // Identifiers
  demoId: z.string(),
  agencyId: z.string().optional(),
  userId: z.string().optional(),

  // Quantitative Metrics
  annualRevenue: z.number().optional(),
  monthlyLeads: z.number().optional(),
  conversionRate: z.number().min(0).max(100).optional(),
  customerAcquisitionCost: z.number().optional(),
  customerLifetimeValue: z.number().optional(),
  averageTransactionValue: z.number().optional(),
  monthlyWebsiteVisitors: z.number().optional(),
  employeeCount: z.number().optional(),

  // Revenue by Product/Service (for BCG Matrix)
  revenueByProduct: z
    .array(
      z.object({
        name: z.string(),
        revenue: z.number(),
        growthRate: z.number().optional(), // % growth year-over-year
        marketShare: z.number().optional(), // % of market
      })
    )
    .optional(),

  // Strategic Goals
  primaryGoals: z.array(
    z.enum([
      "increase-revenue",
      "expand-markets",
      "improve-retention",
      "enhance-brand",
      "optimize-operations",
      "launch-products",
      "reduce-costs",
      "improve-customer-satisfaction",
    ])
  ),

  // Target Market Segments
  targetSegments: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        size: z.enum(["small", "medium", "large"]).optional(),
        priority: z.number().min(1).max(5), // 1=highest, 5=lowest
        currentPenetration: z.number().min(0).max(100).optional(), // %
      })
    )
    .optional(),

  // Competitive Intelligence
  keyCompetitors: z
    .array(
      z.object({
        name: z.string(),
        website: z.string().optional(),
        estimatedMarketShare: z.number().optional(),
        strengths: z.array(z.string()).optional(),
        weaknesses: z.array(z.string()).optional(),
      })
    )
    .optional(),

  // Positioning & Differentiation
  uniqueValueProposition: z.string().optional(),
  competitiveAdvantages: z.array(z.string()).optional(),
  brandAttributes: z.array(z.string()).optional(),

  // Business Challenges
  mainChallenges: z.array(z.string()).optional(),
  constraintsLimitations: z
    .object({
      budget: z.string().optional(),
      time: z.string().optional(),
      resources: z.string().optional(),
      technical: z.string().optional(),
    })
    .optional(),

  // Business Stage & Positioning
  growthStage: z.enum(["startup", "growth", "mature", "decline"]),
  marketPosition: z.enum(["leader", "challenger", "follower", "niche"]),
  competitiveStrategy: z.enum(["cost-leadership", "differentiation", "focus", "hybrid"]),

  // Market & Industry Context
  industryType: z.string().optional(),
  marketSize: z.string().optional(), // e.g., "$10M-$50M"
  marketGrowthRate: z.number().optional(), // % annual growth
  seasonality: z
    .object({
      hasSeasonal: z.boolean(),
      peakMonths: z.array(z.string()).optional(),
      lowMonths: z.array(z.string()).optional(),
    })
    .optional(),

  // Customer Insights
  customerDemographics: z
    .object({
      ageRange: z.string().optional(),
      incomeLevel: z.string().optional(),
      geography: z.string().optional(),
      behaviors: z.array(z.string()).optional(),
    })
    .optional(),

  customerPainPoints: z.array(z.string()).optional(),
  customerSuccessMetrics: z.array(z.string()).optional(),

  // Marketing & Channels
  primaryMarketingChannels: z
    .array(
      z.enum([
        "organic-search",
        "paid-search",
        "social-media",
        "email",
        "referral",
        "direct-mail",
        "events",
        "partnerships",
        "content-marketing",
        "traditional-media",
      ])
    )
    .optional(),

  marketingBudget: z.number().optional(),
  marketingBudgetAllocation: z
    .array(
      z.object({
        channel: z.string(),
        percentage: z.number().min(0).max(100),
      })
    )
    .optional(),

  // Historical Performance (for trend analysis)
  historicalMetrics: z
    .object({
      revenueGrowthYoY: z.number().optional(),
      customerGrowthYoY: z.number().optional(),
      churnRate: z.number().optional(),
      npsScore: z.number().optional(),
    })
    .optional(),

  // Metadata
  collectedAt: z.string(),
  completenessScore: z.number().min(0).max(100).optional(),
  source: z.enum(["onboarding", "manual-entry", "crm-import", "analytics-sync"]).default("onboarding"),
});

export type BusinessContext = z.infer<typeof businessContextSchema>;

// ============================================================================
// COMPLETENESS SCORING
// ============================================================================

/**
 * Calculate how complete the business context is
 * Used to determine which frameworks can be accurately run
 */
export function calculateCompletenessScore(context: Partial<BusinessContext>): {
  overall: number;
  categories: Record<string, number>;
  missingCritical: string[];
} {
  const scores = {
    basic: 0, // Basic business info
    financial: 0, // Revenue, costs, metrics
    strategic: 0, // Goals, positioning, stage
    market: 0, // Market size, competitors, segments
    customer: 0, // Demographics, pain points, behavior
  };

  const weights = {
    basic: 15,
    financial: 25,
    strategic: 25,
    market: 20,
    customer: 15,
  };

  const missingCritical: string[] = [];

  // Basic (15 points)
  if (context.growthStage) scores.basic += 5;
  if (context.marketPosition) scores.basic += 5;
  if (context.competitiveStrategy) scores.basic += 5;

  // Financial (25 points)
  if (context.annualRevenue) scores.financial += 8;
  else missingCritical.push("Annual revenue");

  if (context.revenueByProduct && context.revenueByProduct.length > 0) scores.financial += 8;
  if (context.customerAcquisitionCost) scores.financial += 3;
  if (context.customerLifetimeValue) scores.financial += 3;
  if (context.averageTransactionValue) scores.financial += 3;

  // Strategic (25 points)
  if (context.primaryGoals && context.primaryGoals.length > 0) scores.strategic += 8;
  else missingCritical.push("Primary business goals");

  if (context.uniqueValueProposition) scores.strategic += 8;
  if (context.competitiveAdvantages && context.competitiveAdvantages.length > 0)
    scores.strategic += 5;
  if (context.mainChallenges && context.mainChallenges.length > 0) scores.strategic += 4;

  // Market (20 points)
  if (context.targetSegments && context.targetSegments.length > 0) scores.market += 7;
  if (context.keyCompetitors && context.keyCompetitors.length > 0) scores.market += 7;
  if (context.marketSize) scores.market += 3;
  if (context.marketGrowthRate) scores.market += 3;

  // Customer (15 points)
  if (context.customerDemographics) scores.customer += 5;
  if (context.customerPainPoints && context.customerPainPoints.length > 0) scores.customer += 5;
  if (context.customerSuccessMetrics && context.customerSuccessMetrics.length > 0)
    scores.customer += 5;

  const overall =
    (scores.basic / 15) * weights.basic +
    (scores.financial / 25) * weights.financial +
    (scores.strategic / 25) * weights.strategic +
    (scores.market / 20) * weights.market +
    (scores.customer / 15) * weights.customer;

  return {
    overall: Math.round(overall),
    categories: {
      basic: Math.round((scores.basic / 15) * 100),
      financial: Math.round((scores.financial / 25) * 100),
      strategic: Math.round((scores.strategic / 25) * 100),
      market: Math.round((scores.market / 20) * 100),
      customer: Math.round((scores.customer / 15) * 100),
    },
    missingCritical,
  };
}

// ============================================================================
// FRAMEWORK READINESS CHECK
// ============================================================================

export function checkFrameworkReadiness(context: Partial<BusinessContext>): Record<
  string,
  {
    ready: boolean;
    confidence: "low" | "medium" | "high";
    missingData: string[];
  }
> {
  return {
    "bcg-matrix": {
      ready: !!(context.revenueByProduct && context.revenueByProduct.length > 0),
      confidence:
        context.revenueByProduct?.every((p) => p.growthRate && p.marketShare) ? "high" : "medium",
      missingData: !context.revenueByProduct
        ? ["Revenue by product/service line", "Growth rates", "Market share"]
        : [],
    },
    "ansoff-matrix": {
      ready: !!(context.targetSegments && context.targetSegments.length > 0),
      confidence: context.marketSize && context.marketGrowthRate ? "high" : "medium",
      missingData: !context.targetSegments ? ["Target market segments", "Market size"] : [],
    },
    "porter-5-forces": {
      ready: !!(context.keyCompetitors && context.keyCompetitors.length > 0),
      confidence: context.marketSize ? "medium" : "low",
      missingData: !context.keyCompetitors
        ? ["Competitor information", "Industry dynamics"]
        : [],
    },
    "blue-ocean": {
      ready: !!(context.keyCompetitors && context.competitiveAdvantages),
      confidence: context.customerPainPoints && context.customerPainPoints.length > 0 ? "high" : "medium",
      missingData: !context.keyCompetitors ? ["Competitor analysis", "Customer pain points"] : [],
    },
    "okr-framework": {
      ready: !!(context.primaryGoals && context.primaryGoals.length > 0),
      confidence: context.historicalMetrics ? "high" : "medium",
      missingData: !context.primaryGoals ? ["Business goals", "Key metrics"] : [],
    },
    "jtbd": {
      ready: !!(context.customerPainPoints && context.customerPainPoints.length > 0),
      confidence: context.customerSuccessMetrics && context.customerSuccessMetrics.length > 0 ? "high" : "medium",
      missingData: !context.customerPainPoints
        ? ["Customer pain points", "Success criteria"]
        : [],
    },
  };
}
