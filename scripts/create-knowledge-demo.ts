import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createKnowledgeDemo() {
  console.log("🎯 Creating knowledge-base demo record...\n");

  const { data, error } = await supabase.from("demos").upsert(
    {
      id: "knowledge-base", // Primary key
    },
    {
      onConflict: "id",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error("❌ Error creating demo:", error.message);
    throw error;
  }

  console.log("✅ Successfully created knowledge-base demo record");
  console.log("📦 Data:", data);
}

createKnowledgeDemo()
  .then(() => {
    console.log("\n🎉 Demo record created successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed to create demo:", error);
    process.exit(1);
  });
