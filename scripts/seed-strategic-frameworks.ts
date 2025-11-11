/**
 * Seed Strategic Framework Knowledge into Pinecone
 *
 * This script seeds essential knowledge for:
 * - Digital Maturity Assessment
 * - PESTEL Analysis
 * - Business Model Canvas
 * - Lean Canvas
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ============================================================================
// Digital Maturity Assessment Knowledge
// ============================================================================

const digitalMaturityKnowledge = [
  {
    id: 'dm-001',
    content: `Digital Maturity Benchmarks by Industry 2025:
- SaaS: Average 3.2/5, Top Quartile 4.1/5
- E-commerce: Average 3.5/5, Top Quartile 4.3/5
- Professional Services: Average 2.8/5, Top Quartile 3.7/5
- Healthcare: Average 2.5/5, Top Quartile 3.4/5
- Manufacturing: Average 2.3/5, Top Quartile 3.2/5

Key differentiators for top performers:
- API-first architecture (87% adoption)
- Automated CI/CD pipelines (94% adoption)
- Real-time analytics dashboards (78% adoption)
- Cloud-native infrastructure (92% adoption)`,
    metadata: {
      type: 'digital_maturity_knowledge',
      category: 'benchmarks',
      year: 2025,
      source: 'industry_research'
    }
  },
  {
    id: 'dm-002',
    content: `Common Digital Transformation Failures and Success Factors:

Top Failure Causes:
1. Lack of executive sponsorship (42% of failures)
2. Insufficient change management (38%)
3. Technology implementation without strategy (31%)
4. Underestimating training requirements (27%)
5. Poor communication across teams (24%)

Success Factors:
1. Clear vision and roadmap with measurable milestones
2. Incremental rollout with quick wins (not big bang)
3. Continuous employee training and support
4. Cross-functional transformation team
5. Regular measurement and course correction`,
    metadata: {
      type: 'digital_maturity_knowledge',
      category: 'best_practices',
      focus: 'transformation_pitfalls'
    }
  },
  {
    id: 'dm-003',
    content: `Digital Strategy Maturity Levels - Detailed Characteristics:

Level 1 (Initial): Ad-hoc digital presence, reactive approach
- No formal digital strategy
- Siloed technology decisions
- Manual processes dominate
- Limited data collection

Level 2 (Developing): Emerging capabilities, inconsistent execution
- Basic digital strategy exists
- Some automation implemented
- Departmental data silos
- Limited analytics

Level 3 (Defined): Established processes, growing sophistication
- Documented digital strategy
- Integrated systems emerging
- Data-driven decisions in some areas
- Consistent customer experience

Level 4 (Managed): Data-driven, integrated operations
- Strategic digital roadmap
- Fully integrated technology stack
- Advanced analytics across organization
- Personalized customer experiences

Level 5 (Optimizing): Industry-leading, continuous innovation
- Digital-first culture
- AI/ML embedded in operations
- Predictive analytics
- Continuous experimentation`,
    metadata: {
      type: 'digital_maturity_knowledge',
      category: 'framework_detail',
      focus: 'maturity_levels'
    }
  },
  {
    id: 'dm-004',
    content: `Digital Maturity Assessment - Technology Stack Recommendations:

Level 2→3 Transition:
- CRM: HubSpot, Salesforce Essentials
- Marketing automation: Mailchimp, ActiveCampaign
- Analytics: Google Analytics 4, Mixpanel
- Project management: Asana, Monday.com
Investment: $10K-30K/year

Level 3→4 Transition:
- Enterprise CRM: Salesforce, Microsoft Dynamics
- Marketing: Marketo, Pardot
- Advanced analytics: Segment, Amplitude
- Data warehouse: Snowflake, BigQuery
- BI tools: Tableau, Looker
Investment: $50K-150K/year

Level 4→5 Transition:
- AI/ML platforms: DataRobot, AWS SageMaker
- Customer data platform: mParticle, Segment
- Advanced personalization: Optimizely, Dynamic Yield
- Process mining: Celonis, UiPath
Investment: $200K+/year`,
    metadata: {
      type: 'digital_maturity_knowledge',
      category: 'technology_recommendations',
      focus: 'tech_stack'
    }
  },
  {
    id: 'dm-005',
    content: `Digital Maturity ROI Benchmarks:

Typical ROI by Maturity Level Improvement:
- Level 1→2: 15-25% operational efficiency gain, 6-9 month payback
- Level 2→3: 25-40% efficiency gain, 12-18 month payback
- Level 3→4: 30-50% efficiency gain, 18-24 month payback
- Level 4→5: 40-70% efficiency gain, 24-36 month payback

Revenue Impact:
- Digital leaders grow 2.5x faster than laggards
- Top quartile sees 30-50% higher profit margins
- Customer acquisition cost 40% lower with advanced digital maturity
- Customer lifetime value 60% higher with personalization

Quick Win Examples (0-3 months):
- Marketing automation: 20% time savings, $5K investment
- Chat automation: 30% support cost reduction, $3K investment
- Analytics dashboards: 15% faster decision making, $2K investment`,
    metadata: {
      type: 'digital_maturity_knowledge',
      category: 'roi_benchmarks',
      focus: 'financial_impact'
    }
  },
];

// ============================================================================
// PESTEL Analysis Knowledge
// ============================================================================

const pestelKnowledge = [
  {
    id: 'pestel-001',
    content: `2025 Economic Trends Affecting Small-Medium Businesses:

Interest Rates & Lending:
- Federal Reserve rates: 4.5-5.0%
- Small business loan approval rates: 68% (down from 72% in 2024)
- Average loan rate: 7.5-9.5%
- Impact: Higher cost of capital, focus on profitability over growth

Inflation & Costs:
- Core inflation: 2.8% (cooling from 2024)
- Labor costs: Up 4.2% YoY
- Commercial real estate: Down 8% in urban areas
- Supply chain: 85% normalized from pandemic disruptions

Consumer Spending:
- Discretionary spending cautious but stable
- E-commerce penetration: 22% of total retail
- B2B payment terms extending (Net 60 becoming standard)`,
    metadata: {
      type: 'pestel_knowledge',
      category: 'economic',
      year: 2025,
      region: 'US'
    }
  },
  {
    id: 'pestel-002',
    content: `AI and Technology Regulations 2025:

EU AI Act (In Effect):
- Risk-based classification system
- High-risk AI systems require compliance documentation
- Transparency requirements for generative AI
- Fines up to €35M or 7% of global revenue
- Implementation deadline: August 2026

US State-Level AI Regulations:
- California: AI Bill of Rights enacted
- New York: AI bias testing required for hiring tools
- Texas: Data privacy requirements affecting AI training
- Federal legislation pending but no consensus yet

Impact on Businesses:
- Compliance costs: $50K-500K depending on AI usage
- Documentation requirements for customer-facing AI
- Third-party AI vendor audits necessary
- Insurance for AI liability emerging`,
    metadata: {
      type: 'pestel_knowledge',
      category: 'legal_technological',
      region: 'US_EU',
      year: 2025
    }
  },
  {
    id: 'pestel-003',
    content: `Social and Demographic Trends 2025:

Workforce Shifts:
- Remote/hybrid work: 58% of knowledge workers (stable)
- Gen Z entering workforce: 27% of workers (up from 23% in 2024)
- Gig economy: 36% of workers have side income
- Skills gap: 78% of employers report difficulty filling technical roles

Consumer Behavior Changes:
- Sustainability expectations: 67% willing to pay 10% premium for sustainable products
- Social media influence: TikTok surpasses Instagram for product discovery (18-34 age group)
- Trust in businesses: Down to 52% (privacy concerns)
- Demand for personalization: 71% expect customized experiences

Demographic Impact:
- Aging population: 55+ segment growing 2.5x faster than overall population
- Multicultural markets: Hispanic and Asian markets growing 3x faster
- Urbanization reversal: Suburban and rural areas seeing growth`,
    metadata: {
      type: 'pestel_knowledge',
      category: 'social',
      year: 2025,
      focus: 'workforce_consumer_trends'
    }
  },
  {
    id: 'pestel-004',
    content: `Environmental and Sustainability Requirements 2025:

Regulatory Landscape:
- SEC Climate Disclosure Rules: Scope 1 & 2 emissions reporting required for large companies
- California SB 253: Supply chain emissions reporting (phased implementation)
- EU Carbon Border Adjustment: Tariffs on carbon-intensive imports
- Plastic packaging restrictions expanding in 23 states

Business Impact:
- Supply chain transparency requirements increasing
- ESG reporting expected by B2B customers (68% require suppliers to report)
- Sustainable packaging: 15-25% cost premium but increasing customer demand
- Carbon offset market maturing: $2B industry in 2025

Opportunities:
- Green products/services: 23% market growth YoY
- Energy efficiency consulting: High-demand service
- Circular economy models: Reuse/refurbishment growing
- Renewable energy costs below fossil fuels in most regions`,
    metadata: {
      type: 'pestel_knowledge',
      category: 'environmental',
      year: 2025,
      region: 'US_EU'
    }
  },
  {
    id: 'pestel-005',
    content: `Technology Disruption Trends 2025:

Generative AI Adoption:
- 78% of businesses using AI in some capacity (up from 35% in 2023)
- Primary use cases: Customer service (42%), content creation (38%), data analysis (35%)
- ROI timeline: 6-12 months for most implementations
- Skills gap: 82% of companies need AI training

Cybersecurity Threats:
- Ransomware attacks up 27% YoY
- Average ransom: $1.5M for SMBs
- AI-powered phishing increasing effectiveness 3x
- Cyber insurance premiums up 40%
- Compliance: SOC 2, ISO 27001 increasingly required by enterprise customers

Emerging Technologies:
- Quantum computing: Early commercial applications in finance, pharma
- 5G/6G: Enabling edge computing and IoT expansion
- Blockchain: Supply chain and authentication use cases maturing
- AR/VR: Training and remote assistance growing 45% YoY`,
    metadata: {
      type: 'pestel_knowledge',
      category: 'technological',
      year: 2025,
      focus: 'disruption_trends'
    }
  },
];

// ============================================================================
// Business Model Canvas Knowledge
// ============================================================================

const businessModelKnowledge = [
  {
    id: 'bmc-001',
    content: `SaaS Business Model Patterns and Benchmarks 2025:

Revenue Model Patterns:
- Freemium: 2-5% conversion to paid (benchmark)
- Free trial: 15-25% conversion (14-day trial optimal)
- Product-led growth (PLG): 40% of SaaS ARR from self-service
- Sales-led: Higher ACV ($50K+) but longer sales cycles (6-9 months)

Pricing Benchmarks:
- Median SaaS price per user/month: $79
- Enterprise: $150-500/user/month
- SMB: $25-100/user/month
- Usage-based pricing growing: 38% of SaaS companies (up from 27% in 2023)

Key Metrics:
- Gross margin: 70-85% for SaaS (below 70% is concerning)
- CAC payback: 12-18 months (benchmark)
- LTV:CAC ratio: 3:1 minimum, 5:1+ excellent
- Net revenue retention: 110%+ for best-in-class
- Rule of 40: (Growth rate % + Profit margin %) should exceed 40`,
    metadata: {
      type: 'business_model_knowledge',
      industry: 'saas',
      category: 'revenue_patterns',
      year: 2025
    }
  },
  {
    id: 'bmc-002',
    content: `E-commerce Business Model Optimization Strategies:

Revenue Streams:
- Direct product sales: 60-80% of revenue
- Marketplace fees: 15-25% commission typical
- Subscription boxes: 15-30% higher LTV than one-time purchases
- Affiliate/partnership revenue: 5-10% of total revenue
- Private label: 40-60% higher margins than reselling

Channel Performance:
- Direct website: 45-60% of revenue
- Amazon/marketplaces: 20-35% of revenue
- Social commerce (TikTok Shop, Instagram): 10-15% and growing
- Email marketing: 20-30% of revenue but declining
- Paid search: CAC increasing 15% YoY

Cost Structure Optimization:
- COGS: 40-60% of revenue for physical products
- Fulfillment: 8-15% of revenue (3PL vs in-house tradeoff at $5M revenue)
- Marketing: 15-25% of revenue (efficient companies <20%)
- Platform fees: 2-4% (Shopify, payment processing)
- Returns: 8-12% for apparel, 2-5% for electronics`,
    metadata: {
      type: 'business_model_knowledge',
      industry: 'ecommerce',
      category: 'optimization',
      year: 2025
    }
  },
  {
    id: 'bmc-003',
    content: `Marketplace Business Model Patterns:

Network Effects and Scaling:
- Liquidity threshold: Need 10-20 active suppliers per demand category
- Chicken-and-egg: Subsidize supply side early (60-70% of early budget)
- Take rates: 10-20% typical, 25%+ for managed marketplaces
- Defensibility: Network effects kick in at ~50K active users

Revenue Model Evolution:
- Phase 1 (Year 0-2): Low/no take rate, focus on GMV growth
- Phase 2 (Year 2-4): Introduce 10-15% take rate, add monetization
- Phase 3 (Year 4+): Optimize to 20%+, add SaaS tools, advertising

Cost Structure:
- Customer acquisition (demand side): $20-50 per customer
- Supplier acquisition: $200-500 per supplier
- Trust & safety: 2-4% of GMV
- Payment processing: 2.9% + $0.30 per transaction
- Customer support: 4-6% of GMV

Key Metrics:
- GMV (Gross Merchandise Value) primary growth metric
- Take rate × Repeat rate = Revenue sustainability
- Supplier concentration: Top 20% suppliers shouldn't exceed 50% of GMV`,
    metadata: {
      type: 'business_model_knowledge',
      industry: 'marketplace',
      category: 'scaling_patterns',
      year: 2025
    }
  },
  {
    id: 'bmc-004',
    content: `Service Business Revenue Diversification Strategies:

Traditional Services Challenges:
- Linear revenue: Trading time for money limits scaling
- High customer concentration risk: Top 3 clients often 50%+ of revenue
- Lumpy cash flow: Project-based revenue inconsistent
- Low margins: 20-35% typical for consulting/agencies

Diversification Tactics:
1. Retainer Model (30-40% of revenue goal)
   - Monthly recurring services
   - Predictable cash flow
   - 40-60% higher LTV than project work

2. Productized Services (20-30% of revenue)
   - Standardized offerings at fixed price
   - 50-70% higher margins than custom work
   - Examples: Fixed-scope audits, workshops, implementations

3. Digital Products (10-20% of revenue)
   - Training courses, templates, tools
   - 85-95% gross margins
   - Passive income potential

4. Software/Platform (10-20% of revenue)
   - Build tools for your service delivery
   - License to others in industry
   - High upfront investment but scales

Implementation Order: Retainers first (year 1), productized second (year 2), digital third (year 3), software fourth (year 4+)`,
    metadata: {
      type: 'business_model_knowledge',
      industry: 'professional_services',
      category: 'revenue_diversification',
      focus: 'services_to_products'
    }
  },
  {
    id: 'bmc-005',
    content: `Cost Structure Optimization Tactics by Business Stage:

Startup (0-$1M revenue):
Priority: Minimize fixed costs, maximize flexibility
- Use contractors vs full-time (60/40 split)
- Cloud infrastructure (AWS, GCP) pay-as-you-go
- No-code/low-code tools to reduce dev costs
- Coworking vs office lease
Target: 80%+ variable costs

Growth ($1M-$10M revenue):
Priority: Build leverage, strategic automation
- Transition to 50/50 contractor/FTE mix
- Invest in automation: CRM, billing, support (ROI: 3-6 months)
- Reserved instance pricing for infrastructure (30-50% savings)
- Hire specialists vs generalists
Target: 60-70% variable costs

Scale ($10M+ revenue):
Priority: Economies of scale, margin expansion
- 70-80% full-time team for retention
- Custom infrastructure for high-volume operations
- Vertical integration where strategic (e.g., own fulfillment)
- Offshore/nearshore for non-core functions (40-60% cost savings)
Target: 50-60% variable costs, improving unit economics`,
    metadata: {
      type: 'business_model_knowledge',
      category: 'cost_optimization',
      focus: 'stage_based_strategy'
    }
  },
];

// ============================================================================
// Lean Canvas Knowledge
// ============================================================================

const leanCanvasKnowledge = [
  {
    id: 'lc-001',
    content: `Lean Startup Validation Strategies and Frameworks:

MVP Types Ranked by Speed and Learning:
1. Smoke Test (1-2 weeks)
   - Landing page with email signup
   - Measures: Interest level, conversion rate
   - Cost: $500-2K
   - Best for: B2C products, validating problem

2. Concierge MVP (2-4 weeks)
   - Manual delivery of solution to 5-10 customers
   - Measures: Willingness to pay, solution fit
   - Cost: Time investment
   - Best for: B2B, complex solutions

3. Wizard of Oz (4-8 weeks)
   - Automated interface, manual backend
   - Measures: Product usage patterns, feature value
   - Cost: $5K-20K
   - Best for: AI/automation products

4. Single-Feature MVP (8-12 weeks)
   - One core feature fully functional
   - Measures: Retention, engagement, referrals
   - Cost: $20K-50K
   - Best for: Platform/SaaS products

Validation Criteria:
- Problem validation: 40%+ of target users experience problem weekly
- Solution validation: 30%+ would pay within 2 weeks of trial
- Market validation: TAM $100M+, reachable distribution channel`,
    metadata: {
      type: 'lean_canvas_knowledge',
      category: 'validation_strategies',
      stage: 'mvp',
      focus: 'experiment_design'
    }
  },
  {
    id: 'lc-002',
    content: `Common Startup Unfair Advantages - Examples and Defensibility:

Network Effects (Highest defensibility):
- Each user makes product more valuable for others
- Examples: Marketplaces, social platforms, collaboration tools
- Defensibility timeline: 2-3 years to become unassailable
- Required scale: 100K+ active users typically

Proprietary Data (High defensibility):
- Unique dataset that improves product
- Examples: Training data for AI, maps, financial data
- Defensibility timeline: 1-2 years if exclusive
- Accumulation: Requires 1M+ data points for moat

Regulatory Advantages (Medium-High defensibility):
- Licenses, certifications, compliance that block competitors
- Examples: Financial services licenses, medical device approval
- Defensibility timeline: 3-5 years (time to get approved)
- Investment: $500K-5M+ to achieve

Brand/Community (Medium defensibility):
- Strong brand recognition and loyal community
- Examples: Cult followings, category leadership
- Defensibility timeline: 3-5 years to build
- Requires: Consistent quality + community engagement

Insider Information (Medium defensibility):
- Unique industry knowledge or relationships
- Examples: Domain expertise, strategic partnerships
- Defensibility timeline: 1-3 years before knowledge spreads
- Warning: Weakest long-term, must transition to other advantages`,
    metadata: {
      type: 'lean_canvas_knowledge',
      category: 'unfair_advantages',
      focus: 'competitive_moats'
    }
  },
  {
    id: 'lc-003',
    content: `Lean Canvas Key Metrics by Business Model:

SaaS Metrics:
Primary: Monthly Recurring Revenue (MRR), ARR growth rate
Acquisition: CAC, time to first value, activation rate
Activation: Free-to-paid conversion, time to aha moment
Retention: Logo churn, net revenue retention, DAU/MAU ratio
Revenue: ARPU, expansion revenue, LTV:CAC ratio
Referral: NPS, viral coefficient, organic signups %

Marketplace Metrics:
Primary: GMV (Gross Merchandise Value), take rate
Acquisition: Supply acquisition cost, demand CAC
Activation: Time to first transaction, onboarding completion
Retention: Repeat transaction rate, supplier concentration
Revenue: Net take rate, attach rate for additional services
Liquidity: Suppliers per category, fulfillment rate

E-commerce Metrics:
Primary: Revenue, units sold
Acquisition: CAC by channel, ROAS (Return on Ad Spend)
Activation: Add to cart rate, checkout completion
Retention: Repeat purchase rate, cohort LTV
Revenue: AOV (Average Order Value), gross margin
Referral: Organic traffic %, viral coefficient

B2B Service Metrics:
Primary: Monthly recurring services revenue, project pipeline
Acquisition: Lead-to-customer rate, sales cycle length
Activation: Contract signed to value delivered time
Retention: Client churn, net dollar retention
Revenue: Revenue per client, gross margin per project
Referral: Referrals as % of new clients`,
    metadata: {
      type: 'lean_canvas_knowledge',
      category: 'key_metrics',
      focus: 'business_model_specific'
    }
  },
  {
    id: 'lc-004',
    content: `Customer Discovery Best Practices - Jobs-to-be-Done Framework:

Interview Structure (45-60 min):
1. Current behavior (15 min)
   - "Walk me through the last time you [did related task]"
   - "What tools/methods do you currently use?"
   - "What's frustrating about current solution?"

2. Desired outcomes (15 min)
   - "What would make this 10x better?"
   - "If you had a magic wand, what would you change?"
   - "What would you pay for that improvement?"

3. Purchase decision (15 min)
   - "Who else is involved in buying decisions?"
   - "What's your budget for solving this?"
   - "What would stop you from buying?"

Red Flags During Discovery:
- "Interesting idea" (polite rejection - no pain point)
- "I might use it" (no urgency)
- "Let me think about it" (not priority)
- "Send me info" (low intent)

Green Flags:
- "When can I get this?" (high intent)
- "I'd pay $X today" (willingness to pay)
- "This is my biggest problem" (urgency)
- "Can you start next week?" (budget available)

Sample Size Guidelines:
- B2C: 30-50 interviews minimum
- B2B: 15-25 interviews minimum
- Rule: Stop when hearing same feedback 3x in a row`,
    metadata: {
      type: 'lean_canvas_knowledge',
      category: 'customer_discovery',
      focus: 'interview_techniques'
    }
  },
  {
    id: 'lc-005',
    content: `Early-Stage Financial Planning - Lean Canvas Cost Structure:

Pre-Product (Idea stage, 0-3 months):
Fixed costs: $0-2K/month (tools, subscriptions)
Variable costs: $5-10K (customer discovery, prototypes)
Runway needed: 3-6 months, $15-30K
Key expense: Time for customer discovery

MVP Development (3-9 months):
Fixed costs: $3-8K/month (contractors, tools, hosting)
Variable costs: $20-80K (MVP development)
Runway needed: 6-12 months, $40-120K
Key expense: Product development

Early Traction (9-18 months):
Fixed costs: $15-40K/month (1-3 FTEs, hosting, tools)
Variable costs: $10-30K/month (marketing, sales)
Runway needed: 12-18 months, $300-600K
Key expense: Customer acquisition

Financial Milestones:
- $10K MRR: Validate product-market fit
- $50K MRR: Hire first full-time employees
- $100K MRR: Product-market fit confirmed, scale marketing
- $500K MRR: Build executive team, raise Series A

Burn Rate Guidelines:
- Pre-product: Burn <$5K/month (bootstrap)
- MVP: Burn <$15K/month
- Traction: Target 18+ month runway at all times
- Growth: Once PMF confirmed, can increase burn for growth`,
    metadata: {
      type: 'lean_canvas_knowledge',
      category: 'financial_planning',
      stage: 'early_stage',
      focus: 'budget_milestones'
    }
  },
];

// ============================================================================
// Main Seeding Functions
// ============================================================================

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function seedKnowledgeToPinecone(knowledge: any[], indexName: string) {
  console.log(`\n📊 Processing ${knowledge.length} knowledge documents...`);

  const index = pinecone.index(indexName);

  // Generate embeddings for all knowledge docs
  const vectorsWithEmbeddings = await Promise.all(
    knowledge.map(async (doc, i) => {
      console.log(`  Generating embedding ${i + 1}/${knowledge.length}: ${doc.id}`);
      const embedding = await generateEmbedding(doc.content);

      return {
        id: doc.id,
        values: embedding,
        metadata: {
          ...doc.metadata,
          content: doc.content, // Store content in metadata for retrieval
          created_at: new Date().toISOString(),
        },
      };
    })
  );

  // Upload to Pinecone in batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectorsWithEmbeddings.length; i += batchSize) {
    const batch = vectorsWithEmbeddings.slice(i, i + batchSize);
    console.log(`\n📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectorsWithEmbeddings.length / batchSize)}...`);

    await index.upsert(batch);
    console.log(`   ✅ Uploaded ${batch.length} vectors`);
  }

  console.log(`\n✅ Successfully seeded ${vectorsWithEmbeddings.length} knowledge documents to Pinecone!`);
}

async function main() {
  console.log('🚀 Starting Strategic Framework Knowledge Seeding...\n');

  const indexName = process.env.PINECONE_INDEX_NAME || 'local-ai-demos';
  console.log(`📌 Using Pinecone index: ${indexName}\n`);

  // Combine all knowledge
  const allKnowledge = [
    ...digitalMaturityKnowledge,
    ...pestelKnowledge,
    ...businessModelKnowledge,
    ...leanCanvasKnowledge,
  ];

  console.log(`📚 Total knowledge documents to seed: ${allKnowledge.length}`);
  console.log(`   - Digital Maturity: ${digitalMaturityKnowledge.length}`);
  console.log(`   - PESTEL Analysis: ${pestelKnowledge.length}`);
  console.log(`   - Business Model Canvas: ${businessModelKnowledge.length}`);
  console.log(`   - Lean Canvas: ${leanCanvasKnowledge.length}`);

  await seedKnowledgeToPinecone(allKnowledge, indexName);

  console.log('\n🎉 Seeding complete! The agents can now retrieve this knowledge via RAG.');
  console.log('\n📋 Next steps:');
  console.log('   1. Test the frameworks to verify RAG integration');
  console.log('   2. Monitor query performance and relevance');
  console.log('   3. Add more knowledge documents based on usage patterns');
}

// Run the seeding
main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  });
