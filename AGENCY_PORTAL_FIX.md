# Fix Agency Portal Database Issues

## Problem

1. "Could not find the 'business_name' column" error when adding clients
2. Unnamed business clients appearing without manual addition
3. Contractor setup creating unwanted demo entries

## Solution Steps

### Step 1: Run Database Migration (Fixes Schema Error)

Open your **Supabase SQL Editor** and run this migration:

```sql
-- File: supabase/migrations/20251126_fix_demos_schema.sql

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
```

### Step 2: Clean Up Existing Bad Data

First, **preview what will be deleted**:

```sql
-- See what will be removed
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
```

If you're happy with removing those entries, **run the cleanup**:

```sql
-- Delete all unnamed/contractor entries
DELETE FROM demos
WHERE
    business_name = 'Unnamed Business'
    OR business_name = 'Contractor Business'
    OR contractor_mode = TRUE
    OR website_url = 'contractor-setup';
```

**Verify your real clients are still there**:

```sql
SELECT
    id,
    business_name,
    website_url,
    created_at
FROM demos
ORDER BY created_at DESC;
```

### Step 3: Deploy Code Changes

The following code changes prevent future unwanted entries:

✅ **Fixed**: Contractor setup no longer creates demo entries
✅ **Fixed**: API validates website URLs and rejects contractor mode
✅ **Fixed**: Only manual agency portal additions create clients

Deploy these changes:

```bash
git add .
git commit -m "Fix agency portal: prevent auto-client creation, fix schema error"
git push
vercel --prod
```

## What Changed

### Homepage (`app/page.tsx`)

- Removed demo creation from contractor setup button
- Now redirects directly to `/contractor/onboard` without polluting demos table

### API (`app/api/demos/route.ts`)

- Validates website URLs are real domains
- Rejects contractor mode entries
- Requires proper website URL format
- Logs who created each client

### Agency Portal (`app/agency/clients/page.tsx`)

- Tracks created_by_email for accountability
- Only creates entries when user clicks "Confirm & Add as Client"

## Testing

1. **Try adding a client**: https://www.diamondbackpropane.com/
   - Should work without schema errors
2. **Check client list**:
   - Should only show manually added clients
   - No "Unnamed Business" entries
3. **Contractor setup**:
   - Should not create demo entries
   - Still works for contractor onboarding

## Cleanup Commands (if needed)

Via agency portal UI:

- Click the "🗑️ Clean Up" button to remove unnamed businesses

Via API:

```bash
curl -X DELETE "https://your-domain.com/api/demos?cleanup=unnamed"
```

Via SQL (Supabase):

```sql
DELETE FROM demos WHERE business_name = 'Unnamed Business';
```
