/**
 * Enhanced Vector Repository with Namespace Support
 * Production-grade vector operations with proper data isolation
 */

import { z } from "zod";
import PineconeClient, { pineconeClient } from "../vector/pinecone-client";
import { generateEmbedding } from "../embeddings/embedding-service";

// ============================================================================
// SCHEMAS
// ============================================================================

const searchParamsSchema = z.object({
  query: z.string(),
  namespace: z.string().optional(),
  topK: z.number().default(5),
  filters: z.record(z.any()).optional(),
  includeMetadata: z.boolean().default(true),
});

const upsertParamsSchema = z.object({
  vectors: z.array(
    z.object({
      id: z.string(),
      values: z.array(z.number()),
      metadata: z.record(z.any()).optional(),
    })
  ),
  namespace: z.string().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content?: string;
  namespace?: string;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: Record<string, any>;
}

export interface NamespaceConfig {
  porter: string;
  marketing: string;
  strategic: string;
  business_intelligence: string;
  optimization: string;
  default: string;
}

// ============================================================================
// ENHANCED VECTOR REPOSITORY
// ============================================================================

export class EnhancedVectorRepository {
  private indexName: string;
  private namespaces: NamespaceConfig;

  constructor(indexName?: string) {
    this.indexName = indexName || process.env.PINECONE_INDEX_NAME || "forecasta-ai-demos";

    // Define namespace structure for data isolation
    this.namespaces = {
      porter: "porter-intelligence",
      marketing: "marketing-growth",
      strategic: "strategic-frameworks",
      business_intelligence: "business-intel",
      optimization: "optimization",
      default: "general",
    };
  }

  /**
   * Get namespace by agent type
   */
  getNamespace(agentType?: string): string {
    if (!agentType) return this.namespaces.default;

    const namespace = this.namespaces[agentType as keyof NamespaceConfig];
    return namespace || this.namespaces.default;
  }

  /**
   * Search vectors with namespace support
   */
  async search(params: {
    query: string;
    namespace?: string;
    agentType?: string;
    topK?: number;
    filters?: Record<string, any>;
  }): Promise<SearchResult[]> {
    const validated = searchParamsSchema.parse({
      query: params.query,
      namespace: params.namespace || this.getNamespace(params.agentType),
      topK: params.topK || 5,
      filters: params.filters,
    });

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(validated.query);

    // Search with retry logic
    const response = await pineconeClient.query({
      indexName: this.indexName,
      namespace: validated.namespace,
      vector: queryEmbedding,
      topK: validated.topK,
      filter: validated.filters,
      includeMetadata: true,
    });

    return response.matches?.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata || {},
      content: match.metadata?.content,
      namespace: validated.namespace,
    })) || [];
  }

  /**
   * Upsert vectors with namespace support
   */
  async upsert(params: {
    vectors: VectorRecord[];
    namespace?: string;
    agentType?: string;
  }): Promise<void> {
    const namespace = params.namespace || this.getNamespace(params.agentType);

    const validated = upsertParamsSchema.parse({
      vectors: params.vectors,
      namespace,
    });

    await pineconeClient.upsert({
      indexName: this.indexName,
      namespace: validated.namespace,
      vectors: validated.vectors,
    });

    console.log(
      `✅ Upserted ${validated.vectors.length} vectors to namespace: ${validated.namespace}`
    );
  }

  /**
   * Batch upsert with rate limiting
   */
  async batchUpsert(params: {
    vectors: VectorRecord[];
    namespace?: string;
    agentType?: string;
    batchSize?: number;
  }): Promise<void> {
    const namespace = params.namespace || this.getNamespace(params.agentType);

    await pineconeClient.batchUpsert({
      indexName: this.indexName,
      namespace,
      vectors: params.vectors,
      batchSize: params.batchSize || 100,
    });

    console.log(
      `✅ Batch upserted ${params.vectors.length} vectors to namespace: ${namespace}`
    );
  }

  /**
   * Delete vectors
   */
  async deleteVectors(params: {
    ids: string[];
    namespace?: string;
    agentType?: string;
  }): Promise<void> {
    const namespace = params.namespace || this.getNamespace(params.agentType);

    await pineconeClient.deleteVectors({
      indexName: this.indexName,
      namespace,
      ids: params.ids,
    });

    console.log(`🗑️  Deleted ${params.ids.length} vectors from namespace: ${namespace}`);
  }

  /**
   * Clear entire namespace
   */
  async clearNamespace(params: {
    namespace?: string;
    agentType?: string;
  }): Promise<void> {
    const namespace = params.namespace || this.getNamespace(params.agentType);

    await pineconeClient.deleteNamespace({
      indexName: this.indexName,
      namespace,
    });

    console.log(`🗑️  Cleared namespace: ${namespace}`);
  }

  // ============================================================================
  // SPECIALIZED SEARCH METHODS (with namespace support)
  // ============================================================================

  /**
   * Search Porter Intelligence
   */
  async searchPorterForces(params: {
    demoId: string;
    query: string;
    force?: string;
    topK?: number;
  }): Promise<SearchResult[]> {
    return this.search({
      query: params.query,
      agentType: "porter",
      topK: params.topK || 3,
      filters: {
        demoId: params.demoId,
        analysisType: "porter_framework",
        ...(params.force && { porterForce: params.force }),
      },
    });
  }

  /**
   * Search Marketing Knowledge
   */
  async searchMarketingKnowledge(params: {
    demoId: string;
    query: string;
    contentType?: "social" | "content" | "email" | "seo" | "all";
    topK?: number;
  }): Promise<SearchResult[]> {
    return this.search({
      query: params.query,
      agentType: "marketing",
      topK: params.topK || 3,
      filters: {
        demoId: params.demoId,
        analysisType: "marketing_framework",
        ...(params.contentType &&
          params.contentType !== "all" && { contentType: params.contentType }),
      },
    });
  }

  /**
   * Search Strategic Frameworks
   */
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
  }): Promise<SearchResult[]> {
    return this.search({
      query: params.query,
      agentType: "strategic",
      topK: params.topK || 3,
      filters: {
        demoId: params.demoId,
        analysisType: "strategic_framework",
        ...(params.framework && { framework: params.framework }),
      },
    });
  }

  /**
   * Search Business Intelligence
   */
  async searchBusinessIntelligence(params: {
    demoId: string;
    query: string;
    intelType?: "local_market" | "sentiment" | "economic";
    topK?: number;
  }): Promise<SearchResult[]> {
    return this.search({
      query: params.query,
      agentType: "business_intelligence",
      topK: params.topK || 3,
      filters: {
        demoId: params.demoId,
        ...(params.intelType && { intelType: params.intelType }),
      },
    });
  }

  /**
   * Search Optimization Insights
   */
  async searchOptimizationInsights(params: {
    demoId: string;
    query: string;
    optimizationType?: "roi" | "conversion" | "performance";
    topK?: number;
  }): Promise<SearchResult[]> {
    return this.search({
      query: params.query,
      agentType: "optimization",
      topK: params.topK || 3,
      filters: {
        demoId: params.demoId,
        ...(params.optimizationType && { optimizationType: params.optimizationType }),
      },
    });
  }

  /**
   * Cross-namespace search (search across all agent types)
   */
  async searchUnified(params: {
    demoId: string;
    query: string;
    agentTypes?: string[];
    minConfidence?: number;
    topK?: number;
  }): Promise<SearchResult[]> {
    const agentTypes = params.agentTypes || [
      "porter",
      "marketing",
      "strategic",
      "business_intelligence",
      "optimization",
    ];

    // Search each namespace in parallel
    const searches = agentTypes.map((agentType) =>
      this.search({
        query: params.query,
        agentType,
        topK: params.topK || 5,
        filters: {
          demoId: params.demoId,
          ...(params.minConfidence && {
            confidence: { $gte: params.minConfidence },
          }),
        },
      })
    );

    const results = await Promise.all(searches);

    // Flatten and sort by score
    const allResults = results.flat().sort((a, b) => b.score - a.score);

    // Return top K across all namespaces
    return allResults.slice(0, params.topK || 10);
  }

  /**
   * Get complete business context from all namespaces
   */
  async getCompleteBusinessContext(demoId: string): Promise<{
    strategic: SearchResult[];
    intelligence: SearchResult[];
    marketing: SearchResult[];
    optimization: SearchResult[];
  }> {
    const [strategic, intelligence, marketing, optimization] = await Promise.all([
      this.search({
        query: "strategic analysis business model competitive advantage",
        agentType: "porter",
        topK: 10,
        filters: { demoId },
      }),
      this.search({
        query: "market intelligence customer sentiment economic trends",
        agentType: "business_intelligence",
        topK: 10,
        filters: { demoId },
      }),
      this.search({
        query: "marketing strategy content growth opportunities",
        agentType: "marketing",
        topK: 10,
        filters: { demoId },
      }),
      this.search({
        query: "optimization performance roi conversion",
        agentType: "optimization",
        topK: 10,
        filters: { demoId },
      }),
    ]);

    return {
      strategic,
      intelligence,
      marketing,
      optimization,
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get index statistics
   */
  async getStats() {
    return pineconeClient.getStats(this.indexName);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return PineconeClient.healthCheck(this.indexName);
  }

  /**
   * Get connection pool stats
   */
  getConnectionStats() {
    return PineconeClient.getStats();
  }
}

// Export singleton instance
export const enhancedVectorRepo = new EnhancedVectorRepository();
