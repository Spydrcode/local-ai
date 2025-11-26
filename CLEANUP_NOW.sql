-- ============================================
-- IMMEDIATE CLEANUP - Run this in Supabase SQL Editor
-- ============================================

-- Step 1: See what you currently have
SELECT 
    id,
    business_name,
    website_url,
    COALESCE(contractor_mode, false) as contractor_mode,
    created_at
FROM demos
ORDER BY created_at DESC;

-- Step 2: See what will be DELETED (preview)
SELECT 
    id,
    business_name,
    website_url,
    created_at,
    'WILL BE DELETED' as status
FROM demos
WHERE 
    business_name IN ('Unnamed Business', 'Contractor Business')
    OR website_url = 'contractor-setup'
    OR contractor_mode = true;

-- Step 3: DELETE ALL UNWANTED ENTRIES
-- Copy and run this command:

DELETE FROM demos
WHERE 
    business_name IN ('Unnamed Business', 'Contractor Business')
    OR website_url = 'contractor-setup'
    OR contractor_mode = true;

-- Step 4: Verify what's left (should only be real clients)
SELECT 
    id,
    business_name,
    website_url,
    created_at,
    'REMAINING' as status
FROM demos
ORDER BY created_at DESC;

-- ============================================
-- If you want to keep ONE specific client, do this BEFORE Step 3:
-- ============================================

-- First, find the client you want to keep:
SELECT id, business_name, website_url FROM demos 
WHERE website_url LIKE '%diamondback%';

-- Then update its business_name so it won't be deleted:
-- UPDATE demos 
-- SET business_name = 'Diamond Back Propane'
-- WHERE id = 'your-client-id-here';

-- ============================================
-- AFTER CLEANUP: Add the column to fix schema error
-- ============================================

-- Ensure business_name column is properly configured
ALTER TABLE demos ALTER COLUMN business_name SET NOT NULL;
ALTER TABLE demos ALTER COLUMN business_name SET DEFAULT 'Unnamed Business';

-- Add tracking columns if they don't exist
ALTER TABLE demos ADD COLUMN IF NOT EXISTS created_by_email TEXT;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS contractor_mode BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_demos_business_name ON demos(business_name);
CREATE INDEX IF NOT EXISTS idx_demos_created_by ON demos(created_by_email);
