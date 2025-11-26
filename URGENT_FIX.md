# URGENT: Fix Supabase Schema Mismatch

## The Problem

Your `demos` table is missing the `business_name` column that the API expects.
This is why you're getting the error: **"Could not find the 'business_name' column"**

## The Solution (2 minutes)

### Open Supabase SQL Editor

https://supabase.com/dashboard/project/dtegqjoqywlxzsfkurzh/sql/new

### Copy and Paste This SQL:

```sql
-- Step 1: Add the missing business_name column
ALTER TABLE demos
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Step 2: Populate it from existing data
UPDATE demos
SET business_name =
    CASE
        WHEN client_id LIKE '%diamondback%' THEN 'Diamond Back Propane'
        WHEN client_id LIKE '%contractor%' OR contractor_mode = true THEN 'Contractor Business'
        ELSE 'Unnamed Business'
    END
WHERE business_name IS NULL;

-- Step 3: Make it required
ALTER TABLE demos ALTER COLUMN business_name SET DEFAULT 'Unnamed Business';
ALTER TABLE demos ALTER COLUMN business_name SET NOT NULL;

-- Step 4: Delete all unnamed/test entries
DELETE FROM demos
WHERE business_name IN ('Unnamed Business', 'Contractor Business')
   OR client_id = 'contractor-setup'
   OR contractor_mode = true;

-- Step 5: Verify what's left (should only be Diamond Back Propane)
SELECT id, business_name, client_id, site_url, created_at
FROM demos
ORDER BY created_at DESC;
```

### Click "RUN"

That's it! Your database is now fixed and cleaned up.

## What This Does:

1. ✅ Adds the missing `business_name` column
2. ✅ Fills it with proper names for existing entries
3. ✅ Deletes all "Unnamed Business" and test entries
4. ✅ Keeps your real Diamond Back Propane client

## After Running This:

- Refresh your agency portal at `/agency/clients`
- You should see ONLY "Diamond Back Propane"
- Try adding a new client - it will work!

## Your Supabase Project:

Project URL: https://dtegqjoqywlxzsfkurzh.supabase.co
SQL Editor: https://supabase.com/dashboard/project/dtegqjoqywlxzsfkurzh/sql/new
