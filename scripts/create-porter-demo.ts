/**
 * Create placeholder demo for Porter framework knowledge
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function createPorterDemo() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(
    "🏗️  Creating placeholder demo for Porter framework knowledge...\n"
  );

  const { data, error } = await supabase.from("demos").upsert(
    {
      id: "porter-knowledge-base",
      summary:
        "Porter Strategic Framework Knowledge Base - Contains core Porter frameworks (Five Forces, Generic Strategies, Value Chain, Competitive Advantage) for RAG retrieval during business analysis.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    }
  );

  if (error) {
    console.error("❌ Failed to create demo:", error);
    process.exit(1);
  }

  console.log("✅ Placeholder demo created: porter-knowledge-base");
  console.log("   This demo holds Porter framework vectors for RAG\n");
}

createPorterDemo()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
