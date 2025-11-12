# Agent System Implementation Guide

## Overview

This document describes the unified agentic framework implementation across the Local.AI platform.

## Key Changes Made

### 1. **Unified Agent System** ([lib/agents/unified-agent-system.ts](lib/agents/unified-agent-system.ts))

✅ **Already Created** - Central agent registry and base class

Features:
- `AgentRegistry` - Central registry for all agents
- `UnifiedAgent` - Base class with consistent execution patterns
- Built-in error handling and retry logic
- Support for tool-use capability
- Unified AI client integration (OpenAI, Together.ai, Ollama)

### 2. **Marketing Orchestrator** ([lib/agents/marketing-orchestrator.ts](lib/agents/marketing-orchestrator.ts))

✅ **UPDATED** - Now uses unified agent system

Changes:
- Removed direct agent imports
- Uses `AgentRegistry.get()` to retrieve agents
- Registers marketing-specific agents on module load
- All agents follow consistent execution pattern

### 3. **Tool Agent Helper** ([lib/agents/tool-agent-helper.ts](lib/agents/tool-agent-helper.ts))

✅ **CREATED** - Unified helper for all tool APIs

Features:
- `executeToolAgent()` - Execute any tool with unified agent system
- `validateToolRequest()` - Consistent request validation
- Dynamic agent registration for tools
- Automatic context building from website analysis
- Proper error handling and metadata

### 4. **Tool API Example** ([app/api/tools/blog-writer/route.ts](app/api/tools/blog-writer/route.ts))

✅ **UPDATED** - Now uses tool agent helper

Changes:
- Replaced direct OpenAI calls with `executeToolAgent()`
- Simpler, more maintainable code
- Consistent error handling
- Better context injection

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Pages                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  Tools   │ │ Content  │ │Dashboard │                     │
│  │  Page    │ │  Page    │ │  Page    │                     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                    │
└───────┼────────────┼────────────┼──────────────────────────┘
        │            │            │
        ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/tools/*       - Tool APIs                      │  │
│  │  /api/analyze       - Analysis APIs                  │  │
│  │  /api/generate-*    - Generation APIs                │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Tool Agent Helper                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  executeToolAgent()                                  │   │
│  │  validateToolRequest()                               │   │
│  │  buildContext()                                      │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Agent System                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AgentRegistry                                       │   │
│  │  ├── brand-voice                                     │   │
│  │  ├── seo-strategy                                    │   │
│  │  ├── content-calendar                                │   │
│  │  ├── blog-writer                                     │   │
│  │  ├── email-writer                                    │   │
│  │  └── [50+ other agents]                              │   │
│  │                                                       │   │
│  │  UnifiedAgent Base Class                             │   │
│  │  ├── execute()                                       │   │
│  │  ├── executeWithTools()                              │   │
│  │  └── error handling/retry                            │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified AI Client                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  createAICompletion()                                │   │
│  │  ├── OpenAI (primary)                                │   │
│  │  ├── Together.ai (fallback)                          │   │
│  │  └── Ollama (local)                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Migration Guide

### For Tool APIs

**Before:**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const body = await request.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [/* ... */],
    temperature: 0.8,
  });

  return NextResponse.json(JSON.parse(completion.choices[0].message.content));
}
```

**After:**
```typescript
import { executeToolAgent, validateToolRequest } from "@/lib/agents/tool-agent-helper";

export async function POST(request: Request) {
  const body = await request.json();
  validateToolRequest(body);

  const result = await executeToolAgent('tool-id', body);
  return NextResponse.json(result);
}
```

### For Orchestrators

**Before:**
```typescript
import { someAgent } from "./agents";

const result = await someAgent.execute(prompt, context);
```

**After:**
```typescript
import { AgentRegistry } from "./unified-agent-system";

const agent = AgentRegistry.get('agent-name');
if (!agent) throw new Error('Agent not registered');

const result = await agent.execute(prompt, context);
```

## Next Steps

### Phase 1: Update Remaining Tool APIs ✅ In Progress
- [x] blog-writer - COMPLETED
- [ ] email-writer
- [ ] review-responder
- [ ] ad-copy
- [ ] faq-builder
- [ ] gmb-post
- [ ] local-seo-meta
- [ ] location-page
- [ ] video-script
- [ ] newsletter
- [ ] ... (23 more tools)

### Phase 2: Update Other Orchestrators
- [ ] Porter Orchestrator ([lib/agents/orchestrator.ts](lib/agents/orchestrator.ts))
- [ ] HBS Frameworks Orchestrator
- [ ] Strategic Frameworks Orchestrator

### Phase 3: Add Advanced Agentic Features
- [ ] Multi-agent collaboration (agents calling other agents)
- [ ] Memory and context persistence
- [ ] Agent performance monitoring
- [ ] A/B testing different prompts
- [ ] Streaming responses for long-running agents

## Testing

### Test Single Tool
```bash
# Test blog writer
curl -X POST http://localhost:3000/api/tools/blog-writer \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Joe'\''s Coffee",
    "business_type": "Coffee shop",
    "topic": "How to brew the perfect coffee at home"
  }'
```

### Test Full Flow
```bash
# Run the test script
npm run dev
# Then navigate to http://localhost:3000/tools
# Fill in business info and test each tool
```

## Benefits

### For Developers
- ✅ **Consistency** - All agents follow same patterns
- ✅ **Maintainability** - Changes in one place affect all agents
- ✅ **Testability** - Easy to mock and test agents
- ✅ **Type Safety** - Strong TypeScript types throughout

### For Users
- ✅ **Reliability** - Consistent error handling and retry logic
- ✅ **Performance** - Unified caching and optimization
- ✅ **Quality** - Better prompts leveraging website context
- ✅ **Speed** - Faster responses with optimized agents

### For the Platform
- ✅ **Scalability** - Easy to add new agents and tools
- ✅ **Monitoring** - Central place for logging and metrics
- ✅ **Cost Control** - Track and optimize AI API usage
- ✅ **Flexibility** - Switch between AI providers easily

## Agent Registry

All registered agents can be viewed:
```typescript
import { AgentRegistry, verifyAgents } from './lib/agents/unified-agent-system';

// List all agents
const agents = AgentRegistry.list();
console.log(`Total agents: ${agents.length}`);

// Verify all agents are properly configured
verifyAgents();

// Get stats
import { getAgentStats } from './lib/agents/unified-agent-system';
const stats = getAgentStats();
console.log(stats);
// {
//   totalAgents: 50,
//   byCategory: { marketing: 10, content: 15, seo: 8, ... },
//   withTools: 5,
//   withoutTools: 45
// }
```

## Troubleshooting

### Agent Not Found
```typescript
const agent = AgentRegistry.get('my-agent');
if (!agent) {
  // Agent not registered - register it first
  AgentRegistry.register({
    name: 'my-agent',
    description: 'Does something',
    systemPrompt: 'You are...',
  });
}
```

### Invalid JSON Response
The agent system automatically handles JSON parsing errors. If you see this error:
1. Check the agent's `jsonMode` is set to `true`
2. Verify the system prompt instructs to return valid JSON
3. Review agent logs for the raw response

### Performance Issues
1. Check `maxTokens` setting (higher = slower)
2. Verify caching is enabled in orchestrators
3. Monitor execution time in `_metadata.executionTime`
4. Consider using a faster model (haiku vs sonnet)

## Support

For issues or questions:
1. Check the code examples in this doc
2. Review the unified agent system code
3. Look at the tool agent helper implementation
4. Test with the provided curl commands
