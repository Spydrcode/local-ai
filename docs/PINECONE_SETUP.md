# Pinecone Vector Database Setup

## ✅ Current Status: CONNECTED

Your Local AI application is now connected to Pinecone for vector storage and similarity search.

## Configuration

### Environment Variables (.env.local)

```bash
# Vector database provider (pinecone or supabase)
VECTOR_PROVIDER=pinecone

# Pinecone configuration
PINECONE_API_KEY=pcsk_6Y2usx_BoS4CSGTuXSxpPTSC5je1z8fjeuA7KjiABZMtmYjKiJPpAM8nN92qBMCtQDGD2j
PINECONE_INDEX_NAME=local-ai-demos
```

### Index Details

- **Index Name**: `local-ai-demos`
- **Dimensions**: 1536 (OpenAI text-embedding-3-small)
- **Metric**: Cosine similarity
- **Cloud**: AWS (us-east-1)
- **Type**: Serverless

## How It Works

### 1. Site Analysis (`/api/analyze-site`)

When a user analyzes a website:

1. Website content is scraped and chunked
2. Each chunk is embedded using OpenAI (`text-embedding-3-small`)
3. Vectors are stored in Pinecone with metadata:
   - `demoId`: Links vectors to specific demo
   - `content`: Original text content
   - `metadata`: Additional context (URL, title, etc.)

### 2. Chatbot Queries (`/api/chat`)

When the AI chatbot answers questions:

1. User question is embedded using OpenAI
2. Pinecone performs similarity search filtered by `demoId`
3. Top 3 most relevant chunks are retrieved
4. Context is injected into GPT-4 prompt for accurate answers

## Implementation Details

### Vector Storage (`lib/vector.ts`)

**Upsert Function**:

```typescript
// Stores vectors in Pinecone
await index.upsert([{
  id: chunk.id,
  values: chunk.embedding,  // 1536-dimensional vector
  metadata: {
    demoId: chunk.demoId,
    content: chunk.content,
    ...
  }
}]);
```

**Similarity Search**:

```typescript
// Queries Pinecone for similar vectors
const results = await index.query({
  vector: queryEmbedding,
  topK: 3,
  filter: { demoId: { $eq: demoId } },
  includeMetadata: true,
});
```

## Setup Commands

### Initial Setup (Already Completed)

```bash
# Install dependencies
npm install

# Create Pinecone index
npm run setup:pinecone
```

### Verify Setup

```bash
# Check index exists in Pinecone dashboard
# https://app.pinecone.io/

# Or run setup again to see stats
npm run setup:pinecone
```

## Switching Between Supabase and Pinecone

To switch back to Supabase:

```bash
# In .env.local
VECTOR_PROVIDER=supabase
```

To use Pinecone (current setting):

```bash
# In .env.local
VECTOR_PROVIDER=pinecone
```

## Benefits of Pinecone

1. **Performance**: Ultra-fast similarity search (< 100ms)
2. **Scalability**: Handles millions of vectors effortlessly
3. **Serverless**: No infrastructure management
4. **Metadata Filtering**: Efficient filtering by demoId
5. **High Availability**: 99.9% uptime SLA

## Troubleshooting

### Index Not Found

```bash
# Recreate index
npm run setup:pinecone
```

### API Key Issues

```bash
# Verify API key in .env.local
# Get new key from: https://app.pinecone.io/organizations/-/projects/-/keys
```

### Dimension Mismatch

Ensure you're using OpenAI's `text-embedding-3-small` (1536 dimensions):

```typescript
// In lib/openai.ts
model: "text-embedding-3-small"; // ✓ Correct
// NOT "text-embedding-ada-002"   // ✗ Wrong (different dimensions)
```

## Cost Estimate

**Pinecone Serverless Pricing** (as of 2024):

- **Storage**: ~$0.40 per 1M vectors/month
- **Queries**: ~$2.00 per 1M queries

**Example Usage** (100 demos/month):

- 100 sites × 50 chunks avg = 5,000 vectors
- Storage: ~$0.002/month
- Queries: 1,000 chatbot queries = ~$0.002/month
- **Total**: ~$0.004/month

Very cost-effective for most use cases!

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `VECTOR_PROVIDER=pinecone`
   - `PINECONE_API_KEY=your_key`
   - `PINECONE_INDEX_NAME=local-ai-demos`

2. Index is already created (one-time setup)

3. App will automatically use Pinecone in production

## Monitoring

Check Pinecone dashboard for:

- Total vector count
- Query performance metrics
- Storage usage
- API usage

Dashboard: https://app.pinecone.io/

## Next Steps

- ✅ Pinecone connected and working
- ✅ Index created (`local-ai-demos`)
- ✅ Vector provider set to Pinecone
- 🚀 Start creating demos to test it out!

Try analyzing a website and asking the chatbot questions to see Pinecone in action!
