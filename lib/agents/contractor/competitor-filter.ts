/**
 * ContractorCompetitorFilterAgent
 *
 * Filters discovered competitors based on contractor profile to exclude irrelevant businesses.
 * For example: excludes industrial propane companies when profile is residential HVAC.
 *
 * Uses business profile as source-of-truth for industry and customer type filtering.
 */

import type {
  ContractorProfile,
  ContractorIndustry,
  CustomerType,
  Competitor,
  FilteredCompetitor,
  CompetitorFilterConfig
} from '@/lib/types/contractor';

export interface RawCompetitor {
  name: string;
  url?: string;
  description?: string;
  distance_miles?: number;
  scraped_services?: string[];
  scraped_industry?: string;
}

export class ContractorCompetitorFilterAgent {
  /**
   * Filter competitors based on contractor profile
   */
  static filterCompetitors(
    profile: ContractorProfile,
    raw_competitors: RawCompetitor[]
  ): FilteredCompetitor[] {
    const config = this.buildFilterConfig(profile);

    return raw_competitors.map(competitor => {
      const analysis = this.analyzeCompetitor(competitor, profile, config);

      return {
        name: competitor.name,
        url: competitor.url,
        excluded: analysis.should_exclude,
        notes: competitor.description,
        relevance_score: analysis.relevance_score,
        relevance_reasons: analysis.relevance_reasons,
        distance_miles: competitor.distance_miles,
        should_exclude: analysis.should_exclude,
        exclusion_reasons: analysis.exclusion_reasons
      };
    });
  }

  /**
   * Build filter configuration from contractor profile
   */
  private static buildFilterConfig(profile: ContractorProfile): CompetitorFilterConfig {
    // Determine which industries to exclude
    const exclude_industries: ContractorIndustry[] = [];

    // If residential HVAC, exclude industrial/fleet propane
    if (profile.primary_industry === 'HVAC' &&
        !profile.customer_types.includes('industrial') &&
        !profile.customer_types.includes('fleet')) {
      exclude_industries.push('Propane');
    }

    // If residential plumbing, exclude commercial/industrial
    if (profile.primary_industry === 'Plumbing' &&
        profile.customer_types.length === 1 &&
        profile.customer_types[0] === 'residential') {
      // Still keep plumbing competitors, just flag commercial-only ones
    }

    // Determine customer type exclusions
    const exclude_customer_types: CustomerType[] = [];

    if (!profile.customer_types.includes('commercial')) {
      exclude_customer_types.push('commercial');
    }
    if (!profile.customer_types.includes('industrial')) {
      exclude_customer_types.push('industrial');
    }
    if (!profile.customer_types.includes('fleet')) {
      exclude_customer_types.push('fleet');
    }

    return {
      exclude_industries,
      exclude_customer_types,
      max_distance_miles: profile.service_area.radius_miles ? profile.service_area.radius_miles * 2 : undefined,
      min_relevance_score: 0.3
    };
  }

  /**
   * Analyze a single competitor for relevance
   */
  private static analyzeCompetitor(
    competitor: RawCompetitor,
    profile: ContractorProfile,
    config: CompetitorFilterConfig
  ): {
    relevance_score: number;
    relevance_reasons: string[];
    should_exclude: boolean;
    exclusion_reasons: string[];
  } {
    const relevance_reasons: string[] = [];
    const exclusion_reasons: string[] = [];
    let relevance_score = 0;

    // Check if in profile's competitor list (highest trust)
    if (profile.competitors.some(c =>
      c.name.toLowerCase() === competitor.name.toLowerCase() && !c.excluded
    )) {
      relevance_score += 0.5;
      relevance_reasons.push('Listed in your profile as a known competitor');
    }

    // Check if manually excluded in profile
    const manually_excluded = profile.competitors.find(c =>
      c.name.toLowerCase() === competitor.name.toLowerCase() && c.excluded
    );
    if (manually_excluded) {
      exclusion_reasons.push('Manually excluded in your profile');
      return {
        relevance_score: 0,
        relevance_reasons: [],
        should_exclude: true,
        exclusion_reasons
      };
    }

    // Analyze industry match
    const competitor_industry = this.detectIndustry(competitor);
    if (competitor_industry) {
      if (competitor_industry === profile.primary_industry) {
        relevance_score += 0.3;
        relevance_reasons.push(`Same industry: ${competitor_industry}`);
      } else if (config.exclude_industries.includes(competitor_industry)) {
        exclusion_reasons.push(`Different industry: ${competitor_industry} (you do ${profile.primary_industry})`);
        relevance_score -= 0.5;
      }
    }

    // Analyze service overlap
    if (competitor.scraped_services && competitor.scraped_services.length > 0) {
      const overlap = this.calculateServiceOverlap(
        profile.service_types,
        competitor.scraped_services
      );

      if (overlap > 0.5) {
        relevance_score += 0.3;
        relevance_reasons.push(`High service overlap (${Math.round(overlap * 100)}%)`);
      } else if (overlap > 0.2) {
        relevance_score += 0.15;
        relevance_reasons.push(`Moderate service overlap (${Math.round(overlap * 100)}%)`);
      } else if (overlap === 0) {
        exclusion_reasons.push('No overlapping services');
        relevance_score -= 0.3;
      }
    }

    // Analyze customer type match
    const competitor_customer_types = this.detectCustomerTypes(competitor);
    if (competitor_customer_types.length > 0) {
      const has_matching_type = competitor_customer_types.some(type =>
        profile.customer_types.includes(type)
      );

      if (has_matching_type) {
        relevance_score += 0.2;
        relevance_reasons.push(`Serves ${competitor_customer_types.join(', ')} customers`);
      } else {
        // Check if competitor is ONLY targeting types we don't serve
        const only_excluded_types = competitor_customer_types.every(type =>
          config.exclude_customer_types.includes(type)
        );

        if (only_excluded_types) {
          exclusion_reasons.push(
            `Only serves ${competitor_customer_types.join(', ')} (you serve ${profile.customer_types.join(', ')})`
          );
          relevance_score -= 0.4;
        }
      }
    }

    // Analyze distance (if available)
    if (competitor.distance_miles !== undefined) {
      if (config.max_distance_miles && competitor.distance_miles > config.max_distance_miles) {
        exclusion_reasons.push(
          `Too far away: ${competitor.distance_miles} miles (you serve within ${profile.service_area.radius_miles} miles)`
        );
        relevance_score -= 0.3;
      } else if (competitor.distance_miles <= (profile.service_area.radius_miles || 25)) {
        relevance_score += 0.2;
        relevance_reasons.push(`In your service area (${competitor.distance_miles} miles away)`);
      }
    }

    // Normalize score to 0-1
    relevance_score = Math.max(0, Math.min(1, relevance_score));

    // Determine if should exclude
    const should_exclude = relevance_score < config.min_relevance_score || exclusion_reasons.length > 0;

    return {
      relevance_score,
      relevance_reasons,
      should_exclude,
      exclusion_reasons
    };
  }

  /**
   * Detect industry from competitor description/services
   */
  private static detectIndustry(competitor: RawCompetitor): ContractorIndustry | undefined {
    const text = `${competitor.name} ${competitor.description || ''} ${competitor.scraped_services?.join(' ') || ''}`.toLowerCase();

    if (text.includes('hvac') || text.includes('heating') || text.includes('cooling') || text.includes('air conditioning')) {
      return 'HVAC';
    }
    if (text.includes('plumb')) {
      return 'Plumbing';
    }
    if (text.includes('roof')) {
      return 'Roofing';
    }
    if (text.includes('remodel') || text.includes('renovation')) {
      return 'Remodeling';
    }
    if (text.includes('landscape') || text.includes('lawn')) {
      return 'Landscaping';
    }
    if (text.includes('propane') || (text.includes('gas') && text.includes('delivery'))) {
      return 'Propane';
    }
    if (text.includes('electric')) {
      return 'Electrical';
    }
    if (text.includes('paint')) {
      return 'Painting';
    }
    if (text.includes('concrete')) {
      return 'Concrete';
    }
    if (text.includes('fence') || text.includes('fencing')) {
      return 'Fencing';
    }

    return undefined;
  }

  /**
   * Detect customer types from competitor description
   */
  private static detectCustomerTypes(competitor: RawCompetitor): CustomerType[] {
    const text = `${competitor.name} ${competitor.description || ''} ${competitor.scraped_services?.join(' ') || ''}`.toLowerCase();
    const types: CustomerType[] = [];

    if (text.includes('residential') || text.includes('home') || text.includes('homeowner')) {
      types.push('residential');
    }
    if (text.includes('commercial') || text.includes('business')) {
      types.push('commercial');
    }
    if (text.includes('industrial') || text.includes('warehouse') || text.includes('factory')) {
      types.push('industrial');
    }
    if (text.includes('fleet') || text.includes('forklift') || text.includes('vehicle')) {
      types.push('fleet');
    }

    return types;
  }

  /**
   * Calculate service overlap between profile and competitor
   */
  private static calculateServiceOverlap(
    profile_services: string[],
    competitor_services: string[]
  ): number {
    if (profile_services.length === 0 || competitor_services.length === 0) {
      return 0;
    }

    // Normalize services to lowercase for comparison
    const profile_normalized = profile_services.map(s => s.toLowerCase());
    const competitor_normalized = competitor_services.map(s => s.toLowerCase());

    // Count overlapping services (fuzzy match)
    let overlap_count = 0;
    for (const profile_service of profile_normalized) {
      for (const competitor_service of competitor_normalized) {
        if (this.servicesMatch(profile_service, competitor_service)) {
          overlap_count++;
          break; // Count each profile service only once
        }
      }
    }

    // Return overlap as percentage of profile services
    return overlap_count / profile_services.length;
  }

  /**
   * Check if two service descriptions match (fuzzy)
   */
  private static servicesMatch(service1: string, service2: string): boolean {
    // Exact match
    if (service1 === service2) return true;

    // Contains match
    if (service1.includes(service2) || service2.includes(service1)) return true;

    // Keyword overlap (at least 2 words in common)
    const words1 = service1.split(/\s+/).filter(w => w.length > 3);
    const words2 = service2.split(/\s+/).filter(w => w.length > 3);

    const common_words = words1.filter(w => words2.includes(w));
    return common_words.length >= 2;
  }

  /**
   * Get filtering summary for UI display
   */
  static getFilteringSummary(
    filtered: FilteredCompetitor[]
  ): {
    total: number;
    relevant: number;
    excluded: number;
    top_exclusion_reasons: string[];
  } {
    const total = filtered.length;
    const excluded = filtered.filter(c => c.should_exclude).length;
    const relevant = total - excluded;

    // Aggregate exclusion reasons
    const reason_counts: Record<string, number> = {};
    filtered.forEach(c => {
      c.exclusion_reasons.forEach(reason => {
        reason_counts[reason] = (reason_counts[reason] || 0) + 1;
      });
    });

    const top_exclusion_reasons = Object.entries(reason_counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => `${reason} (${count})`);

    return {
      total,
      relevant,
      excluded,
      top_exclusion_reasons
    };
  }
}
