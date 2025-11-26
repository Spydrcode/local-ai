/**
 * Monitoring & Alerts types for contractor businesses
 */

export type AlertType =
  | 'ranking_drop'
  | 'negative_review'
  | 'new_competitor'
  | 'lead_volume_lag'
  | 'qc_failure_spike'
  | 'crew_turnover';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';
export type CheckFrequency = 'hourly' | 'daily' | 'weekly';
export type NotificationChannel = 'in_app' | 'email' | 'sms';

// Alert configurations
export interface AlertConfig {
  id: string;
  demo_id: string;
  alert_type: AlertType;
  is_enabled: boolean;
  check_frequency: CheckFrequency;
  threshold_config: RankingDropThreshold | NegativeReviewThreshold | NewCompetitorThreshold | LeadVolumeLagThreshold | QCFailureSpikeThreshold | CrewTurnoverThreshold;
  notification_channels: NotificationChannel[];
  created_at: string;
  updated_at: string;
}

// Threshold types
export interface RankingDropThreshold {
  positions_dropped: number; // Alert if drop by X positions
  keywords: string[]; // Which keywords to monitor
}

export interface NegativeReviewThreshold {
  min_stars: number; // Alert if <= this many stars
  platforms: ('google' | 'yelp' | 'facebook')[];
}

export interface NewCompetitorThreshold {
  distance_miles: number; // How close
  service_overlap_threshold: number; // 0-1, % of services overlapping
}

export interface LeadVolumeLagThreshold {
  percent_below_expected: number; // Alert if X% below Weekly Pulse prediction
}

export interface QCFailureSpikeThreshold {
  failure_rate_threshold: number; // 0-1
  min_jobs: number; // Minimum jobs to analyze
}

export interface CrewTurnoverThreshold {
  employees_left_last_30_days: number;
}

// Triggered alerts
export interface ContractorAlert {
  id: string;
  demo_id: string;
  config_id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  detected_data: RankingDropData | NegativeReviewData | NewCompetitorData | LeadVolumeLagData | QCFailureSpikeData | CrewTurnoverData;
  recommended_actions: RecommendedAction[];
  status: AlertStatus;
  acknowledged_at?: string;
  resolved_at?: string;
  notifications_sent: NotificationSent[];
  created_at: string;
  updated_at: string;
}

// Detected data types
export interface RankingDropData {
  keyword: string;
  old_rank: number;
  new_rank: number;
  positions_dropped: number;
  search_url?: string;
  competitor_now_ahead?: string;
}

export interface NegativeReviewData {
  platform: 'google' | 'yelp' | 'facebook';
  stars: number;
  review_text: string;
  reviewer_name?: string;
  review_url?: string;
  posted_at: string;
}

export interface NewCompetitorData {
  name: string;
  distance_miles: number;
  address?: string;
  services: string[];
  service_overlap_percent: number;
  google_rating?: number;
  review_count?: number;
  detected_from: string; // 'google_maps' | 'yelp' | 'web_scrape'
}

export interface LeadVolumeLagData {
  current_week_leads: number;
  expected_leads_low: number;
  expected_leads_high: number;
  percent_below_expected: number;
  trend: 'accelerating_decline' | 'steady_decline' | 'slight_decline';
}

export interface QCFailureSpikeData {
  jobs_analyzed: number;
  failed_jobs: number;
  failure_rate: number;
  prev_period_failure_rate: number;
  increase_percentage: number;
  common_issues: string[];
}

export interface CrewTurnoverData {
  employees_left: number;
  period_days: number;
  names?: string[];
  roles?: string[];
  avg_tenure_months?: number;
}

// Actions
export interface RecommendedAction {
  action: string;
  priority: number; // 1-5
  estimated_time?: string;
  category: string;
}

export interface NotificationSent {
  channel: NotificationChannel;
  sent_at: string;
  success: boolean;
  error?: string;
}

// Monitoring snapshots
export type SnapshotType = 'google_rankings' | 'reviews_aggregate' | 'competitor_scan' | 'lead_volume';

export interface MonitoringSnapshot {
  id: string;
  demo_id: string;
  snapshot_type: SnapshotType;
  snapshot_data: GoogleRankingsSnapshot | ReviewsAggregateSnapshot | CompetitorScanSnapshot | LeadVolumeSnapshot;
  captured_at: string;
}

export interface GoogleRankingsSnapshot {
  [keyword: string]: number; // keyword -> rank position
}

export interface ReviewsAggregateSnapshot {
  google?: { avg: number; count: number };
  yelp?: { avg: number; count: number };
  facebook?: { avg: number; count: number };
}

export interface CompetitorScanSnapshot {
  competitors: Array<{
    name: string;
    rank: number;
    distance_miles?: number;
  }>;
}

export interface LeadVolumeSnapshot {
  week_leads: number;
  expected_low: number;
  expected_high: number;
}

// Alert summary
export interface AlertSummary {
  demo_id: string;
  new_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  latest_alert_at?: string;
}

// Monitoring Agent input/output
export interface MonitoringAgentInput {
  demo_id: string;
  profile: any; // ContractorProfile
  alert_configs: AlertConfig[];
  recent_snapshots: MonitoringSnapshot[];
  current_data: {
    rankings?: GoogleRankingsSnapshot;
    reviews?: ReviewsAggregateSnapshot;
    competitors?: CompetitorScanSnapshot;
    lead_volume?: LeadVolumeSnapshot;
    qc_stats?: {
      jobs_analyzed: number;
      failed_jobs: number;
      failure_rate: number;
    };
  };
}

export interface MonitoringAgentOutput {
  alerts_triggered: ContractorAlert[];
  snapshots_to_save: MonitoringSnapshot[];
  notifications_to_send: Array<{
    alert_id: string;
    channels: NotificationChannel[];
    recipients: {
      email?: string;
      phone?: string;
    };
  }>;
}

// Alert template (for initialization)
export interface AlertTemplate {
  id: string;
  alert_type: AlertType;
  default_enabled: boolean;
  default_frequency: CheckFrequency;
  default_threshold_config: any;
  description: string;
}
