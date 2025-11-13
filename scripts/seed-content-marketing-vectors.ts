/**
 * Seed Content Marketing Agents Knowledge Base
 *
 * Populates vector database with specialized knowledge for:
 * - FacebookMarketingAgent
 * - InstagramMarketingAgent
 * - LinkedInMarketingAgent
 * - BlogWriterAgent
 * - VideoScriptAgent
 * - NewsletterAgent
 * - FAQAgent
 *
 * Usage:
 *   npx tsx scripts/seed-content-marketing-vectors.ts
 */

// CRITICAL: Load environment variables BEFORE any imports
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Verify API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY not found in .env.local");
  console.error("Please add your OpenAI API key to .env.local");
  process.exit(1);
}

import { generateEmbedding } from "../lib/embeddings/embedding-service";
import { VectorRepository } from "../lib/repositories/vector-repository";
import { CONTENT_MARKETING_KNOWLEDGE_BASE } from "../lib/vector/content-marketing-knowledge-base";

async function seedContentMarketingVectors() {
  console.log("🌱 Seeding Content Marketing Agents Knowledge Base...\n");

  // Determine which provider to use
  const provider =
    (process.env.VECTOR_PROVIDER as "supabase" | "pinecone") || "supabase";
  console.log(`📊 Using vector provider: ${provider}\n`);

  const repo = new VectorRepository(provider);

  let successCount = 0;
  let errorCount = 0;

  console.log(
    `📦 Total knowledge entries to seed: ${CONTENT_MARKETING_KNOWLEDGE_BASE.length}\n`
  );

  for (const knowledge of CONTENT_MARKETING_KNOWLEDGE_BASE) {
    try {
      console.log(
        `Processing: ${knowledge.id} - ${knowledge.metadata.agentType}`
      );

      // Generate embedding for the content
      const embedding = await generateEmbedding(knowledge.content);

      // Create vector record
      const vectorRecord = {
        id: knowledge.id,
        values: embedding,
        metadata: {
          demoId: "content-marketing-agents", // Namespace for agent knowledge
          agentType: knowledge.metadata.agentType,
          category: knowledge.metadata.category,
          topic: knowledge.metadata.topic.join(", "), // Convert array to string
          industry: knowledge.metadata.industry || "general",
          businessSize: knowledge.metadata.businessSize || "all",
          content: knowledge.content, // Store full content for retrieval
          analysisType: "content_marketing",
          namespace: "content-marketing",
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
  console.log("🎉 Content Marketing Agents Knowledge Base Seeding Complete!");
  console.log("=".repeat(60));
  console.log(`✅ Successfully seeded: ${successCount} entries`);
  console.log(`❌ Failed: ${errorCount} entries`);
  console.log(`📊 Total: ${CONTENT_MARKETING_KNOWLEDGE_BASE.length} entries`);

  console.log("\n🤖 Agent types included:");
  const agentTypes = new Set(
    CONTENT_MARKETING_KNOWLEDGE_BASE.map((k) => k.metadata.agentType)
  );
  agentTypes.forEach((a) => console.log(`   - ${a}`));

  console.log("\n🏷️ Categories covered:");
  const categories = new Set(
    CONTENT_MARKETING_KNOWLEDGE_BASE.map((k) => k.metadata.category)
  );
  categories.forEach((c) => console.log(`   - ${c}`));

  console.log(
    "\n💡 Knowledge is now available for RAG-enhanced content generation!"
  );
  console.log(
    "   Agents can retrieve best practices during content creation.\n"
  );

  // Print agent-specific counts
  console.log("📈 Knowledge distribution by agent:");
  agentTypes.forEach((agentType) => {
    const count = CONTENT_MARKETING_KNOWLEDGE_BASE.filter(
      (k) => k.metadata.agentType === agentType
    ).length;
    console.log(`   - ${agentType}: ${count} entries`);
  });
}

// Run if called directly
if (require.main === module) {
  seedContentMarketingVectors()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

export { seedContentMarketingVectors };
