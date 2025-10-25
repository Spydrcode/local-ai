# Harvard Business Intelligence Layer - Architecture Design

## Vision

Transform the existing Porter Intelligence Stack into a comprehensive **Harvard Business School-level strategic intelligence platform** for small businesses, powered by AI agents representing core MBA disciplines.

## Current State

✅ **Existing Foundation**:

- Porter Intelligence Stack (9 agents) - Competitive strategy analysis
- Economic Intelligence - Macro-economic trend analysis
- Vector storage optimization (Supabase/Pinecone)
- Agent orchestration framework

## Target Architecture

### 🎯 12-Agent Ecosystem (6 Layers)

```
┌─────────────────────────────────────────────────────────────┐
│           HARVARD BUSINESS INTELLIGENCE LAYER               │
└─────────────────────────────────────────────────────────────┘

LAYER 1: STRATEGY & POSITIONING
├── PorterAgent ✅ DONE - Five Forces, Value Chain, Generic Strategies
├── OsterwalderAgent 🔨 - Business Model Canvas, Value Proposition Canvas
└── SWOTAgent 🔨 - SWOT + TOWS + PESTEL integration

LAYER 2: INNOVATION & GROWTH
├── ChristensenAgent 🔨 - Disruptive Innovation, Jobs To Be Done
└── BlueOceanAgent 🔨 - Strategic Canvas, Uncontested Market Space

LAYER 3: EXECUTION & PERFORMANCE
├── KaplanNortonAgent 🔨 - Balanced Scorecard, OKRs
└── OperationalFlowAgent 🔨 - Lean Thinking, Theory of Constraints

LAYER 4: FINANCE & VALUATION
├── FinanceStrategyAgent 🔨 - Financial Modeling, Valuation, ROI
└── UnitEconomicsAgent 🔨 - LTV:CAC, Contribution Margin

LAYER 5: ORGANIZATION & LEADERSHIP
├── OrgDesignAgent 🔨 - Galbraith Star Model, Structure Optimization
└── LeadershipCoachAgent 🔨 - Leadership Development, Team Building

LAYER 6: MARKET EXECUTION
└── GTMPlannerAgent 🔨 - Go-To-Market Strategy, Distribution, Pricing
```

**Legend**: ✅ Complete | 🔨 To Build

---

## Implementation Strategy

### Phase 1: Core Strategy Agents (MVP)

**Timeline**: 2-3 weeks  
**Agents**: PorterAgent (✅), OsterwalderAgent, SWOTAgent, GTMPlannerAgent

**Deliverables**:

1. Business Model Canvas generator
2. SWOT/TOWS matrix with AI insights
3. Go-To-Market planner with distribution strategy
4. Unified Strategy Dashboard

**Database Schema**:

```sql
ALTER TABLE demos ADD COLUMN business_model_canvas JSONB;
ALTER TABLE demos ADD COLUMN swot_analysis JSONB;
ALTER TABLE demos ADD COLUMN gtm_strategy JSONB;
```

### Phase 2: Innovation & Performance

**Timeline**: 2 weeks  
**Agents**: ChristensenAgent, BlueOceanAgent, KaplanNortonAgent

**Deliverables**:

1. Disruption opportunity scanner
2. Blue Ocean strategic canvas
3. Balanced Scorecard with KPIs

### Phase 3: Finance & Operations

**Timeline**: 2-3 weeks  
**Agents**: FinanceStrategyAgent, UnitEconomicsAgent, OperationalFlowAgent

**Deliverables**:

1. 3-year financial model
2. Unit economics calculator
3. Process optimization recommendations

### Phase 4: Organization & Leadership

**Timeline**: 1-2 weeks  
**Agents**: OrgDesignAgent, LeadershipCoachAgent

**Deliverables**:

1. Organizational structure recommendations
2. Leadership development plans

### Phase 5: Knowledge Graph & Orchestration

**Timeline**: 3-4 weeks  
**Focus**: AI reasoning, cross-agent synthesis, adaptive coaching

---

## Technical Architecture

### Layer 1: Knowledge Layer

**Purpose**: Store and retrieve business knowledge  
**Technology**:

- Vector DB (Supabase pgvector + Pinecone)
- Embeddings (OpenAI ada-002)
- HBS case studies, frameworks, industry data

**Structure**:

```typescript
interface BusinessKnowledge {
  type: "framework" | "case_study" | "industry_data" | "best_practice";
  source: "HBS" | "McKinsey" | "BCG" | "Industry" | "Academic";
  framework: string; // e.g., "Five Forces", "BMC", "SWOT"
  content: string;
  metadata: {
    industry?: string;
    company_size?: string;
    applicability_score?: number;
  };
}
```

### Layer 2: Agent Layer

**Purpose**: Specialized AI agents for each discipline  
**Technology**: OpenAI GPT-4o with structured outputs

**Agent Interface**:

```typescript
interface HBSAgent {
  name: string;
  discipline:
    | "strategy"
    | "innovation"
    | "finance"
    | "operations"
    | "leadership"
    | "marketing";
  frameworks: string[]; // e.g., ["Five Forces", "Value Chain"]

  analyze(context: BusinessContext): Promise<AgentOutput>;
  validate(output: AgentOutput): boolean;
  getRecommendations(output: AgentOutput): Recommendation[];
}

interface BusinessContext {
  demoId: string;
  industry: string;
  businessSummary: string;
  competitorData?: any;
  financialData?: any;
  previousAnalyses?: {
    porter?: PorterAnalysis;
    economic?: EconomicIntelligence;
  };
}
```

### Layer 3: Orchestration Layer

**Purpose**: Coordinate agents and synthesize insights  
**Technology**: Custom orchestrator (can upgrade to LangGraph later)

**Flow**:

```
User Request → Context Builder → Agent Selector →
Parallel Execution → Cross-Agent Synthesis →
Dashboard Presentation → Vector Storage
```

**Orchestration Logic**:

```typescript
class HBSOrchestrator {
  async runStrategyAnalysis(demoId: string) {
    // Run in dependency order
    const porter = await this.agents.porter.analyze(context);
    const swot = await this.agents.swot.analyze({ ...context, porter });
    const bmc = await this.agents.osterwalder.analyze({
      ...context,
      porter,
      swot,
    });

    // Synthesize
    return this.synthesize([porter, swot, bmc]);
  }

  async runFullAnalysis(demoId: string) {
    // Run all 12 agents with intelligent dependency management
    // ...
  }
}
```

### Layer 4: Execution Layer

**Purpose**: User interface and visualization  
**Technology**: Next.js + React + Tailwind

**UI Components**:

1. **Strategy Map** - Visual representation of all analyses
2. **Business Model Canvas** - Interactive 9-box canvas
3. **SWOT Matrix** - Dynamic 4-quadrant with TOWS actions
4. **Blue Ocean Canvas** - Strategic curve comparison
5. **Balanced Scorecard** - 4-perspective KPI dashboard
6. **Financial Model** - 3-year projections with scenarios

### Layer 5: Learning Layer

**Purpose**: Adaptive AI coach with memory  
**Technology**: Claude-style reasoning + conversation memory

**Features**:

- Contextual recommendations based on all analyses
- Industry-specific insights from HBS case analogues
- Guided strategy workshops
- Implementation tracking

---

## Database Schema Design

### Core Tables

```sql
-- Extended demos table
ALTER TABLE demos ADD COLUMN hbs_intelligence JSONB;

-- New tables for comprehensive tracking
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id),
  agent_name TEXT NOT NULL,
  agent_layer TEXT, -- 'strategy', 'innovation', etc.
  input_context JSONB,
  output_result JSONB,
  execution_time_ms INTEGER,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE strategic_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id),
  insight_type TEXT, -- 'opportunity', 'threat', 'recommendation'
  source_agent TEXT,
  priority TEXT, -- 'critical', 'high', 'medium', 'low'
  insight_text TEXT,
  supporting_data JSONB,
  status TEXT DEFAULT 'active', -- 'active', 'implemented', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_id TEXT REFERENCES demos(id),
  metric_category TEXT, -- 'financial', 'operational', 'market', 'customer'
  metric_name TEXT,
  current_value NUMERIC,
  target_value NUMERIC,
  unit TEXT, -- '$', '%', 'count', etc.
  time_period TEXT,
  source_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Vector Storage Strategy

```typescript
// Vector metadata for HBS knowledge
interface HBSVectorMetadata extends EnhancedMetadata {
  analysisType: "hbs_framework";
  agentLayer:
    | "strategy"
    | "innovation"
    | "execution"
    | "finance"
    | "organization"
    | "market";
  agentName: string;
  frameworkName: string; // 'Five Forces', 'BMC', 'SWOT', etc.
  industrySpecific: boolean;
  caseStudyReference?: string;
}
```

---

## API Endpoints

### Strategy Layer

- `POST /api/hbs/business-model-canvas/[demoId]` - Generate BMC
- `POST /api/hbs/swot-analysis/[demoId]` - SWOT + TOWS + PESTEL
- `POST /api/hbs/gtm-strategy/[demoId]` - Go-To-Market plan

### Innovation Layer

- `POST /api/hbs/disruption-analysis/[demoId]` - Christensen framework
- `POST /api/hbs/blue-ocean/[demoId]` - Strategic canvas

### Execution Layer

- `POST /api/hbs/balanced-scorecard/[demoId]` - OKRs + KPIs
- `POST /api/hbs/operational-flow/[demoId]` - Lean analysis

### Finance Layer

- `POST /api/hbs/financial-model/[demoId]` - 3-year projections
- `POST /api/hbs/unit-economics/[demoId]` - LTV:CAC analysis

### Organization Layer

- `POST /api/hbs/org-design/[demoId]` - Structure recommendations
- `POST /api/hbs/leadership-coach/[demoId]` - Leadership plan

### Orchestration

- `POST /api/hbs/run-strategy-analysis/[demoId]` - Run Layer 1 agents
- `POST /api/hbs/run-full-analysis/[demoId]` - Run all 12 agents
- `GET /api/hbs/strategy-dashboard/[demoId]` - Unified insights

---

## File Structure

```
lib/agents/hbs/
├── core/
│   ├── HBSAgent.ts              # Base agent interface
│   ├── HBSOrchestrator.ts       # Multi-agent coordinator
│   └── HBSKnowledgeGraph.ts     # Framework knowledge store
├── strategy/
│   ├── PorterAgent.ts           # ✅ Existing
│   ├── OsterwalderAgent.ts      # Business Model Canvas
│   ├── SWOTAgent.ts             # SWOT/TOWS/PESTEL
│   └── index.ts
├── innovation/
│   ├── ChristensenAgent.ts      # Disruption/JTBD
│   ├── BlueOceanAgent.ts        # Strategic Canvas
│   └── index.ts
├── execution/
│   ├── KaplanNortonAgent.ts     # Balanced Scorecard
│   ├── OperationalFlowAgent.ts  # Lean/TOC
│   └── index.ts
├── finance/
│   ├── FinanceStrategyAgent.ts  # Valuation
│   ├── UnitEconomicsAgent.ts    # LTV:CAC
│   └── index.ts
├── organization/
│   ├── OrgDesignAgent.ts        # Galbraith model
│   ├── LeadershipCoachAgent.ts  # Leadership dev
│   └── index.ts
├── market/
│   ├── GTMPlannerAgent.ts       # Go-To-Market
│   └── index.ts
└── frameworks/
    ├── BusinessModelCanvas.ts
    ├── SWOTMatrix.ts
    ├── FiveForces.ts           # ✅ Existing
    ├── BlueOceanCanvas.ts
    ├── BalancedScorecard.ts
    └── index.ts

app/hbs/
├── dashboard/[demoId]/
│   └── page.tsx                # Unified HBS dashboard
├── business-model/[demoId]/
│   └── page.tsx                # BMC interactive canvas
├── swot/[demoId]/
│   └── page.tsx                # SWOT matrix
├── balanced-scorecard/[demoId]/
│   └── page.tsx                # OKRs/KPIs
└── financial-model/[demoId]/
    └── page.tsx                # 3-year projections

pages/api/hbs/
├── [agents as listed above]
└── orchestrator/
    ├── run-strategy.ts
    └── run-full-analysis.ts
```

---

## Integration Points

### With Existing Systems

1. **Porter Intelligence Stack**
   - PorterAgent becomes Layer 1 of HBS ecosystem
   - Cross-reference with SWOT, BMC, GTM agents
   - Synthesis includes competitive + strategic view

2. **Economic Intelligence**
   - Feed macro trends into FinanceStrategyAgent
   - Inform BlueOceanAgent opportunity scanning
   - Update Balanced Scorecard projections

3. **Vector Storage**
   - Extend metadata schema for HBS frameworks
   - Cross-agent retrieval for synthesis
   - Store case study analogues

### Data Flow Example

```
User: "Analyze my coffee shop business"

1. Context Building:
   - Fetch demo data (summary, industry, competitors)
   - Load previous analyses (Porter, Economic)

2. Agent Execution (Parallel):
   - PorterAgent → Five Forces analysis
   - SWOTAgent → Strengths, Weaknesses, Opportunities, Threats
   - OsterwalderAgent → Business Model Canvas

3. Cross-Agent Synthesis:
   - SWOT Opportunities ← Porter Weak Forces
   - BMC Value Prop ← Porter Differentiation
   - GTM Strategy ← SWOT + Porter + BMC

4. Output:
   - Unified Strategy Dashboard
   - Actionable recommendations prioritized
   - Implementation roadmap (90-day plan)
```

---

## Success Metrics

### Agent Quality

- ✅ Recommendation relevance score > 0.8
- ✅ Cross-agent consistency check
- ✅ Industry-specific accuracy validation

### User Impact

- ✅ Time to strategic clarity < 15 minutes
- ✅ Actionable insights per analysis > 10
- ✅ Implementation success tracking

### System Performance

- ✅ Full analysis completion < 2 minutes
- ✅ Agent execution time < 10 seconds each
- ✅ Vector retrieval < 100ms

---

## Next Steps (Immediate)

### Week 1-2: Foundation

1. ✅ Create HBSAgent base interface
2. ✅ Build HBSOrchestrator framework
3. ✅ Design database schema extensions
4. ✅ Create unified HBS dashboard skeleton

### Week 3-4: Phase 1 Agents

1. ✅ OsterwalderAgent (Business Model Canvas)
2. ✅ SWOTAgent (SWOT/TOWS/PESTEL)
3. ✅ GTMPlannerAgent (Go-To-Market)
4. ✅ Strategy Dashboard integration

### Week 5-6: Testing & Refinement

1. Test across 5+ industries
2. Validate cross-agent synthesis
3. User feedback iteration
4. Performance optimization

---

## Future Enhancements (Phase 5+)

### Knowledge Graph

- Semantic search across HBS case studies
- Industry-specific framework adaptation
- Competitor strategy pattern detection

### Adaptive Coach

- Conversational strategy advisor
- Implementation progress tracking
- Personalized learning paths

### Advanced Agents

- CaseStudyAgent - Harvard case analogues
- NegotiationAgent - Game theory models
- ChangeManagementAgent - Kotter's 8-Step
- SustainabilityAgent - ESG frameworks

---

## Resources Required

### Development

- **Time**: 8-12 weeks for full implementation
- **API Costs**: ~$50-100/month (OpenAI GPT-4o)
- **Database**: Existing Supabase (minor schema extensions)

### Knowledge Base

- HBS case study summaries
- Framework templates
- Industry benchmarks
- Best practice libraries

---

**Status**: Architecture Designed ✅  
**Next Action**: Begin Phase 1 implementation  
**Owner**: Development Team  
**Updated**: October 25, 2025
