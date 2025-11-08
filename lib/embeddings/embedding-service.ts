/**
 * Unified Embedding Service
 * Resolves model inconsistencies and provides versioned embeddings
 *
 * 2025 Best Practices:
 * - Single source of truth for embedding configuration
 * - Version control for embedding models
 * - Automatic migration support
 * - Provider fallback support
 */

import OpenAI from "openai";

export type EmbeddingModel =
  | "text-embedding-3-large"   // 3072d - Best quality (2024)
  | "text-embedding-3-small"   // 1536d - Fast & cheap (2024)
  | "text-embedding-ada-002";  // 1536d - Legacy (deprecated)

export interface EmbeddingConfig {
  model: EmbeddingModel;
  dimensions?: number;  // For 3-large/3-small (optional downscaling)
  version: string;      // Track embedding version for migrations
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  version: string;
}

/**
 * Current production configuration
 * Change this to upgrade all embeddings system-wide
 */
export const PRODUCTION_EMBEDDING_CONFIG: EmbeddingConfig = {
  model: "text-embedding-3-small",  // Start with small for cost
  dimensions: 1536,                  // Match legacy ada-002 dimension
  version: "v1.0.0",
};

/**
 * Recommended upgrade path for better quality
 */
export const RECOMMENDED_EMBEDDING_CONFIG: EmbeddingConfig = {
  model: "text-embedding-3-large",
  dimensions: 3072,  // Full quality
  version: "v2.0.0",
};

export class EmbeddingService {
  private client: OpenAI;
  private config: EmbeddingConfig;

  constructor(config: EmbeddingConfig = PRODUCTION_EMBEDDING_CONFIG) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for EmbeddingService");
    }
    this.client = new OpenAI({ apiKey });
    this.config = config;
  }

  /**
   * Generate embedding with current configuration
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error("Cannot generate embedding for empty text");
    }

    // Truncate if too long (OpenAI limit: 8191 tokens ≈ 32,000 chars)
    const truncatedText = text.slice(0, 32000);

    const requestParams: any = {
      model: this.config.model,
      input: truncatedText,
    };

    // Add dimensions parameter for 3-large/3-small models
    if (this.config.dimensions && this.config.model !== "text-embedding-ada-002") {
      requestParams.dimensions = this.config.dimensions;
    }

    const response = await this.client.embeddings.create(requestParams);

    const embedding = response.data?.[0]?.embedding;
    if (!embedding) {
      throw new Error("Failed to generate embedding from OpenAI");
    }

    return {
      embedding,
      model: this.config.model,
      dimensions: embedding.length,
      version: this.config.version,
    };
  }

  /**
   * Batch generate embeddings (up to 2048 inputs per batch)
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    if (texts.length === 0) {
      return [];
    }

    // OpenAI supports up to 2048 inputs per request
    const batchSize = 2048;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize).map(t => t.slice(0, 32000));

      const requestParams: any = {
        model: this.config.model,
        input: batch,
      };

      if (this.config.dimensions && this.config.model !== "text-embedding-ada-002") {
        requestParams.dimensions = this.config.dimensions;
      }

      const response = await this.client.embeddings.create(requestParams);

      for (let j = 0; j < response.data.length; j++) {
        const embedding = response.data[j].embedding;
        results.push({
          embedding,
          model: this.config.model,
          dimensions: embedding.length,
          version: this.config.version,
        });
      }
    }

    return results;
  }

  /**
   * Get current embedding configuration
   */
  getConfig(): EmbeddingConfig {
    return { ...this.config };
  }

  /**
   * Check if embeddings need migration
   */
  needsMigration(storedVersion: string): boolean {
    return storedVersion !== this.config.version;
  }
}

/**
 * Global singleton instance
 * Use this for consistent embeddings across the application
 */
export const embeddingService = new EmbeddingService();

/**
 * Convenience function for backward compatibility
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingService.generateEmbedding(text);
  return result.embedding;
}
