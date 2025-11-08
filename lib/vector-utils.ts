/**
 * @deprecated - Use VectorRepository from lib/repositories/vector-repository.ts
 * This file is kept for backward compatibility only
 */

export { VectorRepository } from './repositories/vector-repository'

// Re-export for legacy compatibility
// ✅ FIXED: Now uses unified embedding service instead of inconsistent ada-002
export { generateEmbedding } from './embeddings/embedding-service';

export async function similaritySearch(params: any) {
  const { VectorRepository } = await import('./repositories/vector-repository')
  const repo = new VectorRepository(process.env.VECTOR_PROVIDER as 'supabase' | 'pinecone')
  return repo.searchCompetitor(params)
}