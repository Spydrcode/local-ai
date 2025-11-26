-- =====================================================
-- Phase 6: Monitoring & Alerts System
-- =====================================================
-- Real-time business intelligence alerts for contractors
-- Monitors: rankings, reviews, competitors, lead volume

-- Alert types table
CREATE TABLE IF NOT EXISTS contractor_alert_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Alert type
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'ranking_drop',
    'negative_review',
    'new_competitor',
    'lead_volume_lag',
    'qc_failure_spike',
    'crew_turnover'
  )),

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  check_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly')),

  -- Thresholds
  threshold_config JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- ranking_drop: { positions_dropped: 5, keywords: ['hvac repair'] }
  -- negative_review: { min_stars: 2, platforms: ['google', 'yelp'] }
  -- lead_volume_lag: { percent_below_expected: 20 }
  -- qc_failure_spike: { failure_rate_threshold: 0.15 }

  -- Notification settings
  notification_channels JSONB NOT NULL DEFAULT '["in_app"]',
  -- ['in_app', 'email', 'sms']

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alert_configs_demo ON contractor_alert_configs(demo_id);
CREATE INDEX idx_alert_configs_enabled ON contractor_alert_configs(demo_id, is_enabled) WHERE is_enabled = true;

-- Triggered alerts
CREATE TABLE IF NOT EXISTS contractor_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  config_id UUID REFERENCES contractor_alert_configs(id) ON DELETE SET NULL,

  -- Alert details
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Data snapshot
  detected_data JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- ranking_drop: { keyword: 'hvac repair', old_rank: 3, new_rank: 12, url: '...' }
  -- negative_review: { platform: 'google', stars: 1, review_text: '...', reviewer: '...' }
  -- new_competitor: { name: 'ABC Plumbing', distance_miles: 5, services: [...] }

  -- Recommended actions
  recommended_actions JSONB DEFAULT '[]',
  -- [{ action: 'Update GBP with recent photos', priority: 1 }]

  -- Status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Notifications sent
  notifications_sent JSONB DEFAULT '[]',
  -- [{ channel: 'email', sent_at: '...', success: true }]

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_demo ON contractor_alerts(demo_id);
CREATE INDEX idx_alerts_status ON contractor_alerts(demo_id, status);
CREATE INDEX idx_alerts_created ON contractor_alerts(created_at DESC);
CREATE INDEX idx_alerts_severity ON contractor_alerts(demo_id, severity) WHERE status = 'new';

-- Monitoring snapshots (for trend detection)
CREATE TABLE IF NOT EXISTS contractor_monitoring_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Snapshot type
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN (
    'google_rankings',
    'reviews_aggregate',
    'competitor_scan',
    'lead_volume'
  )),

  -- Data
  snapshot_data JSONB NOT NULL,
  -- Examples:
  -- google_rankings: { 'hvac repair': 3, 'ac installation': 7 }
  -- reviews_aggregate: { google: { avg: 4.8, count: 127 }, yelp: { avg: 4.5, count: 89 } }
  -- competitor_scan: [{ name: 'XYZ HVAC', rank: 1 }, { name: 'ABC Heating', rank: 2 }]
  -- lead_volume: { week_leads: 12, expected_low: 15, expected_high: 25 }

  -- Metadata
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_demo_type ON contractor_monitoring_snapshots(demo_id, snapshot_type);
CREATE INDEX idx_snapshots_captured ON contractor_monitoring_snapshots(captured_at DESC);

-- Default alert configurations (inserted on profile creation)
CREATE TABLE IF NOT EXISTS contractor_alert_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL UNIQUE,
  default_enabled BOOLEAN DEFAULT true,
  default_frequency TEXT NOT NULL,
  default_threshold_config JSONB NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO contractor_alert_templates (alert_type, default_enabled, default_frequency, default_threshold_config, description) VALUES
('ranking_drop', true, 'daily', '{"positions_dropped": 5, "keywords": ["primary_service"]}', 'Alert when Google Maps ranking drops by 5+ positions for key services'),
('negative_review', true, 'daily', '{"min_stars": 2, "platforms": ["google", "yelp", "facebook"]}', 'Alert on any review 2 stars or below on major platforms'),
('new_competitor', true, 'weekly', '{"distance_miles": 10, "service_overlap_threshold": 0.7}', 'Alert when new competitor appears in service area with similar services'),
('lead_volume_lag', true, 'weekly', '{"percent_below_expected": 20}', 'Alert when lead volume is 20%+ below Weekly Pulse prediction'),
('qc_failure_spike', true, 'weekly', '{"failure_rate_threshold": 0.15, "min_jobs": 5}', 'Alert when QC failure rate exceeds 15% (with at least 5 jobs analyzed)'),
('crew_turnover', false, 'weekly', '{"employees_left_last_30_days": 2}', 'Alert when 2+ crew members leave within 30 days');

-- RLS Policies
ALTER TABLE contractor_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_monitoring_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their alert configs"
  ON contractor_alert_configs FOR SELECT
  USING (true); -- Public access for now

CREATE POLICY "Users can insert their alert configs"
  ON contractor_alert_configs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their alert configs"
  ON contractor_alert_configs FOR UPDATE
  USING (true);

CREATE POLICY "Users can view their alerts"
  ON contractor_alerts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their alerts"
  ON contractor_alerts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their alerts"
  ON contractor_alerts FOR UPDATE
  USING (true);

CREATE POLICY "Users can view their monitoring snapshots"
  ON contractor_monitoring_snapshots FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their monitoring snapshots"
  ON contractor_monitoring_snapshots FOR INSERT
  WITH CHECK (true);

-- Materialized view for alert summary
CREATE MATERIALIZED VIEW contractor_alert_summary AS
SELECT
  demo_id,
  COUNT(*) FILTER (WHERE status = 'new') AS new_alerts,
  COUNT(*) FILTER (WHERE status = 'new' AND severity = 'critical') AS critical_alerts,
  COUNT(*) FILTER (WHERE status = 'new' AND severity = 'high') AS high_alerts,
  COUNT(*) FILTER (WHERE status = 'acknowledged') AS acknowledged_alerts,
  COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_alerts,
  MAX(created_at) FILTER (WHERE status = 'new') AS latest_alert_at
FROM contractor_alerts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY demo_id;

CREATE UNIQUE INDEX idx_alert_summary_demo ON contractor_alert_summary(demo_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_contractor_alert_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY contractor_alert_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE contractor_alert_configs IS 'Alert configuration per demo (what to monitor, how often, thresholds)';
COMMENT ON TABLE contractor_alerts IS 'Triggered alerts with status tracking and recommended actions';
COMMENT ON TABLE contractor_monitoring_snapshots IS 'Point-in-time snapshots for trend detection (rankings, reviews, competitors)';
COMMENT ON TABLE contractor_alert_templates IS 'Default alert configurations to copy when creating new contractor profiles';
