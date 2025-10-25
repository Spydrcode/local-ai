/**
 * Setup Pinecone index optimized for Porter Intelligence Stack
 *
 * Creates or updates Pinecone index with:
 * - Serverless architecture for cost efficiency
 * - 1536 dimensions (OpenAI ada-002)
 * - Cosine similarity metric
 * - Optimized metadata schema for 9 Porter agents
 *
 * Usage:
 *   npm run setup:pinecone
 *   or
 *   npx tsx scripts/setup-pinecone-porter.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setupPineconeForPorter() {
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

  console.log("🚀 Setting up Pinecone for Porter Intelligence Stack...\n");

  const pinecone = new Pinecone({ apiKey });

  try {
    // Check if index exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (idx) => idx.name === indexName
    );

    if (existingIndex) {
      console.log(`✅ Index "${indexName}" already exists`);
      console.log(`   Spec: ${JSON.stringify(existingIndex.spec, null, 2)}`);
      console.log(`   Status: ${existingIndex.status?.state || "unknown"}`);
      console.log(`   Dimension: ${existingIndex.dimension}`);
      console.log(`   Metric: ${existingIndex.metric}`);

      // Verify it's configured correctly
      if (existingIndex.dimension !== 1536) {
        console.warn(
          `⚠️  Warning: Index dimension is ${existingIndex.dimension}, expected 1536 for OpenAI ada-002`
        );
      }
      if (existingIndex.metric !== "cosine") {
        console.warn(
          `⚠️  Warning: Index metric is ${existingIndex.metric}, expected "cosine"`
        );
      }
    } else {
      console.log(`📦 Creating new index: ${indexName}...`);

      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI ada-002 embedding size
        metric: "cosine", // Best for semantic similarity
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1", // Free tier region
          },
        },
        deletionProtection: "disabled", // Enable in production
      });

      console.log("⏳ Waiting for index to be ready...");

      // Wait for index to be ready (max 60 seconds)
      let attempts = 0;
      while (attempts < 60) {
        const indexes = await pinecone.listIndexes();
        const index = indexes.indexes?.find((idx) => idx.name === indexName);

        if (index?.status?.state === "Ready") {
          console.log("✅ Index is ready!");
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;

        if (attempts % 5 === 0) {
          console.log(`   Still waiting... (${attempts}s)`);
        }
      }

      if (attempts >= 60) {
        console.warn("⚠️  Index creation timed out. Check Pinecone console.");
      }
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

    if (stats.namespaces) {
      console.log(`   Namespaces: ${Object.keys(stats.namespaces).length}`);
    }

    console.log("\n📋 Optimized Metadata Schema for Porter Agents:");
    console.log("   ✓ demoId (string) - Links to demos table");
    console.log(
      "   ✓ analysisType (string) - strategic, competitor, roi, etc."
    );
    console.log(
      "   ✓ category (string) - competitive, financial, strategic, etc."
    );
    console.log(
      "   ✓ agentName (string) - strategy-architect, value-chain, etc."
    );
    console.log("   ✓ confidence (number) - 0.0-1.0 quality score");
    console.log("   ✓ timestamp (string) - ISO 8601 datetime");
    console.log("   ✓ tags (string[]) - porter-intelligence, synthesis, etc.");
    console.log("   ✓ content (string) - Full text content (max 40KB)");
    console.log("   ✓ chunkType (string) - heading, content, insight, action");

    console.log("\n🔍 Porter Intelligence Agent Vector IDs:");
    console.log("   Format: {demoId}-agent-{agentName}");
    console.log("   - {demoId}-agent-strategy-architect");
    console.log("   - {demoId}-agent-value-chain");
    console.log("   - {demoId}-agent-market-forces");
    console.log("   - {demoId}-agent-differentiation-designer");
    console.log("   - {demoId}-agent-profit-pool");
    console.log("   - {demoId}-agent-operational-effectiveness-optimizer");
    console.log("   - {demoId}-agent-local-strategy");
    console.log("   - {demoId}-agent-executive-advisor");
    console.log("   - {demoId}-agent-shared-value");
    console.log("   - {demoId}-synthesis (strategy synthesis)");

    console.log("\n💡 Recommended Index Settings:");
    console.log(
      "   ✓ Serverless (AWS us-east-1) - Cost efficient, auto-scaling"
    );
    console.log("   ✓ 1536 dimensions - OpenAI text-embedding-ada-002");
    console.log("   ✓ Cosine metric - Best for semantic similarity");
    console.log("   ✓ HNSW algorithm (automatic) - Fast approximate search");
    console.log(
      "   ✓ Metadata filtering enabled - Filter by agent, category, confidence"
    );

    console.log("\n🎯 Query Performance Tips:");
    console.log("   1. Use topK=5-10 for best performance/quality balance");
    console.log(
      "   2. Filter by metadata before vector search (demoId, analysisType)"
    );
    console.log("   3. Boost results with confidence > 0.8 for higher quality");
    console.log(
      "   4. Include multiple agent results for comprehensive insights"
    );
    console.log(
      "   5. Use separate queries for different categories (strategic vs operational)"
    );

    console.log("\n✅ Pinecone setup complete!");
    console.log(`   Index name: ${indexName}`);
    console.log(
      `   Current provider: ${process.env.VECTOR_PROVIDER || "supabase (default)"}`
    );
    console.log(
      "   Set VECTOR_PROVIDER=pinecone in .env.local to use Pinecone"
    );

    console.log("\n📚 Next Steps:");
    console.log("   1. Run Porter Intelligence Stack on a demo");
    console.log("   2. Vectors will be automatically stored in Pinecone");
    console.log("   3. Use similarity search to retrieve agent insights");
    console.log("   4. Monitor index stats and performance");
  } catch (error) {
    console.error("❌ Error setting up Pinecone:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupPineconeForPorter();
}

export { setupPineconeForPorter };
