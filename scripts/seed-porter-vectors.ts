/**
 * Seed Porter Framework Knowledge Base into Vector Database
 *
 * This script populates the vector database with Porter's core frameworks
 * so they can be retrieved via semantic search during analysis.
 *
 * Usage:
 *   npx tsx scripts/seed-porter-vectors.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { VectorRepository } from "../lib/repositories/vector-repository";
import { generateEmbedding } from "../lib/embeddings/embedding-service";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Porter's Core Knowledge Base (will be converted to vectors)
const PORTER_KNOWLEDGE_CHUNKS = [
  {
    id: "porter-five-forces-overview",
    framework: "five_forces",
    title: "Porter's Five Forces Framework Overview",
    content: `Porter's Five Forces is a framework for analyzing industry competition and profitability. The five forces are:

1. THREAT OF NEW ENTRANTS - How easy is it for new competitors to enter the market?
   - Barriers to entry: economies of scale, capital requirements, brand loyalty, access to distribution channels
   - Government regulations and patents
   - Expected retaliation from existing competitors

2. BARGAINING POWER OF SUPPLIERS - How much power do suppliers have over price and quality?
   - Supplier concentration vs. industry concentration
   - Uniqueness of supplier's product or service
   - Switching costs for the industry
   - Threat of forward integration by suppliers

3. BARGAINING POWER OF BUYERS - How much power do customers have to drive prices down?
   - Buyer volume relative to seller's sales
   - Degree of standardization of products
   - Switching costs for buyers
   - Buyer's information about costs and demand
   - Threat of backward integration by buyers

4. THREAT OF SUBSTITUTES - How easily can customers find alternatives?
   - Relative price-performance of substitutes
   - Switching costs to substitutes
   - Buyer propensity to substitute
   - Emerging technologies that could replace the product

5. COMPETITIVE RIVALRY - How intense is the competition among existing players?
   - Number and diversity of competitors
   - Industry growth rate
   - Fixed costs and exit barriers
   - Product differentiation
   - Strategic stakes`,
    source: "Competitive Strategy (1980)",
    category: "framework",
  },
  {
    id: "porter-five-forces-entry-barriers",
    framework: "five_forces",
    title: "Barriers to Entry - Detailed Analysis",
    content: `Barriers to entry prevent new competitors from easily entering an industry:

ECONOMIES OF SCALE
- Spreading fixed costs over more units reduces per-unit cost
- Large players have cost advantages that new entrants can't match
- Examples: manufacturing, distribution, R&D, marketing

CAPITAL REQUIREMENTS
- Large upfront investments in equipment, inventory, R&D
- High capital needs deter new entrants
- Sunk costs that can't be recovered if business fails

PRODUCT DIFFERENTIATION & BRAND IDENTITY
- Established brands have customer loyalty
- New entrants must spend heavily to overcome brand loyalty
- First-mover advantages in brand building

ACCESS TO DISTRIBUTION CHANNELS
- Limited shelf space, established relationships
- Existing players may have exclusive arrangements
- New entrants may need to create new channels

COST DISADVANTAGES INDEPENDENT OF SCALE
- Proprietary technology or patents
- Favorable locations or raw material sources
- Learning curve advantages
- Government subsidies to existing players

GOVERNMENT POLICY
- Licensing requirements
- Regulations and safety standards
- Environmental restrictions
- Trade restrictions`,
    source: "Competitive Strategy (1980)",
    category: "barriers",
  },
  {
    id: "porter-generic-strategies",
    framework: "generic_strategies",
    title: "Porter's Three Generic Strategies",
    content: `Porter identified three generic strategies for achieving competitive advantage:

1. COST LEADERSHIP
   Goal: Become the lowest-cost producer in the industry
   
   How to achieve:
   - Economies of scale in production, distribution, marketing
   - Proprietary technology and cost-efficient processes
   - Preferential access to raw materials
   - Tight cost control and overhead minimization
   - Process innovation and continuous improvement
   
   Risks:
   - Technology changes that nullify past investments
   - Competitors learn to imitate cost-reduction methods
   - Inability to see required product or market changes
   - Cost inflation that narrows the price differential

2. DIFFERENTIATION
   Goal: Be unique in ways that customers value and will pay for
   
   How to achieve:
   - Superior product features and performance
   - Brand image and reputation
   - Proprietary technology
   - Customer service excellence
   - Dealer network strength
   - Innovation and design
   
   Risks:
   - Cost differential becomes too great
   - Buyers' need for differentiation falls
   - Imitation narrows perceived differentiation
   - Unable to maintain premium pricing

3. FOCUS (Cost Focus or Differentiation Focus)
   Goal: Serve a particular segment exceptionally well
   
   How to achieve:
   - Deep understanding of segment needs
   - Tailored products/services for the niche
   - Either lowest cost OR best differentiation for that segment
   - Build barriers to competition within the segment
   
   Risks:
   - Cost differential between focused and broad-target firms widens
   - Segment differences from other segments narrow
   - Competitors find sub-segments within the target segment

CRITICAL WARNING: "Stuck in the Middle"
- Firms that don't commit to one strategy end up with no competitive advantage
- They lack market share of cost leaders and profit margins of differentiators
- Must make TRADE-OFFS - can't be all things to all people`,
    source: "Competitive Strategy (1980)",
    category: "strategy",
  },
  {
    id: "porter-value-chain",
    framework: "value_chain",
    title: "Porter's Value Chain Analysis",
    content: `The Value Chain breaks down a company into strategically relevant activities to understand sources of competitive advantage.

PRIMARY ACTIVITIES (Direct value creation):

1. INBOUND LOGISTICS
   - Receiving, storing, inventory control
   - Material handling and warehousing
   - Vendor relationships and quality control

2. OPERATIONS
   - Transforming inputs into final product
   - Machining, assembly, packaging
   - Equipment maintenance and testing
   - Facility operations

3. OUTBOUND LOGISTICS
   - Collecting, storing, distributing product to buyers
   - Finished goods warehousing
   - Order processing and scheduling
   - Delivery vehicle operations

4. MARKETING & SALES
   - Inducing buyers to purchase
   - Advertising, promotion, sales force
   - Channel selection and relations
   - Pricing and market research

5. SERVICE
   - Maintaining or enhancing product value
   - Installation, repair, training
   - Parts supply and product adjustment
   - Customer support

SUPPORT ACTIVITIES (Enable primary activities):

1. FIRM INFRASTRUCTURE
   - General management, planning, finance
   - Legal, accounting, quality management
   - Information systems

2. HUMAN RESOURCE MANAGEMENT
   - Recruiting, hiring, training, development
   - Compensation and benefits
   - Labor relations

3. TECHNOLOGY DEVELOPMENT
   - R&D, product design, process improvement
   - Technology related to all activities
   - Information systems development

4. PROCUREMENT
   - Purchasing inputs for all activities
   - Vendor negotiations and management
   - Purchasing policies and procedures

KEY CONCEPTS:
- LINKAGES: Activities are interdependent; optimizing links creates advantage
- COST DRIVERS: Scale, learning, capacity utilization, linkages, timing
- DIFFERENTIATION DRIVERS: Policy choices, linkages, timing, location, learning`,
    source: "Competitive Advantage (1985)",
    category: "analysis",
  },
  {
    id: "porter-competitive-advantage",
    framework: "competitive_advantage",
    title: "What Creates Sustainable Competitive Advantage?",
    content: `Sustainable competitive advantage comes from activities that are valuable, rare, difficult to imitate, and organizationally supported (VRIO Framework):

VALUABLE
- Activities that allow the firm to exploit opportunities or neutralize threats
- Must create value for customers AND the firm
- Not all activities are equally valuable

RARE
- Few competitors possess this capability
- If many competitors have it, it's not a source of advantage
- Scarcity creates competitive leverage

DIFFICULT TO IMITATE (Isolating Mechanisms)
- Unique historical conditions (first-mover advantages)
- Causal ambiguity (hard to understand how success was achieved)
- Social complexity (culture, teamwork, reputation)
- Patents and legal protection
- Geographic advantages

ORGANIZATIONALLY SUPPORTED
- Firm must be organized to exploit the advantage
- Proper structure, processes, and culture
- Complementary resources and capabilities

WHAT IS NOT COMPETITIVE ADVANTAGE:
❌ Operational Effectiveness - Doing the same things better than rivals
   - Benchmarking best practices
   - Total quality management
   - Continuous improvement
   - These are necessary but not sufficient (everyone can copy)

✅ STRATEGY IS ABOUT TRADE-OFFS
- Choosing what NOT to do is as important as what to do
- Trade-offs create the need to choose and limit what competitors can imitate
- Inconsistent activities are hard to copy as a system

✅ FIT AMONG ACTIVITIES
- Competitive advantage comes from the way activities fit and reinforce each other
- The whole system is harder to imitate than individual parts
- First-order fit: Simple consistency among activities
- Second-order fit: Activities reinforce each other
- Third-order fit: Optimization of effort across activities

SUSTAINABILITY SOURCES:
1. Activities that trade off against competitors' positions
2. A system of interlocking activities (not easy to unbundle)
3. Continuous improvement within the strategy (not imitating others)`,
    source: "What is Strategy? (1996)",
    category: "competitive_advantage",
  },
  {
    id: "porter-strategy-vs-operational-effectiveness",
    framework: "competitive_advantage",
    title: "Strategy vs. Operational Effectiveness",
    content: `A critical distinction that many businesses miss:

OPERATIONAL EFFECTIVENESS (Necessary but not sufficient)
- Doing the same activities better than rivals
- Faster, with fewer defects, better skills
- Examples: TQM, benchmarking, outsourcing, partnering, reengineering
- Problem: Best practices spread quickly; competitive convergence
- Results in mutually destructive price competition
- The "productivity frontier" shifts outward but everyone catches up

STRATEGIC POSITIONING (The real source of advantage)
- Performing DIFFERENT activities than rivals
- Performing SIMILAR activities in DIFFERENT ways
- Creating a unique and valuable position
- Making TRADE-OFFS in competing
- Building FIT among activities

THREE TYPES OF STRATEGIC POSITIONING:

1. VARIETY-BASED POSITIONING
   - Produce a subset of products/services in the industry
   - Based on choosing product varieties rather than customer segments
   - Makes sense when company can produce particular products better than others
   - Example: Jiffy Lube focuses only on auto lubrication (not full service)

2. NEEDS-BASED POSITIONING
   - Serve most or all needs of particular customer groups
   - Requires different set of activities to serve these needs
   - Example: IKEA serves all needs of young, price-conscious furniture buyers
   
3. ACCESS-BASED POSITIONING
   - Segment customers accessible in different ways
   - Geography, customer size, or service requirements differ
   - Example: Rural bank serves small towns differently than urban banks

WHY TRADE-OFFS ARE ESSENTIAL:
1. Inconsistencies in image or reputation
   - Can't be high-end AND low-cost in customers' minds
   
2. Different positions require different configurations
   - Activities, product features, skills, systems clash
   
3. Limits on internal coordination
   - Different positions require different management approaches
   - Clear positioning clarifies priorities

THE FIT TEST:
- Can you explain your strategy in one sentence?
- Would your competitors choose NOT to do what you do?
- Does pursuing your strategy mean deliberately NOT serving some customers?
- Do your activities reinforce each other?`,
    source: "What is Strategy? (1996)",
    category: "strategy_fundamentals",
  },
];

async function seedPorterVectors() {
  console.log("🌱 Seeding Porter Framework Vectors...\n");

  // Determine which provider to use
  const provider =
    (process.env.VECTOR_PROVIDER as "supabase" | "pinecone") || "supabase";
  console.log(`📊 Using vector provider: ${provider}\n`);

  const repo = new VectorRepository(provider);

  let successCount = 0;
  let errorCount = 0;

  for (const chunk of PORTER_KNOWLEDGE_CHUNKS) {
    try {
      console.log(`Processing: ${chunk.title}`);

      // Generate embedding for the content
      const embedding = await generateEmbedding(chunk.content);

      // Create vector record
      const vectorRecord = {
        id: chunk.id,
        values: embedding,
        metadata: {
          demoId: "porter-knowledge-base", // Special demo_id for framework knowledge
          framework: chunk.framework,
          title: chunk.title,
          content: chunk.content,
          source: chunk.source,
          category: chunk.category,
          analysisType: "porter_framework",
          agentType: "porter",
          timestamp: new Date().toISOString(),
          confidence: 1.0, // Framework knowledge is always high confidence
        },
      };

      // Upsert to vector database
      await repo.provider.upsert([vectorRecord]);

      console.log(`✅ Seeded: ${chunk.id}`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to seed ${chunk.id}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Seeding Complete!");
  console.log("=".repeat(60));
  console.log(`✅ Successfully seeded: ${successCount} chunks`);
  console.log(`❌ Failed: ${errorCount} chunks`);
  console.log(`📊 Total: ${PORTER_KNOWLEDGE_CHUNKS.length} chunks`);
  console.log("\n💡 Porter framework knowledge is now available for RAG!");
  console.log(
    "   Agents can now retrieve relevant frameworks during analysis.\n"
  );
}

// Run if called directly
if (require.main === module) {
  seedPorterVectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { PORTER_KNOWLEDGE_CHUNKS, seedPorterVectors };
