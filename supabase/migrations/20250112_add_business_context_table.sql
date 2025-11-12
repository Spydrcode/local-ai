-- Business Context Table
-- Stores first-party business data collected from users
-- Critical for accurate strategic framework analysis

CREATE TABLE IF NOT EXISTS business_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  demo_id TEXT UNIQUE NOT NULL,
  agency_id TEXT,
  user_id TEXT,

  -- Quantitative Metrics
  annual_revenue NUMERIC,
  monthly_leads INTEGER,
  conversion_rate NUMERIC,
  customer_acquisition_cost NUMERIC,
  customer_lifetime_value NUMERIC,
  average_transaction_value NUMERIC,
  monthly_website_visitors INTEGER,
  employee_count INTEGER,

  -- Revenue by Product/Service (JSONB array)
  revenue_by_product JSONB,

  -- Strategic Goals (TEXT array)
  primary_goals TEXT[],

  -- Target Market Segments (JSONB array)
  target_segments JSONB,

  -- Competitive Intelligence (JSONB array)
  key_competitors JSONB,

  -- Positioning & Differentiation
  unique_value_proposition TEXT,
  competitive_advantages TEXT[],
  brand_attributes TEXT[],

  -- Business Challenges
  main_challenges TEXT[],
  constraints_limitations JSONB,

  -- Business Stage & Positioning
  growth_stage TEXT CHECK (growth_stage IN ('startup', 'growth', 'mature', 'decline')),
  market_position TEXT CHECK (market_position IN ('leader', 'challenger', 'follower', 'niche')),
  competitive_strategy TEXT CHECK (competitive_strategy IN ('cost-leadership', 'differentiation', 'focus', 'hybrid')),

  -- Market & Industry Context
  industry_type TEXT,
  market_size TEXT,
  market_growth_rate NUMERIC,
  seasonality JSONB,

  -- Customer Insights
  customer_demographics JSONB,
  customer_pain_points TEXT[],
  customer_success_metrics TEXT[],

  -- Marketing & Channels
  primary_marketing_channels TEXT[],
  marketing_budget NUMERIC,
  marketing_budget_allocation JSONB,

  -- Historical Performance
  historical_metrics JSONB,

  -- Metadata
  completeness_score INTEGER,
  source TEXT DEFAULT 'onboarding',
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_business_context_demo_id ON business_context(demo_id);
CREATE INDEX IF NOT EXISTS idx_business_context_agency_id ON business_context(agency_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_business_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_context_timestamp
  BEFORE UPDATE ON business_context
  FOR EACH ROW
  EXECUTE FUNCTION update_business_context_timestamp();

-- Comments for documentation
COMMENT ON TABLE business_context IS 'First-party business data collected from users for strategic framework analysis';
COMMENT ON COLUMN business_context.completeness_score IS 'Percentage (0-100) of how complete the business context is';
COMMENT ON COLUMN business_context.revenue_by_product IS 'Array of {name, revenue, growthRate, marketShare} for BCG Matrix analysis';
COMMENT ON COLUMN business_context.target_segments IS 'Array of {name, description, size, priority, currentPenetration} for market segmentation';
COMMENT ON COLUMN business_context.key_competitors IS 'Array of {name, website, estimatedMarketShare, strengths, weaknesses} for competitive analysis';
