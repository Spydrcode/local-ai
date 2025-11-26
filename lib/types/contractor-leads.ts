/**
 * Lead tracking types for contractor businesses
 */

import type { LeadSource } from './contractor';

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost' | 'nurture';
export type LeadUrgency = 'emergency' | 'urgent' | 'normal' | 'flexible';

export interface ContractorLead {
  id: string;
  demo_id: string;
  source: LeadSource;
  status: LeadStatus;
  estimated_value?: number;
  actual_value?: number;
  service_type?: string;
  urgency?: LeadUrgency;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  metadata?: Record<string, any>;
  created_at: string;
  contacted_at?: string;
  quoted_at?: string;
  closed_at?: string;
  updated_at: string;
}

export interface WeeklyLeadSummary {
  demo_id: string;
  week_start: string;
  total_leads: number;
  won_leads: number;
  lost_leads: number;
  google_leads: number;
  facebook_leads: number;
  referral_leads: number;
  avg_ticket?: number;
  total_revenue?: number;
}

export interface LeadPrediction {
  id: string;
  demo_id: string;
  prediction_date: string;
  week_start: string;
  week_end: string;
  predicted_leads_low: number;
  predicted_leads_high: number;
  predicted_leads_midpoint: number;
  confidence: number; // 0-1
  actual_leads?: number;
  prediction_accuracy?: number; // 0-1
  data_sources: DataSourceUsage;
  seasonal_factor?: number;
  trend_factor?: number;
  reasoning: string;
  recommended_actions: RecommendedAction[];
  created_at: string;
  actual_data_recorded_at?: string;
}

export interface DataSourceUsage {
  historical_data: {
    weeks_analyzed: number;
    average_leads: number;
    used: boolean;
  };
  seasonal_pattern: {
    current_season: string;
    historical_multiplier: number;
    used: boolean;
  };
  market_signals: {
    google_trends_score?: number;
    building_permits?: number;
    competitor_ad_volume?: number;
    used: boolean;
  };
  profile_data: {
    typical_leads_per_week?: number;
    used: boolean;
  };
}

export interface RecommendedAction {
  priority: number; // 1-3
  action_type: 'ad_campaign' | 'social_post' | 'email_campaign' | 'pricing_test' | 'content' | 'outreach';
  title: string;
  description: string;
  details: any; // Type varies by action_type
  confidence: 'high' | 'medium' | 'low';
  source: string; // Why this action was recommended
  estimated_impact?: string; // e.g., "+3-5 leads"
}

// Specific action detail types
export interface FacebookAdAction {
  action_type: 'ad_campaign';
  details: {
    headline: string;
    primary_text: string;
    cta: string;
    suggested_budget_weekly: number;
    targeting: {
      location: string;
      radius_miles: number;
      age_range?: string;
      interests?: string[];
    };
    image_suggestions?: string[];
    ad_copy_variants?: Array<{
      headline: string;
      primary_text: string;
    }>;
  };
}

export interface SocialPostAction {
  action_type: 'social_post';
  details: {
    platforms: Array<'facebook' | 'instagram' | 'nextdoor' | 'linkedin'>;
    post_type: 'before_after' | 'testimonial' | 'tip' | 'promotion' | 'educational';
    post_count: number;
    post_templates: Array<{
      copy: string;
      image_type: string;
      hashtags?: string[];
    }>;
    suggested_posting_schedule: string; // "Monday, Wednesday, Friday"
  };
}

export interface EmailCampaignAction {
  action_type: 'email_campaign';
  details: {
    campaign_type: 'follow_up' | 'nurture' | 'reactivation' | 'seasonal_promo';
    subject_line: string;
    preview_text: string;
    email_body: string;
    target_segment: string; // "last 50 leads", "lost opportunities", etc.
    send_schedule: string;
    expected_response_rate?: number; // 0-1
  };
}

export interface PricingTestAction {
  action_type: 'pricing_test';
  details: {
    test_type: 'a_b' | 'seasonal_discount' | 'bundle';
    variant_a: {
      name: string;
      description: string;
      price?: number;
    };
    variant_b: {
      name: string;
      description: string;
      price?: number;
    };
    test_duration_days: number;
    success_metric: string;
  };
}

export type MarketSignalType =
  | 'google_trends'
  | 'building_permit'
  | 'competitor_ad'
  | 'weather'
  | 'economic'
  | 'seasonal_event';

export interface MarketSignal {
  id: string;
  demo_id: string;
  signal_type: MarketSignalType;
  signal_value: number;
  signal_data: Record<string, any>;
  location?: string;
  period_start: string;
  period_end: string;
  source: string;
  created_at: string;
  fetched_at: string;
}

// Helper types for lead analytics
export interface LeadTrend {
  period: string; // "2025-W03"
  leads: number;
  change_from_previous: number; // percentage
  change_from_average: number; // percentage
}

export interface LeadSourceBreakdown {
  source: LeadSource;
  count: number;
  percentage: number;
  conversion_rate?: number;
  avg_value?: number;
}

export interface LeadConversionFunnel {
  new: number;
  contacted: number;
  quoted: number;
  won: number;
  lost: number;
  conversion_rate: number; // new -> won
  avg_time_to_close_days?: number;
}

// Weekly Pulse output (complete)
export interface WeeklyPulse {
  demo_id: string;
  generated_at: string;
  week_start: string;
  week_end: string;

  // Prediction
  prediction: {
    expected_leads_low: number;
    expected_leads_high: number;
    expected_leads_midpoint: number;
    confidence: 'high' | 'medium' | 'low';
    confidence_score: number; // 0-1
  };

  // Top 3 actions
  top_actions: RecommendedAction[];

  // Context
  historical_context: {
    last_week_leads: number;
    four_week_average: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
  };

  // Market signals
  market_context: {
    seasonal_factor: number; // 1.0 = normal, >1.0 = above avg
    local_demand_score: number; // 0-100
    competitor_activity: 'low' | 'medium' | 'high';
    notable_signals: string[]; // Human-readable signals
  };

  // Data sources used
  data_sources: DataSourceUsage;

  // Reasoning
  reasoning: string;
}
