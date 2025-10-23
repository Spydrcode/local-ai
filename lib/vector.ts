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

      const { error } = await supabaseAdmin
        .from("site_chunks")
        .upsert(
          chunks.map((chunk) => ({
            id: chunk.id,
            demo_id: chunk.demoId,
            content: chunk.content,
            metadata: chunk.metadata ?? {},
            embedding: chunk.embedding,
          })),
        );

      if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`);
      }
      return;
    }
    case "pinecone": {
      // TODO: replace with Pinecone client upsert if VECTOR_PROVIDER=pinecone
      console.warn("Pinecone provider not yet implemented. Implement pinecone upsert in lib/vector.ts");
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
      // TODO: wire up Pinecone query here using @pinecone-database/pinecone client.
      throw new Error("Pinecone similarity search not implemented. Set VECTOR_PROVIDER=supabase for now.");
    }
    default:
      throw new Error(`Unsupported vector provider: ${provider}`);
  }
}
