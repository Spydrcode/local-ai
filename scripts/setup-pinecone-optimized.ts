/**
 * Comprehensive Pinecone Vector Setup for Local AI Platform
 *
 * Optimized for all agent categories:
 *
 * 🏰 PORTER INTELLIGENCE STACK (Strategic Analysis)
 * - Porter's Five Forces Analysis
 * - Competitive Moat Analysis
 * - Value Chain Analysis
 * - Strategic Frameworks (SWOT, BMC, GTM)
 *
 * 🧠 BUSINESS INTELLIGENCE AGENTS
 * - Local Market Analysis
 * - Customer Sentiment Analysis
 * - Economic Intelligence
 * - Business DNA Analysis
 *
 * 📈 MARKETING & GROWTH AGENTS
 * - Customer Magnet Posts
 * - Content Calendar
 * - Social Media Analysis
 * - Conversion Analysis
 * - Quick Wins Generator
 *
 * 💎 OPTIMIZATION AGENTS
 * - ROI Calculator
 * - Implementation Roadmap
 * - Website Grade Analysis
 * - Brand Analysis
 *
 * Usage:
 *   npm run setup:pinecone-optimized
 *   or
 *   npx tsx scripts/setup-pinecone-optimized.ts
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function setupOptimizedPinecone() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";

  if (!apiKey) {
    console.error("❌ PINECONE_API_KEY not found in .env.local");
    console.log("\nPlease add your Pinecone API key:");
    console.log("1. Sign up at https://www.pinecone.io/");
    console.log("2. Create an API key in the console");
    console.log("3. Add to .env.local: PINECONE_API_KEY=your-key-here");
    process.exit(1);
  }

  console.log("🚀 Setting up Optimized Pinecone for All Local AI Agents...\n");

  const pinecone = new Pinecone({ apiKey });

  try {
    // Check if index exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (idx) => idx.name === indexName
    );

    if (existingIndex) {
      console.log(`✅ Index "${indexName}" already exists`);
      console.log(`   Dimension: ${existingIndex.dimension}`);
      console.log(`   Metric: ${existingIndex.metric}`);
      console.log(`   Status: ${existingIndex.status?.state || "unknown"}`);
    } else {
      console.log(`📦 Creating new index: ${indexName}...`);

      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI ada-002 embedding size
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        deletionProtection: "disabled",
      });

      console.log("✅ Index created successfully");
    }

    // Get index stats
    const index = pinecone.index(indexName);
    const stats = await index.describeIndexStats();

    console.log("\n📊 Index Statistics:");
    console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimensions: ${stats.dimension}`);
    console.log(
      `   Index fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`
    );

    // Display comprehensive metadata schema
    console.log("\n🗂️  COMPREHENSIVE METADATA SCHEMA:");

    console.log("\n📋 Universal Fields (All Agents):");
    console.log("   ✓ demoId (string) - Links to demos table");
    console.log(
      "   ✓ agentType (string) - porter, business_intelligence, marketing, optimization"
    );
    console.log("   ✓ agentName (string) - Specific agent identifier");
    console.log("   ✓ analysisType (string) - Specific analysis performed");
    console.log(
      "   ✓ category (string) - strategic, market, content, optimization"
    );
    console.log("   ✓ tier (string) - free, pro, consultation");
    console.log("   ✓ confidence (number) - 0.0-1.0 quality score");
    console.log("   ✓ timestamp (string) - ISO 8601 datetime");
    console.log("   ✓ tags (string[]) - Searchable keywords");
    console.log("   ✓ businessName (string) - For business-specific search");
    console.log("   ✓ industry (string) - Industry classification");

    console.log("\n🏰 PORTER INTELLIGENCE STACK:");
    console.log("   📊 Porter's Five Forces:");
    console.log(
      "     • porterForce - buyer_power, supplier_power, new_entrants, substitutes, competitive_rivalry"
    );
    console.log(
      "     • forceStrength - very_low, low, moderate, high, very_high"
    );
    console.log("     • strategicImplication - threat, opportunity, neutral");

    console.log("   🏰 Competitive Moat:");
    console.log(
      "     • moatType - switching_costs, network_effects, economies_of_scale, brand, regulatory"
    );
    console.log("     • moatStrength - weak, moderate, strong, very_strong");
    console.log("     • defensibility - 0.0-1.0 score");

    console.log("   ⚙️ Value Chain:");
    console.log(
      "     • chainActivity - inbound_logistics, operations, outbound_logistics, marketing, service"
    );
    console.log("     • activityType - primary, support");
    console.log("     • costAdvantage - true/false");
    console.log("     • differentiationPotential - 0.0-1.0");

    console.log("   📋 Strategic Frameworks:");
    console.log(
      "     • frameworkType - swot, business_model_canvas, gtm_strategy"
    );
    console.log(
      "     • swotQuadrant - strengths, weaknesses, opportunities, threats"
    );
    console.log(
      "     • canvasBlock - customer_segments, value_propositions, channels, etc."
    );
    console.log(
      "     • gtmComponent - entry_strategy, channels, pricing, launch_plan"
    );

    console.log("\n🧠 BUSINESS INTELLIGENCE AGENTS:");
    console.log("   📍 Local Market Analysis:");
    console.log("     • marketScope - local, regional, national");
    console.log("     • competitorTier - direct, indirect, substitute");
    console.log("     • marketPosition - leader, challenger, follower, nicher");

    console.log("   💬 Customer Sentiment:");
    console.log("     • sentimentType - reviews, social, surveys, feedback");
    console.log("     • sentimentScore - -1.0 to 1.0 (negative to positive)");
    console.log(
      "     • emotionType - joy, trust, fear, surprise, sadness, disgust, anger, anticipation"
    );

    console.log("   📈 Economic Intelligence:");
    console.log(
      "     • economicIndicator - gdp, inflation, employment, interest_rates"
    );
    console.log(
      "     • timeHorizon - current, short_term, medium_term, long_term"
    );
    console.log("     • impactLevel - low, moderate, high, critical");

    console.log("\n📈 MARKETING & GROWTH AGENTS:");
    console.log("   🧲 Customer Magnet Posts:");
    console.log(
      "     • contentType - social_proof, educational, behind_scenes, problem_solution"
    );
    console.log(
      "     • platform - facebook, instagram, linkedin, twitter, tiktok"
    );
    console.log(
      "     • engagementType - likes, shares, comments, clicks, conversions"
    );

    console.log("   📅 Content Calendar:");
    console.log(
      "     • contentCategory - promotional, educational, entertaining, user_generated"
    );
    console.log("     • postingFrequency - daily, weekly, bi_weekly, monthly");
    console.log("     • seasonality - evergreen, seasonal, event_based");

    console.log("   ⚡ Quick Wins:");
    console.log(
      "     • actionType - revenue, customer_acquisition, efficiency, competitive"
    );
    console.log("     • timeToImplement - immediate, this_week, this_month");
    console.log("     • effortLevel - low, medium, high");
    console.log("     • expectedImpact - low, medium, high, game_changer");

    console.log("\n💎 OPTIMIZATION AGENTS:");
    console.log("   💰 ROI Calculator:");
    console.log(
      "     • investmentType - marketing, technology, operations, people"
    );
    console.log(
      "     • paybackPeriod - immediate, 3_months, 6_months, 12_months, longer"
    );
    console.log("     • riskLevel - low, medium, high");

    console.log("   🎯 Conversion Analysis:");
    console.log(
      "     • conversionStage - awareness, interest, consideration, purchase, retention"
    );
    console.log(
      "     • optimizationType - funnel, landing_page, checkout, onboarding"
    );

    console.log("   🏆 Website Grade:");
    console.log(
      "     • gradeCategory - performance, seo, accessibility, best_practices"
    );
    console.log("     • scoreRange - 90-100, 80-89, 70-79, 60-69, below_60");

    console.log("\n🔍 OPTIMIZED VECTOR ID PATTERNS:");

    console.log("\n🏰 Porter Intelligence Stack:");
    console.log("   • {demoId}-porter-forces-{force}");
    console.log("   • {demoId}-competitive-moat-{type}");
    console.log("   • {demoId}-value-chain-{activity}");
    console.log("   • {demoId}-swot-{quadrant}");
    console.log("   • {demoId}-bmc-{block}");
    console.log("   • {demoId}-gtm-{component}");

    console.log("\n🧠 Business Intelligence:");
    console.log("   • {demoId}-local-market-{aspect}");
    console.log("   • {demoId}-customer-sentiment-{type}");
    console.log("   • {demoId}-economic-intel-{indicator}");
    console.log("   • {demoId}-business-dna-{trait}");

    console.log("\n📈 Marketing & Growth:");
    console.log("   • {demoId}-magnet-posts-{type}");
    console.log("   • {demoId}-content-calendar-{period}");
    console.log("   • {demoId}-social-analysis-{platform}");
    console.log("   • {demoId}-quick-wins-{day}");

    console.log("\n💎 Optimization:");
    console.log("   • {demoId}-roi-calc-{investment}");
    console.log("   • {demoId}-conversion-{stage}");
    console.log("   • {demoId}-website-grade-{category}");
    console.log("   • {demoId}-brand-analysis-{component}");

    console.log("\n🔄 CROSS-AGENT SYNTHESIS VECTORS:");
    console.log("   • {demoId}-synthesis-strategic");
    console.log("   • {demoId}-synthesis-market");
    console.log("   • {demoId}-synthesis-growth");
    console.log("   • {demoId}-synthesis-complete");

    console.log("\n💡 SPECIALIZED SEARCH FUNCTIONS:");
    console.log("\n   🏰 Strategic Intelligence:");
    console.log("   • searchPorterForces(demoId, query, force?, topK)");
    console.log("   • searchCompetitiveMoat(demoId, query, moatType?, topK)");
    console.log(
      "   • searchStrategicFrameworks(demoId, query, framework?, topK)"
    );

    console.log("\n   🧠 Business Intelligence:");
    console.log("   • searchLocalMarket(demoId, query, scope?, topK)");
    console.log(
      "   • searchCustomerSentiment(demoId, query, sentimentType?, topK)"
    );
    console.log("   • searchEconomicIntel(demoId, query, indicator?, topK)");

    console.log("\n   📈 Marketing Intelligence:");
    console.log(
      "   • searchContentStrategy(demoId, query, contentType?, topK)"
    );
    console.log("   • searchSocialInsights(demoId, query, platform?, topK)");
    console.log(
      "   • searchQuickWins(demoId, query, actionType?, timeframe?, topK)"
    );

    console.log("\n   💎 Optimization Intelligence:");
    console.log(
      "   • searchROIOpportunities(demoId, query, investmentType?, topK)"
    );
    console.log("   • searchConversionInsights(demoId, query, stage?, topK)");
    console.log(
      "   • searchPerformanceMetrics(demoId, query, category?, topK)"
    );

    console.log("\n   🔄 Cross-Agent Search:");
    console.log(
      "   • searchUnifiedInsights(demoId, query, agentTypes?, minConfidence?, topK)"
    );
    console.log("   • getCompleteBusinessContext(demoId) - All agent results");
    console.log(
      "   • searchActionableInsights(demoId, query, urgency?, impact?, topK)"
    );

    console.log("\n🎯 OPTIMIZED QUERY EXAMPLES:");

    console.log("\n   Find Strategic Opportunities:");
    console.log("   ```typescript");
    console.log("   const opportunities = await searchUnifiedInsights(");
    console.log("     'demo-123',");
    console.log("     'growth opportunities market expansion',");
    console.log("     ['porter', 'business_intelligence'],");
    console.log("     0.8, // min confidence");
    console.log("     10   // top results");
    console.log("   );");
    console.log("   ```");

    console.log("\n   Find Immediate Action Items:");
    console.log("   ```typescript");
    console.log("   const quickWins = await searchQuickWins(");
    console.log("     'demo-123',");
    console.log("     'increase revenue this week',");
    console.log("     'revenue',");
    console.log("     'this_week',");
    console.log("     5");
    console.log("   );");
    console.log("   ```");

    console.log("\n   Get Complete Business Intelligence:");
    console.log("   ```typescript");
    console.log(
      "   const fullContext = await getCompleteBusinessContext('demo-123');"
    );
    console.log("   // Returns organized insights from all agents:");
    console.log("   // {");
    console.log("   //   strategic: { porter: [...], frameworks: [...] },");
    console.log("   //   intelligence: { market: [...], sentiment: [...] },");
    console.log("   //   marketing: { content: [...], social: [...] },");
    console.log("   //   optimization: { roi: [...], conversion: [...] }");
    console.log("   // }");
    console.log("   ```");

    console.log("\n📈 Performance Optimizations:");
    console.log(
      "   ✅ Granular chunking - Each insight component stored separately"
    );
    console.log(
      "   ✅ Rich metadata filtering - Search by agent, tier, confidence, category"
    );
    console.log(
      "   ✅ Batch upserts - All vectors stored in parallel for speed"
    );
    console.log(
      "   ✅ Semantic clustering - Related insights grouped for better retrieval"
    );
    console.log("   ✅ Cross-agent synthesis - Unified strategic context");
    console.log("   ✅ Confidence scoring - Quality-based result ranking");
    console.log("   ✅ Time-aware search - Recent insights prioritized");
    console.log(
      "   ✅ Business-specific search - Industry and size-aware results"
    );

    console.log("\n🔄 Integration Architecture:");
    console.log("   📊 Data Flow:");
    console.log("   1. Agent generates analysis → JSON structured output");
    console.log("   2. Analysis chunked → Individual insights extracted");
    console.log("   3. Insights embedded → OpenAI ada-002 vectors");
    console.log("   4. Vectors stored → Pinecone with rich metadata");
    console.log("   5. Search queries → Semantic + metadata filtering");
    console.log("   6. Results returned → Ranked by relevance + confidence");

    console.log("\n   🎯 Agent Categories:");
    console.log("   • Strategic Layer: Porter Intelligence Stack (Pro tier)");
    console.log(
      "   • Intelligence Layer: Market & sentiment analysis (Free + Pro)"
    );
    console.log("   • Marketing Layer: Content & growth strategies (Pro tier)");
    console.log(
      "   • Optimization Layer: Performance & ROI analysis (Pro + Consultation)"
    );

    console.log("\n✅ Comprehensive Pinecone optimization complete!");
    console.log(`   Index name: ${indexName}`);
    console.log(
      `   Vector provider: ${process.env.VECTOR_PROVIDER || "supabase (default)"}`
    );
    console.log(
      "   Set VECTOR_PROVIDER=pinecone in .env.local to use Pinecone"
    );

    console.log("\n📚 Next Steps:");
    console.log(
      "   1. Run any agent analysis - vectors auto-stored with optimized metadata"
    );
    console.log("   2. Use specialized search functions for targeted insights");
    console.log("   3. Build dashboards with vector-powered context");
    console.log("   4. Enable cross-agent synthesis for unified intelligence");
    console.log("   5. Monitor performance with confidence scoring");
    console.log("   6. Scale with business-specific and industry-aware search");

    console.log(
      "\n🎉 Your Pinecone index is now optimized for all Local AI agents!"
    );
    console.log("   Ready for strategic intelligence at scale! 🚀");
  } catch (error) {
    console.error("❌ Error setting up optimized Pinecone:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupOptimizedPinecone();
}

export { setupOptimizedPinecone };
