-- Harvard Business Intelligence Layer - Database Migration
-- Adds columns for HBS agent results (SWOT, Business Model Canvas, GTM Strategy)

-- Add SWOT Analysis column
ALTER TABLE demos 
ADD COLUMN IF NOT EXISTS swot_analysis JSONB;

-- Add Business Model Canvas column
ALTER TABLE demos 
ADD COLUMN IF NOT EXISTS business_model_canvas JSONB;

-- Add Go-To-Market Strategy column
ALTER TABLE demos 
ADD COLUMN IF NOT EXISTS gtm_strategy JSONB;

-- Add unified HBS intelligence column (for multi-agent synthesis)
ALTER TABLE demos 
ADD COLUMN IF NOT EXISTS hbs_intelligence JSONB;

-- Create GIN indexes for JSONB columns (faster queries)
CREATE INDEX IF NOT EXISTS idx_demos_swot_analysis 
ON demos USING GIN (swot_analysis);

CREATE INDEX IF NOT EXISTS idx_demos_business_model_canvas 
ON demos USING GIN (business_model_canvas);

CREATE INDEX IF NOT EXISTS idx_demos_gtm_strategy 
ON demos USING GIN (gtm_strategy);

CREATE INDEX IF NOT EXISTS idx_demos_hbs_intelligence 
ON demos USING GIN (hbs_intelligence);

-- Agent execution tracking table
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_layer TEXT, -- 'strategy', 'innovation', 'execution', 'finance', 'organization', 'marketing'
  input_context JSONB,
  output_result JSONB,
  execution_time_ms INTEGER,
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX IF NOT EXISTS idx_agent_executions_demo 
ON agent_executions(demo_id);

CREATE INDEX IF NOT EXISTS idx_agent_executions_agent 
ON agent_executions(agent_name);

CREATE INDEX IF NOT EXISTS idx_agent_executions_layer 
ON agent_executions(agent_layer);

CREATE INDEX IF NOT EXISTS idx_agent_executions_created 
ON agent_executions(created_at DESC);

-- Strategic insights table (cross-agent insights)
CREATE TABLE IF NOT EXISTS strategic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'opportunity', 'threat', 'recommendation', 'observation', 'warning'
  source_agent TEXT, -- Which agent generated this insight
  priority TEXT, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT,
  supporting_data JSONB,
  status TEXT DEFAULT 'active', -- 'active', 'implemented', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_insight_type CHECK (insight_type IN ('opportunity', 'threat', 'recommendation', 'observation', 'warning')),
  CONSTRAINT valid_priority CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'implemented', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS idx_strategic_insights_demo 
ON strategic_insights(demo_id);

CREATE INDEX IF NOT EXISTS idx_strategic_insights_type 
ON strategic_insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_strategic_insights_priority 
ON strategic_insights(priority);

CREATE INDEX IF NOT EXISTS idx_strategic_insights_status 
ON strategic_insights(status);

-- Business metrics table (KPIs from agents)
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id) ON DELETE CASCADE,
  metric_category TEXT NOT NULL, -- 'financial', 'operational', 'market', 'customer'
  metric_name TEXT NOT NULL,
  current_value NUMERIC,
  target_value NUMERIC,
  unit TEXT, -- '$', '%', 'count', etc.
  time_period TEXT, -- 'monthly', 'quarterly', 'annual'
  source_agent TEXT, -- Agent that generated this metric
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_metric_category CHECK (metric_category IN ('financial', 'operational', 'market', 'customer'))
);

CREATE INDEX IF NOT EXISTS idx_business_metrics_demo 
ON business_metrics(demo_id);

CREATE INDEX IF NOT EXISTS idx_business_metrics_category 
ON business_metrics(metric_category);

-- SQL function to search SWOT analyses
CREATE OR REPLACE FUNCTION search_swot_analyses(
  p_strategic_position TEXT DEFAULT NULL,
  p_min_confidence NUMERIC DEFAULT 0.7,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  demo_id TEXT,
  business_name TEXT,
  strategic_position TEXT,
  confidence_score NUMERIC,
  strengths_count INTEGER,
  weaknesses_count INTEGER,
  opportunities_count INTEGER,
  threats_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.client_id,
    (d.swot_analysis->'analysis'->>'strategic_position')::TEXT,
    (d.swot_analysis->>'confidence_score')::NUMERIC,
    jsonb_array_length(d.swot_analysis->'analysis'->'strengths'),
    jsonb_array_length(d.swot_analysis->'analysis'->'weaknesses'),
    jsonb_array_length(d.swot_analysis->'analysis'->'opportunities'),
    jsonb_array_length(d.swot_analysis->'analysis'->'threats'),
    d.created_at
  FROM demos d
  WHERE d.swot_analysis IS NOT NULL
    AND (p_strategic_position IS NULL OR 
         d.swot_analysis->'analysis'->>'strategic_position' = p_strategic_position)
    AND (d.swot_analysis->>'confidence_score')::NUMERIC >= p_min_confidence
  ORDER BY d.created_at DESC
  LIMIT p_limit;
END;
$$;

-- View for HBS intelligence summary
CREATE OR REPLACE VIEW hbs_intelligence_summary AS
SELECT 
  d.id AS demo_id,
  d.client_id AS business_name,
  d.industry,
  d.url,
  d.swot_analysis IS NOT NULL AS has_swot,
  d.business_model_canvas IS NOT NULL AS has_bmc,
  d.gtm_strategy IS NOT NULL AS has_gtm,
  d.porter_analysis IS NOT NULL AS has_porter,
  d.economic_intelligence IS NOT NULL AS has_economic,
  (d.swot_analysis->>'confidence_score')::NUMERIC AS swot_confidence,
  (d.business_model_canvas->>'confidence_score')::NUMERIC AS bmc_confidence,
  (d.gtm_strategy->>'confidence_score')::NUMERIC AS gtm_confidence,
  d.created_at,
  d.updated_at
FROM demos d;

COMMENT ON TABLE agent_executions IS 'Tracks execution of all HBS agents with performance metrics';
COMMENT ON TABLE strategic_insights IS 'Cross-agent insights aggregated for unified strategic view';
COMMENT ON TABLE business_metrics IS 'Business KPIs extracted from agent analyses';
COMMENT ON VIEW hbs_intelligence_summary IS 'Overview of HBS intelligence coverage per demo';

COMMENT ON COLUMN demos.swot_analysis IS 'SWOT + TOWS + PESTEL analysis from SWOTAgent';
COMMENT ON COLUMN demos.business_model_canvas IS 'Business Model Canvas from OsterwalderAgent';
COMMENT ON COLUMN demos.gtm_strategy IS 'Go-To-Market strategy from GTMPlannerAgent';
COMMENT ON COLUMN demos.hbs_intelligence IS 'Synthesized insights from all HBS agents (orchestrator output)';
