/**
 * Competitive Signal Extractor
 * 
 * Analyzes competitive positioning from scraped website data:
 * - Competitor density
 * - Competitive advantages/disadvantages
 * - Domain authority and age
 * - Market positioning clarity
 */

export interface CompetitiveSignal {
  icon: string;
  message: string;
  type: 'positive' | 'negative' | 'warning';
}

export function extractCompetitiveSignals(data: any): string[] {
  const signals: string[] = [];

  // Competitor density
  if (data.competitors?.length > 0) {
    signals.push(`⚠️ ${data.competitors.length} direct competitors found`);
  }

  // Competitor online presence
  if (data.competitors?.some((c: any) => c.hasWebsite)) {
    signals.push(`⚠️ Competitors have established online presence`);
  }

  // Domain age (authority signal)
  if (data.seo?.domainAge) {
    signals.push(`✓ Domain established ${data.seo.domainAge}`);
  }

  // Generic positioning signals (these would ideally be data-driven)
  signals.push(`⚠️ Market positioning needs clarification`);
  signals.push(`✓ Opportunity for local SEO dominance`);

  return signals.slice(0, 5);
}

/**
 * Generate basic competitive signals for businesses without websites
 */
export function generateBasicCompetitiveSignals(): string[] {
  return [
    "⚠️ Competitors with websites are appearing first in searches",
    "❌ No differentiation visible to online searchers",
    "⚠️ Market share being captured by digitally-present competitors"
  ];
}
