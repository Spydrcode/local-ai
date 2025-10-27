/**
 * Comprehensive Vector Utilities for Local AI Platform
 *
 * Provides optimized vector operations for all agent categories:
 * - Porter Intelligence Stack (Strategic Analysis)
 * - Business Intelligence Agents
 * - Marketing & Growth Agents
 * - Optimization Agents
 * - Cross-Agent Synthesis
 */

import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize clients
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "local-ai-demos";
const USE_PINECONE = process.env.VECTOR_PROVIDER === "pinecone";

// Types
interface VectorMetadata {
  demoId: string;
  agentType: "porter" | "business_intelligence" | "marketing" | "optimization";
  agentName: string;
  analysisType: string;
  category: string;
  tier: "free" | "pro" | "consultation";
  confidence: number;
  timestamp: string;
  tags: string[];
  businessName?: string;
  industry?: string;
  [key: string]: any; // Allow agent-specific metadata
}

interface VectorRecord {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
  content?: string;
}

/**
 * Generate embeddings for text content
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Store vectors with optimized metadata for any agent
 */
export async function storeAgentVectors(
  demoId: string,
  agentName: string,
  analysisData: any,
  agentConfig: {
    agentType: VectorMetadata["agentType"];
    category: string;
    tier: VectorMetadata["tier"];
    analysisType: string;
  }
): Promise<void> {
  if (!USE_PINECONE) {
    console.log("Using Supabase vectors (VECTOR_PROVIDER not set to pinecone)");
    return;
  }

  try {
    const vectors: VectorRecord[] = [];
    const chunks = extractMeaningfulChunks(analysisData, agentName);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      vectors.push({
        id: `${demoId}-${agentName}-${chunk.id}`,
        values: embedding,
        metadata: {
          demoId,
          agentName,
          agentType: agentConfig.agentType,
          analysisType: agentConfig.analysisType,
          category: agentConfig.category,
          tier: agentConfig.tier,
          confidence: chunk.confidence || 0.8,
          timestamp: new Date().toISOString(),
          tags: generateTags(chunk, agentName),
          businessName: analysisData.businessName,
          industry: analysisData.industry,
          ...chunk.metadata, // Agent-specific metadata
        },
      });
    }

    // Batch upsert to Pinecone
    const index = pinecone.index(INDEX_NAME);
    await index.upsert(vectors);

    console.log(`✅ Stored ${vectors.length} vectors for ${agentName}`);
  } catch (error) {
    console.error(`Error storing vectors for ${agentName}:`, error);
    throw error;
  }
}

/**
 * Extract meaningful chunks from agent analysis data
 */
function extractMeaningfulChunks(
  analysisData: any,
  agentName: string
): Array<{
  id: string;
  content: string;
  confidence?: number;
  metadata?: any;
}> {
  const chunks: Array<{
    id: string;
    content: string;
    confidence?: number;
    metadata?: any;
  }> = [];

  switch (agentName) {
    case "porter-forces":
      if (analysisData.forces) {
        Object.entries(analysisData.forces).forEach(
          ([force, data]: [string, any]) => {
            chunks.push({
              id: `forces-${force}`,
              content: `${force}: ${JSON.stringify(data)}`,
              confidence: data.confidence || 0.8,
              metadata: {
                porterForce: force,
                forceStrength: data.strength,
                strategicImplication: data.implication,
              },
            });
          }
        );
      }
      break;

    case "competitive-moat":
      if (analysisData.competitive_moat) {
        Object.entries(analysisData.competitive_moat).forEach(
          ([moatType, data]: [string, any]) => {
            chunks.push({
              id: `moat-${moatType}`,
              content: `${moatType}: ${JSON.stringify(data)}`,
              confidence: data.defensibility || 0.7,
              metadata: {
                moatType,
                moatStrength: data.strength,
                defensibility: data.defensibility,
              },
            });
          }
        );
      }
      break;

    case "local-market-analysis":
      if (analysisData.competitive_landscape) {
        chunks.push({
          id: "competitive-landscape",
          content: JSON.stringify(analysisData.competitive_landscape),
          metadata: { marketScope: "local", competitorTier: "direct" },
        });
      }
      if (analysisData.market_position) {
        chunks.push({
          id: "market-position",
          content: JSON.stringify(analysisData.market_position),
          metadata: { marketPosition: "challenger" },
        });
      }
      break;

    case "customer-sentiment":
      if (analysisData.review_sentiment) {
        chunks.push({
          id: "review-sentiment",
          content: JSON.stringify(analysisData.review_sentiment),
          metadata: {
            sentimentType: "reviews",
            sentimentScore: 0.6, // Would be calculated from actual sentiment
          },
        });
      }
      break;

    case "quick-wins":
      Object.entries(analysisData).forEach(([day, action]: [string, any]) => {
        if (typeof action === "object" && action.action) {
          chunks.push({
            id: day,
            content: JSON.stringify(action),
            confidence: 0.9,
            metadata: {
              actionType: day.includes("revenue") ? "revenue" : "general",
              timeToImplement: "this_week",
              effortLevel: action.time_required?.includes("30")
                ? "low"
                : "medium",
            },
          });
        }
      });
      break;

    case "customer-magnet-posts":
      Object.entries(analysisData).forEach(
        ([postType, post]: [string, any]) => {
          if (typeof post === "object") {
            chunks.push({
              id: `post-${postType}`,
              content: JSON.stringify(post),
              metadata: {
                contentType: postType,
                platform: post.platform || "multi",
                engagementType: "conversions",
              },
            });
          }
        }
      );
      break;

    case "swot-analysis":
      ["strengths", "weaknesses", "opportunities", "threats"].forEach(
        (quadrant) => {
          if (analysisData[quadrant]) {
            chunks.push({
              id: `swot-${quadrant}`,
              content: JSON.stringify(analysisData[quadrant]),
              metadata: {
                frameworkType: "swot",
                swotQuadrant: quadrant,
              },
            });
          }
        }
      );
      break;

    case "business-model-canvas":
      const canvasBlocks = [
        "customer_segments",
        "value_propositions",
        "channels",
        "customer_relationships",
        "revenue_streams",
        "key_resources",
        "key_activities",
        "key_partnerships",
        "cost_structure",
      ];
      canvasBlocks.forEach((block) => {
        if (analysisData[block]) {
          chunks.push({
            id: `bmc-${block}`,
            content: JSON.stringify(analysisData[block]),
            metadata: {
              frameworkType: "business_model_canvas",
              canvasBlock: block,
            },
          });
        }
      });
      break;

    default:
      // Generic chunking for other agents
      if (typeof analysisData === "object") {
        Object.entries(analysisData).forEach(([key, value], index) => {
          if (value && typeof value === "object") {
            chunks.push({
              id: key,
              content: JSON.stringify(value),
              confidence: 0.7,
            });
          }
        });
      }
      break;
  }

  return chunks;
}

/**
 * Generate relevant tags for search optimization
 */
function generateTags(chunk: any, agentName: string): string[] {
  const tags = [agentName];

  // Add agent-specific tags
  if (chunk.metadata?.porterForce) tags.push("porter", "competitive-analysis");
  if (chunk.metadata?.swotQuadrant) tags.push("swot", "strategic-planning");
  if (chunk.metadata?.actionType) tags.push("quick-wins", "actionable");
  if (chunk.metadata?.contentType) tags.push("marketing", "content-strategy");
  if (chunk.metadata?.marketScope) tags.push("market-analysis", "local");

  // Add content-based tags
  if (chunk.content.includes("revenue")) tags.push("revenue");
  if (chunk.content.includes("competitor")) tags.push("competitive");
  if (chunk.content.includes("customer")) tags.push("customer");
  if (chunk.content.includes("marketing")) tags.push("marketing");
  if (chunk.content.includes("opportunity")) tags.push("opportunity");

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Search vectors with advanced filtering
 */
export async function searchAgentVectors(
  demoId: string,
  query: string,
  options: {
    agentTypes?: VectorMetadata["agentType"][];
    agentNames?: string[];
    categories?: string[];
    tiers?: VectorMetadata["tier"][];
    minConfidence?: number;
    topK?: number;
    includeMetadata?: boolean;
  } = {}
): Promise<SearchResult[]> {
  if (!USE_PINECONE) {
    console.log("Using Supabase search (VECTOR_PROVIDER not set to pinecone)");
    return [];
  }

  try {
    const queryEmbedding = await generateEmbedding(query);
    const index = pinecone.index(INDEX_NAME);

    // Build filter
    const filter: any = { demoId };

    if (options.agentTypes?.length) {
      filter.agentType = { $in: options.agentTypes };
    }
    if (options.agentNames?.length) {
      filter.agentName = { $in: options.agentNames };
    }
    if (options.categories?.length) {
      filter.category = { $in: options.categories };
    }
    if (options.tiers?.length) {
      filter.tier = { $in: options.tiers };
    }
    if (options.minConfidence) {
      filter.confidence = { $gte: options.minConfidence };
    }

    const results = await index.query({
      vector: queryEmbedding,
      filter,
      topK: options.topK || 10,
      includeMetadata: options.includeMetadata !== false,
    });

    return (
      results.matches?.map((match) => ({
        id: match.id!,
        score: match.score!,
        metadata: match.metadata as VectorMetadata,
        content: match.metadata?.content as string,
      })) || []
    );
  } catch (error) {
    console.error("Error searching vectors:", error);
    throw error;
  }
}

/**
 * Specialized search functions for each agent category
 */

// Porter Intelligence Stack searches
export async function searchPorterForces(
  demoId: string,
  query: string,
  force?: string,
  topK = 5
): Promise<SearchResult[]> {
  const filter: any = { agentType: "porter", agentName: "porter-forces" };
  if (force) filter.porterForce = force;

  return searchAgentVectors(demoId, query, {
    agentTypes: ["porter"],
    agentNames: ["porter-forces"],
    topK,
  });
}

export async function searchCompetitiveMoat(
  demoId: string,
  query: string,
  moatType?: string,
  topK = 5
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes: ["porter"],
    agentNames: ["competitive-moat"],
    topK,
  });
}

// Business Intelligence searches
export async function searchLocalMarket(
  demoId: string,
  query: string,
  scope?: string,
  topK = 5
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes: ["business_intelligence"],
    agentNames: ["local-market-analysis"],
    topK,
  });
}

export async function searchCustomerSentiment(
  demoId: string,
  query: string,
  sentimentType?: string,
  topK = 5
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes: ["business_intelligence"],
    agentNames: ["customer-sentiment"],
    topK,
  });
}

// Marketing searches
export async function searchQuickWins(
  demoId: string,
  query: string,
  actionType?: string,
  timeframe?: string,
  topK = 5
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes: ["marketing"],
    agentNames: ["quick-wins"],
    topK,
  });
}

export async function searchContentStrategy(
  demoId: string,
  query: string,
  contentType?: string,
  topK = 5
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes: ["marketing"],
    agentNames: ["customer-magnet-posts", "content-calendar"],
    topK,
  });
}

/**
 * Cross-agent unified search
 */
export async function searchUnifiedInsights(
  demoId: string,
  query: string,
  agentTypes?: VectorMetadata["agentType"][],
  minConfidence = 0.7,
  topK = 15
): Promise<SearchResult[]> {
  return searchAgentVectors(demoId, query, {
    agentTypes,
    minConfidence,
    topK,
  });
}

/**
 * Get complete business context from all agents
 */
export async function getCompleteBusinessContext(demoId: string): Promise<{
  strategic: SearchResult[];
  intelligence: SearchResult[];
  marketing: SearchResult[];
  optimization: SearchResult[];
}> {
  const [strategic, intelligence, marketing, optimization] = await Promise.all([
    searchAgentVectors(demoId, "*", { agentTypes: ["porter"], topK: 20 }),
    searchAgentVectors(demoId, "*", {
      agentTypes: ["business_intelligence"],
      topK: 20,
    }),
    searchAgentVectors(demoId, "*", { agentTypes: ["marketing"], topK: 20 }),
    searchAgentVectors(demoId, "*", { agentTypes: ["optimization"], topK: 20 }),
  ]);

  return { strategic, intelligence, marketing, optimization };
}

/**
 * Clean up old vectors for a demo
 */
export async function cleanupDemoVectors(demoId: string): Promise<void> {
  if (!USE_PINECONE) return;

  try {
    const index = pinecone.index(INDEX_NAME);

    // Get all vector IDs for this demo
    const results = await index.query({
      vector: new Array(1536).fill(0), // Dummy vector
      filter: { demoId },
      topK: 1000,
      includeMetadata: false,
    });

    if (results.matches && results.matches.length > 0) {
      const idsToDelete = results.matches.map((match) => match.id!);
      await index.deleteMany(idsToDelete);
      console.log(
        `🗑️ Cleaned up ${idsToDelete.length} vectors for demo ${demoId}`
      );
    }
  } catch (error) {
    console.error("Error cleaning up vectors:", error);
  }
}

export { generateEmbedding };
export type { SearchResult, VectorMetadata, VectorRecord };
