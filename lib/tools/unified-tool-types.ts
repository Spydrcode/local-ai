/**
 * Unified Tool Output Types
 *
 * Standardized output format for all 10 unified tools
 * Based on our agentic framework with proper TypeScript types
 */

// ============================================================================
// Core Standardized Output Structure
// ============================================================================

export interface UnifiedToolOutput {
  analysis_id: string;
  tool_id: string;
  summary: string; // Human-readable summary (<= 200 chars)
  scores: {
    overall: number; // 0-100
    seo?: number;
    content?: number;
    reputation?: number;
    pricing?: number;
    engagement?: number;
    [key: string]: number | undefined;
  };
  findings: Finding[];
  structured_outputs: Record<string, any>; // Tool-specific data
  next_steps: string[];
  metadata?: {
    generated_at: string;
    agent_used: string[];
    rag_enhanced: boolean;
    intelligence_used: boolean;
  };
}

export interface Finding {
  title: string;
  detail: string;
  urgency: "low" | "medium" | "high" | "critical";
  actionable_recommendations: string[];
  category?: string;
  impact?: "low" | "medium" | "high";
}

// ============================================================================
// Tool-Specific Input Types
// ============================================================================

export interface BusinessAuditInput {
  website_url: string;
  gmb_profile_url?: string;
  competitor_urls?: string[];
  industry?: string;
  goals?: string[];
  depth_level?: "quick" | "standard" | "comprehensive";
}

export interface SocialContentInput {
  platform?: "facebook" | "instagram" | "linkedin" | "twitter"; // Optional when mode=all
  mode?: "single" | "all"; // all = generate for all platforms
  variation_index?: number; // 0, 1, 2 for regeneration
  tone?: "friendly" | "professional" | "fun" | "educational";
  audience?: string;
  offer?: string;
  length?: "short" | "medium" | "long";
  existing_review_text?: string;
  cta?: string;
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface BlogSEOInput {
  content_type:
    | "how-to"
    | "listicle"
    | "guide"
    | "case-study"
    | "thought-leadership";
  primary_keyword?: string;
  secondary_keywords?: string[];
  target_audience?: string;
  word_count?: number;
  tone?: "educational" | "authoritative" | "conversational" | "inspirational";
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface EmailHubInput {
  email_type: "newsletter" | "promotional" | "educational" | "announcement";
  subject_theme?: string;
  content_sections?: string[];
  cta_goal?: string;
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface WebsiteCopyInput {
  page_type: "homepage" | "about" | "services" | "contact" | "landing-page";
  unique_selling_points?: string[];
  target_customer?: string;
  conversion_goal?: string;
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface ReviewManagerInput {
  review_text: string;
  platform: "google" | "yelp" | "facebook" | "trustpilot";
  sentiment: "positive" | "negative" | "neutral";
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface AdCopyInput {
  ad_platform: "google-ads" | "facebook-ads" | "instagram-ads" | "linkedin-ads";
  ad_format: "search" | "display" | "video" | "carousel";
  campaign_goal: "awareness" | "consideration" | "conversion";
  budget_range?: string;
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface ObjectionHandlerInput {
  common_objections?: string[];
  industry_challenges?: string[];
  competitor_advantages?: string[];
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface PricingToolInput {
  current_pricing?: Record<string, number>;
  competitor_pricing?: Record<string, number>;
  target_margin?: number;
  pricing_strategy?: "value-based" | "competitive" | "cost-plus" | "premium";
  business_name: string;
  business_type: string;
  intelligence?: any;
}

export interface PackageDesignerInput {
  service_tiers?: number;
  price_points?: number[];
  target_segments?: string[];
  upsell_items?: string[];
  business_name: string;
  business_type: string;
  intelligence?: any;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create standardized tool output
 */
export function createToolOutput(
  toolId: string,
  summary: string,
  structuredOutputs: Record<string, any>,
  options?: {
    scores?: Partial<UnifiedToolOutput["scores"]>;
    findings?: Finding[];
    nextSteps?: string[];
    agentsUsed?: string[];
    ragEnhanced?: boolean;
    intelligenceUsed?: boolean;
  }
): UnifiedToolOutput {
  return {
    analysis_id: `${toolId}_${Date.now()}`,
    tool_id: toolId,
    summary: summary.substring(0, 200), // Enforce 200 char limit
    scores: {
      overall: options?.scores?.overall || 75,
      ...options?.scores,
    },
    findings: options?.findings || [],
    structured_outputs: structuredOutputs,
    next_steps: options?.nextSteps || [],
    metadata: {
      generated_at: new Date().toISOString(),
      agent_used: options?.agentsUsed || [],
      rag_enhanced: options?.ragEnhanced || false,
      intelligence_used: options?.intelligenceUsed || false,
    },
  };
}

/**
 * Create a finding
 */
export function createFinding(
  title: string,
  detail: string,
  urgency: Finding["urgency"],
  recommendations: string[],
  options?: {
    category?: string;
    impact?: Finding["impact"];
  }
): Finding {
  return {
    title,
    detail,
    urgency,
    actionable_recommendations: recommendations,
    category: options?.category,
    impact: options?.impact,
  };
}

/**
 * Calculate overall score from individual scores
 */
export function calculateOverallScore(
  scores: Record<string, number>,
  weights?: Record<string, number>
): number {
  const scoreEntries = Object.entries(scores);
  if (scoreEntries.length === 0) return 0;

  if (weights) {
    let weightedSum = 0;
    let totalWeight = 0;
    scoreEntries.forEach(([key, value]) => {
      const weight = weights[key] || 1;
      weightedSum += value * weight;
      totalWeight += weight;
    });
    return Math.round(weightedSum / totalWeight);
  }

  // Simple average
  const sum = scoreEntries.reduce((acc, [, value]) => acc + value, 0);
  return Math.round(sum / scoreEntries.length);
}

/**
 * Generate analysis ID
 */
export function generateAnalysisId(
  toolId: string,
  businessName?: string
): string {
  const timestamp = Date.now();
  const businessSlug = businessName
    ? businessName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    : "unknown";
  return `${toolId}_${businessSlug}_${timestamp}`;
}

/**
 * Extract next steps from findings
 */
export function extractNextSteps(
  findings: Finding[],
  maxSteps: number = 5
): string[] {
  const steps: string[] = [];

  // Prioritize by urgency
  const sortedFindings = [...findings].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  sortedFindings.forEach((finding) => {
    if (steps.length >= maxSteps) return;
    finding.actionable_recommendations.forEach((rec) => {
      if (steps.length < maxSteps) {
        steps.push(rec);
      }
    });
  });

  return steps;
}

/**
 * Validate tool input
 */
export function validateToolInput(
  input: any,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (!input[field]) {
      missingFields.push(field);
    }
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Auto-generate topic from intelligence
 */
export function generateTopicFromIntelligence(
  intelligence: any,
  businessName: string,
  businessType: string
): string {
  // Priority 1: Differentiators
  if (intelligence?.business?.differentiators?.[0]) {
    return intelligence.business.differentiators[0];
  }

  // Priority 2: Top service
  if (intelligence?.business?.services?.[0]) {
    const service = intelligence.business.services[0];
    const location = intelligence?.business?.location;
    return location
      ? `Expert ${service} in ${location}`
      : `Professional ${service} Services`;
  }

  // Priority 3: Top keyword
  if (intelligence?.seo?.keywords?.[0]) {
    return `${intelligence.seo.keywords[0]}: What You Need to Know`;
  }

  // Fallback
  return `Why Choose ${businessName} for ${businessType}`;
}

/**
 * Extract keywords from intelligence
 */
export function extractKeywordsFromIntelligence(
  intelligence: any,
  maxKeywords: number = 5
): string[] {
  const keywords: string[] = [];

  // From SEO keywords
  if (intelligence?.seo?.keywords) {
    keywords.push(...intelligence.seo.keywords.slice(0, maxKeywords));
  }

  // From services (if not enough keywords)
  if (keywords.length < maxKeywords && intelligence?.business?.services) {
    keywords.push(
      ...intelligence.business.services.slice(0, maxKeywords - keywords.length)
    );
  }

  return keywords.slice(0, maxKeywords);
}

/**
 * Format agent response to structured output
 */
export function formatAgentResponse(
  agentResponse: any,
  agentName: string
): Record<string, any> {
  // If response is already structured (JSON), return as-is
  if (typeof agentResponse === "object" && agentResponse !== null) {
    return {
      agent: agentName,
      ...agentResponse,
    };
  }

  // If response is string, try to parse
  if (typeof agentResponse === "string") {
    try {
      return {
        agent: agentName,
        ...JSON.parse(agentResponse),
      };
    } catch {
      return {
        agent: agentName,
        content: agentResponse,
      };
    }
  }

  return {
    agent: agentName,
    raw: agentResponse,
  };
}
