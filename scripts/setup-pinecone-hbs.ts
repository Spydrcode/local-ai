/**
 * Setup Pinecone index optimized for Harvard Business School (HBS) Agents
 *
 * Extends Porter Intelligence Stack with:
 * - SWOT + TOWS + PESTEL analysis (SWOTAgent)
 * - Business Model Canvas (OsterwalderAgent)
 * - Go-To-Market Strategy (GTMPlannerAgent)
 * - Cross-agent strategic synthesis (HBSOrchestrator)
 *
 * Usage:
 *   npm run setup:pinecone-hbs
 *   or
 *   npx tsx scripts/setup-pinecone-hbs.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setupPineconeForHBS() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";

  if (!apiKey) {
    console.error("❌ PINECONE_API_KEY not found in .env.local");
    console.log("\nPlease add your Pinecone API key:");
    console.log("1. Sign up at https://www.pinecone.io/");
    console.log("2. Create an API key in the console");
    console.log("3. Add to .env.local: PINECONE_API_KEY=your-key-here");
    process.exit(1);
  }

  console.log("🎓 Setting up Pinecone for Harvard Business School Agents...\n");

  const pinecone = new Pinecone({ apiKey });

  try {
    // Check if index exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (idx) => idx.name === indexName
    );

    if (existingIndex) {
      console.log(`✅ Index "${indexName}" already exists`);
      console.log(`   Dimension: ${existingIndex.dimension}`);
      console.log(`   Metric: ${existingIndex.metric}`);
      console.log(`   Status: ${existingIndex.status?.state || "unknown"}`);
    } else {
      console.log(`📦 Creating new index: ${indexName}...`);

      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI ada-002 embedding size
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        deletionProtection: "disabled",
      });

      console.log("✅ Index created successfully");
    }

    // Get index stats
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();

    console.log("\n📊 Index Statistics:");
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimensions: ${stats.dimension}`);
    console.log(
      `   Index fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`
    );

    console.log("\n🎓 HBS Agent Metadata Schema:");
    console.log("\n📋 Core Fields:");
    console.log("   ✓ demoId (string) - Links to demos table");
    console.log(
      "   ✓ analysisType (string) - hbs_swot, hbs_business_model, hbs_gtm, hbs_synthesis"
    );
    console.log("   ✓ category (string) - strategic, market, synthesis");
    console.log(
      "   ✓ hbsFramework (string) - SWOT, Business Model Canvas, GTM Strategy"
    );
    console.log(
      "   ✓ hbsAgentName (string) - SWOTAgent, OsterwalderAgent, GTMPlannerAgent"
    );
    console.log("   ✓ hbsLayer (string) - strategy, market, synthesis");
    console.log("   ✓ confidence (number) - 0.0-1.0 quality score");
    console.log("   ✓ timestamp (string) - ISO 8601 datetime");
    console.log("   ✓ tags (string[]) - hbs, swot, bmc, gtm, etc.");

    console.log("\n📋 SWOT-Specific Fields:");
    console.log(
      "   ✓ swotQuadrant - strengths, weaknesses, opportunities, threats"
    );
    console.log("   ✓ towsStrategy - SO, ST, WO, WT (TOWS matrix quadrants)");
    console.log(
      "   ✓ pestelFactor - political, economic, social, technological, environmental, legal"
    );
    console.log(
      "   ✓ strategicPosition - aggressive, conservative, defensive, competitive"
    );

    console.log("\n📋 Business Model Canvas Fields:");
    console.log(
      "   ✓ canvasBlock - customer_segments, value_propositions, channels, etc."
    );
    console.log(
      "   ✓ revenueModel - subscription, transaction, freemium, licensing, etc."
    );
    console.log("   ✓ canvasCoherence - 0.0-1.0 alignment score");

    console.log("\n📋 GTM Strategy Fields:");
    console.log(
      "   ✓ gtmApproach - land_and_expand, bowling_pin, big_bang, segmented_rollout"
    );
    console.log(
      "   ✓ channelType - direct_sales, inside_sales, partners, online, retail"
    );
    console.log(
      "   ✓ pricingModel - value_based, competitive, cost_plus, penetration, etc."
    );
    console.log(
      "   ✓ launchPhase - pre_launch, soft_launch, full_launch, post_launch"
    );
    console.log("   ✓ ltvCacRatio - number (unit economics)");

    console.log("\n🔍 HBS Agent Vector ID Patterns:");
    console.log("\n   SWOT Analysis:");
    console.log("   - {demoId}-swot-strengths");
    console.log("   - {demoId}-swot-weaknesses");
    console.log("   - {demoId}-swot-opportunities");
    console.log("   - {demoId}-swot-threats");
    console.log("   - {demoId}-tows-SO (Strength-Opportunity strategies)");
    console.log("   - {demoId}-tows-ST (Strength-Threat strategies)");
    console.log("   - {demoId}-tows-WO (Weakness-Opportunity strategies)");
    console.log("   - {demoId}-tows-WT (Weakness-Threat strategies)");
    console.log("   - {demoId}-pestel-{factor}");
    console.log("   - {demoId}-strategic-position");

    console.log("\n   Business Model Canvas:");
    console.log("   - {demoId}-bmc-customer_segments");
    console.log("   - {demoId}-bmc-value_propositions");
    console.log("   - {demoId}-bmc-channels");
    console.log("   - {demoId}-bmc-customer_relationships");
    console.log("   - {demoId}-bmc-revenue_streams");
    console.log("   - {demoId}-bmc-key_resources");
    console.log("   - {demoId}-bmc-key_activities");
    console.log("   - {demoId}-bmc-key_partnerships");
    console.log("   - {demoId}-bmc-cost_structure");
    console.log("   - {demoId}-bmc-assumptions");

    console.log("\n   GTM Strategy:");
    console.log("   - {demoId}-gtm-entry (market entry strategy)");
    console.log("   - {demoId}-gtm-beachhead (beachhead market)");
    console.log("   - {demoId}-gtm-channels (channel strategy)");
    console.log("   - {demoId}-gtm-pricing (pricing strategy)");
    console.log("   - {demoId}-gtm-acquisition (acquisition strategy)");
    console.log("   - {demoId}-gtm-launch (launch plan)");

    console.log("\n💡 Search & Retrieval Functions:");
    console.log("   ✓ searchSWOTVectors(demoId, query, quadrant?, topK)");
    console.log(
      "   ✓ searchBusinessModelVectors(demoId, query, canvasBlock?, topK)"
    );
    console.log(
      "   ✓ searchGTMStrategyVectors(demoId, query, component?, topK)"
    );
    console.log(
      "   ✓ getHBSStrategicContext(demoId) - Get all HBS agent results"
    );
    console.log(
      "   ✓ searchHBSCombinedInsights(demoId, query, insightType?, minConfidence, topK)"
    );

    console.log("\n🎯 Query Examples:");
    console.log("\n   Search SWOT Opportunities:");
    console.log("   ```typescript");
    console.log("   const opportunities = await searchSWOTVectors(");
    console.log("     'demo-123',");
    console.log("     'market expansion opportunities',");
    console.log("     'opportunities',");
    console.log("     5");
    console.log("   );");
    console.log("   ```");

    console.log("\n   Search Business Model Revenue Streams:");
    console.log("   ```typescript");
    console.log("   const revenueStreams = await searchBusinessModelVectors(");
    console.log("     'demo-123',");
    console.log("     'subscription revenue models',");
    console.log("     'revenue_streams',");
    console.log("     3");
    console.log("   );");
    console.log("   ```");

    console.log("\n   Search GTM Channel Strategy:");
    console.log("   ```typescript");
    console.log("   const channels = await searchGTMStrategyVectors(");
    console.log("     'demo-123',");
    console.log("     'digital marketing channels',");
    console.log("     'channels',");
    console.log("     5");
    console.log("   );");
    console.log("   ```");

    console.log("\n   Get Complete Strategic Context:");
    console.log("   ```typescript");
    console.log("   const context = await getHBSStrategicContext(");
    console.log("     'demo-123'");
    console.log("   );");
    console.log(
      "   // Returns: { swot: [...], businessModel: [...], gtm: [...] }"
    );
    console.log("   ```");

    console.log("\n🔄 Integration with Existing Systems:");
    console.log(
      "   ✓ Porter Intelligence Stack (9 agents) - Competitive analysis"
    );
    console.log("   ✓ Economic Intelligence - Macro trends & predictions");
    console.log("   ✓ HBS Strategy Layer - SWOT, Business Model, GTM");
    console.log("   ✓ Cross-Agent Synthesis - Unified strategic insights");

    console.log("\n📈 Performance Optimizations:");
    console.log(
      "   ✓ Granular chunking - Each SWOT quadrant, BMC block, GTM component separate"
    );
    console.log(
      "   ✓ Rich metadata - Filter by framework, agent, confidence, component"
    );
    console.log("   ✓ Parallel storage - All vectors upserted in single batch");
    console.log(
      "   ✓ Targeted retrieval - Search specific components (e.g., only opportunities)"
    );
    console.log(
      "   ✓ Cross-agent context - Link SWOT → BMC → GTM for synthesis"
    );

    console.log("\n✅ Pinecone HBS optimization complete!");
    console.log(`   Index name: ${indexName}`);
    console.log(
      `   Current provider: ${process.env.VECTOR_PROVIDER || "supabase (default)"}`
    );
    console.log(
      "   Set VECTOR_PROVIDER=pinecone in .env.local to use Pinecone"
    );

    console.log("\n📚 Next Steps:");
    console.log(
      "   1. Run HBS agents (SWOT, Business Model Canvas, GTM Strategy)"
    );
    console.log("   2. Vectors automatically stored with rich metadata");
    console.log(
      "   3. Use specialized search functions to retrieve strategic insights"
    );
    console.log("   4. Build dashboards with vector-powered context");
    console.log(
      "   5. Enable cross-agent synthesis for unified strategic planning"
    );
  } catch (error) {
    console.error("❌ Error setting up Pinecone for HBS:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupPineconeForHBS();
}

export { setupPineconeForHBS };
