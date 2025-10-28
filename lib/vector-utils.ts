/**
 * @deprecated - Use VectorRepository from lib/repositories/vector-repository.ts
 * This file is kept for backward compatibility only
 */

export { VectorRepository } from './repositories/vector-repository'

// Re-export for legacy compatibility
export async function generateEmbedding(text: string): Promise<number[]> {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  })
  return response.data[0].embedding
}

export async function similaritySearch(params: any) {
  const { VectorRepository } = await import('./repositories/vector-repository')
  const repo = new VectorRepository(process.env.VECTOR_PROVIDER as 'supabase' | 'pinecone')
  return repo.searchCompetitor(params)
}