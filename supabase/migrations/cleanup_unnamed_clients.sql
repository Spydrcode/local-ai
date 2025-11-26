-- Cleanup script to remove all unwanted unnamed business entries
-- This removes test data and contractor setup entries from the demos table
-- Keep only actual agency clients

-- Step 1: Show what will be deleted
SELECT 
    id, 
    business_name, 
    website_url, 
    contractor_mode,
    created_at
FROM demos
WHERE 
    business_name = 'Unnamed Business' 
    OR business_name = 'Contractor Business'
    OR contractor_mode = TRUE
    OR website_url = 'contractor-setup'
ORDER BY created_at DESC;

-- Step 2: Uncomment and run this to delete all unnamed/contractor entries
-- WARNING: This will permanently delete data!

/*
DELETE FROM demos
WHERE 
    business_name = 'Unnamed Business' 
    OR business_name = 'Contractor Business'
    OR contractor_mode = TRUE
    OR website_url = 'contractor-setup';
*/

-- Step 3: Verify what's left (should only be real clients)
/*
SELECT 
    id, 
    business_name, 
    website_url, 
    created_at
FROM demos
ORDER BY created_at DESC;
*/
