/**
 * Modern Vector Repository Pattern
 * Abstracts vector operations with provider-agnostic interface
 */

import { z } from "zod";

// Schemas for type safety
const searchParamsSchema = z.object({
  demoId: z.string(),
  query: z.string(),
  topK: z.number().default(5),
  filters: z.record(z.any()).optional(),
});

const competitorSearchSchema = searchParamsSchema.extend({
  analysisType: z.literal("competitor").default("competitor"),
  includeDirectCompetitors: z.boolean().default(true),
});

const roadmapSearchSchema = searchParamsSchema.extend({
  analysisType: z.literal("roadmap").default("roadmap"),
  timeframe: z.enum(["30_days", "90_days", "1_year"]).default("90_days"),
});

export type CompetitorSearchParams = z.infer<typeof competitorSearchSchema>;
export type RoadmapSearchParams = z.infer<typeof roadmapSearchSchema>;

interface VectorProvider {
  search(params: any): Promise<SearchResult[]>;
  upsert(vectors: VectorRecord[]): Promise<void>;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content?: string;
}

interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, any>;
}

class SupabaseVectorProvider implements VectorProvider {
  private supabase: any;

  constructor() {
    const { createClient } = require("@supabase/supabase-js");
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async search(params: any): Promise<SearchResult[]> {
    // Implementation using existing Supabase logic
    const { similaritySearch } = await import("../vector-utils");
    return similaritySearch(params);
  }

  async upsert(vectors: VectorRecord[]): Promise<void> {
    // Batch insert vectors into site_chunks table
    const records = vectors.map((v) => ({
      id: v.id,
      demo_id: v.metadata.demoId || v.metadata.demo_id || null, // Allow null for knowledge chunks
      content: JSON.stringify(v.metadata.content || {}),
      metadata: v.metadata,
      embedding: v.values,
    }));

    const { error } = await this.supabase.from("site_chunks").upsert(records, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      throw new Error(`Failed to upsert vectors: ${error.message}`);
    }
  }
}

class PineconeVectorProvider implements VectorProvider {
  private index: any;

  constructor() {
    const { Pinecone } = require("@pinecone-database/pinecone");
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    this.index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "local-ai-demos"
    );
  }

  async search(params: any): Promise<SearchResult[]> {
    const response = await this.index.query({
      vector: params.queryEmbedding,
      topK: params.topK,
      filter: params.filters,
      includeMetadata: true,
    });

    return response.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      content: match.metadata?.content,
    }));
  }

  async upsert(vectors: VectorRecord[]): Promise<void> {
    await this.index.upsert(vectors);
  }
}

function createProvider(type: "supabase" | "pinecone"): VectorProvider {
  return type === "pinecone"
    ? new PineconeVectorProvider()
    : new SupabaseVectorProvider();
}

export class VectorRepository {
  public provider: VectorProvider;

  constructor(providerType: "supabase" | "pinecone" = "supabase") {
    this.provider = createProvider(providerType);
  }

  async searchCompetitor(params: CompetitorSearchParams) {
    const validated = competitorSearchSchema.parse(params);

    return this.provider.search({
      ...validated,
      filters: {
        analysisType: "competitor",
        agentType: "business_intelligence",
        ...validated.filters,
      },
    });
  }

  async searchRoadmap(params: RoadmapSearchParams) {
    const validated = roadmapSearchSchema.parse(params);

    return this.provider.search({
      ...validated,
      filters: {
        analysisType: "roadmap",
        agentType: "optimization",
        timeframe: validated.timeframe,
        ...validated.filters,
      },
    });
  }

  async searchPorterForces(params: {
    demoId: string;
    query: string;
    force?: string;
    topK?: number;
  }) {
    const { generateEmbedding } = await import(
      "../embeddings/embedding-service"
    );
    const queryEmbedding = await generateEmbedding(params.query);

    return this.provider.search({
      queryEmbedding,
      topK: params.topK || 3,
      filters: {
        analysisType: "porter_framework", // Match what we seeded
        agentType: "porter",
        ...(params.force && { porterForce: params.force }),
      },
    });
  }

  async searchMarketingKnowledge(params: {
    demoId: string;
    query: string;
    contentType?: "social" | "content" | "email" | "seo" | "all";
    topK?: number;
  }) {
    const { generateEmbedding } = await import(
      "../embeddings/embedding-service"
    );
    const queryEmbedding = await generateEmbedding(params.query);

    return this.provider.search({
      queryEmbedding,
      topK: params.topK || 3,
      filters: {
        analysisType: "marketing_framework",
        agentType: "marketing",
        ...(params.contentType &&
          params.contentType !== "all" && { contentType: params.contentType }),
      },
    });
  }

  async searchStrategicFrameworks(params: {
    demoId: string;
    query: string;
    framework?:
      | "ansoff_matrix"
      | "bcg_matrix"
      | "positioning_map"
      | "customer_journey_map"
      | "okr";
    topK?: number;
  }) {
    const { generateEmbedding } = await import(
      "../embeddings/embedding-service"
    );
    const queryEmbedding = await generateEmbedding(params.query);

    return this.provider.search({
      queryEmbedding,
      topK: params.topK || 3,
      filters: {
        analysisType: "strategic_framework",
        agentType: "strategic",
        ...(params.framework && { framework: params.framework }),
      },
    });
  }

  async searchQuickWins(params: {
    demoId: string;
    effortLevel?: "low" | "medium" | "high";
  }) {
    return this.provider.search({
      ...params,
      filters: {
        analysisType: "quick_wins",
        agentType: "optimization",
        ...(params.effortLevel && { effortLevel: params.effortLevel }),
      },
    });
  }

  /**
   * Generic search method for custom queries
   * Use specific search methods when available for better type safety
   */
  async search(params: {
    query: string;
    topK?: number;
    filters?: Record<string, any>;
  }): Promise<SearchResult[]> {
    const { generateEmbedding } = await import(
      "../embeddings/embedding-service"
    );
    const queryEmbedding = await generateEmbedding(params.query);

    return this.provider.search({
      queryEmbedding,
      topK: params.topK || 5,
      filters: params.filters || {},
    });
  }
}
