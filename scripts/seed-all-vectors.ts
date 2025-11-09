/**
 * Seed ALL Knowledge Bases into Vector Database
 *
 * This comprehensive script seeds:
 * 1. Porter's frameworks (competitive strategy)
 * 2. Harvard Business School marketing frameworks
 * 3. Modern ML marketing practices
 * 4. Platform-specific marketing strategies
 *
 * Usage:
 *   npx tsx scripts/seed-all-vectors.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { seedPorterVectors } from "./seed-porter-vectors";
import { seedMarketingVectors } from "./seed-marketing-vectors";

async function seedAllVectors() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 COMPREHENSIVE VECTOR DATABASE SEEDING");
  console.log("=".repeat(70) + "\n");

  const startTime = Date.now();

  try {
    // Step 1: Seed Porter frameworks
    console.log("📊 STEP 1/2: Seeding Porter's Strategic Frameworks");
    console.log("-".repeat(70) + "\n");
    await seedPorterVectors();

    console.log("\n");

    // Step 2: Seed marketing knowledge
    console.log("📊 STEP 2/2: Seeding Marketing Knowledge Base");
    console.log("-".repeat(70) + "\n");
    await seedMarketingVectors();

    const endTime = Date.now();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(1);

    console.log("\n" + "=".repeat(70));
    console.log("✨ ALL VECTOR SEEDING COMPLETE!");
    console.log("=".repeat(70));
    console.log(`⏱️  Total time: ${durationSeconds}s`);
    console.log("\n📚 Your vector database now contains:");
    console.log("   ✓ Porter's Five Forces framework");
    console.log("   ✓ Porter's Generic Strategies");
    console.log("   ✓ Porter's Value Chain");
    console.log("   ✓ Blue Ocean Strategy");
    console.log("   ✓ Jobs-to-be-Done (Christensen)");
    console.log("   ✓ Marketing Myopia (Levitt)");
    console.log("   ✓ Competitive Positioning");
    console.log("   ✓ Discovery-Driven Planning");
    console.log("   ✓ Disruptive Innovation");
    console.log("   ✓ 'Different' Framework (Moon)");
    console.log("   ✓ Consumer Decision Journey");
    console.log("   ✓ AI-Powered Personalization");
    console.log("   ✓ Marketing Mix Modeling");
    console.log("   ✓ Modern SEO Practices");
    console.log("   ✓ Content Marketing Strategies");
    console.log("   ✓ Social Media Best Practices");
    console.log("   ✓ Email Marketing Tactics");
    console.log("   ✓ Conversion Optimization");

    console.log("\n💡 AI agents can now retrieve relevant frameworks during analysis!");
    console.log("   RAG-powered recommendations are active.\n");

  } catch (error) {
    console.error("\n❌ ERROR during seeding:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAllVectors()
    .then(() => {
      console.log("✅ Process completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

export { seedAllVectors };
