/**
 * Seed Marketing Knowledge Base into Vector Database
 *
 * This script populates the vector database with:
 * - Harvard Business School marketing frameworks
 * - Modern ML marketing practices
 * - Platform-specific strategies
 * - Marketing best practices
 *
 * Usage:
 *   npx tsx scripts/seed-marketing-vectors.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { generateEmbedding } from "../lib/embeddings/embedding-service";
import { VectorRepository } from "../lib/repositories/vector-repository";
import { MARKETING_KNOWLEDGE_BASE } from "../lib/vector/marketing-knowledge-base";

async function seedMarketingVectors() {
  console.log("🌱 Seeding Marketing Knowledge Base Vectors...\n");

  // Determine which provider to use
  const provider =
    (process.env.VECTOR_PROVIDER as "supabase" | "pinecone") || "supabase";
  console.log(`📊 Using vector provider: ${provider}\n`);

  const repo = new VectorRepository(provider);

  let successCount = 0;
  let errorCount = 0;

  console.log(`📦 Total knowledge entries to seed: ${MARKETING_KNOWLEDGE_BASE.length}\n`);

  for (const knowledge of MARKETING_KNOWLEDGE_BASE) {
    try {
      console.log(`Processing: ${knowledge.id} - ${knowledge.metadata.framework}`);

      // Generate embedding for the content
      const embedding = await generateEmbedding(knowledge.content);

      // Create vector record
      const vectorRecord = {
        id: knowledge.id,
        values: embedding,
        metadata: {
          demoId: "knowledge-base", // Unified knowledge base for all framework knowledge
          framework: knowledge.metadata.framework,
          category: knowledge.metadata.category,
          industry: knowledge.metadata.industry || "general",
          businessSize: knowledge.metadata.businessSize || "all",
          topic: knowledge.metadata.topic.join(", "), // Convert array to string
          source: knowledge.metadata.source,
          content: knowledge.content, // Store full content for retrieval
          analysisType: "marketing_framework",
          agentType: "marketing",
          timestamp: knowledge.metadata.lastUpdated,
          confidence: knowledge.metadata.confidence,
        },
      };

      // Upsert to vector database
      await repo.provider.upsert([vectorRecord]);

      console.log(`✅ Seeded: ${knowledge.id}`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to seed ${knowledge.id}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Marketing Knowledge Base Seeding Complete!");
  console.log("=".repeat(60));
  console.log(`✅ Successfully seeded: ${successCount} entries`);
  console.log(`❌ Failed: ${errorCount} entries`);
  console.log(`📊 Total: ${MARKETING_KNOWLEDGE_BASE.length} entries`);

  console.log("\n📚 Frameworks included:");
  const frameworks = new Set(MARKETING_KNOWLEDGE_BASE.map(k => k.metadata.framework));
  frameworks.forEach(f => console.log(`   - ${f}`));

  console.log("\n🏷️ Categories covered:");
  const categories = new Set(MARKETING_KNOWLEDGE_BASE.map(k => k.metadata.category));
  categories.forEach(c => console.log(`   - ${c}`));

  console.log("\n💡 Marketing knowledge is now available for RAG!");
  console.log("   AI agents can retrieve relevant frameworks during analysis.\n");
}

// Run if called directly
if (require.main === module) {
  seedMarketingVectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { seedMarketingVectors };
