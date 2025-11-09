/**
 * Marketing Knowledge Base - Vector Embeddings
 * Modern ML-optimized RAG system for marketing intelligence
 */

import { Pinecone } from '@pinecone-database/pinecone'
import { generateEmbedding } from '../embeddings/embedding-service'

// ============================================================================
// MARKETING KNOWLEDGE BASE STRUCTURE
// ============================================================================

export interface MarketingKnowledge {
  id: string
  content: string
  metadata: {
    framework: string // HBS framework name
    category: 'strategy' | 'tactics' | 'channels' | 'metrics' | 'case-study'
    industry?: string
    businessSize?: 'startup' | 'small' | 'medium' | 'enterprise'
    topic: string[]
    source: string
    confidence: number
    lastUpdated: string
  }
  embedding?: number[]
}

// ============================================================================
// MARKETING KNOWLEDGE CATEGORIES
// ============================================================================

export const MARKETING_KNOWLEDGE_BASE = [
  // Jobs-to-be-Done Framework
  {
    id: 'jtbd-001',
    content: `Jobs-to-be-Done Framework by Clayton Christensen teaches that customers don't buy products, they hire them to do a job. Marketing should focus on the job, not the product. Example: People don't want a drill, they want a hole in the wall. Frame your marketing around the job to be done: "Need to hang pictures? Our drill makes it effortless." Not: "Buy our drill with 20V battery."`,
    metadata: {
      framework: 'jobs-to-be-done',
      category: 'strategy' as const,
      topic: ['customer-needs', 'value-proposition', 'messaging'],
      source: 'Clayton Christensen - HBS',
      confidence: 0.95,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'jtbd-002',
    content: `Jobs-to-be-Done has three dimensions: Functional (practical task), Emotional (how they want to feel), and Social (how they want to be perceived). Example for a coffee shop: Functional - quick caffeine, Emotional - start day feeling energized, Social - be seen as sophisticated. Market to all three: "Premium coffee that fits your busy morning and makes you feel like a connoisseur."`,
    metadata: {
      framework: 'jobs-to-be-done',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['messaging', 'positioning', 'customer-psychology'],
      source: 'Clayton Christensen - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // Marketing Myopia
  {
    id: 'myopia-001',
    content: `Theodore Levitt's Marketing Myopia warns against defining your business by your product instead of customer needs. Railroads failed because they thought they were in the train business, not transportation. Ask: What need do we serve? Not: What do we sell? Example: Don't say "We sell CRM software." Say: "We help sales teams close more deals."`,
    metadata: {
      framework: 'marketing-myopia',
      category: 'strategy' as const,
      topic: ['positioning', 'value-proposition', 'market-definition'],
      source: 'Theodore Levitt - HBS',
      confidence: 0.95,
      lastUpdated: '2025-01-08'
    }
  },

  // Competitive Positioning (Porter)
  {
    id: 'porter-001',
    content: `Michael Porter's Competitive Strategy identifies three paths: Cost Leadership (be cheapest), Differentiation (be best/unique), or Focus (serve a niche). Trying all three leaves you "stuck in the middle" and losing. Pick ONE and own it in your marketing. Walmart owns cost. Apple owns differentiation. Lululemon owns focus (yoga enthusiasts).`,
    metadata: {
      framework: 'competitive-positioning',
      category: 'strategy' as const,
      topic: ['positioning', 'competitive-strategy', 'differentiation'],
      source: 'Michael Porter - HBS',
      confidence: 0.95,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'porter-002',
    content: `Cost Leadership marketing emphasizes value, savings, efficiency. Use messaging like "Best value," "Save money," "Affordable luxury." Show price comparisons. Use testimonials about value. Focus channels: SEO (comparison keywords), retargeting, email (promo codes). Example: "Get premium quality at half the price of competitors."`,
    metadata: {
      framework: 'competitive-positioning',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['messaging', 'pricing', 'value-proposition'],
      source: 'Michael Porter - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'porter-003',
    content: `Differentiation marketing emphasizes quality, uniqueness, status. Use messaging like "Premium," "Handcrafted," "Exclusive." Showcase craftsmanship, heritage, innovation. Focus channels: Instagram (visual), PR (credibility), influencers (social proof). Example: "Join the elite few who understand true quality."`,
    metadata: {
      framework: 'competitive-positioning',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['premium-positioning', 'brand-building', 'social-proof'],
      source: 'Michael Porter - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // Discovery-Driven Planning
  {
    id: 'discovery-001',
    content: `Rita McGrath's Discovery-Driven Planning says test assumptions before big investments. In marketing: identify critical assumptions (audience, channel, message), design cheap tests ($50-500), measure results in 1-2 weeks, iterate fast. Example: Before building a blog, test with 3 LinkedIn posts. If engagement is low, blog won't work either.`,
    metadata: {
      framework: 'discovery-driven-marketing',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['testing', 'experimentation', 'lean-marketing'],
      source: 'Rita McGrath - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // Disruptive Innovation
  {
    id: 'disruption-001',
    content: `Clayton Christensen's Disruptive Innovation identifies two paths: Low-End Disruption (serve over-served customers with simpler solution) or New-Market Disruption (serve non-consumers). Marketing approach: Low-end = "Good enough for most," New-market = "Now you can do it yourself." Example: Dollar Shave Club disrupted Gillette by simplifying (low-end). Canva disrupted designers by making design accessible (new-market).`,
    metadata: {
      framework: 'disruptive-marketing',
      category: 'strategy' as const,
      topic: ['market-entry', 'positioning', 'go-to-market'],
      source: 'Clayton Christensen - HBS',
      confidence: 0.95,
      lastUpdated: '2025-01-08'
    }
  },

  // "Different" Framework
  {
    id: 'different-001',
    content: `Youngme Moon's "Different" framework says break category conventions to stand out. Three strategies: Reverse Positioning (do opposite of norms - Dove's "Real Beauty"), Breakaway Positioning (strip expected benefits, add unexpected - IKEA removes assembly, adds showrooms), Hostility Positioning (alienate some to attract true fans - Marmite's "Love it or hate it").`,
    metadata: {
      framework: 'different-marketing',
      category: 'strategy' as const,
      topic: ['differentiation', 'positioning', 'brand-building'],
      source: 'Youngme Moon - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // Consumer Decision Journey
  {
    id: 'journey-001',
    content: `John Deighton's Consumer Decision Journey has 4 phases: Initial Consideration (awareness), Active Evaluation (research), Purchase (decision), and Loyalty Loop (advocacy). Map marketing to each phase: Phase 1 = SEO/Social, Phase 2 = Content/Email, Phase 3 = Landing Pages/Chat, Phase 4 = Onboarding/Community. Most businesses over-invest in awareness, under-invest in loyalty.`,
    metadata: {
      framework: 'consumer-journey',
      category: 'strategy' as const,
      topic: ['customer-journey', 'funnel-optimization', 'retention'],
      source: 'John Deighton - HBS',
      confidence: 0.95,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'journey-002',
    content: `The "Loyalty Loop" is where customers become advocates. Strategies: onboarding excellence (welcome sequence), exceeded expectations (surprise and delight), community building (Facebook groups, events), referral incentives (refer-a-friend programs). Loyal customers have 3x lifetime value and cost 5x less to retain than acquire new ones.`,
    metadata: {
      framework: 'consumer-journey',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['retention', 'loyalty', 'referrals', 'community'],
      source: 'John Deighton - HBS',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // AI Personalization
  {
    id: 'ai-personalization-001',
    content: `ML-powered personalization segments by behavior, not demographics. Track: engagement recency (active/lapsing/churned), content preferences (video/blog/podcast), purchase behavior (high-value/frequent/one-time), channel preferences (email/social/search). Use ML clustering algorithms to automatically create segments, then personalize messaging to each segment.`,
    metadata: {
      framework: 'ai-personalization',
      category: 'tactics' as const,
      topic: ['personalization', 'segmentation', 'machine-learning', 'automation'],
      source: 'Modern ML Practices',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'ai-personalization-002',
    content: `Predictive analytics in marketing: Next Best Action (what content to show next), Churn Risk (who will unsubscribe), Conversion Probability (who's ready to buy), Lifetime Value (who's most valuable). Start simple with rule-based predictions, then add ML models. Tools: Customer.io, Klaviyo, HubSpot (small business), Segment + custom models (larger businesses).`,
    metadata: {
      framework: 'ai-personalization',
      category: 'tactics' as const,
      topic: ['predictive-analytics', 'machine-learning', 'automation', 'tools'],
      source: 'Modern ML Practices',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  // Marketing Mix Modeling
  {
    id: 'mmm-001',
    content: `Marketing Mix Modeling (MMM) optimizes budget allocation across channels using ML. Beyond last-click attribution: use multi-touch attribution (credit all touchpoints) or data-driven attribution (let ML weigh importance). Test incrementality: turn channel off for subset, measure CAUSAL impact. Most businesses over-invest in awareness, under-invest in retention.`,
    metadata: {
      framework: 'marketing-mix-modeling',
      category: 'metrics' as const,
      topic: ['attribution', 'budget-optimization', 'analytics', 'roi'],
      source: 'Modern ML Practices',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'mmm-002',
    content: `Channel synergy effects: Some channels work better together. SEO + PPC together often perform better than sum of parts (branded search synergy). PR boosts all channel performance temporarily. Test combinations: Run Facebook + Google together, measure vs. individually. Track not just channel ROI, but channel combinations ROI.`,
    metadata: {
      framework: 'marketing-mix-modeling',
      category: 'tactics' as const,
      topic: ['channel-strategy', 'budget-allocation', 'testing'],
      source: 'Modern ML Practices',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  // SEO Best Practices
  {
    id: 'seo-001',
    content: `Modern SEO prioritizes user intent over keywords. Google's BERT and RankBrain understand context. Optimize for questions users ask: "how to," "best," "vs," "near me." Create comprehensive content that answers the full question, not just includes keywords. Use schema markup to help Google understand content. Core Web Vitals (speed, mobile, UX) now affect rankings significantly.`,
    metadata: {
      framework: 'seo-strategy',
      category: 'tactics' as const,
      topic: ['seo', 'content-marketing', 'technical-seo'],
      source: 'Modern SEO Practices',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'seo-002',
    content: `Local SEO for small businesses: Optimize Google Business Profile (complete info, photos, posts, reviews), build local citations (NAP consistency across directories), create location pages (one per city/neighborhood served), get reviews (respond to all), use local schema markup, create locally-relevant content (neighborhood guides, local events).`,
    metadata: {
      framework: 'seo-strategy',
      category: 'tactics' as const,
      businessSize: 'small',
      industry: 'local-business',
      topic: ['local-seo', 'google-business-profile', 'citations'],
      source: 'Modern SEO Practices',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  // Content Marketing
  {
    id: 'content-001',
    content: `Content marketing ROI takes 6-12 months. The strategy: Create "pillar" content (comprehensive guides), then "cluster" content (specific topics linking to pillar). This builds topical authority with Google. Example: Pillar = "Complete Guide to Email Marketing," Clusters = "Best Subject Lines," "Email Design Tips," "Segmentation Strategies." All clusters link to pillar.`,
    metadata: {
      framework: 'content-strategy',
      category: 'tactics' as const,
      topic: ['content-marketing', 'seo', 'content-strategy'],
      source: 'Modern Content Marketing',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'content-002',
    content: `Content repurposing multiplies ROI: 1 blog post → 5 social posts, 1 video, 1 podcast episode, 10 email tips, 1 infographic, 1 SlideShare. Create once, distribute everywhere. Tailor format to platform: LinkedIn = professional insights, Instagram = visual quotes, Twitter = quick tips, YouTube = full tutorial, Email = in-depth guide.`,
    metadata: {
      framework: 'content-strategy',
      category: 'tactics' as const,
      businessSize: 'small',
      topic: ['content-marketing', 'efficiency', 'multi-channel'],
      source: 'Modern Content Marketing',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  // Social Media
  {
    id: 'social-001',
    content: `Platform-native content performs 10x better than cross-posted content. Instagram = vertical video (Reels), perfect squares, aesthetic feed. TikTok = raw, authentic, trending sounds. LinkedIn = professional insights, text-heavy posts. Facebook = community engagement, groups. Twitter = real-time conversation, threads. Pinterest = beautiful images, how-to guides.`,
    metadata: {
      framework: 'social-media-strategy',
      category: 'tactics' as const,
      topic: ['social-media', 'platform-specific', 'content-formats'],
      source: 'Modern Social Media',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'social-002',
    content: `Algorithm optimization for reach: Post when your audience is online (check analytics), use platform features (Reels, Stories, Live), encourage engagement (ask questions, polls), respond to comments quickly (first hour critical), use hashtags strategically (mix of popular and niche), collaborate (tags, mentions, partnerships). Consistency beats perfection.`,
    metadata: {
      framework: 'social-media-strategy',
      category: 'tactics' as const,
      topic: ['social-media', 'algorithms', 'engagement', 'growth'],
      source: 'Modern Social Media',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  // Email Marketing
  {
    id: 'email-001',
    content: `Email sequences that convert: Welcome (5 emails): 1) Thank you + brand story, 2) Value proposition + social proof, 3) How-to/education, 4) Overcome objections, 5) Ask for purchase/engagement. Send over 5-7 days. Nurture (weekly): 80% value (tips, insights, stories), 20% promotion. Re-engagement (3 emails): 1) We miss you, 2) Here's what you've missed, 3) Last chance to stay subscribed.`,
    metadata: {
      framework: 'email-marketing',
      category: 'tactics' as const,
      topic: ['email-marketing', 'automation', 'sequences', 'conversion'],
      source: 'Modern Email Marketing',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },

  {
    id: 'email-002',
    content: `Subject line formulas that get opened: Curiosity ("The secret to X"), Urgency ("24 hours left"), Personalization ("[Name], this is for you"), Numbers ("5 ways to X"), Questions ("Struggling with X?"), Negative ("Stop doing X"), Direct value ("Free guide to X"). A/B test always. Optimal length: 30-50 characters (mobile preview).`,
    metadata: {
      framework: 'email-marketing',
      category: 'tactics' as const,
      topic: ['email-marketing', 'copywriting', 'optimization'],
      source: 'Modern Email Marketing',
      confidence: 0.85,
      lastUpdated: '2025-01-08'
    }
  },

  // Conversion Optimization
  {
    id: 'cro-001',
    content: `Conversion Rate Optimization (CRO) hierarchy: 1) Value proposition (most important) - clear, compelling reason to act, 2) Friction (remove obstacles) - simplify forms, reduce steps, 3) Anxiety (build trust) - testimonials, guarantees, security badges, 4) Urgency (motivate action) - scarcity, deadlines, FOMO. Most businesses focus on #4, should focus on #1.`,
    metadata: {
      framework: 'conversion-optimization',
      category: 'tactics' as const,
      topic: ['cro', 'landing-pages', 'conversion', 'optimization'],
      source: 'CRO Best Practices',
      confidence: 0.9,
      lastUpdated: '2025-01-08'
    }
  },
]

// ============================================================================
// VECTOR EMBEDDING FUNCTIONS
// ============================================================================

export class MarketingKnowledgeBase {
  private pinecone: Pinecone | null = null
  private indexName = 'marketing-knowledge'

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Initialize Pinecone
      if (process.env.PINECONE_API_KEY) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        })
      }
    } catch (error) {
      console.error('Failed to initialize marketing knowledge base:', error)
    }
  }

  /**
   * Seed the knowledge base with marketing frameworks
   */
  async seed() {
    if (!this.pinecone) {
      console.warn('Pinecone not initialized - skipping seed')
      return
    }

    try {
      const index = this.pinecone.Index(this.indexName)

      for (const knowledge of MARKETING_KNOWLEDGE_BASE) {
        // Generate embedding using the existing embedding service
        const embedding = await generateEmbedding(knowledge.content)

        // Prepare metadata - filter out undefined values
        const metadata: Record<string, any> = {
          content: knowledge.content,
          framework: knowledge.metadata.framework,
          category: knowledge.metadata.category,
          topic: knowledge.metadata.topic,
          source: knowledge.metadata.source,
          confidence: knowledge.metadata.confidence,
          lastUpdated: knowledge.metadata.lastUpdated,
        }

        // Add optional fields only if defined
        if (knowledge.metadata.industry) {
          metadata.industry = knowledge.metadata.industry
        }
        if (knowledge.metadata.businessSize) {
          metadata.businessSize = knowledge.metadata.businessSize
        }

        // Upsert to Pinecone
        await index.upsert([
          {
            id: knowledge.id,
            values: embedding,
            metadata,
          },
        ])
      }

      console.log(`✓ Seeded ${MARKETING_KNOWLEDGE_BASE.length} marketing knowledge entries`)
    } catch (error) {
      console.error('Failed to seed marketing knowledge:', error)
    }
  }

  /**
   * Query the knowledge base for relevant marketing strategies
   */
  async query(
    query: string,
    options: {
      topK?: number
      framework?: string
      category?: string
      topic?: string
    } = {}
  ): Promise<MarketingKnowledge[]> {
    if (!this.pinecone) {
      console.warn('Pinecone not initialized - returning empty results')
      return []
    }

    try {
      const { topK = 5, framework, category, topic } = options

      // Generate query embedding using the existing embedding service
      const queryEmbedding = await generateEmbedding(query)

      // Build filter
      const filter: any = {}
      if (framework) filter.framework = framework
      if (category) filter.category = category
      if (topic) filter.topic = { $in: [topic] }

      // Query Pinecone
      const index = this.pinecone.Index(this.indexName)
      const results = await index.query({
        vector: queryEmbedding,
        topK,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        includeMetadata: true,
      })

      // Format results
      return results.matches.map((match) => ({
        id: match.id,
        content: match.metadata?.content as string || '',
        metadata: {
          framework: match.metadata?.framework as string || '',
          category: match.metadata?.category as any,
          industry: match.metadata?.industry as string,
          businessSize: match.metadata?.businessSize as any,
          topic: match.metadata?.topic as string[],
          source: match.metadata?.source as string || '',
          confidence: (match.score || 0) as number,
          lastUpdated: match.metadata?.lastUpdated as string || '',
        },
      }))
    } catch (error) {
      console.error('Failed to query marketing knowledge:', error)
      return []
    }
  }

  /**
   * Get marketing recommendations based on business context
   */
  async getRecommendations(context: {
    businessDescription: string
    industry?: string
    size?: 'startup' | 'small' | 'medium' | 'enterprise'
    goals?: string[]
    challenges?: string[]
  }): Promise<{
    strategies: MarketingKnowledge[]
    tactics: MarketingKnowledge[]
    insights: string[]
  }> {
    // Build query from context
    const queryParts = [context.businessDescription]
    if (context.goals) queryParts.push(...context.goals)
    if (context.challenges) queryParts.push(...context.challenges)
    const query = queryParts.join(' ')

    // Get strategy recommendations
    const strategies = await this.query(query, {
      category: 'strategy',
      topK: 5,
    })

    // Get tactical recommendations
    const tactics = await this.query(query, {
      category: 'tactics',
      topK: 10,
    })

    // Generate insights
    const insights = [
      `Based on your business context, ${strategies.length} strategic frameworks and ${tactics.length} tactical approaches are highly relevant.`,
      ...strategies.slice(0, 3).map((s) => `✓ ${s.metadata.framework}: ${s.content.substring(0, 150)}...`),
    ]

    return { strategies, tactics, insights }
  }
}

// Singleton instance
let knowledgeBaseInstance: MarketingKnowledgeBase | null = null

export function getMarketingKnowledgeBase(): MarketingKnowledgeBase {
  if (!knowledgeBaseInstance) {
    knowledgeBaseInstance = new MarketingKnowledgeBase()
  }
  return knowledgeBaseInstance
}
