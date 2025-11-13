/**
 * Shared utility for building business context from website analysis
 * This ensures all tools use website analysis data consistently
 */

export interface BusinessContextOptions {
  includeDifferentiators?: boolean;
  includeStrengths?: boolean;
  includeOpportunities?: boolean;
  includeQuickWins?: boolean;
  includeThreats?: boolean;
  includeNiche?: boolean;
  includeLocation?: boolean;
  maxDifferentiators?: number;
  maxStrengths?: number;
  maxOpportunities?: number;
  maxQuickWins?: number;
}

/**
 * Legacy format builder - kept for backward compatibility
 * Use buildSmartBusinessContext instead for automatic format detection
 */
export function buildBusinessContext(
  website_analysis: any,
  options: BusinessContextOptions = {}
): string {
  // Auto-detect format and use appropriate builder
  return buildSmartBusinessContext(website_analysis, options);
}

/**
 * Build context from old format (what_makes_you_different, your_strengths, etc.)
 */
function buildBusinessContextLegacy(
  website_analysis: any,
  options: BusinessContextOptions = {}
): string {
  if (!website_analysis) {
    return "";
  }

  const {
    includeDifferentiators = true,
    includeStrengths = true,
    includeOpportunities = false,
    includeQuickWins = false,
    includeThreats = false,
    includeNiche = true,
    includeLocation = true,
    maxDifferentiators = 3,
    maxStrengths = 3,
    maxOpportunities = 3,
    maxQuickWins = 3,
  } = options;

  let context = "\n**BUSINESS INTELLIGENCE:**\n";

  if (includeDifferentiators && website_analysis.what_makes_you_different) {
    const differentiators = website_analysis.what_makes_you_different
      .slice(0, maxDifferentiators)
      .join("\n- ");
    if (differentiators) {
      context += `\nWhat makes them different:\n- ${differentiators}\n`;
    }
  }

  if (includeStrengths && website_analysis.your_strengths) {
    const strengths = website_analysis.your_strengths
      .slice(0, maxStrengths)
      .join("\n- ");
    if (strengths) {
      context += `\nKey strengths:\n- ${strengths}\n`;
    }
  }

  if (includeOpportunities && website_analysis.opportunities) {
    const opportunities = website_analysis.opportunities
      .slice(0, maxOpportunities)
      .join("\n- ");
    if (opportunities) {
      context += `\nGrowth opportunities:\n- ${opportunities}\n`;
    }
  }

  if (includeQuickWins && website_analysis.quick_wins) {
    const quickWins = website_analysis.quick_wins
      .slice(0, maxQuickWins)
      .map((w: any) => `${w.title}: ${w.why}`)
      .join("\n- ");
    if (quickWins) {
      context += `\nQuick wins:\n- ${quickWins}\n`;
    }
  }

  if (includeThreats && website_analysis.threats_to_watch) {
    const threats = website_analysis.threats_to_watch.slice(0, 3).join("\n- ");
    if (threats) {
      context += `\nCompetitive threats:\n- ${threats}\n`;
    }
  }

  if (includeNiche && website_analysis.exact_sub_niche) {
    context += `\nExact niche: ${website_analysis.exact_sub_niche}\n`;
  }

  if (includeLocation && website_analysis.location_context) {
    context += `\nLocation context: ${website_analysis.location_context}\n`;
  }

  if (context === "\n**BUSINESS INTELLIGENCE:**\n") {
    return "";
  }

  context +=
    "\n**IMPORTANT**: Use their specific differentiators and strengths to make this authentic and unique to THEIR business. Avoid generic advice.\n";

  return context;
}

export function getCompetitorInsights(website_analysis: any): string {
  if (!website_analysis?.why_customers_choose_competitors) {
    return "";
  }

  const insights = website_analysis.why_customers_choose_competitors
    .slice(0, 3)
    .map((insight: any) => `- ${insight.question}: ${insight.insight}`)
    .join("\n");

  return insights ? `\n**COMPETITIVE INSIGHTS:**\n${insights}\n` : "";
}

/**
 * Smart wrapper that detects format and uses appropriate context builder
 * Handles both old format (what_makes_you_different) and new format (business, brandAnalysis, etc.)
 */
export function buildSmartBusinessContext(
  data: any,
  options: BusinessContextOptions = {}
): string {
  if (!data) {
    return "";
  }

  // Detect if this is new intelligence format (has business, brandAnalysis, etc.)
  if (data.business || data.brandAnalysis || data.seo || data.competitors) {
    return buildBusinessContextFromIntelligence(data, options);
  }

  // Fall back to old format
  return buildBusinessContextLegacy(data, options);
}

/**
 * Build business context from comprehensive intelligence data (new format)
 * This handles the data from MarketingOrchestrator's comprehensive data collection
 */
export function buildBusinessContextFromIntelligence(
  intelligence: any,
  options: BusinessContextOptions = {}
): string {
  if (!intelligence) {
    return "";
  }

  const {
    includeDifferentiators = true,
    includeStrengths = true,
    includeNiche = true,
    includeLocation = true,
  } = options;

  let context = "\n**BUSINESS INTELLIGENCE:**\n";

  // Business information
  if (intelligence.business) {
    const business = intelligence.business;

    if (business.description) {
      context += `\nBusiness Description: ${business.description}\n`;
    }

    if (business.services && business.services.length > 0) {
      context += `\nServices: ${business.services.join(", ")}\n`;
    }

    if (business.yearsInBusiness) {
      context += `\nYears in Business: ${business.yearsInBusiness}\n`;
    }

    if (business.location && includeLocation) {
      context += `\nLocation: ${business.location}\n`;
    }
  }

  // Brand analysis
  if (intelligence.brandAnalysis) {
    const brand = intelligence.brandAnalysis;

    if (brand.tagline) {
      context += `\nCurrent Tagline: ${brand.tagline}\n`;
    }

    if (brand.tone) {
      context += `\nBrand Tone: ${brand.tone}\n`;
    }

    if (brand.emotionalAppeal && brand.emotionalAppeal.length > 0) {
      context += `\nEmotional Appeal: ${brand.emotionalAppeal.join(", ")}\n`;
    }

    if (
      brand.keyMessages &&
      brand.keyMessages.length > 0 &&
      includeDifferentiators
    ) {
      context += `\nKey Messages:\n- ${brand.keyMessages.join("\n- ")}\n`;
    }
  }

  // Competitor information
  if (intelligence.competitors && intelligence.competitors.length > 0) {
    const competitorNames = intelligence.competitors
      .map((c: any) => c.name)
      .slice(0, 5)
      .join(", ");
    context += `\nKnown Competitors: ${competitorNames}\n`;
  }

  // SEO data
  if (intelligence.seo) {
    const seo = intelligence.seo;

    if (seo.metaTags?.keywords) {
      context += `\nTarget Keywords: ${seo.metaTags.keywords}\n`;
    }

    if (seo.technicalIssues && seo.technicalIssues.length > 0) {
      context += `\nSEO Issues to Address: ${seo.technicalIssues.slice(0, 3).join("; ")}\n`;
    }
  }

  // Social media presence
  if (intelligence.social?.platforms) {
    const platforms = Object.keys(intelligence.social.platforms);
    if (platforms.length > 0) {
      context += `\nActive Social Platforms: ${platforms.join(", ")}\n`;
    }
  }

  // Content analysis
  if (intelligence.contentAnalysis) {
    const content = intelligence.contentAnalysis;

    if (content.hasBlog) {
      context += `\nHas Blog: Yes\n`;
    }

    if (content.contentTopics && content.contentTopics.length > 0) {
      context += `\nContent Topics: ${content.contentTopics.join(", ")}\n`;
    }
  }

  if (context === "\n**BUSINESS INTELLIGENCE:**\n") {
    return "";
  }

  context +=
    "\n**IMPORTANT**: Use their specific business details, services, and brand positioning to make this authentic and unique to THEIR business. Avoid generic advice.\n";

  return context;
}
