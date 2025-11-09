# Vector Database Seeding Guide

## Overview

Your AI Marketing Hub now has a comprehensive vector knowledge base powered by embeddings and RAG (Retrieval-Augmented Generation). This allows AI agents to retrieve relevant marketing frameworks and best practices during analysis.

---

## What Gets Seeded

### **1. Porter's Strategic Frameworks** (9 entries)
- Porter's Five Forces Framework
- Barriers to Entry Analysis
- Generic Strategies (Cost Leadership, Differentiation, Focus)
- Value Chain Analysis
- Competitive Advantage Principles
- Strategy vs. Operational Effectiveness
- Blue Ocean Strategy - Four Actions Framework
- Blue Ocean Value Curve
- Non-Customer Analysis

### **2. Harvard Business School Marketing Frameworks** (40+ entries)
- **Jobs-to-be-Done** (Clayton Christensen)
- **Marketing Myopia** (Theodore Levitt)
- **Competitive Positioning** (Michael Porter)
- **Discovery-Driven Planning** (Rita McGrath)
- **Disruptive Innovation** (Clayton Christensen)
- **"Different" Framework** (Youngme Moon)
- **Consumer Decision Journey** (John Deighton)

### **3. Modern ML Marketing Practices**
- AI-Powered Personalization
- Behavioral Segmentation
- Predictive Analytics
- Marketing Mix Modeling
- Attribution Modeling

### **4. Marketing Best Practices**
- Modern SEO (BERT, RankBrain, Core Web Vitals)
- Local SEO strategies
- Content Marketing (pillar/cluster model)
- Content Repurposing
- Platform-Specific Social Media
- Algorithm Optimization
- Email Marketing Sequences
- Subject Line Formulas
- Conversion Rate Optimization

---

## How to Seed

### **Option 1: Seed Everything (Recommended)**

```bash
npm run seed:all
```

This will seed both Porter frameworks and all marketing knowledge (~50+ entries total).

**Estimated time:** 30-60 seconds (depending on rate limits)

---

### **Option 2: Seed Individually**

**Porter frameworks only:**
```bash
npm run seed:porter
```

**Marketing knowledge only:**
```bash
npm run seed:marketing
```

---

## Prerequisites

### **Environment Variables**

Make sure you have the following set in your `.env.local`:

**For Supabase (default):**
```env
VECTOR_PROVIDER=supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**For Pinecone:**
```env
VECTOR_PROVIDER=pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
```

**For Embeddings:**
```env
# OpenAI (recommended for quality)
OPENAI_API_KEY=your_openai_key

# OR HuggingFace (free, local)
HUGGINGFACE_API_KEY=your_hf_key
```

---

## Verification

After seeding, you should see output like:

```
✨ ALL VECTOR SEEDING COMPLETE!
======================================================================
⏱️  Total time: 45.3s

📚 Your vector database now contains:
   ✓ Porter's Five Forces framework
   ✓ Porter's Generic Strategies
   ✓ Porter's Value Chain
   ✓ Blue Ocean Strategy
   ✓ Jobs-to-be-Done (Christensen)
   ✓ Marketing Myopia (Levitt)
   ✓ Competitive Positioning
   ✓ Discovery-Driven Planning
   ✓ Disruptive Innovation
   ✓ 'Different' Framework (Moon)
   ✓ Consumer Decision Journey
   ✓ AI-Powered Personalization
   ✓ Marketing Mix Modeling
   ✓ Modern SEO Practices
   ✓ Content Marketing Strategies
   ✓ Social Media Best Practices
   ✓ Email Marketing Tactics
   ✓ Conversion Optimization

💡 AI agents can now retrieve relevant frameworks during analysis!
   RAG-powered recommendations are active.
```

---

## How It Works

### **1. Content → Embeddings**

Each knowledge entry is converted to a vector embedding:
```typescript
const embedding = await generateEmbedding(knowledge.content)
// Returns: [0.123, -0.456, 0.789, ...] (768-1536 dimensions)
```

### **2. Storage in Vector Database**

Embeddings are stored with metadata:
```typescript
{
  id: 'jtbd-001',
  values: [0.123, -0.456, ...],
  metadata: {
    framework: 'jobs-to-be-done',
    category: 'strategy',
    topic: ['customer-needs', 'value-proposition'],
    source: 'Clayton Christensen - HBS',
    content: 'Full text content...',
    confidence: 0.95
  }
}
```

### **3. Retrieval During Analysis**

When an AI agent analyzes a business:
```typescript
// Query: "How to position against competitors?"
const results = await vectorDB.search(query, { topK: 5 })

// Returns most relevant frameworks:
// 1. Competitive Positioning (Porter)
// 2. Different Framework (Moon)
// 3. Blue Ocean Strategy
// 4. Jobs-to-be-Done
// 5. Marketing Myopia
```

### **4. RAG-Powered Recommendations**

Agents use retrieved knowledge to enhance recommendations:
```typescript
const context = results.map(r => r.content).join('\n\n')

const prompt = `
Based on these frameworks:
${context}

Analyze this business: ${businessData}
`

const recommendations = await agent.execute(prompt)
```

---

## When to Re-Seed

You should re-seed the vector database when:

1. **Adding new frameworks** - New marketing knowledge entries
2. **Updating existing knowledge** - Improved or corrected content
3. **Changing vector provider** - Switching from Supabase to Pinecone
4. **After database reset** - Starting fresh

---

## Troubleshooting

### **"Failed to generate embedding"**

**Cause:** Missing or invalid API key

**Solution:**
```bash
# Check your .env.local
cat .env.local | grep -E "OPENAI_API_KEY|HUGGINGFACE_API_KEY"

# Make sure key is valid
echo $OPENAI_API_KEY
```

---

### **"Connection refused" or "Database error"**

**Cause:** Vector database not accessible

**Solution:**
```bash
# For Supabase: Check URL and key
# For Pinecone: Verify API key and environment

# Test connection manually
curl -X GET \
  "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-key"
```

---

### **"Rate limit exceeded"**

**Cause:** Too many requests to embedding API

**Solution:**
The seed script already includes 500ms delays between entries. If you still hit rate limits:

1. Increase delay in seed script (line: `setTimeout(resolve, 1000)`)
2. Use a different embedding model
3. Seed in smaller batches

---

### **"Seeding takes too long"**

**Optimization tips:**

1. **Use local embeddings** (HuggingFace Transformers - no API calls)
2. **Parallelize** (not recommended with rate limits)
3. **Cache embeddings** (generate once, store locally)

---

## Advanced: Custom Knowledge

To add your own marketing knowledge:

### **1. Add to knowledge base**

Edit `lib/vector/marketing-knowledge-base.ts`:

```typescript
export const MARKETING_KNOWLEDGE_BASE = [
  // ... existing entries
  {
    id: 'custom-001',
    content: `Your marketing strategy or framework here...`,
    metadata: {
      framework: 'your-framework-name',
      category: 'strategy', // or 'tactics', 'metrics', etc.
      topic: ['topic1', 'topic2'],
      source: 'Your Source',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  }
]
```

### **2. Re-seed**

```bash
npm run seed:all
```

---

## Performance

**Seeding stats:**
- **Porter frameworks:** ~9 entries, ~5-10 seconds
- **Marketing knowledge:** ~40 entries, ~20-40 seconds
- **Total:** ~50 entries, ~30-60 seconds

**Search performance:**
- Query time: ~100-300ms
- Retrieval: Top 5-10 results
- Relevance: Cosine similarity > 0.7

---

## Summary

✅ **Seed once** using `npm run seed:all`
✅ **Verify** by checking console output
✅ **Test** by running marketing analysis
✅ **Update** when adding new frameworks
✅ **Monitor** vector search relevance in agent responses

Your AI Marketing Hub is now powered by world-class marketing frameworks and best practices! 🚀
