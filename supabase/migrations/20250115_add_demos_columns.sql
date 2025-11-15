-- Add missing columns to demos table for agency portal
-- Run this in Supabase SQL Editor

-- Add industry column if it doesn't exist
ALTER TABLE demos ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add intelligence_data column for storing full WebScraperAgent output
ALTER TABLE demos ADD COLUMN IF NOT EXISTS intelligence_data JSONB;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_demos_industry ON demos(industry);
CREATE INDEX IF NOT EXISTS idx_demos_website_url ON demos(website_url);

COMMENT ON COLUMN demos.industry IS 'Business industry/category extracted from website analysis';
COMMENT ON COLUMN demos.intelligence_data IS 'Full intelligence data from WebScraperAgent including business, SEO, competitors, etc.';
