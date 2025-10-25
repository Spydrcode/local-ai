-- Progress Tracking Schema Extension
-- Enables tracking action item implementation and metric improvements over time

-- Table: action_items_progress
-- Tracks which action items from roadmap/insights have been implemented
CREATE TABLE IF NOT EXISTS action_items_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  action_title TEXT NOT NULL,
  action_category TEXT NOT NULL, -- 'roadmap', 'profit_insight', 'competitor', 'conversion', etc.
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'blocked'
  priority TEXT, -- 'High', 'Medium', 'Low'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: metric_snapshots
-- Stores periodic metric snapshots to track improvement over time
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  website_grade INTEGER,
  monthly_revenue NUMERIC(10, 2),
  conversion_rate NUMERIC(5, 2),
  social_engagement_rate NUMERIC(5, 2),
  email_list_size INTEGER,
  avg_order_value NUMERIC(10, 2),
  customer_satisfaction NUMERIC(3, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: re_analysis_history
-- Tracks when re-analyses are performed to compare strategic evolution
CREATE TABLE IF NOT EXISTS re_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id UUID NOT NULL REFERENCES demos(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_type TEXT NOT NULL, -- 'quarterly', 'monthly', 'custom'
  profit_insights JSONB,
  competitor_analysis JSONB,
  conversion_analysis JSONB,
  key_changes TEXT[], -- Array of notable changes since last analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_items_demo_id ON action_items_progress(demo_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items_progress(status);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_demo_id ON metric_snapshots(demo_id);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_date ON metric_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_re_analysis_demo_id ON re_analysis_history(demo_id);
CREATE INDEX IF NOT EXISTS idx_re_analysis_date ON re_analysis_history(analysis_date);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for action_items_progress
CREATE TRIGGER update_action_items_progress_updated_at
  BEFORE UPDATE ON action_items_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE action_items_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE re_analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - adjust based on auth requirements)
CREATE POLICY "Allow all operations on action_items_progress" ON action_items_progress FOR ALL USING (true);
CREATE POLICY "Allow all operations on metric_snapshots" ON metric_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all operations on re_analysis_history" ON re_analysis_history FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE action_items_progress IS 'Tracks implementation status of strategic action items';
COMMENT ON TABLE metric_snapshots IS 'Stores periodic metric snapshots for tracking business performance over time';
COMMENT ON TABLE re_analysis_history IS 'Maintains history of strategic re-analyses for comparison';
