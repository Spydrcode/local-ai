/**
 * Porter RAG System - Retrieval-Augmented Generation
 * Grounds AI responses in Porter's actual frameworks and HBS methodology
 */

import { generateEmbedding } from '../vector-utils'
import { VectorRepository } from '../repositories/vector-repository'

interface PorterKnowledge {
  framework: 'five_forces' | 'value_chain' | 'generic_strategies' | 'competitive_advantage'
  content: string
  source: string
  relevance: number
}

// Porter's Core Frameworks (condensed for RAG)
const PORTER_KNOWLEDGE_BASE: PorterKnowledge[] = [
  {
    framework: 'five_forces' as const,
    content: `Porter's Five Forces Framework:
1. Threat of New Entrants - Barriers: economies of scale, capital requirements, access to distribution, government policy, brand identity
2. Bargaining Power of Suppliers - Factors: supplier concentration, switching costs, differentiation, threat of forward integration
3. Bargaining Power of Buyers - Factors: buyer concentration, volume, switching costs, price sensitivity, threat of backward integration
4. Threat of Substitutes - Factors: relative price-performance, switching costs, buyer propensity to substitute
5. Competitive Rivalry - Factors: industry growth, fixed costs, product differentiation, exit barriers, strategic stakes`,
    source: 'Competitive Strategy (1980)',
    relevance: 0
  },
  {
    framework: 'generic_strategies' as const,
    content: `Porter's Generic Strategies:
1. Cost Leadership - Achieve lowest cost in industry through economies of scale, proprietary technology, preferential access to raw materials
2. Differentiation - Create unique value through product features, brand image, technology, customer service, dealer network
3. Focus - Target specific segment with either cost focus or differentiation focus
CRITICAL: Stuck in the middle = competitive disadvantage. Must choose ONE strategy and make trade-offs.`,
    source: 'Competitive Strategy (1980)',
    relevance: 0
  },
  {
    framework: 'value_chain' as const,
    content: `Porter's Value Chain Analysis:
Primary Activities: Inbound Logistics, Operations, Outbound Logistics, Marketing & Sales, Service
Support Activities: Firm Infrastructure, HR Management, Technology Development, Procurement
Key Concepts:
- Linkages between activities create competitive advantage
- Cost drivers: economies of scale, learning, capacity utilization, linkages, interrelationships, integration, timing, policy choices
- Differentiation drivers: policy choices, linkages, timing, location, interrelationships, learning, integration, scale`,
    source: 'Competitive Advantage (1985)',
    relevance: 0
  },
  {
    framework: 'competitive_advantage' as const,
    content: `Sustainable Competitive Advantage Sources:
1. Activities that are valuable, rare, difficult to imitate, and organizationally supported (VRIO)
2. Trade-offs that prevent imitation (doing one thing well means not doing another)
3. Fit among activities (system of activities reinforces strategy)
4. Continuous improvement and innovation within chosen strategy
NOT competitive advantage: operational effectiveness, best practices, benchmarking (these are table stakes)`,
    source: 'What is Strategy? (1996)',
    relevance: 0
  }
]

/**
 * Retrieve relevant Porter frameworks for a given business context
 */
export async function retrievePorterContext(
  businessContext: string,
  analysisType: 'five_forces' | 'value_chain' | 'strategy' | 'all' = 'all'
): Promise<PorterKnowledge[]> {
  const embedding = await generateEmbedding(businessContext)
  
  // Filter by analysis type
  let relevantKnowledge = PORTER_KNOWLEDGE_BASE
  if (analysisType !== 'all') {
    relevantKnowledge = PORTER_KNOWLEDGE_BASE.filter(k => k.framework === analysisType)
  }
  
  // Calculate semantic similarity (simplified - in production use cosine similarity)
  const contextLower = businessContext.toLowerCase()
  const scoredKnowledge = relevantKnowledge.map(knowledge => ({
    ...knowledge,
    relevance: calculateRelevance(contextLower, knowledge.content.toLowerCase())
  }))
  
  // Return top 3 most relevant
  return scoredKnowledge
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)
}

function calculateRelevance(context: string, content: string): number {
  const contextWords = new Set(context.split(/\s+/))
  const contentWords = content.split(/\s+/)
  
  let matches = 0
  for (const word of contentWords) {
    if (contextWords.has(word) && word.length > 4) {
      matches++
    }
  }
  
  return matches / contentWords.length
}

/**
 * Augment agent prompt with Porter framework context
 */
export function augmentWithPorterContext(
  basePrompt: string,
  porterContext: PorterKnowledge[]
): string {
  const contextSection = porterContext
    .map(k => `\n**${k.framework.toUpperCase()} (${k.source})**:\n${k.content}`)
    .join('\n\n')
  
  return `${basePrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 PORTER FRAMEWORK REFERENCE (Apply these concepts):
${contextSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL INSTRUCTIONS**:
1. Apply the Porter frameworks above to THIS SPECIFIC BUSINESS
2. Reference the framework concepts explicitly in your analysis
3. Avoid generic advice - ground every insight in Porter's theory
4. Identify trade-offs and strategic choices (Porter's core principle)
5. Explain WHY your recommendations align with competitive advantage theory`
}

/**
 * Validate analysis against Porter principles
 */
export function validatePorterAlignment(analysis: string): {
  score: number
  issues: string[]
  suggestions: string[]
} {
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 100
  
  // Check for Porter framework references
  const frameworks = ['five forces', 'value chain', 'competitive advantage', 'differentiation', 'cost leadership']
  const mentionsFramework = frameworks.some(f => analysis.toLowerCase().includes(f))
  if (!mentionsFramework) {
    issues.push('No explicit Porter framework references')
    suggestions.push('Reference specific Porter concepts (Five Forces, Value Chain, Generic Strategies)')
    score -= 30
  }
  
  // Check for trade-off analysis
  const tradeoffKeywords = ['trade-off', 'tradeoff', 'sacrifice', 'choose between', 'cannot do both']
  const mentionsTradeoffs = tradeoffKeywords.some(k => analysis.toLowerCase().includes(k))
  if (!mentionsTradeoffs) {
    issues.push('Missing trade-off analysis (core Porter principle)')
    suggestions.push('Identify what the business must sacrifice to pursue their chosen strategy')
    score -= 25
  }
  
  // Check for generic advice
  const genericPhrases = [
    'improve customer service',
    'increase marketing',
    'enhance quality',
    'boost sales',
    'grow revenue'
  ]
  const hasGenericAdvice = genericPhrases.some(p => analysis.toLowerCase().includes(p))
  if (hasGenericAdvice) {
    issues.push('Contains generic business advice')
    suggestions.push('Replace generic advice with specific strategic positioning recommendations')
    score -= 20
  }
  
  // Check for competitive positioning
  const positioningKeywords = ['position', 'differentiat', 'unique', 'competitive advantage', 'moat']
  const mentionsPositioning = positioningKeywords.some(k => analysis.toLowerCase().includes(k))
  if (!mentionsPositioning) {
    issues.push('Weak competitive positioning analysis')
    suggestions.push('Explain how this business creates sustainable competitive advantage')
    score -= 15
  }
  
  return {
    score: Math.max(0, score),
    issues,
    suggestions
  }
}