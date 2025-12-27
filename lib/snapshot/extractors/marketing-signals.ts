/**
 * Marketing Signal Extractor
 * 
 * Analyzes marketing/visibility signals from scraped website data:
 * - SEO keyword strategy
 * - Social media presence
 * - Online reviews and ratings
 * - Brand consistency
 */

export interface MarketingSignal {
  icon: string;
  message: string;
  type: 'positive' | 'negative' | 'warning';
}

export function extractMarketingSignals(data: any): string[] {
  const signals: string[] = [];

  // SEO keyword strategy
  if (data.seo?.keywords?.length > 0) {
    signals.push(`✓ Targeting ${data.seo.keywords.length} keywords`);
  } else {
    signals.push(`❌ No clear SEO keyword strategy`);
  }

  // Social media presence
  if (data.social?.platforms?.length > 0) {
    signals.push(`✓ Present on ${data.social.platforms.join(', ')}`);
  } else {
    signals.push(`❌ No social media presence found`);
  }

  // Online reviews
  if (data.reviews?.averageRating >= 4.0) {
    signals.push(`✓ Strong reviews (${data.reviews.averageRating.toFixed(1)}/5.0)`);
  } else if (data.reviews?.totalReviews > 0) {
    signals.push(`⚠️ Reviews need improvement (${data.reviews.averageRating.toFixed(1)}/5.0)`);
  } else {
    signals.push(`❌ No online reviews`);
  }

  // Brand voice consistency
  if (data.brandAnalysis?.brandVoice) {
    signals.push(`✓ Consistent brand voice detected`);
  }

  return signals.slice(0, 5);
}

/**
 * Generate basic marketing signals for businesses without websites
 */
export function generateBasicMarketingSignals(): string[] {
  return [
    "❌ No website found - losing 70% of potential customers who search online",
    "❌ Limited online presence - competitors are capturing your market share",
    "⚠️ Missing from key local search results"
  ];
}
