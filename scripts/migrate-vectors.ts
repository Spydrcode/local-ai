/**
 * Migration script to re-index existing Pinecone vectors with enhanced metadata
 *
 * This script:
 * 1. Fetches all existing demos from Supabase
 * 2. Re-generates vectors with enhanced metadata structure
 * 3. Updates Pinecone index with new schema
 *
 * Usage:
 *   npm run migrate:vectors
 *
 * Note: tsx will load .env.local automatically via --env-file flag
 */

import {
  AnalysisType,
  embedText,
  EnhancedMetadata,
  upsertChunks,
} from "../lib/vector";
import { supabaseAdmin } from "../server/supabaseAdmin";

interface DemoData {
  id: string;
  client_id: string;
  site_url: string;
  insights?: {
    insights?: Array<{
      title: string;
      description: string;
      category?: string;
    }>;
  };
  // Competitor research might be stored differently - check actual structure
  competitor_research?: {
    competitors?: Array<{
      name: string;
      strengths?: string[];
      weaknesses?: string[];
    }>;
  };
  // Roadmap might be stored differently
  roadmap?: {
    months?: Array<{
      actions?: Array<{
        task: string;
        priority: string;
        difficulty: string;
      }>;
    }>;
  };
  // ROI calculator might be stored differently
  roi_calculator?: {
    metrics?: Record<string, unknown>;
  };
}

async function migrateVectors() {
  console.log("🚀 Starting vector migration...\n");

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not configured");
    }

    // Fetch all demos from Supabase
    const { data: demos, error } = await supabaseAdmin
      .from("demos")
      .select("id, client_id, site_url, insights")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch demos: ${error.message}`);
    }

    if (!demos || demos.length === 0) {
      console.log("No demos found to migrate.");
      return;
    }

    console.log(`Found ${demos.length} demos to migrate.\n`);

    let totalChunks = 0;

    // Process each demo
    for (const demo of demos as DemoData[]) {
      console.log(
        `Processing demo: ${demo.client_id || "Unknown"} (${demo.id})`
      );

      const chunks = [];
      let chunkCount = 0;

      // 1. Process ProfitIQ insights
      if (demo.insights?.insights) {
        for (const insight of demo.insights.insights) {
          const content = `${insight.title}\n${insight.description}`;
          const { embedding } = await embedText(content);

          const metadata: EnhancedMetadata = {
            demoId: demo.id,
            analysisType: "insight" as AnalysisType,
            category: (insight.category?.toLowerCase() as any) || "strategic",
            heading: insight.title,
            chunkType: "insight",
            confidence: 0.9,
            relevanceScore: 0.85,
            timestamp: new Date().toISOString(),
            contentLength: content.length,
            wordCount: content.split(" ").length,
            tags: ["profit-iq", "strategic-insight"],
          };

          chunks.push({
            id: `${demo.id}-insight-${chunkCount++}`,
            demoId: demo.id,
            content,
            metadata,
            embedding: embedding as number[],
          });
        }
      }

      // Note: Competitor research, roadmap, and ROI data are generated on-demand
      // and not stored in the demos table. They would need to be generated fresh
      // or stored in separate tables to be included in migration.

      // For now, we're only migrating the stored ProfitIQ insights.
      // You can extend this script to call the respective APIs to generate
      // and index competitor, roadmap, and ROI data if needed.

      // Upsert chunks to Pinecone
      if (chunks.length > 0) {
        await upsertChunks(chunks);
        console.log(`  ✓ Migrated ${chunks.length} chunks`);
        totalChunks += chunks.length;
      } else {
        console.log(`  ⚠ No insights data to migrate`);
      }

      console.log("");
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Total demos processed: ${demos.length}`);
    console.log(`   Total chunks migrated: ${totalChunks}`);
    console.log(
      `   Average chunks per demo: ${(totalChunks / demos.length).toFixed(1)}\n`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateVectors()
  .then(() => {
    console.log("Migration script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
