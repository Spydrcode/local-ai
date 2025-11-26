-- Lead tracking for contractor businesses
-- Enables predictive lead forecasting and historical analysis

-- Create contractor_leads table
CREATE TABLE IF NOT EXISTS contractor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Lead details
  source TEXT NOT NULL, -- 'google', 'facebook', 'referral', 'website', 'nextdoor', 'yelp', etc.
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'won', 'lost', 'nurture'

  -- Lead value
  estimated_value NUMERIC,
  actual_value NUMERIC, -- if won

  -- Service requested
  service_type TEXT,
  urgency TEXT, -- 'emergency', 'urgent', 'normal', 'flexible'

  -- Contact info (optional, for CRM integration)
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  quoted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_contractor_leads_demo_id ON contractor_leads(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_created_at ON contractor_leads(demo_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_source ON contractor_leads(demo_id, source);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_status ON contractor_leads(demo_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_week ON contractor_leads(demo_id, date_trunc('week', created_at));

-- Create weekly lead summary materialized view for faster analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS contractor_leads_weekly_summary AS
SELECT
  demo_id,
  date_trunc('week', created_at) as week_start,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'won') as won_leads,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_leads,
  COUNT(*) FILTER (WHERE source = 'google') as google_leads,
  COUNT(*) FILTER (WHERE source = 'facebook') as facebook_leads,
  COUNT(*) FILTER (WHERE source = 'referral') as referral_leads,
  AVG(actual_value) FILTER (WHERE status = 'won') as avg_ticket,
  SUM(actual_value) FILTER (WHERE status = 'won') as total_revenue
FROM contractor_leads
GROUP BY demo_id, date_trunc('week', created_at);

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractor_leads_weekly_summary_unique
ON contractor_leads_weekly_summary(demo_id, week_start);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_contractor_leads_weekly_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY contractor_leads_weekly_summary;
END;
$$ LANGUAGE plpgsql;

-- Create lead predictions table (for storing AI predictions)
CREATE TABLE IF NOT EXISTS contractor_lead_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Prediction window
  prediction_date DATE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Predictions
  predicted_leads_low INTEGER NOT NULL,
  predicted_leads_high INTEGER NOT NULL,
  predicted_leads_midpoint INTEGER NOT NULL,
  confidence NUMERIC NOT NULL, -- 0-1

  -- Actual results (filled in after week completes)
  actual_leads INTEGER,
  prediction_accuracy NUMERIC, -- 0-1, calculated after actual data

  -- Reasoning
  data_sources JSONB NOT NULL, -- which data sources were used
  seasonal_factor NUMERIC, -- adjustment for seasonality
  trend_factor NUMERIC, -- adjustment for trends
  reasoning TEXT, -- human-readable explanation

  -- Top actions
  recommended_actions JSONB NOT NULL, -- array of action objects

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actual_data_recorded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contractor_lead_predictions_demo_id ON contractor_lead_predictions(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_lead_predictions_week ON contractor_lead_predictions(demo_id, week_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractor_lead_predictions_unique ON contractor_lead_predictions(demo_id, week_start);

-- Create market signals table (for external data like permits, trends)
CREATE TABLE IF NOT EXISTS contractor_market_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT NOT NULL REFERENCES demos(id) ON DELETE CASCADE,

  -- Signal type
  signal_type TEXT NOT NULL, -- 'google_trends', 'building_permit', 'competitor_ad', 'weather', 'economic'

  -- Signal data
  signal_value NUMERIC NOT NULL,
  signal_data JSONB NOT NULL,

  -- Geographic scope
  location TEXT, -- city or ZIP

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Source
  source TEXT NOT NULL, -- 'google_trends_api', 'city_permit_feed', 'meta_ads_library'

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contractor_market_signals_demo_id ON contractor_market_signals(demo_id);
CREATE INDEX IF NOT EXISTS idx_contractor_market_signals_type ON contractor_market_signals(demo_id, signal_type);
CREATE INDEX IF NOT EXISTS idx_contractor_market_signals_period ON contractor_market_signals(demo_id, period_start, period_end);

-- Comments
COMMENT ON TABLE contractor_leads IS 'Lead tracking for contractor businesses - historical data for predictions';
COMMENT ON TABLE contractor_lead_predictions IS 'AI-generated weekly lead predictions with confidence scores';
COMMENT ON TABLE contractor_market_signals IS 'External market signals (permits, trends) for predictive modeling';
COMMENT ON MATERIALIZED VIEW contractor_leads_weekly_summary IS 'Weekly aggregated lead statistics for fast analytics';

-- Row-level security (RLS) policies
ALTER TABLE contractor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_lead_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_market_signals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view leads for their demos
CREATE POLICY contractor_leads_select_policy ON contractor_leads
  FOR SELECT
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Policy: Users can insert leads for their demos
CREATE POLICY contractor_leads_insert_policy ON contractor_leads
  FOR INSERT
  WITH CHECK (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Policy: Users can update leads for their demos
CREATE POLICY contractor_leads_update_policy ON contractor_leads
  FOR UPDATE
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Similar policies for predictions and signals
CREATE POLICY contractor_lead_predictions_select_policy ON contractor_lead_predictions
  FOR SELECT
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY contractor_market_signals_select_policy ON contractor_market_signals
  FOR SELECT
  USING (
    demo_id IN (
      SELECT id FROM demos WHERE created_by_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
