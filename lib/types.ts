/**
 * Small-Business Friendly Types
 * Plain English data structures for Local AI
 */

export interface QuickWin {
  id: string;
  title: string;
  why: string; // Plain explanation of why this matters
  action: string; // Clear action step
  estimated_impact?: string; // e.g., "Could bring 5-10 new customers/month"
  est_hours_saved_per_week?: number; // For automation wins
  difficulty?: "easy" | "medium" | "advanced"; // How hard to implement
  category?: "growth" | "visibility" | "time-saver" | "money-saver" | "reputation";
}

export interface AnalysisResult {
  business_id: string;
  business_name?: string;
  website?: string; // Store the website URL
  industry?: string; // Store the industry/sub-niche
  target_audience?: string; // Store the target audience
  summary: string; // 2-3 sentence overview in plain English
  top_quick_wins: QuickWin[]; // Top 3-5 actionable items

  // Scores (0-100 for easy understanding)
  visibility_score?: number; // How easy to find online
  reputation_score?: number; // Review quality
  growth_potential_score?: number; // Opportunity rating

  // Time savers
  time_savers?: {
    total_hours_per_week?: number;
    top_automation_opportunities?: string[];
  };

  // Real data from multi-source collection
  real_data?: {
    competitors?: number;
    reviews?: number;
    avgRating?: number;
    seoScore?: {
      desktop: number;
      mobile: number;
    };
    domainAuthority?: number;
    socialPlatforms?: number;
    dataQuality?: string;
  };

  // Analysis metadata
  metadata?: {
    analysis_agents?: string[];
    execution_time_ms?: number;
    cache_hit?: boolean;
    data_sources?: string[];
    confidence_score?: number;
  };

  // Keep raw data for export/debug only
  raw_insights?: any;
  ui_text_version?: string; // Human-readable full report

  last_updated?: string;
  created_at?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  goals?: string[]; // What they want to achieve
}

export interface DashboardTab {
  id: string;
  label: string;
  description: string;
  icon?: string;
}
