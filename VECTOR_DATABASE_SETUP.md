# Vector Database Setup & Seeding Guide

## Overview

Your application has vector database infrastructure in place but **vectors are not currently being populated**. This guide explains how to seed and maintain your vector database.

## Current State

### ✅ What's Ready

- Supabase `site_chunks` table with pgvector extension
- HNSW indexes for fast similarity search
- VectorRepository abstraction layer
- Search functions (`search_porter_vectors()`)
- Porter RAG system structure

### ❌ What's Missing

- **Vector seeding** - Database is empty
- **Automatic embedding generation** - Not happening during analysis
- **VectorRepository upsert implementation** - Was just a comment (now fixed!)

## Why You Need Vectors

Vectors enable:

1. **Semantic Search** - Find similar content by meaning, not just keywords
2. **RAG (Retrieval-Augmented Generation)** - Ground AI responses in your knowledge base
3. **Porter Framework Retrieval** - Pull relevant frameworks during business analysis
4. **Historical Analysis** - Search past analyses for similar businesses

## Setup Steps

### 1. Configure Environment Variables

Ensure you have these in `.env.local`:

```env
# Supabase (for vector storage)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-proj-your-key-here

# Optional: Pinecone (alternative to Supabase)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=local-ai-demos
VECTOR_PROVIDER=supabase  # or 'pinecone'
```

### 2. Run Database Migration

If you haven't already, apply the Porter optimization migration:

```bash
# Using Supabase CLI
supabase migration up

# Or apply manually in Supabase dashboard
# Run: supabase/migrations/20241025_optimize_porter_agents.sql
```

This creates:

- `site_chunks` table with vector(1536) column
- HNSW index for fast similarity search
- Metadata indexes for filtering
- Helper functions for searching

### 3. Seed Porter Framework Knowledge

Run the seeding script to populate initial Porter framework vectors:

```bash
npm run seed:porter
```

This will:

- Generate embeddings for 6 Porter framework documents
- Store them in `site_chunks` table with `demoId: 'porter-knowledge-base'`
- Total: ~6 vectors (Five Forces, Generic Strategies, Value Chain, etc.)

**Expected Output:**

```
🌱 Seeding Porter Framework Vectors...
📊 Using vector provider: supabase

Processing: Porter's Five Forces Framework Overview
✅ Seeded: porter-five-forces-overview

Processing: Barriers to Entry - Detailed Analysis
✅ Seeded: porter-five-forces-entry-barriers

...

🎉 Seeding Complete!
✅ Successfully seeded: 6 chunks
❌ Failed: 0 chunks
📊 Total: 6 chunks
```

### 4. Verify Seeding

Check that vectors were stored:

```sql
-- In Supabase SQL Editor
SELECT
  id,
  demo_id,
  metadata->>'title' as title,
  metadata->>'framework' as framework,
  array_length(embedding, 1) as embedding_dimensions
FROM site_chunks
WHERE demo_id = 'porter-knowledge-base'
ORDER BY id;
```

Expected: 6 rows with 1536-dimensional embeddings

## Updating Vectors

### When Business Analysis Runs

To automatically create vectors when analyzing websites, you need to:

**Option A: Update the analysis endpoint**

```typescript
// In app/api/grow-analysis/route.ts
import { VectorRepository } from "@/lib/repositories/vector-repository";
import { generateEmbedding } from "@/lib/vector-utils";

// After generating analysis
const repo = new VectorRepository("supabase");

// Create vector for the analysis
const embedding = await generateEmbedding(JSON.stringify(analysis));

await repo.provider.upsert([
  {
    id: `${businessId}-grow-analysis-${Date.now()}`,
    values: embedding,
    metadata: {
      demoId: businessId,
      analysisType: "grow_analysis",
      businessName: business_name,
      timestamp: new Date().toISOString(),
      content: analysis,
    },
  },
]);
```

**Option B: Use a background job** (recommended for production)

Create a job that runs after analysis to generate embeddings asynchronously.

### Periodic Re-seeding

If Porter frameworks are updated, re-run:

```bash
npm run seed:porter
```

This will upsert (update existing, insert new) all framework vectors.

## Testing Vector Search

### Test Semantic Search

```typescript
// Create a test file: scripts/test-porter-search.ts
import { VectorRepository } from "../lib/repositories/vector-repository";
import { generateEmbedding } from "../lib/vector-utils";

async function testSearch() {
  const repo = new VectorRepository("supabase");

  const query = "How do I analyze competitive threats?";
  const embedding = await generateEmbedding(query);

  const results = await repo.searchPorterForces({
    demoId: "porter-knowledge-base",
    query,
    queryEmbedding: embedding,
    topK: 3,
  });

  console.log("Search Results:", results);
}

testSearch();
```

### Expected Results

Query: "How do I analyze competitive threats?"

Should return:

1. Porter's Five Forces Framework (high similarity)
2. Barriers to Entry details (medium similarity)
3. Competitive Rivalry factors (medium similarity)

## Vector Database Maintenance

### Clean Up Old Vectors

The migration includes a cleanup function:

```sql
-- Delete vectors older than 90 days
SELECT cleanup_old_vectors(90);

-- Check how many would be deleted (dry run)
SELECT COUNT(*)
FROM site_chunks
WHERE created_at < NOW() - INTERVAL '90 days'
  AND demo_id NOT IN (
    SELECT id FROM demos WHERE created_at > NOW() - INTERVAL '90 days'
  );
```

### Monitor Vector Count

```sql
-- Total vectors
SELECT COUNT(*) FROM site_chunks;

-- Vectors by type
SELECT
  metadata->>'analysisType' as analysis_type,
  COUNT(*) as count
FROM site_chunks
GROUP BY metadata->>'analysisType'
ORDER BY count DESC;

-- Recent activity
SELECT
  DATE(created_at) as date,
  COUNT(*) as vectors_created
FROM site_chunks
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Re-index if Slow

If queries become slow, rebuild the HNSW index:

```sql
-- Drop and recreate HNSW index
DROP INDEX IF EXISTS idx_site_chunks_embedding_hnsw;

CREATE INDEX idx_site_chunks_embedding_hnsw
ON site_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

## Architecture: How Vectors Are Used

### 1. During Analysis (Future Enhancement)

```
User submits business for analysis
    ↓
Analyze website (siteAnalysis.ts)
    ↓
Generate embeddings for:
  - Business summary
  - Core services
  - Target audience
  - Differentiators
    ↓
Store in site_chunks table
    ↓
Continue with analysis
```

### 2. Porter RAG Retrieval

```
Agent needs Porter framework context
    ↓
Generate embedding for business context
    ↓
Search site_chunks for similar Porter knowledge
    ↓
Retrieve top 3 most relevant frameworks
    ↓
Augment agent prompt with framework text
    ↓
AI generates grounded, framework-based analysis
```

### 3. Historical Analysis Search

```
User asks: "Show me similar businesses"
    ↓
Generate embedding for current business
    ↓
Search site_chunks for similar analyses
    ↓
Return top matches with similarity scores
    ↓
Display to user
```

## Cost Considerations

### Embedding Generation Costs

- Model: `text-embedding-ada-002` or `text-embedding-3-small`
- Cost: ~$0.0001 per 1K tokens
- Average business analysis: ~500 tokens = $0.00005
- Seeding 6 Porter frameworks: ~$0.0003

### Storage Costs

- Supabase: Free tier includes 500MB
- Each vector: 1536 dimensions × 4 bytes = 6KB
- 1,000 vectors = ~6MB (well within free tier)
- 10,000 vectors = ~60MB

### Recommendations

✅ **Embed on analysis creation** - Worth the cost for better search
✅ **Seed core frameworks** - One-time cost, huge value
⚠️ **Batch embedding jobs** - Don't embed every page view
❌ **Don't embed trivial content** - Only strategic data

## Troubleshooting

### Vectors not appearing in database

1. Check Supabase connection:

   ```bash
   # Test connection
   npx supabase status
   ```

2. Verify environment variables are loaded:

   ```typescript
   console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log("Has service key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

3. Check for errors during seeding:
   ```bash
   npm run seed:porter 2>&1 | tee seed-log.txt
   ```

### Search returns no results

1. Verify vectors exist:

   ```sql
   SELECT COUNT(*) FROM site_chunks;
   ```

2. Check embedding dimensions match:

   ```sql
   SELECT DISTINCT array_length(embedding, 1) FROM site_chunks;
   -- Should be: 1536
   ```

3. Test with exact IDs:
   ```sql
   SELECT * FROM site_chunks WHERE id = 'porter-five-forces-overview';
   ```

### Slow query performance

1. Check index exists:

   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'site_chunks';
   -- Should include: idx_site_chunks_embedding_hnsw
   ```

2. Analyze query plan:

   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM site_chunks
   ORDER BY embedding <=> '[...]'::vector
   LIMIT 5;
   ```

3. Rebuild index if needed (see Maintenance section)

## Next Steps

1. ✅ **Seed Porter frameworks** - Run `npm run seed:porter`
2. ✅ **Verify in Supabase** - Check `site_chunks` table
3. ⏳ **Update analysis endpoints** - Auto-generate vectors during analysis
4. ⏳ **Integrate RAG** - Use `retrievePorterContext()` in agents
5. ⏳ **Build search UI** - Let users search past analyses
6. ⏳ **Set up monitoring** - Track vector count and search performance

## Additional Resources

- **Supabase Vector Docs**: https://supabase.com/docs/guides/ai/vector-indexes
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **pgvector GitHub**: https://github.com/pgvector/pgvector
- **Porter RAG Code**: `lib/agents/porter-rag.ts`
- **Vector Repository**: `lib/repositories/vector-repository.ts`

---

**Status**: ✅ Infrastructure ready, seeding script created, upsert method implemented

**Last Updated**: 2024-11-07
