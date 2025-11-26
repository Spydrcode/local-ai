/**
 * Enhanced Pinecone Client with Connection Pooling and Retry Logic
 * Production-grade Pinecone integration with proper resource management
 */

import { Pinecone, Index } from "@pinecone-database/pinecone";
import pRetry from "p-retry";

interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
}

interface PineconeClientConfig {
  apiKey?: string;
  environment?: string;
  maxConnections?: number;
  defaultRetryOptions?: RetryOptions;
}

/**
 * Singleton Pinecone client with connection pooling
 */
export class PineconeClient {
  private static instance: Pinecone | null = null;
  private static indexConnections: Map<string, Index> = new Map();
  private static config: PineconeClientConfig = {
    maxConnections: 10,
    defaultRetryOptions: {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2,
    },
  };

  /**
   * Get or create Pinecone client instance
   */
  static getInstance(config?: PineconeClientConfig): Pinecone {
    if (!this.instance) {
      const apiKey = config?.apiKey || process.env.PINECONE_API_KEY;

      if (!apiKey) {
        throw new Error(
          "PINECONE_API_KEY is required. Set it in environment or pass in config."
        );
      }

      this.instance = new Pinecone({
        apiKey,
      });

      // Update config if provided
      if (config) {
        this.config = { ...this.config, ...config };
      }

      console.log("✅ Pinecone client initialized");
    }

    return this.instance;
  }

  /**
   * Get or create index connection (with connection pooling)
   */
  static getIndex(indexName?: string): Index {
    const name = indexName || process.env.PINECONE_INDEX_NAME || "forecasta-ai-demos";

    if (!this.indexConnections.has(name)) {
      // Check connection pool limit
      if (this.indexConnections.size >= (this.config.maxConnections || 10)) {
        // Remove oldest connection (simple LRU)
        const firstKey = this.indexConnections.keys().next().value;
        if (firstKey) {
          this.indexConnections.delete(firstKey);
          console.log(`♻️  Recycled connection for ${firstKey} (pool limit reached)`);
        }
      }

      const client = this.getInstance();
      const index = client.index(name);
      this.indexConnections.set(name, index);

      console.log(`🔌 Created new index connection: ${name}`);
    }

    return this.indexConnections.get(name)!;
  }

  /**
   * Execute operation with automatic retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const retryOptions = {
      ...this.config.defaultRetryOptions,
      ...options,
    };

    return pRetry(operation, {
      retries: retryOptions.retries,
      minTimeout: retryOptions.minTimeout,
      maxTimeout: retryOptions.maxTimeout,
      factor: retryOptions.factor,
      onFailedAttempt: (error) => {
        console.warn(
          `⚠️  Pinecone operation failed (attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber})`
        );
      },
    });
  }

  /**
   * Execute operation with timeout
   */
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Execute batch operations in parallel with rate limiting
   */
  static async batchWithRateLimit<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    options: {
      batchSize?: number;
      delayMs?: number;
    } = {}
  ): Promise<R[]> {
    const { batchSize = 5, delayMs = 100 } = options;
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(operation));
      results.push(...batchResults);

      // Add delay between batches to avoid rate limits
      if (i + batchSize < items.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * Clear specific index connection
   */
  static clearConnection(indexName: string): void {
    if (this.indexConnections.has(indexName)) {
      this.indexConnections.delete(indexName);
      console.log(`🗑️  Cleared connection: ${indexName}`);
    }
  }

  /**
   * Clear all connections (useful for testing or cleanup)
   */
  static clearAllConnections(): void {
    this.indexConnections.clear();
    console.log("🗑️  Cleared all index connections");
  }

  /**
   * Get connection pool stats
   */
  static getStats() {
    return {
      activeConnections: this.indexConnections.size,
      maxConnections: this.config.maxConnections,
      connectionNames: Array.from(this.indexConnections.keys()),
    };
  }

  /**
   * Health check - verify connection to Pinecone
   */
  static async healthCheck(indexName?: string): Promise<boolean> {
    try {
      const index = this.getIndex(indexName);
      await this.withTimeout(
        () => index.describeIndexStats(),
        5000
      );
      return true;
    } catch (error) {
      console.error("❌ Pinecone health check failed:", error);
      return false;
    }
  }
}

/**
 * Helper function for common operations
 */
export const pineconeClient = {
  /**
   * Query vectors with automatic retry
   */
  async query(params: {
    indexName?: string;
    namespace?: string;
    vector: number[];
    topK?: number;
    filter?: Record<string, any>;
    includeMetadata?: boolean;
  }) {
    return PineconeClient.withRetry(async () => {
      const index = PineconeClient.getIndex(params.indexName);
      const ns = params.namespace ? index.namespace(params.namespace) : index;

      return ns.query({
        vector: params.vector,
        topK: params.topK || 5,
        filter: params.filter,
        includeMetadata: params.includeMetadata !== false,
      });
    });
  },

  /**
   * Upsert vectors with automatic retry
   */
  async upsert(params: {
    indexName?: string;
    namespace?: string;
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, any>;
    }>;
  }) {
    return PineconeClient.withRetry(async () => {
      const index = PineconeClient.getIndex(params.indexName);
      const ns = params.namespace ? index.namespace(params.namespace) : index;

      return ns.upsert(params.vectors);
    });
  },

  /**
   * Batch upsert with rate limiting
   */
  async batchUpsert(params: {
    indexName?: string;
    namespace?: string;
    vectors: Array<{
      id: string;
      values: number[];
      metadata?: Record<string, any>;
    }>;
    batchSize?: number;
  }) {
    const { batchSize = 100, ...rest } = params;
    const batches: typeof params.vectors[] = [];

    // Split into batches
    for (let i = 0; i < params.vectors.length; i += batchSize) {
      batches.push(params.vectors.slice(i, i + batchSize));
    }

    // Upload batches with rate limiting
    return PineconeClient.batchWithRateLimit(
      batches,
      (batch) => this.upsert({ ...rest, vectors: batch }),
      { batchSize: 5, delayMs: 100 }
    );
  },

  /**
   * Delete vectors with automatic retry
   */
  async deleteVectors(params: {
    indexName?: string;
    namespace?: string;
    ids: string[];
  }) {
    return PineconeClient.withRetry(async () => {
      const index = PineconeClient.getIndex(params.indexName);
      const ns = params.namespace ? index.namespace(params.namespace) : index;

      return ns.deleteMany(params.ids);
    });
  },

  /**
   * Delete all vectors in namespace
   */
  async deleteNamespace(params: {
    indexName?: string;
    namespace: string;
  }) {
    return PineconeClient.withRetry(async () => {
      const index = PineconeClient.getIndex(params.indexName);
      return index.namespace(params.namespace).deleteAll();
    });
  },

  /**
   * Get index statistics
   */
  async getStats(indexName?: string) {
    return PineconeClient.withRetry(async () => {
      const index = PineconeClient.getIndex(indexName);
      return index.describeIndexStats();
    });
  },
};

// Export singleton instance
export default PineconeClient;
