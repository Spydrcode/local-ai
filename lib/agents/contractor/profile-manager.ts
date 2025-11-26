/**
 * ContractorProfileManager
 *
 * Manages contractor business profiles with business-profile-first merge logic.
 * Priority: Contractor Profile > Scraped Data > Inferred
 *
 * Responsibilities:
 * - Validate contractor profile data
 * - Merge profile with scraped website data
 * - Detect conflicts and suggest confirmations
 * - Calculate profile completeness
 * - Provide data-sourced fields with confidence scores
 */

import type {
  ContractorProfile,
  MergedContractorData,
  ProfileValidation,
  DataSourcedField,
  DataSource,
  ContractorIndustry
} from '@/lib/types/contractor';

export interface WebScraperData {
  business?: {
    name?: string;
    description?: string;
    industry?: string;
    location?: string;
    phone?: string;
    email?: string;
    services?: string[];
  };
  competitors?: Array<{
    name: string;
    url?: string;
    description?: string;
  }>;
  [key: string]: any;
}

export interface ProfileConflict {
  field: string;
  profile_value: any;
  scraped_value: any;
  confidence: number;
  suggestion: string;
}

export interface MergeResult {
  merged_data: MergedContractorData;
  conflicts: ProfileConflict[];
  warnings: string[];
}

export class ContractorProfileManager {
  /**
   * Validate contractor profile for completeness and correctness
   */
  static validateProfile(profile: Partial<ContractorProfile>): ProfileValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missing_fields: string[] = [];
    const suggested_improvements: string[] = [];

    // Required fields
    if (!profile.primary_industry) {
      errors.push('Primary industry is required');
      missing_fields.push('primary_industry');
    }

    if (!profile.service_types || profile.service_types.length === 0) {
      errors.push('At least one service type is required');
      missing_fields.push('service_types');
    }

    if (!profile.service_area) {
      errors.push('Service area is required');
      missing_fields.push('service_area');
    } else {
      if (!profile.service_area.cities || profile.service_area.cities.length === 0) {
        warnings.push('No cities specified in service area');
      }
      if (!profile.service_area.radius_miles) {
        warnings.push('Service radius not specified');
      }
    }

    if (!profile.customer_types || profile.customer_types.length === 0) {
      warnings.push('Customer types not specified (residential/commercial/etc)');
      missing_fields.push('customer_types');
    }

    if (!profile.pricing_model) {
      warnings.push('Pricing model not specified');
      missing_fields.push('pricing_model');
    }

    // Recommended fields
    if (!profile.crew_size || profile.crew_size === 0) {
      suggested_improvements.push('Add crew size for better capacity planning');
    }

    if (!profile.roles || profile.roles.length === 0) {
      suggested_improvements.push('Add crew roles for hiring recommendations');
    }

    if (!profile.competitors || profile.competitors.length === 0) {
      suggested_improvements.push('Add known competitors to improve competitive analysis');
    }

    if (!profile.lead_sources || profile.lead_sources.length === 0) {
      suggested_improvements.push('Add lead sources to track marketing effectiveness');
    }

    if (!profile.kpis || Object.keys(profile.kpis).length === 0) {
      suggested_improvements.push('Add KPIs to enable predictive analytics');
    }

    if (!profile.peak_seasons || profile.peak_seasons.length === 0) {
      suggested_improvements.push('Add peak seasons for demand forecasting');
    }

    // Calculate completeness
    const total_fields = 12; // key fields we care about
    const completed_fields = total_fields - missing_fields.length;
    const completeness = completed_fields / total_fields;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.max(0, Math.min(1, completeness)),
      missing_fields,
      suggested_improvements
    };
  }

  /**
   * Merge contractor profile with scraped website data
   * Priority: Profile > Scraped > Inferred
   */
  static mergeWithScrapedData(
    profile: Partial<ContractorProfile>,
    scraped: WebScraperData
  ): MergeResult {
    const conflicts: ProfileConflict[] = [];
    const warnings: string[] = [];

    // Helper to create data-sourced field
    const createField = <T>(
      profileValue: T | undefined,
      scrapedValue: T | undefined,
      field: string
    ): DataSourcedField<T> => {
      let value: T;
      let source: DataSource;
      let confidence: number;

      if (profileValue !== undefined && profileValue !== null) {
        // Profile data takes priority
        value = profileValue;
        source = 'profile';
        confidence = 1.0;

        // Detect conflict if scraped data differs significantly
        if (scrapedValue !== undefined && scrapedValue !== null) {
          if (JSON.stringify(profileValue) !== JSON.stringify(scrapedValue)) {
            conflicts.push({
              field,
              profile_value: profileValue,
              scraped_value: scrapedValue,
              confidence: 0.7,
              suggestion: `Profile says "${JSON.stringify(profileValue)}" but website shows "${JSON.stringify(scrapedValue)}". Verify which is current.`
            });
          }
        }
      } else if (scrapedValue !== undefined && scrapedValue !== null) {
        // Use scraped data if no profile data
        value = scrapedValue;
        source = 'scraped';
        confidence = 0.8;
        warnings.push(`${field} taken from website scraping. Consider confirming in profile.`);
      } else {
        // No data available
        value = null as T;
        source = 'inferred';
        confidence = 0.0;
      }

      return {
        value,
        source,
        confidence,
        scraped_value: scrapedValue,
        last_updated: new Date().toISOString()
      };
    };

    // Merge business name
    const business_name = createField(
      scraped.business?.name,
      scraped.business?.name,
      'business_name'
    );

    // Merge industry
    const industry = createField(
      profile.primary_industry,
      this.normalizeIndustry(scraped.business?.industry),
      'industry'
    );

    // Merge service types
    const service_types = createField(
      profile.service_types,
      scraped.business?.services,
      'service_types'
    );

    // Merge competitors
    const scraped_competitors = scraped.competitors?.map(c => ({
      name: c.name,
      url: c.url,
      excluded: false,
      notes: c.description
    })) || [];

    const competitors = createField(
      profile.competitors,
      scraped_competitors,
      'competitors'
    );

    // Merge contact info
    const phone = createField(
      undefined, // typically not in profile
      scraped.business?.phone,
      'phone'
    );

    const email = createField(
      undefined,
      scraped.business?.email,
      'email'
    );

    const location = createField(
      profile.service_area?.cities?.[0],
      scraped.business?.location,
      'location'
    );

    const merged_data: MergedContractorData = {
      business_name,
      industry,
      service_types,
      competitors,
      phone,
      email,
      location
    };

    return {
      merged_data,
      conflicts,
      warnings
    };
  }

  /**
   * Normalize scraped industry string to ContractorIndustry enum
   */
  private static normalizeIndustry(scraped?: string): ContractorIndustry | undefined {
    if (!scraped) return undefined;

    const lower = scraped.toLowerCase();

    if (lower.includes('hvac') || lower.includes('heating') || lower.includes('cooling') || lower.includes('air conditioning')) {
      return 'HVAC';
    }
    if (lower.includes('plumb')) {
      return 'Plumbing';
    }
    if (lower.includes('roof')) {
      return 'Roofing';
    }
    if (lower.includes('remodel') || lower.includes('renovation') || lower.includes('construction')) {
      return 'Remodeling';
    }
    if (lower.includes('landscape') || lower.includes('lawn') || lower.includes('garden')) {
      return 'Landscaping';
    }
    if (lower.includes('propane') || lower.includes('gas')) {
      return 'Propane';
    }
    if (lower.includes('electric')) {
      return 'Electrical';
    }
    if (lower.includes('paint')) {
      return 'Painting';
    }
    if (lower.includes('concrete') || lower.includes('cement')) {
      return 'Concrete';
    }
    if (lower.includes('fence') || lower.includes('fencing')) {
      return 'Fencing';
    }

    return 'Other';
  }

  /**
   * Calculate profile completeness score (0-1)
   */
  static calculateCompleteness(profile: Partial<ContractorProfile>): number {
    let score = 0;
    const weights = {
      primary_industry: 0.15,
      service_types: 0.15,
      service_area: 0.10,
      customer_types: 0.08,
      pricing_model: 0.07,
      crew_size: 0.05,
      roles: 0.08,
      competitors: 0.10,
      lead_sources: 0.07,
      kpis: 0.10,
      peak_seasons: 0.03,
      photos: 0.02
    };

    if (profile.primary_industry) score += weights.primary_industry;
    if (profile.service_types?.length) score += weights.service_types;
    if (profile.service_area?.cities?.length || profile.service_area?.radius_miles) {
      score += weights.service_area;
    }
    if (profile.customer_types?.length) score += weights.customer_types;
    if (profile.pricing_model) score += weights.pricing_model;
    if (profile.crew_size) score += weights.crew_size;
    if (profile.roles?.length) score += weights.roles;
    if (profile.competitors?.length) score += weights.competitors;
    if (profile.lead_sources?.length) score += weights.lead_sources;
    if (profile.kpis && Object.keys(profile.kpis).length > 0) {
      score += weights.kpis;
    }
    if (profile.peak_seasons?.length) score += weights.peak_seasons;
    if (profile.photos?.length) score += weights.photos;

    return Math.min(1, score);
  }

  /**
   * Get profile summary for AI agents
   */
  static getProfileSummary(profile: ContractorProfile): string {
    const parts: string[] = [];

    parts.push(`Industry: ${profile.primary_industry}`);

    if (profile.service_types?.length) {
      parts.push(`Services: ${profile.service_types.join(', ')}`);
    }

    if (profile.service_area?.cities?.length) {
      parts.push(`Service Area: ${profile.service_area.cities.join(', ')}`);
      if (profile.service_area.radius_miles) {
        parts.push(`within ${profile.service_area.radius_miles} miles`);
      }
    }

    if (profile.customer_types?.length) {
      parts.push(`Customer Types: ${profile.customer_types.join(', ')}`);
    }

    if (profile.crew_size) {
      parts.push(`Crew Size: ${profile.crew_size}`);
    }

    if (profile.kpis?.leads_per_week) {
      parts.push(`Leads/Week: ${profile.kpis.leads_per_week}`);
    }

    if (profile.kpis?.close_rate) {
      parts.push(`Close Rate: ${(profile.kpis.close_rate * 100).toFixed(1)}%`);
    }

    if (profile.kpis?.avg_ticket) {
      parts.push(`Avg Ticket: $${profile.kpis.avg_ticket}`);
    }

    return parts.join(' | ');
  }

  /**
   * Suggest missing fields based on profile completeness
   */
  static suggestNextSteps(profile: Partial<ContractorProfile>): string[] {
    const suggestions: string[] = [];

    if (!profile.kpis?.leads_per_week) {
      suggestions.push('Add typical leads per week to enable lead forecasting');
    }

    if (!profile.kpis?.close_rate) {
      suggestions.push('Add close rate to calculate revenue projections');
    }

    if (!profile.kpis?.avg_ticket) {
      suggestions.push('Add average ticket size for revenue analysis');
    }

    if (!profile.competitors?.length) {
      suggestions.push('Add 3-5 known competitors for competitive intelligence');
    }

    if (!profile.photos?.length) {
      suggestions.push('Upload job photos to enable quality control analysis');
    }

    if (!profile.roles?.length) {
      suggestions.push('Add crew roles to get hiring recommendations');
    }

    return suggestions.slice(0, 3); // Top 3 suggestions
  }
}
