/**
 * Output Schemas for Unified Tools
 * All tools return structured JSON matching these interfaces
 */

// ============================================================================
// 1. BUSINESS AUDIT OUTPUT
// ============================================================================
export interface BusinessAuditOutput {
  businessOverview: {
    name: string;
    industry: string;
    location?: string;
    services: string[];
    differentiators: string[];
  };
  swotAnalysis: {
    strengths: Array<{ factor: string; impact: string }>;
    weaknesses: Array<{ factor: string; impact: string }>;
    opportunities: Array<{ factor: string; potential: string }>;
    threats: Array<{ factor: string; mitigation: string }>;
  };
  porterForces: {
    competitiveRivalry: {
      intensity: "low" | "medium" | "high";
      analysis: string;
    };
    threatOfNewEntrants: {
      intensity: "low" | "medium" | "high";
      analysis: string;
    };
    bargainingPowerSuppliers: {
      intensity: "low" | "medium" | "high";
      analysis: string;
    };
    bargainingPowerBuyers: {
      intensity: "low" | "medium" | "high";
      analysis: string;
    };
    threatOfSubstitutes: {
      intensity: "low" | "medium" | "high";
      analysis: string;
    };
  };
  blueOceanOpportunities: {
    eliminate: string[];
    reduce: string[];
    raise: string[];
    create: string[];
    strategy: string;
  };
  competitorAnalysis: {
    directCompetitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      positioning: string;
    }>;
    marketGaps: string[];
  };
  contentGaps: {
    missingTopics: string[];
    weakAreas: string[];
    opportunities: string[];
  };
  localSEO: {
    currentRankings?: any;
    opportunities: string[];
    recommendations: string[];
  };
  strategicPriorities: Array<{
    priority: string;
    rationale: string;
    expectedImpact: string;
    timeframe: string;
  }>;
}

// ============================================================================
// 2. SOCIAL CONTENT OUTPUT
// ============================================================================
export interface SocialContentOutput {
  platform: "facebook" | "instagram" | "linkedin" | "tiktok" | "gmb";
  content_type: string;
  primary: {
    text: string;
    hashtags?: string[];
    emojis?: string[];
    call_to_action?: string;
    image_suggestions?: string[];
    best_post_time?: string;
  };
  variations?: Array<{
    text: string;
    angle: string;
    hashtags?: string[];
  }>;
  engagement_tips: string[];
}

// ============================================================================
// 3. BLOG + SEO OUTPUT
// ============================================================================
export interface BlogSEOOutput {
  content_type: "blog" | "service-page" | "location-page" | "meta-tags";
  title: string;
  meta_description: string;
  keywords_used: string[];
  content: {
    introduction?: string;
    sections: Array<{
      heading: string;
      content: string;
      subsections?: Array<{ heading: string; content: string }>;
    }>;
    conclusion?: string;
    cta?: string;
  };
  seo_recommendations: string[];
  reading_time?: string;
  target_keywords: string[];
}

// ============================================================================
// 4. WEBSITE COPY OUTPUT
// ============================================================================
export interface WebsiteCopyOutput {
  page_type: string;
  headline: string;
  subheadline?: string;
  sections: Array<{
    heading: string;
    content: string;
    bullet_points?: string[];
  }>;
  call_to_action: {
    primary: string;
    secondary?: string;
  };
  trust_signals?: string[];
  social_proof?: string[];
}

// ============================================================================
// 5. REVIEW MANAGER OUTPUT
// ============================================================================
export interface ReviewManagerOutput {
  action_type:
    | "respond-positive"
    | "respond-negative"
    | "request-testimonial"
    | "create-social-post";
  response?: {
    text: string;
    tone: string;
    next_steps?: string[];
  };
  email?: {
    subject: string;
    body: string;
    timing_recommendation: string;
  };
  social_post?: {
    platform: string;
    text: string;
    hashtags: string[];
    image_suggestion: string;
  };
  talking_points?: string[];
}

// ============================================================================
// 6. EMAIL HUB OUTPUT
// ============================================================================
export interface EmailHubOutput {
  email_type: string;
  emails: Array<{
    sequence_number?: number;
    subject_line: string;
    preview_text: string;
    body: {
      greeting: string;
      opening: string;
      main_content: string;
      call_to_action: string;
      closing: string;
      signature: string;
    };
    send_timing?: string;
    personalization_tokens?: string[];
  }>;
  automation_recommendations?: {
    trigger: string;
    delay: string;
    conditions: string[];
  };
  a_b_test_suggestions?: string[];
}

// ============================================================================
// 7. AD COPY OUTPUT
// ============================================================================
export interface AdCopyOutput {
  platform: "facebook" | "instagram" | "google";
  campaign_goal: string;
  variations: Array<{
    variation_number: number;
    angle: string;
    headline: string;
    primary_text: string;
    description?: string;
    call_to_action: string;
    targeting_suggestions?: string[];
  }>;
  creative_suggestions: {
    image_ideas: string[];
    video_concepts?: string[];
  };
  targeting_recommendations: {
    demographics: string[];
    interests: string[];
    behaviors: string[];
  };
  budget_recommendations?: {
    daily_budget: string;
    duration: string;
    expected_reach: string;
  };
}

// ============================================================================
// 8. OBJECTION HANDLER OUTPUT
// ============================================================================
export interface ObjectionHandlerOutput {
  objection_type: string;
  objection_analysis: {
    root_cause: string;
    customer_perspective: string;
    strategic_context: string;
  };
  responses: Array<{
    approach: string;
    script: string;
    reasoning: string;
    when_to_use: string;
  }>;
  value_reframing: {
    from: string;
    to: string;
    key_points: string[];
  };
  competitive_positioning?: {
    our_advantage: string;
    differentiators: string[];
    proof_points: string[];
  };
  follow_up_strategy: string[];
}

// ============================================================================
// 9. PRICING STRATEGY OUTPUT
// ============================================================================
export interface PricingStrategyOutput {
  current_analysis: {
    pricing_model: string;
    market_position: "budget" | "mid-tier" | "premium";
    competitor_comparison: Array<{
      competitor: string;
      price_point: string;
      positioning: string;
    }>;
  };
  recommendations: {
    optimal_pricing_model: string;
    rationale: string;
    price_anchoring_strategy: string;
  };
  pricing_tiers: Array<{
    tier_name: string;
    price_point: string;
    features: string[];
    target_customer: string;
    positioning: string;
  }>;
  psychological_pricing: {
    charm_pricing: boolean;
    bundling_opportunities: string[];
    discount_strategy: string;
  };
  implementation_plan: {
    rollout_strategy: string;
    testing_approach: string;
    success_metrics: string[];
  };
}

// ============================================================================
// 10. SERVICE PACKAGE OUTPUT
// ============================================================================
export interface ServicePackageOutput {
  package_type: "tiered-pricing" | "bundles" | "upsells" | "value-ladder";
  packages: Array<{
    name: string;
    tagline: string;
    price: string;
    features: string[];
    ideal_for: string;
    value_proposition: string;
    popular?: boolean;
  }>;
  upsell_paths: Array<{
    from_package: string;
    to_package: string;
    transition_message: string;
    additional_value: string[];
  }>;
  bundle_opportunities: Array<{
    bundle_name: string;
    included_services: string[];
    total_value: string;
    bundle_price: string;
    savings: string;
  }>;
  positioning_strategy: {
    anchor_package: string;
    entry_point: string;
    premium_tier: string;
  };
  sales_messaging: {
    comparison_table: Array<{
      feature: string;
      basic: string;
      standard: string;
      premium: string;
    }>;
    faq: Array<{
      question: string;
      answer: string;
    }>;
  };
}

/**
 * Common metadata included in all outputs
 */
export interface ToolMetadata {
  tool_id: string;
  generated_at: string;
  agents_used: string[];
  intelligence_sources: string[];
  confidence_score?: number;
}

/**
 * Unified tool response wrapper
 */
export interface UnifiedToolResponse<T> {
  success: boolean;
  data: T;
  metadata: ToolMetadata;
  suggestions?: string[];
  next_steps?: string[];
}
