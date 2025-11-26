/**
 * Monthly reporting types for contractor businesses
 */

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type OpportunityImpact = 'high' | 'medium' | 'low';
export type Trend = 'up' | 'down' | 'stable';

export interface KPISnapshot {
  leads_per_week: {
    current: number;
    prev_month: number;
    trend: Trend;
    trend_percentage: number;
  };
  close_rate: {
    current: number; // 0-1
    prev_month: number;
    trend: Trend;
    trend_percentage: number;
  };
  avg_ticket: {
    current: number;
    prev_month: number;
    trend: Trend;
    trend_percentage: number;
  };
  job_backlog_days: {
    current: number;
    prev_month: number;
    trend: Trend;
  };
  qc_pass_rate?: {
    current: number; // 0-1
    prev_month: number;
    trend: Trend;
  };
  revenue?: {
    current: number;
    prev_month: number;
    trend: Trend;
    trend_percentage: number;
  };
}

export interface BusinessRisk {
  risk: string;
  severity: RiskLevel;
  confidence: number; // 0-1
  category: 'leads' | 'quality' | 'crew' | 'reputation' | 'financial' | 'market';
  detected_from: string; // Data source
  recommended_action: string;
  timeline: string; // "Address this week", "Monitor for 2 weeks", etc.
}

export interface BusinessOpportunity {
  opportunity: string;
  impact: OpportunityImpact;
  confidence: number; // 0-1
  category: 'growth' | 'efficiency' | 'marketing' | 'hiring' | 'pricing' | 'market';
  detected_from: string;
  recommended_action: string;
  estimated_value?: string; // "$5,000-10,000 additional revenue"
}

export interface ActionItem {
  priority: number; // 1-5
  action: string;
  category: string;
  deadline: 'today' | 'this_week' | 'next_week' | 'this_month';
  estimated_time: string;
  impact: string;
  owner?: 'owner' | 'admin' | 'foreman' | 'team';
}

export interface MonthlyOnePager {
  demo_id: string;
  month: string; // "2025-01"
  generated_at: string;

  // Summary
  executive_summary: string;

  // KPIs
  kpi_snapshot: KPISnapshot;

  // Risks & Opportunities
  top_3_risks: BusinessRisk[];
  top_3_opportunities: BusinessOpportunity[];

  // Actions
  action_items: ActionItem[];

  // Supporting data
  lead_sources_breakdown?: Array<{
    source: string;
    count: number;
    conversion_rate: number;
  }>;

  job_types_breakdown?: Array<{
    type: string;
    count: number;
    avg_value: number;
  }>;

  // Metadata
  data_completeness: number; // 0-1
  confidence_level: 'high' | 'medium' | 'low';
}

export interface MonthlyReportInput {
  demo_id: string;
  month_start: Date;
  month_end: Date;
  profile: any; // ContractorProfile
  leads_data: any[];
  jobs_data: any[];
  qc_data: any[];
  predictions_data: any[];
  market_signals: any[];
}

export interface MonthlyReportOutput {
  report: MonthlyOnePager;
  charts_data: {
    leads_trend: Array<{ week: string; count: number }>;
    revenue_trend: Array<{ week: string; revenue: number }>;
    lead_sources: Array<{ source: string; count: number }>;
  };
  export_ready: boolean;
}
