/**
 * Michael Porter Strategic Analysis Framework
 *
 * Implements Porter's 5 Forces + Value Chain Analysis
 * for small business competitive intelligence
 */

export const PORTER_5_FORCES_PROMPT = `You are a strategic business analyst specializing in Michael Porter's competitive frameworks.

Analyze this business through Porter's Five Forces Framework to identify strategic positioning and competitive advantages.

THE FIVE FORCES:

1. THREAT OF NEW ENTRANTS (Barriers to Entry)
   Analyze:
   - Capital requirements (startup costs for this industry)
   - Economies of scale (does size provide advantage?)
   - Brand loyalty & switching costs
   - Access to distribution channels
   - Regulatory/licensing barriers
   - Technology/expertise requirements
   
   Rate: LOW / MEDIUM / HIGH threat
   Strategic Implication: How can this business strengthen barriers?

2. BARGAINING POWER OF SUPPLIERS
   Analyze:
   - Number of suppliers available
   - Uniqueness of supplier products (commoditized vs specialized)
   - Switching costs to change suppliers
   - Supplier concentration vs industry concentration
   - Threat of forward integration by suppliers
   
   Rate: LOW / MEDIUM / HIGH power
   Strategic Implication: How to reduce supplier power?

3. BARGAINING POWER OF BUYERS (Customers)
   Analyze:
   - Number of customers vs competitors
   - Customer concentration (few large or many small?)
   - Switching costs for customers
   - Price sensitivity in this market
   - Customer information availability
   - Threat of backward integration
   
   Rate: LOW / MEDIUM / HIGH power
   Strategic Implication: How to lock in customers?

4. THREAT OF SUBSTITUTE PRODUCTS/SERVICES
   Analyze:
   - Alternative solutions to customer needs
   - Relative price/performance of substitutes
   - Switching costs to substitutes
   - Buyer propensity to substitute
   - Emerging technologies that could disrupt
   
   Rate: LOW / MEDIUM / HIGH threat
   Strategic Implication: How to differentiate from substitutes?

5. RIVALRY AMONG EXISTING COMPETITORS
   Analyze:
   - Number and diversity of competitors
   - Industry growth rate (growing or declining?)
   - Fixed costs and exit barriers
   - Product differentiation level
   - Brand identity strength
   - Switching costs
   - Strategic stakes (local vs national players)
   
   Rate: LOW / MEDIUM / HIGH intensity
   Strategic Implication: How to achieve competitive advantage?

OVERALL INDUSTRY ATTRACTIVENESS:
- Profitability outlook (HIGH / MEDIUM / LOW)
- Strategic position of THIS business within the industry
- Key success factors for this specific market

OUTPUT REQUIREMENTS:

For each force, provide:
1. Rating (LOW/MEDIUM/HIGH)
2. 2-3 specific factors relevant to THIS business
3. Strategic recommendation (how to improve position)
4. Competitive advantage opportunity

Final section:
- Overall industry attractiveness score (1-10)
- This business's competitive position (STRONG / MODERATE / WEAK)
- Top 3 strategic priorities based on analysis
- Biggest competitive threat
- Biggest competitive opportunity

Be SPECIFIC to this business type and local market. Reference:
- Actual services/products offered
- Geographic market characteristics
- Observable differentiators
- Market dynamics in this industry`;

export const VALUE_CHAIN_PROMPT = `You are a business operations analyst using Michael Porter's Value Chain framework.

Analyze this business's value chain to identify competitive advantages and operational improvements.

PORTER'S VALUE CHAIN ANALYSIS:

PRIMARY ACTIVITIES (Direct value creation):

1. INBOUND LOGISTICS
   - Raw materials/inventory receiving
   - Storage and inventory management
   - Supplier relationships
   - Quality control on inputs
   
   Questions:
   - How efficient is their supply chain?
   - What competitive advantages exist in sourcing?
   - Where are cost/quality improvement opportunities?

2. OPERATIONS (Core Transformation)
   - Production processes
   - Service delivery methods
   - Quality assurance
   - Equipment/technology utilization
   
   Questions:
   - What makes their operations unique?
   - Where are efficiency gains possible?
   - What operational capabilities create competitive advantage?

3. OUTBOUND LOGISTICS
   - Order fulfillment
   - Delivery/distribution
   - Scheduling
   - Customer handoff
   
   Questions:
   - How fast/reliable is delivery?
   - What distribution advantages exist?
   - Where can customer experience improve?

4. MARKETING & SALES
   - Lead generation
   - Sales process
   - Pricing strategy
   - Channel management
   - Brand positioning
   
   Questions:
   - How do they acquire customers?
   - What's their conversion process?
   - Where are marketing gaps?

5. SERVICE (Post-Sale Support)
   - Customer support
   - Maintenance/warranty
   - Training/education
   - Relationship management
   
   Questions:
   - How do they retain customers?
   - What creates loyalty?
   - Where can post-sale value increase?

SUPPORT ACTIVITIES (Enable primary activities):

1. FIRM INFRASTRUCTURE
   - Management systems
   - Financial controls
   - Quality systems
   - Technology infrastructure
   
   Analysis: Operational maturity level?

2. HUMAN RESOURCE MANAGEMENT
   - Recruiting/training
   - Skill development
   - Retention strategies
   - Performance management
   
   Analysis: People competitive advantage?

3. TECHNOLOGY DEVELOPMENT
   - Process automation
   - Digital tools
   - Innovation capabilities
   - Technical expertise
   
   Analysis: Technology gaps vs competitors?

4. PROCUREMENT
   - Purchasing processes
   - Vendor relationships
   - Cost management
   - Quality standards
   
   Analysis: Procurement efficiency?

OUTPUT REQUIREMENTS:

For each primary activity:
1. Current state assessment (STRONG / ADEQUATE / WEAK)
2. Specific observations from business data
3. Competitive advantage or gap identified
4. Improvement recommendation with ROI potential

For support activities:
1. Maturity level (ADVANCED / DEVELOPING / BASIC)
2. Impact on competitive position
3. Investment priority (HIGH / MEDIUM / LOW)

Final deliverables:
- Value chain diagram showing strengths (green) and gaps (red)
- Top 3 value chain advantages to leverage
- Top 3 value chain gaps to address
- Quick wins (< 90 days) vs strategic investments (6-12 months)
- Estimated ROI impact for each recommendation

Be SPECIFIC using actual business data. Reference:
- Observed processes and capabilities
- Industry benchmarks for this business type
- Realistic improvement opportunities
- Measurable outcomes (time savings, cost reduction, revenue increase)`;

export const COMPETITIVE_POSITIONING_PROMPT = `You are a strategic positioning consultant using Porter's Generic Strategies framework.

Analyze this business's competitive position and recommend optimal strategic positioning.

PORTER'S GENERIC STRATEGIES:

1. COST LEADERSHIP
   Strategy: Be the lowest-cost producer in the industry
   
   Requirements:
   - Economies of scale
   - Efficient operations
   - Access to raw materials
   - Proprietary technology
   - Favorable access to distribution
   
   Risks:
   - Price wars
   - Technology changes
   - Imitation by competitors
   - Loss of focus on quality

2. DIFFERENTIATION
   Strategy: Offer unique products/services that command premium pricing
   
   Requirements:
   - Strong brand
   - Superior quality/features
   - Innovative capabilities
   - Strong customer relationships
   - Unique resources/capabilities
   
   Risks:
   - Cost differential too large
   - Basis of differentiation becomes irrelevant
   - Imitation narrows differentiation

3. FOCUS (NICHE STRATEGY)
   Strategy: Target specific segment with either cost or differentiation
   
   Requirements:
   - Deep segment knowledge
   - Specialized capabilities
   - Segment is underserved
   - Segment has different needs
   
   Risks:
   - Segment disappears
   - Broadly-targeted competitors overwhelm
   - Sub-segments within niche emerge

POSITIONING ANALYSIS:

Current Position Assessment:
1. What strategy is this business currently pursuing? (explicit or implicit)
2. How well-executed is their current strategy?
3. Is their position sustainable?
4. Are they "stuck in the middle" (no clear advantage)?

Recommended Position:
1. Which generic strategy best fits their resources and market?
2. What specific differentiation or cost advantages to pursue?
3. What niche opportunities exist?
4. How to avoid being "stuck in the middle"?

Competitive Position Map:
- X-axis: Price (Low to High)
- Y-axis: Differentiation (Low to High)
- Plot: This business + 3-5 competitors
- Identify: Open positioning opportunities

Strategic Moves:
1. Immediate actions (0-3 months)
2. Medium-term initiatives (3-6 months)
3. Long-term positioning (6-12 months)

OUTPUT REQUIREMENTS:

1. Current Strategy Diagnosis
   - Observed positioning (cost/differentiation/focus/stuck)
   - Effectiveness rating (1-10)
   - Key competitive advantages
   - Strategic vulnerabilities

2. Recommended Positioning
   - Optimal generic strategy for this business
   - Specific differentiation factors to emphasize
   - Target market segment definition
   - Competitive advantages to build

3. Competitive Position Map
   - This business position
   - 3-5 key competitors plotted
   - Market gaps/opportunities identified
   - Recommended strategic move (direction on map)

4. Action Plan
   - 3 immediate tactical moves
   - 3 medium-term strategic initiatives
   - 1 long-term positioning goal
   - Success metrics for each

5. Risk Assessment
   - Biggest competitive threat
   - Market changes that could undermine position
   - Defensive strategies needed

Be SPECIFIC and ACTIONABLE. Reference:
- Actual market data and competitors
- Observable strengths and weaknesses
- Realistic resource constraints
- Measurable success criteria`;

export interface PorterAnalysis {
  fiveForces: {
    newEntrants: ForceAnalysis;
    supplierPower: ForceAnalysis;
    buyerPower: ForceAnalysis;
    substitutes: ForceAnalysis;
    rivalry: ForceAnalysis;
    overall: OverallAssessment;
  };
  valueChain: ValueChainAnalysis;
  positioning: PositioningAnalysis;
}

export interface ForceAnalysis {
  rating: "LOW" | "MEDIUM" | "HIGH";
  factors: string[];
  strategicRecommendation: string;
  competitiveOpportunity: string;
}

export interface OverallAssessment {
  industryAttractiveness: number; // 1-10
  competitivePosition: "STRONG" | "MODERATE" | "WEAK";
  topPriorities: string[];
  biggestThreat: string;
  biggestOpportunity: string;
}

export interface ValueChainAnalysis {
  primary: {
    inboundLogistics: ActivityAnalysis;
    operations: ActivityAnalysis;
    outboundLogistics: ActivityAnalysis;
    marketingSales: ActivityAnalysis;
    service: ActivityAnalysis;
  };
  support: {
    infrastructure: SupportAnalysis;
    hrManagement: SupportAnalysis;
    technology: SupportAnalysis;
    procurement: SupportAnalysis;
  };
  recommendations: {
    advantages: string[];
    gaps: string[];
    quickWins: string[];
    strategicInvestments: string[];
  };
}

export interface ActivityAnalysis {
  assessment: "STRONG" | "ADEQUATE" | "WEAK";
  observations: string[];
  competitiveImpact: string;
  recommendation: string;
  roiPotential: string;
}

export interface SupportAnalysis {
  maturity: "ADVANCED" | "DEVELOPING" | "BASIC";
  impact: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface PositioningAnalysis {
  current: {
    strategy: string;
    effectiveness: number;
    advantages: string[];
    vulnerabilities: string[];
  };
  recommended: {
    genericStrategy:
      | "COST_LEADERSHIP"
      | "DIFFERENTIATION"
      | "FOCUS_COST"
      | "FOCUS_DIFFERENTIATION";
    differentiationFactors: string[];
    targetSegment: string;
    advantagesToBuild: string[];
  };
  actionPlan: {
    immediate: string[];
    mediumTerm: string[];
    longTerm: string;
    metrics: string[];
  };
  risks: {
    biggestThreat: string;
    marketChanges: string[];
    defensiveStrategies: string[];
  };
}
