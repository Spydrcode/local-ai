#!/usr/bin/env node
/**
 * Migration Script: Update Tool APIs to use AgentSystem
 *
 * This script helps migrate existing tool APIs from direct AgentRegistry
 * usage to the new AgentSystem with full observability.
 *
 * Usage:
 *   node scripts/migrate-tools.js
 *
 * What it does:
 * - Finds all tool API routes
 * - Updates imports from AgentRegistry to agentSystem
 * - Replaces agent.execute() with agentSystem.executeAgent()
 * - Adds metadata to responses
 * - Creates backup files before modification
 */

const fs = require("fs");
const path = require("path");

const TOOLS_DIR = path.join(__dirname, "..", "app", "api", "tools");
const BACKUP_DIR = path.join(__dirname, "..", "backups", "tool-apis");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function migrateFile(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);

  // Read file
  let content = fs.readFileSync(filePath, "utf8");

  // Check if already migrated
  if (content.includes("agentSystem")) {
    console.log("✅ Already migrated, skipping");
    return;
  }

  // Create backup
  const fileName = path.basename(filePath);
  const backupPath = path.join(BACKUP_DIR, fileName);
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup created: ${backupPath}`);

  // Perform migrations
  let updated = content;

  // 1. Update imports
  updated = updated.replace(
    /import\s+{\s*AgentRegistry\s*}\s+from\s+["']@\/lib\/agents\/unified-agent-system["'];?/g,
    'import { agentSystem } from "@/lib/agents/core/AgentSystem";'
  );

  // 2. Remove agent retrieval
  updated = updated.replace(
    /const\s+agent\s+=\s+AgentRegistry\.get\(['"](.*?)['"]\);?\s*/g,
    "// Using agentSystem for $1"
  );

  updated = updated.replace(
    /if\s+\(!agent\)\s+{\s+throw\s+new\s+Error\(['"](.*?)['"]\);?\s+}/gs,
    "// Agent validation handled by agentSystem"
  );

  // 3. Update execute calls
  // This is a simplified replacement - may need manual review
  updated = updated.replace(
    /const\s+response\s+=\s+await\s+agent\.execute\(/g,
    "const response = await agentSystem.executeAgent("
  );

  updated = updated.replace(
    /await\s+agent\.execute\(/g,
    "await agentSystem.executeAgent("
  );

  // 4. Add agent name to execute calls (requires agent variable inspection)
  // This is complex and may need manual intervention

  // 5. Add metadata to responses
  updated = updated.replace(
    /return\s+NextResponse\.json\(([\s\S]*?)\);/g,
    (match, jsonContent) => {
      if (jsonContent.includes("_metadata")) {
        return match; // Already has metadata
      }
      // Check if it's a simple variable or object
      if (jsonContent.trim().match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)) {
        // Simple variable
        return `return NextResponse.json({
      ...${jsonContent.trim()},
      _metadata: {
        executionTime: response.metadata.executionTime,
        provider: response.metadata.provider,
      },
    });`;
      }
      return match; // Keep as is if complex
    }
  );

  // Write updated content
  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log("✅ Migration complete");
  } else {
    console.log("⚠️  No changes made");
  }
}

function findToolRoutes(dir) {
  const routes = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item === "route.ts") {
        routes.push(fullPath);
      }
    }
  }

  traverse(dir);
  return routes;
}

// Main execution
console.log("🚀 Starting Tool API Migration\n");
console.log("Looking for tool routes...");

const toolRoutes = findToolRoutes(TOOLS_DIR);
console.log(`\nFound ${toolRoutes.length} tool routes:\n`);

toolRoutes.forEach((route, index) => {
  console.log(`${index + 1}. ${path.relative(TOOLS_DIR, route)}`);
});

console.log("\n" + "=".repeat(60));
console.log("Starting migration...");
console.log("=".repeat(60));

toolRoutes.forEach(migrateFile);

console.log("\n" + "=".repeat(60));
console.log("✨ Migration complete!");
console.log("=".repeat(60));
console.log("\n📌 Next steps:");
console.log("1. Review the changes in each file");
console.log("2. Manually update agent names in executeAgent() calls");
console.log("3. Test each tool API endpoint");
console.log("4. Remove backup files when satisfied");
console.log(`\n💾 Backups saved to: ${BACKUP_DIR}\n`);
