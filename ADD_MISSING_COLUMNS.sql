-- Add missing columns to demos table for new AI agents
-- Run this in your Supabase SQL editor

-- Add updated_at column if it doesn't exist
ALTER TABLE demos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add columns for new AI agent analyses
ALTER TABLE demos ADD COLUMN IF NOT EXISTS local_market_analysis JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS customer_sentiment JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS competitive_moat JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS value_chain_analysis JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS swot_live_dashboard JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS pricing_power JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS local_expansion JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS quick_wins JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS customer_magnet_posts JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_demos_updated_at ON demos(updated_at);
CREATE INDEX IF NOT EXISTS idx_demos_local_market ON demos USING GIN (local_market_analysis);
CREATE INDEX IF NOT EXISTS idx_demos_customer_sentiment ON demos USING GIN (customer_sentiment);
CREATE INDEX IF NOT EXISTS idx_demos_competitive_moat ON demos USING GIN (competitive_moat);
CREATE INDEX IF NOT EXISTS idx_demos_quick_wins ON demos USING GIN (quick_wins);

-- Update existing records to have updated_at timestamp
UPDATE demos SET updated_at = NOW() WHERE updated_at IS NULL;

-- Add trigger to automatically update updated_at on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_demos_updated_at ON demos;
CREATE TRIGGER update_demos_updated_at
    BEFORE UPDATE ON demos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'demos' 
ORDER BY ordinal_position;