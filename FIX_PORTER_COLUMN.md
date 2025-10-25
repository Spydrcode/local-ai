# Fix: porter_analysis Column Missing

## Error Message

```
Could not find the 'porter_analysis' column of 'demos' in the schema cache
```

## Root Cause

The Supabase migration `20241025_optimize_porter_agents.sql` hasn't been applied to your database yet.

## Solution: Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Left sidebar → SQL Editor
3. **Create New Query**
4. **Copy the migration file contents**:
   - File: `supabase/migrations/20241025_optimize_porter_agents.sql`
5. **Paste and Run** (Click "Run" or press Ctrl/Cmd + Enter)

You should see output:

```
✓ porter_analysis column added to demos
✓ HNSW index created on site_chunks
✓ GIN indexes created for metadata filtering
✓ Helper functions created
✓ porter_analysis_summary view created
```

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```powershell
# From project root
cd supabase

# Apply the migration
supabase db push

# Or apply a specific migration
supabase migration up --version 20241025_optimize_porter_agents
```

### Option 3: Manual SQL (If migration file is lost)

If the migration file isn't accessible, run this SQL in Supabase Dashboard:

```sql
-- Add porter_analysis column to demos table
ALTER TABLE demos ADD COLUMN IF NOT EXISTS porter_analysis JSONB;

COMMENT ON COLUMN demos.porter_analysis IS 'Porter Intelligence Stack results - 9 agents + synthesis';

-- Create GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_demos_porter_analysis_gin
ON demos USING GIN (porter_analysis);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

## Verify the Fix

After applying the migration, verify in Supabase Dashboard:

1. Go to **Table Editor** → **demos** table
2. Check that `porter_analysis` column exists (type: `jsonb`)
3. Verify index exists:
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE tablename = 'demos'
   AND indexname = 'idx_demos_porter_analysis_gin';
   ```

## Test Porter Agent

After the migration is applied, test running a Porter agent:

```
POST /api/porter-agent
{
  "demoId": "your-demo-id",
  "agentName": "strategy-architect"
}
```

Should now save results successfully without the "column not found" error.

## What This Migration Does

1. **Adds `porter_analysis` column** to `demos` table (JSONB type)
2. **Creates GIN index** for fast JSONB queries
3. **Optimizes site_chunks** with HNSW index (15-56x faster vector search)
4. **Creates helper functions**:
   - `search_porter_vectors()` - Fast Porter agent result retrieval
   - `cleanup_old_vectors()` - Maintenance function
5. **Creates view**: `porter_analysis_summary` - Reporting dashboard

## Related Files

- Migration: `supabase/migrations/20241025_optimize_porter_agents.sql`
- Documentation: `docs/VECTOR_OPTIMIZATION.md`
- API using this column: `pages/api/porter-agent.ts`, `pages/api/porter-intelligence-stack.ts`

---

**After applying the migration, the Porter agents will successfully save their analysis results to the database.**
