# Query Engine

Unified interface for all business intelligence queries with intelligent routing and caching.

## Features

- **Intelligent Query Planning**: AI analyzes queries and creates optimal execution plans
- **Multi-Source Routing**: Routes to RAG, agents, tools, or combinations
- **Result Caching**: 1-hour cache for frequently asked questions
- **Query Classification**: Automatically categorizes queries (chat, analysis, strategic, content, data)

## Architecture

```
Query → Plan → Route → Execute → Synthesize → Cache
```

### Query Intents

1. **chat**: Conversational questions about existing analysis (uses RAG)
2. **strategic**: Porter/SWOT/competitive analysis (uses agents)
3. **data**: Market research, benchmarks (uses tools)
4. **analysis**: Comprehensive analysis (uses RAG + agents)
5. **content**: Marketing content generation (uses content agents)

## Usage

### API Endpoint

```typescript
POST /api/query

{
  "query": "What are my competitive advantages?",
  "demoId": "demo-123",
  "context": {
    "businessName": "Acme Corp",
    "industry": "retail",
    "location": "Austin, TX"
  }
}
```

### Response

```typescript
{
  "answer": "Your competitive advantages are...",
  "sources": [
    { "type": "rag", "data": {...} },
    { "type": "agents", "data": [...] }
  ],
  "plan": {
    "intent": "strategic",
    "agents": ["strategy-architect"],
    "tools": [],
    "useRAG": true,
    "reasoning": "Query requires strategic analysis"
  },
  "executionTime": 2500,
  "cached": false
}
```

### Programmatic Usage

```typescript
import { executeQuery } from '@/lib/query-engine';

const result = await executeQuery({
  query: "How can I increase profit margins?",
  demoId: "demo-123",
  context: {
    industry: "restaurant",
    location: "Seattle"
  }
});

console.log(result.answer);
console.log(result.plan.intent); // "strategic"
console.log(result.cached); // false
```

## Query Examples

### Chat Queries
- "What did the analysis say about my competitors?"
- "Summarize my SWOT analysis"
- "What are my quick wins?"

### Strategic Queries
- "Analyze my competitive position using Porter's Five Forces"
- "What's my Blue Ocean strategy?"
- "How do I differentiate from competitors?"

### Data Queries
- "What's the market size for my industry?"
- "Show me local market demographics"
- "Benchmark my operations against industry standards"

### Analysis Queries
- "Give me a comprehensive strategic analysis"
- "What's my complete competitive landscape?"
- "Analyze all aspects of my business"

## Performance

- **Cache Hit**: <10ms
- **RAG Query**: 500-1500ms
- **Agent Execution**: 2000-5000ms
- **Full Analysis**: 5000-15000ms

## Integration Points

- **AgenticRAG**: Retrieval-augmented chat
- **AgentOrchestrator**: 9 Porter Intelligence agents
- **Tools**: Market research, benchmarks, local intel
- **Supabase**: Business data and analysis storage
