/**
 * CLEANUP SCRIPT - Remove all unnamed/test clients from database
 *
 * This script directly cleans your Supabase database of:
 * - "Unnamed Business" entries
 * - "Contractor Business" entries
 * - contractor-setup test data
 *
 * Run this with: node cleanup-all-unnamed.js
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "YOUR_SERVICE_ROLE_KEY";

async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...\n");

  try {
    // First, let's see what we have
    console.log("📊 Fetching current clients...");
    const fetchResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/demos?select=id,business_name,website_url,created_at`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch: ${fetchResponse.statusText}`);
    }

    const allClients = await fetchResponse.json();
    console.log(`\nTotal clients in database: ${allClients.length}`);

    // Show what will be deleted
    const toDelete = allClients.filter(
      (c) =>
        c.business_name === "Unnamed Business" ||
        c.business_name === "Contractor Business" ||
        c.website_url === "contractor-setup"
    );

    if (toDelete.length === 0) {
      console.log("\n✅ No unwanted clients found! Database is clean.");
      return;
    }

    console.log(`\n🗑️  Found ${toDelete.length} unwanted clients:`);
    toDelete.forEach((c) => {
      console.log(
        `   - ${c.business_name} (${c.website_url}) - ${new Date(c.created_at).toLocaleDateString()}`
      );
    });

    // Delete them
    console.log("\n🔥 Deleting unwanted clients...");

    for (const client of toDelete) {
      const deleteResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/demos?id=eq.${client.id}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteResponse.ok) {
        console.error(
          `   ❌ Failed to delete ${client.business_name}: ${deleteResponse.statusText}`
        );
      } else {
        console.log(`   ✓ Deleted: ${client.business_name}`);
      }
    }

    // Show what's left
    console.log("\n📊 Fetching remaining clients...");
    const finalResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/demos?select=id,business_name,website_url,created_at`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const remainingClients = await finalResponse.json();
    console.log(
      `\n✅ Cleanup complete! ${remainingClients.length} clients remaining:`
    );
    remainingClients.forEach((c) => {
      console.log(`   - ${c.business_name} (${c.website_url})`);
    });
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error.message);
    console.error("\nMake sure you have set your Supabase credentials:");
    console.error("  NEXT_PUBLIC_SUPABASE_URL=your-project-url");
    console.error("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  }
}

cleanupDatabase();
