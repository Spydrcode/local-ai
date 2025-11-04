# Agentic RAG System

## Overview
Intelligent retrieval-augmented generation system that decides when and how to retrieve information for optimal AI responses.

## Connected Components

### ✅ Agents
- **siteAnalysis.ts** - Uses RAG for enhanced business intelligence
- **strategicAnalysis.ts** - All functions (analyzeStrategy, generateSWOT, generateQuickWins) use RAG
- **orchestrator.ts** - RAG instance available for all 9 Porter agents

### ✅ Tools
- **marketResearch.ts** - Retrieves existing competitor analysis
- **operationalBenchmark.ts** - Retrieves operational efficiency data
- **localMarketIntel.ts** - Retrieves local market analysis
- **valueChainAnalyzer.ts** - Static analysis (no RAG needed)
- **profitPoolMapper.ts** - Static analysis (no RAG needed)

### ✅ API Routes
- **pages/api/chat/[demoId].ts** - Full agentic RAG integration

## How It Works

1. **Query Analysis**: AI agent analyzes query and decides retrieval strategy
2. **Multi-Source Retrieval**: Pulls from vector DB (strategic analysis) and structured DB (business details)
3. **Context Ranking**: Ranks retrieved contexts by relevance
4. **Response Generation**: LLM generates response with retrieved context
5. **Confidence Scoring**: Returns confidence based on context quality

## Usage

```typescript
import { queryAgenticRAG } from '@/lib/rag/agentic-rag';

const result = await queryAgenticRAG(
  "What are the competitive threats?",
  demoId,
  conversationHistory
);

console.log(result.answer);
console.log(result.confidence);
console.log(result.retrievalDecision.retrievalStrategy); // "vector" | "database" | "hybrid"
```

## Benefits

- **Adaptive**: Decides when retrieval is needed vs general knowledge
- **Efficient**: Avoids unnecessary retrieval operations
- **Transparent**: Returns sources and confidence scores
- **Accurate**: Grounds responses in actual business data
