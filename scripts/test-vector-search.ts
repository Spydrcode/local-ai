/**
 * Test Vector Search Capabilities
 *
 * This script demonstrates how to use the optimized vector search
 * across all Local AI agents.
 *
 * Usage:
 *   npx tsx scripts/test-vector-search.ts <demoId>
 */

import * as dotenv from "dotenv";
import * as path from "path";
import {
  getCompleteBusinessContext,
  searchCompetitiveMoat,
  searchQuickWins,
  searchUnifiedInsights,
} from "../lib/vector-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function testVectorSearch() {
  const demoId = process.argv[2];

  if (!demoId) {
    console.error(
      "❌ Please provide a demoId: npx tsx scripts/test-vector-search.ts <demoId>"
    );
    process.exit(1);
  }

  if (process.env.VECTOR_PROVIDER !== "pinecone") {
    console.log('⚠️  VECTOR_PROVIDER is not set to "pinecone" in .env.local');
    console.log("   Vector search will use Supabase instead");
  }

  console.log(`🔍 Testing vector search for demo: ${demoId}\n`);

  try {
    console.log("1. 🎯 Searching for strategic opportunities...");
    const opportunities = await searchUnifiedInsights(
      demoId,
      "growth opportunities market expansion competitive advantage",
      ["porter", "business_intelligence"],
      0.7,
      5
    );

    console.log(`   Found ${opportunities.length} strategic insights:`);
    opportunities.forEach((result, i) => {
      console.log(
        `   ${i + 1}. ${result.id} (score: ${result.score?.toFixed(3)})`
      );
      console.log(
        `      Agent: ${result.metadata?.agentName} | Tier: ${result.metadata?.tier}`
      );
    });

    console.log("\n2. ⚡ Searching for quick revenue wins...");
    const quickWins = await searchQuickWins(
      demoId,
      "increase revenue this week immediate action",
      "revenue",
      "this_week",
      3
    );

    console.log(`   Found ${quickWins.length} quick win actions:`);
    quickWins.forEach((result, i) => {
      console.log(
        `   ${i + 1}. ${result.id} (score: ${result.score?.toFixed(3)})`
      );
      console.log(
        `      Confidence: ${result.metadata?.confidence} | Category: ${result.metadata?.category}`
      );
    });

    console.log("\n3. 🏰 Searching competitive moat strategies...");
    const moatStrategies = await searchCompetitiveMoat(
      demoId,
      "competitive advantages barriers to entry defensible position",
      undefined,
      3
    );

    console.log(`   Found ${moatStrategies.length} moat strategies:`);
    moatStrategies.forEach((result, i) => {
      console.log(
        `   ${i + 1}. ${result.id} (score: ${result.score?.toFixed(3)})`
      );
      console.log(
        `      Type: ${result.metadata?.moatType} | Strength: ${result.metadata?.moatStrength}`
      );
    });

    console.log("\n4. 📊 Getting complete business context...");
    const fullContext = await getCompleteBusinessContext(demoId);

    console.log("   Business Intelligence Summary:");
    console.log(
      `   • Strategic insights: ${fullContext.strategic?.length || 0}`
    );
    console.log(
      `   • Intelligence insights: ${fullContext.intelligence?.length || 0}`
    );
    console.log(
      `   • Marketing insights: ${fullContext.marketing?.length || 0}`
    );
    console.log(
      `   • Optimization insights: ${fullContext.optimization?.length || 0}`
    );

    console.log("\n✅ Vector search test completed successfully!");

    if (
      opportunities.length === 0 &&
      quickWins.length === 0 &&
      moatStrategies.length === 0
    ) {
      console.log("\n💡 No results found. This could mean:");
      console.log("   • No vectors have been stored for this demo yet");
      console.log("   • Run some agent analyses first to populate vectors");
      console.log("   • Check that VECTOR_PROVIDER=pinecone in .env.local");
    }
  } catch (error) {
    console.error("❌ Vector search test failed:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testVectorSearch();
}

export { testVectorSearch };
