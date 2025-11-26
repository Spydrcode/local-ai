/**
 * LangChain + Pinecone Integration
 * Production-grade RAG with LangChain ecosystem
 */

import { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMBEDDING_CONFIG = {
  modelName: "text-embedding-3-small",
  dimensions: 1536,
  stripNewLines: true,
};

const LLM_CONFIG = {
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
};

// ============================================================================
// LANGCHAIN VECTOR STORE FACTORY
// ============================================================================

export class LangChainVectorStore {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is required");
    }

    this.pinecone = new Pinecone({ apiKey });
    this.embeddings = new OpenAIEmbeddings(EMBEDDING_CONFIG);
  }

  /**
   * Create or connect to existing vector store
   */
  async getVectorStore(params: {
    indexName?: string;
    namespace?: string;
  }): Promise<PineconeStore> {
    const indexName =
      params.indexName || process.env.PINECONE_INDEX_NAME || "forecasta-ai-demos";
    const index = this.pinecone.index(indexName);

    return await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: index as any,
      namespace: params.namespace,
    });
  }

  /**
   * Add documents to vector store
   */
  async addDocuments(params: {
    documents: Array<{
      pageContent: string;
      metadata: Record<string, any>;
    }>;
    namespace?: string;
    indexName?: string;
  }): Promise<void> {
    const vectorStore = await this.getVectorStore({
      indexName: params.indexName,
      namespace: params.namespace,
    });

    await vectorStore.addDocuments(params.documents);

    console.log(
      `✅ Added ${params.documents.length} documents to namespace: ${params.namespace || "default"}`
    );
  }

  /**
   * Similarity search
   */
  async similaritySearch(params: {
    query: string;
    k?: number;
    filter?: Record<string, any>;
    namespace?: string;
    indexName?: string;
  }): Promise<Document[]> {
    const vectorStore = await this.getVectorStore({
      indexName: params.indexName,
      namespace: params.namespace,
    });

    return vectorStore.similaritySearch(
      params.query,
      params.k || 5,
      params.filter
    );
  }

  /**
   * Similarity search with scores
   */
  async similaritySearchWithScore(params: {
    query: string;
    k?: number;
    filter?: Record<string, any>;
    namespace?: string;
    indexName?: string;
  }): Promise<[Document, number][]> {
    const vectorStore = await this.getVectorStore({
      indexName: params.indexName,
      namespace: params.namespace,
    });

    return vectorStore.similaritySearchWithScore(
      params.query,
      params.k || 5,
      params.filter
    );
  }
}

// ============================================================================
// LANGCHAIN RAG CHAIN
// ============================================================================

export interface RAGQueryParams {
  query: string;
  namespace?: string;
  agentType?:
    | "porter"
    | "marketing"
    | "strategic"
    | "business_intelligence"
    | "optimization";
  k?: number;
  filter?: Record<string, any>;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface RAGResponse {
  answer: string;
  sourceDocuments: Document[];
  confidence: number;
  metadata: {
    model: string;
    tokensUsed?: number;
    latency: number;
  };
}

export class LangChainRAG {
  private vectorStore: LangChainVectorStore;
  private llm: ChatOpenAI;

  constructor() {
    this.vectorStore = new LangChainVectorStore();
    this.llm = new ChatOpenAI(LLM_CONFIG);
  }

  /**
   * Get namespace by agent type
   */
  private getNamespace(agentType?: string): string | undefined {
    if (!agentType) return undefined;

    const namespaceMap: Record<string, string> = {
      porter: "porter-intelligence",
      marketing: "marketing-growth",
      strategic: "strategic-frameworks",
      business_intelligence: "business-intel",
      optimization: "optimization",
    };

    return namespaceMap[agentType];
  }

  /**
   * Execute RAG query with LangChain
   */
  async query(params: RAGQueryParams): Promise<RAGResponse> {
    const startTime = Date.now();

    // Determine namespace
    const namespace = params.namespace || this.getNamespace(params.agentType);

    // Get vector store
    const store = await this.vectorStore.getVectorStore({ namespace });

    // Retrieve relevant documents
    const retriever = store.asRetriever(params.k || 5);
    const sourceDocuments = await retriever.invoke(params.query);

    // Create context from documents
    const context = sourceDocuments
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join("\n\n");

    // Create custom prompt template
    const promptTemplate =
      PromptTemplate.fromTemplate(`You are an expert business analyst providing insights based on the following context.

Context:
{context}

Question: {question}

Instructions:
1. Answer based primarily on the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be specific and actionable in your recommendations
4. Cite specific data points when available
5. Format your response clearly with bullet points when appropriate

Answer:`);

    // Create chain
    const chain = RunnableSequence.from([
      promptTemplate,
      this.llm,
      new StringOutputParser(),
    ]);

    // Execute query
    const answer = await chain.invoke({
      context,
      question: params.query,
    });

    const latency = Date.now() - startTime;

    return {
      answer,
      sourceDocuments,
      confidence: this.calculateConfidence(sourceDocuments),
      metadata: {
        model: LLM_CONFIG.modelName,
        latency,
      },
    };
  }

  /**
   * Multi-namespace query (search across agent types)
   */
  async multiNamespaceQuery(params: {
    query: string;
    agentTypes: string[];
    k?: number;
  }): Promise<{
    results: Array<{
      agentType: string;
      documents: Document[];
      scores: number[];
    }>;
    summary: string;
  }> {
    const searches = params.agentTypes.map(async (agentType) => {
      const namespace = this.getNamespace(agentType);
      const results = await this.vectorStore.similaritySearchWithScore({
        query: params.query,
        namespace,
        k: params.k || 3,
      });

      return {
        agentType,
        documents: results.map(([doc]) => doc),
        scores: results.map(([, score]) => score),
      };
    });

    const results = await Promise.all(searches);

    // Generate unified summary
    const allDocs = results.flatMap((r) => r.documents);
    const context = allDocs.map((doc) => doc.pageContent).join("\n\n");

    const summaryPrompt = `Based on insights from multiple business analysis tools, provide a unified strategic summary.

Context from different analyses:
${context}

Question: ${params.query}

Provide a comprehensive summary that synthesizes insights across all analysis types:`;

    const summaryResponse = await this.llm.invoke([
      { role: "user", content: summaryPrompt },
    ]);

    return {
      results,
      summary:
        typeof summaryResponse.content === "string"
          ? summaryResponse.content
          : JSON.stringify(summaryResponse.content),
    };
  }

  /**
   * Calculate confidence score based on retrieval scores
   */
  private calculateConfidence(documents: Document[]): number {
    if (documents.length === 0) return 0;

    // Simple heuristic: based on number and quality of retrieved documents
    const docCount = Math.min(documents.length, 5) / 5; // Max 5 docs
    const avgLength =
      documents.reduce((sum, doc) => sum + doc.pageContent.length, 0) /
      documents.length;
    const lengthScore = Math.min(avgLength / 500, 1); // Assume 500 chars is good

    return docCount * 0.6 + lengthScore * 0.4;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick RAG query
 */
export async function ragQuery(
  query: string,
  options?: {
    namespace?: string;
    agentType?: string;
    k?: number;
  }
): Promise<RAGResponse> {
  const rag = new LangChainRAG();
  return rag.query({
    query,
    namespace: options?.namespace,
    agentType: options?.agentType as any,
    k: options?.k,
  });
}

/**
 * Add knowledge to vector store
 */
export async function addKnowledge(
  documents: Array<{
    content: string;
    metadata: Record<string, any>;
  }>,
  namespace?: string
): Promise<void> {
  const store = new LangChainVectorStore();
  await store.addDocuments({
    documents: documents.map((doc) => ({
      pageContent: doc.content,
      metadata: doc.metadata,
    })),
    namespace,
  });
}

/**
 * Search across all business intelligence
 */
export async function searchUnifiedIntelligence(
  query: string,
  agentTypes?: string[]
): Promise<{
  results: any[];
  summary: string;
}> {
  const rag = new LangChainRAG();
  return rag.multiNamespaceQuery({
    query,
    agentTypes: agentTypes || [
      "porter",
      "marketing",
      "strategic",
      "business_intelligence",
      "optimization",
    ],
  });
}

// Export singleton instances
export const langChainVectorStore = new LangChainVectorStore();
export const langChainRAG = new LangChainRAG();
