/**
 * Setup Pinecone index optimized for Economic Intelligence & Predictive Analytics
 *
 * Updates Pinecone index to support:
 * - Economic context analysis (inflation, unemployment, interest rates, consumer confidence)
 * - Industry-specific impact assessment
 * - Profit predictions with macro adjustments
 * - Scenario planning (worst/likely/best case)
 * - Regulatory threat monitoring
 * - Sensitivity analysis
 *
 * Usage:
 *   npm run setup:pinecone:economic
 *   or
 *   npx tsx scripts/setup-pinecone-economic.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setupPineconeForEconomicIntelligence() {
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

  console.log("🚀 Setting up Pinecone for Economic Intelligence...\n");

  const pinecone = new Pinecone({ apiKey });

  try {
    // Check if index exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (idx) => idx.name === indexName
    );

    if (!existingIndex) {
      console.error(`❌ Index "${indexName}" does not exist`);
      console.log(
        "\nPlease run setup-pinecone-porter.ts first to create the base index"
      );
      process.exit(1);
    }

    console.log(`✅ Index "${indexName}" found`);
    console.log(`   Dimension: ${existingIndex.dimension}`);
    console.log(`   Metric: ${existingIndex.metric}`);

    // Get index stats
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();

    console.log("\n📊 Current Index Statistics:");
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimensions: ${stats.dimension}`);
    console.log(
      `   Index fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`
    );

    console.log("\n📋 Economic Intelligence Metadata Schema:");
    console.log("   Core Fields:");
    console.log("   ✓ demoId (string) - Links to demos table");
    console.log("   ✓ analysisType (string) - 'economic_intelligence'");
    console.log("   ✓ timestamp (string) - ISO 8601 datetime");
    console.log("   ✓ content (string) - Full analysis text");

    console.log("\n   Economic-Specific Fields:");
    console.log(
      "   ✓ economicAnalysisType (string) - context | impact | prediction | scenario | sensitivity"
    );
    console.log(
      "   ✓ industry (string) - Detected industry (e.g., 'Propane Services', 'Restaurants')"
    );
    console.log("   ✓ scenarioType (string) - worst | likely | best");
    console.log(
      "   ✓ threatLevel (string) - critical | major | moderate | minor"
    );
    console.log(
      "   ✓ timeframe (string) - immediate | 3-6 months | 6-12 months | 12+ months"
    );
    console.log("   ✓ confidence (number) - 0.0-1.0 prediction confidence");
    console.log(
      "   ✓ tags (string[]) - economic-intelligence, regulatory-threats, etc."
    );

    console.log("\n🔍 Economic Intelligence Vector IDs:");
    console.log("   Format: {demoId}-economic-{analysisType}");
    console.log("   Context Analysis:");
    console.log("     - {demoId}-economic-context (current indicators)");
    console.log("   Impact Analysis:");
    console.log("     - {demoId}-economic-impact (industry-specific)");
    console.log("   Profit Predictions:");
    console.log("     - {demoId}-economic-prediction-year1");
    console.log("     - {demoId}-economic-prediction-year2");
    console.log("     - {demoId}-economic-prediction-year3");
    console.log("   Scenario Planning:");
    console.log("     - {demoId}-economic-scenario-worst");
    console.log("     - {demoId}-economic-scenario-likely");
    console.log("     - {demoId}-economic-scenario-best");
    console.log("   Sensitivity Analysis:");
    console.log("     - {demoId}-economic-sensitivity");

    console.log("\n📈 Economic Analysis Components:");
    console.log("   1. Context (economicAnalysisType: 'context'):");
    console.log("      - Current inflation rate & trend");
    console.log("      - Unemployment rate & trend");
    console.log("      - Consumer confidence index & trend");
    console.log("      - Interest rates & Fed policy");
    console.log("      - Regulatory changes (SNAP, minimum wage, tax policy)");

    console.log("\n   2. Impact (economicAnalysisType: 'impact'):");
    console.log("      - Industry-specific economic factor impacts");
    console.log("      - Quantified revenue/margin effects (%)");
    console.log("      - Timeframe categorization");
    console.log("      - Threat & opportunity identification");

    console.log("\n   3. Prediction (economicAnalysisType: 'prediction'):");
    console.log("      - Baseline forecasts (stable economy)");
    console.log("      - Macro-adjusted forecasts (current conditions)");
    console.log("      - 3-year revenue & margin predictions");
    console.log("      - Confidence levels & risk factors");

    console.log("\n   4. Scenario (economicAnalysisType: 'scenario'):");
    console.log("      - Worst case (15-25% probability, survival focus)");
    console.log("      - Likely case (50-65% probability, adaptation)");
    console.log("      - Best case (15-25% probability, growth)");
    console.log("      - Specific action lists for each scenario");

    console.log("\n   5. Sensitivity (economicAnalysisType: 'sensitivity'):");
    console.log("      - Key variable impact analysis");
    console.log("      - Pessimistic/base/optimistic scenarios");
    console.log("      - Revenue impact quantification");

    console.log("\n🎯 Query Examples:");
    console.log("   1. Get current economic indicators:");
    console.log(
      "      searchEconomicIntelligenceVectors(demoId, 'inflation unemployment rates', 'context')"
    );

    console.log("\n   2. Find SNAP benefit threat impact:");
    console.log("      searchRegulatoryThreatsVectors(demoId, 'critical')");

    console.log("\n   3. Retrieve worst-case scenario actions:");
    console.log("      searchEconomicScenariosVectors(demoId, 'worst')");

    console.log("\n   4. Get all economic intelligence:");
    console.log("      getEconomicIntelligenceResults(demoId)");

    console.log("\n💡 Industry-Specific Tagging:");
    console.log("   Propane/Energy Services:");
    console.log("     - Tags: energy, propane, residential, commercial");
    console.log("     - SNAP impact: MODERATE (5-8% demand reduction)");
    console.log("     - Interest rate sensitivity: HIGH (new construction)");

    console.log("\n   Restaurants/Food Service:");
    console.log("     - Tags: food-service, restaurant, hospitality");
    console.log("     - SNAP impact: CRITICAL (15-25% revenue drop)");
    console.log("     - Food inflation sensitivity: HIGH (ingredient costs)");

    console.log("\n   Professional Services:");
    console.log("     - Tags: b2b, professional-services, consulting");
    console.log("     - SNAP impact: MINIMAL (consumer programs irrelevant)");
    console.log(
      "     - Corporate budget sensitivity: HIGH (economic uncertainty)"
    );

    console.log("\n🔧 Metadata Filter Examples:");
    console.log("   Filter by threat level:");
    console.log("     filter: { threatLevel: { $eq: 'critical' } }");

    console.log("\n   Filter by scenario type:");
    console.log("     filter: { scenarioType: { $in: ['worst', 'likely'] } }");

    console.log("\n   Filter by timeframe:");
    console.log("     filter: { timeframe: { $eq: 'immediate' } }");

    console.log("\n   Filter by industry:");
    console.log(
      "     filter: { industry: { $eq: 'Food Service & Restaurants' } }"
    );

    console.log("\n⚡ Performance Optimization:");
    console.log("   1. Cache economic context (changes monthly, not daily)");
    console.log(
      "   2. Group related queries (context + impact + prediction in parallel)"
    );
    console.log("   3. Filter by industry before semantic search");
    console.log("   4. Use confidence thresholds (minConfidence: 0.7+)");
    console.log("   5. Limit topK to 5-8 for scenario planning queries");

    console.log("\n✅ Economic Intelligence setup documentation complete!");
    console.log(`   Index name: ${indexName}`);
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(
      `   Current provider: ${process.env.VECTOR_PROVIDER || "supabase (default)"}`
    );

    console.log("\n📚 Next Steps:");
    console.log("   1. Generate economic intelligence for a demo");
    console.log(
      "   2. Vectors will be automatically stored with proper metadata"
    );
    console.log(
      "   3. Use search functions to retrieve specific analysis types"
    );
    console.log(
      "   4. Combine with Porter Intelligence for complete strategic view"
    );
    console.log("\n   Combined Analysis:");
    console.log("     - Porter: Competitive environment (micro)");
    console.log(
      "     - Economic: Macro environment (inflation, policy, demand)"
    );
    console.log("     - Together: Complete strategic picture");
  } catch (error) {
    console.error("❌ Error setting up Economic Intelligence:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupPineconeForEconomicIntelligence();
}

export { setupPineconeForEconomicIntelligence };
