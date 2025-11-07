# Quick Start Guide - Enterprise Agent System

## 🚀 Get Started in 5 Minutes

### 1. Import the System

```typescript
import { agentSystem } from "@/lib/agents/core/AgentSystem";
```

### 2. Execute an Agent

```typescript
const response = await agentSystem.executeAgent(
  "marketing-content",
  "Generate a blog post about AI trends",
  { industry: "technology", tone: "professional" }
);

console.log(response.content);
```

### 3. Check System Health

```typescript
const health = agentSystem.getHealthStatus();
console.log(health.status); // 'healthy', 'degraded', or 'unhealthy'
```

## 💡 Common Use Cases

### Website Analysis

```typescript
const result = await agentSystem.executeWorkflow("website-analysis", {
  url: "https://example.com",
});

// Access parallel analysis results
const aggregated = result.results.get("aggregated");
console.log(aggregated?.content); // { strategic, competitive, quickWins }
```

### Content Generation for Multiple Platforms

```typescript
const result = await agentSystem.executeWorkflow("content-generation", {
  businessInfo: "Local bakery specializing in custom cakes",
  platforms: ["facebook", "instagram", "linkedin"],
});

// Each platform's content generated in parallel (fast!)
```

### Business Analysis

```typescript
const result = await agentSystem.executeWorkflow("business-analysis", {
  businessInfo: "SaaS company providing project management tools",
});

// Parallel strategic, competitive, and revenue analysis
```

## 🔧 Advanced Usage

### Custom Pipeline

```typescript
import { orchestrator } from "@/lib/agents/core/Orchestrator";

const result = await orchestrator.executePipeline([
  {
    agentName: "strategic-analysis",
    userMessage: "Analyze business model",
    context: { businessInfo },
    transform: (response) => ({ analysis: response.content }),
  },
  {
    agentName: "marketing-content",
    userMessage: "Create campaign based on analysis",
    // Automatically gets 'analysis' from previous step
  },
]);
```

### Parallel Execution

```typescript
const result = await orchestrator.executeFanOut(
  [
    { agentName: "agent1", userMessage: "Task 1" },
    { agentName: "agent2", userMessage: "Task 2" },
    { agentName: "agent3", userMessage: "Task 3" },
  ],
  (results) => {
    // Aggregate results
    return {
      combined: results.size,
      data: Array.from(results.values()),
    };
  }
);
```

### With Retry Configuration

```typescript
const result = await orchestrator.executePipeline([
  {
    agentName: "marketing-content",
    userMessage: "Generate content",
    retryConfig: {
      maxAttempts: 5,
      initialDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
  },
]);
```

## 📊 Monitoring

### Get Metrics

```typescript
// All agents
const metrics = agentSystem.getAgentMetrics();

// Specific agent
const contentMetrics = agentSystem.getAgentMetrics("marketing-content");
console.log(`Error rate: ${contentMetrics.errorRate * 100}%`);
console.log(`Avg latency: ${contentMetrics.averageLatency}ms`);
```

### System Status

```typescript
const status = agentSystem.getSystemStatus();
console.log(status.summary);
/*
{
  totalAgents: 10,
  healthyAgents: 10,
  degradedAgents: 0,
  unhealthyAgents: 0,
}
*/
```

### Cache Management

```typescript
// Clear all caches
agentSystem.clearCache();

// Clear specific agent cache
agentSystem.clearCache("marketing-content");
```

## 🌐 API Endpoints

### Health Check

```bash
GET /api/system/health?view=status
GET /api/system/health?view=health
GET /api/system/health?view=metrics
GET /api/system/health?view=agents&agent=marketing-content
```

### Clear Cache

```bash
DELETE /api/system/health
DELETE /api/system/health?agent=marketing-content
```

## 🎯 Migration from Old System

### Before

```typescript
import { AgentRegistry } from "@/lib/agents/unified-agent-system";

const agent = AgentRegistry.get("marketing-content");
const response = await agent.execute(prompt, context);
```

### After

```typescript
import { agentSystem } from "@/lib/agents/core/AgentSystem";

const response = await agentSystem.executeAgent(
  "marketing-content",
  prompt,
  context
);
```

**Benefits of Migration:**

- ✅ Automatic caching (5 min TTL)
- ✅ Circuit breaker protection
- ✅ Retry logic with exponential backoff
- ✅ Full metrics tracking
- ✅ Health monitoring

## ⚡ Performance Tips

### 1. Use Workflows for Complex Operations

```typescript
// ❌ Slow (sequential, 3-6 seconds)
const swot = await agentSystem.executeAgent('strategic-analysis', ...);
const competitive = await agentSystem.executeAgent('competitive-intelligence', ...);
const revenue = await agentSystem.executeAgent('revenue-intelligence', ...);

// ✅ Fast (parallel, 1-2 seconds)
const result = await agentSystem.executeWorkflow('business-analysis', { businessInfo });
```

### 2. Leverage Caching

```typescript
// First call: ~1.5 seconds (AI call)
await agentSystem.executeAgent("marketing-content", prompt, context);

// Second call (within 5 min): ~2ms (cached)
await agentSystem.executeAgent("marketing-content", prompt, context);
```

### 3. Monitor Health

```typescript
// Check before making critical calls
const health = agentSystem.getHealthStatus();
if (health.status === "unhealthy") {
  // Use fallback or show error
}
```

## 🛠️ Tools

### Register Custom Tool

```typescript
import { toolRegistry } from "@/lib/agents/core/ToolRegistry";

toolRegistry.registerTool({
  name: "my_custom_tool",
  description: "Does something amazing",
  version: "1.0.0",
  parameters: [
    {
      name: "input",
      type: "string",
      description: "Input text",
      required: true,
    },
  ],
  execute: async (params) => {
    // Your logic here
    return {
      success: true,
      data: { result: "processed" },
    };
  },
  cacheable: true,
  cacheTTL: 10 * 60 * 1000, // 10 minutes
  rateLimit: {
    maxCallsPerMinute: 10,
    maxCallsPerHour: 100,
  },
});
```

### Use Tool

```typescript
const result = await toolRegistry.executeTool("my_custom_tool", {
  input: "test",
});
```

## 📈 Metrics Explained

### Agent Metrics

```typescript
interface AgentMetrics {
  agentName: string;
  totalExecutions: number; // Total times executed
  successfulExecutions: number; // Successful completions
  failedExecutions: number; // Failures
  averageLatency: number; // Exponential moving average (ms)
  p95Latency: number; // 95th percentile (ms)
  p99Latency: number; // 99th percentile (ms)
  lastExecutionTime: number; // Timestamp
  errorRate: number; // failedExecutions / totalExecutions
}
```

### Health Status

```typescript
interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  agents: Array<{
    name: string;
    status: string;
    circuitBreakerState: string; // 'closed' | 'open' | 'half-open'
    errorRate: number;
  }>;
}
```

## 🎓 Best Practices

### 1. Always Check Health Before Critical Operations

```typescript
const health = agentSystem.getHealthStatus();
if (health.status !== "healthy") {
  throw new Error("System degraded, cannot proceed");
}
```

### 2. Use Workflows for Multi-Step Operations

```typescript
// ✅ Good
await agentSystem.executeWorkflow('website-analysis', { url });

// ❌ Avoid
await agentSystem.executeAgent('agent1', ...);
await agentSystem.executeAgent('agent2', ...);
await agentSystem.executeAgent('agent3', ...);
```

### 3. Monitor Metrics Regularly

```typescript
setInterval(() => {
  const metrics = agentSystem.getAgentMetrics();
  metrics.forEach((m: any) => {
    if (m.errorRate > 0.5) {
      alertOps(`High error rate for ${m.agentName}: ${m.errorRate}`);
    }
  });
}, 60000); // Every minute
```

### 4. Clear Cache Strategically

```typescript
// After deploying new agent logic
agentSystem.clearCache("updated-agent");

// After updating business data
agentSystem.clearCache(); // Clear all
```

## 🔍 Debugging

### Check Circuit Breaker State

```typescript
import { agentManager } from "@/lib/agents/core/AgentManager";

const state = agentManager.getCircuitBreakerStatus("marketing-content");
console.log(state); // 'closed', 'open', or 'half-open'
```

### Listen to Events

```typescript
import { agentManager } from "@/lib/agents/core/AgentManager";

agentManager.on("agent:execution_failed", (event) => {
  console.error(`Failed: ${event.agentName}`, event.error);
});

agentManager.on("agent:cache_hit", (event) => {
  console.log(`💰 Cache hit for ${event.agentName}`);
});
```

## 📚 Full Documentation

For comprehensive documentation, see:

- **README**: `lib/agents/core/README.md`
- **Summary**: `AGENT_FRAMEWORK_SUMMARY.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

## 🆘 Troubleshooting

### Agent Not Found

```typescript
// Verify agent is registered
const agents = agentSystem.getAgentMetrics();
console.log(Array.from(agents.keys())); // List all agents
```

### High Error Rate

```typescript
// Check metrics
const metrics = agentSystem.getAgentMetrics("problematic-agent");
console.log(metrics);

// Clear cache
agentSystem.clearCache("problematic-agent");
```

### Circuit Breaker Open

```typescript
// Wait 60 seconds or clear and restart
agentSystem.clearCache("failing-agent");

// Circuit will automatically attempt recovery
```

## 🎉 Success!

You now have a production-ready, ML engineering-grade agentic framework with:

- ✅ Circuit breaker protection
- ✅ Intelligent caching
- ✅ Retry logic
- ✅ Full observability
- ✅ Health monitoring
- ✅ Rate limiting
- ✅ Parallel execution

Start using it in your APIs for better performance and reliability! 🚀
