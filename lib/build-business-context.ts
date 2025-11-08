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

export function buildBusinessContext(
  website_analysis: any,
  options: BusinessContextOptions = {}
): string {
  if (!website_analysis) {
    return '';
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

  let context = '\n**BUSINESS INTELLIGENCE:**\n';

  if (includeDifferentiators && website_analysis.what_makes_you_different) {
    const differentiators = website_analysis.what_makes_you_different
      .slice(0, maxDifferentiators)
      .join('\n- ');
    if (differentiators) {
      context += `\nWhat makes them different:\n- ${differentiators}\n`;
    }
  }

  if (includeStrengths && website_analysis.your_strengths) {
    const strengths = website_analysis.your_strengths
      .slice(0, maxStrengths)
      .join('\n- ');
    if (strengths) {
      context += `\nKey strengths:\n- ${strengths}\n`;
    }
  }

  if (includeOpportunities && website_analysis.opportunities) {
    const opportunities = website_analysis.opportunities
      .slice(0, maxOpportunities)
      .join('\n- ');
    if (opportunities) {
      context += `\nGrowth opportunities:\n- ${opportunities}\n`;
    }
  }

  if (includeQuickWins && website_analysis.quick_wins) {
    const quickWins = website_analysis.quick_wins
      .slice(0, maxQuickWins)
      .map((w: any) => `${w.title}: ${w.why}`)
      .join('\n- ');
    if (quickWins) {
      context += `\nQuick wins:\n- ${quickWins}\n`;
    }
  }

  if (includeThreats && website_analysis.threats_to_watch) {
    const threats = website_analysis.threats_to_watch
      .slice(0, 3)
      .join('\n- ');
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

  if (context === '\n**BUSINESS INTELLIGENCE:**\n') {
    return '';
  }

  context += '\n**IMPORTANT**: Use their specific differentiators and strengths to make this authentic and unique to THEIR business. Avoid generic advice.\n';

  return context;
}

export function getCompetitorInsights(website_analysis: any): string {
  if (!website_analysis?.why_customers_choose_competitors) {
    return '';
  }

  const insights = website_analysis.why_customers_choose_competitors
    .slice(0, 3)
    .map((insight: any) => `- ${insight.question}: ${insight.insight}`)
    .join('\n');

  return insights ? `\n**COMPETITIVE INSIGHTS:**\n${insights}\n` : '';
}
