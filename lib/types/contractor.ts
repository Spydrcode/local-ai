/**
 * Contractor-specific types for operational copilot features
 */

export type ContractorIndustry =
  | 'HVAC'
  | 'Plumbing'
  | 'Roofing'
  | 'Remodeling'
  | 'Landscaping'
  | 'Propane'
  | 'Electrical'
  | 'Painting'
  | 'Concrete'
  | 'Fencing'
  | 'Other';

export type PricingModel = 'flat_rate' | 'per_hour' | 'estimate_based' | 'seasonal';

export type CustomerType = 'residential' | 'commercial' | 'industrial' | 'fleet';

export type LeadSource = 'referrals' | 'google' | 'facebook' | 'nextdoor' | 'yelp' | 'instagram' | 'website' | 'door_hangers' | 'truck_wraps' | 'other';

export interface ServiceArea {
  cities: string[];
  zip_ranges: string[];
  radius_miles: number;
  center_location?: {
    lat: number;
    lng: number;
  };
}

export interface CrewRole {
  title: string;
  count: number;
}

export interface Competitor {
  name: string;
  url?: string;
  excluded: boolean;
  notes?: string;
  discovered_at?: string;
}

export interface JobPhoto {
  job_id: string;
  url: string;
  type: 'before' | 'after' | 'before_after' | 'in_progress' | 'final';
  uploaded_at: string;
  description?: string;
}

export interface ContractorKPIs {
  leads_per_week?: number;
  close_rate?: number; // 0-1
  avg_ticket?: number; // dollars
  time_to_complete_days?: number;
  customer_lifetime_value?: number;
  repeat_customer_rate?: number; // 0-1
  referral_rate?: number; // 0-1
}

export interface ContractorProfile {
  primary_industry: ContractorIndustry;
  industry_other?: string; // if primary_industry is 'Other'
  service_types: string[];
  service_area: ServiceArea;
  customer_types: CustomerType[];
  pricing_model: PricingModel;
  peak_seasons: string[];
  off_seasons: string[];
  crew_size: number;
  roles: CrewRole[];
  competitors: Competitor[];
  lead_sources: LeadSource[];
  photos: JobPhoto[];
  kpis: ContractorKPIs;
  onboarding_completed_at?: string;
  profile_completeness: number; // 0-1
}

/**
 * Data sources for merging business intelligence
 */
export type DataSource = 'profile' | 'scraped' | 'inferred';

export interface DataSourcedField<T> {
  value: T;
  source: DataSource;
  confidence: number; // 0-1
  scraped_value?: T; // Show conflicting scraped data
  last_updated: string;
}

/**
 * Merged business data with source tracking
 */
export interface MergedContractorData {
  business_name: DataSourcedField<string>;
  industry: DataSourcedField<ContractorIndustry>;
  service_types: DataSourcedField<string[]>;
  competitors: DataSourcedField<Competitor[]>;
  phone?: DataSourcedField<string>;
  email?: DataSourcedField<string>;
  location?: DataSourcedField<string>;
}

/**
 * Profile validation result
 */
export interface ProfileValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // 0-1
  missing_fields: string[];
  suggested_improvements: string[];
}

/**
 * Competitor filter configuration
 */
export interface CompetitorFilterConfig {
  exclude_industries: ContractorIndustry[];
  exclude_customer_types: CustomerType[];
  max_distance_miles?: number;
  min_relevance_score: number; // 0-1
}

/**
 * Filtered competitor result
 */
export interface FilteredCompetitor extends Competitor {
  relevance_score: number; // 0-1
  relevance_reasons: string[];
  distance_miles?: number;
  should_exclude: boolean;
  exclusion_reasons: string[];
}
