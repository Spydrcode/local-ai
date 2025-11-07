-- Optimize Supabase schema for Porter Intelligence Stack
-- Adds porter_analysis column, indexes, and optimizes site_chunks for agent vectors

-- 1. Add porter_analysis JSONB column to demos table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'demos' AND column_name = 'porter_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN porter_analysis JSONB;
    COMMENT ON COLUMN demos.porter_analysis IS 'Porter Intelligence Stack results - 9 agents + synthesis';
  END IF;
END $$;

-- 2. Create GIN index on porter_analysis for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_demos_porter_analysis_gin 
ON demos USING GIN (porter_analysis);

-- 3. Create index on demos.id for faster joins
CREATE INDEX IF NOT EXISTS idx_demos_id 
ON demos (id);

-- 4. Create site_chunks table if not exists (for vector storage)
CREATE TABLE IF NOT EXISTS site_chunks (
  id TEXT PRIMARY KEY,
  demo_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Add foreign key constraint from site_chunks to demos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_site_chunks_demo'
  ) THEN
    ALTER TABLE site_chunks 
    ADD CONSTRAINT fk_site_chunks_demo 
    FOREIGN KEY (demo_id) REFERENCES demos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Create index on demo_id for fast filtering
CREATE INDEX IF NOT EXISTS idx_site_chunks_demo_id 
ON site_chunks (demo_id);

-- 7. Create GIN index on metadata for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_site_chunks_metadata_gin 
ON site_chunks USING GIN (metadata);

-- 8. Create HNSW index for vector similarity search (pgvector)
-- This dramatically speeds up similarity searches
CREATE INDEX IF NOT EXISTS idx_site_chunks_embedding_hnsw 
ON site_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 9. Create specialized indexes for Porter agent metadata queries
-- Index for analysisType filtering (strategic, competitor, roi, etc.)
CREATE INDEX IF NOT EXISTS idx_site_chunks_analysis_type 
ON site_chunks ((metadata->>'analysisType'));

-- Index for category filtering (competitive, financial, strategic, etc.)
CREATE INDEX IF NOT EXISTS idx_site_chunks_category 
ON site_chunks ((metadata->>'category'));

-- Index for agent name filtering
CREATE INDEX IF NOT EXISTS idx_site_chunks_agent_name 
ON site_chunks ((metadata->>'agentName'));

-- Index for timestamp filtering (recent results)
CREATE INDEX IF NOT EXISTS idx_site_chunks_timestamp 
ON site_chunks ((metadata->>'timestamp'));

-- Index for confidence scores (filter high-quality results)
CREATE INDEX IF NOT EXISTS idx_site_chunks_confidence 
ON site_chunks (((metadata->>'confidence')::numeric));

-- 10. Add updated_at trigger for site_chunks
CREATE OR REPLACE FUNCTION update_site_chunks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_site_chunks_updated_at
BEFORE UPDATE ON site_chunks
FOR EACH ROW
EXECUTE FUNCTION update_site_chunks_updated_at();

-- 11. Create composite index for common query pattern (demo_id + analysis_type + confidence)
CREATE INDEX IF NOT EXISTS idx_site_chunks_demo_analysis_confidence 
ON site_chunks (
  demo_id, 
  (metadata->>'analysisType'), 
  ((metadata->>'confidence')::numeric) DESC
);

-- 12. Add comments for documentation
COMMENT ON TABLE site_chunks IS 'Vector storage for Porter Intelligence agents and other analysis chunks';
COMMENT ON COLUMN site_chunks.id IS 'Unique chunk ID (format: {demoId}-agent-{agentName} or custom)';
COMMENT ON COLUMN site_chunks.demo_id IS 'Foreign key to demos.id';
COMMENT ON COLUMN site_chunks.content IS 'Text content of the chunk (agent results as JSON string)';
COMMENT ON COLUMN site_chunks.metadata IS 'Enhanced metadata with analysisType, category, agentName, confidence, tags, etc.';
COMMENT ON COLUMN site_chunks.embedding IS 'OpenAI ada-002 embedding vector (1536 dimensions)';

-- 13. Create function to search vectors by metadata filters
CREATE OR REPLACE FUNCTION search_porter_vectors(
  p_demo_id TEXT,
  p_query_embedding vector(1536),
  p_analysis_type TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_agent_name TEXT DEFAULT NULL,
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
    AND (p_analysis_type IS NULL OR sc.metadata->>'analysisType' = p_analysis_type)
    AND (p_category IS NULL OR sc.metadata->>'category' = p_category)
    AND (p_agent_name IS NULL OR sc.metadata->>'agentName' = p_agent_name)
    AND ((sc.metadata->>'confidence')::numeric >= p_min_confidence)
  ORDER BY sc.embedding <=> p_query_embedding
  LIMIT p_top_k;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_porter_vectors IS 'Fast vector similarity search with metadata filtering for Porter agents';

-- 14. Create view for porter analysis summaries (safe column references)
CREATE OR REPLACE VIEW porter_analysis_summary AS
SELECT 
  d.id AS demo_id,
  d.summary AS business_summary,
  jsonb_array_length(COALESCE(d.porter_analysis->'agents', '[]'::jsonb)) AS agent_count,
  d.porter_analysis->'synthesis'->>'competitivePosition' AS competitive_position,
  d.porter_analysis->'synthesis'->'estimatedImpact'->>'revenue' AS estimated_revenue_impact,
  (d.porter_analysis->>'timestamp')::timestamptz AS last_analysis,
  COUNT(sc.id) AS vector_count
FROM demos d
LEFT JOIN site_chunks sc ON sc.demo_id = d.id AND sc.metadata->>'analysisType' = 'strategic'
WHERE d.porter_analysis IS NOT NULL
GROUP BY d.id, d.summary, d.porter_analysis;

COMMENT ON VIEW porter_analysis_summary IS 'Summary view of Porter Intelligence Stack results';

-- 15. Create maintenance function to clean up old vectors
CREATE OR REPLACE FUNCTION cleanup_old_vectors(days_old INT DEFAULT 90)
RETURNS TABLE (deleted_count BIGINT) AS $$
DECLARE
  v_deleted_count BIGINT;
BEGIN
  DELETE FROM site_chunks
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
    AND demo_id NOT IN (
      SELECT id FROM demos WHERE created_at > NOW() - (days_old || ' days')::INTERVAL
    );
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_vectors IS 'Delete vectors older than specified days (default 90)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Porter Intelligence Stack optimization complete!';
  RAISE NOTICE '   - porter_analysis column added to demos';
  RAISE NOTICE '   - site_chunks table optimized with HNSW index';
  RAISE NOTICE '   - Metadata indexes for fast agent filtering';
  RAISE NOTICE '   - search_porter_vectors() function for filtered searches';
  RAISE NOTICE '   - porter_analysis_summary view for reporting';
END $$;
