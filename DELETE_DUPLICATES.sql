-- Delete all Diamond Back Propane duplicates, keeping only the FIRST one
-- Run this in Supabase SQL Editor

-- First, see which one we'll keep (the oldest one)
SELECT id, business_name, client_id, created_at
FROM demos
WHERE business_name = 'Diamond Back Propane'
ORDER BY created_at ASC
LIMIT 1;

-- Delete all except the oldest one
DELETE FROM demos
WHERE id IN (
    SELECT id 
    FROM demos 
    WHERE business_name = 'Diamond Back Propane'
    ORDER BY created_at DESC
    OFFSET 1
);

-- Verify only 1 remains
SELECT id, business_name, client_id, site_url, created_at
FROM demos
ORDER BY created_at DESC;
