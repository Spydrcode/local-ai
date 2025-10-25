# Porter AI Agent Constructor - Quick Reference

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  PORTER BASE METHODOLOGY                     │
│  (600+ lines - Core Strategic Thinking Framework)           │
│                                                              │
│  • Competitive Advantage Principles                         │
│  • Industry Structure Analysis                              │
│  • Value Chain Thinking                                     │
│  • Generic Strategies Framework                             │
│  • Analytical Standards (DO/DON'T)                          │
│  • Strategic Analysis Process (4 steps)                     │
│  • Confidence Calibration                                   │
└──────────────────────┬───────────────────────────────────────┘
                       │ Inherited by all agents
                       ↓
┌──────────────────────────────────────────────────────────────┐
│              AGENT-SPECIFIC CONFIGURATIONS                   │
│         (Each ~150 lines of specialized expertise)           │
└──────────────────────────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┬──────────────┐
        ↓                             ↓              ↓
┌───────────────┐          ┌───────────────┐   ┌────────────┐
│Strategy       │          │Value Chain    │   │Market      │
│Architect      │          │Analyst        │   │Forces      │
├───────────────┤          ├───────────────┤   ├────────────┤
│Five Forces    │          │Activity Cost  │   │Competitor  │
│Generic        │          │Activity Value │   │Intelligence│
│Strategy       │          │Linkage        │   │Trends      │
│Trade-offs     │          │Analysis       │   │Analysis    │
└───────────────┘          └───────────────┘   └────────────┘

┌───────────────┐          ┌───────────────┐   ┌────────────┐
│Differentiation│          │Profit Pool    │   │Operations  │
│Designer       │          │Mapper         │   │Optimizer   │
├───────────────┤          ├───────────────┤   ├────────────┤
│Positioning    │          │Margin         │   │Benchmarking│
│Messaging      │          │Analysis       │   │Efficiency  │
│Premium        │          │Product Mix    │   │Automation  │
│Features       │          │Pricing        │   │Tech Stack  │
└───────────────┘          └───────────────┘   └────────────┘

┌───────────────┐          ┌───────────────┐   ┌────────────┐
│Local Strategy │          │Executive      │   │Shared Value│
│Agent          │          │Advisor        │   │Innovator   │
├───────────────┤          ├───────────────┤   ├────────────┤
│Hyperlocal     │          │Decision       │   │CSR as      │
│Tactics        │          │Frameworks     │   │Competitive │
│Community      │          │Risk           │   │Advantage   │
│Engagement     │          │Assessment     │   │Sustainability│
└───────────────┘          └───────────────┘   └────────────┘
```

## How It Works

### Step 1: Base Prompt Defines Porter Thinking

```typescript
PORTER_BASE_SYSTEM_PROMPT
  ├── Core Principles (6)
  ├── Analytical Standards (✅ DO / ❌ DON'T)
  ├── Strategic Analysis Process (4 steps)
  └── Confidence Calibration
```

### Step 2: Agent Config Adds Specialization

```typescript
{
  role: "Strategy Architect",
  expertise: "Five Forces and generic strategies",
  focus: "Where should this business compete and how?",
  frameworks: ["Five Forces", "Generic Strategies", "Trade-offs"],
  outputFormat: "JSON with fiveForces, strategy, tradeoffs...",
  specialInstructions: "Identify 3-5 explicit trade-offs..."
}
```

### Step 3: Combined = Complete System Prompt

```typescript
getPorterAgentSystemPrompt("strategyArchitect");

// Returns:
// [600 lines of base methodology]
// + [150 lines of specialized role]
// = 750 lines of strategic thinking framework
```

### Step 4: Used in OpenAI Call

```typescript
createChatCompletion({
  messages: [
    {
      role: "system",
      content: getPorterAgentSystemPrompt("strategyArchitect"),
    },
    { role: "user", content: "Analyze this business..." },
  ],
});
```

## Key Files

- **`lib/agents/porter-base-prompt.ts`** - Base methodology + agent configs (800 lines)
- **`lib/agents/orchestrator.ts`** - Uses `getPorterAgentSystemPrompt()` for all 9 agents
- **`docs/PORTER_AI_METHODOLOGY.md`** - Complete documentation (600 lines)

## Quick Usage

```typescript
import { getPorterAgentSystemPrompt } from "./lib/agents/porter-base-prompt";

// For any of the 9 agents:
const systemPrompt = getPorterAgentSystemPrompt("strategyArchitect");
const systemPrompt = getPorterAgentSystemPrompt("valueChainAnalyst");
const systemPrompt = getPorterAgentSystemPrompt("marketForcesAnalyst");
const systemPrompt = getPorterAgentSystemPrompt("differentiationDesigner");
const systemPrompt = getPorterAgentSystemPrompt("profitPoolMapper");
const systemPrompt = getPorterAgentSystemPrompt("operationsOptimizer");
const systemPrompt = getPorterAgentSystemPrompt("localStrategyAgent");
const systemPrompt = getPorterAgentSystemPrompt("executiveAdvisor");
const systemPrompt = getPorterAgentSystemPrompt("sharedValueInnovator");
```

## What Makes This Better Than Generic AI?

### Generic AI Business Advice

❌ "Improve your customer service"
❌ "Use social media marketing"
❌ "Leverage your strengths"
❌ "Optimize operations"
❌ Vague platitudes

### Porter AI Agent Analysis

✅ "Implement 24-hour callback guarantee (differentiates from 3 competitors with next-day response)"
✅ "Sponsor neighborhood Facebook groups for senior demographics (hyperlocal, 65+ is 40% of market)"
✅ "Cost Leadership impossible - Scale disadvantage vs regional chains. Pursue Focus strategy on premium segment."
✅ "Automate scheduling saves 15 hrs/week ($18K annually) - Use Calendly + Zapier integration"
✅ Specific, quantified, structural reasoning

## Adding a New Agent

1. Add config to `PORTER_AGENT_CONFIGS` in `porter-base-prompt.ts`
2. Create method in `orchestrator.ts` that calls `getPorterAgentSystemPrompt("yourAgent")`
3. Agent automatically inherits Porter methodology!

## Benefits Summary

| Aspect              | Value                                               |
| ------------------- | --------------------------------------------------- |
| **Consistency**     | All 9 agents think like Porter, not generic AI      |
| **Specialization**  | Each agent masters one framework deeply             |
| **Maintainability** | Update base prompt once, all agents improve         |
| **Quality**         | Enforced analytical standards at framework level    |
| **Extensibility**   | Add agents with config only (no prompt engineering) |

## Trade-offs

| Pro                             | Con                                  |
| ------------------------------- | ------------------------------------ |
| High-quality strategic analysis | Higher token cost (~$0.002/analysis) |
| Consistent Porter methodology   | 750-token system prompts             |
| Easy to add new agents          | Harder to make ad-hoc changes        |
| Enforced rigor and standards    | Less creative/flexible               |

**Decision**: Quality and consistency > token efficiency

---

**See full documentation**: `docs/PORTER_AI_METHODOLOGY.md`
