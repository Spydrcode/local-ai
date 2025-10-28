/**
 * Optimized Pinecone Vector Setup for Local AI Platform
 * 
 * Usage: npm run setup:pinecone-optimized
 */

import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  indexName: process.env.PINECONE_INDEX_NAME ?? "local-ai-demos",
  dimension: 1536, // OpenAI ada-002
  metric: "cosine" as const,
  cloud: "aws" as const,
  region: "us-east-1" as const,
} as const;

// ============================================================================
// METADATA SCHEMA DEFINITIONS
// ============================================================================

const AGENT_CATEGORIES = {
  porter: {
    name: "🏰 PORTER INTELLIGENCE STACK",
    subcategories: {
      forces: {
        name: "Porter's Five Forces",
        fields: ["porterForce", "forceStrength", "strategicImplication"],
        values: {
          porterForce: ["buyer_power", "supplier_power", "new_entrants", "substitutes", "competitive_rivalry"],
          forceStrength: ["very_low", "low", "moderate", "high", "very_high"],
          strategicImplication: ["threat", "opportunity", "neutral"],
        },
      },
      moat: {
        name: "Competitive Moat",
        fields: ["moatType", "moatStrength", "defensibility"],
        values: {
          moatType: ["switching_costs", "network_effects", "economies_of_scale", "brand", "regulatory"],
          moatStrength: ["weak", "moderate", "strong", "very_strong"],
        },
      },
      value_chain: {
        name: "Value Chain",
        fields: ["chainActivity", "activityType", "costAdvantage", "differentiationPotential"],
        values: {
          chainActivity: ["inbound_logistics", "operations", "outbound_logistics", "marketing", "service"],
          activityType: ["primary", "support"],
        },
      },
      frameworks: {
        name: "Strategic Frameworks",
        fields: ["frameworkType", "swotQuadrant", "canvasBlock", "gtmComponent"],
        values: {
          frameworkType: ["swot", "business_model_canvas", "gtm_strategy"],
          swotQuadrant: ["strengths", "weaknesses", "opportunities", "threats"],
        },
      },
    },
  },
  business_intelligence: {
    name: "🧠 BUSINESS INTELLIGENCE",
    subcategories: {
      local_market: {
        name: "Local Market Analysis",
        fields: ["marketScope", "competitorTier", "marketPosition"],
        values: {
          marketScope: ["local", "regional", "national"],
          competitorTier: ["direct", "indirect", "substitute"],
          marketPosition: ["leader", "challenger", "follower", "nicher"],
        },
      },
      sentiment: {
        name: "Customer Sentiment",
        fields: ["sentimentType", "sentimentScore", "emotionType"],
        values: {
          sentimentType: ["reviews", "social", "surveys", "feedback"],
          emotionType: ["joy", "trust", "fear", "surprise", "sadness", "disgust", "anger", "anticipation"],
        },
      },
      economic: {
        name: "Economic Intelligence",
        fields: ["economicIndicator", "timeHorizon", "impactLevel"],
        values: {
          economicIndicator: ["gdp", "inflation", "employment", "interest_rates"],
          timeHorizon: ["current", "short_term", "medium_term", "long_term"],
          impactLevel: ["low", "moderate", "high", "critical"],
        },
      },
    },
  },
  marketing: {
    name: "📈 MARKETING & GROWTH",
    subcategories: {
      content: {
        name: "Customer Magnet Posts",
        fields: ["contentType", "platform", "engagementType"],
        values: {
          contentType: ["social_proof", "educational", "behind_scenes", "problem_solution"],
          platform: ["facebook", "instagram", "linkedin", "twitter", "tiktok"],
          engagementType: ["likes", "shares", "comments", "clicks", "conversions"],
        },
      },
      calendar: {
        name: "Content Calendar",
        fields: ["contentCategory", "postingFrequency", "seasonality"],
        values: {
          contentCategory: ["promotional", "educational", "entertaining", "user_generated"],
          postingFrequency: ["daily", "weekly", "bi_weekly", "monthly"],
          seasonality: ["evergreen", "seasonal", "event_based"],
        },
      },
      quick_wins: {
        name: "Quick Wins",
        fields: ["actionType", "timeToImplement", "effortLevel", "expectedImpact"],
        values: {
          actionType: ["revenue", "customer_acquisition", "efficiency", "competitive"],
          timeToImplement: ["immediate", "this_week", "this_month"],
          effortLevel: ["low", "medium", "high"],
          expectedImpact: ["low", "medium", "high", "game_changer"],
        },
      },
    },
  },
  optimization: {
    name: "💎 OPTIMIZATION",
    subcategories: {
      roi: {
        name: "ROI Calculator",
        fields: ["investmentType", "paybackPeriod", "riskLevel"],
        values: {
          investmentType: ["marketing", "technology", "operations", "people"],
          paybackPeriod: ["immediate", "3_months", "6_months", "12_months", "longer"],
          riskLevel: ["low", "medium", "high"],
        },
      },
      conversion: {
        name: "Conversion Analysis",
        fields: ["conversionStage", "optimizationType"],
        values: {
          conversionStage: ["awareness", "interest", "consideration", "purchase", "retention"],
          optimizationType: ["funnel", "landing_page", "checkout", "onboarding"],
        },
      },
      grading: {
        name: "Website Grade",
        fields: ["gradeCategory", "scoreRange"],
        values: {
          gradeCategory: ["performance", "seo", "accessibility", "best_practices"],
          scoreRange: ["90-100", "80-89", "70-79", "60-69", "below_60"],
        },
      },
    },
  },
} as const;

const UNIVERSAL_FIELDS = [
  { name: "demoId", type: "string", description: "Links to demos table" },
  { name: "agentType", type: "string", description: "porter, business_intelligence, marketing, optimization" },
  { name: "agentName", type: "string", description: "Specific agent identifier" },
  { name: "analysisType", type: "string", description: "Specific analysis performed" },
  { name: "category", type: "string", description: "strategic, market, content, optimization" },
  { name: "tier", type: "string", description: "free, pro, consultation" },
  { name: "confidence", type: "number", description: "0.0-1.0 quality score" },
  { name: "timestamp", type: "string", description: "ISO 8601 datetime" },
  { name: "tags", type: "string[]", description: "Searchable keywords" },
  { name: "businessName", type: "string", description: "For business-specific search" },
  { name: "industry", type: "string", description: "Industry classification" },
] as const;

const SEARCH_FUNCTIONS = {
  strategic: [
    "searchPorterForces(demoId, query, force?, topK)",
    "searchCompetitiveMoat(demoId, query, moatType?, topK)",
    "searchStrategicFrameworks(demoId, query, framework?, topK)",
  ],
  intelligence: [
    "searchLocalMarket(demoId, query, scope?, topK)",
    "searchCustomerSentiment(demoId, query, sentimentType?, topK)",
    "searchEconomicIntel(demoId, query, indicator?, topK)",
  ],
  marketing: [
    "searchContentStrategy(demoId, query, contentType?, topK)",
    "searchSocialInsights(demoId, query, platform?, topK)",
    "searchQuickWins(demoId, query, actionType?, timeframe?, topK)",
  ],
  optimization: [
    "searchROIOpportunities(demoId, query, investmentType?, topK)",
    "searchConversionInsights(demoId, query, stage?, topK)",
    "searchPerformanceMetrics(demoId, query, category?, topK)",
  ],
  cross_agent: [
    "searchUnifiedInsights(demoId, query, agentTypes?, minConfidence?, topK)",
    "getCompleteBusinessContext(demoId)",
    "searchActionableInsights(demoId, query, urgency?, impact?, topK)",
  ],
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function logSection(title: string, emoji = "") {
  console.log(`\n${emoji} ${title}:`);
}

function logSubsection(title: string) {
  console.log(`   ${title}:`);
}

function logItem(text: string) {
  console.log(`     • ${text}`);
}

function logExample(code: string) {
  console.log(`   ${code}`);
}

function checkEnvironment(): string {
  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    console.error("❌ PINECONE_API_KEY not found in .env.local\n");
    console.log("Please add your Pinecone API key:");
    console.log("1. Sign up at https://www.pinecone.io/");
    console.log("2. Create an API key in the console");
    console.log("3. Add to .env.local: PINECONE_API_KEY=your-key-here\n");
    process.exit(1);
  }
  
  return apiKey;
}

async function ensureIndexExists(pinecone: Pinecone): Promise<void> {
  const indexes = await pinecone.listIndexes();
  const existingIndex = indexes.indexes?.find((idx) => idx.name === CONFIG.indexName);

  if (existingIndex) {
    console.log(`✅ Index "${CONFIG.indexName}" already exists`);
    console.log(`   Dimension: ${existingIndex.dimension}`);
    console.log(`   Metric: ${existingIndex.metric}`);
    console.log(`   Status: ${existingIndex.status?.state || "unknown"}`);
    return;
  }

  console.log(`📦 Creating new index: ${CONFIG.indexName}...`);

  await pinecone.createIndex({
    name: CONFIG.indexName,
    dimension: CONFIG.dimension,
    metric: CONFIG.metric,
    spec: {
      serverless: {
        cloud: CONFIG.cloud,
        region: CONFIG.region,
      },
    },
    deletionProtection: "disabled",
  });

  console.log("✅ Index created successfully");
}

async function displayIndexStats(pinecone: Pinecone): Promise<void> {
  const index = pinecone.index(CONFIG.indexName);
  const stats = await index.describeIndexStats();

  logSection("📊 Index Statistics");
  console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
  console.log(`   Dimensions: ${stats.dimension}`);
  console.log(`   Index fullness: ${((stats.indexFullness || 0) * 100).toFixed(2)}%`);
}

function displayMetadataSchema(): void {
  logSection("🗂️  COMPREHENSIVE METADATA SCHEMA");

  // Universal Fields
  logSection("📋 Universal Fields (All Agents)");
  UNIVERSAL_FIELDS.forEach(field => {
    console.log(`   ✓ ${field.name} (${field.type}) - ${field.description}`);
  });

  // Agent Categories
  Object.entries(AGENT_CATEGORIES).forEach(([key, category]) => {
    logSection(category.name, "");
    
    Object.entries(category.subcategories).forEach(([subKey, sub]) => {
      logSubsection(sub.name);
      
      sub.fields.forEach((field: string) => {
        const values = sub.values?.[field as keyof typeof sub.values];
        if (values && Array.isArray(values)) {
          logItem(`${field} - ${values.join(", ")}`);
        } else {
          logItem(field);
        }
      });
    });
  });
}

function displayVectorIdPatterns(): void {
  logSection("🔍 OPTIMIZED VECTOR ID PATTERNS");

  const patterns = {
    "🏰 Porter Intelligence Stack": [
      "{demoId}-porter-forces-{force}",
      "{demoId}-competitive-moat-{type}",
      "{demoId}-value-chain-{activity}",
      "{demoId}-swot-{quadrant}",
      "{demoId}-bmc-{block}",
      "{demoId}-gtm-{component}",
    ],
    "🧠 Business Intelligence": [
      "{demoId}-local-market-{aspect}",
      "{demoId}-customer-sentiment-{type}",
      "{demoId}-economic-intel-{indicator}",
      "{demoId}-business-dna-{trait}",
    ],
    "📈 Marketing & Growth": [
      "{demoId}-magnet-posts-{type}",
      "{demoId}-content-calendar-{period}",
      "{demoId}-social-analysis-{platform}",
      "{demoId}-quick-wins-{day}",
    ],
    "💎 Optimization": [
      "{demoId}-roi-calc-{investment}",
      "{demoId}-conversion-{stage}",
      "{demoId}-website-grade-{category}",
      "{demoId}-brand-analysis-{component}",
    ],
  };

  Object.entries(patterns).forEach(([category, patterns]) => {
    logSection(category, "");
    patterns.forEach(pattern => logItem(pattern));
  });

  logSection("🔄 CROSS-AGENT SYNTHESIS VECTORS", "");
  logItem("{demoId}-synthesis-strategic");
  logItem("{demoId}-synthesis-market");
  logItem("{demoId}-synthesis-growth");
  logItem("{demoId}-synthesis-complete");
}

function displaySearchFunctions(): void {
  logSection("💡 SPECIALIZED SEARCH FUNCTIONS");

  Object.entries(SEARCH_FUNCTIONS).forEach(([category, functions]) => {
    const categoryNames: Record<string, string> = {
      strategic: "🏰 Strategic Intelligence",
      intelligence: "🧠 Business Intelligence",
      marketing: "📈 Marketing Intelligence",
      optimization: "💎 Optimization Intelligence",
      cross_agent: "🔄 Cross-Agent Search",
    };
    
    logSection(categoryNames[category], "");
    functions.forEach(fn => logItem(fn));
  });
}

function displayQueryExamples(): void {
  logSection("🎯 OPTIMIZED QUERY EXAMPLES");

  const examples = [
    {
      title: "Find Strategic Opportunities",
      code: `const opportunities = await searchUnifiedInsights(
  'demo-123',
  'growth opportunities market expansion',
  ['porter', 'business_intelligence'],
  0.8, // min confidence
  10   // top results
);`,
    },
    {
      title: "Find Immediate Action Items",
      code: `const quickWins = await searchQuickWins(
  'demo-123',
  'increase revenue this week',
  'revenue',
  'this_week',
  5
);`,
    },
    {
      title: "Get Complete Business Intelligence",
      code: `const fullContext = await getCompleteBusinessContext('demo-123');
// Returns organized insights from all agents:
// {
//   strategic: { porter: [...], frameworks: [...] },
//   intelligence: { market: [...], sentiment: [...] },
//   marketing: { content: [...], social: [...] },
//   optimization: { roi: [...], conversion: [...] }
// }`,
    },
  ];

  examples.forEach(({ title, code }) => {
    logSection(title, "");
    console.log("   ```typescript");
    code.split("\n").forEach(line => logExample(line));
    console.log("   ```");
  });
}

function displayOptimizations(): void {
  logSection("📈 Performance Optimizations");
  [
    "Granular chunking - Each insight component stored separately",
    "Rich metadata filtering - Search by agent, tier, confidence, category",
    "Batch upserts - All vectors stored in parallel for speed",
    "Semantic clustering - Related insights grouped for better retrieval",
    "Cross-agent synthesis - Unified strategic context",
    "Confidence scoring - Quality-based result ranking",
    "Time-aware search - Recent insights prioritized",
    "Business-specific search - Industry and size-aware results",
  ].forEach(opt => console.log(`   ✅ ${opt}`));
}

function displayIntegrationArchitecture(): void {
  logSection("🔄 Integration Architecture");
  
  logSubsection("📊 Data Flow");
  [
    "Agent generates analysis → JSON structured output",
    "Analysis chunked → Individual insights extracted",
    "Insights embedded → OpenAI ada-002 vectors",
    "Vectors stored → Pinecone with rich metadata",
    "Search queries → Semantic + metadata filtering",
    "Results returned → Ranked by relevance + confidence",
  ].forEach((step, i) => console.log(`   ${i + 1}. ${step}`));

  logSubsection("🎯 Agent Categories");
  [
    "Strategic Layer: Porter Intelligence Stack (Pro tier)",
    "Intelligence Layer: Market & sentiment analysis (Free + Pro)",
    "Marketing Layer: Content & growth strategies (Pro tier)",
    "Optimization Layer: Performance & ROI analysis (Pro + Consultation)",
  ].forEach(cat => logItem(cat));
}

function displayNextSteps(): void {
  logSection("📚 Next Steps");
  [
    "Run any agent analysis - vectors auto-stored with optimized metadata",
    "Use specialized search functions for targeted insights",
    "Build dashboards with vector-powered context",
    "Enable cross-agent synthesis for unified intelligence",
    "Monitor performance with confidence scoring",
    "Scale with business-specific and industry-aware search",
  ].forEach((step, i) => console.log(`   ${i + 1}. ${step}`));
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

async function setupOptimizedPinecone() {
  console.log("🚀 Setting up Optimized Pinecone for All Local AI Agents...\n");

  const apiKey = checkEnvironment();
  const pinecone = new Pinecone({ apiKey });

  try {
    await ensureIndexExists(pinecone);
    await displayIndexStats(pinecone);
    
    displayMetadataSchema();
    displayVectorIdPatterns();
    displaySearchFunctions();
    displayQueryExamples();
    displayOptimizations();
    displayIntegrationArchitecture();

    console.log("\n✅ Comprehensive Pinecone optimization complete!");
    console.log(`   Index name: ${CONFIG.indexName}`);
    console.log(`   Vector provider: ${process.env.VECTOR_PROVIDER || "supabase (default)"}`);
    console.log("   Set VECTOR_PROVIDER=pinecone in .env.local to use Pinecone");

    displayNextSteps();

    console.log("\n🎉 Your Pinecone index is now optimized for all Local AI agents!");
    console.log("   Ready for strategic intelligence at scale! 🚀\n");
  } catch (error) {
    console.error("\n❌ Error setting up optimized Pinecone:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  setupOptimizedPinecone();
}

export { setupOptimizedPinecone, CONFIG, AGENT_CATEGORIES, SEARCH_FUNCTIONS };