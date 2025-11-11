/**
 * Seed Strategic Framework Knowledge Base into Vector Database
 *
 * This script populates the vector database with strategic frameworks:
 * - Ansoff Matrix (Growth Strategies)
 * - BCG Matrix (Portfolio Management)
 * - Positioning Map (Competitive Positioning)
 * - Customer Journey Map (Experience Mapping)
 * - OKR Framework (Objectives & Key Results)
 *
 * Usage:
 *   npx tsx scripts/seed-strategic-vectors.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { generateEmbedding } from "../lib/embeddings/embedding-service";
import { VectorRepository } from "../lib/repositories/vector-repository";

// Strategic Frameworks Knowledge Base
const STRATEGIC_KNOWLEDGE_CHUNKS = [
  // ============================================================================
  // ANSOFF MATRIX - GROWTH STRATEGIES
  // ============================================================================
  {
    id: "ansoff-matrix-overview",
    framework: "ansoff_matrix",
    title: "Ansoff Matrix - Strategic Growth Framework",
    content: `The Ansoff Matrix is a strategic planning tool for identifying growth opportunities through four strategies:

1. MARKET PENETRATION (Existing Products + Existing Markets)
   - Increase market share in current markets
   - Encourage more frequent usage by current customers
   - Take market share from competitors
   - Attract non-users in current markets
   - Lowest risk strategy
   
   Tactics:
   - Price adjustments and promotions
   - Increase marketing and sales efforts
   - Improve product quality or service
   - Acquire competitors
   - Customer loyalty programs

2. MARKET DEVELOPMENT (Existing Products + New Markets)
   - Enter new geographic markets
   - Target new customer segments
   - Find new uses for existing products
   - Moderate risk strategy
   
   Tactics:
   - Geographic expansion (regional, national, international)
   - New distribution channels
   - Target different demographics
   - Reposition product for new segments
   - Strategic partnerships in new markets

3. PRODUCT DEVELOPMENT (New Products + Existing Markets)
   - Create new products for current customers
   - Product line extensions
   - New features or improvements
   - Moderate-high risk strategy
   
   Tactics:
   - R&D investment
   - Product innovation
   - Technology upgrades
   - New product lines
   - Acquire companies with complementary products

4. DIVERSIFICATION (New Products + New Markets)
   - Enter completely new areas
   - Highest risk, highest potential reward
   - Related or unrelated diversification
   
   Types:
   - Horizontal: New products for new customers in similar industry
   - Vertical: Move up or down supply chain
   - Conglomerate: Completely unrelated business`,
    source: "Product/Market Strategies (1957) - Igor Ansoff",
    category: "framework",
  },
  {
    id: "ansoff-market-penetration",
    framework: "ansoff_matrix",
    title: "Ansoff Matrix - Market Penetration Strategy Deep Dive",
    content: `Market Penetration focuses on growing within existing markets with existing products.

KEY STRATEGIES:

1. INCREASE USAGE FREQUENCY
   - Encourage customers to use product more often
   - Create new usage occasions
   - Remind customers of benefits
   - Example: "Orange juice isn't just for breakfast"

2. INCREASE PURCHASE QUANTITY
   - Larger package sizes
   - Multi-pack discounts
   - Bulk buying incentives
   - Example: "Family size" offerings

3. WIN COMPETITORS' CUSTOMERS
   - Comparative advertising
   - Competitive pricing
   - Superior customer service
   - Switching incentives

4. CONVERT NON-USERS
   - Address barriers to adoption
   - Trial programs
   - Education campaigns
   - Lower entry-level products

IMPLEMENTATION TACTICS:
- Aggressive pricing strategies
- Increased advertising spend
- Sales force expansion
- Improved distribution
- Customer retention programs
- Product improvements
- Better customer service

METRICS TO TRACK:
- Market share growth
- Customer acquisition cost
- Customer retention rate
- Purchase frequency
- Average transaction value
- Brand awareness

RISKS:
- Price wars with competitors
- Margin compression
- Market saturation
- Diminishing returns on marketing spend`,
    source: "Product/Market Strategies (1957) - Igor Ansoff",
    category: "strategy",
  },
  {
    id: "ansoff-diversification",
    framework: "ansoff_matrix",
    title: "Ansoff Matrix - Diversification Strategy",
    content: `Diversification is the highest-risk growth strategy, entering new markets with new products.

TYPES OF DIVERSIFICATION:

1. RELATED DIVERSIFICATION (Concentric)
   - Leverage existing capabilities
   - Synergies with current business
   - Same core competencies
   - Example: Apple from computers to smartphones
   
   Advantages:
   - Shared technology or skills
   - Economies of scope
   - Risk spreading across related areas
   - Cross-selling opportunities

2. UNRELATED DIVERSIFICATION (Conglomerate)
   - Completely different industries
   - No obvious synergies
   - Pure risk spreading
   - Example: GE's diverse portfolio
   
   Advantages:
   - Financial risk spreading
   - Cash flow stability
   - Investment opportunities
   
   Disadvantages:
   - No operational synergies
   - Management complexity
   - Lack of industry expertise

WHY COMPANIES DIVERSIFY:

1. Risk Management
   - Don't put all eggs in one basket
   - Hedge against industry decline
   - Seasonal balance

2. Growth Opportunities
   - Current market saturated
   - Better opportunities elsewhere
   - Capitalize on trends

3. Resource Utilization
   - Excess cash flow
   - Underutilized capabilities
   - Management bandwidth

4. Strategic Intent
   - Vertical integration
   - Enter high-growth markets
   - Build competitive barriers

SUCCESS FACTORS:
- Clear strategic rationale
- Adequate resources
- Management expertise
- Cultural fit
- Realistic expectations
- Patient capital

COMMON PITFALLS:
- Lack of focus
- Management distraction
- Cultural clashes
- Overpaying for acquisitions
- Underestimating differences`,
    source: "Product/Market Strategies (1957) - Igor Ansoff",
    category: "strategy",
  },

  // ============================================================================
  // BCG MATRIX - PORTFOLIO MANAGEMENT
  // ============================================================================
  {
    id: "bcg-matrix-overview",
    framework: "bcg_matrix",
    title: "BCG Matrix - Portfolio Analysis Framework",
    content: `The Boston Consulting Group (BCG) Matrix is a portfolio planning tool that categorizes business units or products into four categories based on market growth rate and relative market share.

THE FOUR CATEGORIES:

1. STARS (High Growth + High Market Share)
   - Market leaders in fast-growing markets
   - Require significant investment to maintain position
   - Generate high cash flow but also consume cash for growth
   - Future cash cows if market matures
   
   Strategy: INVEST to maintain/grow market share
   Example: Leading products in emerging markets

2. CASH COWS (Low Growth + High Market Share)
   - Dominant in mature, slow-growing markets
   - Generate more cash than they consume
   - Require minimal investment
   - Fund other business units
   
   Strategy: HARVEST - milk for cash to invest elsewhere
   Example: Coca-Cola in developed markets

3. QUESTION MARKS / PROBLEM CHILDREN (High Growth + Low Market Share)
   - Small players in fast-growing markets
   - Require heavy investment to build share
   - Uncertain future - could become stars or dogs
   - Cash drains
   
   Strategy: SELECTIVE INVESTMENT or DIVEST
   Decision: Invest heavily to become star, or exit
   Example: New products in competitive markets

4. DOGS (Low Growth + Low Market Share)
   - Weak position in unattractive markets
   - Generate low returns
   - Tie up resources
   - May still be worth keeping if profitable
   
   Strategy: DIVEST, LIQUIDATE, or maintain if profitable
   Example: Declining products in saturated markets

KEY METRICS:

Relative Market Share = Your Market Share / Largest Competitor's Share
- Above 1.0 = Market leader
- Below 1.0 = Follower

Market Growth Rate:
- High: >10% annual growth
- Low: <10% annual growth
- Varies by industry`,
    source: "BCG Growth-Share Matrix (1970) - Boston Consulting Group",
    category: "framework",
  },
  {
    id: "bcg-portfolio-strategy",
    framework: "bcg_matrix",
    title: "BCG Matrix - Portfolio Balance and Strategy",
    content: `The BCG Matrix helps create a balanced portfolio that funds future growth.

IDEAL PORTFOLIO BALANCE:

1. MULTIPLE CASH COWS
   - Reliable cash generators
   - Fund question marks and stars
   - Maintain competitive position with minimal investment
   - Avoid over-milking that damages brand

2. SELECTIVE STARS
   - Tomorrow's cash cows
   - Worth heavy investment
   - Build defensible positions
   - May need to sacrifice short-term profits

3. FEW QUESTION MARKS
   - Choose carefully which to invest in
   - Avoid spreading resources too thin
   - Clear criteria for investment decisions
   - Regular review and tough decisions

4. MINIMAL DOGS
   - Divest or turnaround
   - Don't let emotional attachment cloud judgment
   - Free up resources for better opportunities
   - Exception: If profitable without investment

PORTFOLIO STRATEGIES:

BUILD Strategy (Question Marks → Stars)
- Increase market share
- Accept short-term profit sacrifice
- Heavy investment required
- High risk, high reward

HOLD Strategy (Stars, profitable Cash Cows)
- Maintain market position
- Match competitive investments
- Harvest some cash from cows
- Defend against attacks

HARVEST Strategy (Weak Cash Cows, Question Marks, Dogs)
- Maximize short-term cash flow
- Minimize investment
- Accept market share loss
- Prepare for eventual exit

DIVEST Strategy (Dogs, losing Question Marks)
- Sell while still has value
- Free up resources
- Cut losses
- Focus on core strengths

CASH FLOW DYNAMICS:

Question Marks: NEGATIVE (high investment, low returns)
Stars: NEUTRAL (high investment, high returns)
Cash Cows: POSITIVE (low investment, high returns)
Dogs: NEUTRAL TO NEGATIVE (low investment, low returns)

SEQUENCING:
Question Mark → Star → Cash Cow → Dog (lifecycle)

MANAGEMENT IMPLICATIONS:
- Different management styles for each quadrant
- Resource allocation based on strategic role
- Performance metrics vary by category
- Compensation tied to quadrant objectives`,
    source: "BCG Growth-Share Matrix (1970) - Boston Consulting Group",
    category: "strategy",
  },
  {
    id: "bcg-limitations",
    framework: "bcg_matrix",
    title: "BCG Matrix - Limitations and Modern Applications",
    content: `While powerful, the BCG Matrix has limitations that must be understood.

LIMITATIONS:

1. OVERSIMPLIFICATION
   - Only two dimensions (growth rate, market share)
   - Ignores other success factors
   - Markets aren't always clearly defined
   - Competitive advantage may not correlate with share

2. MARKET DEFINITION CHALLENGES
   - Hard to define relevant market
   - Geographic scope questions
   - Product substitutes inclusion
   - Market boundaries evolving

3. STATIC SNAPSHOT
   - Doesn't show movement over time
   - Market conditions change
   - Competition evolves
   - Technology disrupts

4. ASSUMES HIGH SHARE = HIGH PROFIT
   - Not always true in all industries
   - Niche players can be very profitable
   - Scale doesn't guarantee profitability
   - Quality over quantity matters

5. RESOURCE ALLOCATION RIGIDITY
   - May cause underinvestment in dogs
   - Some "dogs" are profitable
   - Question marks may have strategic value
   - Emotional decisions matter

MODERN ADAPTATIONS:

1. Multi-Dimensional Analysis
   - Add third dimension (competitive strength)
   - Consider strategic importance
   - Include sustainability factors
   - Account for synergies

2. Dynamic Tracking
   - Plot movement over time
   - Trajectory matters
   - Leading vs lagging indicators
   - Scenario planning

3. Industry-Specific Modifications
   - Adjust growth thresholds by industry
   - Consider disruption potential
   - Account for regulatory changes
   - Include ecosystem dynamics

4. Digital Era Considerations
   - Network effects
   - Platform dynamics
   - Data as an asset
   - Speed of change

BEST PRACTICES:

- Use as starting point, not final answer
- Combine with other frameworks
- Consider qualitative factors
- Update regularly
- Involve cross-functional teams
- Challenge assumptions
- Consider strategic fit beyond financials`,
    source: "BCG Growth-Share Matrix (1970) - Boston Consulting Group",
    category: "limitations",
  },

  // ============================================================================
  // POSITIONING MAP - COMPETITIVE POSITIONING
  // ============================================================================
  {
    id: "positioning-map-overview",
    framework: "positioning_map",
    title: "Positioning Map - 2D Competitive Analysis",
    content: `A Positioning Map (Perceptual Map) is a visual tool that plots brands or products on two key dimensions to show competitive positioning and market gaps.

PURPOSE:
- Visualize competitive landscape
- Identify market gaps and opportunities
- Understand customer perceptions
- Guide positioning strategy
- Track repositioning efforts

KEY COMPONENTS:

1. TWO AXES (Most Important Attributes)
   - X-axis: One key differentiator
   - Y-axis: Another key differentiator
   - Choose attributes that matter to customers
   - Should be relatively independent variables

Common Axis Combinations:
- Price vs Quality
- Traditional vs Innovative
- Basic vs Premium
- Functional vs Emotional
- Mass Market vs Niche
- Low Cost vs High Service
- Convenience vs Selection

2. COMPETITOR PLOTTING
   - Map all major competitors
   - Plot based on customer perception (not internal view)
   - Size of bubble can show market share
   - Color coding for different categories

3. IDEAL POINT
   - Where customers want products to be
   - Target for positioning
   - May vary by segment
   - Not always in center

CREATING A POSITIONING MAP:

Step 1: SELECT ATTRIBUTES
- Survey customers on importance
- Choose two most discriminating factors
- Ensure attributes are independent
- Relevant to purchase decisions

Step 2: GATHER DATA
- Customer surveys on brand perceptions
- Rate each brand on each attribute
- Use consistent scale (1-10 or 1-7)
- Get enough sample size

Step 3: PLOT POSITIONS
- Calculate average ratings
- Plot each competitor
- Mark your brand clearly
- Add ideal customer position

Step 4: ANALYZE
- Identify clusters (similar positioning)
- Find gaps (underserved areas)
- Assess crowding (intense competition)
- Consider movement opportunities

STRATEGIC INSIGHTS:

GAPS = OPPORTUNITIES
- Empty quadrants may represent opportunities
- But verify there's actual demand
- Consider why gap exists
- Test with customer research

CLUSTERS = INTENSE COMPETITION
- Many brands in same space
- Difficult to differentiate
- Price competition likely
- Consider moving to less crowded space

OUTLIERS = UNIQUE POSITIONING
- Differentiated position
- May be niche or innovative
- Less direct competition
- Can command premium or serve unmet needs`,
    source: "Positioning: The Battle for Your Mind (1981) - Ries & Trout",
    category: "framework",
  },
  {
    id: "positioning-strategy",
    framework: "positioning_map",
    title: "Positioning Map - Strategic Positioning Decisions",
    content: `Using positioning maps to make strategic marketing decisions.

POSITIONING STRATEGIES:

1. HEAD-TO-HEAD POSITIONING
   - Directly compete with market leader
   - Requires significant resources
   - "We're better than them" message
   - High risk, potentially high reward
   
   When to use:
   - You have clear superiority
   - Resources to sustain battle
   - Leader is vulnerable
   - Market is large enough for multiple winners

2. DIFFERENTIATION POSITIONING
   - Find empty or less crowded space
   - Create unique value proposition
   - "We're different from everyone" message
   - Lower risk, sustainable advantage
   
   When to use:
   - Underserved customer needs exist
   - You have unique capabilities
   - Can own a distinctive attribute
   - Willing to target narrower segment

3. NICHE POSITIONING
   - Serve specific segment extremely well
   - Corner of the map
   - "Best for specific customer type" message
   - Focused strategy
   
   When to use:
   - Segment has specific needs
   - Willing to give up mass market
   - Can build deep expertise
   - Defensible position

4. REPOSITIONING
   - Move to different position over time
   - Change customer perceptions
   - "We've evolved" message
   - Long-term effort
   
   When to use:
   - Current position is crowded
   - Market is changing
   - Better opportunity exists
   - Need to stay relevant

REPOSITIONING CHALLENGES:

CURRENT PERCEPTIONS ARE STICKY
- Hard to change established beliefs
- Requires consistent messaging
- Takes time and investment
- May confuse existing customers

RISK OF BEING STUCK IN MIDDLE
- Trying to be all things to all people
- No clear differentiation
- Vulnerable to focused competitors
- "Stuck in the middle" syndrome

SEGMENT-SPECIFIC MAPS:
- Different segments may perceive differently
- Create maps for each target segment
- Position may vary by segment
- Allows for more nuanced strategy

DYNAMIC POSITIONING:
- Track movement over time
- Monitor competitor shifts
- Adapt to market changes
- Update regularly (annually or when market shifts)

POSITIONING MAP + OTHER TOOLS:

Combine with SWOT:
- Strengths/Weaknesses inform feasible positions
- Opportunities/Threats show market gaps

Combine with Segmentation:
- Different maps for different segments
- Targeted positioning by segment
- Resource allocation decisions

Combine with Perceptual Research:
- Validate positioning with customer data
- Test positioning concepts
- Measure perception changes`,
    source: "Positioning: The Battle for Your Mind (1981) - Ries & Trout",
    category: "strategy",
  },

  // ============================================================================
  // CUSTOMER JOURNEY MAP
  // ============================================================================
  {
    id: "customer-journey-map-overview",
    framework: "customer_journey_map",
    title: "Customer Journey Map - Experience Mapping Framework",
    content: `A Customer Journey Map visualizes the complete experience customers have with your brand across all touchpoints and stages.

THE 8 STAGES OF CUSTOMER JOURNEY:

1. AWARENESS
   - Customer becomes aware of need or problem
   - Discovers your brand exists
   - Initial exposure to solutions
   
   Touchpoints: Ads, social media, word of mouth, content, SEO
   Goal: Capture attention, generate interest
   Metrics: Impressions, reach, brand awareness

2. CONSIDERATION
   - Actively researching solutions
   - Comparing alternatives
   - Learning about options
   
   Touchpoints: Website, reviews, comparisons, demos, content
   Goal: Be included in consideration set, demonstrate value
   Metrics: Website visits, time on site, pages viewed

3. DECISION
   - Ready to make purchase decision
   - Final evaluation
   - Overcoming last objections
   
   Touchpoints: Pricing page, sales calls, trials, guarantees
   Goal: Close the sale, make buying easy
   Metrics: Conversion rate, cart abandonment, close rate

4. PURCHASE
   - Transaction occurs
   - Onboarding begins
   - First impressions formed
   
   Touchpoints: Checkout, payment, confirmation, welcome
   Goal: Smooth transaction, set expectations
   Metrics: Completion rate, initial satisfaction

5. ONBOARDING
   - Learning to use product/service
   - Getting value quickly
   - Building habits
   
   Touchpoints: Setup, tutorials, support, training
   Goal: Time to value, build competency, reduce churn
   Metrics: Activation rate, time to first value, completion

6. ENGAGEMENT
   - Regular usage
   - Deepening relationship
   - Discovering more value
   
   Touchpoints: Product, support, content, community
   Goal: Drive usage, increase value, build stickiness
   Metrics: DAU/MAU, feature adoption, engagement score

7. RETENTION
   - Ongoing satisfaction
   - Renewal decisions
   - Preventing churn
   
   Touchpoints: Success check-ins, renewals, loyalty programs
   Goal: Maintain satisfaction, demonstrate ROI, renew
   Metrics: Retention rate, churn rate, renewal rate

8. ADVOCACY
   - Customers promote brand
   - Referrals and reviews
   - Word of mouth
   
   Touchpoints: Referral programs, reviews, case studies, community
   Goal: Activate advocates, generate referrals, build community
   Metrics: NPS, referral rate, review count, testimonials

KEY ELEMENTS OF JOURNEY MAP:

1. CUSTOMER ACTIONS
   - What they're doing at each stage
   - Behaviors and activities
   - Steps in the process

2. TOUCHPOINTS
   - Where interactions occur
   - Channels used
   - People involved

3. EMOTIONS
   - How customer feels
   - Pain points and frustrations
   - Moments of delight

4. OPPORTUNITIES
   - Where to improve
   - Gaps in experience
   - Innovation possibilities`,
    source: "Customer Journey Mapping - Modern Marketing Practice",
    category: "framework",
  },
  {
    id: "customer-journey-mapping-process",
    framework: "customer_journey_map",
    title: "Customer Journey Mapping - Implementation Process",
    content: `How to create and use effective customer journey maps.

MAPPING PROCESS:

STEP 1: DEFINE SCOPE
- Which customer segment?
- Which product/service?
- Which journey (buying, using, support)?
- Time frame to cover

STEP 2: GATHER INSIGHTS
Research Methods:
- Customer interviews (qualitative)
- Surveys (quantitative)
- Analytics data (behavioral)
- Support tickets (pain points)
- Sales team input (objections)
- Social listening (sentiment)

Key Questions:
- What triggers the journey?
- What steps do customers take?
- What do they think/feel at each step?
- What are pain points?
- What delights them?

STEP 3: IDENTIFY TOUCHPOINTS
Map All Interactions:
- Digital: Website, app, email, social, ads
- Physical: Store, events, mail, phone
- Human: Sales, support, service
- Indirect: Reviews, word of mouth, press

For Each Touchpoint Document:
- Channel
- Purpose
- Customer action
- Company action
- Emotional tone

STEP 4: MAP EMOTIONS
Emotional Journey Line:
- Plot satisfaction over time
- Identify highs and lows
- Mark pain points (valleys)
- Mark moments of truth (peaks)
- Note emotional drivers

STEP 5: IDENTIFY OPPORTUNITIES
Look for:
- Friction points to reduce
- Gaps in information
- Missing touchpoints
- Inconsistent experiences
- Moments to delight
- Automation opportunities

JOURNEY MAP INSIGHTS:

MOMENTS OF TRUTH
- Critical touchpoints that determine outcomes
- First impressions matter
- Recovery from problems
- Renewal/repurchase decisions
- Referral triggers

PAIN POINTS
- Where customers struggle
- Friction in process
- Confusing experiences
- Unmet expectations
- System failures

EMOTIONAL PEAKS
- Moments of delight
- Exceed expectations
- Create advocates
- Shareable moments
- Build loyalty

CHANNEL GAPS
- Breaks between channels
- Inconsistent messaging
- Lost context
- Duplicated effort

OPTIMIZATION STRATEGIES:

1. REMOVE FRICTION
   - Simplify processes
   - Reduce steps
   - Automate where possible
   - Make it intuitive

2. PERSONALIZE
   - Segment-specific journeys
   - Behavioral triggers
   - Contextual content
   - Relevant recommendations

3. CREATE CONSISTENCY
   - Omnichannel experience
   - Unified messaging
   - Seamless transitions
   - Context preservation

4. ADD VALUE
   - Helpful content
   - Proactive support
   - Educational resources
   - Community connection

5. MEASURE & ITERATE
   - Track metrics by stage
   - Monitor satisfaction
   - Test improvements
   - Continuous optimization

COMMON MISTAKES TO AVOID:

- Mapping ideal journey instead of actual
- Single journey for all segments
- Too much detail (unusable)
- Not involving customers
- Creating map but not acting on insights
- One-time exercise instead of ongoing
- Missing emotional layer
- Internal perspective only`,
    source: "Customer Journey Mapping - Modern Marketing Practice",
    category: "implementation",
  },

  // ============================================================================
  // OKR FRAMEWORK
  // ============================================================================
  {
    id: "okr-framework-overview",
    framework: "okr",
    title: "OKR Framework - Objectives and Key Results",
    content: `OKRs (Objectives and Key Results) is a goal-setting framework for defining and tracking objectives and their outcomes.

STRUCTURE:

OBJECTIVE (The What)
- Qualitative, inspirational goal
- Describes what you want to achieve
- Memorable and engaging
- Time-bound (usually quarterly)
- Directional and motivating

Characteristics of Good Objectives:
- Ambitious and aspirational
- Actionable by the team
- Aligned with company mission
- Inspiring and motivating
- Clearly articulated

KEY RESULTS (The How We Measure)
- Quantitative metrics
- Specific, measurable outcomes
- Evidence of achieving objective
- 3-5 per objective
- Aggressive but achievable

Characteristics of Good Key Results:
- Measurable (numbers, %)
- Outcome-based (not activities)
- Verifiable (clear yes/no)
- Ambitious (stretch goals)
- Time-bound

EXAMPLE OKR:

Objective: Become the most loved brand in our category

Key Results:
1. Increase Net Promoter Score from 45 to 65
2. Achieve 4.5+ star rating across 1000+ reviews
3. Grow organic social mentions by 150%
4. Reduce customer churn from 8% to 5%

OKR LEVELS:

1. COMPANY OKRs
   - Set by leadership
   - Cascade to teams
   - 3-5 company-wide objectives
   - Quarterly and annual

2. TEAM OKRs
   - Support company OKRs
   - Team-specific initiatives
   - Aligned with company goals
   - More tactical

3. INDIVIDUAL OKRs (Optional)
   - Personal contribution
   - Support team OKRs
   - Career development
   - Not for performance reviews

CASCADING ALIGNMENT:

Company OKR
  ↓
Department OKRs (support company)
  ↓
Team OKRs (support department)
  ↓
Individual OKRs (support team)

60-70% ALIGNMENT RULE:
- 60% of OKRs aligned to company goals
- 40% bottom-up, team-generated
- Allows innovation and ownership

SCORING OKRs:

Scale: 0.0 to 1.0 (or 0% to 100%)

0.0-0.3: Red (Far from goal)
0.4-0.6: Yellow (Made progress)
0.7-1.0: Green (Achieved/exceeded)

IDEAL SCORES: 0.6-0.7
- Means goals were ambitious
- Stretched capabilities
- Not too easy, not impossible
- Room for improvement

Consistently scoring 1.0:
- Goals aren't ambitious enough
- Not pushing boundaries
- Sandbagging

Consistently scoring <0.4:
- Goals too aggressive
- Need recalibration
- Demotivating`,
    source: "Measure What Matters (2017) - John Doerr / Google OKR System",
    category: "framework",
  },
  {
    id: "okr-implementation",
    framework: "okr",
    title: "OKR Framework - Implementation Best Practices",
    content: `How to successfully implement and use OKRs in your organization.

OKR CYCLE:

QUARTERLY CYCLE (Recommended)

Week 1-2: PLANNING
- Review previous quarter results
- Gather input from teams
- Draft OKRs
- Review and align
- Finalize and commit

Week 3-12: EXECUTION
- Weekly check-ins
- Track progress
- Make adjustments
- Remove blockers
- Celebrate wins

Week 13: REVIEW & REFLECT
- Score OKRs
- Analyze what worked/didn't
- Share learnings
- Feed into next quarter planning

MONTHLY CHECK-INS:
- Update progress scores
- Discuss obstacles
- Adjust tactics (not OKRs)
- Maintain visibility

WRITING EFFECTIVE OKRs:

OBJECTIVES - Start With Verbs:
- Launch...
- Build...
- Accelerate...
- Transform...
- Establish...

Avoid Vague Objectives:
❌ "Improve customer satisfaction"
✅ "Become the highest-rated product in our category"

❌ "Grow the business"
✅ "Dominate the small business segment"

KEY RESULTS - Must Be Measurable:
✅ "Increase MRR from $50K to $75K"
✅ "Ship 3 major features with >60% adoption"
✅ "Reduce onboarding time from 5 days to 2 days"

❌ "Launch new product" (activity, not outcome)
❌ "Improve performance" (not measurable)
❌ "Make customers happy" (not specific)

COMMON PATTERNS:

Growth OKRs:
- Increase [metric] from X to Y
- Grow [segment] by X%
- Achieve X new [customers/users/deals]

Quality OKRs:
- Improve [score/rating] from X to Y
- Reduce [problem] by X%
- Achieve X% [satisfaction/completion/success]

Launch OKRs:
- Ship [product/feature] with X adoption
- Launch in X markets with Y results
- Release X with Y customer feedback score

Efficiency OKRs:
- Reduce [cost/time] by X%
- Automate X processes
- Improve [conversion/retention] from X to Y

OKR BEST PRACTICES:

1. MAKE THEM PUBLIC
   - Transparency drives alignment
   - Everyone sees everyone's OKRs
   - Encourages collaboration
   - Prevents duplicate work

2. SEPARATE FROM PERFORMANCE REVIEWS
   - OKRs are aspirational
   - Failure is learning
   - Don't punish missed OKRs
   - Encourage ambitious goals

3. KEEP THEM FEW
   - 3-5 objectives max
   - 3-5 key results per objective
   - Focus over quantity
   - Quality of goals matters

4. MAKE THEM UNCOMFORTABLE
   - Should feel ambitious
   - 70% confidence to achieve
   - Stretch capabilities
   - Drive innovation

5. ITERATE AND LEARN
   - First quarters will be rough
   - Improve with practice
   - Learn from scoring
   - Adapt to your culture

COMMON PITFALLS:

❌ Using OKRs for task management
- OKRs are outcomes, not todo lists
- Use project management for tasks

❌ Too many OKRs
- Dilutes focus
- Nothing gets done well
- Better to have 3 great OKRs than 10 mediocre ones

❌ Sandbagging (easy goals)
- Defeats the purpose
- No stretch or growth
- Should score 0.6-0.7 on average

❌ Set and forget
- Need regular check-ins
- Adjust tactics as you learn
- Maintain momentum

❌ Top-down only
- Bottom-up input is critical
- Teams know the work
- Ownership matters

❌ Confusing with KPIs
- OKRs: Aspirational goals (what you want to achieve)
- KPIs: Health metrics (how you're doing)
- Both are important but different

SUCCESSFUL OKR CULTURE:

- Leadership commitment
- Consistent cadence
- Regular check-ins
- Celebrate learning from failure
- Transparency
- Continuous improvement
- Focus and discipline`,
    source: "Measure What Matters (2017) - John Doerr / Google OKR System",
    category: "implementation",
  },
  {
    id: "okr-marketing-examples",
    framework: "okr",
    title: "OKR Framework - Marketing-Specific Examples",
    content: `Real-world OKR examples for marketing teams.

BRAND AWARENESS OKR:

Objective: Establish ourselves as the thought leader in sustainable packaging

Key Results:
1. Publish 20 high-quality articles with 50K+ total views
2. Achieve 10 guest posts on tier-1 industry publications
3. Grow LinkedIn following from 5K to 25K followers
4. Secure 5 speaking slots at major industry conferences

LEAD GENERATION OKR:

Objective: Build a predictable lead generation engine

Key Results:
1. Increase MQLs from 200 to 500 per month
2. Improve MQL-to-SQL conversion from 20% to 35%
3. Reduce cost-per-lead from $150 to $80
4. Launch 3 new lead magnets with 15%+ conversion rate

CUSTOMER ACQUISITION OKR:

Objective: Dominate the small business segment

Key Results:
1. Acquire 500 new small business customers (current: 150)
2. Achieve 25% of revenue from sub-$50K ARR segment
3. Reduce CAC for SMB segment from $2K to $1.2K
4. Launch SMB-specific onboarding with 80%+ completion

CONTENT MARKETING OKR:

Objective: Become the go-to resource for [topic] education

Key Results:
1. Achieve 100K organic monthly visitors (current: 25K)
2. Rank in top 3 for 15 high-intent keywords
3. Generate 300 SQLs from organic content (current: 75)
4. Publish complete learning resource with 5K+ enrollments

SOCIAL MEDIA OKR:

Objective: Build an engaged community on social platforms

Key Results:
1. Grow combined followers from 15K to 50K
2. Achieve 5% average engagement rate (current: 1.2%)
3. Generate 100 qualified leads from social channels
4. Launch community program with 500 active members

PRODUCT MARKETING OKR:

Objective: Successfully launch [Product] as market category leader

Key Results:
1. Achieve 1,000 signups within first month
2. Secure 3 case studies from design partners
3. Generate 50 pieces of press coverage
4. Reach 25% market awareness in target segment (survey-based)

EMAIL MARKETING OKR:

Objective: Transform email into our #1 revenue channel

Key Results:
1. Grow email list from 10K to 30K subscribers
2. Improve email-to-MQL conversion from 2% to 5%
3. Achieve $500K in pipeline from email campaigns
4. Increase email engagement rate from 18% to 28%

CUSTOMER MARKETING OKR:

Objective: Turn customers into our best sales team

Key Results:
1. Achieve Net Promoter Score of 70+ (current: 45)
2. Generate 150 customer referrals (current: 30)
3. Publish 10 customer case studies
4. Launch customer advocacy program with 200 participants

SEO OKR:

Objective: Own organic search for high-intent keywords

Key Results:
1. Rank #1-3 for 25 money keywords (current: 5)
2. Increase organic traffic from 20K to 75K monthly
3. Improve organic conversion rate from 2% to 4%
4. Generate $300K pipeline from organic search

PAID MARKETING OKR:

Objective: Build efficient paid acquisition engine

Key Results:
1. Reduce CPA from $250 to $150
2. Improve ROAS from 2.5x to 4.5x
3. Scale monthly ad spend from $25K to $75K profitably
4. Launch successful campaigns in 3 new channels

CONVERSION OPTIMIZATION OKR:

Objective: Maximize value from existing traffic

Key Results:
1. Improve homepage-to-trial conversion from 3% to 6%
2. Increase trial-to-paid conversion from 15% to 25%
3. Reduce time-to-first-value from 7 days to 2 days
4. Achieve 90% onboarding completion rate (current: 60%)`,
    source: "Marketing OKR Best Practices",
    category: "examples",
  },
];

export async function seedStrategicVectors() {
  try {
    console.log("🎯 Strategic Frameworks Vector Seeding Started\n");
    console.log(
      `📦 Total knowledge chunks to process: ${STRATEGIC_KNOWLEDGE_CHUNKS.length}\n`
    );

    const vectorRepo = new VectorRepository();
    let successCount = 0;
    let errorCount = 0;

    for (const chunk of STRATEGIC_KNOWLEDGE_CHUNKS) {
      try {
        console.log(`\n📝 Processing: ${chunk.title}`);
        console.log(`   Framework: ${chunk.framework}`);
        console.log(`   Category: ${chunk.category}`);

        // Generate embedding
        const embedding = await generateEmbedding(chunk.content);

        // Upsert to vector database with proper metadata
        await vectorRepo.provider.upsert([
          {
            id: chunk.id,
            values: embedding,
            metadata: {
              demoId: "knowledge-base", // Generic knowledge base demo record
              framework: chunk.framework,
              title: chunk.title,
              content: chunk.content,
              source: chunk.source,
              category: chunk.category,
              analysisType: "strategic_framework",
              agentType: "strategic",
              type: "strategic_framework",
              timestamp: new Date().toISOString(),
              confidence: 1.0, // Framework knowledge is always high confidence
            },
          },
        ]);

        successCount++;
        console.log(`   ✅ Successfully embedded and stored`);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error processing chunk ${chunk.id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("📊 STRATEGIC FRAMEWORKS SEEDING SUMMARY");
    console.log("=".repeat(70));
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📚 Total chunks: ${STRATEGIC_KNOWLEDGE_CHUNKS.length}`);
    console.log(
      "\n🎯 Strategic framework knowledge is now searchable via RAG!"
    );

    return {
      success: errorCount === 0,
      successCount,
      errorCount,
      total: STRATEGIC_KNOWLEDGE_CHUNKS.length,
    };
  } catch (error) {
    console.error("❌ Fatal error in seedStrategicVectors:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedStrategicVectors()
    .then((result) => {
      if (result.success) {
        console.log(
          "\n✅ Strategic frameworks seeding completed successfully!"
        );
        process.exit(0);
      } else {
        console.error(`\n⚠️  Completed with ${result.errorCount} errors`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ Fatal error:", error);
      process.exit(1);
    });
}
