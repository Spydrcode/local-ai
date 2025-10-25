import { Pinecone } from "@pinecone-database/pinecone";
import { supabaseAdmin } from "../server/supabaseAdmin";
import { hfEmbed } from "./hf";
import { createEmbedding } from "./openai";

export type AnalysisType =
  | "website"
  | "competitor"
  | "roi"
  | "roadmap"
  | "progress"
  | "chat"
  | "insight"
  | "recommendation"
  | "social_media"
  | "content_generation"
  | "strategic"
  | "porter_agent" // Individual Porter Intelligence agent results
  | "economic_intelligence"; // Economic Intelligence & Predictive Analytics

export type Priority = "High" | "Medium" | "Low";
export type Status = "not_started" | "in_progress" | "completed" | "blocked";
export type Category =
  | "competitive"
  | "financial"
  | "strategic"
  | "implementation"
  | "marketing"
  | "technical";

export interface EnhancedMetadata {
  // Core identification
  demoId: string;
  analysisType?: AnalysisType;
  category?: Category;

  // Content classification
  heading?: string;
  section?: string;
  chunkType?: "heading" | "content" | "insight" | "action";

  // Priority & status (for roadmap/progress tracking)
  priority?: Priority;
  status?: Status;
  difficulty?: "Easy" | "Medium" | "Hard";

  // Quality metrics
  confidence?: number; // 0-1 AI confidence score
  relevanceScore?: number; // 0-1 relevance to business

  // Temporal data
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;

  // Content metrics
  contentLength?: number;
  wordCount?: number;

  // Semantic tags
  tags?: string[];
  keywords?: string[];

  // Feature-specific
  competitorName?: string;
  roiMetric?: string;
  actionItem?: string;

  // Social media specific
  platform?: "Facebook" | "Instagram" | "LinkedIn" | "Twitter" | "all";
  postType?: "promotional" | "engagement" | "educational";
  contentFocus?: string; // e.g., "product_features", "customer_stories", "industry_insights"
  brandVoice?: "professional" | "casual" | "bold" | "conservative";
  targetAudience?: string; // e.g., "B2B decision makers", "local consumers"

  // Porter Intelligence Stack specific
  agentName?:
    | "strategy-architect"
    | "value-chain"
    | "market-forces"
    | "differentiation-designer"
    | "profit-pool"
    | "operational-effectiveness-optimizer"
    | "local-strategy"
    | "executive-advisor"
    | "shared-value"
    | "synthesizer";
  agentVersion?: string; // For tracking agent improvements over time
  executionTime?: number; // Agent execution time in ms

  // Economic Intelligence specific
  economicAnalysisType?:
    | "context" // Current economic indicators
    | "impact" // Industry-specific impact assessment
    | "prediction" // Profit predictions
    | "scenario" // Scenario planning (worst/likely/best)
    | "sensitivity"; // Sensitivity analysis
  industry?: string; // Detected or specified industry
  scenarioType?: "worst" | "likely" | "best"; // For scenario planning chunks
  threatLevel?: "critical" | "major" | "moderate" | "minor"; // Regulatory threats
  timeframe?: "immediate" | "3-6 months" | "6-12 months" | "12+ months"; // Impact timing

  // Additional flexible metadata
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface VectorChunk {
  id: string;
  demoId: string;
  content: string;
  metadata?: EnhancedMetadata;
  embedding: number[];
}

export interface SimilarityResult {
  id: string;
  score: number;
  content: string;
  metadata?: EnhancedMetadata | Record<string, unknown>;
}

export interface SearchFilters {
  demoId?: string;
  analysisType?: AnalysisType | AnalysisType[];
  category?: Category | Category[];
  priority?: Priority | Priority[];
  status?: Status | Status[];
  tags?: string[];
  minConfidence?: number;
  minRelevance?: number;
  competitorName?: string;
  platform?: "Facebook" | "Instagram" | "LinkedIn" | "Twitter" | "all";
  postType?: "promotional" | "engagement" | "educational";
  contentFocus?: string;
  brandVoice?: "professional" | "casual" | "bold" | "conservative";
  dateRange?: {
    start: string;
    end: string;
  };
}

const useHFFallback = process.env.USE_HF === "true";

// Initialize Pinecone client lazily
let pineconeClient: Pinecone | null = null;

function getPineconeClient() {
  if (!pineconeClient && process.env.PINECONE_API_KEY) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

// Sanitize metadata for Pinecone - removes null/undefined values
// Enhanced to preserve complex metadata structures
function sanitizeMetadata(
  metadata: EnhancedMetadata
): Record<string, string | number | boolean | string[]> {
  const sanitized: Record<string, string | number | boolean | string[]> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Only include arrays of strings
      const stringArray = value.filter(
        (item): item is string => typeof item === "string"
      );
      if (stringArray.length > 0) {
        sanitized[key] = stringArray;
      }
    } else if (typeof value === "object") {
      // Convert objects to JSON strings
      sanitized[key] = JSON.stringify(value);
    }
  }

  return sanitized;
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((acc, value, index) => acc + value * b[index], 0);
  const normA = Math.sqrt(a.reduce((acc, value) => acc + value * value, 0));
  const normB = Math.sqrt(b.reduce((acc, value) => acc + value * value, 0));
  return dot / (normA * normB + 1e-8);
}

export async function embedText(text: string) {
  if (useHFFallback) {
    return {
      embedding: await hfEmbed(text),
      model: "hf",
    };
  }

  return createEmbedding(text);
}

export async function upsertChunks(chunks: VectorChunk[]) {
  if (!chunks.length) return;

  const provider = process.env.VECTOR_PROVIDER ?? "supabase";

  switch (provider) {
    case "supabase": {
      if (!supabaseAdmin) {
        throw new Error("Supabase admin client not configured.");
      }

      const { error } = await supabaseAdmin.from("site_chunks").upsert(
        chunks.map((chunk) => ({
          id: chunk.id,
          demo_id: chunk.demoId,
          content: chunk.content,
          metadata: chunk.metadata ?? {},
          embedding: chunk.embedding,
        }))
      );

      if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`);
      }
      return;
    }
    case "pinecone": {
      const pinecone = getPineconeClient();
      if (!pinecone) {
        throw new Error(
          "Pinecone client not configured. Set PINECONE_API_KEY in .env"
        );
      }

      const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";
      const index = pinecone.index(indexName);

      // Convert chunks to Pinecone format with enriched metadata
      const records = chunks.map((chunk) => {
        const baseMetadata = {
          demoId: chunk.demoId,
          content: chunk.content.substring(0, 40000), // Pinecone limit
          contentLength: chunk.content.length,
          wordCount: chunk.content.split(" ").length,
          timestamp: new Date().toISOString(),
          chunkType: (chunk.metadata?.heading ? "heading" : "content") as
            | "heading"
            | "content",
        };

        const combinedMetadata: EnhancedMetadata = {
          ...baseMetadata,
          ...(chunk.metadata ?? {}),
        };

        return {
          id: chunk.id,
          values: chunk.embedding,
          metadata: sanitizeMetadata(combinedMetadata),
        };
      });

      await index.upsert(records);
      console.log(
        `✓ Upserted ${records.length} vectors to Pinecone index: ${indexName}`
      );
      return;
    }
    default:
      throw new Error(`Unsupported vector provider: ${provider}`);
  }
}

/**
 * Enhanced similarity search with hybrid filtering
 * Combines semantic search with metadata filters for better results
 */
export async function similaritySearch({
  demoId,
  queryEmbedding,
  topK = 3,
  filters,
}: {
  demoId: string;
  queryEmbedding: number[];
  topK?: number;
  filters?: SearchFilters;
}): Promise<SimilarityResult[]> {
  const provider = process.env.VECTOR_PROVIDER ?? "supabase";

  switch (provider) {
    case "supabase": {
      if (!supabaseAdmin) {
        throw new Error("Supabase admin client not configured.");
      }

      const { data, error } = await supabaseAdmin
        .from("site_chunks")
        .select("id, content, metadata, embedding")
        .eq("demo_id", demoId);

      if (error) {
        throw new Error(`Supabase similarity lookup failed: ${error.message}`);
      }

      if (!data) return [];

      type SupabaseChunkRow = {
        id: string;
        content: string;
        metadata: Record<string, unknown> | null;
        embedding: number[];
      };

      const typedData = data as SupabaseChunkRow[];

      let results: SimilarityResult[] = typedData.map(
        (row: SupabaseChunkRow) => ({
          id: row.id,
          content: row.content,
          metadata: row.metadata ?? {},
          score: cosineSimilarity(queryEmbedding, row.embedding),
        })
      );

      // Apply metadata filters if provided
      if (filters) {
        results = applyMetadataFilters(results, filters);
      }

      return results.sort((a, b) => b.score - a.score).slice(0, topK);
    }
    case "pinecone": {
      const pinecone = getPineconeClient();
      if (!pinecone) {
        throw new Error(
          "Pinecone client not configured. Set PINECONE_API_KEY in .env"
        );
      }

      const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";
      const index = pinecone.index(indexName);

      // Build Pinecone filter combining demoId + custom filters
      const pineconeFilter = buildPineconeFilter(demoId, filters);

      // Enhanced query with better filtering and ranking
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: Math.min(topK * 3, 20), // Get more results for better filtering
        filter: pineconeFilter,
        includeMetadata: true,
      });

      // Transform and rank results with quality scoring
      const results = (queryResponse.matches ?? [])
        .filter((match) => (match.score ?? 0) > 0.7) // Filter low-quality matches
        .map((match) => {
          const content = (match.metadata?.content as string) ?? "";
          const wordCount = (match.metadata?.wordCount as number) ?? 0;
          const isHeading = match.metadata?.chunkType === "heading";
          const confidence = (match.metadata?.confidence as number) ?? 1;
          const relevanceScore =
            (match.metadata?.relevanceScore as number) ?? 1;

          // Boost score for headings, longer content, high confidence, high relevance
          let adjustedScore = match.score ?? 0;
          if (isHeading) adjustedScore += 0.1;
          if (wordCount > 50) adjustedScore += 0.05;
          if (confidence > 0.8) adjustedScore += 0.05;
          if (relevanceScore > 0.8) adjustedScore += 0.05;

          return {
            id: match.id,
            score: adjustedScore,
            content,
            metadata: match.metadata ?? {},
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return results;
    }
    default:
      throw new Error(`Unsupported vector provider: ${provider}`);
  }
}

/**
 * Build Pinecone filter from search filters
 */
function buildPineconeFilter(demoId: string, filters?: SearchFilters) {
  const filter: Record<string, unknown> = {
    demoId: { $eq: demoId },
  };

  if (!filters) return filter;

  if (filters.analysisType) {
    if (Array.isArray(filters.analysisType)) {
      filter.analysisType = { $in: filters.analysisType };
    } else {
      filter.analysisType = { $eq: filters.analysisType };
    }
  }

  if (filters.category) {
    if (Array.isArray(filters.category)) {
      filter.category = { $in: filters.category };
    } else {
      filter.category = { $eq: filters.category };
    }
  }

  if (filters.priority) {
    if (Array.isArray(filters.priority)) {
      filter.priority = { $in: filters.priority };
    } else {
      filter.priority = { $eq: filters.priority };
    }
  }

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      filter.status = { $in: filters.status };
    } else {
      filter.status = { $eq: filters.status };
    }
  }

  if (filters.competitorName) {
    filter.competitorName = { $eq: filters.competitorName };
  }

  return filter;
}

/**
 * Apply metadata filters to results (for Supabase)
 */
function applyMetadataFilters(
  results: SimilarityResult[],
  filters: SearchFilters
): SimilarityResult[] {
  return results.filter((result) => {
    const meta = result.metadata as EnhancedMetadata;
    if (!meta) return true;

    // Filter by analysisType
    if (filters.analysisType) {
      const types = Array.isArray(filters.analysisType)
        ? filters.analysisType
        : [filters.analysisType];
      if (meta.analysisType && !types.includes(meta.analysisType)) {
        return false;
      }
    }

    // Filter by category
    if (filters.category) {
      const categories = Array.isArray(filters.category)
        ? filters.category
        : [filters.category];
      if (meta.category && !categories.includes(meta.category)) {
        return false;
      }
    }

    // Filter by priority
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority)
        ? filters.priority
        : [filters.priority];
      if (meta.priority && !priorities.includes(meta.priority)) {
        return false;
      }
    }

    // Filter by status
    if (filters.status) {
      const statuses = Array.isArray(filters.status)
        ? filters.status
        : [filters.status];
      if (meta.status && !statuses.includes(meta.status)) {
        return false;
      }
    }

    // Filter by confidence threshold
    if (filters.minConfidence && meta.confidence) {
      if (meta.confidence < filters.minConfidence) {
        return false;
      }
    }

    // Filter by relevance threshold
    if (filters.minRelevance && meta.relevanceScore) {
      if (meta.relevanceScore < filters.minRelevance) {
        return false;
      }
    }

    // Filter by competitor name
    if (filters.competitorName && meta.competitorName) {
      if (meta.competitorName !== filters.competitorName) {
        return false;
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0 && meta.tags) {
      const hasTags = filters.tags.some((tag) => meta.tags?.includes(tag));
      if (!hasTags) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange && meta.timestamp) {
      const timestamp = new Date(meta.timestamp);
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      if (timestamp < start || timestamp > end) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Feature-specific search helpers
 */

// Search for competitor insights
export async function searchCompetitorVectors(
  demoId: string,
  query: string,
  competitorName?: string,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "competitor",
      category: "competitive",
      competitorName,
    },
  });
}

// Search for roadmap/implementation items
export async function searchRoadmapVectors(
  demoId: string,
  query: string,
  priority?: Priority,
  status?: Status,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "roadmap",
      category: "implementation",
      priority,
      status,
    },
  });
}

// Search for ROI/financial insights
export async function searchROIVectors(
  demoId: string,
  query: string,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "roi",
      category: "financial",
    },
  });
}

// Search for strategic insights
export async function searchInsightVectors(
  demoId: string,
  query: string,
  category?: Category,
  minConfidence = 0.7,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "insight",
      category,
      minConfidence,
    },
  });
}

// Search chat history for context
export async function searchChatVectors(
  demoId: string,
  query: string,
  topK = 3
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "chat",
    },
  });
}

/**
 * Search for social media content generation context
 * Optimized for Copy, Style, and Emoji agents
 */
export async function searchSocialMediaVectors(
  demoId: string,
  query: string,
  platform?: "Facebook" | "Instagram" | "LinkedIn" | "Twitter",
  topK = 8
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      category: "marketing",
      platform: platform || "all",
    },
  });
}

/**
 * Search for copy-writing specific context
 * Focuses on product features, differentiators, voice
 */
export async function searchCopyContextVectors(
  demoId: string,
  query: string,
  postType: "promotional" | "engagement" | "educational",
  topK = 6
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      category: "marketing",
      postType,
      tags: ["products", "services", "differentiators", "value_proposition"],
    },
  });
}

/**
 * Search for brand voice and tone indicators
 * Helps Style and Emoji agents match brand personality
 */
export async function searchBrandVoiceVectors(
  demoId: string,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(
    "brand voice tone personality language style communication"
  );

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      tags: ["brand", "voice", "tone", "personality", "communication"],
    },
  });
}

/**
 * Search for target audience and customer insights
 * Helps agents tailor content to specific demographics
 */
export async function searchAudienceVectors(
  demoId: string,
  platform?: "Facebook" | "Instagram" | "LinkedIn" | "Twitter",
  topK = 5
): Promise<SimilarityResult[]> {
  const platformAudience = {
    Facebook: "community local families consumers",
    Instagram: "visual lifestyle aspirational millennials",
    LinkedIn: "professional B2B decision-makers executives",
    Twitter: "real-time news engaged active followers",
  };

  const query = platform
    ? `target audience customers ${platformAudience[platform]}`
    : "target audience customers demographics psychographics";

  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      tags: ["audience", "customers", "demographics", "targeting"],
    },
  });
}

/**
 * Search for Porter Intelligence agent results
 * Optimized for strategic analysis retrieval
 */
export async function searchPorterAgentVectors(
  demoId: string,
  query: string,
  agentName?:
    | "strategy-architect"
    | "value-chain"
    | "market-forces"
    | "differentiation-designer"
    | "profit-pool"
    | "operational-effectiveness-optimizer"
    | "local-strategy"
    | "executive-advisor"
    | "shared-value"
    | "synthesizer",
  minConfidence = 0.7,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: SearchFilters = {
    analysisType: "strategic",
    category: "strategic",
    minConfidence,
  };

  // Add agent-specific metadata to search filters
  if (agentName) {
    // For Supabase, we'll filter in the results
    // For Pinecone, metadata filter works directly
    filters.tags = ["porter-intelligence", agentName];
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

/**
 * Get all Porter agent results for a demo
 * Returns vectors for all 9 agents + synthesis
 */
export async function getPorterAgentResults(
  demoId: string
): Promise<Record<string, SimilarityResult[]>> {
  const agentNames = [
    "strategy-architect",
    "value-chain",
    "market-forces",
    "differentiation-designer",
    "profit-pool",
    "operational-effectiveness-optimizer",
    "local-strategy",
    "executive-advisor",
    "shared-value",
    "synthesizer",
  ];

  const provider = process.env.VECTOR_PROVIDER ?? "supabase";

  if (provider === "supabase") {
    // Fetch all Porter vectors in one query for efficiency
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not configured.");
    }

    const { data, error } = await supabaseAdmin
      .from("site_chunks")
      .select("id, content, metadata")
      .eq("demo_id", demoId)
      .eq("metadata->>analysisType", "strategic")
      .in("metadata->>agentName", agentNames);

    if (error) {
      throw new Error(`Failed to fetch Porter agents: ${error.message}`);
    }

    // Group by agent name
    const results: Record<string, SimilarityResult[]> = {};
    agentNames.forEach((agent) => (results[agent] = []));

    data?.forEach((row) => {
      const agentName = row.metadata?.agentName;
      if (agentName && agentNames.includes(agentName)) {
        results[agentName].push({
          id: row.id,
          content: row.content,
          metadata: row.metadata,
          score: 1.0, // No similarity scoring for direct fetch
        });
      }
    });

    return results;
  } else {
    // Pinecone: Fetch by vector ID pattern
    const results: Record<string, SimilarityResult[]> = {};

    for (const agentName of agentNames) {
      const vectorId = `${demoId}-agent-${agentName}`;

      try {
        const pinecone = getPineconeClient();
        if (!pinecone) {
          throw new Error("Pinecone client not configured");
        }

        const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";
        const index = pinecone.index(indexName);

        const fetchResponse = await index.fetch([vectorId]);

        if (fetchResponse.records[vectorId]) {
          const record = fetchResponse.records[vectorId];
          results[agentName] = [
            {
              id: vectorId,
              content: (record.metadata?.content as string) || "",
              metadata: record.metadata || {},
              score: 1.0,
            },
          ];
        } else {
          results[agentName] = [];
        }
      } catch (error) {
        console.error(`Error fetching ${agentName}:`, error);
        results[agentName] = [];
      }
    }

    return results;
  }
}

/**
 * Search for Economic Intelligence analysis results
 * Optimized for macro-economic and predictive analytics retrieval
 */
export async function searchEconomicIntelligenceVectors(
  demoId: string,
  query: string,
  economicAnalysisType?:
    | "context"
    | "impact"
    | "prediction"
    | "scenario"
    | "sensitivity",
  scenarioType?: "worst" | "likely" | "best",
  minConfidence = 0.7,
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(query);

  const filters: SearchFilters = {
    analysisType: "economic_intelligence",
    minConfidence,
  };

  // Add economic-specific metadata to search filters
  if (economicAnalysisType || scenarioType) {
    filters.tags = ["economic-intelligence"];
    if (economicAnalysisType) {
      filters.tags.push(economicAnalysisType);
    }
    if (scenarioType) {
      filters.tags.push(`scenario-${scenarioType}`);
    }
  }

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}

/**
 * Get Economic Intelligence results by type
 * Returns specific economic analysis components
 */
export async function getEconomicIntelligenceResults(
  demoId: string,
  analysisTypes?: Array<
    "context" | "impact" | "prediction" | "scenario" | "sensitivity"
  >
): Promise<Record<string, SimilarityResult[]>> {
  const types = analysisTypes || [
    "context",
    "impact",
    "prediction",
    "scenario",
    "sensitivity",
  ];

  const provider = process.env.VECTOR_PROVIDER ?? "supabase";

  if (provider === "supabase") {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not configured.");
    }

    const { data, error } = await supabaseAdmin
      .from("site_chunks")
      .select("id, content, metadata")
      .eq("demo_id", demoId)
      .eq("metadata->>analysisType", "economic_intelligence");

    if (error) {
      throw new Error(
        `Failed to fetch Economic Intelligence: ${error.message}`
      );
    }

    // Group by economic analysis type
    const results: Record<string, SimilarityResult[]> = {};
    types.forEach((type) => (results[type] = []));

    data?.forEach((row) => {
      const economicType = row.metadata?.economicAnalysisType;
      if (economicType && types.includes(economicType)) {
        results[economicType].push({
          id: row.id,
          content: row.content,
          metadata: row.metadata,
          score: 1.0,
        });
      }
    });

    return results;
  } else {
    // Pinecone: Fetch by vector ID pattern
    const results: Record<string, SimilarityResult[]> = {};

    for (const analysisType of types) {
      const vectorId = `${demoId}-economic-${analysisType}`;

      try {
        const pinecone = getPineconeClient();
        if (!pinecone) {
          throw new Error("Pinecone client not configured");
        }

        const indexName = process.env.PINECONE_INDEX_NAME ?? "local-ai-demos";
        const index = pinecone.index(indexName);

        const fetchResponse = await index.fetch([vectorId]);

        if (fetchResponse.records[vectorId]) {
          const record = fetchResponse.records[vectorId];
          results[analysisType] = [
            {
              id: vectorId,
              content: (record.metadata?.content as string) || "",
              metadata: record.metadata || {},
              score: 1.0,
            },
          ];
        } else {
          results[analysisType] = [];
        }
      } catch (error) {
        console.error(`Error fetching economic ${analysisType}:`, error);
        results[analysisType] = [];
      }
    }

    return results;
  }
}

/**
 * Search for scenario-specific recommendations
 * Retrieves worst/likely/best case strategic actions
 */
export async function searchEconomicScenariosVectors(
  demoId: string,
  scenarioType: "worst" | "likely" | "best",
  topK = 5
): Promise<SimilarityResult[]> {
  const scenarioQueries = {
    worst:
      "worst case scenario survival actions cash preservation risk mitigation",
    likely:
      "likely case scenario adaptation strategies selective investment operational efficiency",
    best: "best case scenario growth opportunities market expansion strategic investment",
  };

  const query = scenarioQueries[scenarioType];
  const { embedding } = await embedText(query);

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters: {
      analysisType: "economic_intelligence",
      tags: ["scenario-planning", `scenario-${scenarioType}`],
    },
  });
}

/**
 * Search for regulatory threat analysis
 * Retrieves policy changes and their industry impacts
 */
export async function searchRegulatoryThreatsVectors(
  demoId: string,
  threatLevel?: "critical" | "major" | "moderate" | "minor",
  topK = 5
): Promise<SimilarityResult[]> {
  const { embedding } = await embedText(
    "regulatory changes policy threats government shutdown SNAP benefits minimum wage tax policy industry impact"
  );

  const filters: SearchFilters = {
    analysisType: "economic_intelligence",
    tags: ["regulatory-threats"],
  };

  // Note: threatLevel filtering would need to be done post-fetch for Supabase
  // or as metadata filter for Pinecone

  return similaritySearch({
    demoId,
    queryEmbedding: embedding as number[],
    topK,
    filters,
  });
}
