-- Add Economic Intelligence vector support to site_chunks
-- Optimizes metadata indexing for economic analysis queries

-- 1. Add specialized indexes for Economic Intelligence metadata queries

-- Index for economic analysis type filtering (context, impact, prediction, scenario, sensitivity)
CREATE INDEX IF NOT EXISTS idx_site_chunks_economic_analysis_type 
ON site_chunks ((metadata->>'economicAnalysisType'));

-- Index for industry filtering (Propane Services, Restaurants, HVAC, etc.)
CREATE INDEX IF NOT EXISTS idx_site_chunks_industry 
ON site_chunks ((metadata->>'industry'));

-- Index for scenario type filtering (worst, likely, best)
CREATE INDEX IF NOT EXISTS idx_site_chunks_scenario_type 
ON site_chunks ((metadata->>'scenarioType'));

-- Index for threat level filtering (critical, major, moderate, minor)
CREATE INDEX IF NOT EXISTS idx_site_chunks_threat_level 
ON site_chunks ((metadata->>'threatLevel'));

-- Index for timeframe filtering (immediate, 3-6 months, 6-12 months, 12+ months)
CREATE INDEX IF NOT EXISTS idx_site_chunks_timeframe 
ON site_chunks ((metadata->>'timeframe'));

-- 2. Create composite index for common economic intelligence queries
CREATE INDEX IF NOT EXISTS idx_site_chunks_economic_composite 
ON site_chunks (
  demo_id, 
  (metadata->>'analysisType'), 
  (metadata->>'economicAnalysisType'),
  (metadata->>'industry')
) WHERE metadata->>'analysisType' = 'economic_intelligence';

-- 3. Create function to search economic intelligence vectors
CREATE OR REPLACE FUNCTION search_economic_vectors(
  p_demo_id TEXT,
  p_query_embedding vector(1536),
  p_economic_analysis_type TEXT DEFAULT NULL,
  p_scenario_type TEXT DEFAULT NULL,
  p_industry TEXT DEFAULT NULL,
  p_min_confidence NUMERIC DEFAULT 0.0,
  p_top_k INT DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  content TEXT,
  metadata JSONB,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.content,
    sc.metadata,
    ROUND((1 - (sc.embedding <=> p_query_embedding))::numeric, 4) AS similarity
  FROM site_chunks sc
  WHERE sc.demo_id = p_demo_id
    AND sc.metadata->>'analysisType' = 'economic_intelligence'
    AND (p_economic_analysis_type IS NULL OR sc.metadata->>'economicAnalysisType' = p_economic_analysis_type)
    AND (p_scenario_type IS NULL OR sc.metadata->>'scenarioType' = p_scenario_type)
    AND (p_industry IS NULL OR sc.metadata->>'industry' = p_industry)
    AND ((sc.metadata->>'confidence')::numeric >= p_min_confidence)
  ORDER BY sc.embedding <=> p_query_embedding
  LIMIT p_top_k;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_economic_vectors IS 'Fast vector similarity search for Economic Intelligence analysis with metadata filtering';

-- 4. Create function to get all economic intelligence for a demo
CREATE OR REPLACE FUNCTION get_economic_intelligence(p_demo_id TEXT)
RETURNS TABLE (
  analysis_type TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.metadata->>'economicAnalysisType' AS analysis_type,
    sc.content,
    sc.metadata,
    sc.created_at
  FROM site_chunks sc
  WHERE sc.demo_id = p_demo_id
    AND sc.metadata->>'analysisType' = 'economic_intelligence'
  ORDER BY 
    CASE sc.metadata->>'economicAnalysisType'
      WHEN 'context' THEN 1
      WHEN 'impact' THEN 2
      WHEN 'prediction' THEN 3
      WHEN 'scenario' THEN 4
      WHEN 'sensitivity' THEN 5
      ELSE 6
    END,
    sc.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_economic_intelligence IS 'Retrieve all Economic Intelligence analysis components for a demo in logical order';

-- 5. Create function to search regulatory threats
CREATE OR REPLACE FUNCTION search_regulatory_threats(
  p_demo_id TEXT,
  p_query_embedding vector(1536),
  p_threat_level TEXT DEFAULT NULL,
  p_top_k INT DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  content TEXT,
  threat_level TEXT,
  industry TEXT,
  timeframe TEXT,
  similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.content,
    sc.metadata->>'threatLevel' AS threat_level,
    sc.metadata->>'industry' AS industry,
    sc.metadata->>'timeframe' AS timeframe,
    ROUND((1 - (sc.embedding <=> p_query_embedding))::numeric, 4) AS similarity
  FROM site_chunks sc
  WHERE sc.demo_id = p_demo_id
    AND sc.metadata->>'analysisType' = 'economic_intelligence'
    AND sc.metadata ? 'threatLevel'
    AND (p_threat_level IS NULL OR sc.metadata->>'threatLevel' = p_threat_level)
  ORDER BY 
    CASE sc.metadata->>'threatLevel'
      WHEN 'critical' THEN 1
      WHEN 'major' THEN 2
      WHEN 'moderate' THEN 3
      WHEN 'minor' THEN 4
      ELSE 5
    END,
    sc.embedding <=> p_query_embedding
  LIMIT p_top_k;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_regulatory_threats IS 'Search for regulatory threats with automatic threat-level prioritization';

-- 6. Create view for economic intelligence summaries
CREATE OR REPLACE VIEW economic_intelligence_summary AS
SELECT 
  d.id AS demo_id,
  d.url,
  d.summary AS business_summary,
  d.economic_intelligence->'industryImpact'->>'industry' AS detected_industry,
  d.economic_intelligence->'economicContext'->'inflation'->>'rate' AS inflation_rate,
  d.economic_intelligence->'economicContext'->'unemployment'->>'rate' AS unemployment_rate,
  jsonb_array_length(COALESCE(d.economic_intelligence->'economicContext'->'regulatoryChanges', '[]'::jsonb)) AS regulatory_threat_count,
  d.economic_intelligence->'profitPrediction'->'adjustedForecasts'->'year1'->>'revenue' AS year1_revenue_forecast,
  d.economic_intelligence->'profitPrediction'->'adjustedForecasts'->'year1'->>'margin' AS year1_margin_forecast,
  (d.economic_intelligence->>'generatedAt')::timestamptz AS last_analysis,
  COUNT(sc.id) AS vector_count
FROM demos d
LEFT JOIN site_chunks sc ON sc.demo_id = d.id AND sc.metadata->>'analysisType' = 'economic_intelligence'
WHERE d.economic_intelligence IS NOT NULL
GROUP BY d.id, d.url, d.summary, d.economic_intelligence;

COMMENT ON VIEW economic_intelligence_summary IS 'Summary view of Economic Intelligence analysis results';

-- 7. Create view for scenario planning overview
CREATE OR REPLACE VIEW economic_scenarios_overview AS
SELECT 
  d.id AS demo_id,
  d.url,
  d.economic_intelligence->'industryImpact'->>'industry' AS industry,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'worstCase'->>'probability' AS worst_case_probability,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'worstCase'->>'revenueImpact' AS worst_case_revenue_impact,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'likelyCase'->>'probability' AS likely_case_probability,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'likelyCase'->>'revenueImpact' AS likely_case_revenue_impact,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'bestCase'->>'probability' AS best_case_probability,
  d.economic_intelligence->'industryImpact'->'scenarioPlanning'->'bestCase'->>'revenueImpact' AS best_case_revenue_impact,
  jsonb_array_length(COALESCE(d.economic_intelligence->'industryImpact'->'immediateActions', '[]'::jsonb)) AS immediate_action_count,
  (d.economic_intelligence->>'generatedAt')::timestamptz AS generated_at
FROM demos d
WHERE d.economic_intelligence IS NOT NULL
  AND d.economic_intelligence->'industryImpact'->'scenarioPlanning' IS NOT NULL;

COMMENT ON VIEW economic_scenarios_overview IS 'Overview of scenario planning with probabilities and impacts';

-- 8. Create function to compare economic intelligence across demos
CREATE OR REPLACE FUNCTION compare_economic_intelligence(
  p_demo_ids TEXT[]
)
RETURNS TABLE (
  demo_id TEXT,
  url TEXT,
  industry TEXT,
  inflation_impact TEXT,
  snap_threat_level TEXT,
  year1_revenue_forecast TEXT,
  overall_risk_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS demo_id,
    d.url,
    d.economic_intelligence->'industryImpact'->>'industry' AS industry,
    d.economic_intelligence->'economicContext'->'inflation'->>'impact' AS inflation_impact,
    (
      SELECT jsonb_array_elements(d.economic_intelligence->'economicContext'->'regulatoryChanges')->>'severity'
      FROM jsonb_array_elements(d.economic_intelligence->'economicContext'->'regulatoryChanges')
      WHERE jsonb_array_elements->>'policy' ILIKE '%SNAP%'
      LIMIT 1
    ) AS snap_threat_level,
    d.economic_intelligence->'profitPrediction'->'adjustedForecasts'->'year1'->>'revenue' AS year1_revenue_forecast,
    -- Calculate overall risk level based on threats
    CASE 
      WHEN jsonb_array_length(
        jsonb_path_query_array(
          d.economic_intelligence,
          '$.industryImpact.threats[*] ? (@.severity == "critical" || @.severity == "major")'
        )
      ) > 2 THEN 'HIGH'
      WHEN jsonb_array_length(
        jsonb_path_query_array(
          d.economic_intelligence,
          '$.industryImpact.threats[*] ? (@.severity == "critical" || @.severity == "major")'
        )
      ) > 0 THEN 'MODERATE'
      ELSE 'LOW'
    END AS overall_risk_level
  FROM demos d
  WHERE d.id = ANY(p_demo_ids)
    AND d.economic_intelligence IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION compare_economic_intelligence IS 'Compare economic intelligence analysis across multiple demos';

-- 9. Create index for tags filtering (used in vector searches)
CREATE INDEX IF NOT EXISTS idx_site_chunks_tags 
ON site_chunks USING GIN ((metadata->'tags'));

-- 10. Add helpful comments on metadata structure
COMMENT ON COLUMN site_chunks.metadata IS E'Enhanced metadata structure:\n'
  '- Core: demoId, analysisType, timestamp, content, confidence\n'
  '- Porter: agentName, agentVersion, executionTime, category\n'
  '- Economic: economicAnalysisType, industry, scenarioType, threatLevel, timeframe\n'
  '- Social: platform, postType, contentFocus, brandVoice\n'
  '- Search: tags, keywords, chunkType, heading, section';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Economic Intelligence vector optimization complete!';
  RAISE NOTICE '   - Metadata indexes for economic analysis types';
  RAISE NOTICE '   - search_economic_vectors() function for filtered searches';
  RAISE NOTICE '   - search_regulatory_threats() for threat prioritization';
  RAISE NOTICE '   - get_economic_intelligence() for complete analysis retrieval';
  RAISE NOTICE '   - economic_intelligence_summary view for reporting';
  RAISE NOTICE '   - economic_scenarios_overview view for scenario planning';
  RAISE NOTICE '   - compare_economic_intelligence() for cross-demo analysis';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Vector ID Format:';
  RAISE NOTICE '   - {demoId}-economic-context';
  RAISE NOTICE '   - {demoId}-economic-impact';
  RAISE NOTICE '   - {demoId}-economic-prediction-year{1-3}';
  RAISE NOTICE '   - {demoId}-economic-scenario-{worst|likely|best}';
  RAISE NOTICE '   - {demoId}-economic-sensitivity';
END $$;
