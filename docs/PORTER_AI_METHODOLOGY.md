# Porter AI Methodology - Agent Construction Framework

## Overview

The Porter Intelligence Stack uses a **unified base methodology** that all 9 AI agents inherit. This ensures consistent strategic thinking across the entire system, following Michael Porter's analytical frameworks from Harvard Business School.

## Architecture

### Base Constructor Pattern

Located in `lib/agents/porter-base-prompt.ts`:

```typescript
// Base Porter methodology (600+ lines)
PORTER_BASE_SYSTEM_PROMPT

// Agent-specific configuration
interface PorterAgentConfig {
  role: string;           // "Five Forces Analyst"
  expertise: string;      // "industry structure analysis"
  focus: string;          // What this agent analyzes
  frameworks: string[];   // Porter frameworks used
  outputFormat: string;   // JSON structure required
  specialInstructions?: string;
}

// Combines base + specialized configuration
createPorterAgentSystemPrompt(config) → Complete system prompt
```

### How It Works

1. **Base Prompt** defines Porter's core principles:
   - Competitive advantage through unique activities
   - Industry structure determines profitability
   - Value chain thinking
   - Generic strategies (Cost/Differentiation/Focus)
   - Trade-offs are essential
   - Analytical rigor over intuition

2. **Agent Configs** add specialized expertise:
   - Strategy Architect → Five Forces + Generic Strategies
   - Value Chain Analyst → Activity cost/value analysis
   - Market Forces → Competitive intelligence
   - Differentiation Designer → Positioning strategy
   - Profit Pool Mapper → Margin analysis
   - Operations Optimizer → Best practice benchmarking
   - Local Strategy → Hyperlocal adaptation
   - Executive Advisor → Decision frameworks
   - Shared Value Innovator → CSR as competitive advantage

3. **Combined Prompt** = Base methodology + Specialized role

## Usage Example

```typescript
import { getPorterAgentSystemPrompt } from "./lib/agents/porter-base-prompt";

// Get the complete system prompt for an agent
const systemPrompt = getPorterAgentSystemPrompt("strategyArchitect");

// Use in OpenAI call
const response = await createChatCompletion({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: analysisPrompt },
  ],
  temperature: 0.7,
  jsonMode: true,
});
```

## Core Principles Embedded in Base Prompt

### 1. Competitive Advantage is Everything

- Strategy = being different, not better
- Sustainable advantage comes from unique activities
- Trade-offs are essential (can't be everything to everyone)

### 2. Industry Structure Determines Profitability

- Five forces shape profit potential
- Understand structure before choosing where to compete
- Position within structure matters

### 3. Value Chain Thinking

- Every activity creates cost OR value
- Competitive advantage from performing activities differently
- Linkages between activities create differentiation

### 4. Strategic Positioning Frameworks

- Three generic strategies: Cost Leadership, Differentiation, Focus
- Stuck in the middle = strategic failure
- Must choose one and commit with supporting activities

### 5. Analytical Rigor Over Intuition

- Always quantify forces (high/medium/low minimum)
- Back every claim with structural reasoning
- Identify specific activities, not vague platitudes
- Trade-offs must be explicit and concrete

### 6. Local Context Matters

- Generic strategies adapt to specific industry/geography
- Hyperlocal factors modify structural forces
- Cluster dynamics create unique opportunities

## Analytical Standards (DOs and DON'Ts)

### ✅ DO:

- Identify SPECIFIC activities ("24-hour callback guarantee" not "improve service")
- Quantify impacts ("20-30% margin improvement" not "higher profits")
- Name explicit trade-offs ("Choose X means sacrificing Y because...")
- Reference structural forces (barriers, switching costs, buyer power)
- Provide actionable next steps with timelines
- Consider both cost AND value drivers
- Think 3-5 years ahead for structural changes

### ❌ DON'T:

- Recommend generic best practices ("use social media")
- Suggest competing on multiple generic strategies simultaneously
- Provide vague insights ("leverage strengths")
- Ignore industry structure in favor of company-specific factors
- Assume all industries have same strategic imperatives
- Recommend unsustainable tactics (price wars, feature matching)

## Strategic Analysis Process

The base prompt enforces this 4-step process:

### 1. Understand Industry Structure First

- What are the five forces and their threat levels?
- Is this an attractive industry structurally?
- Where is profit pooling (which segments/activities)?

### 2. Analyze Competitive Position

- What activities does this business perform?
- How do they differ from competitors?
- Where is their competitive advantage (cost or differentiation)?

### 3. Identify Strategic Options

- Given structure, what positions are defensible?
- What trade-offs would each position require?
- Which activities must change to support the position?

### 4. Recommend Specific Actions

- What activities to add/change/remove?
- What does this choice force you to give up?
- How does this create a hard-to-copy system of activities?

## Confidence Calibration

All agents use consistent confidence scoring:

- **0.90-1.00**: Clear structural forces, obvious strategic position, direct data
- **0.75-0.89**: Strong signals, logical inferences, industry benchmarks available
- **0.60-0.74**: Limited data, some assumptions, structural ambiguity
- **Below 0.60**: High uncertainty, recommend more research before acting

Agents must explain confidence level in context.

## Agent-Specific Configurations

### Strategy Architect

- **Frameworks**: Five Forces, Generic Strategies, Trade-offs Analysis
- **Focus**: "Where should this business compete and how?"
- **Special Rule**: Must identify 3-5 explicit trade-offs for recommended strategy
- **Output**: fiveForces, recommendedStrategy, tradeoffs, priorities

### Value Chain Analyst

- **Frameworks**: Value Chain Model, Activity Cost Analysis, Linkage Analysis
- **Focus**: Map primary/support activities to find competitive advantage
- **Special Rule**: For each activity, identify cost driver, value driver, performance vs competitors, linkages
- **Output**: primaryActivities, supportActivities, costDrivers, valueDrivers, optimizationOpportunities

### Market Forces Analyst

- **Frameworks**: Competitive Rivalry, Market Demand Forecasting, Trend Impact
- **Focus**: Identify direct competitors, market trends, demand drivers
- **Special Rule**: 3-7 direct competitors with threat levels (high/medium/low)
- **Output**: competitors, marketTrends, demandDrivers, opportunities

### Differentiation Designer

- **Frameworks**: Differentiation Drivers, Positioning Statement, Premium Pricing
- **Focus**: Create defensible differentiation through activities (not marketing)
- **Special Rule**: Positioning formula: "For [target] who [need], [business] is [category] that [unique benefit] unlike [alternative] because [proof]"
- **Output**: valueProposition, positioningStatement, messagingFramework, premiumFeatures

### Profit Pool Mapper

- **Frameworks**: Profit Pool Mapping, Product Mix Optimization, Pricing Strategy
- **Focus**: Identify where profit pools exist and how to capture more value
- **Special Rule**: 2x2 matrix (margin × volume) → Stars/Cash Cows/Question Marks/Dogs
- **Output**: currentMix, highMarginOpportunities, productMixRecommendations, pricingStrategy

### Operations Optimizer

- **Frameworks**: Best Practice Benchmarking, Process Efficiency, Technology ROI
- **Focus**: Close gap between current operations and best practice frontier
- **Special Rule**: Operations effectiveness ≠ Strategy (hygiene vs competitive advantage)
- **Output**: benchmarkAnalysis, technologyStack, inefficiencies, automationOpportunities

### Local Strategy Agent

- **Frameworks**: Geographic Cluster Analysis, Local SEO, Community Engagement
- **Focus**: Tailor strategy to specific geographic context
- **Special Rule**: Think HYPERLOCAL (not "use social media" but "sponsor neighborhood Facebook groups")
- **Output**: marketCharacteristics, localSEO, communityEngagement, partnerships

### Executive Advisor

- **Frameworks**: Decision Analysis, Strategic Trade-offs, Risk Assessment, 90-Day Planning
- **Focus**: Help business owners make hard choices and execute strategically
- **Special Rule**: Use Harvard case method (ask provocative questions, don't just tell what to do)
- **Output**: strategicDecisions, tradeoffs, riskAssessment, actionPlan (30/60/90 days)

### Shared Value Innovator

- **Frameworks**: Shared Value Creation (Porter & Kramer), CSR as Competitive Advantage
- **Focus**: Find win-win opportunities where business success and social benefit align
- **Special Rule**: NOT charity - strategic social impact with measurable ROI
- **Output**: communityNeeds, csrInitiatives, sustainabilityOpportunities, socialImpactPrograms

## Why This Architecture?

### Benefits

1. **Consistency**: All agents think like Porter, not generic AI
2. **Specialization**: Each agent masters one domain deeply
3. **Maintainability**: Update base prompt once, all agents improve
4. **Extensibility**: Add new agents by creating config only
5. **Quality Control**: Analytical standards enforced at framework level

### Trade-offs

- **Prompt Size**: Combined prompts are 1500-2000 tokens (worth it for quality)
- **Token Cost**: Higher input tokens per call (~$0.002 extra per analysis)
- **Rigidity**: Harder to make ad-hoc changes without affecting all agents

**Decision**: Quality and consistency > token efficiency

## Porter's Key Insights Embedded

From "Competitive Strategy" (1980) and "Competitive Advantage" (1985):

> "The essence of strategy is choosing what NOT to do."

> "Operational effectiveness is not strategy. It's necessary but not sufficient."

> "Competitive advantage comes from the fit among a company's activities."

> "Strategy is about being different. It means deliberately choosing a different set of activities to deliver a unique mix of value."

> "Trade-offs create the need for choice and protect against repositioners and straddlers."

All agents enforce these principles through the base prompt.

## Adding a New Agent

1. **Define the config** in `porter-base-prompt.ts`:

```typescript
export const PORTER_AGENT_CONFIGS = {
  // ... existing configs

  myNewAgent: {
    role: "My New Analyst",
    expertise: "specific domain expertise",
    focus: "what this agent analyzes specifically",
    frameworks: ["Porter Framework 1", "Porter Framework 2"],
    outputFormat: "JSON with fields: ...",
    specialInstructions: "Domain-specific rules...",
  },
};
```

2. **Create the orchestrator method**:

```typescript
private async runMyNewAgent() {
  const prompt = `Analyze this business: ${this.context.businessName}

  [Specific analysis instructions]

  Return JSON: {...}`;

  const response = await createChatCompletion({
    messages: [
      { role: "system", content: getPorterAgentSystemPrompt("myNewAgent") },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    jsonMode: true
  });

  return JSON.parse(response);
}
```

3. **Add to execution groups** in `runAllAgents()`:

```typescript
const group4 = await Promise.all([
  this.runAgent("my-new-agent"),
  // ... other group 4 agents
]);
```

The new agent automatically inherits Porter's methodology!

## Best Practices

### When Writing Agent Prompts (User Messages)

1. **Be Specific About Context**: Provide business name, industry, summary
2. **List Required Outputs**: Number each analysis dimension (1, 2, 3...)
3. **Show JSON Structure**: Example response format with all required fields
4. **Set Confidence Range**: Typical range for this agent's certainty level
5. **Avoid Redundancy**: Don't repeat what's in base prompt

### When Modifying Base Prompt

1. **Test All Agents**: Changes affect all 9 agents
2. **Maintain Principles**: Don't dilute Porter's core frameworks
3. **Add Examples**: Show good/bad analysis examples
4. **Version Control**: Comment when/why base prompt changed
5. **Measure Impact**: Track confidence scores before/after changes

### When Debugging Agent Output

1. **Check Base Prompt First**: Is the principle stated clearly?
2. **Check Agent Config**: Does specialization contradict base?
3. **Review User Prompt**: Are instructions clear and specific?
4. **Examine Temperature**: Too high = creative but inconsistent
5. **Analyze Confidence**: Low confidence = need more context

## Future Enhancements

### Potential Additions

- **Porter's Diamond Model** (national competitive advantage)
- **Activity System Maps** (visual representation of fit)
- **Strategic Group Mapping** (competitor positioning)
- **Cost Driver Analysis** (structural vs executional costs)
- **Buyer Value Chain** (how product fits customer activities)

### Architecture Improvements

- **Prompt Versioning**: Track base prompt changes over time
- **A/B Testing**: Compare base prompt variants
- **Agent Specialization Levels**: Junior/Senior analyst modes
- **Multi-Turn Conversations**: Agents ask clarifying questions
- **Cross-Agent Validation**: Agents review each other's work

---

## Summary

The Porter AI Methodology provides a **unified strategic thinking framework** that ensures all 9 agents analyze businesses through Michael Porter's lens. This constructor pattern creates:

- **Consistency**: Every agent thinks strategically, not generically
- **Rigor**: Analytical standards enforced at framework level
- **Specialization**: Each agent masters one Porter framework deeply
- **Quality**: Better insights than generic AI business advice
- **Scalability**: Easy to add new agents with guaranteed quality

The result: A multi-agent system that thinks like Porter, delivers specific recommendations, and creates actionable strategic insights for local businesses.
