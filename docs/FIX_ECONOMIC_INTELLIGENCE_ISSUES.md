# Fix: Economic Intelligence Issues

## Problems Identified

### 1. "Unknown Business" Display Issue

**Root Cause**: The `analyze-site-data` API endpoint tries to extract business name from `demo.summary`, but quick-analyze creates demos with `summary: "Analysis pending - use on-demand tools to generate insights"`, causing extraction to fail.

**Current Flow**:

```typescript
// quick-analyze.ts creates demo with:
{
  client_id: businessName,  // ✅ Has the name
  summary: "Analysis pending..."  // ❌ Generic text
}

// analyze-site-data tries to extract from:
demo.summary  // ❌ Fails - no business name in "Analysis pending..."
```

### 2. "Failed to Save Result" Error

**Root Cause**: The `economic_intelligence` column doesn't exist in the database yet. The migration file exists but hasn't been applied.

**Error**:

```
Failed to save economic intelligence: column "economic_intelligence" does not exist
```

---

## Solutions

### Solution 1: Fix Business Name Display

**Update `pages/api/analyze-site-data/[demoId].ts`** to check `client_id` field first:

```typescript
// Extract business name - CHECK CLIENT_ID FIRST
let businessName = "Business";

// Try client_id first (set by quick-analyze)
if (demo.client_id && demo.client_id !== "unknown") {
  businessName = demo.client_id;
} else if (summary) {
  // Try extracting from summary
  const summaryMatch = summary.match(
    /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
  );
  if (summaryMatch) {
    businessName = summaryMatch[1].trim();
  }
}

// Fallback to URL extraction
if (businessName === "Business" && websiteUrl) {
  const urlMatch = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
  if (urlMatch) {
    businessName = urlMatch[1]
      .split(/[-_]/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
```

### Solution 2: Apply Database Migration

**Option A: Supabase Dashboard (Recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20241025_add_economic_intelligence.sql`
3. Paste and execute

**Option B: Supabase CLI**

```bash
cd c:\Users\dusti\git\local.ai
supabase db push
```

**Option C: Manual SQL**

```sql
-- Add economic_intelligence column to demos table
ALTER TABLE demos ADD COLUMN IF NOT EXISTS economic_intelligence JSONB;

-- Add index for querying economic intelligence
CREATE INDEX IF NOT EXISTS idx_demos_economic_intelligence
ON demos USING gin (economic_intelligence);

-- Add comment for documentation
COMMENT ON COLUMN demos.economic_intelligence IS 'Economic Intelligence analysis including macro trends, regulatory impacts, profit predictions, and scenario planning';
```

**Verification**:

```sql
-- Check column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'demos'
AND column_name = 'economic_intelligence';

-- Should return:
-- column_name             | data_type
-- economic_intelligence   | jsonb
```

---

## Implementation Steps

### Step 1: Fix Business Name Extraction

Update the business name extraction logic to prioritize `client_id`:

<parameter>
</invoke>
