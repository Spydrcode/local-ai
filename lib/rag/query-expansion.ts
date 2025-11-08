/**
 * Query Expansion for RAG
 * 2025 Best Practice: Enhance queries before retrieval
 *
 * Techniques:
 * 1. Synonym expansion
 * 2. Multi-query generation (HyDE pattern)
 * 3. Query decomposition
 * 4. Hypothetical answer generation
 */

import { createChatCompletion } from "../openai";

export interface ExpandedQuery {
  original: string;
  variations: string[];
  hypotheticalAnswer?: string;
  keywords: string[];
  intent: string;
}

export class QueryExpander {
  /**
   * Generate multiple query variations for better recall
   * Uses HyDE (Hypothetical Document Embeddings) pattern
   */
  async expandQuery(
    query: string,
    options: {
      generateVariations?: boolean;
      generateHypothetical?: boolean;
      extractKeywords?: boolean;
      maxVariations?: number;
    } = {}
  ): Promise<ExpandedQuery> {
    const {
      generateVariations = true,
      generateHypothetical = true,
      extractKeywords = true,
      maxVariations = 3,
    } = options;

    const prompt = `Analyze and expand this query for better information retrieval.

Query: "${query}"

Tasks:
1. Generate ${maxVariations} alternative phrasings that ask the same question
2. ${generateHypothetical ? "Write a hypothetical answer (2-3 sentences) that would ideally answer this query" : "Skip hypothetical answer"}
3. ${extractKeywords ? "Extract key search terms (5-10 important keywords)" : "Skip keywords"}
4. Classify the intent: question, analysis_request, data_lookup, or conversation

Return JSON:
{
  "variations": ["variation 1", "variation 2", ...],
  "hypotheticalAnswer": "...",
  "keywords": ["keyword1", "keyword2", ...],
  "intent": "question" | "analysis_request" | "data_lookup" | "conversation"
}`;

    try {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Higher temp for creative variations
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(response);

      return {
        original: query,
        variations: parsed.variations || [],
        hypotheticalAnswer: parsed.hypotheticalAnswer,
        keywords: parsed.keywords || [],
        intent: parsed.intent || "question",
      };
    } catch (error) {
      console.error("Query expansion failed:", error);
      // Fallback to basic expansion
      return {
        original: query,
        variations: [query],
        keywords: this.extractBasicKeywords(query),
        intent: "question",
      };
    }
  }

  /**
   * Decompose complex query into sub-queries
   * Useful for multi-part questions
   */
  async decompose(query: string): Promise<string[]> {
    const prompt = `Break down this complex query into simpler sub-queries.

Query: "${query}"

Rules:
- If it's a single simple question, return just that question
- If it has multiple parts (e.g., "what is X and how does Y work?"), split into separate questions
- Each sub-query should be independently answerable
- Maximum 5 sub-queries

Return JSON: {"subQueries": ["query1", "query2", ...]}`;

    try {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(response);
      return parsed.subQueries || [query];
    } catch (error) {
      console.error("Query decomposition failed:", error);
      return [query];
    }
  }

  /**
   * Generate a hypothetical ideal answer (HyDE technique)
   * Then embed this answer for better semantic matching
   */
  async generateHypotheticalAnswer(query: string): Promise<string> {
    const prompt = `Generate a detailed, ideal answer to this query as if you were writing documentation.
Make it factual and comprehensive (3-5 sentences).

Query: "${query}"

Answer:`;

    try {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response;
    } catch (error) {
      console.error("Hypothetical answer generation failed:", error);
      return query; // Fallback to original query
    }
  }

  /**
   * Extract important keywords for BM25/keyword search
   */
  private extractBasicKeywords(query: string): string[] {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "is", "are", "was", "were", "be", "been", "what",
      "how", "why", "when", "where", "who", "which", "can", "could", "would",
      "should", "do", "does", "did", "have", "has", "had",
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Step-back prompting: Ask a more general question first
   * Then use that to guide the specific query
   */
  async stepBack(query: string): Promise<string> {
    const prompt = `Given this specific query, what is the broader, more general question it relates to?

Specific query: "${query}"

Return the broader question that would help understand the context.

Example:
Specific: "What are the pricing strategies for a local bakery?"
Broader: "What are common pricing strategies for small retail businesses?"

Return JSON: {"broaderQuestion": "..."}`;

    try {
      const response = await createChatCompletion({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(response);
      return parsed.broaderQuestion || query;
    } catch (error) {
      console.error("Step-back prompting failed:", error);
      return query;
    }
  }
}

/**
 * Query expansion strategies enum
 */
export enum ExpansionStrategy {
  NONE = "none",
  VARIATIONS = "variations", // Multiple phrasings
  HYDE = "hyde", // Hypothetical Document Embeddings
  DECOMPOSE = "decompose", // Break into sub-queries
  STEP_BACK = "step_back", // Ask broader question first
  FULL = "full", // All techniques
}

/**
 * Execute query expansion with selected strategy
 */
export async function expandQueryWithStrategy(
  query: string,
  strategy: ExpansionStrategy = ExpansionStrategy.VARIATIONS
): Promise<string[]> {
  const expander = new QueryExpander();

  switch (strategy) {
    case ExpansionStrategy.NONE:
      return [query];

    case ExpansionStrategy.VARIATIONS: {
      const expanded = await expander.expandQuery(query, {
        generateVariations: true,
        generateHypothetical: false,
      });
      return [expanded.original, ...expanded.variations];
    }

    case ExpansionStrategy.HYDE: {
      const hypoAnswer = await expander.generateHypotheticalAnswer(query);
      return [query, hypoAnswer];
    }

    case ExpansionStrategy.DECOMPOSE: {
      return await expander.decompose(query);
    }

    case ExpansionStrategy.STEP_BACK: {
      const broader = await expander.stepBack(query);
      return [query, broader];
    }

    case ExpansionStrategy.FULL: {
      const [expanded, subQueries, broader] = await Promise.all([
        expander.expandQuery(query),
        expander.decompose(query),
        expander.stepBack(query),
      ]);

      return Array.from(
        new Set([
          query,
          ...expanded.variations,
          ...subQueries,
          broader,
          expanded.hypotheticalAnswer || "",
        ])
      ).filter(Boolean);
    }

    default:
      return [query];
  }
}
