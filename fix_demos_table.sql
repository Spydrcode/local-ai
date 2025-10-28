-- Fix demos table structure for quick-analyze endpoint
-- Run this in Supabase SQL Editor

-- First, check if table exists and create if needed
CREATE TABLE IF NOT EXISTS demos (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  site_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE demos ADD COLUMN IF NOT EXISTS customer_magnet_posts JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS porter_analysis JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS economic_intelligence JSONB;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_demos_created_at ON demos(created_at);
CREATE INDEX IF NOT EXISTS idx_demos_business_name ON demos(business_name);