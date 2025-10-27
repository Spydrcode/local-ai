-- COMPREHENSIVE MIGRATION: Porter + Economic Intelligence + HBS Intelligence Layer
-- Combines all strategic analysis features into one migration
-- Run this in Supabase SQL Editor

-- ================================================================
-- PART 1: PORTER ANALYSIS COLUMN
-- ================================================================

-- Add porter_analysis JSONB column to demos table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'porter_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN porter_analysis JSONB;
    COMMENT ON COLUMN demos.porter_analysis IS 'Porter Intelligence Stack results - 9 agents + synthesis';
    RAISE NOTICE '✅ Added porter_analysis column';
  ELSE
    RAISE NOTICE '⚠️  porter_analysis column already exists';
  END IF;
END $$;

-- Create GIN index on porter_analysis for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_demos_porter_analysis_gin 
ON demos USING GIN (porter_analysis);

-- ================================================================
-- PART 2: ECONOMIC INTELLIGENCE COLUMN
-- ================================================================

-- Add economic_intelligence JSONB column to demos table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'economic_intelligence'
  ) THEN
    ALTER TABLE demos ADD COLUMN economic_intelligence JSONB;
    COMMENT ON COLUMN demos.economic_intelligence IS 'Economic Intelligence analysis including macro trends, regulatory impacts, profit predictions, and scenario planning';
    RAISE NOTICE '✅ Added economic_intelligence column';
  ELSE
    RAISE NOTICE '⚠️  economic_intelligence column already exists';
  END IF;
END $$;

-- Create GIN index on economic_intelligence for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_demos_economic_intelligence 
ON demos USING gin (economic_intelligence);

-- ================================================================
-- PART 3: HARVARD BUSINESS INTELLIGENCE LAYER
-- ================================================================

-- Add SWOT Analysis column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'swot_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN swot_analysis JSONB;
    COMMENT ON COLUMN demos.swot_analysis IS 'SWOT + TOWS + PESTEL analysis from SWOTAgent';
    RAISE NOTICE '✅ Added swot_analysis column';
  ELSE
    RAISE NOTICE '⚠️  swot_analysis column already exists';
  END IF;
END $$;

-- Add Business Model Canvas column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'business_model_canvas'
  ) THEN
    ALTER TABLE demos ADD COLUMN business_model_canvas JSONB;
    COMMENT ON COLUMN demos.business_model_canvas IS 'Business Model Canvas from OsterwalderAgent';
    RAISE NOTICE '✅ Added business_model_canvas column';
  ELSE
    RAISE NOTICE '⚠️  business_model_canvas column already exists';
  END IF;
END $$;

-- Add Go-To-Market Strategy column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'gtm_strategy'
  ) THEN
    ALTER TABLE demos ADD COLUMN gtm_strategy JSONB;
    COMMENT ON COLUMN demos.gtm_strategy IS 'Go-To-Market strategy from GTMPlannerAgent';
    RAISE NOTICE '✅ Added gtm_strategy column';
  ELSE
    RAISE NOTICE '⚠️  gtm_strategy column already exists';
  END IF;
END $$;

-- Add unified HBS intelligence column (for multi-agent synthesis)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'hbs_intelligence'
  ) THEN
    ALTER TABLE demos ADD COLUMN hbs_intelligence JSONB;
    COMMENT ON COLUMN demos.hbs_intelligence IS 'Synthesized insights from all HBS agents (orchestrator output)';
    RAISE NOTICE '✅ Added hbs_intelligence column';
  ELSE
    RAISE NOTICE '⚠️  hbs_intelligence column already exists';
  END IF;
END $$;

-- Create GIN indexes for JSONB columns (faster queries)
CREATE INDEX IF NOT EXISTS idx_demos_swot_analysis 
ON demos USING GIN (swot_analysis);

CREATE INDEX IF NOT EXISTS idx_demos_business_model_canvas 
ON demos USING GIN (business_model_canvas);

CREATE INDEX IF NOT EXISTS idx_demos_gtm_strategy 
ON demos USING GIN (gtm_strategy);

CREATE INDEX IF NOT EXISTS idx_demos_hbs_intelligence 
ON demos USING GIN (hbs_intelligence);

-- ================================================================
-- PART 4: AGENT EXECUTION TRACKING
-- ================================================================

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
  
  CONSTRAINT valid_metric_category CHECK (metric_category IN ('financial', 'operational', 'market', 'customer'))
);

CREATE INDEX IF NOT EXISTS idx_business_metrics_demo 
ON business_metrics(demo_id);

CREATE INDEX IF NOT EXISTS idx_business_metrics_category 
ON business_metrics(metric_category);

-- ================================================================
-- PART 5: SQL FUNCTIONS & VIEWS
-- ================================================================

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
  d.swot_analysis IS NOT NULL AS has_swot,
  d.business_model_canvas IS NOT NULL AS has_bmc,
  d.gtm_strategy IS NOT NULL AS has_gtm,
  d.porter_analysis IS NOT NULL AS has_porter,
  d.economic_intelligence IS NOT NULL AS has_economic,
  (d.swot_analysis->>'confidence_score')::NUMERIC AS swot_confidence,
  (d.business_model_canvas->>'confidence_score')::NUMERIC AS bmc_confidence,
  (d.gtm_strategy->>'confidence_score')::NUMERIC AS gtm_confidence,
  d.created_at
FROM demos d;

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Show all strategic analysis columns
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'porter_analysis' THEN '✅ Porter Intelligence Stack'
    WHEN column_name = 'economic_intelligence' THEN '✅ Economic Intelligence'
    WHEN column_name = 'swot_analysis' THEN '✅ SWOT + TOWS + PESTEL'
    WHEN column_name = 'business_model_canvas' THEN '✅ Business Model Canvas'
    WHEN column_name = 'gtm_strategy' THEN '✅ Go-To-Market Strategy'
    WHEN column_name = 'hbs_intelligence' THEN '✅ HBS Multi-Agent Synthesis'
    ELSE ''
  END as purpose
FROM information_schema.columns 
WHERE table_name = 'demos' 
  AND column_name IN (
    'porter_analysis', 
    'economic_intelligence', 
    'swot_analysis', 
    'business_model_canvas', 
    'gtm_strategy',
    'hbs_intelligence'
  )
ORDER BY column_name;

-- Show all indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'demos' 
  AND (
    indexname LIKE '%porter%' OR 
    indexname LIKE '%economic%' OR
    indexname LIKE '%swot%' OR
    indexname LIKE '%business_model%' OR
    indexname LIKE '%gtm%' OR
    indexname LIKE '%hbs%'
  )
ORDER BY indexname;

-- Show new tables
SELECT 
  table_name,
  CASE
    WHEN table_name = 'agent_executions' THEN '✅ Agent Performance Tracking'
    WHEN table_name = 'strategic_insights' THEN '✅ Cross-Agent Insights'
    WHEN table_name = 'business_metrics' THEN '✅ Business KPIs'
  END as purpose
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('agent_executions', 'strategic_insights', 'business_metrics')
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ COMPREHENSIVE MIGRATION COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Strategic Analysis Columns Added:';
  RAISE NOTICE '  • porter_analysis - Porter Intelligence Stack';
  RAISE NOTICE '  • economic_intelligence - Economic Analysis';
  RAISE NOTICE '  • swot_analysis - SWOT + TOWS + PESTEL';
  RAISE NOTICE '  • business_model_canvas - Business Model Canvas';
  RAISE NOTICE '  • gtm_strategy - Go-To-Market Planning';
  RAISE NOTICE '  • hbs_intelligence - Multi-Agent Synthesis';
  RAISE NOTICE '';
  RAISE NOTICE 'New Tables Created:';
  RAISE NOTICE '  • agent_executions - Performance tracking';
  RAISE NOTICE '  • strategic_insights - Cross-agent insights';
  RAISE NOTICE '  • business_metrics - Business KPIs';
  RAISE NOTICE '';
  RAISE NOTICE 'GIN Indexes Created: 6';
  RAISE NOTICE 'Regular Indexes Created: 9';
  RAISE NOTICE 'SQL Functions: 1 (search_swot_analyses)';
  RAISE NOTICE 'Views: 1 (hbs_intelligence_summary)';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now run:';
  RAISE NOTICE '  ✓ Porter Intelligence Stack';
  RAISE NOTICE '  ✓ Economic Intelligence';
  RAISE NOTICE '  ✓ SWOT Analysis (SWOTAgent)';
  RAISE NOTICE '  ✓ Future: BMC, GTM, and 10+ more agents';
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
END $$;
