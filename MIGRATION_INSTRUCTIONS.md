# 🚨 URGENT: Apply Database Migrations

## Problem

Both **Porter Intelligence Stack** and **Economic Intelligence** features are failing to save because required database columns don't exist yet:

```
❌ Error: Could not find the 'porter_analysis' column of 'demos' in the schema cache
❌ Error: Could not find the 'economic_intelligence' column of 'demos' in the schema cache
```

## Solution

Apply the combined migration SQL to add both columns.

---

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run Migration

Copy the entire contents of the file:

```
APPLY_MIGRATIONS.sql
```

**OR** copy this SQL directly:

```sql
-- Add porter_analysis column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demos' AND column_name = 'porter_analysis'
  ) THEN
    ALTER TABLE demos ADD COLUMN porter_analysis JSONB;
    COMMENT ON COLUMN demos.porter_analysis IS 'Porter Intelligence Stack results';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_demos_porter_analysis_gin
ON demos USING GIN (porter_analysis);

-- Add economic_intelligence column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demos' AND column_name = 'economic_intelligence'
  ) THEN
    ALTER TABLE demos ADD COLUMN economic_intelligence JSONB;
    COMMENT ON COLUMN demos.economic_intelligence IS 'Economic Intelligence analysis';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_demos_economic_intelligence
ON demos USING gin (economic_intelligence);
```

### Step 3: Click "Run" or Press F5

You should see output like:

```
✅ Added porter_analysis column
✅ Added economic_intelligence column
```

### Step 4: Verify (Optional)

Run this query to confirm columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'demos'
  AND column_name IN ('porter_analysis', 'economic_intelligence');
```

Expected result:

```
column_name             | data_type
-----------------------|----------
porter_analysis        | jsonb
economic_intelligence  | jsonb
```

---

## After Migration

Once applied, these features will work:

✅ **Porter Intelligence Stack**

- 9 strategic analysis agents
- Competitive analysis
- Value chain optimization
- Strategic synthesis

✅ **Economic Intelligence**

- Macro-economic trend analysis
- Regulatory threat monitoring (SNAP, government shutdowns)
- Industry-specific impact assessment
- Profit predictions with scenario planning

---

## Alternative: Command Line (If you have Supabase CLI)

```bash
cd c:\Users\dusti\git\local.ai
supabase db push
```

This will apply all pending migrations in the `supabase/migrations/` folder.

---

## Troubleshooting

**Issue**: "relation 'demos' does not exist"

- **Fix**: Your demos table might have a different name. Check your Supabase table list.

**Issue**: "permission denied"

- **Fix**: Make sure you're logged into Supabase with admin/owner permissions.

**Issue**: Changes don't take effect

- **Fix**: The schema cache needs to refresh. Wait 30 seconds and try again, or restart your Next.js dev server.

---

## What Changed

### Files Modified:

1. ✅ `pages/api/analyze-site-data/[demoId].ts` - Fixed business name extraction to check `client_id` first
2. ✅ `app/economic/[demoId]/page.tsx` - Added null checks to prevent crashes on undefined data

### Migrations Created:

1. `supabase/migrations/20241025_optimize_porter_agents.sql` - Porter analysis column + indexes
2. `supabase/migrations/20241025_add_economic_intelligence.sql` - Economic intelligence column + index
3. `APPLY_MIGRATIONS.sql` - **Combined migration for easy application**

### Next Steps After Migration:

1. Test Porter Intelligence Stack on a demo
2. Test Economic Intelligence analysis
3. Verify data saves correctly
4. Check that business names display properly

---

**Need Help?**

- Can't access Supabase Dashboard? Check your login at https://app.supabase.com
- Don't know which project? Look for the project with your `demos` table
- Still stuck? Share the error message and I'll help debug
