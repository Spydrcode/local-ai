-- Migration: Add intelligent caching and monitoring tables
-- Description: Creates tables for analysis caching, business monitoring, alerts, and tracking

-- ============================================================================
-- ANALYSIS CACHE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analysis_cache (
  key TEXT PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('strategic', 'marketing', 'competitive', 'quick')),
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT fk_business FOREIGN KEY (business_id) REFERENCES demos(id) ON DELETE CASCADE
);

CREATE INDEX idx_cache_business_id ON analysis_cache(business_id);
CREATE INDEX idx_cache_analysis_type ON analysis_cache(analysis_type);
CREATE INDEX idx_cache_created_at ON analysis_cache(created_at);
CREATE INDEX idx_cache_last_accessed ON analysis_cache(last_accessed_at);

-- Function to increment cache access count
CREATE OR REPLACE FUNCTION increment_cache_access(cache_key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE analysis_cache
  SET 
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE key = cache_key;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BUSINESS MONITORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'competitor_activity',
    'seo_ranking',
    'market_trend',
    'sentiment_analysis',
    'website_changes'
  )),
  threshold JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'alert_immediately',
    'alert_daily_digest',
    'alert_weekly_digest'
  )),
  frequency TEXT NOT NULL CHECK (frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_monitors_business_id ON business_monitors(business_id);
CREATE INDEX idx_monitors_type ON business_monitors(type);
CREATE INDEX idx_monitors_is_active ON business_monitors(is_active);
CREATE INDEX idx_monitors_last_checked ON business_monitors(last_checked_at);

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES business_monitors(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  actionable TEXT[] DEFAULT ARRAY[]::TEXT[],
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_business_id ON alerts(business_id);
CREATE INDEX idx_alerts_monitor_id ON alerts(monitor_id);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ============================================================================
-- MONITOR STATES TABLE (for change detection)
-- ============================================================================
CREATE TABLE IF NOT EXISTS monitor_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES business_monitors(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_monitor_states_monitor_id ON monitor_states(monitor_id);
CREATE INDEX idx_monitor_states_created_at ON monitor_states(created_at);

-- ============================================================================
-- COMPREHENSIVE ANALYSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comprehensive_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  individual_results JSONB NOT NULL,
  synthesis JSONB NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_business_analysis UNIQUE(business_id)
);

CREATE INDEX idx_comp_analyses_business_id ON comprehensive_analyses(business_id);
CREATE INDEX idx_comp_analyses_created_at ON comprehensive_analyses(created_at);

-- ============================================================================
-- USER INTERACTIONS TABLE (for personalization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'recommendation_viewed',
    'recommendation_accepted',
    'recommendation_dismissed',
    'recommendation_implemented'
  )),
  recommendation_id TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('implemented', 'not_relevant', 'too_complex', 'deferred')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_business_id ON user_interactions(business_id);
CREATE INDEX idx_interactions_event_type ON user_interactions(event_type);
CREATE INDEX idx_interactions_recommendation_id ON user_interactions(recommendation_id);
CREATE INDEX idx_interactions_created_at ON user_interactions(created_at);

-- ============================================================================
-- ACTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  recommendation_ids TEXT[] NOT NULL,
  timeline JSONB NOT NULL, -- Weekly milestones
  resources JSONB NOT NULL, -- Time, budget, tools needed
  checkpoints JSONB NOT NULL, -- Success metrics and checkpoints
  templates JSONB DEFAULT '{}', -- Email, social, content templates
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_action_plans_business_id ON action_plans(business_id);
CREATE INDEX idx_action_plans_status ON action_plans(status);
CREATE INDEX idx_action_plans_created_at ON action_plans(created_at);

-- ============================================================================
-- ROI TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roi_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id TEXT NOT NULL,
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  predicted_roi NUMERIC(10, 2) NOT NULL,
  actual_roi NUMERIC(10, 2),
  variance NUMERIC(10, 2),
  baseline_metrics JSONB NOT NULL,
  current_metrics JSONB,
  implementation_date TIMESTAMPTZ,
  measurement_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_roi_tracking_business_id ON roi_tracking(business_id);
CREATE INDEX idx_roi_tracking_recommendation_id ON roi_tracking(recommendation_id);
CREATE INDEX idx_roi_tracking_implementation_date ON roi_tracking(implementation_date);

-- ============================================================================
-- COMPETITOR TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS competitor_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_url TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN (
    'product_launch',
    'pricing_change',
    'website_update',
    'content_update',
    'marketing_campaign',
    'funding_announcement',
    'other'
  )),
  description TEXT NOT NULL,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_competitor_tracking_business_id ON competitor_tracking(business_id);
CREATE INDEX idx_competitor_tracking_competitor_name ON competitor_tracking(competitor_name);
CREATE INDEX idx_competitor_tracking_detected_at ON competitor_tracking(detected_at);

-- ============================================================================
-- INDUSTRY BENCHMARKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  business_size TEXT NOT NULL CHECK (business_size IN ('micro', 'small', 'medium', 'large')),
  metrics JSONB NOT NULL, -- Traffic, conversion, AOV, CAC, etc.
  percentiles JSONB NOT NULL, -- P25, P50, P75, P90, P95
  sample_size INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_industry_benchmarks_industry ON industry_benchmarks(industry);
CREATE INDEX idx_industry_benchmarks_size ON industry_benchmarks(business_size);
CREATE INDEX idx_industry_benchmarks_period ON industry_benchmarks(period_start, period_end);

-- ============================================================================
-- Add columns to existing demos table (if not exists)
-- ============================================================================
DO $$
BEGIN
  -- Add strategic_analysis column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'strategic_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN strategic_analysis TEXT;
  END IF;

  -- Add marketing_analysis column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'marketing_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN marketing_analysis TEXT;
  END IF;

  -- Add competitive_analysis column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'competitive_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN competitive_analysis TEXT;
  END IF;

  -- Add alert_preferences column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'alert_preferences'
  ) THEN
    ALTER TABLE demos ADD COLUMN alert_preferences JSONB DEFAULT '{}';
  END IF;

  -- Add competitors column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'competitors'
  ) THEN
    ALTER TABLE demos ADD COLUMN competitors JSONB DEFAULT '[]';
  END IF;
END
$$;

-- ============================================================================
-- Create views for easy querying
-- ============================================================================

-- View for active monitors with latest alerts
CREATE OR REPLACE VIEW active_monitors_with_alerts AS
SELECT 
  m.id AS monitor_id,
  m.business_id,
  m.type AS monitor_type,
  m.is_active,
  m.last_checked_at,
  m.last_triggered_at,
  COUNT(a.id) FILTER (WHERE a.acknowledged = false) AS unacknowledged_alerts,
  MAX(a.created_at) AS latest_alert_at
FROM business_monitors m
LEFT JOIN alerts a ON a.monitor_id = m.id
WHERE m.is_active = true
GROUP BY m.id, m.business_id, m.type, m.is_active, m.last_checked_at, m.last_triggered_at;

-- View for cache statistics by business
CREATE OR REPLACE VIEW cache_stats_by_business AS
SELECT 
  business_id,
  COUNT(*) AS total_entries,
  SUM(access_count) AS total_accesses,
  AVG(access_count) AS avg_accesses_per_entry,
  MAX(created_at) AS latest_cache_entry,
  MIN(created_at) AS oldest_cache_entry,
  jsonb_object_agg(analysis_type, type_count) AS entries_by_type
FROM (
  SELECT 
    business_id,
    analysis_type,
    COUNT(*) AS type_count,
    created_at,
    access_count
  FROM analysis_cache
  GROUP BY business_id, analysis_type, created_at, access_count
) AS subquery
GROUP BY business_id;

-- ============================================================================
-- Grant permissions (adjust role name as needed)
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- COMPLETE
-- ============================================================================
COMMENT ON TABLE analysis_cache IS 'Intelligent caching for AI analysis results';
COMMENT ON TABLE business_monitors IS 'Continuous monitoring configuration';
COMMENT ON TABLE alerts IS 'Generated alerts from monitoring system';
COMMENT ON TABLE monitor_states IS 'Historical states for change detection';
COMMENT ON TABLE comprehensive_analyses IS 'Multi-agent synthesis results';
COMMENT ON TABLE user_interactions IS 'User behavior for personalization';
COMMENT ON TABLE action_plans IS 'Executable 90-day action plans';
COMMENT ON TABLE roi_tracking IS 'ROI prediction and actual tracking';
COMMENT ON TABLE competitor_tracking IS 'Competitor activity tracking';
COMMENT ON TABLE industry_benchmarks IS 'Industry performance benchmarks';
