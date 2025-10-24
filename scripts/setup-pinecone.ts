/**
 * Setup script to create Pinecone index for Local AI
 * Run with: npx tsx scripts/setup-pinecone.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setupPineconeIndex() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";

  if (!apiKey) {
    console.error("❌ PINECONE_API_KEY not found in .env.local");
    process.exit(1);
  }

  console.log("🚀 Setting up Pinecone index...");
  console.log(`   Index name: ${indexName}`);

  const pinecone = new Pinecone({ apiKey });

  try {
    // Check if index already exists
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (idx) => idx.name === indexName
    );

    if (indexExists) {
      console.log(`✓ Index "${indexName}" already exists!`);

      // Get index stats
      const index = pinecone.index(indexName);
      const stats = await index.describeIndexStats();
      console.log(`   Total vectors: ${stats.totalRecordCount ?? 0}`);
      console.log(`   Dimensions: ${stats.dimension ?? "unknown"}`);

      return;
    }

    // Create new index
    console.log("📦 Creating new index...");
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI text-embedding-3-small dimension
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    console.log(`✅ Successfully created index "${indexName}"!`);
    console.log("   Dimension: 1536 (OpenAI embeddings)");
    console.log("   Metric: cosine");
    console.log("   Cloud: AWS (us-east-1)");
    console.log("\n💡 Your Pinecone index is ready to use!");
    console.log(
      "   Set VECTOR_PROVIDER=pinecone in .env.local to start using it."
    );
  } catch (error) {
    console.error("❌ Error setting up Pinecone:", error);
    process.exit(1);
  }
}

setupPineconeIndex();
