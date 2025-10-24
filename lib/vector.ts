import { Pinecone } from "@pinecone-database/pinecone";
import { supabaseAdmin } from "../server/supabaseAdmin";
import { hfEmbed } from "./hf";
import { createEmbedding } from "./openai";

export interface VectorChunk {
  id: string;
  demoId: string;
  content: string;
  metadata?: Record<string, unknown>;
  embedding: number[];
}

export interface SimilarityResult {
  id: string;
  score: number;
  content: string;
  metadata?: Record<string, unknown>;
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
function sanitizeMetadata(
  metadata: Record<string, unknown>
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
          wordCount: chunk.content.split(' ').length,
          timestamp: new Date().toISOString(),
          chunkType: chunk.metadata?.heading ? 'heading' : 'content',
        };

        const combinedMetadata = {
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

export async function similaritySearch({
  demoId,
  queryEmbedding,
  topK = 3,
}: {
  demoId: string;
  queryEmbedding: number[];
  topK?: number;
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

      return typedData
        .map((row: SupabaseChunkRow) => ({
          id: row.id,
          content: row.content,
          metadata: row.metadata ?? {},
          score: cosineSimilarity(queryEmbedding, row.embedding),
        }))
        .sort((a: SimilarityResult, b: SimilarityResult) => b.score - a.score)
        .slice(0, topK);
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

      // Enhanced query with better filtering and ranking
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: Math.min(topK * 3, 20), // Get more results for better filtering
        filter: { demoId: { $eq: demoId } },
        includeMetadata: true,
      });

      // Transform and rank results with quality scoring
      const results = (queryResponse.matches ?? [])
        .filter(match => (match.score ?? 0) > 0.7) // Filter low-quality matches
        .map((match) => {
          const content = (match.metadata?.content as string) ?? "";
          const wordCount = match.metadata?.wordCount as number ?? 0;
          const isHeading = match.metadata?.chunkType === 'heading';
          
          // Boost score for headings and longer content
          let adjustedScore = (match.score ?? 0);
          if (isHeading) adjustedScore += 0.1;
          if (wordCount > 50) adjustedScore += 0.05;
          
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
