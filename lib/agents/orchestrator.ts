/**
 * Porter Intelligence Stack - Agent Orchestrator
 *
 * Coordinates parallel execution of 9 specialized strategic analysis agents,
 * manages data flow, and synthesizes results into actionable insights.
 */

import { createChatCompletion } from "../openai";
import { generateEmbedding } from "../vector-utils";
import { VectorRepository } from "../repositories/vector-repository";
import { getPorterAgentSystemPrompt } from "./porter-base-prompt";

export interface AgentContext {
  demoId: string;
  businessName: string;
  websiteUrl: string;
  siteSummary?: string;
  industry?: string;
  enrichedData?: EnrichedBusinessData;
}

export interface EnrichedBusinessData {
  googleBusiness?: {
    rating: number;
    reviewCount: number;
    category: string;
    address: string;
    phone: string;
  };
  competitors?: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  demographics?: {
    population: number;
    medianIncome: number;
    ageDistribution: Record<string, number>;
  };
  industryBenchmarks?: {
    avgRevenue: number;
    avgMargin: number;
    growthRate: number;
  };
}

export interface AgentResult {
  agentName: string;
  status: "success" | "error" | "skipped";
  data?: any;
  error?: string;
  executionTime?: number;
  confidence?: number;
}

export interface OrchestratorResult {
  demoId: string;
  agents: AgentResult[];
  synthesis: StrategySynthesis;
  executionTime: number;
  timestamp: string;
}

export interface StrategySynthesis {
  strategicPriorities: string[];
  quickWins: ActionItem[];
  strategicInitiatives: ActionItem[];
  competitivePosition: string;
  keyInsights: string[];
  nextSteps: string[];
  estimatedImpact: {
    revenue: string;
    margin: string;
    timeline: string;
  };
}

export interface ActionItem {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  priority: number;
  timeline: string;
  category: string;
  estimatedROI?: string;
}

/**
 * Agent Orchestrator - Coordinates all 9 Porter Intelligence agents
 */
export class AgentOrchestrator {
  private context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  /**
   * Run a single agent by name
   */
  async runSingleAgent(agentName: string): Promise<AgentResult> {
    return await this.runAgent(agentName);
  }

  /**
   * Run all agents in parallel with intelligent orchestration
   */
  async runAllAgents(options?: {
    skipAgents?: string[];
    maxConcurrency?: number;
  }): Promise<OrchestratorResult> {
    const startTime = Date.now();

    // Define agent execution order and dependencies
    const agentGroups = [
      // Group 1: Data gathering agents (run first)
      ["strategy-architect", "market-forces"],

      // Group 2: Analysis agents (depend on Group 1)
      ["value-chain", "differentiation-designer", "profit-pool"],

      // Group 3: Optimization agents
      ["operational-effectiveness-optimizer", "local-strategy"],

      // Group 4: Advisory agents (run last)
      ["executive-advisor", "shared-value"],
    ];

    const results: AgentResult[] = [];

    // Execute agents in groups for optimal parallelization
    for (const group of agentGroups) {
      const groupResults = await Promise.all(
        group
          .filter((agent) => !options?.skipAgents?.includes(agent))
          .map((agent) => this.runAgent(agent))
      );
      results.push(...groupResults);
    }

    // Synthesize all results
    const synthesis = await this.synthesizeResults(results);

    // Store results in vector database for future reference
    await this.storeResults(results, synthesis);

    return {
      demoId: this.context.demoId,
      agents: results,
      synthesis,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run a single agent with error handling and timing
   */
  private async runAgent(agentName: string): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      let data: any;

      switch (agentName) {
        case "strategy-architect":
          data = await this.runStrategyArchitect();
          break;
        case "value-chain":
          data = await this.runValueChainAnalyst();
          break;
        case "market-forces":
          data = await this.runMarketForcesMonitor();
          break;
        case "differentiation-designer":
          data = await this.runDifferentiationDesigner();
          break;
        case "profit-pool":
          data = await this.runProfitPoolMapper();
          break;
        case "operational-effectiveness-optimizer":
          data = await this.runOperationalEffectivenessOptimizer();
          break;
        case "local-strategy":
          data = await this.runLocalStrategyAgent();
          break;
        case "executive-advisor":
          data = await this.runExecutiveAdvisor();
          break;
        case "shared-value":
          data = await this.runSharedValueInnovator();
          break;
        default:
          throw new Error(`Unknown agent: ${agentName}`);
      }

      return {
        agentName,
        status: "success",
        data,
        executionTime: Date.now() - startTime,
        confidence: data.confidence || 0.85,
      };
    } catch (error) {
      console.error(`Agent ${agentName} failed:`, error);
      return {
        agentName,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Strategy Architect Agent
   * Runs Five Forces and recommends overall generic strategy
   */
  private async runStrategyArchitect() {
    const prompt = `Analyze this SPECIFIC business using Porter's Five Forces and recommend a defensible generic strategy.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW - DO NOT USE EXAMPLES AS TEMPLATES**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Website: ${this.context.websiteUrl}
Industry: ${this.context.industry || "Unknown"}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary || "Limited information available - make conservative estimates"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY REQUIREMENTS**:
✓ Extract the ACTUAL business type from the intelligence above (e.g., if it says "propane delivery", analyze propane - NOT BBQ or any other industry)
✓ Reference THEIR actual products/services by name from the context
✓ Reference THEIR specific target customers from the context
✓ Reference THEIR unique differentiators from the context
✓ Infer THEIR competitors based on industry and location mentioned above
✓ Analyze THEIR geographic market as described above

❌ DO NOT analyze BBQ, restaurants, coffee shops, or any industry NOT mentioned in the business intelligence
❌ DO NOT copy patterns from the examples below - they are formatting guides only

**FORMAT EXAMPLES (DO NOT COPY CONTENT - ONLY STRUCTURE)**:

GOOD specificity (propane example): "Threat of new entrants is MEDIUM because propane delivery requires DOT-certified trucks ($50K+ each) and EPA licensing, creating capital barriers. However, THIS BUSINESS's 27-year reputation and 4-hour emergency response average (vs 24-48hr industry standard) create switching costs that new entrants can't replicate overnight."

BAD genericity: "Threat of new entrants varies by industry depending on capital requirements and barriers to entry."

**For each force, you MUST**:
1. Name the force with THIS business in mind
2. Assess threat level (high/medium/low)
3. Provide rationale using SPECIFIC details from the business context
4. Reference actual competitors, suppliers, buyers, or substitutes when possible

**For your recommended strategy**:
- Don't just pick "differentiation" - explain WHY based on their actual activities
- Identify SPECIFIC trade-offs they must make (not generic ones)
- Name 3 priorities that reference their actual products/services/markets

Return as JSON with structure:
{
  "fiveForces": {
    "threatOfNewEntrants": { 
      "level": "high/medium/low", 
      "rationale": "SPECIFIC analysis referencing THIS business's barriers, brand, capital requirements, etc."
    },
    "bargainingPowerSuppliers": { 
      "level": "high/medium/low", 
      "rationale": "SPECIFIC analysis of THIS business's supplier relationships and dependencies"
    },
    "bargainingPowerBuyers": { 
      "level": "high/medium/low", 
      "rationale": "SPECIFIC analysis of THIS business's customer segments and their switching costs"
    },
    "threatOfSubstitutes": { 
      "level": "high/medium/low", 
      "rationale": "SPECIFIC alternatives to THIS business's offerings"
    },
    "competitiveRivalry": { 
      "level": "high/medium/low", 
      "rationale": "SPECIFIC competitors and THIS business's competitive advantages"
    }
  },
  "recommendedStrategy": "differentiation" | "cost_leadership" | "focus",
  "strategyRationale": "Why THIS strategy fits THIS business's activities and market position",
  "tradeoffs": [
    "SPECIFIC thing they must give up #1",
    "SPECIFIC thing they must give up #2", 
    "SPECIFIC thing they must give up #3"
  ],
  "competitivePosition": "strong/moderate/weak",
  "strategicPriorities": [
    "SPECIFIC priority #1 naming actual products/services/markets",
    "SPECIFIC priority #2 naming actual products/services/markets",
    "SPECIFIC priority #3 naming actual products/services/markets"
  ],
  "confidence": 0.85
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("strategyArchitect"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Value Chain Analyst Agent
   * Identifies primary/support activities and optimization opportunities
   */
  private async runValueChainAnalyst() {
    const prompt = `Map the value chain for THIS SPECIFIC business and identify where competitive advantage comes from.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW - DO NOT USE EXAMPLES AS TEMPLATES**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Industry: ${this.context.industry || "Unknown"}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary || "Limited information available"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY REQUIREMENTS**:
✓ Identify the ACTUAL industry from the intelligence above (if it mentions "propane", analyze propane value chain - NOT food service or any other)
✓ Break down the ACTUAL activities THIS specific business performs based on the context
✓ Use details from the business intelligence to describe their processes
✓ Identify realistic cost/value drivers for THEIR specific industry type

❌ DO NOT analyze BBQ, food service, retail, or any industry NOT mentioned in the business intelligence
❌ DO NOT copy the example content below - examples are for format structure only

**FORMAT EXAMPLE (STRUCTURE ONLY - NOT CONTENT TO COPY)**:

GOOD specificity: "Inbound Logistics: THIS BUSINESS receives bulk propane from regional terminals (estimated 5,000-gallon weekly deliveries), maintains 4 retail locations with 20lb tank inventory (200+ tanks per location restocked 2x/week based on standard propane exchange volumes). COST DRIVER: Wholesale propane prices fluctuate 15-20% seasonally. COMPETITIVE ADVANTAGE: Their 4 retail locations create inventory distribution that enables 4-hour emergency response vs competitors using central depot only."

BAD genericity: "Inbound Logistics: Receive materials from suppliers. COST DRIVER: Material costs. OPPORTUNITY: Improve procurement."

**For each activity, you MUST**:
1. Describe what THIS business actually does (use details from business intelligence)
2. Identify the specific cost driver (what makes this activity expensive?)
3. Identify the specific value driver (what makes this valuable to customers?)
4. Note if this activity creates competitive advantage vs competitors

Map out:
**Primary Activities**:
- Inbound Logistics: What they receive, from where, how often
- Operations: How they transform inputs to outputs (be specific about processes)
- Outbound Logistics: How they deliver to customers (methods, timing, coverage)
- Marketing & Sales: How they attract and convert buyers (channels, tactics)
- Service: Post-purchase support (warranties, follow-up, maintenance)

**Support Activities**:
- Firm Infrastructure: Management, systems, processes
- HR Management: Team size, expertise, training
- Technology: Tools, systems, automation level
- Procurement: How they source materials/services

Return JSON:
{
  "primaryActivities": {
    "inboundLogistics": { 
      "current": "SPECIFIC description of what THIS business does", 
      "costDriver": "What makes this expensive for THEM", 
      "valueDriver": "What value this creates for THEIR customers",
      "competitiveAdvantage": true/false
    },
    "operations": { "current": "...", "costDriver": "...", "valueDriver": "...", "competitiveAdvantage": true/false },
    "outboundLogistics": { "current": "...", "costDriver": "...", "valueDriver": "...", "competitiveAdvantage": true/false },
    "marketingSales": { "current": "...", "costDriver": "...", "valueDriver": "...", "competitiveAdvantage": true/false },
    "service": { "current": "...", "costDriver": "...", "valueDriver": "...", "competitiveAdvantage": true/false }
  },
  "supportActivities": {
    "infrastructure": { "current": "SPECIFIC description", "improvement": "SPECIFIC opportunity" },
    "hrManagement": { "current": "...", "improvement": "..." },
    "technology": { "current": "...", "improvement": "..." },
    "procurement": { "current": "...", "improvement": "..." }
  },
  "competitiveAdvantages": [
    "SPECIFIC activity-based advantage #1",
    "SPECIFIC activity-based advantage #2"
  ],
  "quickWins": [
    "SPECIFIC quick win #1 that improves a specific activity",
    "SPECIFIC quick win #2 that improves a specific activity"
  ],
  "confidence": 0.82
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("valueChainAnalyst"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Market Forces Monitor Agent
   * Real-time competitor tracking and market dynamics
   */
  private async runMarketForcesMonitor() {
    const prompt = `Analyze the competitive landscape and market dynamics for THIS SPECIFIC business.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW - DO NOT USE EXAMPLES AS TEMPLATES**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Industry: ${this.context.industry || "Unknown"}
Website: ${this.context.websiteUrl}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary || "Limited information available"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY REQUIREMENTS**:
✓ Extract the ACTUAL industry and location from the intelligence above
✓ Identify REAL competitors based on their industry + location (if analyzing propane in Phoenix, identify Phoenix propane competitors - NOT BBQ or other industries)
✓ Describe SPECIFIC market trends affecting THEIR industry type
✓ Identify realistic demand drivers for THEIR specific business model

❌ DO NOT identify competitors from BBQ, food service, or any industry NOT mentioned above
❌ DO NOT copy example content - examples show format only

**COMPETITOR IDENTIFICATION GUIDE**:
- Extract industry from business intelligence (e.g., "propane delivery" → analyze propane market)
- Extract location from business intelligence (e.g., "Phoenix East Valley" → focus on Phoenix area competitors)
- Research standard competitors for that industry+location combination
- Example: "propane delivery in Phoenix" → Suburban Propane, AmeriGas, Ferrellgas, local independent providers
- Example: "emergency HVAC in Denver" → One Hour Heating & Air Conditioning, Plumbline Services, Brothers Plumbing Heating and Electric

**MARKET TRENDS - BE SPECIFIC TO THEIR INDUSTRY**:
GOOD: "Residential propane demand in Southwest grew 12% in 2024 due to natural gas pipeline constraints and new construction in exurban areas"
BAD: "Growing demand in the market"

GOOD: "Emergency propane delivery becoming critical differentiator as extreme weather events increase - 2024 Phoenix freeze event created 3-day backlog at major suppliers"
BAD: "Service quality is important"

Return JSON:
{
  "competitors": [
    { 
      "name": "ACTUAL or inferred competitor name", 
      "threatLevel": "high/medium/low", 
      "differentiators": "What makes them different from our business",
      "weaknesses": "Where our business beats them"
    }
  ],
  "marketTrends": {
    "demand": "growing/stable/declining",
    "trend": "SPECIFIC trend description affecting THIS business",
    "impact": "high/medium/low",
    "timeline": "When this trend is hitting (now/6-12 months/longer-term)"
  },
  "demandDrivers": [
    "SPECIFIC driver #1 affecting THIS business type",
    "SPECIFIC driver #2 affecting THIS business type"
  ],
  "opportunities": [
    "SPECIFIC opportunity based on competitive gaps",
    "SPECIFIC opportunity based on market trends"
  ],
  "confidence": 0.75
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("marketForcesAnalyst"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1200,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Differentiation Designer Agent
   * Creates unique positioning and messaging frameworks
   */
  private async runDifferentiationDesigner() {
    const prompt = `Design unique positioning and differentiation strategy for THIS SPECIFIC business.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW - DO NOT USE EXAMPLES AS TEMPLATES**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Industry: ${this.context.industry || "Unknown"}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary || "Limited information available"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY REQUIREMENTS**:
✓ Extract ACTUAL industry type from intelligence above (if it says "propane service", create positioning for propane - NOT food service)
✓ Use THEIR actual credentials, years in business, or specializations mentioned above
✓ Reference THEIR actual target customers from the context
✓ Build positioning from THEIR unique methods or differentiators described above
✓ Create premium features by upgrading THEIR current services (not random add-ons)

❌ DO NOT create positioning for BBQ, restaurants, or any industry NOT mentioned in the intelligence
❌ DO NOT copy example content - use only as format guide

**POSITIONING FORMULA (USE THEIR ACTUAL DETAILS)**:
"For [THEIR specific target from business intel] who [THEIR specific need based on services] [Business Name] is the [THEIR specific category] that [THEIR unique benefit from differentiators] unlike [realistic alternative in THEIR industry] because [THEIR proof from credentials/years/methods]."

GOOD example structure: "For homeowners with propane appliances who need reliable fuel supply, Phoenix Propane is the 24/7 emergency delivery service that guarantees 4-hour response unlike big corporate suppliers (Suburban Propane, AmeriGas) because we're family-owned with 27 years serving only East Valley, allowing faster localized service."

BAD (generic): "For customers who value quality, we are the company that provides excellent service unlike competitors because we care."

**For Premium Features**:
Don't invent random add-ons. Look at their ACTUAL offerings and identify what could justify 20-50% higher prices:
- Current services that could be upgraded
- Expertise that could be packaged differently
- Speed/convenience that has value
- Customization that commands premium

Design:
1. Unique Value Proposition based on THEIR differentiators
2. Positioning Statement using actual details
3. Messaging Framework with proof points from business intel
4. Premium Features derived from current offerings
5. Brand Personality based on how they actually communicate

Return JSON:
{
  "valueProposition": "SPECIFIC value prop using actual business details",
  "positioningStatement": "For [target] who [need], [business] is [category] that [benefit] unlike [alternative] because [proof]",
  "messagingFramework": {
    "primary": "Main differentiation claim using THEIR unique attributes",
    "secondary": [
      "Supporting claim #1 from business intel",
      "Supporting claim #2 from business intel"
    ],
    "proofPoints": [
      "SPECIFIC proof from credentials/awards/years/methods",
      "SPECIFIC proof from customer results/testimonials"
    ]
  },
  "premiumFeatures": [
    { 
      "feature": "SPECIFIC premium offering based on current services", 
      "justification": "Why customers would pay more for THIS", 
      "priceImpact": "Estimated price increase (e.g., +$500, +25%)"
    }
  ],
  "brandPersonality": [
    "Attribute from how they actually communicate",
    "Attribute from their tone/voice",
    "Attribute from their positioning"
  ],
  "confidence": 0.80
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("differentiationDesigner"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 1200,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Profit Pool Mapper Agent
   * Identifies high-margin segments and product mix opportunities
   */
  private async runProfitPoolMapper() {
    const prompt = `Map profit pools and identify high-margin opportunities for THIS SPECIFIC business.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW - DO NOT USE EXAMPLES AS TEMPLATES**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Industry: ${this.context.industry || "Unknown"}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary || "Limited information available"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**MANDATORY REQUIREMENTS**:
✓ Extract the ACTUAL products/services from the intelligence above (if it mentions "propane delivery + tank exchange", analyze THOSE offerings - NOT food products or other industries)
✓ Estimate margins based on THEIR specific industry economics (propane margins differ from food service margins)
✓ Identify realistic competitors in THEIR industry for pricing comparison
✓ Recommend new offerings that fit THEIR operational capabilities

❌ DO NOT analyze BBQ platters, food products, or any offerings NOT mentioned in the intelligence
❌ DO NOT copy example content - use only as format guide

**INDUSTRY-SPECIFIC MARGIN GUIDANCE**:
- Propane delivery: Bulk delivery typically 15-25% margin, emergency service 30-40%, tank exchange 25-35%
- Food service: Raw ingredients 35-45% margin, prepared meals 60-70%, catering services 50-60%
- Professional services: Hourly consulting 40-60%, retainer packages 50-70%, emergency work 60-80%

GOOD specificity example: "Current Mix: (1) Same-day propane delivery - MEDIUM margin (22%), HIGH volume (60% of revenue), competitive necessity. (2) 24/7 emergency delivery - HIGH margin (38%), LOW volume (15% of revenue), premium positioning. (3) Tank exchange at retail locations - MEDIUM margin (28%), MEDIUM volume (25% of revenue), convenient add-on.

High-Margin Opportunity: Emergency delivery is underutilized. THIS BUSINESS averages 4-hour response vs competitors' 24-48 hours. Could charge $75-100 emergency fee (vs current $50) by marketing the speed advantage to homeowners with pool heaters or backup generators."

BAD (generic): "Various products with different margins. Premium services could increase revenue."

**Use 2x2 Matrix Classification**:
- Stars (high margin, high volume): Protect and grow
- Cash Cows (high margin, low volume): Grow volume if possible
- Question Marks (low margin, high volume): Improve margin or exit
- Dogs (low margin, low volume): Drop or drastically improve

Map the profit pool:
1. List ACTUAL products/services from business intelligence
2. Estimate margin for each (high 40%+, medium 20-40%, low <20%)
3. Estimate volume contribution (high >40% revenue, medium 15-40%, low <15%)
4. Identify where competitors are making money in this industry
5. Find segments where THIS business could capture more value

Return JSON:
{
  "currentMix": [
    { 
      "offering": "ACTUAL product/service name from business intel", 
      "margin": "high/medium/low", 
      "volume": "high/medium/low",
      "classification": "star/cash_cow/question_mark/dog",
      "reasoning": "Why this margin/volume assessment"
    }
  ],
  "highMarginOpportunities": [
    { 
      "segment": "SPECIFIC customer segment or product category", 
      "rationale": "Why THIS business can capture value here vs competitors", 
      "estimatedMargin": "Specific % or $ amount",
      "implementation": "How to capture this opportunity"
    }
  ],
  "productMixRecommendations": {
    "grow": ["SPECIFIC offering to invest in and why"],
    "maintain": ["SPECIFIC offering to keep steady"],
    "shrink": ["SPECIFIC offering to de-emphasize and why"],
    "add": ["SPECIFIC new offering based on market gaps"]
  },
  "pricingStrategy": "value-based/competitive/cost-plus and WHY for THIS business",
  "revenueImpact": "Estimated impact of recommendations (e.g., '$50K additional annual revenue', '15% margin improvement')",
  "confidence": 0.78
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("profitPoolMapper"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1200,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Operational Effectiveness Optimizer Agent
   * Benchmarks operations and proposes efficiency gains
   */
  private async runOperationalEffectivenessOptimizer() {
    const prompt = `You are the Operational Effectiveness Optimizer.

Business: ${this.context.businessName}

Optimize operations:
1. Operational Benchmark vs. Industry Best Practices
2. Technology Stack Assessment (what tools/systems they need)
3. Process Inefficiencies (manual tasks, bottlenecks)
4. Automation Opportunities
5. Cost Reduction Initiatives

Return JSON:
{
  "benchmarkAnalysis": {
    "currentState": "below/at/above industry standard",
    "gaps": ["...", "..."]
  },
  "technologyStack": {
    "current": ["...", "..."],
    "recommended": [
      { "tool": "...", "purpose": "...", "estimatedROI": "..." }
    ]
  },
  "inefficiencies": [
    { "process": "...", "impact": "high/medium/low", "solution": "..." }
  ],
  "automationOpportunities": [
    { "task": "...", "tool": "...", "timeSavings": "...", "costSavings": "..." }
  ],
  "costReductionInitiatives": ["...", "..."],
  "confidence": 0.80
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("operationsOptimizer"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Local Strategy Agent
   * Adapts all outputs for hyperlocal context
   */
  private async runLocalStrategyAgent() {
    const prompt = `You are the Local Strategy Agent specializing in hyperlocal tactics.

Business: ${this.context.businessName}
Location: ${this.context.enrichedData?.googleBusiness?.address || "Unknown"}

Develop hyperlocal strategy:
1. Local Market Characteristics (demographics, competition density)
2. Hyperlocal SEO Tactics (Google Business, local keywords)
3. Community Engagement Opportunities
4. Local Partnership Ideas
5. Geographic Expansion Opportunities

Return JSON:
{
  "marketCharacteristics": {
    "population": "...",
    "competitionDensity": "high/medium/low",
    "opportunityAreas": ["...", "..."]
  },
  "localSEO": {
    "currentOptimization": "strong/moderate/weak",
    "tactics": ["...", "..."],
    "keywords": ["...", "..."]
  },
  "communityEngagement": [
    { "opportunity": "...", "impact": "high/medium/low", "cost": "..." }
  ],
  "partnerships": [
    { "partner": "...", "benefit": "...", "approachStrategy": "..." }
  ],
  "expansionOpportunities": ["...", "..."],
  "confidence": 0.82
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("localStrategyAgent"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1200,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Executive Advisor Agent
   * Conversational guidance through decision trade-offs
   */
  private async runExecutiveAdvisor() {
    const prompt = `You are an Executive Advisor trained in HBS case methodology.

Business: ${this.context.businessName}

Provide executive coaching:
1. Decision Framework (key decisions the owner faces)
2. Trade-off Analysis (what must be sacrificed for growth)
3. Risk Assessment (biggest risks to the business)
4. Next-Step Action Plan (30/60/90 day roadmap)
5. Coaching Questions (thought-provoking questions for the owner)

Return JSON:
{
  "keyDecisions": [
    { "decision": "...", "options": ["...", "..."], "recommendation": "..." }
  ],
  "tradeoffs": {
    "growth": { "gains": ["...", "..."], "sacrifices": ["...", "..."] },
    "quality": { "gains": ["...", "..."], "sacrifices": ["...", "..."] }
  },
  "riskAssessment": [
    { "risk": "...", "probability": "high/medium/low", "impact": "high/medium/low", "mitigation": "..." }
  ],
  "actionPlan": {
    "30days": ["...", "..."],
    "60days": ["...", "..."],
    "90days": ["...", "..."]
  },
  "coachingQuestions": ["...", "...", "..."],
  "confidence": 0.85
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("executiveAdvisor"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      maxTokens: 1500,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Shared Value Innovator Agent
   * Finds CSR/Community opportunities that strengthen brand
   */
  private async runSharedValueInnovator() {
    const prompt = `You are the Shared Value Innovator finding win-win social impact opportunities.

Business: ${this.context.businessName}

Identify shared value opportunities:
1. Community Needs that align with business capabilities
2. CSR Initiatives that create competitive advantage
3. Sustainability Opportunities that reduce costs
4. Social Impact Programs that drive customer loyalty
5. Cause Marketing Ideas

Return JSON:
{
  "communityNeeds": [
    { "need": "...", "businessCapability": "...", "alignmentScore": "high/medium/low" }
  ],
  "csrInitiatives": [
    { "initiative": "...", "competitiveAdvantage": "...", "implementation": "..." }
  ],
  "sustainabilityOpportunities": [
    { "opportunity": "...", "environmentalImpact": "...", "costSavings": "...", "timeline": "..." }
  ],
  "socialImpactPrograms": [
    { "program": "...", "customerAppeal": "...", "brandBenefit": "..." }
  ],
  "causeMarketing": [
    { "cause": "...", "campaign": "...", "expectedImpact": "..." }
  ],
  "confidence": 0.75
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content: getPorterAgentSystemPrompt("sharedValueInnovator"),
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      maxTokens: 1200,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Strategy Synthesizer
   * Consolidates all agent outputs into prioritized action plan
   */
  private async synthesizeResults(
    results: AgentResult[]
  ): Promise<StrategySynthesis> {
    const successfulResults = results.filter((r) => r.status === "success");

    // Extract key insights from all agents
    const allData = successfulResults.map((r) => ({
      agent: r.agentName,
      data: r.data,
    }));

    const synthesisPrompt = `You are the Strategy Synthesizer consolidating outputs from 9 Porter Intelligence agents.

Agent Results:
${JSON.stringify(allData, null, 2)}

Synthesize into:
1. Top 3-5 Strategic Priorities (ranked by impact)
2. Quick Wins (high impact, low effort, <30 days)
3. Strategic Initiatives (high impact, higher effort, 90+ days)
4. Overall Competitive Position
5. Key Insights (cross-cutting themes)
6. Next Steps (actionable, sequenced)
7. Estimated Impact (revenue, margin, timeline)

Return JSON:
{
  "strategicPriorities": ["priority 1", "priority 2", "priority 3"],
  "quickWins": [
    {
      "title": "...",
      "description": "...",
      "impact": "high/medium/low",
      "effort": "high/medium/low",
      "priority": 1,
      "timeline": "2-4 weeks",
      "category": "operations",
      "estimatedROI": "20%"
    }
  ],
  "strategicInitiatives": [
    {
      "title": "...",
      "description": "...",
      "impact": "high",
      "effort": "high/medium",
      "priority": 1,
      "timeline": "3-6 months",
      "category": "strategy"
    }
  ],
  "competitivePosition": "strong/moderate/weak - explanation",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "nextSteps": ["step 1", "step 2", "step 3"],
  "estimatedImpact": {
    "revenue": "+15-25% within 12 months",
    "margin": "+5-10% through efficiency gains",
    "timeline": "90-180 days to full implementation"
  }
}`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a master strategist synthesizing multiple analyses into a cohesive action plan.",
        },
        { role: "user", content: synthesisPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
    });

    return JSON.parse(response);
  }

  /**
   * Store all results in vector database for future retrieval
   */
  private async storeResults(
    results: AgentResult[],
    synthesis: StrategySynthesis
  ) {
    const vectorRepo = new VectorRepository(process.env.VECTOR_PROVIDER as 'supabase' | 'pinecone');
    const vectors = [];

    // Store each agent result as a vector
    for (const result of results) {
      if (result.status === "success" && result.data) {
        const content = `${result.agentName}: ${JSON.stringify(result.data)}`;
        const embedding = await generateEmbedding(content);

        vectors.push({
          id: `${this.context.demoId}-agent-${result.agentName}`,
          values: embedding,
          metadata: {
            demoId: this.context.demoId,
            analysisType: "strategic",
            category: "strategic",
            agentName: result.agentName,
            confidence: result.confidence || 0.85,
            timestamp: new Date().toISOString(),
            tags: ["porter-intelligence", result.agentName],
          },
        });
      }
    }

    // Store synthesis
    const synthesisContent = `Strategy Synthesis: ${JSON.stringify(synthesis)}`;
    const synthesisEmbedding = await generateEmbedding(synthesisContent);

    vectors.push({
      id: `${this.context.demoId}-synthesis`,
      values: synthesisEmbedding,
      metadata: {
        demoId: this.context.demoId,
        analysisType: "strategic",
        category: "strategic",
        agentName: "synthesizer",
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        tags: ["porter-intelligence", "synthesis", "action-plan"],
      },
    });

    try {
      await vectorRepo.provider.upsert(vectors);
    } catch (error) {
      console.error('Error storing vectors:', error);
    }
  }
}

/**
 * Convenience function to run orchestrator
 */
export async function runPorterIntelligenceStack(
  context: AgentContext,
  options?: { skipAgents?: string[] }
): Promise<OrchestratorResult> {
  const orchestrator = new AgentOrchestrator(context);
  return await orchestrator.runAllAgents(options);
}

/**
 * Convenience function to run a single agent
 */
export async function runSinglePorterAgent(
  context: AgentContext,
  agentName: string
): Promise<AgentResult> {
  const orchestrator = new AgentOrchestrator(context);
  return await orchestrator.runSingleAgent(agentName);
}
