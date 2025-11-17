-- ======================================================
-- CLEANUP ALL UNNAMED BUSINESS CLIENTS
-- Run this in Supabase SQL Editor to remove test data
-- ======================================================

-- Step 1: Check how many will be deleted
SELECT COUNT(*) as unnamed_count
FROM demos
WHERE business_name = 'Unnamed Business';

-- Step 2: Delete all "Unnamed Business" entries
DELETE FROM demos WHERE business_name = 'Unnamed Business';

-- Step 3: Verify cleanup
SELECT COUNT(*) as remaining_clients FROM demos;

-- Step 4: View remaining clients (should be 0 or only real ones)
SELECT
  id,
  business_name,
  website_url,
  industry,
  created_at
FROM demos
ORDER BY created_at DESC;
