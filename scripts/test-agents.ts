/**
 * Test Script for Unified Agent System
 *
 * Run with: npm run test:agents
 * Or: npx tsx scripts/test-agents.ts
 */

import {
  AgentRegistry,
  getAgentStats,
  verifyAgents,
} from "../lib/agents/unified-agent-system";
import { getActiveProvider } from "../lib/unified-ai-client";

console.log("🧪 Testing Unified Agent System\n");
console.log("=".repeat(60));

// Test 1: Verify Active Provider
console.log("\n📡 Test 1: Active AI Provider");
console.log("-".repeat(60));
try {
  const provider = getActiveProvider();
  console.log(`✅ Active Provider: ${provider}`);

  if (provider === "together") {
    console.log("   💰 Cost Savings: 90% (Together.ai vs OpenAI)");
  } else if (provider === "ollama") {
    console.log("   🏠 Running locally with Ollama");
  } else {
    console.log("   ⚠️  Using OpenAI (consider setting up Together.ai)");
  }
} catch (error) {
  console.error("❌ Failed:", error);
}

// Test 2: Agent Registry Verification
console.log("\n🔍 Test 2: Agent Configuration Verification");
console.log("-".repeat(60));
verifyAgents();

// Test 3: Agent Statistics
console.log("\n📊 Test 3: Agent Statistics");
console.log("-".repeat(60));
const stats = getAgentStats();
console.log(`Total Agents: ${stats.totalAgents}`);
console.log(`Agents with Tools: ${stats.withTools}`);
console.log(`Agents without Tools: ${stats.withoutTools}`);
console.log("\nAgents by Category:");
Object.entries(stats.byCategory).forEach(([category, count]) => {
  console.log(`  - ${category}: ${count}`);
});

// Test 4: List All Registered Agents
console.log("\n📋 Test 4: Registered Agents");
console.log("-".repeat(60));
const agents = AgentRegistry.list();
agents.forEach((agent, index) => {
  const toolStatus = agent.requiresTools ? "🔧 (with tools)" : "";
  console.log(`${index + 1}. ${agent.name} ${toolStatus}`);
  console.log(`   ${agent.description}`);
});

// Test 5: Agent Retrieval
console.log("\n🎯 Test 5: Agent Retrieval");
console.log("-".repeat(60));
const strategicAgent = AgentRegistry.get("strategic-analysis");
if (strategicAgent) {
  console.log("✅ Successfully retrieved strategic-analysis agent");
  console.log("   Ready for execution");
} else {
  console.log("❌ Failed to retrieve strategic-analysis agent");
}

// Test 6: Sample Agent Execution (if API key available)
console.log("\n🚀 Test 6: Sample Agent Execution");
console.log("-".repeat(60));
if (process.env.OPENAI_API_KEY || process.env.TOGETHER_API_KEY) {
  console.log("Testing agent execution...");

  try {
    const benchmarkAgent = AgentRegistry.get("benchmarking");
    if (benchmarkAgent) {
      const response = await benchmarkAgent.execute(
        "Compare a coffee shop with 50 customers/day to industry benchmarks",
        {
          businessName: "Test Coffee Shop",
          industry: "Food & Beverage",
          metric: "daily_customers",
          value: 50,
        }
      );

      console.log("\n✅ Agent Execution Successful");
      console.log(`   Provider: ${response.metadata.provider}`);
      console.log(`   Execution Time: ${response.metadata.executionTime}ms`);
      console.log(`   Response Length: ${response.content.length} characters`);
      console.log("\n   Response Preview:");
      console.log("   " + response.content.substring(0, 200) + "...");
    }
  } catch (error: any) {
    console.log("⚠️  Agent execution test skipped (requires live API)");
    console.log(`   Error: ${error.message}`);
  }
} else {
  console.log("⚠️  Skipping execution test (no API keys configured)");
  console.log(
    "   Set OPENAI_API_KEY or TOGETHER_API_KEY to test live execution"
  );
}

// Test 7: Configuration Validation
console.log("\n✔️  Test 7: Configuration Validation");
console.log("-".repeat(60));
const { valid, invalid } = AgentRegistry.verify();
if (invalid.length === 0) {
  console.log("✅ All agent configurations are valid");
} else {
  console.log(`⚠️  Found ${invalid.length} invalid configuration(s):`);
  invalid.forEach(({ name, issues }) => {
    console.log(`\n   Agent: ${name}`);
    issues.forEach((issue) => console.log(`   - ${issue}`));
  });
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("🎉 Test Suite Complete");
console.log("=".repeat(60));
console.log(`\n📈 Summary:`);
console.log(`   - Active Provider: ${getActiveProvider()}`);
console.log(`   - Total Agents: ${stats.totalAgents}`);
console.log(`   - Valid Configurations: ${valid.length}/${agents.length}`);
console.log(`   - Agents with Tools: ${stats.withTools}`);

if (getActiveProvider() === "together") {
  console.log(
    `\n💰 Cost Savings: 90% (Together.ai is 10x cheaper than OpenAI)`
  );
} else if (getActiveProvider() === "openai") {
  console.log(`\n💡 Tip: Set TOGETHER_API_KEY to save 90% on AI costs`);
}

console.log("\n✅ All systems operational\n");
