-- Add economic_intelligence column to demos table
-- This stores the Economic Intelligence & Profit Prediction analysis

-- Add JSONB column for economic intelligence data
ALTER TABLE demos ADD COLUMN IF NOT EXISTS economic_intelligence JSONB;

-- Add index for querying economic intelligence
CREATE INDEX IF NOT EXISTS idx_demos_economic_intelligence 
ON demos USING gin (economic_intelligence);

-- Add comment for documentation
COMMENT ON COLUMN demos.economic_intelligence IS 'Economic Intelligence analysis including macro trends, regulatory impacts, profit predictions, and scenario planning';
