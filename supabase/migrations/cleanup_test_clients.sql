-- Clean up test/unnamed clients from demos table
-- Run this in Supabase SQL Editor to remove old test data

-- Option 1: Delete ALL clients named "Unnamed Business"
-- WARNING: This will delete all clients without proper names!
-- DELETE FROM demos WHERE business_name = 'Unnamed Business';

-- Option 2: Delete clients created before a specific date (safer)
-- Example: Delete all "Unnamed Business" entries before January 15, 2025
DELETE FROM demos
WHERE business_name = 'Unnamed Business'
AND created_at < '2025-01-15'::timestamptz;

-- Option 3: Delete ALL demos (complete reset - use with caution!)
-- TRUNCATE TABLE demos;

-- After cleanup, verify remaining clients:
SELECT
  id,
  business_name,
  website_url,
  industry,
  created_at
FROM demos
ORDER BY created_at DESC
LIMIT 20;

-- Show count of remaining clients
SELECT COUNT(*) as total_clients FROM demos;
