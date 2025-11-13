/**
 * RAG Integration for Content Marketing Agents
 *
 * Provides retrieval-augmented generation capabilities to enhance
 * agent outputs with relevant best practices and knowledge
 */

import { LangChainVectorStore } from "../rag/langchain-pinecone";

export interface RAGContext {
  relevantKnowledge: string[];
  confidence: number;
  sources: string[];
}

/**
 * Retrieve relevant knowledge for content generation
 */
export async function retrieveContentMarketingKnowledge(params: {
  agentType:
    | "facebook-marketing"
    | "instagram-marketing"
    | "linkedin-marketing"
    | "blog-writer"
    | "video-script"
    | "newsletter"
    | "faq-builder";
  query: string;
  topK?: number;
}): Promise<RAGContext> {
  try {
    const vectorStore = new LangChainVectorStore();

    // Query vector database for relevant knowledge
    const results = await vectorStore.similaritySearchWithScore({
      query: params.query,
      namespace: "content-marketing",
      k: params.topK || 3,
      filter: {
        agentType: params.agentType,
      },
    });

    // Extract knowledge and calculate confidence
    const relevantKnowledge = results.map(([doc]) => doc.pageContent);
    const scores = results.map(([, score]) => score);
    const avgConfidence =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Extract source metadata
    const sources = results.map(([doc]) => doc.metadata.category || "unknown");

    return {
      relevantKnowledge,
      confidence: avgConfidence,
      sources,
    };
  } catch (error) {
    console.error("Error retrieving content marketing knowledge:", error);
    // Return empty context if retrieval fails (graceful degradation)
    return {
      relevantKnowledge: [],
      confidence: 0,
      sources: [],
    };
  }
}

/**
 * Enhance agent prompt with RAG-retrieved knowledge
 */
export function enhancePromptWithRAG(
  basePrompt: string,
  ragContext: RAGContext
): string {
  if (ragContext.relevantKnowledge.length === 0) {
    return basePrompt;
  }

  const knowledgeSection = `

**BEST PRACTICES FROM KNOWLEDGE BASE**:
${ragContext.relevantKnowledge
  .map((knowledge, i) => `${i + 1}. ${knowledge}`)
  .join("\n\n")}

---

`;

  // Insert knowledge after the main prompt but before specific instructions
  return knowledgeSection + basePrompt;
}

/**
 * Multi-topic RAG retrieval for comprehensive knowledge
 */
export async function retrieveMultiTopicKnowledge(params: {
  agentType: string;
  topics: string[];
  topKPerTopic?: number;
}): Promise<RAGContext> {
  try {
    const vectorStore = new LangChainVectorStore();

    // Query for each topic
    const allResults = await Promise.all(
      params.topics.map((topic) =>
        vectorStore.similaritySearchWithScore({
          query: topic,
          namespace: "content-marketing",
          k: params.topKPerTopic || 2,
          filter: {
            agentType: params.agentType,
          },
        })
      )
    );

    // Flatten and deduplicate results
    const seen = new Set<string>();
    const relevantKnowledge: string[] = [];
    const scores: number[] = [];
    const sources: string[] = [];

    allResults.flat().forEach(([doc, score]) => {
      const content = doc.pageContent;
      if (!seen.has(content)) {
        seen.add(content);
        relevantKnowledge.push(content);
        scores.push(score);
        sources.push(doc.metadata.category || "unknown");
      }
    });

    const avgConfidence =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      relevantKnowledge,
      confidence: avgConfidence,
      sources,
    };
  } catch (error) {
    console.error("Error retrieving multi-topic knowledge:", error);
    return {
      relevantKnowledge: [],
      confidence: 0,
      sources: [],
    };
  }
}

/**
 * Cross-agent knowledge retrieval (for shared best practices)
 */
export async function retrieveCrossAgentKnowledge(params: {
  query: string;
  topK?: number;
}): Promise<RAGContext> {
  try {
    const vectorStore = new LangChainVectorStore();

    // Query without agent filter to get cross-agent knowledge
    const results = await vectorStore.similaritySearchWithScore({
      query: params.query,
      namespace: "content-marketing",
      k: params.topK || 3,
    });

    const relevantKnowledge = results.map(([doc]) => doc.pageContent);
    const scores = results.map(([, score]) => score);
    const avgConfidence =
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const sources = results.map(
      ([doc]) => doc.metadata.agentType || "cross-agent"
    );

    return {
      relevantKnowledge,
      confidence: avgConfidence,
      sources,
    };
  } catch (error) {
    console.error("Error retrieving cross-agent knowledge:", error);
    return {
      relevantKnowledge: [],
      confidence: 0,
      sources: [],
    };
  }
}

/**
 * Format RAG context for display (debugging/logging)
 */
export function formatRAGContext(context: RAGContext): string {
  return `
RAG Context Retrieved:
- Knowledge pieces: ${context.relevantKnowledge.length}
- Average confidence: ${(context.confidence * 100).toFixed(1)}%
- Sources: ${context.sources.join(", ")}
`;
}
