-- COMBINED MIGRATION: Porter Analysis + Economic Intelligence
-- Apply both required columns for strategic analysis features
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
-- VERIFICATION
-- ================================================================

-- Show all JSONB columns in demos table
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'porter_analysis' THEN '✅ Porter Intelligence Stack'
    WHEN column_name = 'economic_intelligence' THEN '✅ Economic Intelligence & Predictions'
    ELSE ''
  END as purpose
FROM information_schema.columns 
WHERE table_name = 'demos' 
  AND data_type = 'jsonb'
ORDER BY column_name;

-- Show indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'demos' 
  AND (indexname LIKE '%porter%' OR indexname LIKE '%economic%')
ORDER BY indexname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ MIGRATION COMPLETE!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Added columns:';
  RAISE NOTICE '  • porter_analysis (JSONB) - Porter Intelligence Stack';
  RAISE NOTICE '  • economic_intelligence (JSONB) - Economic Analysis';
  RAISE NOTICE '';
  RAISE NOTICE 'Added indexes:';
  RAISE NOTICE '  • idx_demos_porter_analysis_gin (GIN)';
  RAISE NOTICE '  • idx_demos_economic_intelligence (GIN)';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now:';
  RAISE NOTICE '  ✓ Run Porter Intelligence Stack analysis';
  RAISE NOTICE '  ✓ Generate Economic Intelligence reports';
  RAISE NOTICE '  ✓ Save and retrieve strategic analysis data';
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
END $$;
