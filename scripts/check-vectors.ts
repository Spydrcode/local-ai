/**
 * Quick check to see if Porter vectors are seeded
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function checkVectors() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("🔍 Checking vector database...\n");

  // The correct table is "site_chunks" (created by migration)
  const tableName = "site_chunks";

  console.log(`📋 Using table: ${tableName}\n`);

  // Check total count
  const { count: totalCount, error: totalError } = await supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("❌ Error checking total:", totalError);
    console.log("\n💡 Make sure the migration has been run:");
    console.log("   supabase/migrations/20241025_optimize_porter_agents.sql");
    return;
  }

  console.log(`📊 Total vectors in database: ${totalCount || 0}`);

  // Check Porter knowledge base specifically
  const {
    data: porterData,
    count: porterCount,
    error: porterError,
  } = await supabase
    .from(tableName)
    .select("id, metadata", { count: "exact" })
    .eq("demo_id", "porter-knowledge-base");

  if (porterError) {
    console.error("❌ Error checking Porter vectors:", porterError);
    return;
  }

  console.log(`📚 Porter framework vectors: ${porterCount || 0}`);

  if (porterData && porterData.length > 0) {
    console.log("\n✅ Porter frameworks found:");
    porterData.forEach((row: any) => {
      console.log(`   - ${row.id}`);
      if (row.metadata?.title) {
        console.log(`     ${row.metadata.title}`);
      }
    });
  } else {
    console.log("\n⚠️  No Porter vectors found!");
    console.log("   Run: npm run seed:porter");
  }

  // Check if vectors have embeddings
  if (porterData && porterData.length > 0) {
    const { data: embeddingCheck } = await supabase
      .from(tableName)
      .select("id, embedding")
      .eq("demo_id", "porter-knowledge-base")
      .limit(1);

    if (embeddingCheck && embeddingCheck[0]?.embedding) {
      const dims = embeddingCheck[0].embedding.length;
      console.log(`\n✅ Embeddings present: ${dims} dimensions`);
    } else {
      console.log("\n⚠️  No embeddings found in vectors!");
    }
  }
}

checkVectors()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
