-- Fix demos table schema to ensure business_name column exists
-- Run this in Supabase SQL Editor to fix schema cache issues

-- Ensure business_name column exists (it should, but let's be explicit)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'demos' AND column_name = 'business_name'
    ) THEN
        ALTER TABLE demos ADD COLUMN business_name TEXT;
    END IF;
END $$;

-- Make business_name NOT NULL with a default
ALTER TABLE demos ALTER COLUMN business_name SET DEFAULT 'Unnamed Business';

-- Update any NULL values
UPDATE demos SET business_name = 'Unnamed Business' WHERE business_name IS NULL;

-- Now enforce NOT NULL
ALTER TABLE demos ALTER COLUMN business_name SET NOT NULL;

-- Add created_by_email column for tracking who added the client
ALTER TABLE demos ADD COLUMN IF NOT EXISTS created_by_email TEXT;

-- Add contractor_mode flag
ALTER TABLE demos ADD COLUMN IF NOT EXISTS contractor_mode BOOLEAN DEFAULT FALSE;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_demos_business_name ON demos(business_name);
CREATE INDEX IF NOT EXISTS idx_demos_created_by ON demos(created_by_email);
CREATE INDEX IF NOT EXISTS idx_demos_contractor_mode ON demos(contractor_mode);

COMMENT ON COLUMN demos.business_name IS 'Business name extracted from website or user-provided';
COMMENT ON COLUMN demos.created_by_email IS 'Email of agency user who added this client';
COMMENT ON COLUMN demos.contractor_mode IS 'Whether this is a contractor business profile (not a client)';
