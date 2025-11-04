import { generateEmbedding, similaritySearch } from "./vector-utils";

interface SimilarityResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content?: string;
  semanticScore?: number;
  keywordScore?: number;
}

interface HybridSearchOptions {
  demoId: string;
  query: string;
  topK?: number;
  semanticWeight?: number; // 0-1, how much to weight semantic vs keyword
}

/**
 * Performs hybrid search combining semantic similarity and keyword matching
 * for better AI response quality
 */
export async function hybridSearch({
  demoId,
  query,
  topK = 5,
  semanticWeight = 0.7,
}: HybridSearchOptions): Promise<SimilarityResult[]> {
  // Get semantic results
  const embedding = await generateEmbedding(query);
  const embeddingArray = Array.isArray(embedding)
    ? Array.isArray(embedding[0])
      ? embedding[0]
      : embedding
    : [embedding as number];

  const semanticResults = await similaritySearch({
    demoId,
    queryEmbedding: embeddingArray as number[],
    topK: topK * 2, // Get more for hybrid ranking
  });

  // Extract keywords from query for keyword matching
  const keywords = extractKeywords(query);

  // Score results with hybrid approach
  const hybridResults = semanticResults.map((result) => {
    const semanticScore = result.score;
    const keywordScore = calculateKeywordScore(result.content || "", keywords);

    // Combine scores with weighting
    const hybridScore =
      semanticScore * semanticWeight + keywordScore * (1 - semanticWeight);

    return {
      ...result,
      score: hybridScore,
      semanticScore,
      keywordScore,
    };
  });

  // Sort by hybrid score and return top results
  return hybridResults.sort((a, b) => b.score - a.score).slice(0, topK);
}

function extractKeywords(query: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "what",
    "when",
    "where",
    "why",
    "how",
    "who",
    "which",
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 10); // Limit keywords
}

function calculateKeywordScore(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;
  let totalScore = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const keywordMatches = (contentLower.match(regex) || []).length;

    if (keywordMatches > 0) {
      matches++;
      // Score based on frequency and keyword importance
      totalScore += Math.min(keywordMatches * 0.1, 0.3);
    }
  }

  // Normalize score (0-1) based on keyword coverage
  const coverageScore = matches / keywords.length;
  const frequencyScore = Math.min(totalScore, 1);

  return coverageScore * 0.6 + frequencyScore * 0.4;
}

/**
 * Enhanced context retrieval for AI agents with better ranking
 */
export async function getEnhancedContext(
  demoId: string,
  query: string
): Promise<string> {
  const results = await hybridSearch({
    demoId,
    query,
    topK: 4,
    semanticWeight: 0.8, // Favor semantic similarity for context
  });

  if (results.length === 0) {
    return "No relevant context found.";
  }

  // Format context with relevance indicators
  const contextParts = results.map((result, index) => {
    const relevanceIndicator =
      result.score > 0.8 ? "[HIGH]" : result.score > 0.6 ? "[MED]" : "[LOW]";

    return `${relevanceIndicator} Context ${index + 1}: ${result.content}`;
  });

  return contextParts.join("\n\n");
}
